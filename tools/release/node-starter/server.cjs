// Docker環境の起動確認専用。業務用アプリケーションではありません。
const http = require('node:http');
http.createServer((_request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
  response.end('Server Control Studio Node.js startup OK\n');
}).listen(3000, '0.0.0.0');
