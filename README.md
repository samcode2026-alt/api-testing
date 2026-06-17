# OMS API Testing Tool

A comprehensive, browser-based testing interface for Order Management System (OMS) RESTful APIs. Built as a standalone single-page application served over HTTPS with a Node.js proxy backend.

---

## Features

### 🖥️ Application Tab
- **Per-environment client management** — DEV, QA, UAT, PROD environments with separate credential sets
- **App Details** — Select any configured API application to view client_id, client_secret, API keys, username/password with masked fields and copy buttons
- **OMS APIs panel** — All API groups organized in sub-tabs with expandable curl commands, inline parameter inputs, Execute buttons, and Raw/Table response views
- **All Apps** — Searchable table of all configured API clients/applications
- **Test Users** — Username/password credentials for test users and service accounts

### 🔑 Auth Quick Actions (per API group panel)
- **🤝 Client Credentials** — OAuth 2.0 `client_credentials` grant (machine-to-machine)
- **🔐 Password Grant** — OAuth 2.0 `password` grant (resource owner)
- **♻️ Refresh Token** — Exchange refresh token for new access token
- **🔍 Introspect** — Validate/inspect an existing access token
- Auto-populates the Access Token field upon successful execution

### 🔄 E2E Flows Tab
Three pre-built end-to-end test flows with step-by-step execution:
1. **🛍️ Happy Path** — Full order lifecycle (12 steps: Auth → Product → Inventory → Customer → Order → Payment → Fulfill → Track)
2. **❌ Cancellation Flow** — Cancel order with inventory release and payment void
3. **↩️ Returns Flow** — RMA creation through refund completion

Each step shows: method badge, path, auth type, notes, and Run/View buttons.

### 📋 Test Scenarios Tab
Pre-defined test cases organized by category:
- 🟢 Happy Path Scenarios (TC-001 to TC-010)
- 🔴 Negative / Error Scenarios (TC-101 to TC-110)
- ⚡ Performance Scenarios (TC-201 to TC-204)
- 🔒 Security Scenarios (TC-301 to TC-304)

Each scenario includes ID, name, priority (P0/P1/P2), tags, and description.

### 🚀 Run All (inside OMS APIs → Run All sub-tab)
- Select individual or all APIs with checkboxes
- Run selected APIs sequentially with live status/duration display
- SLA color coding (green/yellow/red based on configured SLA thresholds)
- Per-row Run (▶) and View (👁) buttons
- Summary showing pass/fail counts

---

## API Groups & Authentication Types

| Group | Auth Type | Description |
|-------|-----------|-------------|
| 🔐 Auth APIs | none / basic_auth | OAuth 2.0 token endpoints |
| 📦 Order APIs | bearer | Order CRUD and lifecycle operations |
| 👤 Customer APIs | bearer / client_creds | Customer profile management |
| 🏷️ Product & Catalog APIs | api_key | Product search and catalog browsing |
| 🏭 Inventory APIs | client_creds / bearer | Stock levels and warehouse management |
| 🚚 Shipping & Fulfillment APIs | client_creds / bearer / api_key | Shipments and tracking |
| 💳 Payment APIs | bearer | Payment authorize/capture/refund/void |
| ↩️ Returns & RMA APIs | bearer / client_creds | Return merchandise authorizations |
| 📊 Reports & Analytics APIs | basic_auth | Business analytics and health checks |

---

## Quick Start

### Prerequisites
- Node.js 14 or higher

### Running the Server

**Windows:**
```cmd
cd oms-testing
run.cmd
```

**macOS / Linux:**
```bash
cd oms-testing
chmod +x run.sh
./run.sh
```

**Direct:**
```bash
cd oms-testing
node server.js
```

### Accessing the Tool
Open your browser and navigate to:
```
https://localhost:3444/
```
> **Note:** Accept the self-signed certificate warning to proceed. The certificate is only used for local HTTPS transport.

---

## Project Structure

