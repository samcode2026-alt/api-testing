/* OMS Testing Tool — API Client / Application Configuration
   Supports multiple auth types: OAuth2, API Key, Basic Auth
*/
window.OMS_CLIENTS = {
    dev: [
        {
            app_name: 'Order Portal Web App',
            client_id: 'order-portal-dev-001',
            client_secret: 'dev-secret-orderportal-abc123xyz',
            api_key: 'ak-dev-orderportal-k9mN2pQ8rT5vW',
            username: 'orderportal-svc@dev.acme-corp.com',
            password: 'DevPortal@2024!',
            app_type: 'OAuth2',
            grant_types: ['client_credentials', 'authorization_code', 'password'],
            scopes: 'orders:read orders:write customers:read customers:write',
            redirect_uri: 'http://localhost:3000/oauth/callback',
            app_description: 'Main customer-facing order portal — OAuth2 client_credentials + auth code',
            contact: 'team-storefront@acme-corp.com'
        },
        {
            app_name: 'Fulfillment Service',
            client_id: 'fulfillment-svc-dev-002',
            client_secret: 'dev-secret-fulfillment-pqr456stu',
            api_key: 'ak-dev-fulfillment-j3hB7nX1yZ4',
            username: 'fulfillment-svc@dev.acme-corp.com',
            password: 'FulfillSvc@Dev#99',
            app_type: 'OAuth2',
            grant_types: ['client_credentials'],
            scopes: 'orders:read shipments:read shipments:write inventory:read inventory:write',
            redirect_uri: '',
            app_description: 'Internal fulfillment/warehouse service — machine-to-machine OAuth',
            contact: 'team-fulfillment@acme-corp.com'
        },
        {
            app_name: 'Partner Integration API',
            client_id: 'partner-api-dev-003',
            client_secret: 'dev-secret-partner-lmn789opq',
            api_key: 'ak-dev-partner-a5Ck9mQ2wE7',
            username: 'partner-api@dev.acme-corp.com',
            password: 'Partner@Dev2024',
            app_type: 'API Key',
            grant_types: ['client_credentials'],
            scopes: 'products:read inventory:read orders:read',
            redirect_uri: '',
            app_description: 'External partner catalog and inventory integration — API Key auth',
            contact: 'integrations@acme-corp.com'
        },
        {
            app_name: 'Mobile App (iOS/Android)',
            client_id: 'mobile-app-dev-004',
            client_secret: 'dev-secret-mobile-rst012uvw',
            api_key: 'ak-dev-mobile-b8Df3nM6yH1',
            username: 'mobile-test@dev.acme-corp.com',
            password: 'MobileTest@2024',
            app_type: 'OAuth2 PKCE',
            grant_types: ['authorization_code'],
            scopes: 'orders:read orders:write customers:read',
            redirect_uri: 'acmeshop://oauth/callback',
            app_description: 'Native mobile app — OAuth2 PKCE flow (no client_secret)',
            contact: 'team-mobile@acme-corp.com'
        },
        {
            app_name: 'Admin Dashboard',
            client_id: 'admin-dash-dev-005',
            client_secret: 'dev-secret-admin-xyz345abc',
            api_key: 'ak-dev-admin-c2Gh7pR4sK9',
            username: 'oms-admin@dev.acme-corp.com',
            password: 'Admin@OMS#Dev1',
            app_type: 'Basic Auth',
            grant_types: ['password'],
            scopes: 'orders:* customers:* inventory:* reports:*',
            redirect_uri: '',
            app_description: 'Internal admin dashboard — Basic Auth (admin operations)',
            contact: 'oms-admins@acme-corp.com'
        },
        {
            app_name: 'Payment Gateway Connector',
            client_id: 'payment-gw-dev-006',
            client_secret: 'dev-secret-payment-def678ghi',
            api_key: 'ak-dev-payment-d4Jk1tV8uN3',
            username: 'payment-svc@dev.acme-corp.com',
            password: 'PayGW@Dev#2024',
            app_type: 'OAuth2',
            grant_types: ['client_credentials'],
            scopes: 'payments:read payments:write orders:read',
            redirect_uri: '',
            app_description: 'Payment processing microservice — OAuth2 client credentials',
            contact: 'team-payments@acme-corp.com'
        }
    ],

    qa: [
        {
            app_name: 'Order Portal Web App',
            client_id: 'order-portal-qa-001',
            client_secret: 'qa-secret-orderportal-ABC123XYZ',
            api_key: 'ak-qa-orderportal-K9MN2PQ8RT5V',
            username: 'orderportal-svc@qa.acme-corp.com',
            password: 'QaPortal@2024!',
            app_type: 'OAuth2',
            grant_types: ['client_credentials', 'authorization_code', 'password'],
            scopes: 'orders:read orders:write customers:read customers:write',
            redirect_uri: 'https://oms-portal-qa.acme-corp.com/oauth/callback',
            app_description: 'QA: Main customer-facing order portal',
            contact: 'team-storefront@acme-corp.com'
        },
        {
            app_name: 'Fulfillment Service',
            client_id: 'fulfillment-svc-qa-002',
            client_secret: 'qa-secret-fulfillment-PQR456STU',
            api_key: 'ak-qa-fulfillment-J3HB7NX1YZ4',
            username: 'fulfillment-svc@qa.acme-corp.com',
            password: 'FulfillSvc@QA#99',
            app_type: 'OAuth2',
            grant_types: ['client_credentials'],
            scopes: 'orders:read shipments:read shipments:write inventory:read inventory:write',
            redirect_uri: '',
            app_description: 'QA: Internal fulfillment service',
            contact: 'team-fulfillment@acme-corp.com'
        },
        {
            app_name: 'Partner Integration API',
            client_id: 'partner-api-qa-003',
            client_secret: 'qa-secret-partner-LMN789OPQ',
            api_key: 'ak-qa-partner-A5CK9MQ2WE7',
            username: 'partner-api@qa.acme-corp.com',
            password: 'Partner@QA2024',
            app_type: 'API Key',
            grant_types: ['client_credentials'],
            scopes: 'products:read inventory:read orders:read',
            redirect_uri: '',
            app_description: 'QA: External partner integration',
            contact: 'integrations@acme-corp.com'
        },
        {
            app_name: 'Admin Dashboard',
            client_id: 'admin-dash-qa-004',
            client_secret: 'qa-secret-admin-XYZ345ABC',
            api_key: 'ak-qa-admin-C2GH7PR4SK9',
            username: 'oms-admin@qa.acme-corp.com',
            password: 'Admin@OMS#QA1',
            app_type: 'Basic Auth',
            grant_types: ['password'],
            scopes: 'orders:* customers:* inventory:* reports:*',
            redirect_uri: '',
            app_description: 'QA: Internal admin dashboard',
            contact: 'oms-admins@acme-corp.com'
        }
    ],

    uat: [
        {
            app_name: 'Order Portal Web App',
            client_id: 'order-portal-uat-001',
            client_secret: 'uat-secret-orderportal-aB1cD2eF3g',
            api_key: 'ak-uat-orderportal-mN4oP5qR6s',
            username: 'orderportal-svc@uat.acme-corp.com',
            password: 'UatPortal@2024!',
            app_type: 'OAuth2',
            grant_types: ['client_credentials', 'authorization_code'],
            scopes: 'orders:read orders:write customers:read customers:write',
            redirect_uri: 'https://oms-portal-uat.acme-corp.com/oauth/callback',
            app_description: 'UAT: Main customer-facing order portal',
            contact: 'team-storefront@acme-corp.com'
        },
        {
            app_name: 'Fulfillment Service',
            client_id: 'fulfillment-svc-uat-002',
            client_secret: 'uat-secret-fulfillment-hI7jK8lM9n',
            api_key: 'ak-uat-fulfillment-tU1vW2xY3z',
            username: 'fulfillment-svc@uat.acme-corp.com',
            password: 'FulfillSvc@UAT#77',
            app_type: 'OAuth2',
            grant_types: ['client_credentials'],
            scopes: 'orders:read shipments:read shipments:write inventory:read inventory:write',
            redirect_uri: '',
            app_description: 'UAT: Internal fulfillment service',
            contact: 'team-fulfillment@acme-corp.com'
        },
        {
            app_name: 'Partner Integration API',
            client_id: 'partner-api-uat-003',
            client_secret: 'uat-secret-partner-oP4qR5sT6u',
            api_key: 'ak-uat-partner-aB7cD8eF9g',
            username: 'partner-api@uat.acme-corp.com',
            password: 'Partner@UAT2024',
            app_type: 'API Key',
            grant_types: ['client_credentials'],
            scopes: 'products:read inventory:read orders:read',
            redirect_uri: '',
            app_description: 'UAT: External partner integration',
            contact: 'integrations@acme-corp.com'
        }
    ],

    prod: [
        {
            app_name: 'Order Portal Web App',
            client_id: 'order-portal-prod-001',
            client_secret: '*** REDACTED — use Vault ***',
            api_key: '*** REDACTED — use Vault ***',
            username: 'orderportal-svc@acme-corp.com',
            password: '*** REDACTED ***',
            app_type: 'OAuth2',
            grant_types: ['client_credentials', 'authorization_code'],
            scopes: 'orders:read orders:write customers:read customers:write',
            redirect_uri: 'https://shop.acme-corp.com/oauth/callback',
            app_description: 'PROD: Main customer-facing order portal',
            contact: 'team-storefront@acme-corp.com'
        },
        {
            app_name: 'Fulfillment Service',
            client_id: 'fulfillment-svc-prod-002',
            client_secret: '*** REDACTED — use Vault ***',
            api_key: '*** REDACTED — use Vault ***',
            username: 'fulfillment-svc@acme-corp.com',
            password: '*** REDACTED ***',
            app_type: 'OAuth2',
            grant_types: ['client_credentials'],
            scopes: 'orders:read shipments:read shipments:write inventory:read inventory:write',
            redirect_uri: '',
            app_description: 'PROD: Internal fulfillment service',
            contact: 'team-fulfillment@acme-corp.com'
        }
    ]
};
