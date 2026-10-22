// Общие данные клиники. Меняете здесь — меняется на всех страницах.

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

  addresses: [
    'Мурманск, улица Карла Либкнехта, 28, 4 этаж, 411',
    'Мурманск, улица Воровского, 5/23, 4 этаж, 413',
    'Мурманск, Кольский проспект, 97/3',
  ],

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
