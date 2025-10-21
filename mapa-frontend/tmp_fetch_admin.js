const http = require('http');
http.get('http://localhost:4200/admin/services', res => {
  console.log('STATUS', res.statusCode);
  let d=''; res.on('data', c=> d+=c);
  res.on('end', ()=> { console.log(d.slice(0,800)); });
}).on('error', e=> console.error('ERR', e));
