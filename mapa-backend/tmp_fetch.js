const http = require('http');
http.get('/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => { console.log('STATUS', res.statusCode); console.log(d); });
}).on('error', e => console.error('ERR', e));
