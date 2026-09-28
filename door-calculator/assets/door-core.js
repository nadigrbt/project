/* Конструктор входной двери — общие данные, цены и отрисовка слоёв.
   Подключается и калькулятором (index.html), и админкой (admin.html). */
/* ---------- данные ---------- */
const FINISHES = {
  antr:  {label:'Антрацит RAL 7016', c:'#3A4044', price:0},
  muar:  {label:'Графит муар', c:'#2F3032', muar:true, price:0},
  white: {label:'Белый RAL 9016', c:'#ECECE5', price:2400},
  bronze:{label:'Бронза антик', c:'#5C4733', muar:true, price:1800},
  oak:   {label:'МДФ Дуб натуральный', c:'#B38657', wood:true, price:6900},
  walnut:{label:'МДФ Орех', c:'#7A5234', wood:true, price:7400},
  wenge: {label:'МДФ Венге', c:'#3F2D23', wood:true, price:6900}
};
const METALS = {
  chrome:{label:'Хром', stops:['#FAFBFC','#BAC1C5','#7C858A','#DDE2E4'], price:0, text:'#1B1B1B'},
  black: {label:'Чёрный матовый', stops:['#55585B','#2C2D2F','#17181A','#3A3C3F'], price:900, text:'#E9E9E6'},
  brass: {label:'Латунь', stops:['#F4DC96','#C99A45','#8A6425','#DBB768'], price:1600, text:'#2A1E0C'}
};

const GROUPS = [
  {key:'size', title:'Размер проёма', layer:'frame', note:'Ширина × высота двери в миллиметрах.',
   options:[{id:'860',label:'860 × 2050',price:32900},{id:'960',label:'960 × 2050',price:34900},{id:'1050',label:'1050 × 2050',price:38900}]},
  {key:'open', title:'Открывание', layer:'handle', note:'Сторона петель, если смотреть на дверь снаружи. Ручка переходит на противоположную сторону.',
   options:[{id:'left',label:'Левое',price:0},{id:'right',label:'Правое',price:0}]},
  {key:'finish', title:'Покрытие снаружи', layer:'leaf', swatch:true,
   options:Object.entries(FINISHES).map(([id,f])=>({id,label:f.label,price:f.price,color:f.c,wood:f.wood}))},
  {key:'pattern', title:'Фрезеровка', layer:'mill',
   options:[{id:'smooth',label:'Гладкая',price:0},{id:'lines',label:'Горизонтальные фрезы',price:2200},{id:'classic',label:'Классика, 2 филёнки',price:3900},{id:'rhomb',label:'Ромб',price:3200},{id:'vertical',label:'Вертикальный молдинг',price:2600}]},
  {key:'glass', title:'Стеклопакет', layer:'glass',
   options:[{id:'none',label:'Без стекла',price:0},{id:'slit',label:'Вертикальная полоса',price:4800},{id:'top',label:'Арочное окно',price:7900},{id:'squares',label:'Три квадрата',price:5600}]},
  {key:'handle', title:'Ручка', layer:'handle',
   options:[{id:'lever',label:'Нажимная на планке',price:0},{id:'bar',label:'Скоба-рейлинг',price:3400},{id:'knob',label:'Кноб',price:1200}]},
  {key:'metal', title:'Цвет фурнитуры', layer:'handle', swatch:true, note:'Применяется к ручке, глазку и табличке.',
   options:Object.entries(METALS).map(([id,m])=>({id,label:m.label,price:m.price,color:`linear-gradient(135deg,${m.stops[0]},${m.stops[2]})`}))},
  {key:'peep', title:'Глазок', layer:'peep',
   options:[{id:'none',label:'Без глазка',price:0},{id:'optical',label:'Оптический 200°',price:900},{id:'video',label:'Видеоглазок',price:7400}]},
  {key:'extras', title:'Дополнительно', toggles:true,
   options:[{id:'side',label:'Боковая фрамуга со стеклом',price:14900,layer:'side'},{id:'sill',label:'Порог из нержавейки',price:1900,layer:'sill'}]},
  {key:'number', title:'Номер квартиры', layer:'plate', input:true, options:[{id:'plate',label:'Табличка с номером',price:1200}], note:'Табличка на стене рядом с ручкой. Оставьте пустым, если не нужна.'}
];

