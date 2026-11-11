import React from "react";
import { X } from "lucide-react";

const TermsAndConditionsModal = ({ open, onClose }) => {
  if (!open) return null; // don't render if not open

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-lg overflow-y-auto p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold text-[#264A3F] mb-4">
          Terms and Conditions
        </h1>

        <div className="space-y-5 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Introduction</h2>
            <p>
              By accessing and using our platform, you agree to these Terms and Conditions.
              Please read them carefully before continuing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. User Responsibilities</h2>
            <p>
              You agree not to misuse the services, upload harmful content, or violate
              any applicable laws while using this platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Data & Privacy</h2>
            <p>
              We respect your privacy and ensure your data is handled in compliance with
              our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Liability</h2>
            <p>
              We are not liable for any losses arising from misuse, system errors, or
              unauthorized access to your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Modifications</h2>
            <p>
              We may update these Terms occasionally. Continued use of the platform
              implies acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Contact</h2>
            <p>
              For questions, contact us at{" "}
              <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                wecare@gemrishi.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
