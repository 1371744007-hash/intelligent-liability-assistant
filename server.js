const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { ApiError, bootstrapData, analyzeRequest } = require('./lib/api');

function loadEnv() {
  const p = path.join(__dirname,'.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p,'utf8').split(/\r?\n/)) {
    const m=line.match(/^([A-Z0-9_]+)=(.*)$/); if(m && !process.env[m[1]]) process.env[m[1]]=m[2].trim();
  }
}
loadEnv();
const publicDir=path.join(__dirname,'public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));}
function readBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',c=>{body+=c;if(body.length>25*1024*1024){reject(new Error('请求超过 25MB 限制'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(body||'{}'))}catch{reject(new Error('请求 JSON 格式无效'))}});req.on('error',reject);});}

const server=http.createServer(async(req,res)=>{
  try {
    if(req.method==='GET'&&req.url==='/api/bootstrap') return json(res,200,bootstrapData());
    if(req.method==='POST'&&req.url==='/api/analyze'){
      const body=await readBody(req);
      return json(res,200,{result:await analyzeRequest(body)});
    }
    if(req.method==='GET'){
      const pathname=req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0]);
      const file=path.normalize(path.join(publicDir,pathname));
      if(!file.startsWith(publicDir)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end('Not found');}
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});return fs.createReadStream(file).pipe(res);
    }
    res.writeHead(405);res.end('Method not allowed');
  } catch(e){console.error(e);if(!res.headersSent)json(res,e instanceof ApiError?e.status:500,{error:e.message||'服务端错误'});}
});
if(require.main===module){const port=Number(process.env.PORT)||3000;server.listen(port,()=>console.log(`智能判责助手已启动：http://localhost:${port}`));}
module.exports={server};
