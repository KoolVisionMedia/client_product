/**
 * Everything the Plan Explorer shows beyond the basic facts in floorPlans.ts:
 * the 3D models, the room list per floor, the finished-home photos and (where
 * one exists) a build clip. Keyed by the plan id used in floorPlans.ts.
 *
 *  - floors:   one entry per level; `glb` is the roof-off interior model and
 *              `poster` the still shown until it has loaded. `scan: false`
 *              marks the older extruded model (shallower camera).
 *  - exterior: a full exterior model, where one has been made.
 *  - photos:   captions for /assets/floorplans/gallery/<id>-<n>-{240,800,1600}.webp
 *  - film:     a short clip for the stage.
 */
export type PlanFloor = { label: string; glb: string; poster: string; scan: boolean; rooms: string[] };
export type PlanMedia = {
  kind: string;
  garage: string;
  layout: string;
  floors: PlanFloor[];
  exterior?: { glb: string; poster: string };
  photosNote: string;
  photos: string[];
  film?: { src: string; poster: string; caption: string };
};

const model = (id: string, k: number | 'ext') => ({
  glb: `/models/floorplans/${id}-${k}.glb`,
  poster: `/assets/floorplans/3d/${id}-${k}.webp`,
});

export const planPhoto = (id: string, n: number, w: 240 | 800 | 1600) =>
  `/assets/floorplans/gallery/${id}-${n + 1}-${w}.webp`;

