import swaggerJsdoc from 'swagger-jsdoc';
import type { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Log & Ledger API',
      version: '1.0.0',
      description: `
# Log & Ledger - Complete Accounting System API

A comprehensive REST API for managing accounting operations including:
- 📊 **Accounts & Chart of Accounts** - Full double-entry bookkeeping
- 📝 **Invoices & Bills** - Sales and purchase documents
- 💰 **Payments & Receipts** - Cash management
- 📈 **Financial Reports** - Dashboard, P&L, Balance Sheet
- 🤖 **AI-Powered Extraction** - Invoice parsing from images/PDFs
- 🏢 **Multi-company Support** - Manage multiple entities
- 🔐 **Firebase Authentication** - Secure SSO login

## Authentication

Most endpoints require authentication via Firebase token:

\`\`\`
Authorization: Bearer <firebase-id-token>
\`\`\`

Obtain token from Firebase Authentication SDK, then call \`/api/auth/sso-login\` to establish session.

## Rate Limiting

- Global API: 100 requests/minute
- Authentication: 5 attempts/15 minutes
- Reports: 20 requests/minute
- Bulk operations: 10 requests/minute

## Error Handling

All errors return standard format:
\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
\`\`\`

Common status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (no session)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error
      `,
      contact: {
        name: 'API Support',
        email: 'support@logledger.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.logledger-pro.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase ID token',
        },
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'ledger.sid',
          description: 'Session cookie (set after SSO login)',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            company_id: { type: 'string', format: 'uuid' },
            code: { type: 'string', example: '1010' },
            name: { type: 'string', example: 'Cash' },
            type: {
              type: 'string',
              enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
            },
            subtype: { type: 'string', example: 'current_asset' },
            parent_id: { type: 'string', format: 'uuid', nullable: true },
            currency: { type: 'string', example: 'USD' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Tax: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            company_id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'VAT 15%' },
            rate: { type: 'number', example: 15.00 },
            type: {
              type: 'string',
              enum: ['sales_tax', 'purchase_tax', 'withholding_tax'],
            },
            is_active: { type: 'boolean' },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            company_id: { type: 'string', format: 'uuid' },
            customer_id: { type: 'string', format: 'uuid' },
            invoice_number: { type: 'string', example: 'INV-2025-001' },
            date: { type: 'string', format: 'date-time' },
            due_date: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
            },
            currency: { type: 'string', example: 'USD' },
            subtotal: { type: 'number', example: 1000.00 },
            tax_total: { type: 'number', example: 150.00 },
            total: { type: 'number', example: 1150.00 },
            paid_amount: { type: 'number', example: 0.00 },
            notes: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        sessionCookie: [],
      },
    ],
  },
  apis: ['./server/routes.ts', './server/routes/*.ts'], // Path to API routes
};

export const swaggerSpec = swaggerJsdoc(options);
