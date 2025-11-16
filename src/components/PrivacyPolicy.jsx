import { X, Shield, Lock, Eye, User, Cookie, CreditCard, Database } from 'lucide-react';

export default function PrivacyPolicy({ onClose }) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // If no onClose handler, just hide the modal
      window.location.hash = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-90 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 md:p-8 border border-gray-700 space-y-8">
          {/* Last Updated */}
          <div className="text-sm text-gray-400 border-b border-gray-700 pb-4">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-yellow-400" />
              Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to Space Adventure ("we," "our," or "us"). We are committed to protecting your privacy and ensuring 
              you have a positive experience on our website and in using our services. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you visit our website and play our games.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-400" />
              Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">1. Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Account Information:</strong> Email address, display name, and password when you create an account</li>
              <li><strong>Game Data:</strong> Game progress, scores, achievements, and gameplay statistics</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store credit card details)</li>
              <li><strong>Profile Information:</strong> Avatar, preferences, and settings you choose to share</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">2. Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Device Information:</strong> Device type, operating system, browser type, and screen resolution</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, game sessions, and interactions</li>
              <li><strong>Location Data:</strong> Country/region (for regional pricing and GDPR compliance)</li>
              <li><strong>IP Address:</strong> Used for security, fraud prevention, and regional detection</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">3. Cookies and Tracking Technologies</h3>
            <p className="text-gray-300 mb-2">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Essential Cookies:</strong> Required for website functionality (session management, security)</li>
              <li><strong>Advertising Cookies:</strong> Used by Google AdSense to show personalized ads (requires consent)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our website</li>
              <li><strong>Personalization Cookies:</strong> Remember your preferences and settings</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-green-400" />
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Provide, maintain, and improve our gaming services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Personalize your gaming experience and show relevant content</li>
              <li>Send you important updates, security alerts, and support messages</li>
              <li>Analyze usage patterns to improve our games and services</li>
              <li>Prevent fraud, abuse, and ensure platform security</li>
              <li>Comply with legal obligations and enforce our terms</li>
              <li>Show personalized advertisements (with your consent)</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-400" />
              Data Storage and Security
            </h2>
            <p className="text-gray-300 mb-4">
              We use industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Supabase:</strong> User accounts, game data, and preferences are stored securely in Supabase (encrypted at rest and in transit)</li>
              <li><strong>Stripe:</strong> Payment information is processed by Stripe (PCI-DSS compliant, we never store credit card details)</li>
              <li><strong>Encryption:</strong> All data transmitted between your device and our servers uses HTTPS/TLS encryption</li>
              <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
              <li><strong>Regular Audits:</strong> Regular security assessments and updates</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-purple-400" />
              Third-Party Services
            </h2>
            <p className="text-gray-300 mb-4">
              We use the following third-party services that may collect information:
            </p>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-white mb-2">Google AdSense</h3>
              <p className="text-gray-300 text-sm mb-2">
                We use Google AdSense to display advertisements. Google may use cookies and tracking technologies 
                to show personalized ads based on your interests. You can manage your ad preferences in the 
                consent banner or through Google's Ad Settings.
              </p>
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Google Privacy Policy →
              </a>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-white mb-2">Stripe</h3>
              <p className="text-gray-300 text-sm mb-2">
                We use Stripe to process payments securely. Stripe handles all payment information and is 
                PCI-DSS compliant. We only receive confirmation of successful payments.
              </p>
              <a 
                href="https://stripe.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Stripe Privacy Policy →
              </a>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-white mb-2">Supabase</h3>
              <p className="text-gray-300 text-sm mb-2">
                We use Supabase for user authentication and data storage. Supabase provides secure, 
                encrypted database services.
              </p>
              <a 
                href="https://supabase.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Supabase Privacy Policy →
              </a>
            </div>
          </section>

          {/* Your Rights (GDPR) */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-yellow-400" />
              Your Rights (GDPR & CCPA)
            </h2>
            <p className="text-gray-300 mb-4">
              If you are located in the European Economic Area (EEA), UK, Switzerland, or California, you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for cookie usage at any time</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of sale of personal information (California residents)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              To exercise these rights, please contact us at the email address below.
            </p>
          </section>

          {/* Cookie Management */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-orange-400" />
              Cookie Management
            </h2>
            <p className="text-gray-300 mb-4">
              You can manage your cookie preferences at any time:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Click the "Manage Options" button in the consent banner</li>
              <li>Use your browser settings to block or delete cookies</li>
              <li>Clear your browser's cookie cache</li>
            </ul>
            <p className="text-gray-300 mt-4">
              <strong>Note:</strong> Disabling certain cookies may affect website functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            <p className="text-gray-300">
              Our services are not directed to children under 13 (or 16 in the EEA). We do not knowingly collect 
              personal information from children. If you believe we have collected information from a child, please 
              contact us immediately and we will delete it.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
            <p className="text-gray-300 mb-4">
              We retain your personal data for as long as necessary to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>
            <p className="text-gray-300 mt-4">
              When you delete your account, we will delete or anonymize your personal data within 30 days, 
              except where we are required to retain it for legal purposes.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
            <p className="text-gray-300">
              Your data may be transferred to and processed in countries outside your country of residence. 
              We ensure appropriate safeguards are in place, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-2">
              <li>Standard Contractual Clauses (SCCs) for EEA data transfers</li>
              <li>Compliance with GDPR and other applicable privacy laws</li>
              <li>Encryption and security measures during transfer</li>
            </ul>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on this page and updating the "Last Updated" date. We encourage you to 
              review this policy periodically.
            </p>
          </section>

          {/* Contact Us */}
          <section className="bg-gray-700 rounded-lg p-6 border border-gray-600">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-yellow-400" />
              Contact Us
            </h2>
            <p className="text-gray-300 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p><strong>Email:</strong> privacy@spacerace.games</p>
              <p><strong>Subject Line:</strong> "Privacy Policy Inquiry"</p>
            </div>
            <p className="text-gray-300 mt-4 text-sm">
              We will respond to your inquiry within 30 days as required by GDPR.
            </p>
          </section>

          {/* Consent Banner Link */}
          <section className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-400/30">
            <h3 className="font-semibold text-white mb-2">Manage Your Cookie Preferences</h3>
            <p className="text-gray-300 text-sm mb-3">
              You can update your cookie preferences at any time by clicking the button below.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('gdpr_consent');
                window.location.reload();
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
            >
              Reset Cookie Preferences
            </button>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Space Adventure. All rights reserved.</p>
      </div>
      </div>
    </div>
  );
}

