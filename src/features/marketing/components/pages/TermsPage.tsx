"use client";

import React from "react";
import { appConfig } from "@/config/app";

const TermsPage = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-muted-foreground mb-6">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to {appConfig.name} ("Company", "we", "our", "us")! These Terms of Service
          ("Terms", "Terms of Service") govern your use of our website and services operated by{" "}
          {appConfig.name}.
        </p>
        <p className="mb-4">
          By accessing or using the Service, you agree to be bound by these Terms. If you disagree
          with any part of the terms, then you may not access the Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Accounts</h2>
        <p className="mb-4">
          When you create an account with us, you must provide information that is accurate,
          complete, and current at all times. Failure to do so constitutes a breach of the Terms,
          which may result in immediate termination of your account on our Service.
        </p>
        <p className="mb-4">
          You are responsible for safeguarding the password that you use to access the Service and
          for any activities or actions under your password.
        </p>
        <p className="mb-4">
          You agree not to disclose your password to any third party. You must notify us immediately
          upon becoming aware of any breach of security or unauthorized use of your account.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. Intellectual Property</h2>
        <p className="mb-4">
          The Service and its original content, features, and functionality are and will remain the
          exclusive property of {appConfig.name} and its licensors. The Service is protected by
          copyright, trademark, and other laws of both the United States and foreign countries.
        </p>
        <p className="mb-4">
          Our trademarks and trade dress may not be used in connection with any product or service
          without the prior written consent of {appConfig.name}.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. User Content</h2>
        <p className="mb-4">
          Our Service allows you to post, link, store, share and otherwise make available certain
          information, text, graphics, videos, or other material. You are responsible for the
          content that you post on or through the Service, including its legality, reliability, and
          appropriateness.
        </p>
        <p className="mb-4">
          By posting content on or through the Service, you represent and warrant that: (i) the
          content is yours (you own it) or you have the right to use it and grant us the rights and
          license as provided in these Terms, and (ii) the posting of your content on or through the
          Service does not violate the privacy rights, publicity rights, copyrights, contract rights
          or any other rights of any person.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your account immediately, without prior notice or liability,
          for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
        <p className="mb-4">
          Upon termination, your right to use the Service will immediately cease. If you wish to
          terminate your account, you may simply discontinue using the Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
        <p className="mb-4">
          In no event shall {appConfig.name}, nor its directors, employees, partners, agents,
          suppliers, or affiliates, be liable for any indirect, incidental, special, consequential
          or punitive damages, including without limitation, loss of profits, data, use, goodwill,
          or other intangible losses, resulting from (i) your access to or use of or inability to
          access or use the Service; (ii) any conduct or content of any third party on the Service;
          (iii) any content obtained from the Service; and (iv) unauthorized access, use or
          alteration of your transmissions or content, whether based on warranty, contract, tort
          (including negligence) or any other legal theory, whether or not we have been informed of
          the possibility of such damage.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Changes</h2>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any
          time. If a revision is material, we will try to provide at least 30 days' notice prior to
          any new terms taking effect. What constitutes a material change will be determined at our
          sole discretion.
        </p>
        <p className="mb-4">
          By continuing to access or use our Service after those revisions become effective, you
          agree to be bound by the revised terms. If you do not agree to the new terms, please stop
          using the Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at{" "}
          <a href={`mailto:${appConfig.supportEmail}`} className="text-primary hover:underline">
            {appConfig.supportEmail}
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
