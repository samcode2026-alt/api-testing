/* OMS Testing Tool — API Definitions
   auth_type values: 'bearer' | 'client_creds' | 'api_key' | 'basic_auth'
   sla: expected response time in seconds
*/
window.OMS_APIS = [
    {
        group: '🔐 Auth APIs',
        basePath: '',
        apis: [
            {
                method: 'POST',
                path: '/oauth/v1/token',
                desc: 'Get access token via Client Credentials grant',
                auth_type: 'none',
                sla: 2,
                body_template: 'grant_type=client_credentials&scope={scope}',
                body_type: 'form'
            },
            {
                method: 'POST',
                path: '/oauth/v1/token',
                desc: 'Get access token via Resource Owner Password grant',
                auth_type: 'none',
                sla: 2,
                body_template: 'grant_type=password&username={username}&password={password}&scope={scope}',
                body_type: 'form',
                label: 'Token — Password Grant'
            },
            {
                method: 'POST',
                path: '/oauth/v1/token',
                desc: 'Refresh an access token using a refresh token',
                auth_type: 'none',
                sla: 2,
                body_template: 'grant_type=refresh_token&refresh_token={refresh_token}',
                body_type: 'form',
                label: 'Token — Refresh Token'
            },
            {
                method: 'POST',
                path: '/oauth/v1/introspect',
                desc: 'Introspect / validate an access token',
                auth_type: 'basic_auth',
                sla: 1,
                body_template: 'token={token}&token_type_hint=access_token',
                body_type: 'form'
            },
            {
                method: 'POST',
                path: '/oauth/v1/revoke',
                desc: 'Revoke an access or refresh token',
                auth_type: 'basic_auth',
                sla: 1,
                body_template: 'token={token}&token_type_hint=access_token',
                body_type: 'form'
            },
            {
                method: 'GET',
                path: '/oauth/v1/.well-known/openid-configuration',
                desc: 'Fetch OpenID Connect discovery metadata',
                auth_type: 'none',
                sla: 1
            }
        ]
    },
    {
        group: '📦 Order APIs',
        basePath: '/api/v1',
        apis: [
            {
                method: 'GET',
                path: '/orders',
                desc: 'List all orders (paginated)',
                auth_type: 'bearer',
                sla: 3,
                params: [
                    { key: 'page', value: '0', type: 'query' },
                    { key: 'size', value: '20', type: 'query' },
                    { key: 'status', value: '', type: 'query' },
                    { key: 'customerId', value: '', type: 'query' },
                    { key: 'fromDate', value: '', type: 'query' },
                    { key: 'toDate', value: '', type: 'query' }
                ]
            },
            {
                method: 'POST',
                path: '/orders',
                desc: 'Create a new order',
                auth_type: 'bearer',
                sla: 3,
                body_type: 'json',
                body_template: JSON.stringify({
                    customerId: '{customerId}',
                    items: [{ productId: '{productId}', quantity: 1, unitPrice: 29.99 }],
                    shippingAddress: {
                        street: '123 Main St', city: 'San Francisco',
                        state: 'CA', zip: '94105', country: 'US'
                    },
                    paymentMethod: { type: 'CREDIT_CARD', token: '{paymentToken}' }
                }, null, 2)
            },
            {
                method: 'GET',
                path: '/orders/{orderId}',
                desc: 'Get order details by ID',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['orderId']
            },
            {
                method: 'PUT',
                path: '/orders/{orderId}',
                desc: 'Update an existing order (pre-submission)',
                auth_type: 'bearer',
                sla: 3,
                pathParams: ['orderId'],
                body_type: 'json',
                body_template: JSON.stringify({
                    items: [{ productId: '{productId}', quantity: 2, unitPrice: 29.99 }]
                }, null, 2)
            },
            {
                method: 'DELETE',
                path: '/orders/{orderId}',
                desc: 'Cancel / delete a pending order',
                auth_type: 'bearer',
                sla: 3,
                pathParams: ['orderId']
            },
            {
                method: 'GET',
                path: '/orders/{orderId}/items',
                desc: 'Get line items for an order',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['orderId']
            },
            {
                method: 'GET',
                path: '/orders/{orderId}/status',
                desc: 'Get current order status and lifecycle history',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['orderId']
            },
            {
                method: 'POST',
                path: '/orders/{orderId}/submit',
                desc: 'Submit a draft order for processing',
                auth_type: 'bearer',
                sla: 4,
                pathParams: ['orderId']
            },
            {
                method: 'POST',
                path: '/orders/{orderId}/cancel',
                desc: 'Request cancellation of a submitted order',
                auth_type: 'bearer',
                sla: 4,
                pathParams: ['orderId'],
                body_type: 'json',
                body_template: JSON.stringify({ reason: 'Customer requested cancellation', notes: '' }, null, 2)
            },
            {
                method: 'GET',
                path: '/orders/{orderId}/audit-log',
                desc: 'Retrieve full audit trail for an order',
                auth_type: 'bearer',
                sla: 3,
                pathParams: ['orderId']
            }
        ]
    },
    {
        group: '👤 Customer APIs',
        basePath: '/api/v1',
        apis: [
            {
                method: 'GET',
                path: '/customers',
                desc: 'Search / list customers',
                auth_type: 'client_creds',
                sla: 3,
                params: [
                    { key: 'q', value: '', type: 'query' },
                    { key: 'email', value: '', type: 'query' },
                    { key: 'page', value: '0', type: 'query' },
                    { key: 'size', value: '20', type: 'query' }
                ]
            },
            {
                method: 'POST',
                path: '/customers',
                desc: 'Create a new customer profile',
                auth_type: 'client_creds',
                sla: 3,
                body_type: 'json',
                body_template: JSON.stringify({
                    firstName: 'Jane', lastName: 'Doe',
                    email: 'jane.doe@example.com',
                    phone: '+1-415-555-0123',
                    address: { street: '456 Oak Ave', city: 'Oakland', state: 'CA', zip: '94601', country: 'US' },
                    preferences: { marketingOptIn: true, currency: 'USD' }
                }, null, 2)
            },
            {
                method: 'GET',
                path: '/customers/{customerId}',
                desc: 'Get customer profile by ID',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['customerId']
            },
            {
                method: 'PUT',
                path: '/customers/{customerId}',
                desc: 'Update customer profile',
                auth_type: 'bearer',
                sla: 3,
                pathParams: ['customerId'],
                body_type: 'json',
                body_template: JSON.stringify({ phone: '+1-415-555-9999', preferences: { marketingOptIn: false } }, null, 2)
            },
            {
                method: 'DELETE',
                path: '/customers/{customerId}',
                desc: 'Deactivate / GDPR-delete a customer account',
                auth_type: 'client_creds',
                sla: 5,
                pathParams: ['customerId']
            },
            {
                method: 'GET',
                path: '/customers/{customerId}/orders',
                desc: 'Get all orders for a specific customer',
                auth_type: 'bearer',
                sla: 3,
                pathParams: ['customerId'],
                params: [
                    { key: 'status', value: '', type: 'query' },
                    { key: 'page', value: '0', type: 'query' }
                ]
            },
            {
                method: 'GET',
                path: '/customers/{customerId}/addresses',
                desc: 'List saved addresses for a customer',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['customerId']
            },
            {
                method: 'POST',
                path: '/customers/{customerId}/addresses',
                desc: 'Add a new address to a customer profile',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['customerId'],
                body_type: 'json',
                body_template: JSON.stringify({
                    label: 'Work', street: '100 Market St', city: 'San Francisco',
                    state: 'CA', zip: '94105', country: 'US', isDefault: false
                }, null, 2)
            }
        ]
    },
    {
        group: '🏷️ Product & Catalog APIs',
        basePath: '/api/v1',
        apis: [
            {
                method: 'GET',
                path: '/products',
                desc: 'List/search products in the catalog',
                auth_type: 'api_key',
                sla: 2,
                params: [
                    { key: 'q', value: '', type: 'query' },
                    { key: 'category', value: '', type: 'query' },
                    { key: 'minPrice', value: '', type: 'query' },
                    { key: 'maxPrice', value: '', type: 'query' },
                    { key: 'inStock', value: 'true', type: 'query' },
                    { key: 'page', value: '0', type: 'query' },
                    { key: 'size', value: '20', type: 'query' }
                ]
            },
            {
                method: 'GET',
                path: '/products/{productId}',
                desc: 'Get product details by SKU or ID',
                auth_type: 'api_key',
                sla: 1,
                pathParams: ['productId']
            },
            {
                method: 'GET',
                path: '/products/{productId}/variants',
                desc: 'Get product variants (size, color, etc.)',
                auth_type: 'api_key',
                sla: 1,
                pathParams: ['productId']
            },
            {
                method: 'GET',
                path: '/products/{productId}/pricing',
                desc: 'Get pricing including discounts and promotions',
                auth_type: 'api_key',
                sla: 2,
                pathParams: ['productId']
            },
            {
                method: 'GET',
                path: '/categories',
                desc: 'Get product category tree',
                auth_type: 'api_key',
                sla: 1
            },
            {
                method: 'GET',
                path: '/categories/{categoryId}/products',
                desc: 'List products within a category',
                auth_type: 'api_key',
                sla: 2,
                pathParams: ['categoryId'],
                params: [
                    { key: 'page', value: '0', type: 'query' },
                    { key: 'size', value: '20', type: 'query' }
                ]
            }
        ]
    },
    {
        group: '🏭 Inventory APIs',
        basePath: '/api/v1',
        apis: [
            {
                method: 'GET',
                path: '/inventory',
                desc: 'List inventory levels across all warehouses',
                auth_type: 'client_creds',
                sla: 3,
                params: [
                    { key: 'warehouseId', value: '', type: 'query' },
                    { key: 'productId', value: '', type: 'query' },
                    { key: 'lowStock', value: '', type: 'query' }
                ]
            },
            {
                method: 'GET',
                path: '/inventory/{productId}',
                desc: 'Get inventory level for a specific product',
                auth_type: 'client_creds',
                sla: 1,
                pathParams: ['productId']
            },
            {
                method: 'PUT',
                path: '/inventory/{productId}',
                desc: 'Update stock quantity for a product',
                auth_type: 'client_creds',
                sla: 3,
                pathParams: ['productId'],
                body_type: 'json',
                body_template: JSON.stringify({ warehouseId: '{warehouseId}', quantity: 100, reason: 'RESTOCK' }, null, 2)
            },
            {
                method: 'POST',
                path: '/inventory/reserve',
                desc: 'Reserve inventory for an order (soft hold)',
                auth_type: 'bearer',
                sla: 2,
                body_type: 'json',
                body_template: JSON.stringify({ orderId: '{orderId}', items: [{ productId: '{productId}', quantity: 1 }] }, null, 2)
            },
            {
                method: 'POST',
                path: '/inventory/release',
                desc: 'Release a previously reserved inventory hold',
                auth_type: 'bearer',
                sla: 2,
                body_type: 'json',
                body_template: JSON.stringify({ orderId: '{orderId}', reason: 'ORDER_CANCELLED' }, null, 2)
            },
            {
                method: 'GET',
                path: '/inventory/warehouses',
                desc: 'List all warehouse locations',
                auth_type: 'client_creds',
                sla: 1
            },
            {
                method: 'GET',
                path: '/inventory/warehouses/{warehouseId}',
                desc: 'Get warehouse details and stock summary',
                auth_type: 'client_creds',
                sla: 2,
                pathParams: ['warehouseId']
            }
        ]
    },
    {
        group: '🚚 Shipping & Fulfillment APIs',
        basePath: '/api/v1',
        apis: [
            {
                method: 'POST',
                path: '/shipments',
                desc: 'Create a shipment for a confirmed order',
                auth_type: 'client_creds',
                sla: 4,
                body_type: 'json',
                body_template: JSON.stringify({
                    orderId: '{orderId}', warehouseId: '{warehouseId}',
                    carrier: 'FEDEX', serviceLevel: 'GROUND',
                    items: [{ productId: '{productId}', quantity: 1 }]
                }, null, 2)
            },
            {
                method: 'GET',
                path: '/shipments/{shipmentId}',
                desc: 'Get shipment details and tracking info',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['shipmentId']
            },
            {
                method: 'GET',
                path: '/shipments/order/{orderId}',
                desc: 'Get all shipments for a specific order',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['orderId']
            },
            {
                method: 'PUT',
                path: '/shipments/{shipmentId}/status',
                desc: 'Update shipment status (PACKED, SHIPPED, DELIVERED)',
                auth_type: 'client_creds',
                sla: 3,
                pathParams: ['shipmentId'],
                body_type: 'json',
                body_template: JSON.stringify({ status: 'SHIPPED', trackingNumber: '{trackingNumber}', carrier: 'FEDEX' }, null, 2)
            },
            {
                method: 'GET',
                path: '/tracking/{trackingNumber}',
                desc: 'Get real-time tracking events by tracking number',
                auth_type: 'api_key',
                sla: 3,
                pathParams: ['trackingNumber']
            },
            {
                method: 'GET',
                path: '/shipments/rates',
                desc: 'Get shipping rate quotes',
                auth_type: 'bearer',
                sla: 3,
                params: [
                    { key: 'fromZip', value: '94105', type: 'query' },
                    { key: 'toZip', value: '', type: 'query' },
                    { key: 'weight', value: '', type: 'query' }
                ]
            }
        ]
    },
    {
        group: '💳 Payment APIs',
        basePath: '/api/v1',
        apis: [
            {
                method: 'POST',
                path: '/payments/authorize',
                desc: 'Authorize a payment (place hold on funds)',
                auth_type: 'bearer',
                sla: 5,
                body_type: 'json',
                body_template: JSON.stringify({
                    orderId: '{orderId}', amount: 99.99, currency: 'USD',
                    paymentMethod: { type: 'CREDIT_CARD', token: '{paymentToken}' }
                }, null, 2)
            },
            {
                method: 'POST',
                path: '/payments/capture',
                desc: 'Capture a previously authorized payment',
                auth_type: 'bearer',
                sla: 5,
                body_type: 'json',
                body_template: JSON.stringify({ authorizationId: '{authorizationId}', amount: 99.99 }, null, 2)
            },
            {
                method: 'POST',
                path: '/payments/refund',
                desc: 'Issue a full or partial refund',
                auth_type: 'bearer',
                sla: 5,
                body_type: 'json',
                body_template: JSON.stringify({ paymentId: '{paymentId}', amount: 29.99, reason: 'CUSTOMER_REQUEST' }, null, 2)
            },
            {
                method: 'GET',
                path: '/payments/{paymentId}',
                desc: 'Get payment details and transaction history',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['paymentId']
            },
            {
                method: 'GET',
                path: '/payments/order/{orderId}',
                desc: 'Get all payments associated with an order',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['orderId']
            },
            {
                method: 'POST',
                path: '/payments/void',
                desc: 'Void an authorized (uncaptured) payment',
                auth_type: 'bearer',
                sla: 4,
                body_type: 'json',
                body_template: JSON.stringify({ authorizationId: '{authorizationId}', reason: 'ORDER_CANCELLED' }, null, 2)
            }
        ]
    },
    {
        group: '↩️ Returns & RMA APIs',
        basePath: '/api/v1',
        apis: [
            {
                method: 'POST',
                path: '/returns',
                desc: 'Create a Return Merchandise Authorization (RMA)',
                auth_type: 'bearer',
                sla: 4,
                body_type: 'json',
                body_template: JSON.stringify({
                    orderId: '{orderId}',
                    items: [{ orderItemId: '{orderItemId}', quantity: 1, reason: 'DEFECTIVE', condition: 'DAMAGED' }],
                    returnMethod: 'SHIP_BACK',
                    refundMethod: 'ORIGINAL_PAYMENT'
                }, null, 2)
            },
            {
                method: 'GET',
                path: '/returns',
                desc: 'List all return requests',
                auth_type: 'client_creds',
                sla: 3,
                params: [
                    { key: 'status', value: '', type: 'query' },
                    { key: 'orderId', value: '', type: 'query' },
                    { key: 'page', value: '0', type: 'query' }
                ]
            },
            {
                method: 'GET',
                path: '/returns/{returnId}',
                desc: 'Get RMA details and current status',
                auth_type: 'bearer',
                sla: 2,
                pathParams: ['returnId']
            },
            {
                method: 'PUT',
                path: '/returns/{returnId}/status',
                desc: 'Update RMA status (APPROVED, RECEIVED, REFUNDED)',
                auth_type: 'client_creds',
                sla: 3,
                pathParams: ['returnId'],
                body_type: 'json',
                body_template: JSON.stringify({ status: 'APPROVED', notes: 'Return approved by agent' }, null, 2)
            },
            {
                method: 'POST',
                path: '/returns/{returnId}/label',
                desc: 'Generate a prepaid return shipping label',
                auth_type: 'bearer',
                sla: 5,
                pathParams: ['returnId']
            }
        ]
    },
    {
        group: '📊 Reports & Analytics APIs',
        basePath: '/api/v1',
        apis: [
            {
                method: 'GET',
                path: '/reports/orders/summary',
                desc: 'Order volume and revenue summary by date range',
                auth_type: 'basic_auth',
                sla: 5,
                params: [
                    { key: 'fromDate', value: '', type: 'query' },
                    { key: 'toDate', value: '', type: 'query' },
                    { key: 'groupBy', value: 'DAY', type: 'query' }
                ]
            },
            {
                method: 'GET',
                path: '/reports/inventory/turnover',
                desc: 'Inventory turnover rate report',
                auth_type: 'basic_auth',
                sla: 8,
                params: [
                    { key: 'warehouseId', value: '', type: 'query' },
                    { key: 'fromDate', value: '', type: 'query' },
                    { key: 'toDate', value: '', type: 'query' }
                ]
            },
            {
                method: 'GET',
                path: '/reports/fulfillment/sla',
                desc: 'Fulfillment SLA compliance report',
                auth_type: 'basic_auth',
                sla: 8,
                params: [
                    { key: 'fromDate', value: '', type: 'query' },
                    { key: 'toDate', value: '', type: 'query' }
                ]
            },
            {
                method: 'GET',
                path: '/reports/returns/rate',
                desc: 'Return rate analysis by product and reason',
                auth_type: 'basic_auth',
                sla: 6,
                params: [
                    { key: 'fromDate', value: '', type: 'query' },
                    { key: 'toDate', value: '', type: 'query' },
                    { key: 'productId', value: '', type: 'query' }
                ]
            },
            {
                method: 'GET',
                path: '/health',
                desc: 'OMS application health check',
                auth_type: 'none',
                sla: 1
            },
            {
                method: 'GET',
                path: '/health/detailed',
                desc: 'Detailed health including DB, cache, and downstream services',
                auth_type: 'basic_auth',
                sla: 3
            }
        ]
    }
];

