/**
 * Rustic Pines launch switch.
 *
 * false = page hidden: /rustic-pines shows the 404 page, there is no "Rustic Pines" item in the
 *         Current Builds dropdown, and the page is not prerendered. The page, map, lot data and
 *         images all stay in the codebase untouched.
 * true  = page live.
 *
 * To go live: set this to true, and re-add the /rustic-pines entries to public/sitemap.xml and
 * public/llms.txt (removed while hidden so search engines aren't pointed at it).
 *
 * Kept in its own tiny file so the nav can read it without pulling the lot data into every page.
 * prerender.mjs reads this line with a regex, so keep it a literal `true` / `false`.
 */
export const RUSTIC_PINES_LIVE = false;
