// Разметка schema.org (JSON-LD) для Яндекса и Google. Подключается через проп `jsonLd` у layouts/Base.astro.
import { site, addresses, type Branch } from './site';
import { doctorUrl, type Doctor } from './doctors';

export const SITE_URL = 'https://clinic-aj.ru';
export const abs = (path: string) => new URL(path, SITE_URL).href;

export const CLINIC_ID = `${SITE_URL}/#clinic`;
const CLINIC_NAME = 'Клиника эстетической косметологии A&J';
const PHONE = site.phone.href.replace('tel:', '');

const hours = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '09:00',
  closes: '21:00',
};

const postal = (address: string) => ({
  '@type': 'PostalAddress',
  streetAddress: address.replace(/^Мурманск,\s*/, ''),
  addressLocality: 'Мурманск',
  addressRegion: 'Мурманская область',
  addressCountry: 'RU',
});

/** Филиал: отдельная точка на карте (для локальной выдачи «… рядом», «… на Кольском»). Только факты из data/site.ts. */
const branchLd = (b: Branch, i: number) => ({
  '@type': 'MedicalClinic',
  '@id': `${SITE_URL}/#branch-${i + 1}`,
  name: `${CLINIC_NAME} — ${b.address.replace(/^Мурманск,\s*/, '').replace(/,\s*\d+\s*этаж.*$/, '')}`,
  url: `${SITE_URL}/`,
  telephone: PHONE,
  image: abs('/images/og.jpg'),
  address: postal(b.address),
  ...(b.coords ? { geo: { '@type': 'GeoCoordinates', latitude: b.coords[0], longitude: b.coords[1] } } : {}),
  ...(b.yandex ? { hasMap: b.yandex } : {}),
  openingHoursSpecification: hours,
  parentOrganization: { '@id': CLINIC_ID },
  sameAs: [b.yandex, b.twogis].filter(Boolean),
});

/** Клиника (сеть из трёх филиалов): на всех страницах через layouts/Base.astro. Данные — data/site.ts */
export const clinicLd = () => ({
  '@type': 'MedicalClinic',
  '@id': CLINIC_ID,
  name: CLINIC_NAME,
  alternateName: ['A&J', 'Клиника A&J', 'Эй энд Джей'],
  legalName: site.legalName,
  taxID: site.inn,
  url: `${SITE_URL}/`,
  telephone: PHONE,
  logo: abs('/images/logo.webp'),
  image: abs('/images/og.jpg'),
  description: 'Клиника эстетической косметологии и дерматологии в Мурманске: аппаратная и инъекционная косметология, лазерная эпиляция, эстетические процедуры, подология, перманентный макияж, учебный центр.',
  medicalSpecialty: 'Dermatologic',
  isAcceptingNewPatients: true,
  openingHoursSpecification: hours,
  address: addresses.map(postal),
  areaServed: { '@type': 'City', name: 'Мурманск' },
  department: site.branches.map(branchLd),
  sameAs: [site.social.vk, site.social.telegram, site.prodoctorovUrl],
});

/** Ссылка на клинику внутри другой разметки */
export const clinicRef = { '@type': 'MedicalClinic', '@id': CLINIC_ID, name: CLINIC_NAME, url: `${SITE_URL}/` };

export const breadcrumbsLd = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: abs(x.href) })),
});

/** Врач: Person с должностью и специальностями, работает в клинике, профиль на ПроДокторов — в sameAs */
export function doctorLd(d: Doctor, photoUrl?: string) {
  const url = abs(doctorUrl(d));
  // Врач (есть «врач» или «дерматолог» в специальности) — Person + Physician; косметолог-эстетист, массажист — Person
  const isPhysician = d.specialties.some((s) => /врач|дерматолог/i.test(s));
  return {
    '@type': isPhysician ? ['Person', 'Physician'] : 'Person',
    ...(isPhysician && /дерматолог/i.test(d.specialties.join(' ')) ? { medicalSpecialty: 'Dermatologic' } : {}),
    '@id': `${url}#doctor`,
    name: d.name,
    url,
    ...(photoUrl ? { image: abs(photoUrl) } : {}),
    jobTitle: d.position ?? (d.specialties[0] || undefined),
    ...(d.specialties.length ? { hasOccupation: d.specialties.map((s) => ({ '@type': 'Occupation', name: s })) } : {}),
    ...(d.education?.length ? { alumniOf: d.education.map((e) => ({ '@type': 'EducationalOrganization', name: e.title })) } : {}),
    worksFor: clinicRef,
    ...(d.prodoctorovUrl ? { sameAs: [d.prodoctorovUrl] } : {}),
  };
}
