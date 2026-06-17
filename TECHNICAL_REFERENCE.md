# OMS API Testing Tool — Technical Reference

**Version:** 1.0  
**Audience:** Developers, Integration Engineers, DevOps  
**Last Updated:** June 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Server Architecture](#3-server-architecture)
4. [Data Layer — Module Reference](#4-data-layer--module-reference)
5. [API Definitions Reference](#5-api-definitions-reference)
6. [Authentication Type Reference](#6-authentication-type-reference)
7. [Proxy Request/Response Contract](#7-proxy-requestresponse-contract)
8. [E2E Flow Definitions](#8-e2e-flow-definitions)
9. [Test Scenario Definitions](#9-test-scenario-definitions)
10. [Environment Configurations](#10-environment-configurations)
11. [Client Application Registry](#11-client-application-registry)
12. [OMS Order Lifecycle State Machine](#12-oms-order-lifecycle-state-machine)
13. [Extending the Tool](#13-extending-the-tool)
14. [TLS Certificate Management](#14-tls-certificate-management)
15. [Security Considerations](#15-security-considerations)
16. [Startup Scripts Reference](#16-startup-scripts-reference)

---

## 1. Architecture Overview

The OMS API Testing Tool is a **self-contained, browser-based single-page application (SPA)** backed by a lightweight **Node.js HTTPS proxy server**. It requires no build toolchain, no framework compilation, and no external database.

```
+------------------------------------------------------------------+
|                         Browser (SPA)                            |
|  +--------------+  +-------------+  +------------------------+  |
|  | Application  |  | E2E Flows   |  |  Test Scenarios        |  |
|  | Tab          |  | Tab         |  |  Tab                   |  |
|  +------+-------+  +------+------+  +-----------+------------+  |
|         +---------------------+---------------------+           |
|                      fetch('/api/proxy')                         |
+---------------------------+--------------------------------------+
                            | HTTPS POST (JSON envelope)
                            v
+------------------------------------------------------------------+
|               Node.js HTTPS Server  (server.js)                  |
|  +---------------------------+  +-----------------------------+  |
|  |  /api/proxy  endpoint     |  |  Static file server         |  |
|  |  - Auth header injection  |  |  (index.html, *.js, *.css)  |  |
|  |  - Correlation ID inject  |  +-----------------------------+  |
|  |  - Request/Response log   |                                   |
|  +-------------+-------------+                                   |
+----------------|------------------------------------------------- +
                 | HTTP/HTTPS (Node.js http/https module)
                 v
+------------------------------------------------------------------+
|                     Target OMS APIs                              |
|   DEV (localhost:8080)  |  QA  |  UAT  |  PROD                   |
+------------------------------------------------------------------+
```

**Key design properties:**

| Property | Detail |
|---|---|
| Runtime | Node.js 14+ (no NPM install required — Node.js stdlib only) |
| Transport | HTTPS via self-signed PEM certificates |
| Default server port | `8081` (overridable via `PORT` environment variable) |
| Data coupling | All configuration loaded as browser globals from JS data files |
| Proxy pattern | All API calls funnel through `/api/proxy` to avoid browser CORS restrictions |
| No build step | Vanilla JavaScript — no webpack, rollup, or transpilation required |

---

## 2. Project Structure

```
oms-testing/
├── index.html          # Main SPA — all UI logic in vanilla JS
├── oms.css             # Stylesheet — dark-themed, auth badges, cURL blocks
├── server.js           # HTTPS proxy server + static file server
├── envs.js             # window.OMS_ENVS — per-environment URL configuration
├── clients.js          # window.OMS_CLIENTS — API app credentials per environment
├── apis.js             # window.OMS_APIS, OMS_E2E_FLOWS, OMS_TEST_SCENARIOS
├── users.js            # window.OMS_USERS — test users and service accounts
├── run.cmd             # Windows one-click startup script
├── run.sh              # macOS/Linux startup script
└── certs/
    ├── cert.pem        # Self-signed X.509 TLS certificate
    └── key.pem         # RSA private key (unencrypted PEM)
```

### Global Window Variables

All data files expose their payload as browser globals so `index.html` can consume them without a module bundler:

| Global | Source File | Type | Description |
|---|---|---|---|
| `window.OMS_ENVS` | `envs.js` | `Object<envKey, EnvConfig>` | Per-environment base URLs and tool links |
| `window.OMS_CLIENTS` | `clients.js` | `Object<envKey, ClientConfig[]>` | API application credentials per environment |
| `window.OMS_USERS` | `users.js` | `Object<envKey, UserSet>` | Test users and service accounts per environment |
| `window.OMS_APIS` | `apis.js` | `ApiGroup[]` | All API group and endpoint definitions |
| `window.OMS_E2E_FLOWS` | `apis.js` | `E2EFlow[]` | Ordered E2E test flow step definitions |
| `window.OMS_TEST_SCENARIOS` | `apis.js` | `TestScenarioCategory[]` | Categorised test scenario catalogue |

---

## 3. Server Architecture

### 3.1 HTTPS and TLS Configuration

`server.js` creates an `https.Server` instance using PEM files read synchronously at startup:

```javascript
const serverOptions = {
    key:  fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};
const server = https.createServer(serverOptions, requestHandler);
```

- The certificate is **self-signed** — browser clients show a certificate warning on first visit which must be manually accepted.
- All proxied upstream requests are sent with `rejectUnauthorized: false`, allowing the proxy to reach upstream environments that also use self-signed or internally-signed certificates without TLS verification errors.
- The server fails to start with an unhandled exception if either PEM file is missing or unreadable.

### 3.2 CORS Handling

All `OPTIONS` preflight requests are answered immediately (HTTP 204) with permissive CORS headers:

```
Access-Control-Allow-Origin:  *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, X-Correlation-Id
```

All proxy responses additionally include `Access-Control-Allow-Origin: *` on the response returned to the browser.

### 3.3 Proxy Endpoint (`/api/proxy`)

**Route:** `POST /api/proxy`  
**Content-Type (inbound):** `application/json`

The proxy accepts a JSON envelope from the browser UI and forwards the described HTTP request to the target API. This is the **single route** through which all outbound API traffic flows.

#### Request Body Schema

```typescript
interface ProxyRequest {
  method:        string;                   // HTTP verb: GET, POST, PUT, DELETE, PATCH
  url:           string;                   // Full absolute target URL (required)
  token?:        string;                   // Bearer token value (without "Bearer " prefix)
  apiKey?:       string;                   // API Key value
  basicAuth?:    string;                   // Plain "username:password" — server base64-encodes
  formBody?:     string;                   // URL-encoded form string (OAuth token requests)
  contentType?:  string;                   // Content-Type override for form requests
  jsonBody?:     string | object;          // JSON body; string or object (auto-serialised)
  extraHeaders?: Record<string, string>;   // Arbitrary additional headers (merged last)
}
```

#### Auth Header Injection Logic

The server builds request headers from credentials in the following priority order. Later entries override earlier ones when both are supplied:

1. `token` present → `Authorization: Bearer <token>`
2. `apiKey` present → `X-API-Key: <apiKey>`
3. `basicAuth` present → `Authorization: Basic <Buffer.from(basicAuth).toString('base64')>`
4. `extraHeaders` object merged over all preceding headers

#### Automatic Correlation ID

Every proxied request receives a generated correlation identifier:

```
X-Correlation-Id: oms-test-<Date.now()>
```

Example: `X-Correlation-Id: oms-test-1718636521453`

#### Request Body Handling

| Condition | Resulting Content-Type | Body Source |
|---|---|---|
| `formBody` provided | `application/x-www-form-urlencoded` (or `contentType` override) | `formBody` string sent verbatim |
| `jsonBody` provided | `application/json` | `jsonBody` serialised via `JSON.stringify` if not already a string |
| Neither provided | *(header omitted)* | No body written to request |

`Content-Length` is always computed from `Buffer.byteLength(body)` before the request is dispatched.

#### Proxy Response Schema

The proxy always responds to the browser with HTTP 200, embedding the upstream status inside the JSON:

```typescript
interface ProxyResponse {
  status:     number;                  // Upstream HTTP status code
  statusText: string;                  // Upstream HTTP status message
  headers:    Record<string, string>;  // All upstream response headers
  body:       string;                  // Raw upstream response body (UTF-8 text)
  duration:   number;                  // Wall-clock round-trip in milliseconds
}
```

**Error responses from the proxy itself** (not from upstream):

| Scenario | HTTP Status | Body |
|---|---|---|
| Invalid JSON in proxy request body | 400 | `{ "error": "Invalid JSON body" }` |
| Missing `url` field | 400 | `{ "error": "Missing url field" }` |
| Unparseable target URL | 400 | `{ "error": "Invalid target URL: ..." }` |
| Network/connection failure to upstream | 502 | `{ "error": "<Node error message>", "duration": <ms> }` |

### 3.4 Static File Server

Any request that is not an `OPTIONS` preflight and not `POST /api/proxy` is served as a static file from the project root directory. Query strings are stripped before file path resolution.

**Supported MIME types:**

| Extension | MIME Type |
|---|---|
| `.html` | `text/html` |
| `.css` | `text/css` |
| `.js` | `application/javascript` |
| `.json` | `application/json` |
| `.png` | `image/png` |
| `.jpg` | `image/jpeg` |
| `.svg` | `image/svg+xml` |
| `.ico` | `image/x-icon` |
| *(other)* | `application/octet-stream` |

- Root path `/` is internally rewritten to `/index.html`.
- Missing files return HTTP 404 with plain-text body.
- File read errors return HTTP 500 with plain-text body.

### 3.5 Request and Response Logging

When `LOG_HEADERS` is `true` (the default), the server emits structured console output for every proxied request:

```
══════════════════════════════════════════════════════════════
[OMS PROXY] POST https://oms-api-qa.acme-corp.com/api/v1/orders
▶ Start: 14:32:01.453
Request Headers:
  Accept: application/json, */*
  X-Correlation-Id: oms-test-1718636521453
  Authorization: Bearer [REDACTED]
  Content-Type: application/json
  Content-Length: 248
Request Body: {"customerId":"cust-001","items":[...]}
──────────────────────────────────────────────────────────────
[OMS RESPONSE] 201 Created
◀ End:  14:32:01.821
⏱  Duration: 368 ms
Response Headers:
  content-type: application/json
  location: /api/v1/orders/ord-00123
══════════════════════════════════════════════════════════════
```

**Credential redaction rules (applied to console output only — not the proxied request):**

| Field | Logged Value |
|---|---|
| `Authorization: Bearer ...` | `Bearer [REDACTED]` |
| `Authorization: Basic ...` | `Basic [REDACTED]` |
| `X-API-Key` header | `[REDACTED]` |
| Form body `client_secret=...` | `client_secret=[REDACTED]` |
| Form body `password=...` | `password=[REDACTED]` |
| Form body `token=...` | `token=[REDACTED]` |
| Form body `api_key=...` | `api_key=[REDACTED]` |

Request body logging is limited to the first 300 characters.

### 3.6 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8081` | HTTPS server listening port |
| `LOG_HEADERS` | `true` | Set to `false` to suppress all proxy console logging |

**Usage examples:**

```bash
# Change port
PORT=9000 node server.js

# Disable console logging
LOG_HEADERS=false node server.js

# Windows CMD
set PORT=9000 && node server.js
set LOG_HEADERS=false && node server.js
```

---

## 4. Data Layer — Module Reference

### 4.1 `envs.js` — Environment Configuration

Exposes `window.OMS_ENVS` as a keyed object. The top-level keys (`dev`, `qa`, `uat`, `prod`) are the environment identifiers used throughout the UI.

#### `EnvConfig` Schema

```typescript
interface ToolLink {
  label: string;   // Display label with emoji prefix
  url:   string;   // Absolute URL
  cls?:  string;   // Optional CSS class (e.g. 'elk' for Kibana links)
}

interface EnvConfig {
  label:    string;      // Display label shown in the environment selector
  host:     string;      // Base host URL (used for display)
  apiBase:  string;      // Base URL prepended to all API paths
  oauthBase: string;     // Base URL prepended to all OAuth paths
  tools:    ToolLink[];  // Quick-access tool links rendered in the UI toolbar
  links:    ToolLink[];  // Additional resource links (currently unused in UI)
}
```

#### Configured Environments

| Key | Label | API Base | OAuth Base | Notable Tools |
|---|---|---|---|---|
| `dev` | DEV | `http://localhost:8080` | `http://localhost:8080` | Swagger UI, Spring Actuator, H2 Console |
| `qa` | QA | `https://oms-api-qa.acme-corp.com` | `https://auth-qa.acme-corp.com` | Kibana, Swagger, Grafana, Jira |
| `uat` | UAT | `https://oms-api-uat.acme-corp.com` | `https://auth-uat.acme-corp.com` | Kibana, Swagger, Grafana, Confluence |
| `prod` | PROD | `https://oms-api.acme-corp.com` | `https://auth.acme-corp.com` | Kibana, Grafana, PagerDuty, RunBook |

> **Note:** DEV environment uses the same host for both `apiBase` and `oauthBase` since the local OMS application serves both API and auth endpoints.

### 4.2 `clients.js` — API Client Configuration

Exposes `window.OMS_CLIENTS` keyed by environment. Each environment holds an array of `ClientConfig` objects representing registered API applications.

#### `ClientConfig` Schema

```typescript
interface ClientConfig {
  app_name:        string;    // Human-readable application name
  client_id:       string;    // OAuth 2.0 client identifier
  client_secret:   string;    // OAuth 2.0 client secret (REDACTED for PROD)
  api_key:         string;    // API Key credential (REDACTED for PROD)
  username:        string;    // Service account username for password grant
  password:        string;    // Service account password (REDACTED for PROD)
  app_type:        string;    // Auth mechanism: 'OAuth2' | 'API Key' | 'Basic Auth' | 'OAuth2 PKCE'
  grant_types:     string[];  // Supported OAuth grant types
  scopes:          string;    // Space-separated OAuth scopes
  redirect_uri:    string;    // OAuth redirect URI (empty for machine-to-machine clients)
  app_description: string;    // Purpose description
  contact:         string;    // Owning team email
}
```

#### Client Application Summary by Environment

**DEV — 6 registered applications:**

| App Name | Client ID | App Type | Grant Types |
|---|---|---|---|
| Order Portal Web App | `order-portal-dev-001` | OAuth2 | client_credentials, authorization_code, password |
| Fulfillment Service | `fulfillment-svc-dev-002` | OAuth2 | client_credentials |
| Partner Integration API | `partner-api-dev-003` | API Key | client_credentials |
| Mobile App (iOS/Android) | `mobile-app-dev-004` | OAuth2 PKCE | authorization_code |
| Admin Dashboard | `admin-dash-dev-005` | Basic Auth | password |
| Payment Gateway Connector | `payment-gw-dev-006` | OAuth2 | client_credentials |

**QA — 4 registered applications** (Order Portal, Fulfillment Service, Partner Integration API, Admin Dashboard)

**UAT — 3 registered applications** (Order Portal, Fulfillment Service, Partner Integration API)

**PROD — 2 registered applications** with secrets REDACTED (Order Portal, Fulfillment Service)

> **Security note:** PROD entries contain `*** REDACTED — use Vault ***` as placeholder values. Real production credentials must be retrieved from the approved secrets manager (Vault/PAM).

### 4.3 `users.js` — Test User Configuration

Exposes `window.OMS_USERS` keyed by environment. Each environment contains a `users` array and a `service_accounts` array.

#### `UserSet` Schema

```typescript
interface TestUser {
  username: string;  // Email-format username
  password: string;  // Plaintext test password (REDACTED for PROD)
  role:     string;  // Role label: Customer | Support Agent | Admin | Warehouse Ops | Read-Only
  note:     string;  // Context note about the test account
}

interface ServiceAccount {
  username: string;  // Email-format service account username
  password: string;  // Plaintext password (REDACTED for PROD)
  service:  string;  // Owning service name
  scope:    string;  // Space-separated OAuth scopes for this account
}

interface UserSet {
  users:            TestUser[];
  service_accounts: ServiceAccount[];
}
```

#### Test User Roles Reference

| Role | Access Level |
|---|---|
| Customer | Own orders, own profile, own addresses |
| Support Agent | All customer orders (read and update) |
| Admin | Full access including reports and admin operations |
| Warehouse Ops | Shipments and inventory management only |
| Read-Only | GET endpoints only — used for smoke tests |
| Break-Glass Admin | Emergency PROD access — requires approval workflow (PAM Vault) |

#### DEV Test Users (6 users + 3 service accounts)

| Username | Role | Notes |
|---|---|---|
| `john.doe@dev.acme-corp.com` | Customer | Standard customer with order history |
| `jane.smith@dev.acme-corp.com` | Customer | New customer — no prior orders |
| `oms.agent@dev.acme-corp.com` | Support Agent | Can view/update all orders |
| `oms.admin@dev.acme-corp.com` | Admin | Full permissions including reports |
| `warehouse@dev.acme-corp.com` | Warehouse Ops | Shipment and inventory access |
| `readonly@dev.acme-corp.com` | Read-Only | Used for smoke tests |

### 4.4 `apis.js` — API and Flow Definitions

Exposes three globals:

**`window.OMS_APIS`** — Array of `ApiGroup` objects defining every testable endpoint.

```typescript
interface ApiParam {
  key:   string;   // Parameter name
  value: string;   // Default value (may be empty string)
  type:  string;   // 'query' | 'path' | 'header'
}

interface ApiDefinition {
  method:         string;    // HTTP method
  path:           string;    // Path relative to group basePath (use {param} for path params)
  desc:           string;    // Human-readable description
  auth_type:      string;    // 'bearer' | 'client_creds' | 'api_key' | 'basic_auth' | 'none'
  sla:            number;    // Expected response time in seconds (used for SLA colour coding)
  label?:         string;    // Override display label (if different from desc)
  params?:        ApiParam[]; // Query/header parameters with defaults
  pathParams?:    string[];   // Path parameter names (extracted from path {placeholders})
  body_type?:     string;    // 'json' | 'form'
  body_template?: string;    // Default body content (JSON string or URL-encoded form)
}

interface ApiGroup {
  group:    string;           // Group display name with emoji prefix
  basePath: string;           // URL path prefix applied to all APIs in this group
  apis:     ApiDefinition[];  // Endpoint definitions
}
```

**`window.OMS_E2E_FLOWS`** — Array of `E2EFlow` objects.

```typescript
interface E2EFlowStep {
  step:      number;   // Step sequence number (1-based)
  label:     string;   // Step display name
  group:     string;   // The ApiGroup name this step belongs to
  path:      string;   // Full API path (including basePath)
  method:    string;   // HTTP method
  auth_type: string;   // Auth type for this step
  note:      string;   // Guidance note shown in the UI
}

interface E2EFlow {
  id:          string;         // Unique flow identifier (kebab-case)
  name:        string;         // Display name with emoji prefix
  description: string;         // Flow summary
  steps:       E2EFlowStep[];  // Ordered step definitions
}
```

**`window.OMS_TEST_SCENARIOS`** — Array of `TestScenarioCategory` objects.

```typescript
interface TestScenario {
  id:          string;    // Test case ID (e.g. TC-001)
  name:        string;    // Scenario name
  priority:    string;    // 'P0' | 'P1' | 'P2'
  tags:        string[];  // Classification tags
  description: string;    // Scenario description
}

interface TestScenarioCategory {
  category:  string;          // Category label with emoji prefix
  scenarios: TestScenario[];  // Test cases within category
}
```

---

## 5. API Definitions Reference

### 5.1 Auth APIs

**Base Path:** *(none — paths are absolute from oauthBase)*

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| POST | `/oauth/v1/token` | Client Credentials grant | none | 2s |
| POST | `/oauth/v1/token` | Password grant | none | 2s |
| POST | `/oauth/v1/token` | Refresh Token exchange | none | 2s |
| POST | `/oauth/v1/introspect` | Validate/inspect access token | basic_auth | 1s |
| POST | `/oauth/v1/revoke` | Revoke access or refresh token | basic_auth | 1s |
| GET | `/oauth/v1/.well-known/openid-configuration` | OpenID Connect discovery metadata | none | 1s |

**Body templates:**

| Endpoint | Form Body Template |
|---|---|
| Client Credentials | `grant_type=client_credentials&scope={scope}` |
| Password Grant | `grant_type=password&username={username}&password={password}&scope={scope}` |
| Refresh Token | `grant_type=refresh_token&refresh_token={refresh_token}` |
| Introspect | `token={token}&token_type_hint=access_token` |
| Revoke | `token={token}&token_type_hint=access_token` |

### 5.2 Order APIs

**Base Path:** `/api/v1`

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| GET | `/orders` | List orders (paginated) | bearer | 3s |
| POST | `/orders` | Create a new order | bearer | 3s |
| GET | `/orders/{orderId}` | Get order by ID | bearer | 2s |
| PUT | `/orders/{orderId}` | Update order (pre-submission) | bearer | 3s |
| DELETE | `/orders/{orderId}` | Cancel/delete pending order | bearer | 3s |
| GET | `/orders/{orderId}/items` | Get order line items | bearer | 2s |
| GET | `/orders/{orderId}/status` | Get order status and lifecycle history | bearer | 2s |
| POST | `/orders/{orderId}/submit` | Submit draft order for processing | bearer | 4s |
| POST | `/orders/{orderId}/cancel` | Cancel submitted order | bearer | 4s |
| GET | `/orders/{orderId}/audit-log` | Retrieve full audit trail | bearer | 3s |

**Query parameters for GET `/orders`:** `page` (default: 0), `size` (default: 20), `status`, `customerId`, `fromDate`, `toDate`

### 5.3 Customer APIs

**Base Path:** `/api/v1`

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| GET | `/customers` | Search/list customers | client_creds | 3s |
| POST | `/customers` | Create customer profile | client_creds | 3s |
| GET | `/customers/{customerId}` | Get customer by ID | bearer | 2s |
| PUT | `/customers/{customerId}` | Update customer profile | bearer | 3s |
| DELETE | `/customers/{customerId}` | GDPR-delete customer account | client_creds | 5s |
| GET | `/customers/{customerId}/orders` | Get all orders for a customer | bearer | 3s |
| GET | `/customers/{customerId}/addresses` | List saved addresses | bearer | 2s |
| POST | `/customers/{customerId}/addresses` | Add address to customer profile | bearer | 2s |

### 5.4 Product & Catalog APIs

**Base Path:** `/api/v1`

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| GET | `/products` | List/search products | api_key | 2s |
| GET | `/products/{productId}` | Get product by SKU or ID | api_key | 1s |
| GET | `/products/{productId}/variants` | Get product variants | api_key | 1s |
| GET | `/products/{productId}/pricing` | Get pricing with promotions | api_key | 2s |
| GET | `/categories` | Get category tree | api_key | 1s |
| GET | `/categories/{categoryId}/products` | List products in a category | api_key | 2s |

### 5.5 Inventory APIs

**Base Path:** `/api/v1`

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| GET | `/inventory` | List inventory across all warehouses | client_creds | 3s |
| GET | `/inventory/{productId}` | Get inventory for a product | client_creds | 1s |
| PUT | `/inventory/{productId}` | Update stock quantity | client_creds | 3s |
| POST | `/inventory/reserve` | Reserve inventory (soft hold) | bearer | 2s |
| POST | `/inventory/release` | Release inventory hold | bearer | 2s |
| GET | `/inventory/warehouses` | List warehouse locations | client_creds | 1s |
| GET | `/inventory/warehouses/{warehouseId}` | Get warehouse details and stock summary | client_creds | 2s |

### 5.6 Shipping & Fulfillment APIs

**Base Path:** `/api/v1`

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| POST | `/shipments` | Create shipment for confirmed order | client_creds | 4s |
| GET | `/shipments/{shipmentId}` | Get shipment details and tracking | bearer | 2s |
| GET | `/shipments/order/{orderId}` | Get all shipments for an order | bearer | 2s |
| PUT | `/shipments/{shipmentId}/status` | Update shipment status | client_creds | 3s |
| GET | `/tracking/{trackingNumber}` | Get real-time tracking events | api_key | 3s |
| GET | `/shipments/rates` | Get shipping rate quotes | bearer | 3s |

### 5.7 Payment APIs

**Base Path:** `/api/v1`

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| POST | `/payments/authorize` | Authorize payment (hold funds) | bearer | 5s |
| POST | `/payments/capture` | Capture authorized payment | bearer | 5s |
| POST | `/payments/refund` | Issue full or partial refund | bearer | 5s |
| GET | `/payments/{paymentId}` | Get payment details | bearer | 2s |
| GET | `/payments/order/{orderId}` | Get all payments for an order | bearer | 2s |
| POST | `/payments/void` | Void authorized uncaptured payment | bearer | 4s |

### 5.8 Returns & RMA APIs

**Base Path:** `/api/v1`

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| POST | `/returns` | Create Return Merchandise Authorization | bearer | 4s |
| GET | `/returns` | List all return requests | client_creds | 3s |
| GET | `/returns/{returnId}` | Get RMA details and status | bearer | 2s |
| PUT | `/returns/{returnId}/status` | Update RMA status | client_creds | 3s |
| POST | `/returns/{returnId}/label` | Generate prepaid return shipping label | bearer | 5s |

### 5.9 Reports & Analytics APIs

**Base Path:** `/api/v1`

| Method | Path | Description | Auth Type | SLA |
|---|---|---|---|---|
| GET | `/reports/orders/summary` | Order volume and revenue summary | basic_auth | 5s |
| GET | `/reports/inventory/turnover` | Inventory turnover rate report | basic_auth | 8s |
| GET | `/reports/fulfillment/sla` | Fulfillment SLA compliance report | basic_auth | 8s |
| GET | `/reports/returns/rate` | Return rate analysis by product | basic_auth | 6s |
| GET | `/health` | OMS application health check | none | 1s |
| GET | `/health/detailed` | Detailed health (DB, cache, downstream) | basic_auth | 3s |

---

## 6. Authentication Type Reference

The `auth_type` field on each API definition controls which credential the UI selects and which header the proxy injects.

| `auth_type` Value | Credential Source | Header Injected | Typical Use Case |
|---|---|---|---|
| `bearer` | Access Token field (green indicator) | `Authorization: Bearer <token>` | User-context API calls requiring a user access token |
| `client_creds` | Client Credentials Token field (blue indicator); falls back to Access Token if empty | `Authorization: Bearer <token>` | Machine-to-machine service calls |
| `api_key` | API Key field (yellow indicator) | `X-API-Key: <key>` | Catalog and tracking read APIs |
| `basic_auth` | Basic Auth field (purple indicator, format: `user:pass`) | `Authorization: Basic <base64>` | Admin/reports APIs, token introspection |
| `none` | No credential | *(no auth header added)* | Public endpoints, OAuth token acquisition |

### Auth Quick Action Buttons

Each API group panel exposes four auth quick-action buttons that auto-populate the corresponding token fields:

| Button | Grant / Action | Body Template |
|---|---|---|
| 🤝 Client Credentials | `client_credentials` grant | `grant_type=client_credentials&scope={scope}` |
| 🔐 Password Grant | `password` grant | `grant_type=password&username={u}&password={p}&scope={scope}` |
| ♻️ Refresh Token | `refresh_token` grant | `grant_type=refresh_token&refresh_token={rt}` |
| 🔍 Introspect | Token introspection | `token={token}&token_type_hint=access_token` |

On success, these buttons auto-populate the relevant token input field in the UI.

---

## 7. Proxy Request/Response Contract

This section provides a concise integration reference for the `/api/proxy` endpoint, useful when building automation or extending the UI.

### Request

```
POST https://localhost:8081/api/proxy
Content-Type: application/json

{
  "method":    "POST",
  "url":       "https://oms-api-qa.acme-corp.com/api/v1/orders",
  "token":     "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "jsonBody": {
    "customerId": "cust-001",
    "items": [{ "productId": "prod-123", "quantity": 1, "unitPrice": 29.99 }]
  }
}
```

### Response

```json
{
  "status":     201,
  "statusText": "Created",
  "headers": {
    "content-type": "application/json",
    "location":     "/api/v1/orders/ord-00789",
    "x-request-id": "req-abc123"
  },
  "body":     "{\"orderId\":\"ord-00789\",\"status\":\"DRAFT\"}",
  "duration": 312
}
```

### OAuth Form Body Example

```json
{
  "method":    "POST",
  "url":       "https://auth-qa.acme-corp.com/oauth/v1/token",
  "basicAuth": "order-portal-qa-001:qa-secret-orderportal-ABC123XYZ",
  "formBody":  "grant_type=client_credentials&scope=orders:read orders:write"
}
```

### SLA Colour Coding

The UI colours the duration badge based on the API's configured `sla` value:

| Condition | Badge Colour |
|---|---|
| `duration <= sla * 1000 ms` | Green |
| `duration <= sla * 1500 ms` | Yellow (within 1.5× SLA) |
| `duration > sla * 1500 ms` | Red (SLA breached) |

---

## 8. E2E Flow Definitions

### Flow 1 — Happy Path: Full Order Lifecycle (12 steps)

**ID:** `happy-path-order`

| Step | Label | Method | Path | Auth Type | Key Action |
|---|---|---|---|---|---|
| 1 | Get Access Token | POST | `/oauth/v1/token` | none | client_credentials grant; store `access_token` |
| 2 | Search Products | GET | `/api/v1/products` | api_key | Find a product; store `productId` |
| 3 | Check Inventory | GET | `/api/v1/inventory/{productId}` | client_creds | Confirm stock availability |
| 4 | Create Customer | POST | `/api/v1/customers` | client_creds | Create or find customer; store `customerId` |
| 5 | Create Order | POST | `/api/v1/orders` | bearer | Create draft order; store `orderId` |
| 6 | Reserve Inventory | POST | `/api/v1/inventory/reserve` | bearer | Soft hold on stock |
| 7 | Authorize Payment | POST | `/api/v1/payments/authorize` | bearer | Place payment hold; store `authorizationId` |
| 8 | Submit Order | POST | `/api/v1/orders/{orderId}/submit` | bearer | Transition order to PROCESSING |
| 9 | Capture Payment | POST | `/api/v1/payments/capture` | bearer | Capture authorized funds |
| 10 | Create Shipment | POST | `/api/v1/shipments` | client_creds | Warehouse pick/pack/ship task |
| 11 | Update Shipment Status | PUT | `/api/v1/shipments/{shipmentId}/status` | client_creds | Mark SHIPPED with tracking number |
| 12 | Track Shipment | GET | `/api/v1/tracking/{trackingNumber}` | api_key | Verify tracking events created |

### Flow 2 — Order Cancellation Flow (6 steps)

**ID:** `order-cancellation`

| Step | Label | Method | Path | Auth Type | Key Action |
|---|---|---|---|---|---|
| 1 | Get Access Token | POST | `/oauth/v1/token` | none | Authenticate |
| 2 | Get Order Details | GET | `/api/v1/orders/{orderId}` | bearer | Confirm order is in cancellable status |
| 3 | Cancel Order | POST | `/api/v1/orders/{orderId}/cancel` | bearer | Request cancellation |
| 4 | Verify Inventory Released | GET | `/api/v1/inventory/{productId}` | client_creds | Confirm hold was released |
| 5 | Void Payment | POST | `/api/v1/payments/void` | bearer | Void authorized payment |
| 6 | Check Order Status | GET | `/api/v1/orders/{orderId}/status` | bearer | Confirm final status is CANCELLED |

### Flow 3 — Returns & Refund Flow (7 steps)

**ID:** `returns-flow`

| Step | Label | Method | Path | Auth Type | Key Action |
|---|---|---|---|---|---|
| 1 | Get Access Token | POST | `/oauth/v1/token` | none | Authenticate |
| 2 | Get Order Details | GET | `/api/v1/orders/{orderId}` | bearer | Retrieve `orderItemId` |
| 3 | Create RMA | POST | `/api/v1/returns` | bearer | Create return authorization; store `returnId` |
| 4 | Generate Return Label | POST | `/api/v1/returns/{returnId}/label` | bearer | Generate prepaid label for customer |
| 5 | Update RMA — Received | PUT | `/api/v1/returns/{returnId}/status` | client_creds | Warehouse marks return as RECEIVED |
| 6 | Issue Refund | POST | `/api/v1/payments/refund` | bearer | Refund to original payment method |
| 7 | Update RMA — Refunded | PUT | `/api/v1/returns/{returnId}/status` | client_creds | Mark return as REFUNDED |

---

## 9. Test Scenario Definitions

### Category: Happy Path Scenarios (TC-001 to TC-010)

| ID | Name | Priority | Tags |
|---|---|---|---|
| TC-001 | Create and submit single-item order | P0 | orders, smoke |
| TC-002 | Create and submit multi-item order | P0 | orders, smoke |
| TC-003 | OAuth client_credentials token flow | P0 | auth, smoke |
| TC-004 | OAuth password grant token flow | P1 | auth |
| TC-005 | Token refresh flow | P1 | auth |
| TC-006 | API Key authentication | P1 | auth, catalog |
| TC-007 | Basic auth for admin APIs | P1 | auth, admin |
| TC-008 | Full order lifecycle (E2E) | P0 | e2e, orders, regression |
| TC-009 | Customer profile CRUD | P1 | customers |
| TC-010 | Product catalog search and filter | P1 | catalog |

### Category: Negative / Error Scenarios (TC-101 to TC-110)

| ID | Name | Priority | Tags | Expected Response |
|---|---|---|---|---|
| TC-101 | Order with expired access token | P0 | auth, security | HTTP 401 |
| TC-102 | Order with missing required fields | P0 | orders, validation | HTTP 400 with validation details |
| TC-103 | Get non-existent order | P1 | orders | HTTP 404 |
| TC-104 | Order quantity exceeds inventory | P0 | orders, inventory | HTTP 409 Conflict |
| TC-105 | Cancel already-shipped order | P1 | orders | HTTP 422 Unprocessable Entity |
| TC-106 | Duplicate order submission | P1 | orders, idempotency | Idempotency key prevents duplicate |
| TC-107 | Payment authorization failure | P0 | payments | Order rollback |
| TC-108 | Invalid API key | P0 | auth, security | HTTP 403 Forbidden |
| TC-109 | GDPR delete — active orders check | P1 | customers, compliance | Deletion blocked |
| TC-110 | Rate limiting enforcement | P2 | performance, security | HTTP 429 with Retry-After header |

### Category: Performance Scenarios (TC-201 to TC-204)

| ID | Name | Priority | Tags | SLA Target |
|---|---|---|---|---|
| TC-201 | GET /orders response time SLA | P1 | performance, sla | 3s under normal load |
| TC-202 | POST /orders throughput | P1 | performance | 100 req/min without degradation |
| TC-203 | Token endpoint latency | P1 | performance, auth | 2s SLA |
| TC-204 | Inventory reserve under concurrency | P0 | performance, inventory | No overselling at 50 concurrent requests |

### Category: Security Scenarios (TC-301 to TC-304)

| ID | Name | Priority | Tags |
|---|---|---|---|
| TC-301 | SQL Injection in search params | P0 | security |
| TC-302 | Cross-tenant data isolation | P0 | security, multi-tenant |
| TC-303 | Sensitive data in logs | P1 | security, compliance |
| TC-304 | Token scope enforcement | P0 | security, auth |

---

## 10. Environment Configurations

### DEV

| Parameter | Value |
|---|---|
| API Base | `http://localhost:8080` |
| OAuth Base | `http://localhost:8080` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| Actuator Health | `http://localhost:8080/actuator/health` |
| H2 Console | `http://localhost:8080/h2-console` |

### QA

| Parameter | Value |
|---|---|
| API Base | `https://oms-api-qa.acme-corp.com` |
| OAuth Base | `https://auth-qa.acme-corp.com` |
| Kibana | `https://kibana-qa.acme-corp.com/app/discover` |
| Grafana | `https://grafana-qa.acme-corp.com` |
| Jira | `https://jira.acme-corp.com/projects/OMS` |

### UAT

| Parameter | Value |
|---|---|
| API Base | `https://oms-api-uat.acme-corp.com` |
| OAuth Base | `https://auth-uat.acme-corp.com` |
| Kibana | `https://kibana-uat.acme-corp.com/app/discover` |
| Grafana | `https://grafana-uat.acme-corp.com` |
| Release Notes | `https://confluence.acme-corp.com/display/OMS/UAT+Release` |

### PROD

| Parameter | Value |
|---|---|
| API Base | `https://oms-api.acme-corp.com` |
| OAuth Base | `https://auth.acme-corp.com` |
| Kibana | `https://kibana.acme-corp.com/app/discover` |
| Grafana | `https://grafana.acme-corp.com/d/oms-dashboard` |
| PagerDuty | `https://acme-corp.pagerduty.com/incidents` |
| RunBook | `https://confluence.acme-corp.com/display/OMS/Production+RunBook` |

---

## 11. Client Application Registry

### Scope Reference

| Scope | Access Granted |
|---|---|
| `orders:read` | Read orders and order items |
| `orders:write` | Create, update, cancel orders |
| `orders:*` | Full order access |
| `customers:read` | Read customer profiles |
| `customers:write` | Create and update customer profiles |
| `customers:*` | Full customer access |
| `inventory:read` | Read stock levels |
| `inventory:write` | Update stock, reserve, release |
| `shipments:read` | Read shipment and tracking data |
| `shipments:write` | Create and update shipments |
| `payments:read` | Read payment transactions |
| `payments:write` | Authorize, capture, void, refund |
| `products:read` | Read product catalog |
| `reports:*` | All reporting and analytics |

### Grant Type Reference

| Grant Type | Use Case |
|---|---|
| `client_credentials` | Machine-to-machine (service-to-service) with no user context |
| `authorization_code` | User-delegated access via browser redirect (OAuth 2.0 Code flow) |
| `password` | Resource owner password credentials (legacy; testing only) |

---

## 12. OMS Order Lifecycle State Machine

```
                  +-------+
                  | DRAFT |
                  +---+---+
                      | POST /orders/{id}/submit
                      v
               +-----------+
               | SUBMITTED |
               +-----------+
                      |
                      v
               +------------+
               | PROCESSING |
               +------------+
                      |
                      v
               +-----------+
               | FULFILLED |
               +-----------+
                      |
                      v
               +---------+        +--------+
               | SHIPPED |------->|DELIVERED|
               +---------+        +--------+

Cancellation is possible from DRAFT, SUBMITTED, or PROCESSING:

    DRAFT / SUBMITTED / PROCESSING --> CANCELLED
    (with inventory release + payment void where applicable)
```

**Valid state transitions via API:**

| From State | To State | API Endpoint |
|---|---|---|
| *(new)* | DRAFT | `POST /orders` |
| DRAFT | SUBMITTED | `POST /orders/{id}/submit` |
| DRAFT | CANCELLED | `DELETE /orders/{id}` |
| SUBMITTED | CANCELLED | `POST /orders/{id}/cancel` |
| PROCESSING | CANCELLED | `POST /orders/{id}/cancel` |
| PROCESSING | FULFILLED | *(internal fulfillment service)* |
| FULFILLED | SHIPPED | `PUT /shipments/{id}/status` (SHIPPED) |
| SHIPPED | DELIVERED | `PUT /shipments/{id}/status` (DELIVERED) |

---

## 13. Extending the Tool

### 13.1 Adding a New Environment

Edit `envs.js` and add a new key to `window.OMS_ENVS`:

```javascript
staging: {
    label: 'STAGING',
    host: 'https://oms-api-staging.acme-corp.com',
    apiBase: 'https://oms-api-staging.acme-corp.com',
    oauthBase: 'https://auth-staging.acme-corp.com',
    tools: [
        { label: 'Kibana', url: 'https://kibana-staging.acme-corp.com/app/discover', cls: 'elk' },
        { label: 'Grafana', url: 'https://grafana-staging.acme-corp.com' }
    ],
    links: []
}
```

Then add corresponding entries in `clients.js` under `window.OMS_CLIENTS.staging` and in `users.js` under `window.OMS_USERS.staging`.

### 13.2 Adding a New API Client

Edit `clients.js` and append an object to the target environment array:

```javascript
{
    app_name: 'Notification Service',
    client_id: 'notification-svc-qa-007',
    client_secret: 'qa-secret-notification-abc789',
    api_key: 'ak-qa-notification-X1Y2Z3',
    username: 'notification-svc@qa.acme-corp.com',
    password: 'NotifSvc@QA#007',
    app_type: 'OAuth2',
    grant_types: ['client_credentials'],
    scopes: 'orders:read customers:read',
    redirect_uri: '',
    app_description: 'Outbound notification microservice',
    contact: 'team-notifications@acme-corp.com'
}
```

### 13.3 Adding a New API Group or Endpoint

Edit `apis.js`. To add a new group, append to `window.OMS_APIS`:

```javascript
{
    group: 'Notification APIs',
    basePath: '/api/v1',
    apis: [
        {
            method: 'POST',
            path: '/notifications/send',
            desc: 'Send a push/email notification',
            auth_type: 'client_creds',
            sla: 3,
            body_type: 'json',
            body_template: JSON.stringify({
                customerId: '{customerId}',
                channel: 'EMAIL',
                template: 'ORDER_CONFIRMATION',
                orderId: '{orderId}'
            }, null, 2)
        },
        {
            method: 'GET',
            path: '/notifications/{notificationId}',
            desc: 'Get notification delivery status',
            auth_type: 'client_creds',
            sla: 1,
            pathParams: ['notificationId']
        }
    ]
}
```

To add a single endpoint to an existing group, locate the group's `apis` array and append an `ApiDefinition` object following the same schema.

### 13.4 Adding Test Users

Edit `users.js` and append to the relevant environment's `users` or `service_accounts` array:

```javascript
// New test user
{ username: 'fraud.checker@qa.acme-corp.com', password: 'Fraud@QA#2024', role: 'Fraud Analyst', note: 'Fraud review queue access' }

// New service account
{ username: 'svc-notifications@qa.acme-corp.com', password: 'SvcNotif@QA#004', service: 'Notification Service', scope: 'orders:read customers:read' }
```

### 13.5 Adding an E2E Flow

Edit `apis.js` and append to `window.OMS_E2E_FLOWS`:

```javascript
{
    id: 'guest-checkout',
    name: 'Guest Checkout Flow',
    description: 'Order placement without customer account creation',
    steps: [
        { step: 1, label: 'Get API Token', group: 'Auth APIs', path: '/oauth/v1/token', method: 'POST', auth_type: 'none', note: 'Client credentials for guest checkout.' },
        { step: 2, label: 'Search Product', group: 'Product & Catalog APIs', path: '/api/v1/products', method: 'GET', auth_type: 'api_key', note: 'Find target product.' },
        { step: 3, label: 'Create Order (Guest)', group: 'Order APIs', path: '/api/v1/orders', method: 'POST', auth_type: 'bearer', note: 'No customerId required for guest.' }
    ]
}
```

### 13.6 Adding Test Scenarios

Edit `apis.js` and append scenarios to an existing category or add a new category to `window.OMS_TEST_SCENARIOS`:

```javascript
{
    category: 'Integration Scenarios',
    scenarios: [
        {
            id: 'TC-401',
            name: 'Webhook delivery on order status change',
            priority: 'P1',
            tags: ['integration', 'webhooks'],
            description: 'Verify webhook fires when order transitions from PROCESSING to FULFILLED.'
        }
    ]
}
```

---

## 14. TLS Certificate Management

The `certs/` directory contains a self-signed certificate used exclusively for local HTTPS transport.

### Certificate Files

| File | Purpose |
|---|---|
| `certs/cert.pem` | X.509 certificate (public) — presented to the browser |
| `certs/key.pem` | RSA private key (unencrypted) — used by the server |

### Regenerating the Self-Signed Certificate

If the certificate expires or needs to be replaced, use OpenSSL:

```bash
openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem \
  -days 3650 -nodes -subj "/CN=localhost"
```

This generates a 2048-bit RSA key pair valid for 10 years with `CN=localhost`. The browser will still show a certificate warning because the certificate is not issued by a trusted CA; accept the warning to proceed.

### Using a Trusted Certificate (Optional)

To use a certificate signed by an internal CA or Let's Encrypt for a non-localhost deployment, replace `certs/cert.pem` and `certs/key.pem` with the new certificate and private key files in PEM format. No code changes are required.

---

## 15. Security Considerations

This tool is designed for **internal use in non-production environments**. The following security properties must be understood before use:

| Consideration | Detail |
|---|---|
| Self-signed certificate | Browser will warn on first visit. Accept manually. Do not deploy with this cert in production. |
| CORS policy | The server accepts requests from any origin (`*`). This is intentional for a local testing tool. Do not expose the server publicly. |
| `rejectUnauthorized: false` | The proxy does not validate upstream TLS certificates. Acceptable for internal test environments. |
| Plaintext credentials in JS files | `clients.js` and `users.js` contain test credentials in plaintext. PROD secrets are REDACTED and must come from Vault/PAM. Never commit real production secrets to these files. |
| No authentication on the tool itself | The testing tool has no login mechanism. Access is controlled by network — run only on trusted machines or behind a VPN. |
| Console log redaction | Credentials are redacted in console output, but the server process memory contains plaintext values during execution. |
| `LOG_HEADERS=false` | Set this environment variable in environments where console logs may be captured or forwarded to external systems. |

---

## 16. Startup Scripts Reference

### `run.cmd` (Windows)

```cmd
@echo off
cd /d "%~dp0"
node server.js
pause
```

- Changes directory to the script's own location (`%~dp0`) before starting.
- `pause` keeps the terminal window open after the server exits so error messages remain visible.

### `run.sh` (macOS / Linux)

```bash
#!/bin/bash
cd "$(dirname "$0")"
node server.js
```

- Uses `$(dirname "$0")` to resolve the script's directory, making it safe to call from any working directory.
- No `pause` equivalent — the terminal remains open as long as the server process runs.

### Direct Invocation

```bash
node server.js
```

Must be run from the `oms-testing/` directory (where `certs/` is a subdirectory), or the server will fail to read the PEM files.

### Verifying the Server is Running

After startup, the console prints:

```
✅ OMS Testing Tool running at: https://localhost:8081/
   Accept self-signed cert warning to proceed.
```

If the port is already in use, Node.js will throw `EADDRINUSE`. Change the port with:

```bash
PORT=9000 node server.js   # macOS/Linux
set PORT=9000 && node server.js   # Windows CMD
```

---

*End of Technical Reference — OMS API Testing Tool v1.0*
