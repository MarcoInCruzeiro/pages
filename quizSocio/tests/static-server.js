/*
 * Servidor estático mínimo para os testes de navegador. Serve apenas a raiz do
 * projeto, sem diretórios acima dela.
 */
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.ico': 'image/x-icon'
};

function startServer(root, preferredPort = 0) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((request, response) => {
            const url = new URL(request.url, 'http://localhost');
            const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
            const filePath = path.resolve(root, `.${requested}`);
            if (!filePath.startsWith(path.resolve(root) + path.sep)) {
                response.writeHead(403);
                response.end('Forbidden');
                return;
            }
            fs.readFile(filePath, (error, data) => {
                if (error) {
                    response.writeHead(404);
                    response.end('Not found');
                    return;
                }
                response.writeHead(200, {
                    'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
                    'Cache-Control': 'no-store'
                });
                response.end(data);
            });
        });
        server.on('error', reject);
        server.listen(preferredPort, '127.0.0.1', () => {
            const { port } = server.address();
            resolve({
                server,
                port,
                baseUrl: `http://127.0.0.1:${port}`,
                close: () => new Promise((done) => server.close(done))
            });
        });
    });
}

module.exports = { startServer };

if (require.main === module) {
    const root = path.resolve(__dirname, '..');
    const preferredPort = Number(process.env.PORT) || 0;
    startServer(root, preferredPort).then(({ baseUrl, close }) => {
        console.log(`Quiz disponível em ${baseUrl}/index.html`);
        console.log('Pressione Ctrl+C para encerrar.');
        process.on('SIGINT', () => close().then(() => process.exit(0)));
    }).catch((error) => {
        console.error(error.message);
        process.exit(1);
    });
}
