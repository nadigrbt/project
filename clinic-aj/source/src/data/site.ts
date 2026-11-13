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
  // Пока ссылки нет, адрес ведёт на поиск этого адреса в Яндекс Картах.
  // Пока координат нет хотя бы у одного филиала, карта показывает поиск клиники в Яндексе.
  branches: [
    { address: 'Мурманск, улица Карла Либкнехта, 28, 4 этаж, 411', yandex: '', coords: null },
    { address: 'Мурманск, улица Воровского, 5/23, 4 этаж, 413', yandex: '', coords: null },
    { address: 'Мурманск, Кольский проспект, 97/3', yandex: '', coords: null },
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
    return `https://yandex.ru/map-widget/v1/?ll=${lon.toFixed(6)},${lat.toFixed(6)}&z=13&pt=${pt}`;
  }
  return `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(site.mapSearch)}&z=12`;
}
