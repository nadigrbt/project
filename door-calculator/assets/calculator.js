/* Конструктор входной двери — калькулятор. Требует assets/door-core.js. */
/* ---------- построение интерфейса ---------- */
const stage=document.getElementById('stage'), list=document.getElementById('layerList'), config=document.getElementById('config');
const layerIdx=Object.fromEntries(LAYERS.map(([id],i)=>[id,i]));

LAYERS.forEach(([id],i)=>{
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 520 620');svg.setAttribute('class','layer');svg.dataset.layer=id;svg.style.setProperty('--i',i);
  svg.setAttribute('aria-hidden','true');stage.appendChild(svg);
});
[...LAYERS].reverse().forEach(([id,name])=>{
  const li=document.createElement('li');li.dataset.layer=id;
  li.innerHTML=`<span class="idx">L${layerIdx[id]}</span><span class="nm">${name}<span class="val"></span></span>`;
  li.addEventListener('mouseenter',()=>{stage.dataset.focus=id;stage.querySelector(`[data-layer="${id}"]`).classList.add('focus')});
  li.addEventListener('mouseleave',()=>{delete stage.dataset.focus;stage.querySelectorAll('.focus').forEach(e=>e.classList.remove('focus'))});
  list.appendChild(li);
});

let S={...DEFAULT};
function validate(){
  GROUPS.forEach(g=>{
    if(g.toggles){g.options.forEach(o=>{if(!visible(g.key,o.id)) S[o.id]=false});return}
    if(g.input){if(!visible('number','plate')) S.number='';return}
    if(!visible(g.key,S[g.key])){const f=g.options.find(o=>visible(g.key,o.id));if(f) S[g.key]=f.id}
  });
}
const priceTag=p=>p? '+'+rub(p) : 'включено';
const groupsEl=document.createElement('div');groupsEl.className='config';config.appendChild(groupsEl);

