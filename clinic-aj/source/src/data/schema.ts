// Разметка schema.org (JSON-LD) для Яндекса и Google. Подключается через проп `jsonLd` у layouts/Base.astro.
import { site } from './site';
import { doctorUrl, type Doctor } from './doctors';

export const SITE_URL = 'https://clinic-aj.ru';
export const abs = (path: string) => new URL(path, SITE_URL).href;

const CLINIC_ID = `${SITE_URL}/#clinic`;

/** Клиника: адреса филиалов, телефон, график — из data/site.ts */
export const clinicLd = () => ({
  '@type': 'MedicalClinic',
  '@id': CLINIC_ID,
  name: 'Клиника эстетической косметологии A&J',
  legalName: site.legalName,
  url: SITE_URL,
  telephone: '+7 8152 78-70-30',
  logo: abs('/images/logo.webp'),
  image: abs('/images/og.jpg'),
  openingHours: 'Mo-Su 09:00-21:00',
  address: site.addresses.map((a) => ({
    '@type': 'PostalAddress',
    addressCountry: 'RU',
    addressLocality: 'Мурманск',
    streetAddress: a.replace(/^Мурманск,\s*/, ''),
  })),
  sameAs: [site.social.vk, site.social.telegram],
});

/** Ссылка на клинику внутри другой разметки */
export const clinicRef = { '@type': 'MedicalClinic', '@id': CLINIC_ID, name: 'Клиника эстетической косметологии A&J', url: SITE_URL };

export const breadcrumbsLd = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: abs(x.href) })),
});

/** Врач: Person с должностью и специальностями, работает в клинике, профиль на ПроДокторов — в sameAs */
export function doctorLd(d: Doctor, photoUrl?: string) {
  const url = abs(doctorUrl(d));
  return {
    '@type': 'Person',
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
