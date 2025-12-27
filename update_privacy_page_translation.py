import json
import os

def update_translation():
    file_path = 'client/src/locales/en/translation.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    privacy_page_data = {
        "title": "Privacy Policy",
        "lastUpdated": "Last Updated: November 11, 2025 • Version 2.0",
        "providedBy": "Provided by",
        "sections": {
            "introduction": {
                "title": "1. Introduction",
                "content1": "TibrCode Software Development (\"TibrCode\", \"we\", \"us\", \"our\") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, share, and protect your information when you use Log & Ledger Pro (\"the Platform\", \"the Software\", \"the Service\").",
                "content2": "This policy applies to all users worldwide and complies with major privacy regulations including the EU General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable data protection laws.",
                "rightsTitle": "Your Rights:",
                "rightsContent": "You have the right to access, correct, delete, export, and restrict the processing of your personal data. See Section 8 for details."
            },
            "informationCollected": {
                "title": "2. Information We Collect",
                "whatWeCollect": {
                    "title": "What We Collect",
                    "items": [
                        "<strong>Account Information:</strong> Name, email, username, password (encrypted)",
                        "<strong>Company Information:</strong> Business name, tax number, address, contact details",
                        "<strong>Financial Data:</strong> Invoices, expenses, transactions, accounts, reports",
                        "<strong>Usage Data:</strong> Login times, feature usage, IP address, browser type",
                        "<strong>Device Information:</strong> Operating system, device type, screen resolution",
                        "<strong>Communication Data:</strong> Support requests, feedback, correspondence"
                    ]
                },
                "whatWeDontCollect": {
                    "title": "What We DON'T Collect",
                    "items": [
                        "❌ Credit card numbers (processed by payment providers)",
                        "❌ Social security numbers or national IDs",
                        "❌ Biometric data",
                        "❌ Health information",
                        "❌ Information from children under 16",
                        "❌ Sensitive personal data (race, religion, political views)"
                    ]
                },
                "dataYouProvide": {
                    "title": "2.1 Data You Provide",
                    "content": "You directly provide most data we collect when you register, create invoices, enter transactions, upload documents, or communicate with support."
                },
                "dataCollectedAutomatically": {
                    "title": "2.2 Data We Collect Automatically",
                    "content": "When you use the Platform, we automatically collect technical data including IP addresses, browser type, operating system, access times, pages viewed, and clickstream data through cookies and similar technologies."
                },
                "cookies": {
                    "title": "2.3 Cookies and Tracking",
                    "content": "We use essential cookies (required for the Service to function), performance cookies (analytics), and functional cookies (preferences). You can control cookies through your browser settings, but disabling essential cookies may affect functionality."
                }
            },
            "howWeUseData": {
                "title": "3. How We Use Your Data",
                "intro": "We use your information for the following purposes:",
                "purposes": [
                    { "title": "✓ Provide the Service", "desc": "Process your accounting data, generate reports, enable invoicing, manage your account" },
                    { "title": "✓ Improve the Platform", "desc": "Analyze usage patterns, fix bugs, develop new features, optimize performance" },
                    { "title": "✓ Ensure Security", "desc": "Detect fraud, prevent unauthorized access, monitor for suspicious activity" },
                    { "title": "✓ Customer Support", "desc": "Respond to inquiries, troubleshoot issues, provide technical assistance" },
                    { "title": "✓ Legal Compliance", "desc": "Comply with legal obligations, enforce our Terms, protect our rights" },
                    { "title": "✓ Communications", "desc": "Send important updates, security alerts, product announcements (you can opt-out of marketing)" }
                ],
                "weDoNot": {
                    "title": "⚠️ We Do NOT:",
                    "items": [
                        "❌ Sell your personal data to third parties",
                        "❌ Use your financial data for advertising",
                        "❌ Share your data with data brokers",
                        "❌ Use your data for purposes unrelated to the Service"
                    ]
                }
            },
            "legalBasis": {
                "title": "4. Legal Basis for Processing (GDPR)",
                "intro": "For users in the European Economic Area (EEA), UK, and Switzerland, we process your data based on:",
                "items": [
                    { "title": "Contract:", "desc": "Processing necessary to provide the Service you subscribed to" },
                    { "title": "Legitimate Interest:", "desc": "Improving the Service, security, fraud prevention, analytics" },
                    { "title": "Consent:", "desc": "Marketing communications, optional features (you can withdraw anytime)" },
                    { "title": "Legal Obligation:", "desc": "Compliance with tax laws, accounting regulations, legal requests" }
                ]
            },
            "dataSharing": {
                "title": "5. When We Share Your Data",
                "intro": "We share your data only in the following limited circumstances:",
                "serviceProviders": {
                    "title": "5.1 Service Providers",
                    "intro": "We use trusted third-party service providers who process data on our behalf under strict confidentiality agreements:",
                    "items": [
                        "<strong>Firebase (Google):</strong> Authentication, user management",
                        "<strong>Neon Database:</strong> Secure cloud database hosting",
                        "<strong>Render.com:</strong> Application hosting and infrastructure",
                        "<strong>Email Services:</strong> Transactional emails, support communications"
                    ]
                },
                "legalRequirements": {
                    "title": "5.2 Legal Requirements",
                    "content": "We may disclose your data if required by law, court order, legal process, or to protect our rights, property, or safety, or that of others."
                },
                "businessTransfers": {
                    "title": "5.3 Business Transfers",
                    "content": "If TibrCode is involved in a merger, acquisition, or sale of assets, your data may be transferred. You will be notified of any such change."
                },
                "withConsent": {
                    "title": "5.4 With Your Consent",
                    "content": "We may share data with third parties if you explicitly consent (e.g., integrations with other software you enable)."
                }
            },
            "dataSecurity": {
                "title": "6. Data Security",
                "intro": "We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction:",
                "technical": {
                    "title": "Technical Measures",
                    "items": [
                        "🔒 TLS/SSL encryption in transit",
                        "🔐 Encrypted password storage (bcrypt)",
                        "🛡️ Database encryption at rest",
                        "🔥 Firewall protection",
                        "📊 Regular security audits"
                    ]
                },
                "organizational": {
                    "title": "Organizational Measures",
                    "items": [
                        "👥 Access controls (least privilege)",
                        "📝 Data processing agreements",
                        "🎓 Employee security training",
                        "📋 Incident response plan",
                        "🔍 Regular backups"
                    ]
                },
                "notice": {
                    "title": "⚠️ Important Security Notice:",
                    "content": "No method of transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials."
                }
            },
            "dataRetention": {
                "title": "7. Data Retention",
                "intro": "We retain your data for as long as necessary to provide the Service and comply with legal obligations:",
                "items": [
                    "<strong>Active Account Data:</strong> Retained while your account is active",
                    "<strong>Financial Records:</strong> Retained for 7+ years to comply with tax/accounting laws",
                    "<strong>Support Communications:</strong> Retained for 3 years",
                    "<strong>Usage/Analytics Data:</strong> Retained for 2 years",
                    "<strong>Deleted Account Data:</strong> Permanently deleted within 30 days (except as required by law)"
                ]
            },
            "yourRights": {
                "title": "8. Your Privacy Rights",
                "intro": "You have the following rights regarding your personal data:",
                "rights": [
                    { "title": "✓ Right to Access", "desc": "Request a copy of all personal data we hold about you" },
                    { "title": "✓ Right to Rectification", "desc": "Correct inaccurate or incomplete data" },
                    { "title": "✓ Right to Erasure (Right to be Forgotten)", "desc": "Request deletion of your data (subject to legal retention requirements)" },
                    { "title": "✓ Right to Data Portability", "desc": "Export your data in a machine-readable format (JSON, CSV)" },
                    { "title": "✓ Right to Restriction", "desc": "Limit how we process your data" },
                    { "title": "✓ Right to Object", "desc": "Object to processing based on legitimate interests" },
                    { "title": "✓ Right to Withdraw Consent", "desc": "Withdraw consent for optional processing (e.g., marketing)" },
                    { "title": "✓ Right to Lodge a Complaint", "desc": "File a complaint with your local data protection authority" }
                ],
                "contact": "To exercise these rights, contact us at <strong>privacy@tibrcode.com</strong>. We will respond within 30 days."
            },
            "internationalTransfers": {
                "title": "9. International Data Transfers",
                "content": "Your data may be transferred to and processed in countries outside your residence. We ensure adequate protection through Standard Contractual Clauses (SCCs), adequacy decisions, or other approved mechanisms."
            },
            "childrensPrivacy": {
                "title": "10. Children's Privacy",
                "content": "Log & Ledger Pro is not intended for children under 16. We do not knowingly collect data from children. If we discover we have collected data from a child, we will delete it immediately."
            },
            "changesToPolicy": {
                "title": "11. Changes to This Policy",
                "content": "We may update this Privacy Policy from time to time. Significant changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance."
            },
            "contactUs": {
                "title": "12. Contact Us",
                "intro": "For privacy questions, data requests, or concerns, please contact:",
                "details": {
                    "company": "TibrCode Software Development",
                    "dpo": "<strong>Data Protection Officer:</strong> privacy@tibrcode.com",
                    "support": "<strong>General Support:</strong> support@logandledger.com",
                    "legal": "<strong>Legal:</strong> legal@tibrcode.com",
                    "responseTime": "Response time: Within 30 days (GDPR/CCPA compliance)"
                }
            }
        },
        "footer": {
            "rights": "© {{year}} TibrCode Software Development. All rights reserved.",
            "compliance": "This Privacy Policy is GDPR, CCPA, and internationally compliant."
        }
    }
    
    data['privacyPage'] = privacy_page_data
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("Successfully updated translation.json with privacyPage data")

if __name__ == "__main__":
    update_translation()
