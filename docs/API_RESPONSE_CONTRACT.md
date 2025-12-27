# API Response Contract

This project standardizes API responses to be predictable and easy to consume across the app.

## Success responses

- For all 2xx JSON responses, the server wraps payloads as:
  { "data": <payload> }
  Examples:
  - List: { "data": [ ... ] }
  - Object: { "data": { ... } }
  - Create (201): { "data": { ...created } }

- For DELETE endpoints and selected mutation endpoints that only signal success:
  { "success": true }

The client request layer automatically unwraps { data } to preserve existing UI code. If you are calling fetch directly, prefer using the shared helpers in client/src/lib/queryClient.ts.

## Error responses

All errors are normalized to the shape:
  { "error": "<type>", "message": "<human readable>" }

Common cases:
- Validation: { "error": "bad_request", "message": "<details>" } (HTTP 400)
- Unauthorized: { "error": "unauthorized", "message": "Login required" } (HTTP 401)
- Forbidden: { "error": "forbidden", "message": "Insufficient role" } (HTTP 403)
- Not found: { "error": "not_found", "message": "Resource not found" } (HTTP 404)
- Server error: { "error": "server_error", "message": "Something went wrong" } (HTTP 500)

Use the helper functions when returning errors from routes so shape stays consistent.

## Exceptions and notes

- Some operational endpoints may return { success: true } instead of { data } by design (e.g., DELETE).
- The success envelope middleware does not wrap:
  - Already-wrapped bodies that contain a top-level data property.
  - Simple acknowledgements like { success: true }.
  - Error shapes.
- Taxes endpoint (/api/taxes) is fail-soft: on missing table or no company context it returns an empty list [] rather than 500 to avoid breaking the UI.

## Client usage

The client provides wrappers that auto-unwrap { data }:
- Queries and mutations: see client/src/lib/queryClient.ts

When adding new endpoints:
1) Return normal JSON from the handler (arrays or objects). The middleware will wrap in { data } automatically.
2) For DELETE, return { success: true }.
3) Use error helpers (badRequest, notFound, serverError, etc.) for non-2xx responses.

## Quick examples

- Create item (201): { "data": { id: "...", name: "..." } }
- Get list: { "data": [ { ... }, { ... } ] }
- Delete: { "success": true }
- Validation error: { "error": "bad_request", "message": "Name is required" }
