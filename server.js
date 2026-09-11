const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { orders } = require('./data/orders');
const { cases } = require('./data/cases');
const { readRules } = require('./lib/rules');
const { analyze } = require('./lib/openai');

function loadEnv() {
  const p = path.join(__dirname,'.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p,'utf8').split(/\r?\n/)) {
    const m=line.match(/^([A-Z0-9_]+)=(.*)$/); if(m && !process.env[m[1]]) process.env[m[1]]=m[2].trim();
  }
}
loadEnv();
const provider=process.env.AI_PROVIDER||'openai';
const config=provider==='aliyun'
  ? {provider,apiKey:process.env.DASHSCOPE_API_KEY,model:process.env.AI_MODEL||'qwen-vl-max',baseUrl:process.env.AI_BASE_URL||'https://dashscope.aliyuncs.com/compatible-mode/v1'}
  : {provider,apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-5-mini',baseUrl:'https://api.openai.com/v1'};
const publicDir=path.join(__dirname,'public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));}
function readBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',c=>{body+=c;if(body.length>25*1024*1024){reject(new Error('请求超过 25MB 限制'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(body||'{}'))}catch{reject(new Error('请求 JSON 格式无效'))}});req.on('error',reject);});}

const server=http.createServer(async(req,res)=>{
  try {
    if(req.method==='GET'&&req.url==='/api/bootstrap') return json(res,200,{orders,cases:cases.filter(x=>x.id.startsWith('C')).map(({expected,reason,...safe})=>safe),rules:readRules(),configured:Boolean(config.apiKey),model:config.model,provider:config.provider});
    if(req.method==='POST'&&req.url==='/api/analyze'){
      const body=await readBody(req); let order=orders.find(x=>x.id===body.orderId);
      if(body.orderId==='CUSTOM'){
        const c=body.customOrder;
        if(!c||typeof c.product!=='string'||!c.product.trim()||c.product.length>100) return json(res,400,{error:'请填写有效的自定义商品名称'});
        if(!['有','无','未知'].includes(c.inspectionService)) return json(res,400,{error:'自定义验货服务状态无效'});
        if(!Array.isArray(c.inspectionItems)||c.inspectionItems.some(x=>typeof x!=='string'||x.length>30)) return json(res,400,{error:'自定义验货项目格式无效'});
        order={id:'CUSTOM',product:c.product.trim(),inspectionService:c.inspectionService,inspectionItems:c.inspectionItems.slice(0,20),inspectionResult:String(c.inspectionResult||'未知').slice(0,500)};
      }
      if(!order) return json(res,400,{error:'请选择有效的模拟订单'});
      if(!config.apiKey) return json(res,503,{error:config.provider==='aliyun'?'尚未配置 DASHSCOPE_API_KEY。请在服务端 .env 中填写阿里云百炼 API Key。':'尚未配置 OPENAI_API_KEY。请在服务端 .env 中填写密钥。'});
      if(!Array.isArray(body.images)) return json(res,400,{error:'图片字段格式无效'});
      for(const img of body.images){if(!/^data:image\/(jpeg|png);base64,/.test(img.dataUrl||'')) return json(res,400,{error:`图片 ${img.name||''} 读取失败或不是 JPG/PNG`});}
      return json(res,200,{result:await analyze({order,reportText:String(body.reportText||''),images:body.images},config)});
    }
    if(req.method==='GET'){
      const pathname=req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0]);
      const file=path.normalize(path.join(publicDir,pathname));
      if(!file.startsWith(publicDir)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end('Not found');}
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});return fs.createReadStream(file).pipe(res);
    }
    res.writeHead(405);res.end('Method not allowed');
  } catch(e){console.error(e);if(!res.headersSent)json(res,500,{error:e.message||'服务端错误'});}
});
if(require.main===module){const port=Number(process.env.PORT)||3000;server.listen(port,()=>console.log(`逆向保价智能判责助手已启动：http://localhost:${port}`));}
module.exports={server};
