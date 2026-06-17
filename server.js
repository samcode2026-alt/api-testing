const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8081;
const LOG_HEADERS = process.env.LOG_HEADERS !== 'false';

let serverOptions;

serverOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         OMS API Testing Tool - Server Starting               ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`Using PEM certificates from certs/`);
console.log(`Header logging: ${LOG_HEADERS ? 'ENABLED' : 'DISABLED'}`);

const MIME_TYPES = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon'
};

const server = https.createServer(serverOptions, (req, res) => {

    // ── CORS pre-flight ──────────────────────────────────────────────
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key,X-Correlation-Id'
        });
        res.end();
        return;
    }

    // ── Proxy endpoint ───────────────────────────────────────────────
    if (req.method === 'POST' && req.url === '/api/proxy') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let parsed;
            try { parsed = JSON.parse(body); } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                return;
            }

            const {
                method = 'GET',
                url: targetUrl,
                token,
                apiKey,
                basicAuth,
                formBody,
                contentType,
                jsonBody,
                extraHeaders = {}
            } = parsed;

            if (!targetUrl) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing url field' }));
                return;
            }

            let parsedUrl;
            try { parsedUrl = new URL(targetUrl); } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid target URL: ' + e.message }));
                return;
            }

            // Build request headers
            const reqHeaders = {
                'Accept': 'application/json, */*',
                'X-Correlation-Id': `oms-test-${Date.now()}`
            };

            if (token)     reqHeaders['Authorization'] = `Bearer ${token}`;
            if (apiKey)    reqHeaders['X-API-Key'] = apiKey;
            if (basicAuth) reqHeaders['Authorization'] = `Basic ${Buffer.from(basicAuth).toString('base64')}`;

            let reqBody = null;
            if (formBody) {
                reqHeaders['Content-Type'] = contentType || 'application/x-www-form-urlencoded';
                reqHeaders['Content-Length'] = Buffer.byteLength(formBody);
                reqBody = formBody;
            } else if (jsonBody) {
                reqHeaders['Content-Type'] = 'application/json';
                const jsonStr = typeof jsonBody === 'string' ? jsonBody : JSON.stringify(jsonBody);
                reqHeaders['Content-Length'] = Buffer.byteLength(jsonStr);
                reqBody = jsonStr;
            }

            // Merge extra headers
            Object.assign(reqHeaders, extraHeaders);

            const proto = parsedUrl.protocol === 'https:' ? https : http;
            const reqOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: method.toUpperCase(),
                headers: reqHeaders,
                rejectUnauthorized: false
            };

            const startTime = new Date();
            const t0 = Date.now();

            if (LOG_HEADERS) {
                console.log('\n══════════════════════════════════════════════════════════════');
                console.log(`[OMS PROXY] ${method.toUpperCase()} ${targetUrl}`);
                console.log(`▶ Start: ${startTime.toLocaleTimeString()}.${String(startTime.getMilliseconds()).padStart(3,'0')}`);
                console.log('Request Headers:');
                Object.entries(reqHeaders).forEach(([k, v]) => {
                    let dv = v;
                    if (k.toLowerCase() === 'authorization') dv = dv.startsWith('Basic') ? 'Basic [REDACTED]' : 'Bearer [REDACTED]';
                    if (k.toLowerCase() === 'x-api-key') dv = '[REDACTED]';
                    console.log(`  ${k}: ${dv}`);
                });
                if (reqBody) {
                    const masked = reqBody.replace(/(client_secret|password|token|api_key)=([^&\s"]+)/gi, '$1=[REDACTED]');
                    console.log(`Request Body: ${masked.substring(0, 300)}${masked.length > 300 ? '...' : ''}`);
                }
            }

            const proxyReq = proto.request(reqOptions, proxyRes => {
                let respBody = '';
                proxyRes.setEncoding('utf8');
                proxyRes.on('data', chunk => { respBody += chunk; });
                proxyRes.on('end', () => {
                    const duration = Date.now() - t0;
                    const endTime = new Date();

                    if (LOG_HEADERS) {
                        console.log('──────────────────────────────────────────────────────────────');
                        console.log(`[OMS RESPONSE] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
                        console.log(`◀ End: ${endTime.toLocaleTimeString()}.${String(endTime.getMilliseconds()).padStart(3,'0')}`);
                        console.log(`⏱  Duration: ${duration} ms`);
                        console.log('Response Headers:');
                        Object.entries(proxyRes.headers).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
                        console.log('══════════════════════════════════════════════════════════════\n');
                    }

                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({
                        status: proxyRes.statusCode,
                        statusText: proxyRes.statusMessage,
                        headers: proxyRes.headers,
                        body: respBody,
                        duration
                    }));
                });
            });

            proxyReq.on('error', err => {
                const duration = Date.now() - t0;
                if (LOG_HEADERS) {
                    console.log(`[OMS PROXY ERROR] ${err.message} (${duration}ms)`);
                }
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message, duration }));
            });

            if (reqBody) proxyReq.write(reqBody);
            proxyReq.end();
        });
        return;
    }

    // ── Static file server ───────────────────────────────────────────
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // Strip query string for file lookup
    filePath = filePath.split('?')[0];
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found: ' + req.url);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`\n✅ OMS Testing Tool running at: https://localhost:${PORT}/`);
    console.log(`   Accept self-signed cert warning to proceed.\n`);
});
