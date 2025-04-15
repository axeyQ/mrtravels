"use client";
import { motion } from 'framer-motion';

export default function PrivacyPage() {
return (
<div className="container mx-auto px-4 py-8">
<motion.div
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
className="mb-8"
>
<h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
<p className="mt-2 text-gray-600">
Last updated: April 1, 2025
</p>
</motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-lg shadow-md p-6 md:p-8"
  >
    <div className="prose prose-primary max-w-none">
      <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
      <p>
        Welcome to ZipBikes By <b>M.R Travels and Rental Services</b>. This Privacy Policy describes how we collect, use, 
        protect, and share your personal information when you use our bike rental 
        platform, including our website and mobile application.
      </p>
      <p>
        By using our services, you agree to the terms of this Privacy Policy. 
        Please read it carefully to understand our practices regarding your personal data.
      </p>

      <h2 className="text-xl font-bold mb-4 mt-6">2. Information We Collect</h2>
      <p>We collect various types of information to provide and improve our services:</p>
      <ul className="ml-4">
        <li>
          <strong>a. Personal Information:</strong> Name, contact details, driver&apos;s 
          license number, identification documents, profile picture
        </li>
        <li>
          <strong>b. Contact Information:</strong> Phone number
        </li>
        <li>
          <strong>c. Device Information:</strong> IP address, device type, browser type
        </li>
        <li>
          <strong>d. Usage Information:</strong> Booking history, interactions with our platform
        </li>
      </ul>

      <h2 className="text-xl font-bold mb-4 mt-6">3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul className="ml-4">
        <li>a. Process and manage bike rentals</li>
        <li>b. Verify your identity and eligibility to rent vehicles</li>
        <li>c. Communicate with you about bookings and services</li>
        <li>d. Improve our platform and customer experience</li>
        <li>e. Comply with legal and regulatory requirements</li>
        <li>f. Prevent fraud and ensure platform safety</li>
      </ul>

      <h2 className="text-xl font-bold mb-4 mt-6">4. Information Sharing</h2>
      <p>We may share your information with:</p>
      <ul className="ml-4">
        <li>a. Service providers and business partners</li>
        <li>b. Law enforcement agencies when required by law</li>
        <li>c. Payment processors for transaction handling</li>
      </ul>
      <p>
        We do not sell your personal information to third parties. 
        Any sharing is done with your consent or as necessary to provide our services.
      </p>

      <h2 className="text-xl font-bold mb-4 mt-6">5. Data Protection</h2>
      <p>We implement appropriate technical and organizational measures to protect your data:</p>
      <ul className="ml-4">
        <li>a. Encryption of sensitive information</li>
        <li>b. Secure storage systems</li>
        <li>c. Access controls and authentication measures</li>
        <li>d. Regular security audits and updates</li>
      </ul>

      <h2 className="text-xl font-bold mb-4 mt-6">6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul className="ml-4">
        <li>a. Access your personal information</li>
        <li>b. Request correction of inaccurate data</li>
        <li>c. Request deletion of your account and data</li>
        <li>d. Opt-out of marketing communications</li>
        <li>e. Restrict or object to data processing</li>
      </ul>

      <h2 className="text-xl font-bold mb-4 mt-6">7. Cookies and Tracking</h2>
      <p>
        We use cookies and similar tracking technologies to enhance your 
        experience, analyze usage, and provide personalized content. 
        You can manage cookie preferences through your browser settings.
      </p>

      <h2 className="text-xl font-bold mb-4 mt-6">8. Children&apos;s Privacy</h2>
      <p>
        Our services are not intended for children under 18. We do not 
        knowingly collect personal information from minors. If we become 
        aware of such collection, we will take steps to remove that information.
      </p>

      <h2 className="text-xl font-bold mb-4 mt-6">9. International Transfers</h2>
      <p>
        Your data may be transferred and processed in countries outside 
        your home country. We ensure appropriate safeguards are in place 
        to protect your information during such transfers.
      </p>

      <h2 className="text-xl font-bold mb-4 mt-6">10. Changes to Privacy Policy</h2>
      <p>
        We may update this Privacy Policy periodically. We will notify 
        you of any significant changes via email or through our platform. 
        Continued use of our services after changes constitutes acceptance 
        of the updated policy.
      </p>

      <h2 className="text-xl font-bold mb-4 mt-6">11. Contact Information</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy, please contact us at:
      </p>
      <p>
        <strong>ZipBikes</strong><br />
        WARD NO 3, NEAR IISER COLLEGE, BOURI, HUZUR,<br />
        SHOP NO 2, 462030, Bhopal,<br />
        Madhya Pradesh, PIN: 462030,<br />
        India<br />
        Email: mrtravels1817@gmail.com<br />
        Phone: +91 7909611817
      </p>
    </div>
  </motion.div>
</div>
);
}

