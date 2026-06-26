import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-white min-h-screen">
      <SEO
        title="Privacy Policy"
        description="Privacy policy for Homefront Builders, a luxury custom home builder in Clarksville, TN."
        path="/privacy-policy"
      />
      <div className="max-w-3xl mx-auto prose prose-neutral">
        <h1 className="font-serif text-4xl text-primary mb-8">Privacy Policy</h1>
        <p className="text-neutral-600 leading-relaxed mb-6">
          Homefront Builders ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or contact us about our custom home building services.
        </p>
        <h2 className="font-serif text-2xl text-primary mt-10 mb-4">Information We Collect</h2>
        <p className="text-neutral-600 leading-relaxed mb-6">
          We may collect personal information you voluntarily provide, including your name, email address, phone number, and any details you share through our contact forms or chat widget.
        </p>
        <h2 className="font-serif text-2xl text-primary mt-10 mb-4">How We Use Your Information</h2>
        <p className="text-neutral-600 leading-relaxed mb-6">
          We use the information we collect to respond to your inquiries, provide information about our services, and improve your experience on our website.
        </p>
        <h2 className="font-serif text-2xl text-primary mt-10 mb-4">Contact Us</h2>
        <p className="text-neutral-600 leading-relaxed mb-6">
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:homefrontsalesTN@gmail.com" className="text-[#c9a96e] hover:underline">homefrontsalesTN@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
