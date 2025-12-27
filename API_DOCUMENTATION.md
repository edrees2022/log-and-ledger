# 📚 Log & Ledger API Documentation

## Overview
Log & Ledger provides a RESTful API for integrating with third-party applications. All API requests must be authenticated using an API Key or Session Cookie.

## Authentication
### API Key
Include your API key in the `X-API-Key` header.
```http
GET /api/invoices
X-API-Key: your_api_key_here
```

## Core Endpoints

### 1. Invoices
**GET /api/invoices**
Retrieve a list of invoices.
- Parameters: `page`, `limit`, `status`

**POST /api/invoices**
Create a new invoice.
```json
{
  "contact_id": "uuid",
  "date": "2023-10-01",
  "due_date": "2023-10-31",
  "items": [
    { "item_id": "uuid", "quantity": 1, "unit_price": 100 }
  ]
}
```

### 2. Contacts (Customers & Suppliers)
**GET /api/contacts**
List all contacts.

**POST /api/contacts**
Create a new contact.

### 3. Reports
**GET /api/reports/trial-balance**
Get the trial balance for a date range.

**GET /api/reports/global-dashboard**
Get consolidated financial stats for the group.

## Rate Limiting
- **Standard:** 100 requests per minute.
- **Auth Endpoints:** 5 requests per 15 minutes.

## Errors
- `400 Bad Request`: Invalid input.
- `401 Unauthorized`: Missing or invalid API key.
- `403 Forbidden`: Insufficient permissions.
- `429 Too Many Requests`: Rate limit exceeded.