```
oms-testing/
├── index.html          # Main single-page application UI
├── oms.css             # Styles (dark-themed cURL blocks, auth badges, etc.)
├── server.js           # HTTPS proxy server (port 3444)
├── envs.js             # Environment configurations (DEV/QA/UAT/PROD)
├── clients.js          # API client/application credentials per environment
├── apis.js             # API definitions, E2E flows, and test scenarios
├── users.js            # Test user accounts and service accounts
├── run.cmd             # Windows startup script
├── run.sh              # macOS/Linux startup script
├── certs/
│   ├── cert.pem        # Self-signed TLS certificate
│   └── key.pem         # TLS private key
└── README.md           # This file
```

---

## Configuration Guide

### Adding a New Environment (`envs.js`)
```javascript
myenv: {
    label: 'MYENV',
    host: 'https://oms-api-myenv.example.com',
    apiBase: 'https://oms-api-myenv.example.com',
    oauthBase: 'https://auth-myenv.example.com',
    tools: [
        { label: '📊 Kibana', url: 'https://kibana-myenv.example.com', cls: 'elk' }
    ],
    links: []
}
```

### Adding a New API Client (`clients.js`)
```javascript
{
    app_name: 'My New Service',
    client_id: 'my-service-env-001',
    client_secret: 'my-secret-value',
    api_key: 'ak-env-myservice-xxxxx',
    username: 'my-svc@env.example.com',
    password: 'My@Pass123',
    app_type: 'OAuth2',
    grant_types: ['client_credentials'],
    scopes: 'orders:read orders:write',
    redirect_uri: '',
    app_description: 'My new service description',
    contact: 'team@example.com'
}
```

### Adding a New API Group (`apis.js`)
```javascript
{
    group: '🔧 My New APIs',
    basePath: '/api/v1',
    apis: [
        {
            method: 'GET',
            path: '/my-resource',
            desc: 'List all resources',
            auth_type: 'bearer',  // bearer | client_creds | api_key | basic_auth | none
            sla: 3,
            params: [
                { key: 'page', value: '0', type: 'query' },
                { key: 'size', value: '20', type: 'query' }
            ]
        },
        {
            method: 'GET',
            path: '/my-resource/{resourceId}',
            desc: 'Get resource by ID',
            auth_type: 'bearer',
            sla: 2,
            pathParams: ['resourceId']
        }
    ]
}
```

---

## Proxy Server

The Node.js proxy server (`server.js`) handles:
- **HTTPS** with self-signed certificates (port 3444)
- **Request proxying** — forwards requests to target APIs with proper auth headers
- **Auth header injection** — Bearer token, API Key (`X-API-Key`), or Basic Auth
- **JSON request bodies** — for POST/PUT with `Content-Type: application/json`
- **Form bodies** — for OAuth token endpoints (`application/x-www-form-urlencoded`)
- **Correlation IDs** — auto-injects `X-Correlation-Id` header on all proxied requests
- **Request/response logging** — detailed console output (disable with `LOG_HEADERS=false`)
- **Static file serving** — serves the UI files directly

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3444` | HTTPS server port |
| `LOG_HEADERS` | `true` | Enable detailed request/response logging |

---

## Auth Type Reference

| `auth_type` value | Credential Used | Header Sent |
|-------------------|-----------------|-------------|
| `bearer` | Access Token field (🟢) | `Authorization: Bearer <token>` |
| `client_creds` | Client Creds Token field (🔵), falls back to Access Token | `Authorization: Bearer <token>` |
| `api_key` | API Key field (🟡) | `X-API-Key: <key>` |
| `basic_auth` | Basic Auth field (🟣, format: `user:pass`) | `Authorization: Basic <base64>` |
| `none` | No credential | *(no auth header)* |

---

## OMS Order Lifecycle

```
DRAFT ──► SUBMITTED ──► PROCESSING ──► FULFILLED ──► SHIPPED ──► DELIVERED
   │           │              │
   ▼           ▼              ▼
CANCELLED   CANCELLED     CANCELLED (with inventory release + payment void)
```

---

## Test User Roles

| Role | Access Level |
|------|-------------|
| Customer | Own orders, profile, addresses |
| Support Agent | All customer orders (read/update) |
| Admin | Full access including reports |
| Warehouse Ops | Shipments and inventory only |
| Read-Only | GET endpoints only (smoke testing) |
| Service Account | Programmatic API access (specific scopes) |
