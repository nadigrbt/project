// Все картинки сайта.
// `file` — где картинка лежит у нас (public/images/…),
// `remote` — откуда она скачивается с Тильды командой `npm run images`.
// `width` — до какой ширины ужимать при скачивании (в 2 раза больше размера на экране).

export interface SiteImage {
  file: string;
  /** Пусто — картинка своя (лежит только в public/images), с Тильды не скачивается. */
  remote?: string;
  width?: number;
}

const T = 'https://static.tildacdn.com';

export const images = {
  logo:          { file: 'logo.webp',          remote: `${T}/tild6661-6166-4336-a436-386130373361/aj.png`, width: 400 },
  footerLogo:    { file: 'logo-footer.svg',    remote: `${T}/tild3365-6664-4664-a136-663565646437/AJ_logo_2_3.svg` },
  heroLetters:   { file: 'hero-letters.webp',  remote: `${T}/tild3434-3831-4561-b634-643362643334/AJ_logo_2_2-min.png`, width: 1200 },
  heroDoctors:   { file: 'hero-doctors.webp',  remote: `${T}/tild3730-3761-4564-b761-623765656663/photo.png`, width: 600 },
  star:          { file: 'star.svg',           remote: `${T}/tild3432-6162-4235-b237-343630373565/ph_star-four-fill.svg` },
  arrow:         { file: 'arrow.svg',          remote: `${T}/tild3466-6561-4335-a465-316232336332/Line_20.svg` },
  ig:            { file: 'ig.svg',             remote: `${T}/tild3832-6464-4437-b634-383964373261/ph_instagram-logo-fi.svg` },
  vk:            { file: 'vk.svg',             remote: `${T}/tild3631-3835-4963-b836-333835303934/uil_vk.svg` },
  tg:            { file: 'tg.svg',             remote: `${T}/tild3163-6264-4833-a434-393564333839/fontisto_telegram.svg` },
  promoWoman:    { file: 'volnewmer-woman.webp',  remote: `${T}/tild3361-3462-4338-b063-363935386237/__-33.png`, width: 700 },
  promoDevice:   { file: 'volnewmer-device.webp', remote: `${T}/tild3337-3638-4465-b334-666364396330/__-19.png`, width: 800 },
  aboutBg:       { file: 'about-bg.webp',      remote: `${T}/tild3862-3939-4532-a464-616232666134/13.png`, width: 1600 },
  about1:        { file: 'about-1.webp',       remote: `${T}/tild3233-3333-4139-b431-346332313361/IMG_2960.jpg`, width: 500 },
  about2:        { file: 'about-2.webp',       remote: `${T}/tild6133-6630-4137-b163-636638663736/1ff.png`, width: 500 },
  about3:        { file: 'about-3.webp',       remote: `${T}/tild6363-3761-4432-b838-653531626565/3ff.png`, width: 500 },
  about4:        { file: 'about-4.webp',       remote: `${T}/tild3239-3738-4438-b832-656466326434/2ff.png`, width: 500 },
  about5:        { file: 'about-5.webp',       remote: `${T}/tild3062-6564-4866-a438-353834626136/noroot.png`, width: 500 },
  aboutIg:       { file: 'about-ig.svg',       remote: `${T}/tild3565-3962-4564-b935-666439336331/11.svg` },
  aboutVk:       { file: 'about-vk.svg',       remote: `${T}/tild3136-6330-4132-b639-326661666365/14.svg` },
  aboutTg:       { file: 'about-tg.svg',       remote: `${T}/tild3130-3462-4839-a135-303035366161/15.svg` },
  developer:     { file: 'polar-digital.webp', remote: `${T}/tild3635-3666-4336-a563-363964326632/photo.png`, width: 200 },
  favicon:       { file: 'favicon.svg',        remote: `${T}/tild3363-6631-4238-a439-656236633565/kosmetologiya_murman.svg` },
  faviconLight:  { file: 'favicon-light.svg',  remote: `${T}/tild6539-6662-4931-a635-346634343638/kosmetologiya_murman.svg` },
  faviconDark:   { file: 'favicon-dark.svg',   remote: `${T}/tild3464-3937-4331-a664-363038663661/kosmetologiya_murman.svg` },
  appleIcon:     { file: 'apple-touch-icon.png', remote: `${T}/tild6237-3737-4130-b965-373233396138/kosmetologiya_murman.png`, width: 192 },
  og:            { file: 'og.jpg',             remote: `${T}/tild3133-3666-4639-b434-376539316537/AJ_logo.jpg`, width: 1200 },

  // Фото клиники для блока-галереи (свои, не с Тильды)
  clinicLounge:     { file: 'clinic-lounge.webp' },
  clinicLogo:       { file: 'clinic-logo-flowers.webp' },
  clinicVolnewmer:  { file: 'clinic-volnewmer-room.webp' },
  clinicWashbasins: { file: 'clinic-washbasins.webp' },
  clinicTeam:       { file: 'clinic-reception-team.webp' },
  clinicBalloons:   { file: 'clinic-balloons.webp' },
  clinicMirrors:    { file: 'clinic-mirrors.webp' },
  clinicHall:       { file: 'clinic-hall.webp' },
  clinicTerminal:   { file: 'clinic-logo-terminal.webp' },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;

// Пока картинки не скачаны (или для превью) можно брать их прямо с Тильды:
// REMOTE_IMAGES=1 npm run build
const useRemote = import.meta.env?.REMOTE_IMAGES === '1' || process.env.REMOTE_IMAGES === '1';

export function img(key: ImageKey): string {
  const i: SiteImage = images[key];
  return useRemote && i.remote ? i.remote : `/images/${i.file}`;
}
