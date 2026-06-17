# OMS API Testing Tool — User Guide

**Version:** 1.0  
**Audience:** QA Engineers, Business Analysts, Functional Testers, Support Teams  
**Last Updated:** June 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Prerequisites and Setup](#2-prerequisites-and-setup)
3. [Launching the Tool](#3-launching-the-tool)
4. [Navigating the Interface](#4-navigating-the-interface)
5. [Application Tab](#5-application-tab)
   - 5.1 [Selecting an Environment](#51-selecting-an-environment)
   - 5.2 [App Details Panel](#52-app-details-panel)
   - 5.3 [OMS APIs Panel](#53-oms-apis-panel)
   - 5.4 [All Apps Panel](#54-all-apps-panel)
   - 5.5 [Test Users Panel](#55-test-users-panel)
6. [Getting an Access Token](#6-getting-an-access-token)
7. [Executing an API Call](#7-executing-an-api-call)
8. [Understanding API Responses](#8-understanding-api-responses)
9. [Run All — Batch Execution](#9-run-all--batch-execution)
10. [E2E Flows Tab](#10-e2e-flows-tab)
11. [Test Scenarios Tab](#11-test-scenarios-tab)
12. [Step-by-Step Workflows](#12-step-by-step-workflows)
    - 12.1 [Workflow: Get an OAuth Token and Call an API](#121-workflow-get-an-oauth-token-and-call-an-api)
    - 12.2 [Workflow: Run the Happy Path Order Lifecycle](#122-workflow-run-the-happy-path-order-lifecycle)
    - 12.3 [Workflow: Test a Negative Scenario](#123-workflow-test-a-negative-scenario)
    - 12.4 [Workflow: Smoke Test All APIs](#124-workflow-smoke-test-all-apis)
13. [Credential and Token Reference](#13-credential-and-token-reference)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Introduction

The **OMS API Testing Tool** is a browser-based interface for interactively testing all Order Management System (OMS) RESTful APIs across multiple environments — DEV, QA, UAT, and PROD.

It is designed for:

- **QA Engineers** running functional, regression, and E2E test scenarios
- **Business Analysts** validating business flows and OMS behaviour
- **Support Teams** investigating issues by replaying API calls
- **Developers** debugging integration issues across environments

### What You Can Do With This Tool

| Capability | Where |
|---|---|
| Execute any OMS API call with the correct authentication | Application Tab → OMS APIs |
| View pre-configured application credentials per environment | Application Tab → App Details |
| Obtain OAuth tokens (client credentials, password grant, refresh) | Auth Quick Actions |
| Run complete end-to-end order lifecycle flows step by step | E2E Flows Tab |
| Browse and reference all defined test scenarios | Test Scenarios Tab |
| Batch-run multiple APIs sequentially with SLA monitoring | OMS APIs → Run All sub-tab |
| View raw JSON responses and formatted table output | Response panel |
| Access Kibana, Grafana, Swagger, and other environment tools | Environment toolbar links |

---

## 2. Prerequisites and Setup

### What You Need

- **Node.js 14 or higher** installed on your machine
  - Verify: open a terminal and run `node --version`
  - Download from: https://nodejs.org
- The `oms-testing` project folder

### No Additional Installation Required

This tool uses only Node.js built-in modules. There is no `npm install` step.

---

## 3. Launching the Tool

### Windows

1. Open the `oms-testing` folder in File Explorer
2. Double-click **`run.cmd`**
3. A terminal window will open and display the startup message

### macOS / Linux

1. Open a terminal
2. Navigate to the `oms-testing` directory:
   ```bash
   cd /path/to/oms-testing
   chmod +x run.sh
   ./run.sh
   ```

### Direct Launch (Any Platform)

```bash
cd /path/to/oms-testing
node server.js
```

### Accessing the Tool in Your Browser

Once the server is running, you will see:

```
✅ OMS Testing Tool running at: https://localhost:8081/
   Accept self-signed cert warning to proceed.
```

Open your browser and go to:

```
https://localhost:8081/
```

### Accepting the Certificate Warning

Because the tool uses a self-signed TLS certificate for local HTTPS, your browser will show a security warning on first visit.

**Chrome / Edge:**
1. Click **Advanced**
2. Click **Proceed to localhost (unsafe)**

**Firefox:**
1. Click **Advanced**
2. Click **Accept the Risk and Continue**

**Safari:**
1. Click **Show Details**
2. Click **visit this website**
3. Click **Visit Website** in the confirmation dialog

> This warning is expected and safe — the certificate is only used for local transport between your browser and the local server. No data leaves your machine through this certificate.

---

## 4. Navigating the Interface

The tool has three main tabs at the top of the page:

| Tab | Purpose |
|---|---|
| **Application** | Environment selector, credentials, API execution, test users |
| **E2E Flows** | Step-by-step end-to-end test flows |
| **Test Scenarios** | Reference catalogue of all test cases |

Within the **Application** tab, a secondary row of sub-tabs provides access to:

| Sub-tab | Content |
|---|---|
| **App Details** | Credentials for the selected application/client |
| **OMS APIs** | All API groups with execution panels |
| **All Apps** | Searchable table of all registered applications |
| **Test Users** | Username/password table for test accounts |

At the top of every page, an **environment selector** (DEV / QA / UAT / PROD) and a **quick-link toolbar** for environment-specific tools (Kibana, Grafana, Swagger, etc.) are always visible.

---

## 5. Application Tab

### 5.1 Selecting an Environment

The environment selector is displayed at the top of the screen. Click the environment label to switch:

| Environment | Target System | When to Use |
|---|---|---|
| **DEV** | `http://localhost:8080` | Local development testing |
| **QA** | `https://oms-api-qa.acme-corp.com` | Functional and regression testing |
| **UAT** | `https://oms-api-uat.acme-corp.com` | Acceptance testing before releases |
| **PROD** | `https://oms-api.acme-corp.com` | Production monitoring and break-glass investigation |

When you switch environment, all API URLs, credentials, and tool links update automatically.

> **PROD Warning:** Production credentials are REDACTED in the tool. Use your organisation's Vault or PAM system to retrieve production credentials. Treat all PROD API calls with care — they affect live data.

### 5.2 App Details Panel

The **App Details** sub-tab shows credentials for the currently selected API application.

**To view an application's credentials:**

1. Click the **App Details** sub-tab
2. Use the **application selector dropdown** to choose an app (e.g. "Order Portal Web App")
3. The panel displays:
   - **Client ID** — copy with the clipboard button
   - **Client Secret** — masked by default; click the eye icon to reveal; copy with clipboard button
   - **API Key** — masked by default; click eye to reveal; copy
   - **Username / Password** — masked; click eye to reveal; copy
   - **App Type, Grant Types, Scopes, Redirect URI**
   - **Description and Contact**

**Credential masking:** Sensitive fields (`client_secret`, `api_key`, `password`) are displayed as `••••••••` by default. Click the **👁 eye icon** to toggle visibility. Click the **📋 clipboard icon** to copy the value to your clipboard.

### 5.3 OMS APIs Panel

The **OMS APIs** sub-tab is the primary execution area. It is organised into sub-tabs for each API group.

**API group sub-tabs:**

| Sub-tab | APIs Covered |
|---|---|
| 🔐 Auth APIs | OAuth token, introspect, revoke, OpenID discovery |
| 📦 Order APIs | Order CRUD, submit, cancel, audit log |
| 👤 Customer APIs | Customer profiles and addresses |
| 🏷️ Product & Catalog APIs | Product search, variants, pricing, categories |
| 🏭 Inventory APIs | Stock levels, reserve, release, warehouses |
| 🚚 Shipping & Fulfillment APIs | Shipments, tracking, rates |
| 💳 Payment APIs | Authorize, capture, refund, void |
| ↩️ Returns & RMA APIs | Return authorizations and labels |
| 📊 Reports & Analytics APIs | Business reports and health checks |
| ▶ Run All | Batch execution of selected APIs |

Each API group panel contains:
- **Auth Quick Action buttons** — for obtaining tokens specific to that group
- **Token input fields** — Access Token, Client Creds Token, API Key, Basic Auth
- **Individual API cards** — one per endpoint

**Each API card shows:**
- HTTP method badge (colour-coded: GET=blue, POST=green, PUT=orange, DELETE=red)
- API path
- Description
- Authentication type badge
- SLA value
- Expandable **cURL** block showing the exact command
- Parameter inputs (query params, path params, request body)
- **Execute** button
- **Raw** / **Table** response toggle

### 5.4 All Apps Panel

The **All Apps** sub-tab shows a searchable table of all registered API applications for the current environment.

**Columns:** App Name, Client ID, App Type, Grant Types, Scopes, Contact

Use the **search box** to filter by any field. This is useful for quickly finding a specific application's client ID to use in a manual cURL call.

### 5.5 Test Users Panel

The **Test Users** sub-tab displays username and password credentials for all test accounts in the current environment.

**Two sections:**

1. **Test Users** — Human user accounts with assigned roles
2. **Service Accounts** — Machine accounts with specific OAuth scopes

Passwords are masked by default. Click the **👁 eye icon** to reveal. Use these accounts with the **Password Grant** auth action to obtain user-context tokens.

| Role | What They Can Test |
|---|---|
| Customer | Order placement, order history, profile updates, address management |
| Support Agent | Viewing and updating any customer's orders |
| Admin | Reports, full admin operations |
| Warehouse Ops | Shipments and inventory management |
| Read-Only | Smoke testing GET endpoints without side effects |

---

## 6. Getting an Access Token

Most OMS APIs require a valid access token. The tool provides four **Auth Quick Action** buttons in every API group panel to make token acquisition easy.

### Method 1 — Client Credentials (Machine-to-Machine)

Use this when testing APIs that require `client_creds` or `bearer` auth without a user context.

1. Navigate to any API group (e.g. **Order APIs**)
2. Click the **🤝 Client Credentials** button
3. The tool automatically uses the `client_id` and `client_secret` from the selected application in App Details
4. On success, the **Access Token** field is populated automatically

**What happens under the hood:**
```
POST {oauthBase}/oauth/v1/token
Authorization: Basic base64(client_id:client_secret)
Body: grant_type=client_credentials&scope=orders:read orders:write
```

### Method 2 — Password Grant (User-Context Token)

Use this when testing APIs that require a user's own access token (e.g. a customer viewing their own orders).

1. Navigate to any API group
2. Click the **🔐 Password Grant** button
3. Enter the username and password from the **Test Users** panel
4. Click **Execute**
5. On success, the **Access Token** field is populated automatically

**What happens under the hood:**
```
POST {oauthBase}/oauth/v1/token
Authorization: Basic base64(client_id:client_secret)
Body: grant_type=password&username={u}&password={p}&scope={scope}
```

### Method 3 — Refresh Token

Use this to exchange an existing refresh token for a new access token without re-entering credentials.

1. Navigate to any API group
2. Click the **♻️ Refresh Token** button
3. Paste your current refresh token into the input field
4. Click **Execute**
5. On success, the new access token populates automatically

### Method 4 — Introspect (Validate a Token)

Use this to check whether an access token is still valid and see its claims.

1. Navigate to any API group
2. Click the **🔍 Introspect** button
3. Paste the token to inspect
4. Click **Execute**
5. The response shows `active: true/false` and token metadata

### Token Field Colour Reference

| Field Colour | Token Type | Used For |
|---|---|---|
| 🟢 Green | Access Token | `bearer` auth type APIs |
| 🔵 Blue | Client Creds Token | `client_creds` auth type APIs |
| 🟡 Yellow | API Key | `api_key` auth type APIs |
| 🟣 Purple | Basic Auth | `basic_auth` auth type APIs (format: `user:pass`) |

---

## 7. Executing an API Call

### Step-by-Step

1. **Select the environment** using the top environment selector
2. **Obtain an access token** using the appropriate Auth Quick Action button (if the API requires auth)
3. **Navigate to the API group sub-tab** containing the API you want to test
4. **Find the API card** for the specific endpoint
5. **Fill in parameters:**
   - For path parameters (e.g. `{orderId}`): enter the value in the path param input
   - For query parameters: values are pre-filled with defaults; modify as needed
   - For request bodies (JSON): edit the JSON in the body textarea
6. **Click the Execute button** on the API card
7. **View the response** in the response panel below

### Using the cURL Block

Each API card has an expandable **cURL** section. Click the cURL header to expand it. This shows the exact `curl` command equivalent to what the tool will send. You can copy this command to run directly from a terminal, share with a colleague, or save for documentation.

### Path Parameters

When an API path contains placeholders like `/orders/{orderId}`, the tool shows an input field for each placeholder. Enter the ID value directly — do not include the curly braces.

**Example:** For `GET /orders/{orderId}`, enter `ord-00123` (not `{ord-00123}`).

### Query Parameters

Query parameters appear as labelled input fields below the path. Default values are pre-filled (e.g. `page=0`, `size=20`). Leave fields empty to omit that parameter from the request.

### Request Body (JSON APIs)

For POST and PUT APIs with a JSON body, a textarea is pre-filled with a template. Edit the JSON values as needed. The tool will validate that it is valid JSON before sending. Placeholder values like `{customerId}` in the template are reminders to replace them with real values.

### Request Body (Auth APIs — Form Data)

OAuth token endpoints use form-encoded bodies. The tool handles this automatically — the body template is pre-filled (e.g. `grant_type=client_credentials&scope=orders:read`). Edit the scope or add parameters as needed.

---

## 8. Understanding API Responses

After execution, the response panel appears below the API card showing:

### Response Header Bar

| Element | Description |
|---|---|
| Status badge | HTTP status code and text (e.g. `200 OK`, `201 Created`, `401 Unauthorized`) |
| Duration badge | Round-trip response time in milliseconds; colour-coded against the SLA |
| Raw button | Show the raw JSON response body |
| Table button | Show the response body as a formatted key-value table |

### Status Code Colour Reference

| Colour | Status Range | Meaning |
|---|---|---|
| Green | 2xx | Success |
| Yellow/Orange | 3xx | Redirect |
| Orange | 4xx | Client error (check your request) |
| Red | 5xx | Server error |

### Duration / SLA Badge Colours

| Badge Colour | Meaning |
|---|---|
| Green | Response within SLA target |
| Yellow | Response within 1.5× SLA (acceptable but slow) |
| Red | Response exceeded 1.5× SLA (SLA breach) |

### Raw View

The raw view shows the complete JSON response body with syntax highlighting. Use this to:
- Read the full API response
- Find IDs to use in subsequent API calls (e.g. copy the `orderId` from a Create Order response)
- Inspect error messages and validation details

### Table View

The table view parses the JSON response and displays it as a formatted two-column key/value table. Use this for a quick human-readable summary of the response fields, especially for deeply nested objects.

### Response Headers

Response headers from the upstream API (content-type, location, x-request-id, etc.) are captured and available in the response object.

---

## 9. Run All — Batch Execution

The **Run All** sub-tab (inside OMS APIs) allows you to select and run multiple APIs in sequence with a single click. This is useful for smoke testing or regression validation.

### How to Use Run All

1. Navigate to **Application** → **OMS APIs** → **Run All** sub-tab
2. The panel shows a table listing all registered APIs across all groups
3. **Select APIs to run:**
   - Check individual checkboxes next to specific APIs
   - Use **Select All** to check every API
   - Use **Deselect All** to clear all selections
4. Ensure you have valid tokens populated in the token fields (tokens flow from the API group panels)
5. Click the **Run Selected** button
6. APIs execute sequentially — each row updates in real time with:
   - ▶ (running) → ✅ (pass) or ❌ (fail)
   - HTTP status code
   - Duration in milliseconds
   - SLA colour badge

### Reading Run All Results

| Column | Description |
|---|---|
| API | Method + path of the executed endpoint |
| Group | API group name |
| Status | HTTP status code received |
| Duration | Response time in ms (colour-coded against SLA) |
| Result | Pass (2xx) or Fail (non-2xx or error) |
| Actions | ▶ Re-run individual API; 👁 View last response |

### Summary Bar

After a run completes, a summary bar shows:
- Total APIs run
- Pass count (2xx responses)
- Fail count (non-2xx or connection errors)

### Tips for Run All

- For APIs requiring path parameters (e.g. `{orderId}`), the tool uses the last value entered in that API's input field. Pre-fill these before starting a Run All batch.
- APIs that require authentication will use whatever token is currently in the relevant token field. Ensure tokens are not expired before running.
- Use Run All for smoke tests at the start of a QA session to quickly confirm all endpoints are reachable and responding.

---

## 10. E2E Flows Tab

The **E2E Flows** tab provides guided, step-by-step walkthroughs of complete business scenarios. Each flow represents an end-to-end test that chains multiple API calls in a logical sequence.

### Available Flows

| Flow | Steps | Business Scenario |
|---|---|---|
| 🛍️ Happy Path — Full Order Lifecycle | 12 steps | Auth → Product → Inventory → Customer → Order → Payment → Fulfill → Track |
| ❌ Order Cancellation Flow | 6 steps | Cancel a submitted order; verify inventory release and payment void |
| ↩️ Returns & Refund Flow | 7 steps | Create RMA → Generate label → Receive → Issue refund |

### How to Run an E2E Flow

1. Click the **E2E Flows** tab
2. Select the flow you want to run from the flow list
3. Read the **flow description** to understand the business scenario
4. For each step in the step table, review:
   - **Step number** and **label**
   - **HTTP method** badge
   - **API path**
   - **Auth type** required
   - **Notes** — guidance on what to capture or validate from this step
5. Click the **▶ Run** button on a step to execute it
6. Click the **👁 View** button on a completed step to see its response
7. Proceed to the next step, using IDs and values from previous step responses

### Flow Execution Tips

**Happy Path Flow — Key values to carry forward:**

| Step | What to Capture | Used In |
|---|---|---|
| Step 1 — Get Access Token | `access_token` | Steps 5, 6, 7, 8, 9 |
| Step 2 — Search Products | `productId` | Steps 3, 5, 6, 10 |
| Step 4 — Create Customer | `customerId` | Step 5 |
| Step 5 — Create Order | `orderId` | Steps 6, 7, 8, 10, 11 |
| Step 7 — Authorize Payment | `authorizationId` | Step 9 |
| Step 10 — Create Shipment | `shipmentId` | Step 11 |
| Step 11 — Update Shipment Status | `trackingNumber` | Step 12 |

**Cancellation Flow — Prerequisites:**
- An existing order in SUBMITTED or PROCESSING status
- Valid access token

**Returns Flow — Prerequisites:**
- A DELIVERED order with at least one item
- Valid `orderItemId` from the order
- Valid access token

---

## 11. Test Scenarios Tab

The **Test Scenarios** tab is a reference catalogue of all defined test cases. It does not execute tests directly — it provides the specification and description for each scenario to guide manual or automated testing.

### Scenario Categories

| Category | Scenario IDs | Focus |
|---|---|---|
| 🟢 Happy Path Scenarios | TC-001 to TC-010 | Normal business flows, authentication methods |
| 🔴 Negative / Error Scenarios | TC-101 to TC-110 | Error handling, validation, edge cases |
| ⚡ Performance Scenarios | TC-201 to TC-204 | Response time SLAs, throughput, concurrency |
| 🔒 Security Scenarios | TC-301 to TC-304 | Injection attacks, data isolation, scope enforcement |

### Scenario Card Information

Each scenario card shows:
- **ID** — unique test case identifier (e.g. TC-001)
- **Name** — short scenario description
- **Priority** — P0 (critical/smoke), P1 (important), P2 (nice-to-have)
- **Tags** — categorisation labels (e.g. `orders`, `auth`, `e2e`, `regression`)
- **Description** — full description of what to test and what to verify

### Priority Guide

| Priority | Meaning | When to Run |
|---|---|---|
| **P0** | Critical — must pass for release | Every build, every environment, smoke test suite |
| **P1** | Important — core functional coverage | Every release cycle, regression suite |
| **P2** | Extended coverage | Full regression, pre-UAT signoff |

### Using Test Scenarios with the OMS APIs Panel

Test scenarios describe *what* to test. Use the **OMS APIs panel** to *execute* the actual API calls. For example:

- **TC-101** (Order with expired token) → Go to Order APIs → manually enter an expired token → call `GET /orders` → verify the response is HTTP 401

- **TC-104** (Order quantity exceeds inventory) → Go to Inventory APIs → check current stock → Go to Order APIs → create order with quantity > available stock → verify HTTP 409

---

## 12. Step-by-Step Workflows

### 12.1 Workflow: Get an OAuth Token and Call an API

**Goal:** Call `GET /orders` on the QA environment using a client_credentials token.

1. Select **QA** from the environment selector
2. Click **Application** tab → **App Details**
3. Select **Order Portal Web App** from the app dropdown
4. Note the `client_id` and `client_secret` (click 👁 to reveal the secret)
5. Click the **OMS APIs** sub-tab
6. Click the **📦 Order APIs** group tab
7. Click the **🤝 Client Credentials** button
8. The tool sends a token request and populates the **Access Token** field (green)
9. Find the `GET /orders` API card
10. Leave `page=0`, `size=20` as defaults (or modify as needed)
11. Click **Execute**
12. The response panel shows the paginated list of orders with HTTP 200

---

### 12.2 Workflow: Run the Happy Path Order Lifecycle

**Goal:** Execute the full 12-step order lifecycle end-to-end.

**Before you start:** Ensure the QA (or DEV) OMS application is running and accessible.

1. Select your target environment (e.g. **QA**)
2. Click the **E2E Flows** tab
3. Click **🛍️ Happy Path — Full Order Lifecycle**
4. **Step 1 — Get Access Token**
   - Click ▶ Run on Step 1
   - Verify response contains `access_token`
   - The token is auto-populated in the Access Token field
5. **Step 2 — Search Products**
   - Click ▶ Run on Step 2
   - In the response, note a `productId` (e.g. `prod-SKU-001`)
   - Enter this `productId` in the path param field for Step 3
6. **Step 3 — Check Inventory**
   - Enter the `productId` from Step 2
   - Click ▶ Run — verify `quantityAvailable > 0`
7. **Step 4 — Create Customer**
   - Click ▶ Run (body pre-filled with sample data, or edit to use your own)
   - Note the `customerId` from the response
8. **Step 5 — Create Order**
   - Enter the `customerId` and `productId` in the order body
   - Click ▶ Run
   - Note the `orderId` from the response (e.g. `ord-00789`)
9. **Step 6 — Reserve Inventory**
   - Enter `orderId` and `productId` in the request body
   - Click ▶ Run — verify HTTP 200
10. **Step 7 — Authorize Payment**
    - Enter `orderId` and a test `paymentToken`
    - Click ▶ Run
    - Note the `authorizationId` from the response
11. **Step 8 — Submit Order**
    - Enter `orderId`
    - Click ▶ Run — verify order status transitions to PROCESSING
12. **Step 9 — Capture Payment**
    - Enter `authorizationId`
    - Click ▶ Run — verify HTTP 200
13. **Step 10 — Create Shipment**
    - Enter `orderId`, `warehouseId`, and `productId`
    - Click ▶ Run
    - Note the `shipmentId`
14. **Step 11 — Update Shipment Status**
    - Enter `shipmentId` and a test `trackingNumber`
    - Set status to `SHIPPED`
    - Click ▶ Run
15. **Step 12 — Track Shipment**
    - Enter the `trackingNumber`
    - Click ▶ Run
    - Verify tracking events are present in the response

**Expected final state:** Order is in SHIPPED status with tracking information confirmed.

---

### 12.3 Workflow: Test a Negative Scenario

**Goal:** Verify TC-101 — that an expired token returns HTTP 401.

1. Select **QA** environment
2. Go to **Application** → **OMS APIs** → **📦 Order APIs**
3. In the **Access Token** field (green), enter a known-expired token (or any invalid string)
4. Find the `GET /orders` API card
5. Click **Execute**
6. **Expected result:** Response shows `401 Unauthorized`
7. Verify the response body contains an error message (e.g. `"error": "invalid_token"`)
8. Document the result against **TC-101** in your test management tool

---

### 12.4 Workflow: Smoke Test All APIs

**Goal:** Quickly verify all OMS APIs are reachable after a deployment.

1. Select the target environment (e.g. **QA**)
2. Go to **Application** → **OMS APIs** → **📦 Order APIs**
3. Click **🤝 Client Credentials** to obtain a fresh token
4. Go to **Product & Catalog APIs** and enter a valid API Key in the 🟡 API Key field
5. Go to **Reports & Analytics APIs** and enter admin credentials in the 🟣 Basic Auth field (format: `oms-admin@qa.acme-corp.com:Admin@OMS#QA1`)
6. Navigate to **Application** → **OMS APIs** → **▶ Run All**
7. Click **Select All** to select every API
8. Click **Run Selected**
9. Monitor the live execution table
10. Review the summary:
    - All health check endpoints (`/health`) should be green
    - Auth-protected endpoints with valid tokens should be 200 or 404 (not 401/403)
    - Note any red/failed rows for investigation

---

## 13. Credential and Token Reference

### Quick Reference — DEV Environment

| Credential Type | Value |
|---|---|
| Client ID (Order Portal) | `order-portal-dev-001` |
| Client ID (Fulfillment) | `fulfillment-svc-dev-002` |
| API Key (Partner) | `ak-dev-partner-a5Ck9mQ2wE7` |
| Admin Basic Auth | `oms-admin@dev.acme-corp.com:Admin@OMS#Dev1` |
| Customer Username | `john.doe@dev.acme-corp.com` |
| Customer Password | `TestUser@Dev1!` |

> Retrieve secrets from the **App Details** panel — they are masked for security.

### Quick Reference — QA Environment

| Credential Type | Value |
|---|---|
| Client ID (Order Portal) | `order-portal-qa-001` |
| Client ID (Fulfillment) | `fulfillment-svc-qa-002` |
| Admin Basic Auth | `oms-admin@qa.acme-corp.com:Admin@OMS#QA1` |
| Customer Username | `john.doe@qa.acme-corp.com` |
| Customer Password | `TestUser@QA1!` |
| Agent Username | `oms.agent@qa.acme-corp.com` |
| Agent Password | `Agent@QA#2024` |

### Token Expiry

OAuth access tokens issued by the OMS auth server are time-limited (typically 1 hour). If you receive a `401 Unauthorized` on a previously working call, your token has likely expired. Use any Auth Quick Action button to obtain a fresh token.

### Basic Auth Format

For APIs requiring `basic_auth` (Reports, Introspect, Revoke), enter credentials in the **Basic Auth** field using the format:

```
username:password
```

**Example:** `oms-admin@qa.acme-corp.com:Admin@OMS#QA1`

Do not base64-encode the value yourself — the proxy server handles encoding automatically.

---

## 14. Troubleshooting

### Browser Shows Certificate Warning on Every Visit

The self-signed certificate warning only needs to be accepted once per browser session. If it reappears every time, check that your browser is not set to block all self-signed certificates in its security settings. You can also import the `certs/cert.pem` file into your system's trusted certificate store to permanently suppress the warning for localhost.

### "Connection Refused" / Tool Does Not Load

- Verify the server is running — check the terminal window for the startup message
- Confirm you are using `https://` not `http://` in the browser address bar
- Check that no other process is using port 8081. If so, start the server on a different port:
  ```bash
  PORT=9000 node server.js
  ```
  Then navigate to `https://localhost:9000/`

### HTTP 502 Bad Gateway on API Calls

This means the proxy server reached the target API URL but received a network-level error (connection refused, timeout, DNS failure). Check:

- Is the target environment running? For DEV, is the local OMS application started on port 8080?
- Is the correct environment selected? (DEV points to localhost:8080; QA/UAT/PROD point to remote hosts)
- Are you connected to the VPN required to reach QA/UAT/PROD environments?
- Is the target hostname resolving? Try opening the API base URL in a browser tab directly.

### 401 Unauthorized on API Calls

Your access token is missing, expired, or invalid.

1. Click the appropriate **Auth Quick Action** button to obtain a fresh token
2. Verify the token populated in the correct colour-coded field (green for bearer, blue for client_creds)
3. Verify you selected the correct application in **App Details** before clicking the token button
4. If the token expires quickly, check whether the OAuth server has a short token lifetime configured

### 403 Forbidden on API Calls

Your token is valid but does not have the required scope for this API.

1. Check the **Scopes** field for the selected application in **App Details**
2. Ensure the selected application has the required scope (e.g. `orders:write` for POST /orders)
3. Switch to an application with broader scopes (e.g. Admin Dashboard has `orders:*`)
4. For user-context calls, verify the test user's role has access to the requested resource

### API Key APIs Return 401 or 403

1. Navigate to the relevant API group (e.g. **Product & Catalog APIs**)
2. Verify the 🟡 **API Key** field is populated
3. Go to **App Details**, select **Partner Integration API**, and copy the API Key
4. Paste it into the API Key field and retry

### Token Field Not Auto-Populating After Auth Quick Action

- Check the response in the Auth API response panel for an error message
- Common causes: wrong `client_id`/`client_secret`, wrong `username`/`password`, OAuth server not reachable
- For password grant: verify the username and password exactly match what is shown in the **Test Users** panel

### JSON Body Validation Error

If you edit the request body template and see a validation error on Execute:

- Verify the JSON is well-formed (no trailing commas, all strings quoted, all brackets matched)
- Use a JSON validator or paste the body into your browser console: `JSON.parse('...')`
- Restore the original template by refreshing the page and re-navigating to the API card

### Server Terminal Closed Accidentally (Windows)

If you closed the terminal window running the server, the tool will stop working in the browser. Re-launch by double-clicking `run.cmd`. The browser session does not need to be refreshed — just re-launch the server and continue.

### PROD Environment — Credentials Are Redacted

PROD client secrets, API keys, and passwords show `*** REDACTED — use Vault ***`. This is intentional.

To use the tool with PROD:
1. Retrieve the credentials from your organisation's Vault or PAM system
2. Manually paste the `client_id`, `client_secret`, or API Key into the relevant token field
3. Use the Auth Quick Action buttons as normal
4. Never paste PROD credentials into the `clients.js` file or commit them to source control

### Checking Server Logs for Debugging

The terminal running `node server.js` prints detailed logs for every proxied request (when `LOG_HEADERS=true`, which is the default). Review these logs to:

- See the exact URL being called
- Confirm the `X-Correlation-Id` sent with each request (use this to search Kibana/Splunk logs)
- Check the HTTP status and duration returned from the upstream API
- Identify network errors between the proxy and the target

To disable verbose logging (e.g. if the terminal output is too noisy):

```bash
LOG_HEADERS=false node server.js
```

---

## Appendix: API Group and Auth Type Quick Reference

| API Group | Auth Type | Token Needed |
|---|---|---|
| Auth APIs | none / basic_auth | No token for token acquisition; client:secret for introspect/revoke |
| Order APIs | bearer | Access Token (from client_credentials or password grant) |
| Customer APIs | bearer / client_creds | Access Token or Client Creds Token |
| Product & Catalog APIs | api_key | API Key (from App Details) |
| Inventory APIs | client_creds / bearer | Client Creds Token or Access Token |
| Shipping & Fulfillment APIs | client_creds / bearer / api_key | Depends on endpoint |
| Payment APIs | bearer | Access Token |
| Returns & RMA APIs | bearer / client_creds | Access Token or Client Creds Token |
| Reports & Analytics APIs | basic_auth | `username:password` in Basic Auth field |

---

*End of User Guide — OMS API Testing Tool v1.0*
