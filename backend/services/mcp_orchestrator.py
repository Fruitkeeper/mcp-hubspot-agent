import asyncio
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from mcps.base import BaseMCP
from mcps.hubspot import HubSpotMCP

# Load environment variables
load_dotenv()

class MCPOrchestrator:
    """
    MCP Orchestrator manages multiple MCP agents and provides unified data access
    """
    
    def __init__(self):
        self.mcps: Dict[str, BaseMCP] = {}
        self.last_health_check = None
    
    def register_mcp(self, name: str, mcp: BaseMCP):
        """
        Register an MCP agent
        
        Args:
            name: Name of the MCP (e.g., 'hubspot', 'salesforce')
            mcp: MCP instance
        """
        self.mcps[name] = mcp
    
    def get_mcp(self, name: str) -> Optional[BaseMCP]:
        """
        Get an MCP by name
        
        Args:
            name: Name of the MCP
            
        Returns:
            MCP instance or None if not found
        """
        return self.mcps.get(name)
    
    async def get_all_leads(self, 
                           limit: Optional[int] = None,
                           since_date: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Get leads from all connected MCPs
        
        Args:
            limit: Maximum number of leads per MCP
            since_date: Only return leads since this date
            
        Returns:
            Dictionary with leads grouped by MCP platform
        """
        results = {}
        
        for name, mcp in self.mcps.items():
            try:
                leads = await mcp.get_leads(limit=limit, since_date=since_date)
                results[name] = {
                    'leads': leads,
                    'count': len(leads),
                    'platform': mcp.get_platform_name()
                }
            except Exception as e:
                results[name] = {
                    'error': str(e),
                    'count': 0,
                    'platform': mcp.get_platform_name()
                }
        
        return results
    
    async def get_all_calls(self,
                           limit: Optional[int] = None,
                           since_date: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Get calls from all connected MCPs
        
        Args:
            limit: Maximum number of calls per MCP
            since_date: Only return calls since this date
            
        Returns:
            Dictionary with calls grouped by MCP platform
        """
        results = {}
        
        for name, mcp in self.mcps.items():
            try:
                calls = await mcp.get_calls(limit=limit, since_date=since_date)
                results[name] = {
                    'calls': calls,
                    'count': len(calls),
                    'platform': mcp.get_platform_name()
                }
            except Exception as e:
                results[name] = {
                    'error': str(e),
                    'count': 0,
                    'platform': mcp.get_platform_name()
                }
        
        return results
    
    async def get_all_budget_info(self, 
                                 lead_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get budget information from all connected MCPs
        
        Args:
            lead_ids: Optional list of lead IDs to filter by
            
        Returns:
            Dictionary with budget info grouped by MCP platform
        """
        results = {}
        
        for name, mcp in self.mcps.items():
            try:
                budget_info = await mcp.get_budget_info(lead_ids=lead_ids)
                results[name] = {
                    'budget_info': budget_info,
                    'platform': mcp.get_platform_name()
                }
            except Exception as e:
                results[name] = {
                    'error': str(e),
                    'platform': mcp.get_platform_name()
                }
        
        return results
    
    async def sync_all_data(self, db: Session) -> Dict[str, Any]:
        """
        Sync data from all MCPs to database
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with sync results for each MCP
        """
        results = {}
        
        for name, mcp in self.mcps.items():
            try:
                sync_result = await mcp.sync_to_database(db)
                results[name] = sync_result
            except Exception as e:
                results[name] = {
                    'error': str(e)
                }
        
        return results
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check health of all MCP connections
        
        Returns:
            Dictionary with health status for each MCP
        """
        results = {}
        
        for name, mcp in self.mcps.items():
            try:
                health = await mcp.health_check()
                results[name] = health
            except Exception as e:
                results[name] = {
                    'status': 'unhealthy',
                    'message': f'Health check failed: {str(e)}',
                    'authenticated': False
                }
        
        self.last_health_check = datetime.now()
        return results
    
    async def get_dashboard_summary(self) -> Dict[str, Any]:
        """
        Get a unified dashboard summary from all MCPs
        
        Returns:
            Dictionary with summary data from all platforms
        """
        try:
            # Get data from all MCPs
            leads_data = await self.get_all_leads(limit=100)
            calls_data = await self.get_all_calls(limit=100)
            budget_data = await self.get_all_budget_info()
            
            # Aggregate summary statistics
            summary = {
                'platforms': list(self.mcps.keys()),
                'total_platforms': len(self.mcps),
                'leads_summary': self._aggregate_leads_summary(leads_data),
                'calls_summary': self._aggregate_calls_summary(calls_data),
                'budget_summary': self._aggregate_budget_summary(budget_data),
                'last_updated': datetime.now().isoformat()
            }
            
            return summary
            
        except Exception as e:
            return {
                'error': str(e),
                'last_updated': datetime.now().isoformat()
            }
    
    def _aggregate_leads_summary(self, leads_data: Dict[str, Any]) -> Dict[str, Any]:
        """Aggregate leads summary across all platforms"""
        total_leads = 0
        new_this_week = 0
        platforms_data = {}
        
        for platform, data in leads_data.items():
            if 'error' not in data:
                leads = data.get('leads', [])
                total_leads += len(leads)
                
                # Count new leads this week
                week_ago = datetime.now()
                week_ago = week_ago.replace(day=week_ago.day-7)
                
                platform_new = sum(1 for lead in leads 
                                 if lead.get('created_at') and 
                                 isinstance(lead.get('created_at'), datetime) and
                                 lead['created_at'] > week_ago)
                new_this_week += platform_new
                
                platforms_data[platform] = {
                    'total': len(leads),
                    'new_this_week': platform_new
                }
        
        return {
            'total': total_leads,
            'new_this_week': new_this_week,
            'by_platform': platforms_data
        }
    
    def _aggregate_calls_summary(self, calls_data: Dict[str, Any]) -> Dict[str, Any]:
        """Aggregate calls summary across all platforms"""
        total_calls = 0
        total_duration = 0
        platforms_data = {}
        
        for platform, data in calls_data.items():
            if 'error' not in data:
                calls = data.get('calls', [])
                total_calls += len(calls)
                
                platform_duration = sum(call.get('duration', 0) for call in calls)
                total_duration += platform_duration
                
                platforms_data[platform] = {
                    'total': len(calls),
                    'total_duration': platform_duration,
                    'avg_duration': platform_duration / len(calls) if calls else 0
                }
        
        return {
            'total': total_calls,
            'total_duration': total_duration,
            'avg_duration': total_duration / total_calls if total_calls else 0,
            'by_platform': platforms_data
        }
    
    def _aggregate_budget_summary(self, budget_data: Dict[str, Any]) -> Dict[str, Any]:
        """Aggregate budget summary across all platforms"""
        total_pipeline = 0
        total_closed_won = 0
        total_closed_lost = 0
        platforms_data = {}
        
        for platform, data in budget_data.items():
            if 'error' not in data:
                budget_info = data.get('budget_info', {})
                
                pipeline = budget_info.get('total_pipeline_value', 0)
                closed_won = budget_info.get('total_closed_won', 0)
                closed_lost = budget_info.get('total_closed_lost', 0)
                
                total_pipeline += pipeline
                total_closed_won += closed_won
                total_closed_lost += closed_lost
                
                platforms_data[platform] = {
                    'pipeline_value': pipeline,
                    'closed_won': closed_won,
                    'closed_lost': closed_lost,
                    'average_deal_size': budget_info.get('average_deal_size', 0)
                }
        
        return {
            'total_pipeline_value': total_pipeline,
            'total_closed_won': total_closed_won,
            'total_closed_lost': total_closed_lost,
            'total_value': total_pipeline + total_closed_won + total_closed_lost,
            'by_platform': platforms_data
        }

# Global orchestrator instance
orchestrator = MCPOrchestrator()

def initialize_mcps():
    """
    Initialize and register MCP agents
    This should be called when the application starts
    """
    # HubSpot configuration from environment variables
    hubspot_config = {
        'access_token': os.getenv('HUBSPOT_ACCESS_TOKEN'),
        'refresh_token': os.getenv('HUBSPOT_REFRESH_TOKEN'),  # Optional for OAuth apps
        'client_id': os.getenv('HUBSPOT_CLIENT_ID'),         # Optional for OAuth apps  
        'client_secret': os.getenv('HUBSPOT_CLIENT_SECRET')  # Optional for OAuth apps
    }
    
    # Only register HubSpot MCP if access token is provided
    if hubspot_config['access_token']:
        hubspot_mcp = HubSpotMCP(hubspot_config)
        orchestrator.register_mcp('hubspot', hubspot_mcp)
        print("✅ HubSpot MCP registered successfully")
    else:
        print("⚠️  HubSpot access token not found. Please set HUBSPOT_ACCESS_TOKEN environment variable.")
    
    # Future MCPs can be registered here
    # salesforce_mcp = SalesforceMCP(salesforce_config)
    # orchestrator.register_mcp('salesforce', salesforce_mcp)

def get_orchestrator() -> MCPOrchestrator:
    """Get the global orchestrator instance"""
    return orchestrator 