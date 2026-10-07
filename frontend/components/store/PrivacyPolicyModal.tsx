"use client"

import PolicyModal from "./PolicyModal"

interface PrivacyPolicyModalProps {
  open: boolean
  onClose: () => void
}

export default function PrivacyPolicyModal({
  open,
  onClose,
}: PrivacyPolicyModalProps) {
  return (
    <PolicyModal
      open={open}
      onClose={onClose}
      title="Privacy Policy"
      description="How Ikigai Car Accessories collects, uses, stores, and protects your information."
      lastUpdated="October 2026"
    >
      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          1. Introduction
        </h3>

        <p>
          Ikigai Car Accessories respects your privacy and is committed to
          protecting the personal information you provide when using our
          website, creating an account, purchasing products, or contacting us.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          2. Information We Collect
        </h3>

        <p>
          Depending on how you use our website, we may collect information
          such as your name, mobile number, email address, billing and shipping
          address, order information, account information, and information you
          provide when contacting customer support.
        </p>

        <p className="mt-3">
          Payment information may be processed by our authorised payment
          service providers. We do not intend to store complete card or
          payment credentials on our own systems unless specifically stated.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          3. How We Use Your Information
        </h3>

        <p>We may use your information to:</p>

        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Process and fulfil your orders.</li>
          <li>Provide delivery and order updates.</li>
          <li>Manage your customer account.</li>
          <li>Respond to support requests.</li>
          <li>Process returns, refunds, and cancellations.</li>
          <li>Improve our website and services.</li>
          <li>Detect fraud, abuse, and security issues.</li>
          <li>Meet applicable legal and regulatory requirements.</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          4. Cookies and Similar Technologies
        </h3>

        <p>
          We may use cookies and similar technologies to maintain sessions,
          remember preferences, understand website usage, and improve the
          customer experience.
        </p>

        <p className="mt-3">
          Where required, additional consent or controls will be provided for
          non-essential cookies and similar technologies.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          5. Sharing of Information
        </h3>

        <p>
          We may share necessary information with trusted service providers
          that help us operate the website and fulfil your orders. This can
          include payment processors, delivery partners, hosting providers,
          analytics providers, and customer-support services.
        </p>

        <p className="mt-3">
          We do not sell your personal information as a commercial product.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          6. Data Security
        </h3>

        <p>
          We use reasonable technical and organisational measures to protect
          personal information against unauthorised access, misuse, loss, or
          disclosure. No online system can guarantee absolute security.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          7. Data Retention
        </h3>

        <p>
          We retain information for as long as necessary to provide our
          services, complete transactions, maintain business records, resolve
          disputes, prevent fraud, and comply with applicable legal
          requirements.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          8. Your Privacy Choices
        </h3>

        <p>
          Depending on applicable law, you may have rights relating to access,
          correction, updating, withdrawal of consent, or deletion of your
          personal information.
        </p>

        <p className="mt-3">
          Requests can be made through our official customer support or privacy
          contact details.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          9. Third-Party Services
        </h3>

        <p>
          Our website may contain integrations or links to third-party
          services. Their handling of information is governed by their own
          privacy policies and terms.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          10. Changes to This Policy
        </h3>

        <p>
          We may update this Privacy Policy when our services, technology,
          business practices, or legal requirements change. The updated
          version will be published through the website.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          11. Contact
        </h3>

        <p>
          For privacy-related questions or requests, contact Ikigai Car
          Accessories through the contact information provided on our website.
        </p>
      </section>
    </PolicyModal>
  )
}