/* E2E Flow definitions — used in the E2E Flows tab */
window.OMS_E2E_FLOWS = [
    {
        id: 'happy-path-order',
        name: '🛍️ Happy Path — Full Order Lifecycle',
        description: 'Complete order flow: Authenticate → Search Product → Check Inventory → Create Order → Process Payment → Fulfill → Track',
        steps: [
            { step: 1, label: 'Get Access Token', group: '🔐 Auth APIs', path: '/oauth/v1/token', method: 'POST', auth_type: 'none', note: 'Use client_credentials grant. Store access_token for subsequent steps.' },
            { step: 2, label: 'Search Products', group: '🏷️ Product & Catalog APIs', path: '/api/v1/products', method: 'GET', auth_type: 'api_key', note: 'Find a product. Store productId.' },
            { step: 3, label: 'Check Inventory', group: '🏭 Inventory APIs', path: '/api/v1/inventory/{productId}', method: 'GET', auth_type: 'client_creds', note: 'Confirm stock availability.' },
            { step: 4, label: 'Create Customer', group: '👤 Customer APIs', path: '/api/v1/customers', method: 'POST', auth_type: 'client_creds', note: 'Create or look up a customer. Store customerId.' },
            { step: 5, label: 'Create Order', group: '📦 Order APIs', path: '/api/v1/orders', method: 'POST', auth_type: 'bearer', note: 'Create draft order. Store orderId.' },
            { step: 6, label: 'Reserve Inventory', group: '🏭 Inventory APIs', path: '/api/v1/inventory/reserve', method: 'POST', auth_type: 'bearer', note: 'Place soft hold on inventory.' },
            { step: 7, label: 'Authorize Payment', group: '💳 Payment APIs', path: '/api/v1/payments/authorize', method: 'POST', auth_type: 'bearer', note: 'Authorize payment hold. Store authorizationId.' },
            { step: 8, label: 'Submit Order', group: '📦 Order APIs', path: '/api/v1/orders/{orderId}/submit', method: 'POST', auth_type: 'bearer', note: 'Submit draft order for fulfillment.' },
            { step: 9, label: 'Capture Payment', group: '💳 Payment APIs', path: '/api/v1/payments/capture', method: 'POST', auth_type: 'bearer', note: 'Capture the authorized payment.' },
            { step: 10, label: 'Create Shipment', group: '🚚 Shipping & Fulfillment APIs', path: '/api/v1/shipments', method: 'POST', auth_type: 'client_creds', note: 'Create warehouse pick/pack/ship task.' },
            { step: 11, label: 'Update Shipment Status', group: '🚚 Shipping & Fulfillment APIs', path: '/api/v1/shipments/{shipmentId}/status', method: 'PUT', auth_type: 'client_creds', note: 'Mark order as SHIPPED with tracking number.' },
            { step: 12, label: 'Track Shipment', group: '🚚 Shipping & Fulfillment APIs', path: '/api/v1/tracking/{trackingNumber}', method: 'GET', auth_type: 'api_key', note: 'Verify tracking events are created.' }
        ]
    },
    {
        id: 'order-cancellation',
        name: '❌ Order Cancellation Flow',
        description: 'Cancel an order after submission: verify inventory release and payment void',
        steps: [
            { step: 1, label: 'Get Access Token', group: '🔐 Auth APIs', path: '/oauth/v1/token', method: 'POST', auth_type: 'none', note: 'Authenticate.' },
            { step: 2, label: 'Get Order Details', group: '📦 Order APIs', path: '/api/v1/orders/{orderId}', method: 'GET', auth_type: 'bearer', note: 'Confirm order is in a cancellable status.' },
            { step: 3, label: 'Cancel Order', group: '📦 Order APIs', path: '/api/v1/orders/{orderId}/cancel', method: 'POST', auth_type: 'bearer', note: 'Request order cancellation.' },
            { step: 4, label: 'Verify Inventory Released', group: '🏭 Inventory APIs', path: '/api/v1/inventory/{productId}', method: 'GET', auth_type: 'client_creds', note: 'Confirm inventory hold was released.' },
            { step: 5, label: 'Void Payment', group: '💳 Payment APIs', path: '/api/v1/payments/void', method: 'POST', auth_type: 'bearer', note: 'Void the authorized payment.' },
            { step: 6, label: 'Check Order Status', group: '📦 Order APIs', path: '/api/v1/orders/{orderId}/status', method: 'GET', auth_type: 'bearer', note: 'Confirm final status is CANCELLED.' }
        ]
    },
    {
        id: 'returns-flow',
        name: '↩️ Returns & Refund Flow',
        description: 'Process a return: Create RMA → Generate label → Receive return → Issue refund',
        steps: [
            { step: 1, label: 'Get Access Token', group: '🔐 Auth APIs', path: '/oauth/v1/token', method: 'POST', auth_type: 'none', note: 'Authenticate.' },
            { step: 2, label: 'Get Order Details', group: '📦 Order APIs', path: '/api/v1/orders/{orderId}', method: 'GET', auth_type: 'bearer', note: 'Retrieve the order to find orderItemId.' },
            { step: 3, label: 'Create RMA', group: '↩️ Returns & RMA APIs', path: '/api/v1/returns', method: 'POST', auth_type: 'bearer', note: 'Create return authorization. Store returnId.' },
            { step: 4, label: 'Generate Return Label', group: '↩️ Returns & RMA APIs', path: '/api/v1/returns/{returnId}/label', method: 'POST', auth_type: 'bearer', note: 'Generate prepaid shipping label for customer.' },
            { step: 5, label: 'Update RMA — Received', group: '↩️ Returns & RMA APIs', path: '/api/v1/returns/{returnId}/status', method: 'PUT', auth_type: 'client_creds', note: 'Warehouse marks return as RECEIVED.' },
            { step: 6, label: 'Issue Refund', group: '💳 Payment APIs', path: '/api/v1/payments/refund', method: 'POST', auth_type: 'bearer', note: 'Process the refund to original payment method.' },
            { step: 7, label: 'Update RMA — Refunded', group: '↩️ Returns & RMA APIs', path: '/api/v1/returns/{returnId}/status', method: 'PUT', auth_type: 'client_creds', note: 'Mark return as fully REFUNDED.' }
        ]
    }
];

