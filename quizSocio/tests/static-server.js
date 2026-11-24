/*
 * Servidor estático mínimo para os testes de navegador. Serve apenas a raiz do
 * projeto, sem diretórios acima dela.
 *
 * Escuta em pilha dupla (:: com IPv4-mapped) para provar os ambientes de
 * loopback exigidos pelo QUIZ-013 (http://[::1]/ e http://127.0.0.2/). A guarda
 * de conexão aceita somente loopback, preservando o escopo local. A variante
 * TLS (certificado próprio de teste em fixtures/certs) existe para simular o
 * host de produção publicado: quiz-socio.vercel.app é um TLD .app sujeito ao
 * HSTS do Chrome e não responde por HTTP simples.
 *
 * O chamador escolhe explicitamente a raiz (dist ou um pacote isolado).
 * Nunca troca essa raiz por outra cópia do projeto de forma implícita.
 */
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const path = require('node:path');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.ico': 'image/x-icon'
};

function isLoopbackAddress(remoteAddress) {
    let address = String(remoteAddress || '');
    if (address.startsWith('::ffff:')) address = address.slice('::ffff:'.length);
    return address === '::1' || address === '::1%' + 'lo' || address.startsWith('127.');
}

function staticHandler(root) {
    return (request, response) => {
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
    };
}

function listen(server, preferredPort) {
    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen({ port: preferredPort, host: '::', ipv6Only: false }, () => {
            server.removeListener('error', reject);
            const { port } = server.address();
            resolve(port);
        });
    });
}

/*
 * startServer(root, port, { tls })
 * tls=true usa fixtures/certs (SAN cobre quiz-socio.vercel.app e quiz-test.local).
 */
function startServer(root, preferredPort = 0, { tls = false } = {}) {
    const raiz = path.resolve(root);
    return new Promise(async (resolve, reject) => {
        let server;
        if (tls) {
            server = https.createServer({
                key: fs.readFileSync(path.join(__dirname, 'fixtures', 'certs', 'quiz-test.key')),
                cert: fs.readFileSync(path.join(__dirname, 'fixtures', 'certs', 'quiz-test.crt'))
            }, staticHandler(raiz));
        } else {
            server = http.createServer(staticHandler(raiz));
        }
        server.on('connection', (socket) => {
            if (!isLoopbackAddress(socket.remoteAddress)) {
                socket.destroy();
                return;
            }
            socket.setNoDelay(true);
        });
        server.on('error', reject);
        let port;
        try {
            port = await listen(server, preferredPort);
        } catch (error) {
            reject(error);
            return;
        }
        resolve({
            server,
            port,
            baseUrl: `http://127.0.0.1:${port}`,
            httpsBaseUrl: `https://quiz-socio.vercel.app:${port}`,
            close: () => new Promise((done) => server.close(done))
        });
    });
}

module.exports = { startServer };

if (require.main === module) {
    const root = path.resolve(__dirname, '..', 'dist');
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
