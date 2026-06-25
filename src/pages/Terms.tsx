import SEO from '../components/SEO';

export default function Terms() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-white min-h-screen">
      <SEO
        title="Terms of Service"
        description="Terms of service for Homefront Builders, a luxury custom home builder in Clarksville, TN."
        path="/terms"
      />
      <div className="max-w-3xl mx-auto prose prose-neutral">
        <h1 className="font-serif text-4xl text-primary mb-8">Terms of Service</h1>
        <p className="text-neutral-600 leading-relaxed mb-6">
          Welcome to the Homefront Builders website. By accessing and using this website, you agree to the following terms and conditions.
        </p>
        <h2 className="font-serif text-2xl text-primary mt-10 mb-4">Use of Website</h2>
        <p className="text-neutral-600 leading-relaxed mb-6">
          This website is provided for informational purposes about Homefront Builders' custom home building services in Clarksville, TN and Middle Tennessee. All content is the property of Homefront Builders and may not be reproduced without permission.
        </p>
        <h2 className="font-serif text-2xl text-primary mt-10 mb-4">Disclaimer</h2>
        <p className="text-neutral-600 leading-relaxed mb-6">
          While we strive to keep information on this website accurate and up to date, Homefront Builders makes no warranties about the completeness, reliability, or accuracy of this information. Pricing, availability, and specifications are subject to change without notice.
        </p>
        <h2 className="font-serif text-2xl text-primary mt-10 mb-4">Contact Us</h2>
        <p className="text-neutral-600 leading-relaxed mb-6">
          If you have questions about these Terms of Service, please contact us at{' '}
          <a href="mailto:homefrontbuilderstn@gmail.com" className="text-[#c9a96e] hover:underline">homefrontbuilderstn@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
