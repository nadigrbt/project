/* Конструктор входной двери — админка цен. Требует assets/door-core.js.
   Цены хранятся в prices.json в репозитории. Сохранение идёт через GitHub API
   токеном, который вводит администратор; токен не попадает в код сайта. */

const LS_KEY='doorAdminGithub';
const $=id=>document.getElementById(id);
const adminGrid=$('adminGrid'), adminStatus=$('adminStatus');
let dirty=false, sha=null, conn=null;

function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
function setStatus(t,warn){adminStatus.textContent=t;adminStatus.classList.toggle('dirty',!!warn)}
const fid=(k,id)=>(k+'-'+id).replace(/[^a-z0-9-]/gi,'_');

/* ---------- таблица цен ---------- */
function buildAdmin(){
  adminGrid.innerHTML=GROUPS.map(g=>`<div class="acard"><h3>${g.title}</h3>`+g.options.map(o=>{
    const i=fid(g.key,o.id), on=visible(g.key,o.id);
    return `<div class="arow${on?'':' off'}"><label class="nm" for="ap-${i}">${o.label}</label>
      <input type="number" id="ap-${i}" data-k="${g.key}" data-id="${o.id}" min="0" step="100" inputmode="numeric" value="${price(g.key,o.id)}" aria-label="Цена, ₽">
      <label class="vis"><input type="checkbox" id="ah-${i}" data-k="${g.key}" data-id="${o.id}" ${on?'checked':''}>показ</label></div>`;
  }).join('')+`</div>`).join('');
  dirty=false;
}
adminGrid.addEventListener('input',e=>{
  const t=e.target;
  if(t.type==='number') t.classList.toggle('chg',Number(t.value)!==price(t.dataset.k,t.dataset.id));
  if(t.type==='checkbox') t.closest('.arow').classList.toggle('off',!t.checked);
  dirty=true;setStatus('Есть несохранённые изменения',true);
});
function collect(){
  const prices={},hidden={};
  adminGrid.querySelectorAll('input[type=number]').forEach(i=>{
    const v=Math.round(Number(i.value));
    prices[pkey(i.dataset.k,i.dataset.id)]=Number.isFinite(v)&&v>0?v:0;
  });
  adminGrid.querySelectorAll('input[type=checkbox]').forEach(c=>{if(!c.checked) hidden[pkey(c.dataset.k,c.dataset.id)]=true});
  return {prices,hidden,updatedAt:new Date().toISOString()};
}
function checkGroups(data){
  const g=GROUPS.filter(g=>!g.toggles&&!g.input).find(g=>g.options.every(o=>data.hidden[pkey(g.key,o.id)]));
  return g? `В группе «${g.title}» должен остаться хотя бы один вариант` : '';
}
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});

/* ---------- GitHub API ---------- */
const b64encode=str=>{const bytes=new TextEncoder().encode(str);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin)};
const b64decode=b64=>new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g,'')),c=>c.charCodeAt(0)));

function apiUrl(c){return `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${c.path.split('/').map(encodeURIComponent).join('/')}`}
async function gh(c,method,body){
  const url=apiUrl(c)+(method==='GET'?'?ref='+encodeURIComponent(c.branch):'');
  const r=await fetch(url,{method,cache:'no-store',headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28'},body:body?JSON.stringify(body):undefined});
  const json=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(json.message||('HTTP '+r.status));e.status=r.status;throw e}
  return json;
}
function ghError(e){
  if(e.status===401) return 'GitHub не принял токен. Проверьте, что он скопирован полностью и не истёк.';
  if(e.status===403) return 'У токена нет права записи. Выдайте ему Contents: Read and write для этого репозитория.';
  if(e.status===404) return 'Репозиторий, ветка или файл не найдены, либо токен не видит этот репозиторий.';
  if(e.status===409) return 'Файл на GitHub изменился. Нажмите «Подключиться» ещё раз, чтобы загрузить свежие цены.';
  if(e.status===422) return 'GitHub отклонил запрос. Проверьте название ветки.';
  return 'Не удалось связаться с GitHub: '+e.message;
}

/* ---------- подключение ---------- */
function guessRepo(){
  const h=location.hostname;
  if(!h.endsWith('.github.io')) return {};
  const owner=h.replace('.github.io','');
  const first=location.pathname.split('/').filter(Boolean)[0]||'';
  return {owner, repo: first && !first.includes('.') ? first : owner+'.github.io'};
}
function readSaved(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'null')}catch(e){return null}}
function writeSaved(c){try{c? localStorage.setItem(LS_KEY,JSON.stringify(c)) : localStorage.removeItem(LS_KEY)}catch(e){}}

