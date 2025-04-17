"use client";

import React from "react";
import { appConfig } from "@/config/app";

const PrivacyPage = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p className="mb-4">
          {appConfig.name} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
        </p>
        <p className="mb-4">
          Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the site or use our services.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <p className="mb-4">
          We collect information that you provide directly to us when you:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Register for an account</li>
          <li>Use our services</li>
          <li>Subscribe to our newsletter</li>
          <li>Request customer support</li>
          <li>Communicate with us in any way</li>
        </ul>
        <p className="mb-4">
          The types of information we may collect include:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Personal identifiers (name, email address, phone number)</li>
          <li>Account credentials</li>
          <li>Company information</li>
          <li>Payment information</li>
          <li>Design files and related content</li>
          <li>Usage data and analytics</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <p className="mb-4">
          We may use the information we collect for various purposes, including to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send administrative information, such as updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Personalize your experience and deliver content relevant to your interests</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
        <p className="mb-4">
          We may share your information in the following situations:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us.</li>
          <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
          <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent.</li>
          <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p className="mb-4">
          We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Data Protection Rights</h2>
        <p className="mb-4">
          Depending on your location, you may have the following rights:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>The right to access personal data we hold about you</li>
          <li>The right to request correction of your personal data</li>
          <li>The right to request deletion of your personal data</li>
          <li>The right to withdraw consent</li>
          <li>The right to request restriction of processing of your personal data</li>
          <li>The right to data portability</li>
          <li>The right to object to processing of your personal data</li>
        </ul>
        <p className="mb-4">
          To exercise any of these rights, please contact us at <a href={`mailto:${appConfig.supportEmail}`} className="text-primary hover:underline">{appConfig.supportEmail}</a>.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Cookies and Tracking Technologies</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
        <p className="mb-4">
          Our service is not directed to anyone under the age of 18. We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>
        <p className="mb-4">
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at <a href={`mailto:${appConfig.supportEmail}`} className="text-primary hover:underline">{appConfig.supportEmail}</a>.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
