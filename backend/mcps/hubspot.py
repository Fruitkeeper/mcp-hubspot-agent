import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .base import BaseMCP

class HubSpotMCP(BaseMCP):
    """
    HubSpot MCP implementation
    
    Handles HubSpot CRM integration including:
    - OAuth2 authentication
    - Contact/Lead management
    - Call tracking
    - Deal/Budget information
    """
    
    def __init__(self, connection_config: Dict[str, Any]):
        super().__init__(connection_config)
        self.base_url = "https://api.hubapi.com"
        self.access_token = connection_config.get('access_token')
        self.refresh_token = connection_config.get('refresh_token')
        self.client_id = connection_config.get('client_id')
        self.client_secret = connection_config.get('client_secret')
        
    async def authenticate(self) -> bool:
        """
        Authenticate with HubSpot using Private App token or OAuth2
        """
        try:
            if not self.access_token:
                return False
                
            # Test the access token by making a simple API call
            async with aiohttp.ClientSession() as session:
                headers = {
                    'Authorization': f'Bearer {self.access_token}',
                    'Content-Type': 'application/json'
                }
                
                # For private apps, test with a simple API call instead of OAuth validation
                test_url = f'{self.base_url}/crm/v3/objects/contacts'
                params = {'limit': 1}  # Just get 1 contact to test access
                
                async with session.get(test_url, headers=headers, params=params) as response:
                    if response.status == 200:
                        self.is_authenticated = True
                        return True
                    elif response.status == 401 and self.refresh_token:
                        # Try to refresh the token (only for OAuth apps)
                        return await self._refresh_access_token()
                    else:
                        print(f"HubSpot authentication failed: {response.status}")
                        return False
                        
        except Exception as e:
            print(f"HubSpot authentication error: {e}")
            return False
    
    async def _refresh_access_token(self) -> bool:
        """
        Refresh the access token using the refresh token
        """
        try:
            async with aiohttp.ClientSession() as session:
                data = {
                    'grant_type': 'refresh_token',
                    'refresh_token': self.refresh_token,
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                }
                
                async with session.post(
                    f'{self.base_url}/oauth/v1/token',
                    data=data
                ) as response:
                    if response.status == 200:
                        token_data = await response.json()
                        self.access_token = token_data.get('access_token')
                        if token_data.get('refresh_token'):
                            self.refresh_token = token_data.get('refresh_token')
                        
                        # Update connection config
                        self.connection_config['access_token'] = self.access_token
                        self.connection_config['refresh_token'] = self.refresh_token
                        
                        self.is_authenticated = True
                        return True
                    else:
                        return False
                        
        except Exception as e:
            print(f"Token refresh error: {e}")
            return False
    
    async def get_leads(self, 
                       limit: Optional[int] = None,
                       since_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Fetch contacts (leads) from HubSpot
        """
        if not await self.authenticate():
            return []
        
        try:
            leads = []
            after = None
            fetched_count = 0
            batch_limit = min(100, limit if limit else 100)
            
            async with aiohttp.ClientSession() as session:
                while True:
                    # Build URL with parameters
                    url = f'{self.base_url}/crm/v3/objects/contacts'
                    params = {
                        'limit': batch_limit,
                        'properties': 'firstname,lastname,email,phone,company,hs_lead_status,hs_analytics_source,createdate,lastmodifieddate'
                    }
                    
                    if after:
                        params['after'] = after
                    
                    if since_date:
                        # HubSpot uses milliseconds since epoch
                        timestamp_ms = int(since_date.timestamp() * 1000)
                        params['filterGroups'] = [{
                            'filters': [{
                                'propertyName': 'lastmodifieddate',
                                'operator': 'GT',
                                'value': str(timestamp_ms)
                            }]
                        }]
                    
                    headers = {
                        'Authorization': f'Bearer {self.access_token}',
                        'Content-Type': 'application/json'
                    }
                    
                    async with session.get(url, headers=headers, params=params) as response:
                        if response.status != 200:
                            break
                            
                        data = await response.json()
                        contacts = data.get('results', [])
                        
                        # Normalize and add to results
                        for contact in contacts:
                            normalized_lead = self.normalize_lead_data(contact)
                            leads.append(normalized_lead)
                            fetched_count += 1
                            
                            if limit and fetched_count >= limit:
                                return leads
                        
                        # Check for pagination
                        paging = data.get('paging', {})
                        if not paging.get('next'):
                            break
                        after = paging['next']['after']
                        
            return leads
            
        except Exception as e:
            print(f"Error fetching HubSpot leads: {e}")
            return []
    
    async def get_calls(self,
                       limit: Optional[int] = None,
                       since_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Fetch call records from HubSpot
        """
        if not await self.authenticate():
            return []
        
        try:
            calls = []
            after = None
            fetched_count = 0
            batch_limit = min(100, limit if limit else 100)
            
            async with aiohttp.ClientSession() as session:
                while True:
                    url = f'{self.base_url}/crm/v3/objects/calls'
                    params = {
                        'limit': batch_limit,
                        'properties': 'hs_call_duration,hs_call_direction,hs_call_status,hs_call_body,createdate,hs_call_recording_url'
                    }
                    
                    if after:
                        params['after'] = after
                    
                    if since_date:
                        timestamp_ms = int(since_date.timestamp() * 1000)
                        params['filterGroups'] = [{
                            'filters': [{
                                'propertyName': 'createdate',
                                'operator': 'GT',
                                'value': str(timestamp_ms)
                            }]
                        }]
                    
                    headers = {
                        'Authorization': f'Bearer {self.access_token}',
                        'Content-Type': 'application/json'
                    }
                    
                    async with session.get(url, headers=headers, params=params) as response:
                        if response.status != 200:
                            break
                            
                        data = await response.json()
                        call_records = data.get('results', [])
                        
                        for call in call_records:
                            # Get associated contact for this call
                            contact_id = await self._get_call_contact_id(session, call['id'])
                            
                            normalized_call = self.normalize_call_data(call)
                            normalized_call['lead_external_id'] = contact_id
                            calls.append(normalized_call)
                            fetched_count += 1
                            
                            if limit and fetched_count >= limit:
                                return calls
                        
                        paging = data.get('paging', {})
                        if not paging.get('next'):
                            break
                        after = paging['next']['after']
                        
            return calls
            
        except Exception as e:
            print(f"Error fetching HubSpot calls: {e}")
            return []
    
    async def _get_call_contact_id(self, session: aiohttp.ClientSession, call_id: str) -> Optional[str]:
        """
        Get the contact ID associated with a call
        """
        try:
            url = f'{self.base_url}/crm/v3/objects/calls/{call_id}/associations/contact'
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get('results', [])
                    if results:
                        return results[0].get('id')
            return None
            
        except Exception:
            return None
    
    async def get_budget_info(self, 
                             lead_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get budget/deal information from HubSpot
        """
        if not await self.authenticate():
            return {}
        
        try:
            budget_info = {
                'total_pipeline_value': 0,
                'total_closed_won': 0,
                'total_closed_lost': 0,
                'average_deal_size': 0,
                'deals_by_stage': {},
                'monthly_recurring_revenue': 0
            }
            
            async with aiohttp.ClientSession() as session:
                url = f'{self.base_url}/crm/v3/objects/deals'
                params = {
                    'limit': 100,
                    'properties': 'amount,dealstage,closedate,dealname,createdate,hs_deal_stage_probability'
                }
                
                headers = {
                    'Authorization': f'Bearer {self.access_token}',
                    'Content-Type': 'application/json'
                }
                
                after = None
                while True:
                    if after:
                        params['after'] = after
                    
                    async with session.get(url, headers=headers, params=params) as response:
                        if response.status != 200:
                            break
                            
                        data = await response.json()
                        deals = data.get('results', [])
                        
                        for deal in deals:
                            props = deal.get('properties', {})
                            amount = float(props.get('amount', 0) or 0)
                            stage = props.get('dealstage', 'unknown')
                            
                            # Update totals
                            if stage == 'closedwon':
                                budget_info['total_closed_won'] += amount
                            elif stage == 'closedlost':
                                budget_info['total_closed_lost'] += amount
                            else:
                                budget_info['total_pipeline_value'] += amount
                            
                            # Track by stage
                            if stage not in budget_info['deals_by_stage']:
                                budget_info['deals_by_stage'][stage] = {
                                    'count': 0,
                                    'total_value': 0
                                }
                            budget_info['deals_by_stage'][stage]['count'] += 1
                            budget_info['deals_by_stage'][stage]['total_value'] += amount
                        
                        paging = data.get('paging', {})
                        if not paging.get('next'):
                            break
                        after = paging['next']['after']
                
                # Calculate averages
                total_deals = sum(stage['count'] for stage in budget_info['deals_by_stage'].values())
                total_value = budget_info['total_pipeline_value'] + budget_info['total_closed_won'] + budget_info['total_closed_lost']
                
                if total_deals > 0:
                    budget_info['average_deal_size'] = total_value / total_deals
                
                return budget_info
                
        except Exception as e:
            print(f"Error fetching HubSpot budget info: {e}")
            return {}
    
    async def sync_to_database(self, db: Session) -> Dict[str, int]:
        """
        Sync all HubSpot data to database
        """
        try:
            # This would integrate with your database models
            # For now, return mock sync stats
            leads = await self.get_leads()
            calls = await self.get_calls()
            
            self.last_sync = datetime.now()
            
            return {
                'leads': len(leads),
                'calls': len(calls),
                'timestamp': self.last_sync.isoformat()
            }
            
        except Exception as e:
            print(f"Error syncing HubSpot data: {e}")
            return {'error': str(e)}
    
    def normalize_lead_data(self, raw_lead: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize HubSpot contact data to our platform format
        """
        props = raw_lead.get('properties', {})
        
        # Combine first and last name
        first_name = props.get('firstname', '') or ''
        last_name = props.get('lastname', '') or ''
        name = f"{first_name} {last_name}".strip() or props.get('email', 'Unknown')
        
        return {
            'external_id': raw_lead.get('id'),
            'name': name,
            'email': props.get('email'),
            'phone': props.get('phone'),
            'company': props.get('company'),
            'status': props.get('hs_lead_status', 'new'),
            'source': props.get('hs_analytics_source', 'unknown'),
            'created_at': self._parse_hubspot_date(props.get('createdate')),
            'updated_at': self._parse_hubspot_date(props.get('lastmodifieddate')),
            'raw_data': raw_lead
        }
    
    def normalize_call_data(self, raw_call: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize HubSpot call data to our platform format
        """
        props = raw_call.get('properties', {})
        
        return {
            'external_id': raw_call.get('id'),
            'lead_external_id': None,  # Will be set by caller
            'direction': props.get('hs_call_direction', 'outbound'),
            'duration': int(props.get('hs_call_duration', 0) or 0),
            'outcome': props.get('hs_call_status', 'completed'),
            'notes': props.get('hs_call_body', ''),
            'recording_url': props.get('hs_call_recording_url'),
            'created_at': self._parse_hubspot_date(props.get('createdate')),
            'raw_data': raw_call
        }
    
    def _parse_hubspot_date(self, date_str: Any) -> Optional[datetime]:
        """
        Parse HubSpot date format (milliseconds since epoch)
        """
        if not date_str:
            return None
            
        try:
            if isinstance(date_str, str) and date_str.isdigit():
                timestamp_ms = int(date_str)
                return datetime.fromtimestamp(timestamp_ms / 1000)
            elif isinstance(date_str, (int, float)):
                return datetime.fromtimestamp(date_str / 1000)
            else:
                return super()._parse_date(date_str)
        except (ValueError, OSError):
            return None
    
    def get_platform_name(self) -> str:
        return "HubSpot" 