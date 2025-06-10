from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pydantic import BaseModel

from services.mcp_orchestrator import get_orchestrator
# from database import get_db  # Uncomment when database is set up

router = APIRouter(prefix="/mcp", tags=["MCP"])

class ChatMessage(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []

@router.get("/health")
async def get_mcp_health():
    """
    Get health status of all MCP connections
    """
    try:
        orchestrator = get_orchestrator()
        health_status = await orchestrator.health_check()
        return health_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.get("/leads")
async def get_leads(
    limit: Optional[int] = 100,
    since_days: Optional[int] = None
):
    """
    Get leads from all connected MCP platforms
    
    Args:
        limit: Maximum number of leads per platform
        since_days: Number of days back to fetch leads (e.g., 7 for last week)
    """
    try:
        orchestrator = get_orchestrator()
        
        since_date = None
        if since_days:
            since_date = datetime.now() - timedelta(days=since_days)
        
        leads_data = await orchestrator.get_all_leads(
            limit=limit,
            since_date=since_date
        )
        
        return {
            "leads": leads_data,
            "total_platforms": len(leads_data),
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leads: {str(e)}")

@router.get("/calls")
async def get_calls(
    limit: Optional[int] = 100,
    since_days: Optional[int] = None
):
    """
    Get calls from all connected MCP platforms
    
    Args:
        limit: Maximum number of calls per platform  
        since_days: Number of days back to fetch calls
    """
    try:
        orchestrator = get_orchestrator()
        
        since_date = None
        if since_days:
            since_date = datetime.now() - timedelta(days=since_days)
        
        calls_data = await orchestrator.get_all_calls(
            limit=limit,
            since_date=since_date
        )
        
        return {
            "calls": calls_data,
            "total_platforms": len(calls_data),
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch calls: {str(e)}")

@router.get("/budget")
async def get_budget_info():
    """
    Get budget and deal information from all connected MCP platforms
    """
    try:
        orchestrator = get_orchestrator()
        budget_data = await orchestrator.get_all_budget_info()
        
        return {
            "budget_info": budget_data,
            "total_platforms": len(budget_data),
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch budget info: {str(e)}")

@router.post("/sync")
async def sync_mcp_data():
    """
    Sync data from all MCP platforms to database
    """
    try:
        orchestrator = get_orchestrator()
        
        # For now, pass None for db session since database setup is pending
        # In production, this would use: db: Session = Depends(get_db)
        sync_results = await orchestrator.sync_all_data(db=None)
        
        return {
            "results": sync_results,
            "synced_at": datetime.now().isoformat(),
            "status": "completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@router.get("/dashboard")
async def get_dashboard_summary():
    """
    Get unified dashboard summary from all MCP platforms
    """
    try:
        orchestrator = get_orchestrator()
        dashboard_data = await orchestrator.get_dashboard_summary()
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard summary: {str(e)}")

@router.get("/platforms")
async def get_connected_platforms():
    """
    Get list of connected MCP platforms
    """
    try:
        orchestrator = get_orchestrator()
        platforms = []
        
        for name, mcp in orchestrator.mcps.items():
            platforms.append({
                "name": name,
                "platform": mcp.get_platform_name(),
                "authenticated": mcp.is_authenticated,
                "last_sync": mcp.last_sync.isoformat() if mcp.last_sync else None
            })
        
        return {
            "platforms": platforms,
            "total": len(platforms)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch platforms: {str(e)}")

@router.get("/platform/{platform_name}/leads")
async def get_platform_leads(
    platform_name: str,
    limit: Optional[int] = 100,
    since_days: Optional[int] = None
):
    """
    Get leads from a specific MCP platform
    
    Args:
        platform_name: Name of the MCP platform (e.g., 'hubspot')
        limit: Maximum number of leads
        since_days: Number of days back to fetch leads
    """
    try:
        orchestrator = get_orchestrator()
        mcp = orchestrator.get_mcp(platform_name)
        
        if not mcp:
            raise HTTPException(status_code=404, detail=f"Platform '{platform_name}' not found")
        
        since_date = None
        if since_days:
            since_date = datetime.now() - timedelta(days=since_days)
        
        leads = await mcp.get_leads(limit=limit, since_date=since_date)
        
        return {
            "platform": platform_name,
            "leads": leads,
            "count": len(leads),
            "retrieved_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leads from {platform_name}: {str(e)}")

@router.get("/platform/{platform_name}/calls")
async def get_platform_calls(
    platform_name: str,
    limit: Optional[int] = 100,
    since_days: Optional[int] = None
):
    """
    Get calls from a specific MCP platform
    
    Args:
        platform_name: Name of the MCP platform
        limit: Maximum number of calls
        since_days: Number of days back to fetch calls
    """
    try:
        orchestrator = get_orchestrator()
        mcp = orchestrator.get_mcp(platform_name)
        
        if not mcp:
            raise HTTPException(status_code=404, detail=f"Platform '{platform_name}' not found")
        
        since_date = None
        if since_days:
            since_date = datetime.now() - timedelta(days=since_days)
        
        calls = await mcp.get_calls(limit=limit, since_date=since_date)
        
        return {
            "platform": platform_name,
            "calls": calls,
            "count": len(calls),
            "retrieved_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch calls from {platform_name}: {str(e)}")

@router.get("/platform/{platform_name}/budget")
async def get_platform_budget(platform_name: str):
    """
    Get budget information from a specific MCP platform
    
    Args:
        platform_name: Name of the MCP platform
    """
    try:
        orchestrator = get_orchestrator()
        mcp = orchestrator.get_mcp(platform_name)
        
        if not mcp:
            raise HTTPException(status_code=404, detail=f"Platform '{platform_name}' not found")
        
        budget_info = await mcp.get_budget_info()
        
        return {
            "platform": platform_name,
            "budget_info": budget_info,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch budget from {platform_name}: {str(e)}")

@router.post("/platform/{platform_name}/sync")
async def sync_platform_data(platform_name: str):
    """
    Sync data from a specific MCP platform
    
    Args:
        platform_name: Name of the MCP platform to sync
    """
    try:
        orchestrator = get_orchestrator()
        mcp = orchestrator.get_mcp(platform_name)
        
        if not mcp:
            raise HTTPException(status_code=404, detail=f"Platform '{platform_name}' not found")
        
        # For now, pass None for db session
        sync_result = await mcp.sync_to_database(db=None)
        
        return {
            "platform": platform_name,
            "result": sync_result,
            "synced_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync {platform_name}: {str(e)}")

@router.post("/chat")
async def chat_with_mcp_agent(chat_request: ChatMessage):
    """
    Chat with the MCP HubSpot Agent using natural language
    
    Args:
        chat_request: Contains the user message and conversation history
    """
    try:
        orchestrator = get_orchestrator()
        
        # Get fresh data for context
        leads_data = await orchestrator.get_all_leads(limit=50)
        calls_data = await orchestrator.get_all_calls(limit=50)  
        budget_data = await orchestrator.get_all_budget_info()
        health_data = await orchestrator.health_check()
        
        # Create context for the AI
        context = _build_context_for_ai(leads_data, calls_data, budget_data, health_data)
        
        # Generate AI response (for now, using enhanced logic - can be replaced with OpenAI/Claude later)
        ai_response = await _generate_ai_response(
            chat_request.message, 
            context, 
            chat_request.conversation_history
        )
        
        return {
            "response": ai_response,
            "timestamp": datetime.now().isoformat(),
            "context_used": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

def _build_context_for_ai(leads_data: Dict, calls_data: Dict, budget_data: Dict, health_data: Dict) -> Dict:
    """Build comprehensive context from MCP data for AI responses"""
    
    context = {
        "timestamp": datetime.now().isoformat(),
        "platforms_status": health_data,
        "leads_summary": {},
        "calls_summary": {},
        "budget_summary": {},
        "recent_activity": []
    }
    
    # Process leads data
    for platform, data in leads_data.items():
        if 'error' not in data:
            leads = data.get('leads', [])
            context["leads_summary"][platform] = {
                "total_count": len(leads),
                "recent_leads": [
                    {
                        "name": lead.get('name', 'Unknown'),
                        "email": lead.get('email', ''),
                        "status": lead.get('status', 'Unknown'),
                        "created_at": lead.get('created_at', ''),
                        "company": lead.get('company', '')
                    }
                    for lead in leads[:5]  # Last 5 leads for context
                ],
                "status_breakdown": _get_status_breakdown(leads, 'status')
            }
    
    # Process calls data  
    for platform, data in calls_data.items():
        if 'error' not in data:
            calls = data.get('calls', [])
            context["calls_summary"][platform] = {
                "total_count": len(calls),
                "total_duration": sum(call.get('duration', 0) for call in calls),
                "avg_duration": sum(call.get('duration', 0) for call in calls) / len(calls) if calls else 0,
                "recent_calls": calls[:3],  # Last 3 calls for context
                "outcome_breakdown": _get_status_breakdown(calls, 'outcome')
            }
    
    # Process budget data
    for platform, data in budget_data.items():
        if 'error' not in data:
            budget_info = data.get('budget_info', {})
            context["budget_summary"][platform] = budget_info
    
    return context

def _get_status_breakdown(items: List[Dict], field: str) -> Dict:
    """Get breakdown by status/outcome field"""
    breakdown = {}
    for item in items:
        status = item.get(field, 'Unknown')
        breakdown[status] = breakdown.get(status, 0) + 1
    return breakdown

async def _generate_ai_response(user_message: str, context: Dict, history: List[Dict]) -> str:
    """
    Generate intelligent responses based on user message and MCP context
    This is an enhanced version that can be replaced with OpenAI/Claude integration
    """
    
    user_message_lower = user_message.lower()
    
    # Check platform health first
    platforms_healthy = all(
        status.get('status') == 'healthy' 
        for status in context['platforms_status'].values()
    )
    
    if not platforms_healthy:
        return "⚠️ I notice there are some connectivity issues with the MCP platforms. Let me help you with what data I can access, but some information might be limited."
    
    # Conversational AI logic with context awareness
    
    # Greeting and general questions
    if any(word in user_message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
        total_leads = sum(summary.get('total_count', 0) for summary in context['leads_summary'].values())
        total_calls = sum(summary.get('total_count', 0) for summary in context['calls_summary'].values())
        
        return f"""👋 Hello! I'm your HubSpot MCP Agent. I've just analyzed your current data:

📊 **Quick Overview:**
• **{total_leads}** total leads in your CRM
• **{total_calls}** recent calls logged
• **{len(context['platforms_status'])}** platform(s) connected

I can help you analyze leads, review call performance, examine your sales pipeline, or answer any specific questions about your HubSpot data. What would you like to explore?"""

    # Lead-related queries
    elif any(word in user_message_lower for word in ['lead', 'contact', 'prospect', 'customer']):
        response = "📊 **Lead Analysis:**\n\n"
        
        for platform, summary in context['leads_summary'].items():
            total = summary['total_count']
            recent = summary['recent_leads']
            status_breakdown = summary['status_breakdown']
            
            response += f"**{platform.title()} Platform:**\n"
            response += f"• Total leads: {total}\n"
            
            if status_breakdown:
                response += "• Status breakdown:\n"
                for status, count in status_breakdown.items():
                    response += f"  - {status}: {count}\n"
            
            if recent:
                response += f"\n🆕 **Recent leads:**\n"
                for i, lead in enumerate(recent[:3], 1):
                    company_info = f" ({lead['company']})" if lead['company'] else ""
                    response += f"{i}. {lead['name']}{company_info} - {lead['status']}\n"
        
        if 'convert' in user_message_lower or 'conversion' in user_message_lower:
            response += "\n💡 **Conversion Insights:** Based on your current lead statuses, I recommend focusing on leads in the 'qualified' stage for immediate follow-up."
            
        return response
    
    # Call-related queries
    elif any(word in user_message_lower for word in ['call', 'phone', 'conversation', 'talk']):
        response = "📞 **Call Performance Analysis:**\n\n"
        
        for platform, summary in context['calls_summary'].items():
            total = summary['total_count']
            avg_duration = summary['avg_duration']
            total_duration = summary['total_duration']
            outcome_breakdown = summary['outcome_breakdown']
            
            response += f"**{platform.title()} Platform:**\n"
            response += f"• Total calls: {total}\n"
            response += f"• Average duration: {avg_duration/60:.1f} minutes\n"
            response += f"• Total talk time: {total_duration/3600:.1f} hours\n"
            
            if outcome_breakdown:
                response += "• Call outcomes:\n"
                for outcome, count in outcome_breakdown.items():
                    response += f"  - {outcome}: {count}\n"
        
        response += "\n💡 **Performance Tip:** "
        if avg_duration < 300:  # Less than 5 minutes
            response += "Your average call duration is quite short. Consider preparing more engaging talking points to extend conversations."
        else:
            response += "Good call duration! Your team is having meaningful conversations with prospects."
            
        return response
    
    # Budget/deal/revenue queries  
    elif any(word in user_message_lower for word in ['budget', 'deal', 'revenue', 'pipeline', 'money', 'sales']):
        response = "💰 **Sales Pipeline & Revenue Analysis:**\n\n"
        
        total_pipeline = 0
        total_closed_won = 0
        
        for platform, summary in context['budget_summary'].items():
            pipeline_value = summary.get('total_pipeline_value', 0)
            closed_won = summary.get('total_closed_won', 0)
            closed_lost = summary.get('total_closed_lost', 0)
            avg_deal = summary.get('average_deal_size', 0)
            
            total_pipeline += pipeline_value
            total_closed_won += closed_won
            
            response += f"**{platform.title()} Platform:**\n"
            response += f"• Pipeline value: ${pipeline_value:,.0f}\n"
            response += f"• Closed won: ${closed_won:,.0f}\n"
            response += f"• Closed lost: ${closed_lost:,.0f}\n"
            response += f"• Average deal size: ${avg_deal:,.0f}\n\n"
        
        # Calculate win rate if we have data
        total_closed = total_closed_won + sum(s.get('total_closed_lost', 0) for s in context['budget_summary'].values())
        if total_closed > 0:
            win_rate = (total_closed_won / total_closed) * 100
            response += f"📈 **Overall Win Rate:** {win_rate:.1f}%\n"
        
        response += f"🎯 **Total Active Pipeline:** ${total_pipeline:,.0f}"
        
        return response
    
    # Sync/update queries
    elif any(word in user_message_lower for word in ['sync', 'update', 'refresh', 'latest']):
        return f"""🔄 **Data Synchronization:**

✅ Your data was last updated: {context['timestamp']}

I can trigger a fresh sync with your HubSpot account to get the latest information. All platforms are currently connected and ready for updates.

Would you like me to refresh your data now, or is there something specific you'd like me to analyze with the current data?"""

    # Help/capability queries
    elif any(word in user_message_lower for word in ['help', 'what can you do', 'capabilities', 'features']):
        return """🤖 **I'm your HubSpot MCP Agent!** Here's what I can help you with:

🔍 **Data Analysis:**
• Lead and contact insights
• Call performance tracking  
• Sales pipeline analysis
• Revenue and deal forecasting

💬 **Natural Conversations:**
• Ask me anything about your HubSpot data
• Get personalized recommendations
• Analyze trends and patterns
• Compare performance metrics

⚡ **Real-time Data:**
• Always pulling fresh data from your HubSpot
• Multi-platform integration ready
• Automated sync capabilities

Try asking me things like:
• "How are my leads performing this month?"
• "What's my sales pipeline looking like?"
• "Show me my best performing calls"
• "Give me a revenue forecast"

What would you like to explore first?"""

    # Default intelligent response
    else:
        # Try to provide helpful response based on context
        total_leads = sum(summary.get('total_count', 0) for summary in context['leads_summary'].values())
        
        return f"""I understand you're asking: "{user_message}"

Based on your current HubSpot data, I have access to {total_leads} leads, recent call logs, and your sales pipeline information. 

Could you be more specific about what you'd like to know? For example:
• Lead performance and conversion rates
• Call outcomes and follow-up recommendations  
• Sales pipeline and revenue forecasts
• Specific customer or deal information

I'm here to help you get insights from your CRM data - just let me know what you're most interested in!""" 