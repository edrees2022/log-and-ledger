# Project Management System

## Overview
The Project Management system allows users to track financial performance by project. It links income and expenses to specific projects, enabling profitability analysis and budget tracking per project.

## Database Schema

### Projects Table (`projects`)
- `id`: UUID
- `company_id`: UUID (Foreign Key)
- `code`: Project Code (e.g., "PRJ-001")
- `name`: Project Name
- `description`: Optional description
- `budget`: Total project budget
- `start_date`: Project start date
- `end_date`: Project end date
- `status`: active, completed, on_hold, cancelled
- `is_active`: Boolean

### Integration
- **Journal Lines**: Added `project_id` to `journal_lines` table. This allows every GL entry to be tagged with a project.
- **Document Lines**: Added `project_id` to `document_lines` table. This allows individual line items on Invoices, Bills, Orders, and Quotes to be assigned to projects.

## API Endpoints

### Projects (`/api/projects`)
- `GET /`: List all projects
- `GET /:id`: Get project details
- `POST /`: Create a new project
- `PUT /:id`: Update a project
- `GET /:id/financials`: Get project financial summary (Revenue, Expenses, Profit, Assets, Liabilities, Equity)
- `GET /:id/transactions`: Get all journal lines associated with the project

## Financial Logic
Project financials are calculated by aggregating `journal_lines` tagged with the `project_id`.
- **Revenue**: Sum of credits to Revenue accounts.
- **Expenses**: Sum of debits to Expense accounts.
- **Profit**: Revenue - Expenses.
- **Assets/Liabilities/Equity**: Tracked similarly based on account type.

## Usage
1.  **Create a Project**: Define a project with a code, name, and budget.
2.  **Tag Transactions**: When creating Invoices, Bills, or Manual Journals, select the project for each line item.
3.  **Monitor Performance**: Use the financials endpoint to track real-time profitability against the budget.
