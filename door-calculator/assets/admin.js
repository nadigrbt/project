/* Конструктор входной двери — админка цен. Требует assets/door-core.js.
   Цены хранятся в prices.json рядом с калькулятором. Админка показывает текущие
   цены, даёт их изменить и скачать новый prices.json для загрузки на GitHub. */

const $=id=>document.getElementById(id);
const adminGrid=$('adminGrid'), adminStatus=$('adminStatus');
let dirty=false;

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
  dirty=true;setStatus('Есть изменения. Скачайте prices.json и загрузите его на GitHub.',true);
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

/* ---------- действия ---------- */
$('aDownload').addEventListener('click',()=>{
  const data=collect();const err=checkGroups(data);if(err){setStatus(err,true);return}
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='prices.json';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  dirty=false;
  setStatus('Файл скачан. Загрузите его на GitHub в папку калькулятора с заменой старого prices.json.');
  toast('Файл prices.json скачан');
});
$('aCancel').addEventListener('click',()=>{buildAdmin();setStatus('Правки отменены');});
$('aDefaults').addEventListener('click',()=>{
  adminGrid.querySelectorAll('input[type=number]').forEach(i=>{i.value=opt(i.dataset.k,i.dataset.id).price;i.classList.toggle('chg',Number(i.value)!==price(i.dataset.k,i.dataset.id))});
  adminGrid.querySelectorAll('input[type=checkbox]').forEach(c=>{c.checked=true;c.closest('.arow').classList.remove('off')});
  dirty=true;setStatus('Исходные цены подставлены. Скачайте prices.json, чтобы применить.',true);
});

/* ---------- запуск ---------- */
(async()=>{
  buildAdmin();
  try{
    const data=await loadPricesFile();
    setPrices(data);buildAdmin();
    setStatus(data.updatedAt? 'Показаны текущие цены сайта. Последнее обновление: '+new Date(data.updatedAt).toLocaleString('ru-RU') : 'Показаны текущие цены сайта.');
  }catch(e){
    setStatus('Файл prices.json не найден, показаны исходные цены.');
  }
})();
