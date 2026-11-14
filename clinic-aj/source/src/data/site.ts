// Общие данные клиники. Меняете здесь — меняется на всех страницах.

export type Branch = { address: string; yandex: string; coords: [number, number] | null };

export const site = {
  name: 'A&J',
  legalName: 'ООО «Эстетика»',
  inn: '5190085150',
  license: 'Л041-01163-51/00563410',
  schedule: 'Ежедневно с 09:00 до 21:00 без выходных',

  phone: {
    display: '78-70-30',
    href: 'tel:+78152787030',
  },

  // Филиалы. Адреса показываются в «Контактах», на карте и в разметке для поисковиков.
  //   yandex — ссылка на карточку филиала в Яндекс Картах (Яндекс Бизнес);
  //   coords — координаты точки [широта, долгота], например [68.97, 33.07].
  // Координаты взяты из ссылок на карточки (параметр ll), 14.11.
  // Если у филиала нет ссылки, адрес ведёт на поиск адреса; если нет координат — карта показывает поиск клиники.
  branches: [
    { address: 'Мурманск, улица Карла Либкнехта, 28, 4 этаж, 411', yandex: 'https://yandex.ru/maps/org/a_j/58572006858/', coords: [68.979153, 33.088186] },
    { address: 'Мурманск, улица Воровского, 5/23, 4 этаж, 413', yandex: 'https://yandex.ru/maps/org/a_j/120331577389/', coords: [68.969792, 33.072352] },
    { address: 'Мурманск, Кольский проспект, 97/3', yandex: 'https://yandex.ru/maps/org/a_j/183161304221/', coords: [68.915565, 33.088608] },
  ] as Branch[],

  // Что искать на карте, пока у филиалов нет координат
  mapSearch: 'Клиника A&J, Мурманск',

  // Онлайн-запись (Taplink)
  bookingUrl: 'https://taplink.cc/estetic.aj',

  social: {
    instagram: 'https://instagram.com/clinica_a.j',
    vk: 'https://vk.com/a.j_clinica',
    telegram: 'https://t.me/clinica_aj',
    max: 'https://max.ru/u/f9LHodD0cOJrncCLRSLuxA-jaXg6gouEtdVsS0FoMy7ko6h10gQiI3LEobw',
  },

  metrikaId: 94733259,

  developer: { label: 'маркетинговая поддержка', url: 'https://t.me/nadigrb' },
};

export const mainNav = [
  { label: 'Услуги', href: '/#uslugi' },
  { label: 'О клинике', href: '/#about' },
  { label: 'Врачи', href: '/vrachi' },
  { label: 'Акции', href: '/sale' },
  { label: 'Контакты', href: '/#contact' },
];

export const legalLinks = [
  { label: 'Лицензия клиники', href: '/license' },
  { label: 'Политика конфиденциальности', href: '/policy' },
  { label: 'Правила внутреннего распорядка', href: '/rules' },
  { label: 'Согласие на обработку персональных данных', href: '/agreement' },
  { label: 'Права и обязанности граждан в сфере здравоохранения', href: '/rights' },
];

/** Адреса филиалов строками (для разметки schema.org) */
export const addresses = site.branches.map((b) => b.address);

/** Ссылка на филиал в Яндекс Картах: карточка, а если её нет — поиск по адресу */
export const branchUrl = (b: Branch) =>
  b.yandex || `https://yandex.ru/maps/?text=${encodeURIComponent(b.address)}`;

/** Адрес виджета Яндекс Карт: три метки по координатам или, пока координат нет, поиск клиники */
export function mapWidgetUrl() {
  const pts = site.branches.map((b) => b.coords);
  if (pts.every(Boolean)) {
    const c = pts as [number, number][];
    const lat = c.reduce((s, p) => s + p[0], 0) / c.length;
    const lon = c.reduce((s, p) => s + p[1], 0) / c.length;
    const pt = c.map(([la, lo], i) => `${lo},${la},pm2rdm${i + 1}`).join('~');
    // масштаб подбираем так, чтобы все метки поместились в карту высотой 380 px (телефон)
    const latSpan = Math.max(...c.map((p) => p[0])) - Math.min(...c.map((p) => p[0]));
    const mPerPx = (latSpan * 111_000 * 1.2) / 340; // 1.2 — запас по краям
    const z = Math.max(10, Math.min(16, Math.floor(Math.log2((156_543 * Math.cos((lat * Math.PI) / 180)) / mPerPx))));
    return `https://yandex.ru/map-widget/v1/?ll=${lon.toFixed(6)},${lat.toFixed(6)}&z=${z}&pt=${pt}`;
  }
  return `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(site.mapSearch)}&z=12`;
}
