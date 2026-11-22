/**
 * The five most recent 5-star reviews, for the review carousel on the contact
 * page (src/components/ReviewCarousel.tsx).
 *
 * Source: the Google reviews listed on the testimonials page
 * (src/pages/Testimonials.tsx, `googleReviews`), newest first. Quotes are the
 * reviewers' own words; longer reviews are trimmed to an excerpt, with "…"
 * marking any skipped text. When new reviews come in, add them at the top and
 * keep the list to about five.
 */
export type RecentReview = {
  name: string;
  role: string;
  /** relative age as shown on Google when captured */
  when: string;
  quote: string;
};

export const RECENT_REVIEWS: RecentReview[] = [
  {
    name: 'Karen Priest',
    role: 'Client',
    when: '1 week ago',
    quote:
      'Highly professional custom home building experience in Clarksville. The team is very attentive and responsive to questions.',
  },
  {
    name: 'Durrk Broham',
    role: 'Client',
    when: '1 week ago',
    quote:
      'These guys are tubular. Super straightforward and easy communication throughout the build, and the price was great.',
  },
  {
    name: 'Bailey Graven',
    role: 'Clarksville Homeowner',
    when: '2 weeks ago',
    quote:
      'Homefront built us the custom home of our dreams! They kept us informed throughout the whole process, and always stayed ahead of things. … The build quality is beautiful too.',
  },
  {
    name: 'Mia Scimeca',
    role: 'Repeat Client',
    when: '2 weeks ago',
    quote:
      'They understand that building a house is very scary and it’s not simple. But they are extremely comforting and easy to contact and they walk you through it step-by-step.',
  },
  {
    name: 'Jerry Turner',
    role: 'Construction Lender',
    when: '2 weeks ago',
    quote:
      'I’ve gotten to know the team at Homefront Builders through several clients who have built with them, and I’ve been consistently impressed with how they handle the entire process.',
  },
];
