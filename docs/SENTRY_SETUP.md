# Sentry Setup Guide

## Overview

Sentry provides error tracking and performance monitoring for production applications.

## Free Tier Benefits

- **5,000 errors/month** - Free forever
- **10K transactions/month** - Performance monitoring
- **30 days retention** - Error history
- **Email alerts** - Real-time notifications
- **Source maps** - Better error debugging

## Setup Instructions

### 1. Create Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up (free account)
3. Create a new project:
   - Platform: **Node.js** (for backend)
   - Platform: **React** (for frontend)
4. Copy your DSN (Data Source Name)

### 2. Install Dependencies

```bash
# Backend
npm install @sentry/node @sentry/profiling-node

# Frontend
npm install @sentry/react
```

### 3. Configure Environment Variables

Add to `.env`:

```env
# Sentry Configuration
SENTRY_DSN_BACKEND=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN_FRONTEND=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0
```

### 4. Backend Integration

Create `server/sentry.ts`:

```typescript
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
  if (!process.env.SENTRY_DSN_BACKEND) {
    console.log('⚠️  Sentry DSN not configured - skipping error tracking');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN_BACKEND,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    release: process.env.SENTRY_RELEASE,
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    profilesSampleRate: 0.1, // 10% of traces
    
    integrations: [
      new ProfilingIntegration(),
    ],
    
    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['cookie'];
        delete event.request.headers['authorization'];
      }
      return event;
    },
  });

  console.log('✅ Sentry error tracking initialized');
}

export { Sentry };
```

Update `server/index.ts`:

```typescript
import { initSentry, Sentry } from './sentry';

// Initialize Sentry FIRST (before other imports)
initSentry();

// ... rest of imports ...

// Add Sentry request handler (after app creation)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes ...

// Add Sentry error handler (BEFORE other error handlers)
app.use(Sentry.Handlers.errorHandler());
```

### 5. Frontend Integration

Create `client/src/lib/sentry.ts`:

```typescript
import * as Sentry from "@sentry/react";

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN_FRONTEND) {
    console.log('⚠️  Sentry DSN not configured - skipping error tracking');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN_FRONTEND,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    release: import.meta.env.VITE_SENTRY_RELEASE,
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of page loads
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Session Replay (debugging)
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of errors
  });

  console.log('✅ Sentry error tracking initialized');
}
```

Update `client/src/main.tsx`:

```typescript
import { initSentry } from './lib/sentry';

// Initialize Sentry first
initSentry();

// ... rest of your app ...
```

### 6. Manual Error Tracking

```typescript
import { Sentry } from './sentry';

try {
  // Your code
} catch (error) {
  // Log to Sentry with context
  Sentry.captureException(error, {
    tags: {
      component: 'DashboardPage',
      action: 'loadData',
    },
    extra: {
      companyId: session.companyId,
      userId: session.userId,
    },
  });
  
  // Also log locally
  console.error('Dashboard error:', error);
}
```

### 7. Performance Monitoring

```typescript
// Track slow operations
const transaction = Sentry.startTransaction({
  op: 'database',
  name: 'Load Dashboard Data',
});

try {
  await loadDashboardData();
} finally {
  transaction.finish();
}
```

## Best Practices

### 1. Filter Sensitive Data

- ✅ Remove passwords from error logs
- ✅ Mask email addresses
- ✅ Remove API keys
- ✅ Filter credit card numbers

### 2. Set Context

```typescript
Sentry.setUser({
  id: user.id,
  username: user.username,
  email: user.email,
});

Sentry.setContext('company', {
  id: company.id,
  name: company.name,
});
```

### 3. Use Breadcrumbs

```typescript
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
});
```

### 4. Error Boundaries (React)

```tsx
import * as Sentry from '@sentry/react';

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <YourApp />
    </Sentry.ErrorBoundary>
  );
}
```

## Testing

```bash
# Test backend error tracking
curl -X POST http://localhost:5000/api/test-sentry

# Check Sentry dashboard
# Errors should appear within 1 minute
```

## Cost Management

**Free Tier Limits:**
- 5K errors/month = ~160 errors/day
- 10K transactions/month = ~330 transactions/day

**Tips to stay within free tier:**
- Sample only 10% of transactions
- Filter noisy errors (404s, validation errors)
- Use environment filtering (only production)
- Set up alert quotas

## Alerts

Configure in Sentry dashboard:
1. Go to **Settings → Alerts**
2. Create alert rule:
   - Error rate > 10/minute
   - New error types
   - Performance degradation
3. Set notification channels (email, Slack)

## Monitoring Dashboard

Key metrics to watch:
- **Error rate** - Should be < 0.1%
- **Response time** - p95 should be < 1s
- **Crash-free sessions** - Should be > 99%
- **Failed transactions** - Should be < 1%

## Production Checklist

- [ ] Sentry account created
- [ ] DSN configured in .env
- [ ] Backend integration tested
- [ ] Frontend integration tested
- [ ] Source maps uploaded
- [ ] Alerts configured
- [ ] Team members added
- [ ] Privacy settings reviewed

## Support

- Documentation: https://docs.sentry.io/
- Community: https://forum.sentry.io/
- Status: https://status.sentry.io/
