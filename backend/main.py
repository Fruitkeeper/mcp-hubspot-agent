from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.mcp import router as mcp_router
from services.mcp_orchestrator import initialize_mcps

# Create FastAPI app
app = FastAPI(
    title="GTM Compass AI - MCP HubSpot Agent",
    description="AI-powered HubSpot CRM assistant via MCP",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include MCP router
app.include_router(mcp_router, prefix="/api")

# Initialize MCP agents on startup
@app.on_event("startup")
async def startup_event():
    """Initialize MCP agents when the app starts"""
    initialize_mcps()
    print("🚀 MCP HubSpot Agent initialized successfully!")

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "GTM Compass AI - MCP HubSpot Agent",
        "status": "running",
        "docs": "/docs"
    }

# Health endpoint
@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 