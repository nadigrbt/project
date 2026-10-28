// Врачи клиники: страница-список /vrachi (pages/vrachi.astro) и страница каждого врача /vrach-<slug> (pages/[doctor].astro).
// Адреса без вложенной папки: на Timeweb и GitHub Pages папка vrachi/ рядом с vrachi.html ломала бы адрес /vrachi.
// Новый врач — одна запись в массиве `doctors`, страница, карта сайта и разметка для Яндекса появятся сами.
//
// ПРАВИЛО: ничего не выдумывать. Заполняем только то, что есть на ПроДокторов
// (https://prodoctorov.ru/murmansk/lpu/113320-aj/) или что подтвердил владелец. Пустое поле на странице не показывается.
// Пока у врача не указана специальность, его страница закрыта от поиска (noindex) и не попадает в sitemap.xml,
// чтобы Яндекс не проиндексировал заготовку.

export interface Doctor {
  /** Адрес страницы: /vrach-<slug> (латиницей: фамилия-имя) */
  slug: string;
  /** ФИО полностью, как на ПроДокторов */
  name: string;
  /** Специальности, как на ПроДокторов: «Косметолог», «Дерматолог» … */
  specialties: string[];
  /** Должность в клинике: «Главный врач» */
  position?: string;
  /** Год начала стажа: стаж на странице считается сам и не устаревает */
  practiceSince?: number;
  /** Категория, учёная степень */
  category?: string;
  /** Образование: вуз, год, специальность */
  education?: { title: string; year?: string; text?: string }[];
  /** Повышение квалификации, курсы */
  courses?: { title: string; year?: string }[];
  /** Абзацы «О враче» */
  about?: string[];
  /** Ключ фото в data/images.ts (согласие на публикацию есть на все фото сайта) */
  photo?: string;
  /** Профиль на ПроДокторов: ссылка «Отзывы о враче» и sameAs в разметке */
  prodoctorovUrl?: string;
  /** Страницы услуг, которые ведёт врач (только подтверждённые) */
  services?: { href: string; label: string }[];
  /** Статьи врача в блоге */
  articles?: { href: string; label: string }[];
}

// Данные со страницы клиники на ПроДокторов (скриншоты владельца 28.10): ФИО, специальности, стаж, фото.
// Стаж там «N лет» на октябрь 2026 → practiceSince = 2026 − N. Рейтинги и отзывы на сайт не выносим, только ссылка на ПроДокторов.
export const doctors: Doctor[] = [
  // Анна Рашитова и Юлия Соколец — первыми по просьбе владельца 28.10; на ПроДокторов их нет, специальность и остальное ждём от владельца.
  { slug: 'rashitova-anna', name: 'Рашитова Анна', specialties: [] },
  { slug: 'sokolec-yuliya', name: 'Соколец Юлия', specialties: [] },
  {
    slug: 'smykova-valeriya',
    name: 'Смыкова Валерия Викторовна',
    specialties: ['Врач-косметолог', 'Дерматолог'],
    position: 'Главный врач',
    practiceSince: 2014,
    photo: 'doctorSmykova',
    articles: [
      { href: '/blog-botulino', label: 'Сколько держится ботулотоксин?' },
      { href: '/blog-lazer', label: 'Почему нельзя пользоваться автозагаром перед лазерной эпиляцией?' },
      { href: '/blog-ems1', label: 'Можно ли проходить процедуры на аппарате BTL EMSELLA при эндометриозе или аденомиозе?' },
    ],
  },
  { slug: 'borovkova-yuliya', name: 'Боровкова (Чернова) Юлия Витальевна', specialties: ['Нейрохирург'], practiceSince: 2017, photo: 'doctorBorovkova' },
  { slug: 'harinova-oksana', name: 'Харинова Оксана Юрьевна', specialties: ['Косметолог-эстетист'], practiceSince: 2012, photo: 'doctorHarinova' },
  { slug: 'kogut-natalya', name: 'Когут Наталья Сергеевна', specialties: ['Массажист', 'Косметолог-эстетист'], practiceSince: 2005, photo: 'doctorKogut', services: [{ href: '/massage', label: 'Массаж лица и тела' }] },
  { slug: 'pogorelova-yuliya', name: 'Погорелова Юлия Евгеньевна', specialties: ['Косметолог-эстетист'], practiceSince: 2021, photo: 'doctorPogorelova' },
  { slug: 'agaeva-sevil', name: 'Агаева Севиль Шаиговна', specialties: ['Косметолог-эстетист'], practiceSince: 2022, photo: 'doctorAgaeva' },
  { slug: 'matveeva-nina', name: 'Матвеева Нина Викторовна', specialties: ['Косметолог-эстетист'], practiceSince: 2024, photo: 'doctorMatveeva' },
];

export const doctorUrl = (d: Doctor) => `/vrach-${d.slug}`;

/** Страница готова для поиска: есть хотя бы специальность */
export const isIndexable = (d: Doctor) => d.specialties.length > 0;

/** «Косметолог, дерматолог» */
export const specialtyLine = (d: Doctor) =>
  d.specialties.map((s, i) => (i ? s.toLowerCase() : s)).join(', ');

/** «Стаж 12 лет» по году начала практики */
export function experience(d: Doctor, now = new Date()): string | undefined {
  if (!d.practiceSince) return undefined;
  const n = now.getFullYear() - d.practiceSince;
  const m10 = n % 10, m100 = n % 100;
  const word = m10 === 1 && m100 !== 11 ? 'год' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'года' : 'лет';
  return `Стаж ${n} ${word}`;
}
