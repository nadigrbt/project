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
  cosmLetters:   { file: 'cosmetology-letters.webp' },
  heroLetters:   { file: 'hero-letters.webp',  remote: `${T}/tild3434-3831-4561-b634-643362643334/AJ_logo_2_2-min.png`, width: 1200 },
  heroDoctors:   { file: 'hero-doctors.webp',  remote: `${T}/tild3730-3761-4564-b761-623765656663/photo.png`, width: 600 },
  star:          { file: 'star.svg',           remote: `${T}/tild3432-6162-4235-b237-343630373565/ph_star-four-fill.svg` },
  arrow:         { file: 'arrow.svg',          remote: `${T}/tild3466-6561-4335-a465-316232336332/Line_20.svg` },
  ig:            { file: 'ig.svg',             remote: `${T}/tild3832-6464-4437-b634-383964373261/ph_instagram-logo-fi.svg` },
  vk:            { file: 'vk.svg',             remote: `${T}/tild3631-3835-4963-b836-333835303934/uil_vk.svg` },
  tg:            { file: 'tg.svg',             remote: `${T}/tild3163-6264-4833-a434-393564333839/fontisto_telegram.svg` },
  promoWoman:    { file: 'volnewmer-woman.webp',  remote: `${T}/tild3361-3462-4338-b063-363935386237/__-33.png`, width: 700 },
  cleanWoman:    { file: 'clean-woman.webp' },
  handHero:      { file: 'hand-hero.webp' },
  intimHero:     { file: 'intim-hero.webp' },
  permHero:      { file: 'perm-hero.webp' },
  pierHero:      { file: 'pier-hero.webp' },
  perm1:         { file: 'perm-1.webp' },
  perm2:         { file: 'perm-2.webp' },
  perm3:         { file: 'perm-3.webp' },
  perm4:         { file: 'perm-4.webp' },
  perm5:         { file: 'perm-5.webp' },
  permWork1:     { file: 'perm-work-1.webp' },
  permWork2:     { file: 'perm-work-2.webp' },
  permWork3:     { file: 'perm-work-3.webp' },
  permWork4:     { file: 'perm-work-4.webp' },
  permWork5:     { file: 'perm-work-5.webp' },
  permWork6:     { file: 'perm-work-6.webp' },
  permWork7:     { file: 'perm-work-7.webp' },
  permWork8:     { file: 'perm-work-8.webp' },
  pedHero:       { file: 'ped-hero.webp' },
  ped1:          { file: 'ped-1.webp' },
  ped2:          { file: 'ped-2.webp' },
  ped3:          { file: 'ped-3.webp' },
  ped4:          { file: 'ped-4.webp' },
  edu1:          { file: 'edu-1.webp' },
  edu2:          { file: 'edu-2.webp' },
  edu3:          { file: 'edu-3.webp' },
  edu4:          { file: 'edu-4.webp' },
  eduCos1:       { file: 'edu-cos-1.webp' },
  eduCos2:       { file: 'edu-cos-2.webp' },
  eduCos3:       { file: 'edu-cos-3.webp' },
  eduMan1:       { file: 'edu-man-1.webp' },
  eduMan2:       { file: 'edu-man-2.webp' },
  eduMan3:       { file: 'edu-man-3.webp' },
  eduPed1:       { file: 'edu-ped-1.webp' },
  eduPed2:       { file: 'edu-ped-2.webp' },
  eduPed3:       { file: 'edu-ped-3.webp' },
  eduSes1:       { file: 'edu-ses-1.webp' },
  eduSes2:       { file: 'edu-ses-2.webp' },
  eduSes3:       { file: 'edu-ses-3.webp' },
  license1:      { file: 'license-1.webp' },
  license2:      { file: 'license-2.webp' },
  lift1:         { file: 'lift-1.webp' },
  lift2:         { file: 'lift-2.webp' },
  lift3:         { file: 'lift-3.webp' },
  lift4:         { file: 'lift-4.webp' },
  liftHero:      { file: 'lift-hero.webp' },
  massHero:      { file: 'mass-hero.webp' },
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

  // Страница /volnewmer
  volBanner:     { file: 'volnewmer-banner.webp', remote: `${T}/tild3134-6538-4434-b462-663963316666/__2026-06-17_121952.png`, width: 1680 },
  vol1:          { file: 'volnewmer-1.webp',   remote: `${T}/tild6166-3566-4461-b735-643638343133/IMG_5018.JPG`, width: 900 },
  vol2:          { file: 'volnewmer-2.webp',   remote: `${T}/tild6234-3438-4633-a164-656436633931/IMG_5025.JPG`, width: 600 },
  vol3:          { file: 'volnewmer-3.webp',   remote: `${T}/tild3066-3930-4166-a531-633030333064/IMG_5046.JPG`, width: 600 },
  vol4:          { file: 'volnewmer-4.webp',   remote: `${T}/tild3761-6233-4666-a137-386631646231/IMG_5108.JPG`, width: 600 },
  vol5:          { file: 'volnewmer-5.webp',   remote: `${T}/tild6330-6332-4832-b432-666131653736/__2026-07-08_220054.png`, width: 600 },

  // Страница /cosmetology
  cosmBanner:    { file: 'cosmetology-banner.webp', remote: `${T}/tild3865-3133-4632-a265-653833636133/__2023-05-26__145152.png`, width: 1480 },
  cosm1:         { file: 'cosmetology-1.webp', remote: `${T}/tild6433-6665-4439-b738-633664303839/2026-05-10_133744HEI.jpeg`, width: 900 },
  cosm2:         { file: 'cosmetology-2.webp', remote: `${T}/tild6434-3765-4237-a132-626633663530/__2023-05-26__144420.png`, width: 1100 },
  cosm3:         { file: 'cosmetology-3.webp', remote: `${T}/tild3661-6666-4432-a339-393436383762/__2026-06-24_154829.png`, width: 700 },

  // Страница /injections
  inj1:          { file: 'injections-1.webp', remote: `${T}/tild3363-6161-4463-b833-643132643532/__2023-05-09__195654.png`, width: 900 },
  inj2:          { file: 'injections-2.webp', remote: `${T}/tild3466-6237-4735-b635-343134333865/__2023-05-09__194359.png`, width: 900 },
  inj3:          { file: 'injections-3.webp', remote: `${T}/tild6435-3632-4466-b734-316436653563/__2023-06-29__214616.png`, width: 900 },
  inj4:          { file: 'injections-4.webp', remote: `${T}/tild6538-6530-4338-b630-306335653064/__2023-05-08__173605.png`, width: 900 },
  inj5:          { file: 'injections-5.webp', remote: `${T}/tild3366-3565-4864-a631-666235366364/__2023-06-29__215122.png`, width: 1200 },
  inj6:          { file: 'injections-6.webp', remote: `${T}/tild6436-3733-4933-a530-366265613362/photo.png`, width: 700 },

  // Фото результатов СФЕРОгель (свои, разрешение владельца 18.10; глаза закрыты)
  sfero1: { file: 'sfero-1.webp' },
  sfero2: { file: 'sfero-2.webp' },

  // Фото клиники для блока-галереи (свои, не с Тильды)
  clinicLounge:     { file: 'clinic-lounge.webp' },
  clinicLogo:       { file: 'clinic-logo-flowers.webp' },
  deviceLpg: { file: 'device-lpg.webp' },
  deviceVolnewmer: { file: 'device-volnewmer.webp' },
  deviceLiftera: { file: 'device-liftera.webp' },
  deviceHeleo: { file: 'device-heleo.webp' },
  deviceMorpheus: { file: 'device-morpheus.webp' },
  deviceLumecca: { file: 'device-lumecca.webp' },
  deviceMediostar: { file: 'device-mediostar.webp' },
  deviceIxtron: { file: 'device-ixtron.webp' },
  deviceNeogen: { file: 'device-neogen.webp' },
  deviceMicro: { file: 'device-micro.webp' },
  deviceHydrafacial: { file: 'device-hydrafacial.webp' },
  deviceProfacial: { file: 'device-profacial.webp' },
  deviceScrubber: { file: 'device-scrubber.webp' },
  deviceBtl: { file: 'device-btl.webp' },
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
