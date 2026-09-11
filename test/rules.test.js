const test=require('node:test');const assert=require('node:assert/strict');
const {validateResult}=require('../lib/rules');
const valid={responsibility:'物流责',compensate:'是',recover:'是',matchedRules:['R004'],rationale:'内外包装均有破损',imageObservations:[],missingOrConflicts:[],needsHuman:false,humanReason:''};
test('接受一致的结构化结果',()=>assert.deepEqual(validateResult(valid),valid));
test('商家责却建议赔付时自动转人工',()=>{const r=validateResult({...valid,responsibility:'商家责'});assert.equal(r.responsibility,'待人工判定');assert.equal(r.compensate,'待确认');assert.equal(r.needsHuman,true)});
test('拒绝未知责任枚举',()=>assert.throws(()=>validateResult({...valid,responsibility:'平台责'}),/责任建议字段无效/));
test('拒绝不存在的规则编号',()=>assert.throws(()=>validateResult({...valid,matchedRules:['R999']}),/不存在/));

