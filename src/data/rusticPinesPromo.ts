/**
 * Rustic Pines promo film — shown in the home page announcement section
 * (src/components/RusticPinesIntro.tsx) and described to search engines as a
 * VideoObject (src/pages/Home.tsx) and in public/sitemap.xml.
 *
 * Files live in public/assets/rustic-pines/promo/. The source master is
 * RusticPinesPromoFinalV1.mp4 (Dropbox: Kool Vision Media / Agent Projects /
 * Homefront Content / Rustic Pines Promo); the web copies are H.264 MP4s with
 * the moov atom up front (+faststart) so playback starts while downloading.
 *
 * Kept tiny on purpose: Home is in the main bundle, so this must not pull in the
 * lot data from ./rusticPines.ts.
 */
const DIR = '/assets/rustic-pines/promo';

/**
 * true once the web copies + poster frames are in public/assets/rustic-pines/promo/.
 * While false the section shows the Rustic Pines aerial photo (no player, no
 * video files requested) and the VideoObject structured data is left out.
 */
const FILM_READY = false;

const FALLBACK = {
  poster: '/assets/rustic-pines/hero-1400.webp',
  posterSrcSet: '/assets/rustic-pines/hero-800.webp 800w, /assets/rustic-pines/hero-1400.webp 1400w',
  posterAlt: 'Aerial view of the wooded Rustic Pines at Paris Landing community in Stewart County, Tennessee',
};

export const RUSTIC_PINES_PROMO = {
  filmReady: FILM_READY,
  title: 'Introducing Rustic Pines at Paris Landing | Homefront Builders',
  description:
    'A first look at Rustic Pines at Paris Landing, the new wooded community near Kentucky Lake in Stewart County, Tennessee, headlined by Homefront Builders. 41 homesites, 5 to 24 acres each.',
  /** Desktop / tablet (>= 768px wide). */
  src1080: `${DIR}/rustic-pines-promo-1080.mp4`,
  /** Phones. */
  src720: `${DIR}/rustic-pines-promo-720.mp4`,
  /** Still frame from the film, used as the poster before the video plays. */
  ...(FILM_READY
    ? {
        poster: `${DIR}/rustic-pines-promo-poster-1600.webp`,
        posterSrcSet: `${DIR}/rustic-pines-promo-poster-800.webp 800w, ${DIR}/rustic-pines-promo-poster-1600.webp 1600w`,
        posterAlt:
          'Opening frame of the Rustic Pines at Paris Landing promo film: the wooded community in Stewart County, Tennessee, by Homefront Builders',
      }
    : FALLBACK),
  /** JPEG copy of the poster for structured data and the video sitemap. */
  thumbnailJpg: `${DIR}/rustic-pines-promo-poster.jpg`,
  width: 1920,
  height: 1080,
  /** ISO 8601 duration, from ffprobe. */
  duration: 'PT0S',
  uploadDate: '2026-11-22',
  hasAudio: true,
};
