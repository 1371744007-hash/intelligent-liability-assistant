const test=require('node:test');const assert=require('node:assert/strict');const {server}=require('../server');
let base;
test.before(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`});
test.after(()=>new Promise(r=>server.close(r)));
test('页面和静态资源可访问',async()=>{for(const p of ['/','/style.css','/app.js']){const res=await fetch(base+p);assert.equal(res.status,200)}});
test('启动数据只展示主案例且不泄露预期答案',async()=>{const data=await (await fetch(base+'/api/bootstrap')).json();assert.equal(data.orders.length,8);assert.equal(data.cases.length,8);assert.ok(data.cases.every(x=>x.id.startsWith('C')));assert.equal('expected' in data.cases[0],false);assert.match(data.rules,/R008/)});
test('无效订单在调用模型前被拒绝',async()=>{const res=await fetch(base+'/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderId:'NOT_EXISTS',images:[]})});assert.equal(res.status,400);assert.match((await res.json()).error,/有效的模拟订单/)});
