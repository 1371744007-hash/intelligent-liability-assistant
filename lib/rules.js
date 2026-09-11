const fs = require('node:fs');
const path = require('node:path');

const RESPONSIBILITIES = ['商家责','用户责','物流责','保险责','待人工判定'];
const TRI = ['是','否','待确认'];
const RULE_IDS = Array.from({length:8},(_,i)=>`R00${i+1}`);

function validateResult(input) {
  if (!input || typeof input !== 'object') throw new Error('模型未返回对象');
  const out = {
    responsibility: input.responsibility,
    compensate: input.compensate,
    recover: input.recover,
    matchedRules: Array.isArray(input.matchedRules) ? input.matchedRules : [],
    rationale: String(input.rationale || ''),
    imageObservations: Array.isArray(input.imageObservations) ? input.imageObservations.map(String) : [],
    missingOrConflicts: Array.isArray(input.missingOrConflicts) ? input.missingOrConflicts.map(String) : [],
    needsHuman: Boolean(input.needsHuman),
    humanReason: String(input.humanReason || '')
  };
  if (!RESPONSIBILITIES.includes(out.responsibility)) throw new Error('责任建议字段无效');
  if (!TRI.includes(out.compensate) || !TRI.includes(out.recover)) throw new Error('赔付或追偿字段无效');
  if (out.matchedRules.some(x => !RULE_IDS.includes(x))) throw new Error('包含不存在的规则编号');
  if (!out.rationale) throw new Error('判断依据不能为空');
  const conflicts = [];
  if (out.responsibility === '商家责' && (out.compensate !== '否' || out.recover !== '否')) conflicts.push('商家责必须不赔付且不追偿');
  if (['用户责','物流责','保险责'].includes(out.responsibility) && out.compensate !== '是') conflicts.push('确定为用户/物流/保险责任时必须赔付');
  if (out.responsibility === '待人工判定' && !out.needsHuman) conflicts.push('待人工判定必须标记转人工');
  if (out.needsHuman && !out.humanReason) conflicts.push('转人工时必须说明原因');
  if (conflicts.length) return {
    ...out, responsibility:'待人工判定', compensate:'待确认', recover:'待确认', needsHuman:true,
    humanReason:`结构化结果业务校验未通过：${conflicts.join('；')}`,
    missingOrConflicts:[...out.missingOrConflicts,...conflicts]
  };
  return out;
}

function readRules() { return fs.readFileSync(path.join(__dirname,'..','docs','RULES.md'),'utf8'); }
module.exports = { validateResult, readRules, RESPONSIBILITIES, TRI, RULE_IDS };

