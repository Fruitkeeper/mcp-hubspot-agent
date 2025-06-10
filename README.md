# GTM Compass AI - MCP HubSpot Agent

A modern GTM (Go-to-Market) CRM aggregator with an intelligent MCP (Model Context Protocol) HubSpot chatbot agent.

## 🚀 Features

### MCP Architecture
- **BaseMCP**: Abstract class defining the standard interface for all CRM integrations
- **HubSpotMCP**: Full implementation for HubSpot CRM with OAuth2 authentication
- **MCPOrchestrator**: Manages multiple MCP agents and provides unified data access
- **Extensible**: Easy to add new CRM platforms (Salesforce, Pipedrive, etc.)

### AI-Powered Chatbot
- **Intelligent Chat Interface**: Natural language queries about your CRM data
- **Real-time Data**: Direct integration with HubSpot API via MCP
- **Context-Aware Responses**: Understands lead analysis, call performance, budget tracking
- **Health Monitoring**: Real-time connection status and sync monitoring

### Data Analysis
- **Lead Analytics**: Track leads, conversion rates, and status breakdowns
- **Call Performance**: Monitor call duration, outcomes, and efficiency
- **Budget Insights**: Pipeline value, deal stages, and revenue tracking
- **Unified Dashboard**: Aggregate data from multiple CRM platforms

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── MCPHubSpotAgent.tsx (Chatbot UI)
├── Dashboard.tsx (Analytics)
└── Pages & Components

Backend (FastAPI + Python)
├── mcps/
│   ├── base.py (BaseMCP abstract class)
│   ├── hubspot.py (HubSpot implementation)
│   └── __init__.py
├── services/
│   └── mcp_orchestrator.py (MCP management)
├── routers/
│   └── mcp.py (API endpoints)
└── main.py (FastAPI app)
```

## 📋 Prerequisites

### Backend Requirements
- Python 3.8+
- FastAPI
- SQLAlchemy
- aiohttp
- python-multipart

### Frontend Requirements
- Node.js 16+
- React 18+
- TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- shadcn/ui components

### HubSpot Setup
- HubSpot Developer Account
- OAuth2 App configured
- API Access Tokens

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd gtm-compass-ai
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy aiohttp python-multipart

# Set up environment variables
cp .env.example .env
# Edit .env with your HubSpot credentials:
# HUBSPOT_CLIENT_ID=your_client_id
# HUBSPOT_CLIENT_SECRET=your_client_secret
# HUBSPOT_ACCESS_TOKEN=your_access_token
# HUBSPOT_REFRESH_TOKEN=your_refresh_token
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

### 4. HubSpot OAuth Configuration

1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Create a new app or use existing one
3. Configure OAuth2 settings:
   - **Scopes**: `crm.objects.contacts.read`, `crm.objects.deals.read`, `crm.objects.calls.read`
   - **Redirect URI**: `http://localhost:3000/oauth/callback` (for development)
4. Get your credentials and update the backend configuration

## 🚀 Running the Application

### Development Mode

1. **Start Backend**:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Access Applications**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - MCP Chat: http://localhost:5173/mcp-chat

## 💬 Using the MCP HubSpot Chatbot

### Quick Start Commands
- **"Show me recent leads"** - Get latest lead data
- **"Call performance summary"** - Analyze call metrics
- **"Budget and pipeline review"** - View deal pipeline
- **"Sync HubSpot data"** - Refresh data from HubSpot
- **"Dashboard overview"** - Get unified summary

### Advanced Queries
- "How many leads did we get this week?"
- "What's our average call duration?"
- "Show me deals in the pipeline"
- "Which leads need follow-up?"
- "What's our conversion rate?"

### Features
- **Real-time Health Monitoring**: Connection status badges
- **Contextual Responses**: Smart analysis based on your query
- **Quick Actions**: Pre-built commands for common tasks
- **Error Handling**: Graceful fallbacks for connection issues

## 🔧 API Endpoints

### MCP Health & Status
- `GET /api/mcp/health` - Health check for all MCPs
- `GET /api/mcp/platforms` - List connected platforms

### Data Retrieval
- `GET /api/mcp/leads?limit=100&since_days=7` - Get leads
- `GET /api/mcp/calls?limit=100&since_days=7` - Get calls
- `GET /api/mcp/budget` - Get budget information
- `GET /api/mcp/dashboard` - Unified dashboard summary

### Platform-Specific
- `GET /api/mcp/platform/hubspot/leads` - HubSpot leads only
- `GET /api/mcp/platform/hubspot/calls` - HubSpot calls only
- `GET /api/mcp/platform/hubspot/budget` - HubSpot budget only

### Data Synchronization
- `POST /api/mcp/sync` - Sync all platforms
- `POST /api/mcp/platform/hubspot/sync` - Sync HubSpot only

## 🔌 Adding New CRM Integrations

### 1. Create New MCP Class
```python
# backend/mcps/salesforce.py
from .base import BaseMCP

class SalesforceMCP(BaseMCP):
    def __init__(self, connection_config):
        super().__init__(connection_config)
        # Salesforce-specific setup
    
    async def authenticate(self):
        # Implement Salesforce OAuth
        pass
    
    async def get_leads(self, limit=None, since_date=None):
        # Implement Salesforce lead fetching
        pass
    
    # Implement other required methods...
```

### 2. Register in Orchestrator
```python
# backend/services/mcp_orchestrator.py
from mcps.salesforce import SalesforceMCP

def initialize_mcps():
    # Existing HubSpot registration...
    
    # Add Salesforce
    salesforce_config = {...}
    salesforce_mcp = SalesforceMCP(salesforce_config)
    orchestrator.register_mcp('salesforce', salesforce_mcp)
```

### 3. Frontend Integration
The chatbot automatically works with new MCPs once they're registered in the orchestrator!

## 📊 Data Models

### Lead Format
```typescript
{
  external_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  source: string;
  created_at: Date;
  updated_at: Date;
  raw_data: any;
}
```

### Call Format
```typescript
{
  external_id: string;
  lead_external_id?: string;
  direction: 'inbound' | 'outbound';
  duration: number; // seconds
  outcome: string;
  notes?: string;
  recording_url?: string;
  created_at: Date;
  raw_data: any;
}
```

### Budget Format
```typescript
{
  total_pipeline_value: number;
  total_closed_won: number;
  total_closed_lost: number;
  average_deal_size: number;
  deals_by_stage: Record<string, {
    count: number;
    total_value: number;
  }>;
}
```

## 🛡️ Security Considerations

- **API Keys**: Store in environment variables, never commit to code
- **OAuth Tokens**: Implement secure token refresh mechanisms
- **Rate Limiting**: Respect CRM API limits
- **Data Encryption**: Use HTTPS for all communications
- **Access Control**: Implement proper user authentication

## 🔍 Troubleshooting

### Common Issues

1. **MCP Connection Failed**
   - Check HubSpot API credentials
   - Verify OAuth scopes are correct
   - Ensure token hasn't expired

2. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript configuration
   - Verify all dependencies are installed

3. **Backend Import Errors**
   - Activate virtual environment
   - Install missing dependencies
   - Check Python path configuration

### Debug Mode
```bash
# Backend with debug logging
PYTHONPATH=. uvicorn main:app --reload --log-level debug

# Frontend with verbose output
npm run dev -- --verbose
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **HubSpot API** for providing comprehensive CRM data access
- **FastAPI** for the excellent async web framework
- **React Query** for efficient data fetching and caching
- **shadcn/ui** for beautiful UI components
- **Model Context Protocol** inspiration for the MCP architecture

---

**Built with ❤️ for better GTM analytics and CRM management** 