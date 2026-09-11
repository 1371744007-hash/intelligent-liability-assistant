const $=s=>document.querySelector(s);
const INSPECTION_ITEMS=['外包装完整性','商品破损','品类与颜色','商品型号','塑封','划痕','脏污','鞋盒'];
let state={orders:[],cases:[],files:[],configured:false};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function init(){
  try{
    const r=await fetch('/api/bootstrap');const d=await r.json();state={...state,...d};
    $('#orderSelect').innerHTML=d.orders.map(o=>`<option value="${o.id}">${o.id} · ${esc(o.product)}</option>`).join('')+'<option value="CUSTOM">＋ 自定义报案</option>';
    $('#caseSelect').innerHTML+=d.cases.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
    $('#customItems').innerHTML=INSPECTION_ITEMS.map(v=>`<label><input type="checkbox" value="${v}">${v}</label>`).join('');
    $('#rulesText').textContent=d.rules;const provider=d.provider==='aliyun'?'阿里云百炼':'OpenAI';$('#apiBadge').textContent=d.configured?`${provider}已配置 · ${d.model}`:`${provider}未配置 · 页面功能可用`;$('#apiBadge').className=`badge ${d.configured?'ok':'warn'}`;renderOrder();
  }catch(e){$('#notice').textContent='页面初始化失败：'+e.message}
}
function isCustom(){return $('#orderSelect').value==='CUSTOM'}
function currentOrder(){return state.orders.find(o=>o.id===$('#orderSelect').value)}
function customPayload(){return{id:'CUSTOM',product:$('#customProduct').value.trim(),inspectionService:$('#customService').value,inspectionItems:[...document.querySelectorAll('#customItems input:checked')].map(x=>x.value),inspectionResult:$('#customResult').value.trim()||'未知'}}
function renderOrder(){
  const custom=isCustom();$('#customOrder').hidden=!custom;$('#orderInfo').hidden=custom;if(custom)return;
  const o=currentOrder();if(!o)return;
  const items=Array.isArray(o.inspectionItems)?(o.inspectionItems.length?`<ul class="inspection-list">${o.inspectionItems.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'<span>无验货项目</span>'):`<span class="unknown">${esc(o.inspectionItems)}</span>`;
  $('#orderInfo').innerHTML=`<div class="fact"><small>商品</small><strong>${esc(o.product)}</strong></div><div class="fact"><small>验货服务</small><strong class="${o.inspectionService==='未知'?'unknown':''}">${esc(o.inspectionService)}</strong></div><div class="fact"><small>验货项目</small>${items}</div><div class="fact wide"><small>验货结果</small><strong>${esc(o.inspectionResult)}</strong></div>`;
}
$('#orderSelect').addEventListener('change',()=>{$('#caseSelect').value='';renderOrder()});
$('#caseSelect').addEventListener('change',e=>{const c=state.cases.find(x=>x.id===e.target.value);if(c){$('#orderSelect').value=c.orderId;$('#reportText').value=c.text;renderOrder();$('#notice').textContent=c.textOnly?'此演示案例为纯文本材料，没有附带图片。':''}});
$('#customService').addEventListener('change',e=>{const disabled=e.target.value!=='有';document.querySelectorAll('#customItems input').forEach(x=>{x.disabled=disabled;if(disabled)x.checked=false})});
$('#imageInput').addEventListener('change',e=>{for(const file of e.target.files){if(file.size>8*1024*1024){$('#notice').textContent=`${file.name} 超过 8MB，未添加`;continue}state.files.push({file,category:'其他材料',url:URL.createObjectURL(file)})}e.target.value='';renderFiles()});
function renderFiles(){$('#previews').innerHTML=state.files.map((x,i)=>`<div class="preview"><img src="${x.url}" alt="${esc(x.file.name)}"><select data-cat="${i}">${['外包装','商品','验货记录','其他材料'].map(v=>`<option ${v===x.category?'selected':''}>${v}</option>`).join('')}</select><button data-del="${i}">删除</button></div>`).join('');document.querySelectorAll('[data-cat]').forEach(el=>el.onchange=()=>state.files[+el.dataset.cat].category=el.value);document.querySelectorAll('[data-del]').forEach(el=>el.onclick=()=>{const x=state.files.splice(+el.dataset.del,1)[0];URL.revokeObjectURL(x.url);renderFiles()})}
function toDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error(`图片 ${file.name} 读取失败`));r.readAsDataURL(file)})}
function list(xs){return xs.length?`<ul>${xs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>无</p>'}
function showResult(r){$('#emptyResult').hidden=true;const el=$('#result');el.hidden=false;el.innerHTML=`<div class="decision"><div><small>责任建议</small><strong>${esc(r.responsibility)}</strong></div><div><small>是否赔付</small><strong>${esc(r.compensate)}</strong></div><div><small>是否追偿</small><strong>${esc(r.recover)}</strong></div></div><div class="result-grid"><div class="result-block"><h3>命中规则</h3><p>${r.matchedRules.map(esc).join('、')||'无'}</p></div><div class="result-block"><h3>简短依据</h3><p>${esc(r.rationale)}</p></div><div class="result-block"><h3>图片可见现象</h3>${list(r.imageObservations)}</div><div class="result-block"><h3>缺失信息或材料矛盾</h3>${list(r.missingOrConflicts)}</div></div>${r.needsHuman?`<div class="human"><b>需要转人工</b><br>${esc(r.humanReason)}</div>`:'<div class="result-block"><b>无需转人工</b></div>'}`}
$('#analyzeBtn').addEventListener('click',async()=>{
  if(!state.configured){$('#notice').textContent=state.provider==='aliyun'?'未配置阿里云百炼 API Key。请在 .env 中填写 DASHSCOPE_API_KEY，重启服务后再试。':'未配置 OpenAI API Key。请在 .env 中填写 OPENAI_API_KEY，重启服务后再试。';return}
  if(isCustom()&&!$('#customProduct').value.trim()){$('#notice').textContent='请填写自定义商品名称。';return}
  const btn=$('#analyzeBtn');btn.disabled=true;btn.textContent='正在读取材料并分析…';$('#notice').textContent='';
  try{const images=[];for(const x of state.files)images.push({name:x.file.name,category:x.category,dataUrl:await toDataUrl(x.file)});const body={orderId:$('#orderSelect').value,reportText:$('#reportText').value,images};if(isCustom())body.customOrder=customPayload();const res=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw new Error(data.error||'请求失败');showResult(data.result)}catch(e){$('#notice').textContent='分析失败：'+e.message}finally{btn.disabled=false;btn.textContent='开始智能分析'}
});
init();
