import { motion } from 'motion/react';

const warrantyActions = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'See Your Coverage',
    description: 'Explore what your 10-Year QBW policy includes and view a digital diagram of your home\'s coverage.',
    cta: 'See Your Coverage',
    href: 'https://www.homefrontbuilderstn.com/warranty-graphic',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    title: 'View Warranty Book',
    description: 'Have questions about your warranty? View a digital copy of your complete Warranty Agreement.',
    cta: 'View Warranty Book',
    href: 'https://simplebooklet.com/qbw_warrantybook1122singlec#page=1',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
    title: 'Request Tutorial Video',
    description: 'Ready to submit a service request? Watch a video to learn how to use your SOS warranty submission page.',
    cta: 'Watch Tutorial',
    href: 'https://www.youtube.com/watch?v=W22WC6pQjmk',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Submit Service Request',
    description: 'Submit your service request online. Don\'t forget to watch the tutorial video if this is your first time submitting.',
    cta: 'Submit Request',
    href: 'https://serviceonlinesolution.com/1903',
  },
];

export default function Warranties() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        <img
          src="/assets/content2.jpg"
          alt="Homefront Builders Warranty"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1b2518]/65" />
        <div className="relative z-10 h-full flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Peace of Mind</p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white tracking-wide">
              Your Home, Protected
            </h1>
          </motion.div>
        </div>
      </section>

      {/* QBW Introduction */}
      <section className="bg-white py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left — Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="block w-10 h-[1px] bg-[#c9a96e] mb-6" />
              <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6 leading-[1.15]">
                10-Year Home Warranty<br />
                <span className="text-[#c9a96e]">Backed by Liberty Mutual</span>
              </h2>
              <p className="font-sans text-base text-primary-light leading-loose mb-8">
                Quality Builders Warranty (QBW) is the nation's premiere provider of 10-year home warranty services. Through QBW, you're able to enjoy the security of a comprehensive warranty backed by Liberty Mutual.
              </p>
              <p className="font-sans text-base text-primary-light leading-loose mb-10">
                After your build is complete, you'll work directly with QBW to address all of your warranty needs. QBW only chooses to work with builders of integrity, and we at Homefront Builders are proud to be among their partners.
              </p>
              <a
                href="https://qbwc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#1b2518] text-white font-sans text-xs uppercase tracking-[0.25em] hover:bg-[#c9a96e] transition-all duration-500 rounded-sm group"
              >
                Learn More About QBW
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            </motion.div>

            {/* Right — QBW Branding */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-8"
            >
              <div className="bg-[#F4F3F0] rounded-3xl p-10 md:p-14 w-full flex flex-col items-center gap-8">
                <img
                  src="/assets/qbw_logo.jpg"
                  alt="Quality Builders Warranty Logo"
                  className="w-48 object-contain"
                />
                <div className="h-[1px] w-full bg-primary/10" />
                <img
                  src="/assets/qbw_book.png"
                  alt="QBW Warranty Book"
                  className="w-full max-w-[320px] object-contain rounded-lg shadow-lg"
                />
                <p className="font-sans text-xs text-primary-light/60 text-center uppercase tracking-[0.2em]">
                  Your complete warranty documentation
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Warranty Actions Grid */}
      <section className="bg-[#F4F3F0] py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-[#c9a96e] mb-4">Warranty Resources</p>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-4">How Can We Help?</h2>
            <p className="font-sans text-sm text-primary-light max-w-lg mx-auto leading-relaxed">
              Access your warranty coverage details, documentation, tutorials, and service request portal all in one place.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {warrantyActions.map((action, i) => (
              <motion.a
                key={action.title}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -60px 0px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group bg-white rounded-2xl p-8 md:p-10 flex flex-col gap-6 hover:shadow-xl transition-all duration-500 border border-transparent hover:border-[#c9a96e]/20 cursor-pointer relative overflow-hidden"
              >
                {/* Decorative number */}
                <span className="absolute top-6 right-8 font-serif text-7xl text-primary/[0.04] group-hover:text-[#c9a96e]/10 transition-colors duration-500">
                  0{i + 1}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#F4F3F0] group-hover:bg-[#c9a96e]/10 flex items-center justify-center text-[#c9a96e] transition-all duration-500">
                  {action.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-serif text-2xl text-primary mb-3 group-hover:text-[#c9a96e] transition-colors duration-300">{action.title}</h3>
                  <p className="font-sans text-sm text-primary-light leading-relaxed">{action.description}</p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-[#c9a96e] font-semibold pt-2">
                  {action.cta}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-2 transition-transform duration-300">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-[#1b2518] py-16 px-6 md:px-12">
        <div className="max-w-[1000px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-center gap-2 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#c9a96e" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#c9a96e" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#c9a96e" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <p className="font-serif text-2xl md:text-3xl text-white mb-4 leading-relaxed">
              Homefront Builders is a proud supporter of<br/>
              <span className="text-[#c9a96e]">Equal Opportunity Housing</span>
            </p>
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-white/40">
              Building with integrity since day one
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