/* Test Scenario definitions */
window.OMS_TEST_SCENARIOS = [
    {
        category: '🟢 Happy Path Scenarios',
        scenarios: [
            { id: 'TC-001', name: 'Create and submit single-item order', priority: 'P0', tags: ['orders', 'smoke'], description: 'Verify a customer can create a new order with one item and submit for processing successfully.' },
            { id: 'TC-002', name: 'Create and submit multi-item order', priority: 'P0', tags: ['orders', 'smoke'], description: 'Verify order creation with 3+ line items, verify total price calculation and inventory reserve.' },
            { id: 'TC-003', name: 'OAuth client_credentials token flow', priority: 'P0', tags: ['auth', 'smoke'], description: 'Verify client can obtain access_token via client_credentials grant and use it for API calls.' },
            { id: 'TC-004', name: 'OAuth password grant token flow', priority: 'P1', tags: ['auth'], description: 'Verify resource owner password grant returns valid access_token and refresh_token.' },
            { id: 'TC-005', name: 'Token refresh flow', priority: 'P1', tags: ['auth'], description: 'Verify refresh_token can be used to obtain a new access_token without re-authentication.' },
            { id: 'TC-006', name: 'API Key authentication', priority: 'P1', tags: ['auth', 'catalog'], description: 'Verify product catalog APIs return 200 with valid API key in X-API-Key header.' },
            { id: 'TC-007', name: 'Basic auth for admin APIs', priority: 'P1', tags: ['auth', 'admin'], description: 'Verify admin report endpoints accept valid Basic Auth credentials.' },
            { id: 'TC-008', name: 'Full order lifecycle (E2E)', priority: 'P0', tags: ['e2e', 'orders', 'regression'], description: 'Complete flow: auth → product → inventory → customer → order → payment → fulfillment → tracking.' },
            { id: 'TC-009', name: 'Customer profile CRUD', priority: 'P1', tags: ['customers'], description: 'Create, read, update customer profile. Verify field validation and response schema.' },
            { id: 'TC-010', name: 'Product catalog search and filter', priority: 'P1', tags: ['catalog'], description: 'Search products by name, filter by category/price range. Verify pagination.' }
        ]
    },
    {
        category: '🔴 Negative / Error Scenarios',
        scenarios: [
            { id: 'TC-101', name: 'Order with expired access token', priority: 'P0', tags: ['auth', 'security'], description: 'Verify API returns 401 Unauthorized when access token is expired.' },
            { id: 'TC-102', name: 'Order with missing required fields', priority: 'P0', tags: ['orders', 'validation'], description: 'Verify 400 Bad Request with validation error details when customerId is missing.' },
            { id: 'TC-103', name: 'Get non-existent order', priority: 'P1', tags: ['orders'], description: 'Verify 404 Not Found is returned for an orderId that does not exist.' },
            { id: 'TC-104', name: 'Order quantity exceeds inventory', priority: 'P0', tags: ['orders', 'inventory'], description: 'Verify order creation fails with 409 Conflict when requested quantity > available stock.' },
            { id: 'TC-105', name: 'Cancel already-shipped order', priority: 'P1', tags: ['orders'], description: 'Verify 422 Unprocessable Entity when attempting to cancel an order in SHIPPED status.' },
            { id: 'TC-106', name: 'Duplicate order submission', priority: 'P1', tags: ['orders', 'idempotency'], description: 'Verify idempotency key prevents duplicate order creation on retry.' },
            { id: 'TC-107', name: 'Payment authorization failure', priority: 'P0', tags: ['payments'], description: 'Verify order is rolled back when payment authorization returns declined.' },
            { id: 'TC-108', name: 'Invalid API key', priority: 'P0', tags: ['auth', 'security'], description: 'Verify 403 Forbidden returned when X-API-Key is invalid or revoked.' },
            { id: 'TC-109', name: 'GDPR delete — active orders check', priority: 'P1', tags: ['customers', 'compliance'], description: 'Verify customer deletion is blocked if they have active open orders.' },
            { id: 'TC-110', name: 'Rate limiting enforcement', priority: 'P2', tags: ['performance', 'security'], description: 'Verify 429 Too Many Requests after exceeding rate limit. Verify Retry-After header.' }
        ]
    },
    {
        category: '⚡ Performance Scenarios',
        scenarios: [
            { id: 'TC-201', name: 'GET /orders response time SLA', priority: 'P1', tags: ['performance', 'sla'], description: 'Verify list orders endpoint responds within 3s SLA under normal load.' },
            { id: 'TC-202', name: 'POST /orders throughput', priority: 'P1', tags: ['performance'], description: 'Verify order creation handles 100 req/min without degradation.' },
            { id: 'TC-203', name: 'Token endpoint latency', priority: 'P1', tags: ['performance', 'auth'], description: 'Verify OAuth token endpoint responds within 2s SLA.' },
            { id: 'TC-204', name: 'Inventory reserve under concurrency', priority: 'P0', tags: ['performance', 'inventory'], description: 'Verify no overselling occurs when 50 concurrent requests reserve the last item.' }
        ]
    },
    {
        category: '🔒 Security Scenarios',
        scenarios: [
            { id: 'TC-301', name: 'SQL Injection in search params', priority: 'P0', tags: ['security'], description: "Verify GET /orders?status='; DROP TABLE orders;-- returns 400 and does not execute SQL." },
            { id: 'TC-302', name: 'Cross-tenant data isolation', priority: 'P0', tags: ['security', 'multi-tenant'], description: 'Verify client A cannot read orders belonging to client B using their token.' },
            { id: 'TC-303', name: 'Sensitive data in logs', priority: 'P1', tags: ['security', 'compliance'], description: 'Verify payment tokens and passwords are never logged in plain text.' },
            { id: 'TC-304', name: 'Token scope enforcement', priority: 'P0', tags: ['security', 'auth'], description: 'Verify a token with orders:read scope cannot call POST /orders (returns 403).' }
        ]
    }
];