function buildConfig(){
  let n=0;
  groupsEl.innerHTML=GROUPS.map(g=>{
    const opts=g.options.filter(o=>visible(g.key,o.id));
    if(!opts.length) return '';
    n++;
    const layerName = g.layer? `слой L${layerIdx[g.layer]}` : 'слои L2, L8';
    let html=`<fieldset><legend><span class="n">${String(n).padStart(2,'0')}</span><span class="t">${g.title}</span><span class="ly">${layerName}</span></legend>`;
    if(g.note) html+=`<p class="note">${g.note}</p>`;
    if(g.input){
      const v=(S.number||'').replace(/"/g,'&quot;');
      html+=`<div class="numrow"><input id="num" type="text" maxlength="4" autocomplete="off" aria-label="Номер квартиры" value="${v}"><span class="p">+${rub(price('number','plate'))}</span></div>`;
    }else{
      html+=`<div class="opts">`+opts.map(o=>{
        const pr=price(g.key,o.id);
        const base=g.key==='size'? rub(pr) : priceTag(pr);
        if(g.swatch){
          const bg=o.wood? `repeating-linear-gradient(95deg,${o.color} 0 5px,${darken(o.color,.12)} 5px 7px)` : o.color;
          return `<button type="button" class="opt sw" data-key="${g.key}" data-id="${o.id}" aria-pressed="false"><span class="dot" style="background:${bg}"></span><span class="tx"><span class="l">${o.label}</span><span class="p">${base}</span></span></button>`;
        }
        return `<button type="button" class="opt" data-key="${g.toggles?o.id:g.key}" data-id="${o.id}" data-toggle="${g.toggles?1:''}" aria-pressed="false"><span class="l">${o.label}</span><span class="p">${base}</span></button>`;
      }).join('')+`</div>`;
    }
    return html+`</fieldset>`;
  }).join('');
  const num=document.getElementById('num');
  if(num) num.addEventListener('input',e=>{S.number=e.target.value.slice(0,4);render()});
}
buildConfig();

const sum=document.createElement('section');sum.className='summary';
sum.innerHTML=`<h2>Ваша дверь</h2><ul class="rows" id="rows"></ul>
<div class="total"><span>Итого</span><b id="total"></b></div>
<div class="actions"><button type="button" class="btn primary" id="copy">Скопировать конфигурацию</button><button type="button" class="btn" id="reset">Сбросить</button></div>
<p class="small">Итоговая цена уточняется после замера. Доставка и монтаж считаются отдельно.</p>`;
config.appendChild(sum);

config.addEventListener('click',e=>{
  const b=e.target.closest('.opt');if(!b) return;
  const k=b.dataset.key;
  if(b.dataset.toggle) S[k]=!S[k]; else S[k]=b.dataset.id;
  render();
});
document.getElementById('reset').addEventListener('click',()=>{S={...DEFAULT};validate();buildConfig();render();toast('Параметры сброшены')});
document.getElementById('explode').addEventListener('click',e=>{
  const on=e.currentTarget.getAttribute('aria-pressed')!=='true';
  e.currentTarget.setAttribute('aria-pressed',on);document.getElementById('scene').classList.toggle('exploded',on);
});

/* ---------- цена ---------- */
function lines(s){
  const r=[
    ['Дверь '+s.size+' × 2050 мм, '+(s.open==='right'?'правая':'левая'), price('size',s.size)+price('open',s.open)],
    ['Покрытие: '+FINISHES[s.finish].label, price('finish',s.finish)],
    ['Фрезеровка: '+opt('pattern',s.pattern).label, price('pattern',s.pattern)],
    ['Стекло: '+opt('glass',s.glass).label, price('glass',s.glass)],
    ['Ручка: '+opt('handle',s.handle).label, price('handle',s.handle)],
    ['Фурнитура: '+METALS[s.metal].label, price('metal',s.metal)],
    ['Глазок: '+opt('peep',s.peep).label, price('peep',s.peep)]
  ];
  if(s.side) r.push(['Боковая фрамуга со стеклом',price('extras','side')]);
  if(s.sill) r.push(['Порог из нержавейки',price('extras','sill')]);
  if((s.number||'').trim()) r.push(['Табличка с номером '+s.number.trim(),price('number','plate')]);
  return r;
}

/* ---------- рендер ---------- */
const prev={};let first=true;
function render(){
  const g=geo(S);const changed=[];
  LAYERS.forEach(([id])=>{
    const p='L'+id+'-';const body=RENDER[id](S,g,p);
    const html=body? defs(p,S)+body : '';
    if(prev[id]!==html){
      const el=stage.querySelector(`[data-layer="${id}"]`);el.innerHTML=html;prev[id]=html;
      if(!first && body && id!=='wall'){el.classList.remove('pop');void el.getBoundingClientRect();el.classList.add('pop');}
      if(!first && id!=='wall') changed.push(id);
    }
  });
  list.querySelectorAll('li').forEach(li=>{
    const v=layerValue(li.dataset.layer,S);li.classList.toggle('empty',!v);
    li.querySelector('.val').textContent=v||'пусто';
    li.classList.toggle('flash',changed.includes(li.dataset.layer));
  });
  if(changed.length){
    const names=changed.map(id=>'L'+layerIdx[id]+' '+LAYERS[layerIdx[id]][1].toLowerCase());
    document.getElementById('lastChange').textContent='Обновлено: '+names.join(', ');
    clearTimeout(render.t);render.t=setTimeout(()=>list.querySelectorAll('.flash').forEach(l=>l.classList.remove('flash')),1400);
  }
  config.querySelectorAll('.opt').forEach(b=>{
    const k=b.dataset.key;const on=b.dataset.toggle? !!S[k] : S[k]===b.dataset.id;b.setAttribute('aria-pressed',on);
  });
  const L=lines(S), total=L.reduce((a,[,p])=>a+p,0);
  document.getElementById('rows').innerHTML=L.map(([n,p])=>`<li><span>${n.replace(/</g,'&lt;')}</span><span>${p?rub(p):'—'}</span></li>`).join('');
  document.getElementById('total').textContent=rub(total);
  document.getElementById('pvTotal').textContent=rub(total);
  document.getElementById('pvSize').textContent=S.size+' × 2050 мм';
  first=false;
}

/* ---------- копирование ---------- */
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800)}
document.getElementById('copy').addEventListener('click',()=>{
  const L=lines(S);const text='Входная дверь\n'+L.map(([n,p])=>`• ${n}${p?' — '+rub(p):''}`).join('\n')+'\nИтого: '+rub(L.reduce((a,[,p])=>a+p,0));
  const fallback=()=>{const ta=document.getElementById('copyArea');ta.value=text;ta.select();try{document.execCommand('copy');toast('Конфигурация скопирована')}catch(e){toast('Не удалось скопировать')}};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(()=>toast('Конфигурация скопирована'),fallback); else fallback();
});

/* ---------- запуск ---------- */
validate();render();
loadPricesFile().then(data=>{setPrices(data);validate();buildConfig();render()})
  .catch(()=>{/* нет prices.json — работают исходные цены из door-core.js */});

/* ---------- высота для встраивания через iframe ---------- */
if(window.parent!==window && 'ResizeObserver' in window){
  new ResizeObserver(()=>window.parent.postMessage({type:'door-calc-height',height:document.documentElement.scrollHeight},'*'))
    .observe(document.body);
}
