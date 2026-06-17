/* OMS Testing Tool — Environment Configuration
   Each environment defines API base URLs, OAuth base, and tool links.
*/
window.OMS_ENVS = {
    dev: {
        label: 'DEV',
        host: 'http://localhost:8080',
        apiBase: 'http://localhost:8080',
        oauthBase: 'http://localhost:8080',
        tools: [
            { label: '🔍 Swagger UI', url: 'http://localhost:8080/swagger-ui.html' },
            { label: '📊 Actuator', url: 'http://localhost:8080/actuator/health' },
            { label: '🗄️ H2 Console', url: 'http://localhost:8080/h2-console' }
        ],
        links: []
    },
    qa: {
        label: 'QA',
        host: 'https://oms-api-qa.acme-corp.com',
        apiBase: 'https://oms-api-qa.acme-corp.com',
        oauthBase: 'https://auth-qa.acme-corp.com',
        tools: [
            { label: '📊 Kibana', url: 'https://kibana-qa.acme-corp.com/app/discover', cls: 'elk' },
            { label: '🔍 Swagger', url: 'https://oms-api-qa.acme-corp.com/swagger-ui.html' },
            { label: '📈 Grafana', url: 'https://grafana-qa.acme-corp.com' },
            { label: '🐛 Jira', url: 'https://jira.acme-corp.com/projects/OMS' }
        ],
        links: []
    },
    uat: {
        label: 'UAT',
        host: 'https://oms-api-uat.acme-corp.com',
        apiBase: 'https://oms-api-uat.acme-corp.com',
        oauthBase: 'https://auth-uat.acme-corp.com',
        tools: [
            { label: '📊 Kibana', url: 'https://kibana-uat.acme-corp.com/app/discover', cls: 'elk' },
            { label: '🔍 Swagger', url: 'https://oms-api-uat.acme-corp.com/swagger-ui.html' },
            { label: '📈 Grafana', url: 'https://grafana-uat.acme-corp.com' },
            { label: '📦 Release Notes', url: 'https://confluence.acme-corp.com/display/OMS/UAT+Release' }
        ],
        links: []
    },
    prod: {
        label: 'PROD',
        host: 'https://oms-api.acme-corp.com',
        apiBase: 'https://oms-api.acme-corp.com',
        oauthBase: 'https://auth.acme-corp.com',
        tools: [
            { label: '📊 Kibana', url: 'https://kibana.acme-corp.com/app/discover', cls: 'elk' },
            { label: '📈 Grafana', url: 'https://grafana.acme-corp.com/d/oms-dashboard' },
            { label: '🚨 PagerDuty', url: 'https://acme-corp.pagerduty.com/incidents' },
            { label: '📋 RunBook', url: 'https://confluence.acme-corp.com/display/OMS/Production+RunBook' }
        ],
        links: []
    }
};
