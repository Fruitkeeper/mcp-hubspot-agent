# Environment Configuration

Before running the application, you need to create a `.env` file in the `backend/` directory with your HubSpot credentials.

## Create backend/.env file:

```bash
# HubSpot Configuration
# Get your Private App token from: https://app.hubspot.com/developer/YOUR_ACCOUNT/applications
HUBSPOT_ACCESS_TOKEN=your_hubspot_private_app_token_here

# Optional: For OAuth Apps only (not needed for Private Apps)
# HUBSPOT_CLIENT_ID=your_client_id
# HUBSPOT_CLIENT_SECRET=your_client_secret  
# HUBSPOT_REFRESH_TOKEN=your_refresh_token

# Development Settings (optional)
DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000
```

## How to get your HubSpot Private App Token:

1. Go to your HubSpot developer account
2. Navigate to: https://app.hubspot.com/developer/YOUR_ACCOUNT/applications
3. Create a new "Private App" 
4. Set the required scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.deals.read`
   - `crm.objects.calls.read`
5. Generate and copy the access token
6. Paste it as `HUBSPOT_ACCESS_TOKEN` in your `.env` file

## Example .env file:
```
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
``` 