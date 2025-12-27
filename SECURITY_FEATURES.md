# 🛡 Security Features & Compliance

## Overview
Log & Ledger is built with a "Security First" architecture to protect sensitive financial data.

## 1. Authentication & Authorization
- **Two-Factor Authentication (2FA):** Time-based One-Time Password (TOTP) support (Google Authenticator, Authy).
- **Session Management:** Secure, HTTP-only cookies with strict SameSite policies.
- **Role-Based Access Control (RBAC):** Granular permissions for Owners, Accountants, and Viewers.

## 2. Data Protection
- **Encryption at Rest:** Sensitive fields (like API Key hashes) are encrypted.
- **Encryption in Transit:** All traffic is served over HTTPS (TLS 1.2+).
- **Database Isolation:** Multi-tenant architecture ensures data separation between companies.

## 3. Network Security
- **Rate Limiting:**
  - API: 100 req/min
  - Login: 5 req/15 min (Brute-force protection)
- **Security Headers:**
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` (HSTS)

## 4. Audit Logging
Every critical action is logged in the `audit_logs` table:
- **Who:** User ID and IP Address.
- **What:** Action (Create, Update, Delete) and Entity (Invoice, Journal).
- **When:** Exact timestamp.
- **Changes:** JSON diff of old vs new values.

## 5. Compliance
- **GDPR/CCPA:** Users can request data export and deletion.
- **VAT/Tax:** Compliant with regional tax regulations (e.g., ZATCA in KSA).
