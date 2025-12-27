/**
 * API Documentation for Log & Ledger
 * 
 * This file contains the OpenAPI/Swagger documentation for the REST API
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Log & Ledger API',
      version: '1.0.0',
      description: `
# Log & Ledger API Documentation

A comprehensive REST API for enterprise accounting and business management.

## Authentication

All API endpoints require authentication using Bearer tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer your-access-token
\`\`\`

## Rate Limiting

- Standard: 1000 requests per hour
- Premium: 10000 requests per hour

## Response Format

All responses follow this structure:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
\`\`\`

## Error Handling

Errors return appropriate HTTP status codes with details:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
\`\`\`
      `,
      contact: {
        name: 'Log & Ledger Support',
        email: 'support@logandledger.com',
        url: 'https://logandledger.com/support',
      },
      license: {
        name: 'Proprietary',
        url: 'https://logandledger.com/license',
      },
    },
    servers: [
      {
        url: 'https://api.logandledger.com/v1',
        description: 'Production server',
      },
      {
        url: 'https://staging-api.logandledger.com/v1',
        description: 'Staging server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Companies', description: 'Company management' },
      { name: 'Invoices', description: 'Sales invoice operations' },
      { name: 'Bills', description: 'Purchase bill operations' },
      { name: 'Contacts', description: 'Customer and vendor management' },
      { name: 'Items', description: 'Product and service management' },
      { name: 'Accounts', description: 'Chart of accounts' },
      { name: 'Journal Entries', description: 'Manual journal entries' },
      { name: 'Payments', description: 'Payment and receipt operations' },
      { name: 'Reports', description: 'Financial reports' },
      { name: 'Inventory', description: 'Inventory management' },
      { name: 'ZATCA', description: 'ZATCA e-invoicing integration' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        // Common schemas
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            sortBy: { type: 'string' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        
        // Company
        Company: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'شركة التقنية المتقدمة' },
            legalName: { type: 'string' },
            taxNumber: { type: 'string', example: '300000000000003' },
            registrationNumber: { type: 'string' },
            logoUrl: { type: 'string', format: 'uri' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
            baseCurrency: { type: 'string', example: 'SAR' },
            fiscalYearStart: { type: 'integer', minimum: 1, maximum: 12 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Contact
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['customer', 'vendor', 'both'] },
            name: { type: 'string', example: 'شركة الرياض للتجارة' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            taxNumber: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            creditLimit: { type: 'number' },
            paymentTermsDays: { type: 'integer' },
            balance: { type: 'number', readOnly: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'type'],
        },

        // Item
        Item: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['product', 'service'] },
            name: { type: 'string', example: 'خدمات استشارية' },
            nameEn: { type: 'string' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            description: { type: 'string' },
            salesPrice: { type: 'number', example: 1000 },
            purchasePrice: { type: 'number' },
            taxRate: { type: 'number', example: 15 },
            unit: { type: 'string', example: 'ساعة' },
            categoryId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean', default: true },
            trackInventory: { type: 'boolean', default: false },
            quantityOnHand: { type: 'number', readOnly: true },
            reorderLevel: { type: 'number' },
          },
          required: ['name', 'type'],
        },

        // Invoice
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            number: { type: 'string', example: 'INV-2024-0001' },
            type: { type: 'string', enum: ['standard', 'simplified', 'credit_note', 'debit_note'] },
            status: { type: 'string', enum: ['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'] },
            contactId: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            dueDate: { type: 'string', format: 'date' },
            currency: { type: 'string', example: 'SAR' },
            exchangeRate: { type: 'number', default: 1 },
            lines: {
              type: 'array',
              items: { $ref: '#/components/schemas/InvoiceLine' },
            },
            subtotal: { type: 'number', readOnly: true },
            taxAmount: { type: 'number', readOnly: true },
            discountAmount: { type: 'number' },
            total: { type: 'number', readOnly: true },
            amountPaid: { type: 'number', readOnly: true },
            amountDue: { type: 'number', readOnly: true },
            notes: { type: 'string' },
            terms: { type: 'string' },
            zatcaStatus: { type: 'string', enum: ['pending', 'submitted', 'cleared', 'reported', 'rejected'] },
            zatcaQrCode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['contactId', 'date'],
        },

        InvoiceLine: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            itemId: { type: 'string', format: 'uuid' },
            description: { type: 'string' },
            quantity: { type: 'number', minimum: 0.01 },
            unitPrice: { type: 'number', minimum: 0 },
            discount: { type: 'number', minimum: 0 },
            discountType: { type: 'string', enum: ['percentage', 'fixed'] },
            taxRate: { type: 'number' },
            taxAmount: { type: 'number', readOnly: true },
            total: { type: 'number', readOnly: true },
            accountId: { type: 'string', format: 'uuid' },
          },
          required: ['description', 'quantity', 'unitPrice'],
        },

        // Account
        Account: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            code: { type: 'string', example: '1100' },
            name: { type: 'string', example: 'الصندوق' },
            nameEn: { type: 'string', example: 'Cash' },
            type: { type: 'string', enum: ['asset', 'liability', 'equity', 'revenue', 'expense'] },
            category: { type: 'string' },
            parentId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean', default: true },
            isSystem: { type: 'boolean', readOnly: true },
            balance: { type: 'number', readOnly: true },
            currency: { type: 'string' },
          },
          required: ['code', 'name', 'type'],
        },

        // Journal Entry
        JournalEntry: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            number: { type: 'string', example: 'JE-2024-0001' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string' },
            reference: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'posted', 'void'] },
            lines: {
              type: 'array',
              items: { $ref: '#/components/schemas/JournalEntryLine' },
            },
            totalDebit: { type: 'number', readOnly: true },
            totalCredit: { type: 'number', readOnly: true },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['date', 'lines'],
        },

        JournalEntryLine: {
          type: 'object',
          properties: {
            accountId: { type: 'string', format: 'uuid' },
            description: { type: 'string' },
            debit: { type: 'number', minimum: 0 },
            credit: { type: 'number', minimum: 0 },
            contactId: { type: 'string', format: 'uuid' },
            costCenterId: { type: 'string', format: 'uuid' },
            projectId: { type: 'string', format: 'uuid' },
          },
          required: ['accountId'],
        },

        // Payment
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['receipt', 'payment'] },
            number: { type: 'string' },
            date: { type: 'string', format: 'date' },
            contactId: { type: 'string', format: 'uuid' },
            accountId: { type: 'string', format: 'uuid' },
            amount: { type: 'number', minimum: 0.01 },
            currency: { type: 'string' },
            exchangeRate: { type: 'number' },
            paymentMethod: { type: 'string', enum: ['cash', 'bank_transfer', 'credit_card', 'check'] },
            reference: { type: 'string' },
            notes: { type: 'string' },
            allocations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  invoiceId: { type: 'string', format: 'uuid' },
                  amount: { type: 'number' },
                },
              },
            },
            status: { type: 'string', enum: ['draft', 'confirmed', 'void'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['type', 'date', 'contactId', 'accountId', 'amount'],
        },

        // Report parameters
        ReportParams: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            companyId: { type: 'string', format: 'uuid' },
            format: { type: 'string', enum: ['json', 'pdf', 'excel'] },
            language: { type: 'string', enum: ['ar', 'en'] },
          },
        },
      },

      responses: {
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [
      { bearerAuth: [] },
    ],
  },
  apis: ['./server/routes/*.ts'],
};

// API Endpoints Documentation
export const apiPaths = {
  // Authentication
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'User login',
      description: 'Authenticate user and return access token',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 },
              },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                      expiresIn: { type: 'integer' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          email: { type: 'string' },
                          name: { type: 'string' },
                          role: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  // Invoices
  '/invoices': {
    get: {
      tags: ['Invoices'],
      summary: 'List invoices',
      description: 'Get a paginated list of invoices with optional filters',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'contactId', in: 'query', schema: { type: 'string' } },
        { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'List of invoices',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Invoice' },
                  },
                  meta: { $ref: '#/components/schemas/Pagination' },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Invoices'],
      summary: 'Create invoice',
      description: 'Create a new sales invoice',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Invoice' },
          },
        },
      },
      responses: {
        201: {
          description: 'Invoice created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Invoice' },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
      },
    },
  },

  '/invoices/{id}': {
    get: {
      tags: ['Invoices'],
      summary: 'Get invoice',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Invoice details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Invoice' },
            },
          },
        },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Invoices'],
      summary: 'Update invoice',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Invoice' },
          },
        },
      },
      responses: {
        200: { description: 'Invoice updated' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Invoices'],
      summary: 'Delete invoice',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        204: { description: 'Invoice deleted' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/invoices/{id}/send': {
    post: {
      tags: ['Invoices'],
      summary: 'Send invoice by email',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                to: { type: 'array', items: { type: 'string', format: 'email' } },
                cc: { type: 'array', items: { type: 'string', format: 'email' } },
                subject: { type: 'string' },
                message: { type: 'string' },
                attachPdf: { type: 'boolean', default: true },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Invoice sent successfully' },
      },
    },
  },

  '/invoices/{id}/pdf': {
    get: {
      tags: ['Invoices'],
      summary: 'Download invoice PDF',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'template', in: 'query', schema: { type: 'string' } },
        { name: 'language', in: 'query', schema: { type: 'string', enum: ['ar', 'en'] } },
      ],
      responses: {
        200: {
          description: 'PDF file',
          content: {
            'application/pdf': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
      },
    },
  },

  // Reports
  '/reports/profit-loss': {
    get: {
      tags: ['Reports'],
      summary: 'Profit & Loss Report',
      parameters: [
        { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'pdf', 'excel'] } },
      ],
      responses: {
        200: { description: 'Profit & Loss report data' },
      },
    },
  },

  '/reports/balance-sheet': {
    get: {
      tags: ['Reports'],
      summary: 'Balance Sheet Report',
      parameters: [
        { name: 'asOfDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'pdf', 'excel'] } },
      ],
      responses: {
        200: { description: 'Balance Sheet report data' },
      },
    },
  },

  '/reports/trial-balance': {
    get: {
      tags: ['Reports'],
      summary: 'Trial Balance Report',
      parameters: [
        { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
      ],
      responses: {
        200: { description: 'Trial Balance report data' },
      },
    },
  },

  '/reports/aging': {
    get: {
      tags: ['Reports'],
      summary: 'Aging Report',
      parameters: [
        { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['receivables', 'payables'] } },
        { name: 'asOfDate', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: {
        200: { description: 'Aging report data' },
      },
    },
  },

  // ZATCA
  '/zatca/submit': {
    post: {
      tags: ['ZATCA'],
      summary: 'Submit invoice to ZATCA',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                invoiceId: { type: 'string' },
                invoiceType: { type: 'string', enum: ['standard', 'simplified'] },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Submission result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  status: { type: 'string', enum: ['cleared', 'reported', 'rejected'] },
                  qrCode: { type: 'string' },
                  hash: { type: 'string' },
                  warnings: { type: 'array', items: { type: 'string' } },
                  errors: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
  },

  '/zatca/validate': {
    post: {
      tags: ['ZATCA'],
      summary: 'Validate invoice before submission',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                invoiceId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Validation result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  valid: { type: 'boolean' },
                  errors: { type: 'array', items: { type: 'string' } },
                  warnings: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
