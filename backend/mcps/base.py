from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
from sqlalchemy.orm import Session

class BaseMCP(ABC):
    """
    Base MCP (Model Context Protocol) abstract class
    
    This defines the standard interface that all CRM integrations must implement.
    Each MCP is responsible for:
    1. Authenticating with their respective CRM
    2. Fetching data in the CRM's native format
    3. Normalizing data to our platform's format
    4. Syncing data to our database
    """
    
    def __init__(self, connection_config: Dict[str, Any]):
        """
        Initialize the MCP with connection configuration
        
        Args:
            connection_config: Dictionary containing auth tokens, URLs, etc.
        """
        self.connection_config = connection_config
        self.is_authenticated = False
        self.last_sync = None
        
    @abstractmethod
    async def authenticate(self) -> bool:
        """
        Authenticate with the CRM platform
        
        Returns:
            bool: True if authentication successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def get_leads(self, 
                       limit: Optional[int] = None,
                       since_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Fetch leads from the CRM platform
        
        Args:
            limit: Maximum number of leads to return
            since_date: Only return leads modified since this date
            
        Returns:
            List of lead dictionaries in normalized format
        """
        pass
    
    @abstractmethod
    async def get_calls(self,
                       limit: Optional[int] = None,
                       since_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Fetch call records from the CRM platform
        
        Args:
            limit: Maximum number of calls to return
            since_date: Only return calls since this date
            
        Returns:
            List of call dictionaries in normalized format
        """
        pass
    
    @abstractmethod
    async def get_budget_info(self, 
                             lead_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get budget/deal information from the CRM platform
        
        Args:
            lead_ids: Optional list of lead IDs to filter by
            
        Returns:
            Dictionary containing budget information
        """
        pass
    
    @abstractmethod
    async def sync_to_database(self, db: Session) -> Dict[str, int]:
        """
        Sync all data from CRM to our database
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with sync statistics (e.g., {'leads': 10, 'calls': 5})
        """
        pass
    
    # Utility methods that can be overridden by implementations
    
    def normalize_lead_data(self, raw_lead: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize lead data to our platform's format
        Override this method in specific MCP implementations
        
        Args:
            raw_lead: Raw lead data from CRM
            
        Returns:
            Normalized lead data
        """
        return {
            'external_id': raw_lead.get('id'),
            'name': raw_lead.get('name'),
            'email': raw_lead.get('email'),
            'phone': raw_lead.get('phone'),
            'company': raw_lead.get('company'),
            'status': raw_lead.get('status'),
            'source': raw_lead.get('source'),
            'created_at': self._parse_date(raw_lead.get('created_at')),
            'updated_at': self._parse_date(raw_lead.get('updated_at')),
            'raw_data': raw_lead
        }
    
    def normalize_call_data(self, raw_call: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize call data to our platform's format
        Override this method in specific MCP implementations
        
        Args:
            raw_call: Raw call data from CRM
            
        Returns:
            Normalized call data
        """
        return {
            'external_id': raw_call.get('id'),
            'lead_external_id': raw_call.get('lead_id'),
            'direction': raw_call.get('direction', 'outbound'),
            'duration': raw_call.get('duration'),
            'outcome': raw_call.get('outcome'),
            'notes': raw_call.get('notes'),
            'recording_url': raw_call.get('recording_url'),
            'created_at': self._parse_date(raw_call.get('created_at')),
            'raw_data': raw_call
        }
    
    def _parse_date(self, date_str: Any) -> Optional[datetime]:
        """
        Parse date string to datetime object
        Override this method for CRM-specific date formats
        
        Args:
            date_str: Date string or timestamp
            
        Returns:
            Parsed datetime object or None
        """
        if not date_str:
            return None
            
        if isinstance(date_str, datetime):
            return date_str
            
        if isinstance(date_str, (int, float)):
            return datetime.fromtimestamp(date_str / 1000)  # Assuming milliseconds
            
        # Try common date formats
        formats = [
            '%Y-%m-%dT%H:%M:%S.%fZ',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d'
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(str(date_str), fmt)
            except ValueError:
                continue
                
        return None
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check the health of the MCP connection
        
        Returns:
            Dictionary containing health status
        """
        try:
            if not self.is_authenticated:
                auth_result = await self.authenticate()
                if not auth_result:
                    return {
                        'status': 'unhealthy',
                        'message': 'Authentication failed',
                        'last_sync': self.last_sync
                    }
            
            return {
                'status': 'healthy',
                'message': 'Connection active',
                'last_sync': self.last_sync,
                'authenticated': self.is_authenticated
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': f'Health check failed: {str(e)}',
                'last_sync': self.last_sync
            }
    
    def get_platform_name(self) -> str:
        """
        Get the name of the CRM platform
        Override this in implementations
        
        Returns:
            Platform name (e.g., 'HubSpot', 'Salesforce')
        """
        return self.__class__.__name__.replace('MCP', '') 