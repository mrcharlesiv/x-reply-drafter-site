import { Footer } from '@/components/footer';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            When you use X Reply Drafter, we collect:
            <ul>
              <li>Account information (email, name, password)</li>
              <li>Usage data (number of drafts generated, timestamps)</li>
              <li>Your plan/subscription status</li>
              <li>Device and browser information</li>
            </ul>
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use your information to:
            <ul>
              <li>Provide and improve our service</li>
              <li>Track usage limits for free and paid tiers</li>
              <li>Send important account notifications</li>
              <li>Prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </p>

          <h2>3. Data We Don't Store</h2>
          <p>
            X Reply Drafter does NOT store:
            <ul>
              <li>The tweets you're replying to</li>
              <li>Your generated reply drafts (except temporarily for processing)</li>
              <li>Your X/Twitter credentials or session data</li>
              <li>Behavioral data or analytics about your X usage</li>
            </ul>
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            We use the following third-party services:
          </p>
          <ul>
            <li><strong>Supabase:</strong> Database and authentication</li>
            <li><strong>Anthropic/Claude:</strong> AI model for draft generation</li>
            <li><strong>Stripe:</strong> Payment processing</li>
          </ul>
          <p>
            Each service has its own privacy policy. We encourage you to review them.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures:
            <ul>
              <li>SSL/TLS encryption for all data in transit</li>
              <li>Encrypted storage of sensitive data</li>
              <li>Regular security audits</li>
              <li>Limited access to user data</li>
            </ul>
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. You can request deletion of your account and associated data at any time by contacting us.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            You have the right to:
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
          </p>

          <h2>8. Contact Us</h2>
          <p>
            For privacy concerns, contact us at: <a href="mailto:privacy@x-reply-drafter.com">privacy@x-reply-drafter.com</a>
          </p>

          <p className="text-gray-500 mt-8">
            Last updated: March 1, 2025
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