export const planMedia: Record<string, PlanMedia> = {
  cypress: {
    kind: "Single level",
    garage: "3-car",
    layout: "Everything on one level: bedrooms split to either side of the living room, a covered patio off the back and a three-car garage.",
    floors: [
      { label: "Main floor", ...model('cypress', 0), scan: true, rooms: ["Primary bedroom + bath", "Living", "Dining", "Kitchen + pantry", "Bedroom 2", "Bedroom 3", "Study / bed 4", "Laundry", "Mud room", "2 covered patios", "3-car garage"] },
    ],
    photosNote: "Beams over the great room, a sage bedroom, and a porch across the back.",
    photos: [
      "The Cypress from the road: brick below, dark board-and-batten above, a concrete drive running up to the garage",
      "The covered entry, dark siding over a brick stoop, with a tall glazed front door",
      "The great room under exposed wood beams, opening through to the kitchen",
      "The kitchen island in wood cabinetry with stainless appliances and a run of counter behind",
      "The dining area lit by a ring chandelier, with a window to the field",
      "The primary bath: a freestanding tub set between two wood vanities under round mirrors",
      "A bedroom painted sage green, with a tray ceiling and a window to the yard",
      "The covered rear porch, wood decking under a black metal ceiling",
    ],
    film: {
      src: '/assets/floorplans/cypress-build.mp4',
      poster: '/assets/floorplans/cypress-build-poster.webp',
      caption: 'Illustration: from a wooded lot to a finished Cypress.',
    },
  },
  dogwood: {
    kind: "Two stories",
    garage: "3-car",
    layout: "A living room open to the floor above, a study or fourth bedroom downstairs, and a bonus room up with the other bedrooms.",
    floors: [
      { label: "Main floor", ...model('dogwood', 0), scan: true, rooms: ["Living, open to above", "Dining", "Kitchen + butler's pantry", "Bed 4 / study", "Mud room", "Covered porch", "3-car garage"] },
      { label: "Upper floor", ...model('dogwood', 1), scan: true, rooms: ["Primary bedroom + bath", "Bedroom 2", "Bedroom 3", "Bonus room"] },
    ],
    exterior: model('dogwood', 'ext'),
    photosNote: "Two stories, a wall of dark cabinetry, and green tile in the primary bath.",
    photos: [
      "The Dogwood from the front: white board-and-batten over brick, two stories, with an arched entry",
      "The great room under wood beams, the stair on the left and the kitchen island beyond",
      "A built-in wall of dark cabinetry with double ovens and open shelving",
      "The primary bath in green tile, a freestanding tub beside a glass shower",
      "The upstairs landing looking down over the great room across a wood rail",
      "The shower in stacked green tile with a brass rain head",
      "The covered rear porch, wood decking under a black board ceiling, looking out to timber",
      "The house seen from the air, sitting in a cleared hillside with autumn timber around it",
    ],
  },
  harmony: {
    kind: "Two stories",
    garage: "2-car",
    layout: "The primary suite stays on the main floor beside a study. Three more bedrooms and a bonus room go upstairs.",
    floors: [
      { label: "Main floor", ...model('harmony', 0), scan: true, rooms: ["Primary bedroom + bath", "Living", "Dining", "Kitchen", "Study", "Foyer", "Rear porch", "Garage"] },
      { label: "Upper floor", ...model('harmony', 1), scan: true, rooms: ["Bedroom 2", "Bedroom 3", "Bedroom 4", "Bonus room", "2 baths"] },
    ],
    photosNote: "Green runs through it: the stairwell, the island, the laundry.",
    photos: [
      "Harmony from the front: brick and dark board-and-batten over two stories, with a side garage",
      "The stairwell painted deep green, lit by skylights, with a faceted brass chandelier",
      "The kitchen with a green island and brass pendants, open to the living room",
      "The two-story living room with the stair on one side and a wall of windows on the other",
      "The primary bath in pale green tile with a freestanding tub under a window",
      "The laundry room in green cabinetry with brass fixtures and a stone counter",
      "The covered rear porch under a green board ceiling, looking out over the lawn",
      "The back of the house: brick and dark siding with the covered porch running along it",
    ],
  },
  magnolia: {
    kind: "Two stories",
    garage: "3-car",
    layout: "Five bedrooms, one of them on the main floor, with 10 ft ceilings through the living and dining rooms.",
    floors: [
      { label: "Main floor", ...model('magnolia', 0), scan: false, rooms: ["Living, 10 ft ceiling", "Dining, 10 ft ceiling", "Kitchen + pantry", "Bedroom 5", "Mud room", "Patio", "3-car garage"] },
      { label: "Upper floor", ...model('magnolia', 1), scan: false, rooms: ["Primary bedroom + bath", "Bedroom 2", "Bedroom 3", "Bedroom 4", "Bonus room", "Laundry"] },
    ],
    photosNote: "Fluted black walls, a patterned range wall, marble in the bath.",
    photos: [
      "The Magnolia from the front: dark brick over two stories with a double garage",
      "A fluted black feature wall carrying the fireplace, with the living room furnished in front of it",
      "The kitchen and dining in black cabinetry, the stair rising beyond",
      "The range wall: black cabinets with patterned tile running up behind the cooktop",
      "The living room looking back at the black slat wall and fireplace",
      "The primary bath in marble tile with a freestanding tub under a window",
      "The mudroom in black board-and-batten with a wood bench and hooks",
      "The covered rear deck, wood rail and stained ceiling, over the back lawn",
    ],
  },
  myrtle: {
    kind: "One level, optional bonus room",
    garage: "Attached",
    layout: "Four bedrooms on one level under vaulted ceilings. Add the bonus room over the garage, or leave it off.",
    floors: [
      { label: "Main floor", ...model('myrtle', 0), scan: true, rooms: ["Primary bedroom + bath", "Living, vaulted", "Dining, vaulted", "Kitchen + pantry", "Bedroom 2", "Bedroom 3", "Bedroom 4", "Front + rear porch", "Garage"] },
      { label: "Bonus level", ...model('myrtle', 1), scan: true, rooms: ["Bonus room", "Closet", "Attic storage"] },
    ],
    photosNote: "White and light, with the porch running the width of the back.",
    photos: [
      "Myrtle from the front: white brick over two stories with a dark roof and black window frames",
      "The living room furnished around the fireplace, open through to the kitchen",
      "The white kitchen with a long island and counter stools",
      "The kitchen range wall in white cabinetry under brass pendants",
      "The living area with sliding doors out to the covered porch",
      "A bedroom made up with an upholstered bed under a vaulted ceiling",
      "A double vanity in white cabinetry with brass fixtures and round mirrors",
      "The covered rear porch under a stained ceiling, looking out over open ground",
    ],
  },
};