const LAYERS = [
  ['wall','Стена и пол'],['frame','Коробка и наличник'],['side','Боковая фрамуга'],['leaf','Полотно'],
  ['mill','Фрезеровка'],['glass','Стеклопакет'],['handle','Ручка'],['peep','Глазок'],['sill','Порог'],['plate','Номер квартиры']
];

const DEFAULT = {size:'960',open:'right',finish:'antr',pattern:'lines',glass:'none',handle:'lever',metal:'chrome',peep:'optical',side:false,sill:true,number:'47'};

/* ---------- утилиты ---------- */
const rub = n => n.toLocaleString('ru-RU') + ' ₽';
const opt = (k,id) => GROUPS.find(g=>g.key===k).options.find(o=>o.id===id);
function darken(hex,a){const n=parseInt(hex.slice(1),16);const f=v=>Math.round(v*(1-a)).toString(16).padStart(2,'0');return '#'+f(n>>16&255)+f(n>>8&255)+f(n&255)}
function rng(seed){return ()=>(seed=(seed*16807)%2147483647)/2147483647}

const GRAIN = (()=>{const r=rng(42);let s='';for(let i=0;i<9;i++){const x=i*6.6+r()*3;const w=(0.6+r()*1.4).toFixed(2);const o=(0.12+r()*0.18).toFixed(2);
  s+=`<path d="M${x.toFixed(1)} 0 C${(x+r()*8-4).toFixed(1)} 140 ${(x+r()*8-4).toFixed(1)} 330 ${x.toFixed(1)} 520" stroke="rgba(35,18,6,${o})" stroke-width="${w}" fill="none"/>`}
  s+=`<path d="M30 0 C36 180 24 340 31 520" stroke="rgba(255,235,200,.10)" stroke-width="2" fill="none"/>`;return s})();

/* ---------- геометрия ---------- */
function geo(s){
  const w={860:200,960:224,1050:246}[s.size], h=505, ly=70, f=16, floorY=575;
  const hingeRight=s.open==='right', sideW=64;
  const cx=260+(s.side?(hingeRight?-38:38):0), lx=cx-w/2;
  const sideX=hingeRight? lx+w+f : lx-f-sideW;
  const fl=Math.min(lx, s.side&&!hingeRight?sideX:lx)-f;
  const fr=Math.max(lx+w, s.side&&hingeRight?sideX+sideW:lx+w)+f;
  return {w,h,ly,f,floorY,hingeRight,sideW,cx,lx,sideX,fl,fr,ft:ly-f};
}

