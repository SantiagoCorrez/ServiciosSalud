const http = require('http');
const formats = ['detailed','feature','aggregated'];
(async function(){
  for (const f of formats){
    await new Promise((resolve)=>{
      http.get(`http://localhost:3000/api/public/details/1?format=${f}`, res => {
        let d=''; res.on('data',c=>d+=c); res.on('end', ()=>{ console.log('---',f,'status',res.statusCode); try{ console.log(JSON.parse(d)); }catch(e){ console.log(d); } resolve(); });
      }).on('error', e=>{ console.error('ERR',e); resolve(); });
    });
  }
})();
