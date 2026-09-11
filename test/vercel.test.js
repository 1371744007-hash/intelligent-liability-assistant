const test=require('node:test');
const assert=require('node:assert/strict');
const bootstrap=require('../api/bootstrap');
const analyze=require('../api/analyze');

function response(){return{statusCode:0,payload:null,headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.statusCode=code;return this},json(value){this.payload=value;return this}}}

test('Vercel bootstrap 函数返回安全的演示数据',()=>{
  const res=response();bootstrap({method:'GET'},res);
  assert.equal(res.statusCode,200);
  assert.equal(res.payload.cases.length,8);
  assert.ok(res.payload.cases.every(x=>!('expected' in x)));
});

test('Vercel analyze 函数拒绝无效订单',async()=>{
  const res=response();await analyze({method:'POST',body:{orderId:'NOT_EXISTS',images:[]}},res);
  assert.equal(res.statusCode,400);
  assert.match(res.payload.error,/有效的模拟订单/);
});