/* ---------- общие defs для каждого слоя ---------- */
function defs(p,s){
  const m=METALS[s.metal].stops;
  const st=(a)=>a.map((c,i)=>`<stop offset="${i/(a.length-1)}" stop-color="${c}"/>`).join('');
  return `<defs>
  <pattern id="${p}g" patternUnits="userSpaceOnUse" width="60" height="520">${GRAIN}</pattern>
  <filter id="${p}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 -.12"/><feComposite operator="in" in2="SourceGraphic"/></filter>
  <filter id="${p}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
  <linearGradient id="${p}sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
  <linearGradient id="${p}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#AFC7D1"/><stop offset="1" stop-color="#4C6774"/></linearGradient>
  <linearGradient id="${p}gs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/><stop offset=".66" stop-color="#fff" stop-opacity=".22"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="${p}m" x1="0" y1="0" x2="1" y2="0">${st(m)}</linearGradient>
  <linearGradient id="${p}mv" x1="0" y1="0" x2="0" y2="1">${st(m)}</linearGradient>
  <linearGradient id="${p}st" x1="0" y1="0" x2="0" y2="1">${st(['#F2F4F5','#A9B1B6','#6E777C'])}</linearGradient>
  </defs>`;
}
function paint(x,y,w,h,fin,p){
  let o=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fin.c}"/>`;
  if(fin.wood) o+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${p}g)"/>`;
  if(fin.muar) o+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000" filter="url(#${p}n)" opacity=".7"/>`;
  return o+`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${p}sh)"/>`;
}
const DK='rgba(0,0,0,.42)', LT='rgba(255,255,255,.17)';
const gl=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DK}" stroke-width="2.2"/><line x1="${x1+1.3}" y1="${y1+1.3}" x2="${x2+1.3}" y2="${y2+1.3}" stroke="${LT}" stroke-width="1.2"/>`;
const gr=(x,y,w,h,r=3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${DK}" stroke-width="2.2"/><rect x="${x+1.3}" y="${y+1.3}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${LT}" stroke-width="1.2"/>`;
const rectPath=(x,y,w,h,r=3)=>`M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`;
const archPath=(x,y,w,h)=>{const r=w/2;return `M${x} ${y+h}V${y+r}A${r} ${r} 0 0 1 ${x+w} ${y+r}V${y+h}Z`};
const glass=(d,p)=>`<path d="${d}" fill="url(#${p}gl)"/><path d="${d}" fill="url(#${p}gs)"/><path d="${d}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="3.2"/><path d="${d}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1" transform="translate(1.6 1.6)"/>`;

/* ---------- слои ---------- */
const RENDER = {
  wall(s,g,p){
    return `<rect width="520" height="575" fill="#D5D1C8"/><rect width="520" height="575" fill="#000" filter="url(#${p}n)" opacity=".35"/>
    <rect y="567" width="520" height="8" fill="#ECE9E3"/><rect y="575" width="520" height="45" fill="#6E685F"/>
    ${[0,1,2,3,4,5,6,7].map(i=>`<line x1="${i*74+20}" y1="575" x2="${i*74+20}" y2="620" stroke="rgba(0,0,0,.22)"/>`).join('')}
    <rect x="${g.fl+8}" y="${g.ft+10}" width="${g.fr-g.fl}" height="${g.floorY-g.ft-4}" fill="#000" opacity=".3" filter="url(#${p}b)"/>`;
  },
  frame(s,g,p){
    const fin={...FINISHES[s.finish]};fin.c=darken(fin.c,.16);
    let o=paint(g.fl,g.ft,g.fr-g.fl,g.floorY-g.ft,fin,p);
    o+=`<rect x="${g.fl+.5}" y="${g.ft+.5}" width="${g.fr-g.fl-1}" height="${g.floorY-g.ft}" fill="none" stroke="rgba(0,0,0,.35)"/>`;
    o+=`<rect x="${g.lx-2}" y="${g.ly-2}" width="${g.w+4}" height="${g.h+4}" fill="#0E1011"/>`;
    if(s.side) o+=`<rect x="${g.sideX-2}" y="${g.ly-2}" width="${g.sideW+4}" height="${g.h+4}" fill="#0E1011"/>`;
    return o;
  },
  side(s,g,p){
    if(!s.side) return '';
    const x=g.sideX,y=g.ly,w=g.sideW,h=g.h,gh=Math.round(h*.6);
    return paint(x,y,w,h,FINISHES[s.finish],p)+`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="rgba(0,0,0,.4)"/>`
      +glass(rectPath(x+12,y+24,w-24,gh),p)+gr(x+12,y+24+gh+18,w-24,h-gh-66);
  },
  leaf(s,g,p){
    return paint(g.lx,g.ly,g.w,g.h,FINISHES[s.finish],p)+`<rect x="${g.lx+.5}" y="${g.ly+.5}" width="${g.w-1}" height="${g.h-1}" fill="none" stroke="rgba(0,0,0,.45)"/>`;
  },
  mill(s,g){
    const {lx,ly,w,h}=g;let o='';
    if(s.pattern==='lines'){for(let y=ly+36;y<ly+h-28;y+=34) o+=gl(lx+18,y,lx+w-18,y);}
    if(s.pattern==='classic'){const th=Math.round(h*.44);const bh=h-28-th-22-28;
      o+=gr(lx+22,ly+28,w-44,th,4)+gr(lx+34,ly+40,w-68,th-24,3)+gr(lx+22,ly+28+th+22,w-44,bh,4)+gr(lx+34,ly+40+th+22,w-68,bh-24,3);}
    if(s.pattern==='rhomb'){const cx=lx+w/2,cy=ly+h/2;const d=(a,b)=>`M${cx} ${cy-b}L${cx+a} ${cy}L${cx} ${cy+b}L${cx-a} ${cy}Z`;
      const pth=(dd,t)=>`<path d="${dd}" fill="none" stroke="${DK}" stroke-width="2.2"/><path d="${dd}" fill="none" stroke="${LT}" stroke-width="1.2" transform="translate(1.3 1.3)"/>`;
      o+=gr(lx+16,ly+16,w-32,h-32,3)+pth(d(w/2-34,h/2-54))+pth(d((w/2-34)*.62,(h/2-54)*.62));}
    if(s.pattern==='vertical'){const a=Math.round(lx+w*.34),b=Math.round(lx+w*.66);
      o+=gl(lx+16,ly+24,lx+w-16,ly+24)+gl(lx+16,ly+h-24,lx+w-16,ly+h-24)+gl(a,ly+24,a,ly+h-24)+gl(b,ly+24,b,ly+h-24);}
    return o;
  },
  glass(s,g,p){
    const {lx,ly,w,h}=g;
    if(s.glass==='slit'){const x=Math.round((g.hingeRight?lx+w*.72:lx+w*.28)-9);return glass(rectPath(x,ly+40,18,h-80,2),p);}
    if(s.glass==='top') return glass(archPath(lx+30,ly+30,w-60,170),p);
    if(s.glass==='squares'){const x=lx+w/2-18;return [0,1,2].map(i=>glass(rectPath(x,ly+190+i*58,36,36,2),p)).join('');}
    return '';
  },
  handle(s,g,p){
    const hx=g.hingeRight? g.lx+24 : g.lx+g.w-24, dir=g.hingeRight?1:-1, hy=Math.round(g.ly+g.h*.52);
    const M=`url(#${p}m)`,MV=`url(#${p}mv)`;
    if(s.handle==='lever'){const lx0=dir>0?hx:hx-48;
      return `<rect x="${hx-7+2}" y="${hy-42+3}" width="14" height="96" rx="7" fill="#000" opacity=".25"/>
      <rect x="${hx-7}" y="${hy-42}" width="14" height="96" rx="7" fill="${MV}"/>
      <rect x="${lx0+2}" y="${hy-17+4}" width="48" height="10" rx="5" fill="#000" opacity=".25"/>
      <rect x="${lx0}" y="${hy-17}" width="48" height="10" rx="5" fill="${MV}"/>
      <circle cx="${hx}" cy="${hy-12}" r="6.5" fill="${M}"/>
      <rect x="${hx-3.5}" y="${hy+24}" width="7" height="17" rx="3.5" fill="#0D0F10" opacity=".8"/>`;}
    if(s.handle==='bar'){const cxk=hx+dir*22;
      return `<rect x="${hx-6}" y="${hy-98}" width="12" height="8" fill="${M}"/><rect x="${hx-6}" y="${hy+88}" width="12" height="8" fill="${M}"/>
      <rect x="${hx-5+3}" y="${hy-118+4}" width="10" height="236" rx="5" fill="#000" opacity=".25"/>
      <rect x="${hx-5}" y="${hy-118}" width="10" height="236" rx="5" fill="${M}"/>
      <circle cx="${cxk}" cy="${hy+10}" r="8" fill="${M}"/><rect x="${cxk-1.5}" y="${hy+5}" width="3" height="10" rx="1.5" fill="#0D0F10"/>`;}
    return `<circle cx="${hx}" cy="${hy-46}" r="8" fill="${M}"/><rect x="${hx-1.5}" y="${hy-51}" width="3" height="10" rx="1.5" fill="#0D0F10"/>
      <circle cx="${hx+2}" cy="${hy+3}" r="17" fill="#000" opacity=".22"/>
      <circle cx="${hx}" cy="${hy}" r="16" fill="${M}"/><circle cx="${hx}" cy="${hy}" r="11" fill="${MV}" stroke="rgba(0,0,0,.25)"/>
      <ellipse cx="${hx-3.5}" cy="${hy-4}" rx="4" ry="2.5" fill="#fff" opacity=".5"/>`;
  },
  peep(s,g,p){
    const x=g.lx+g.w/2, y=s.glass==='top'? g.ly+228 : g.ly+150;
    if(s.peep==='optical') return `<circle cx="${x}" cy="${y}" r="7.5" fill="url(#${p}m)" stroke="rgba(0,0,0,.35)"/><circle cx="${x}" cy="${y}" r="3.6" fill="#0B0E11"/><circle cx="${x-1.2}" cy="${y-1.2}" r="1" fill="#fff" opacity=".7"/>`;
    if(s.peep==='video') return `<rect x="${x-14+2}" y="${y-20+3}" width="28" height="40" rx="6" fill="#000" opacity=".25"/><rect x="${x-14}" y="${y-20}" width="28" height="40" rx="6" fill="#16181A" stroke="url(#${p}m)" stroke-width="2"/>
      <circle cx="${x}" cy="${y-4}" r="7" fill="#05070A" stroke="#3B4247" stroke-width="1.5"/><circle cx="${x-2}" cy="${y-6}" r="1.8" fill="#8AB4D6" opacity=".8"/><circle cx="${x}" cy="${y+11}" r="1.6" fill="#3FD07A"/>`;
    return '';
  },
  sill(s,g,p){
    if(!s.sill) return '';
    return `<rect x="${g.fl-4}" y="${g.floorY-5}" width="${g.fr-g.fl+8}" height="9" rx="2" fill="url(#${p}st)"/><line x1="${g.fl}" y1="${g.floorY-1}" x2="${g.fr}" y2="${g.floorY-1}" stroke="rgba(0,0,0,.25)"/>`;
  },
  plate(s,g,p){
    const n=(s.number||'').trim();if(!n) return '';
    const x=g.hingeRight? g.fl-56 : g.fr+14, y=g.ly+44, w=42;
    const safe=n.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    return `<rect x="${x+2}" y="${y+3}" width="${w}" height="30" rx="3" fill="#000" opacity=".22"/><rect x="${x}" y="${y}" width="${w}" height="30" rx="3" fill="url(#${p}m)"/>
      <text x="${x+w/2}" y="${y+20.5}" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="600" font-size="${n.length>3?12:15}" fill="${METALS[s.metal].text}">${safe}</text>`;
  }
};

/* ---------- подписи слоёв ---------- */
function layerValue(id,s){
  switch(id){
    case 'wall': return 'фон, не меняется';
    case 'frame': return s.size+' × 2050 мм';
    case 'side': return s.side? 'со стеклом' : '';
    case 'leaf': return FINISHES[s.finish].label;
    case 'mill': return s.pattern==='smooth'? '' : opt('pattern',s.pattern).label;
    case 'glass': return s.glass==='none'? '' : opt('glass',s.glass).label;
    case 'handle': return opt('handle',s.handle).label+', '+METALS[s.metal].label.toLowerCase()+', '+(s.open==='right'?'правое':'левое');
    case 'peep': return s.peep==='none'? '' : opt('peep',s.peep).label;
    case 'sill': return s.sill? 'нержавеющая сталь' : '';
    case 'plate': return (s.number||'').trim()? '№ '+s.number.trim() : '';
  }
}

/* ---------- цены ---------- */
/* PR — цены из prices.json, HID — скрытые варианты. Если цены в файле нет,
   берётся исходная цена из GROUPS. Ключ цены: "<группа>.<вариант>", например "glass.top". */
let PR={}, HID={};
const pkey=(k,id)=>k+'.'+id;
function price(k,id){const kk=pkey(k,id);return (kk in PR && Number.isFinite(PR[kk]))? PR[kk] : opt(k,id).price}
const visible=(k,id)=>!HID[pkey(k,id)];
function setPrices(data){PR=(data&&data.prices)||{};HID=(data&&data.hidden)||{}}
function defaultPrices(){
  const prices={};GROUPS.forEach(g=>g.options.forEach(o=>{prices[pkey(g.key,o.id)]=o.price}));
  return {prices,hidden:{}};
}
/* Читает prices.json рядом со страницей; параметр v обходит кэш GitHub Pages. */
async function loadPricesFile(url='prices.json'){
  const r=await fetch(url+'?v='+Date.now(),{cache:'no-store'});
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}
