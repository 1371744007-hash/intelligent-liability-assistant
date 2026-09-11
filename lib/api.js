const { orders } = require('../data/orders');
const { cases } = require('../data/cases');
const { readRules } = require('./rules');
const { analyze } = require('./openai');

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function getConfig() {
  const provider = process.env.AI_PROVIDER || 'openai';
  return provider === 'aliyun'
    ? {provider,apiKey:process.env.DASHSCOPE_API_KEY,model:process.env.AI_MODEL||'qwen-vl-max',baseUrl:process.env.AI_BASE_URL||'https://dashscope.aliyuncs.com/compatible-mode/v1'}
    : {provider,apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-5-mini',baseUrl:'https://api.openai.com/v1'};
}

function bootstrapData() {
  const config = getConfig();
  return {orders,cases:cases.filter(x=>x.id.startsWith('C')).map(({expected,reason,...safe})=>safe),rules:readRules(),configured:Boolean(config.apiKey),model:config.model,provider:config.provider};
}

async function analyzeRequest(body = {}) {
  const config = getConfig();
  let order=orders.find(x=>x.id===body.orderId);
  if(body.orderId==='CUSTOM'){
    const c=body.customOrder;
    if(!c||typeof c.product!=='string'||!c.product.trim()||c.product.length>100) throw new ApiError(400,'请填写有效的自定义商品名称');
    if(!['有','无','未知'].includes(c.inspectionService)) throw new ApiError(400,'自定义验货服务状态无效');
    if(!Array.isArray(c.inspectionItems)||c.inspectionItems.some(x=>typeof x!=='string'||x.length>30)) throw new ApiError(400,'自定义验货项目格式无效');
    order={id:'CUSTOM',product:c.product.trim(),inspectionService:c.inspectionService,inspectionItems:c.inspectionItems.slice(0,20),inspectionResult:String(c.inspectionResult||'未知').slice(0,500)};
  }
  if(!order) throw new ApiError(400,'请选择有效的模拟订单');
  if(!config.apiKey) throw new ApiError(503,config.provider==='aliyun'?'尚未配置 DASHSCOPE_API_KEY。请在服务端环境变量中填写阿里云百炼 API Key。':'尚未配置 OPENAI_API_KEY。请在服务端环境变量中填写密钥。');
  if(!Array.isArray(body.images)) throw new ApiError(400,'图片字段格式无效');
  for(const img of body.images){if(!/^data:image\/(jpeg|png);base64,/.test(img.dataUrl||'')) throw new ApiError(400,`图片 ${img.name||''} 读取失败或不是 JPG/PNG`);}
  return analyze({order,reportText:String(body.reportText||''),images:body.images},config);
}

module.exports = { ApiError, bootstrapData, analyzeRequest };
