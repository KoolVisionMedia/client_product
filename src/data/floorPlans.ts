/**
 * The published floor plans. Shared by the home page shelf (Portfolio.tsx) and
 * the Floorplans page, so a plan is added or edited in one place.
 *
 *  - exterior:   photo of the finished home
 *  - plans:      coloured 3D layout renders, one per level (each also ships an
 *                800w copy beside it: foo.jpg / foo-800.jpg)
 *  - blueprints: the measured line drawings of the same levels
 */
export type FloorPlan = {
  id: string;
  title: string;
  exterior: string;
  plans: string[];
  blueprints: string[];
  beds: number;
  baths: number;
  sqft: string;
  description: string;
};

export const floorPlans: FloorPlan[] = [
  {
    id: 'cypress',
    title: 'The Cypress',
    exterior: '/assets/floorplans/Cypress.jpg',
    plans: ['/assets/floorplans/cypress_render.jpg'],
    blueprints: ['/assets/floorplans/cypress_main_fp.jpg'],
    beds: 4,
    baths: 2,
    sqft: '2,650',
    description: 'The Cypress features a thoughtful open-concept main living area, perfect for entertaining. With natural light flooding the primary spaces and a beautifully appointed kitchen, this home balances elegance and everyday practicality.'
  },
  {
    id: 'dogwood',
    title: 'The Dogwood',
    exterior: '/assets/floorplans/Dogwood.jpg',
    plans: ['/assets/floorplans/dogwood_render_f1.jpg', '/assets/floorplans/dogwood_render_f2.jpg'],
    blueprints: ['/assets/floorplans/dogwood_main_fp2.jpg', '/assets/floorplans/dogwood_upper_fp2.jpg'],
    beds: 4,
    baths: 2.5,
    sqft: '2,600',
    description: 'The Dogwood offers generous living space spread across two levels. The main floor boasts a grand entry and open living area, while the upper floor provides private retreats with spacious bedrooms and luxurious bathrooms.'
  },
  {
    id: 'harmony',
    title: 'The Harmony',
    exterior: '/assets/floorplans/Harmony.jpg',
    plans: ['/assets/floorplans/harmony_render_f1.jpg', '/assets/floorplans/harmony_render_f2.jpg'],
    blueprints: ['/assets/floorplans/harmony_main_fp2.jpg', '/assets/floorplans/harmony_fp2.jpg'],
    beds: 4,
    baths: 3.5,
    sqft: '2,860',
    description: 'Experience balanced living in The Harmony. This plan is designed for modern families who desire both collaborative spaces and quiet corners. Featuring a gourmet kitchen and a stunning primary suite.'
  },
  {
    id: 'magnolia',
    title: 'The Magnolia',
    exterior: '/assets/floorplans/Magnolia.jpg',
    plans: ['/assets/floorplans/magnolia_render_f1.jpg', '/assets/floorplans/magnolia_render_f2.jpg'],
    blueprints: ['/assets/floorplans/magnolia_main_fp2.jpg', '/assets/floorplans/magnolia_upper_fp2.jpg'],
    beds: 5,
    baths: 3,
    sqft: '2,650',
    description: 'The Magnolia is a testament to Southern charm and luxury. A sprawling two-story layout with soaring ceilings, a chef\'s dream kitchen, and ample outdoor living space makes it perfect for hosting.'
  },
  {
    id: 'myrtle',
    title: 'The Myrtle',
    exterior: '/assets/floorplans/Myrtle.jpg',
    plans: ['/assets/floorplans/myrtle_render_f1.jpg', '/assets/floorplans/myrtle_render_f2.jpg'],
    blueprints: ['/assets/floorplans/myrtle_main_fp2.jpg', '/assets/floorplans/myrtle_upper_fp2.jpg'],
    beds: 4,
    baths: 2,
    sqft: '1,900',
    description: 'The Myrtle is a streamlined, highly functional single-level living space with an optional upper loft. It maximizes every square foot, offering a cozy yet open environment with premium finishes throughout.'
  }
];