function fillForm(c){
  $('gOwner').value=c.owner||'';$('gRepo').value=c.repo||'';
  $('gBranch').value=c.branch||'main';$('gPath').value=c.path||'prices.json';
  $('gToken').value=c.token||'';$('gRemember').checked=!!c.token;
}
function setConn(state,text){const p=$('connState');p.textContent=text;p.dataset.state=state}

async function connect(c){
  setConn('busy','Подключаюсь…');
  try{
    const file=await gh(c,'GET');
    sha=file.sha;
    const data=JSON.parse(b64decode(file.content||''));
    conn=c;setPrices(data);buildAdmin();
    setConn('ok','Подключено: '+c.owner+'/'+c.repo);
    setStatus(data.updatedAt? 'Цены загружены из GitHub. Последнее сохранение: '+new Date(data.updatedAt).toLocaleString('ru-RU') : 'Цены загружены из GitHub.');
    return true;
  }catch(e){
    conn=null;setConn('err','Ошибка подключения');setStatus(ghError(e),true);
    return false;
  }
}

$('connForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const c={owner:$('gOwner').value.trim(),repo:$('gRepo').value.trim(),branch:$('gBranch').value.trim()||'main',path:$('gPath').value.trim()||'prices.json',token:$('gToken').value.trim()};
  if(dirty){setStatus('Сначала сохраните или отмените правки, иначе они потеряются при загрузке цен из GitHub',true);return}
  const ok=await connect(c);
  if(ok){writeSaved($('gRemember').checked? c : {...c,token:''});toast('Подключено к GitHub')}
});
$('gForget').addEventListener('click',()=>{
  conn=null;sha=null;$('gToken').value='';$('gRemember').checked=false;
  const saved=readSaved();if(saved) writeSaved({...saved,token:''});
  setConn('off','Не подключено');toast('Токен удалён из этого браузера');
});

/* ---------- действия ---------- */
$('aSave').addEventListener('click',async e=>{
  if(!conn){setStatus('Сначала подключитесь к GitHub. Без подключения можно скачать prices.json и загрузить его в репозиторий вручную.',true);$('gToken').focus();return}
  const data=collect();const err=checkGroups(data);if(err){setStatus(err,true);return}
  const b=e.currentTarget;b.disabled=true;setStatus('Сохраняю в GitHub…');
  try{
    const res=await gh(conn,'PUT',{message:'Обновление цен в конструкторе двери',content:b64encode(JSON.stringify(data,null,2)+'\n'),sha,branch:conn.branch});
    sha=res.content&&res.content.sha;
    setPrices(data);buildAdmin();
    setStatus('Сохранено в '+new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})+'. Сайт обновится через 1–2 минуты.');
    toast('Цены сохранены');
  }catch(err){setStatus(ghError(err),true)}
  finally{b.disabled=false}
});
$('aDownload').addEventListener('click',()=>{
  const data=collect();const err=checkGroups(data);if(err){setStatus(err,true);return}
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='prices.json';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Файл prices.json скачан');
});
$('aCancel').addEventListener('click',()=>{buildAdmin();setStatus('Правки отменены');});
$('aDefaults').addEventListener('click',()=>{
  adminGrid.querySelectorAll('input[type=number]').forEach(i=>{i.value=opt(i.dataset.k,i.dataset.id).price;i.classList.toggle('chg',Number(i.value)!==price(i.dataset.k,i.dataset.id))});
  adminGrid.querySelectorAll('input[type=checkbox]').forEach(c=>{c.checked=true;c.closest('.arow').classList.remove('off')});
  dirty=true;setStatus('Исходные цены подставлены. Сохраните, чтобы применить.',true);
});

/* ---------- запуск ---------- */
(async()=>{
  const saved=readSaved()||{};
  fillForm({...guessRepo(),...saved});
  buildAdmin();
  let failed=false;
  if(saved.token && saved.owner && saved.repo){ if(await connect(saved)) return; failed=true; }
  try{
    const data=await loadPricesFile();
    setPrices(data);buildAdmin();
    if(!failed) setStatus('Показаны текущие цены сайта. Подключитесь к GitHub, чтобы сохранять изменения.');
  }catch(e){
    if(!failed) setStatus('Файл prices.json не найден, показаны исходные цены. Подключитесь к GitHub, чтобы сохранять изменения.');
  }
})();
