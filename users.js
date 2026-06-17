/* OMS Testing Tool — Test Users Configuration */
window.OMS_USERS = {
    dev: {
        users: [
            { username: 'john.doe@dev.acme-corp.com',    password: 'TestUser@Dev1!',  role: 'Customer',       note: 'Standard customer account with order history' },
            { username: 'jane.smith@dev.acme-corp.com',  password: 'TestUser@Dev2!',  role: 'Customer',       note: 'New customer — no prior orders' },
            { username: 'oms.agent@dev.acme-corp.com',   password: 'Agent@Dev#2024',  role: 'Support Agent',  note: 'CS agent — can view/update all orders' },
            { username: 'oms.admin@dev.acme-corp.com',   password: 'Admin@OMS#Dev1',  role: 'Admin',          note: 'Full admin — all permissions including reports' },
            { username: 'warehouse@dev.acme-corp.com',   password: 'WH@Dev#Ops99',    role: 'Warehouse Ops',  note: 'Warehouse operator — shipment and inventory access' },
            { username: 'readonly@dev.acme-corp.com',    password: 'Read@Only#Dev1',  role: 'Read-Only',      note: 'Read-only access — used for smoke tests' }
        ],
        service_accounts: [
            { username: 'svc-orderportal@dev.acme-corp.com',  password: 'SvcPortal@Dev#001',  service: 'Order Portal',       scope: 'orders:read orders:write' },
            { username: 'svc-fulfillment@dev.acme-corp.com',  password: 'SvcFulfill@Dev#002', service: 'Fulfillment Service', scope: 'shipments:write inventory:write' },
            { username: 'svc-payment@dev.acme-corp.com',      password: 'SvcPay@Dev#003',     service: 'Payment Gateway',    scope: 'payments:write orders:read' }
        ]
    },
    qa: {
        users: [
            { username: 'john.doe@qa.acme-corp.com',    password: 'TestUser@QA1!',   role: 'Customer',       note: 'Standard customer with 5+ historical orders' },
            { username: 'jane.smith@qa.acme-corp.com',  password: 'TestUser@QA2!',   role: 'Customer',       note: 'Customer with pending return request' },
            { username: 'oms.agent@qa.acme-corp.com',   password: 'Agent@QA#2024',   role: 'Support Agent',  note: 'QA CS agent account' },
            { username: 'oms.admin@qa.acme-corp.com',   password: 'Admin@OMS#QA1',   role: 'Admin',          note: 'QA admin — all permissions' },
            { username: 'warehouse@qa.acme-corp.com',   password: 'WH@QA#Ops99',     role: 'Warehouse Ops',  note: 'QA warehouse operator' }
        ],
        service_accounts: [
            { username: 'svc-orderportal@qa.acme-corp.com',  password: 'SvcPortal@QA#001',  service: 'Order Portal',       scope: 'orders:read orders:write' },
            { username: 'svc-fulfillment@qa.acme-corp.com',  password: 'SvcFulfill@QA#002', service: 'Fulfillment Service', scope: 'shipments:write inventory:write' }
        ]
    },
    uat: {
        users: [
            { username: 'uat.tester1@uat.acme-corp.com',  password: 'UatTest@1#2024',  role: 'Customer',       note: 'UAT acceptance tester account 1' },
            { username: 'uat.tester2@uat.acme-corp.com',  password: 'UatTest@2#2024',  role: 'Customer',       note: 'UAT acceptance tester account 2' },
            { username: 'uat.admin@uat.acme-corp.com',    password: 'UatAdmin@#2024',  role: 'Admin',          note: 'UAT admin for acceptance sign-off' }
        ],
        service_accounts: [
            { username: 'svc-orderportal@uat.acme-corp.com',  password: 'SvcPortal@UAT#001', service: 'Order Portal', scope: 'orders:read orders:write' }
        ]
    },
    prod: {
        users: [
            { username: 'break-glass@acme-corp.com',  password: '*** USE PAM VAULT ***',  role: 'Break-Glass Admin',  note: 'Emergency access only — requires approval workflow' }
        ],
        service_accounts: [
            { username: 'svc-orderportal@acme-corp.com',  password: '*** USE VAULT ***',  service: 'Order Portal', scope: 'orders:read orders:write' }
        ]
    }
};
