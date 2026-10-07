"use client"

import PolicyModal from "./PolicyModal"

interface TermsConditionsModalProps {
  open: boolean
  onClose: () => void
}

export default function TermsConditionsModal({
  open,
  onClose,
}: TermsConditionsModalProps) {
  return (
    <PolicyModal
      open={open}
      onClose={onClose}
      title="Terms & Conditions"
      description="The terms that apply when you access and use the Ikigai Car Accessories website."
      lastUpdated="October 2026"
    >
      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          1. Acceptance of Terms
        </h3>

        <p>
          By accessing or using the Ikigai Car Accessories website, you agree
          to follow these Terms & Conditions. If you do not agree with these
          terms, please do not use the website.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          2. Use of the Website
        </h3>

        <p>
          You agree to use the website only for lawful purposes and in a way
          that does not interfere with its operation, security, or availability
          for other users.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          3. Products and Product Information
        </h3>

        <p>
          We aim to keep product names, descriptions, images, specifications,
          availability, and pricing accurate. Product images are provided for
          representation and actual appearance may vary slightly.
        </p>

        <p className="mt-3">
          Product compatibility should be verified before purchase where
          vehicle-specific fitment is required.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          4. Prices and Availability
        </h3>

        <p>
          Product prices and availability may change without prior notice.
          Displayed prices are subject to applicable taxes, delivery charges,
          discounts, and other charges shown during checkout.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          5. Orders
        </h3>

        <p>
          Placing an order constitutes a request to purchase the selected
          products. An order may be cancelled or declined where there is an
          inventory issue, pricing error, payment issue, suspected fraud, or
          another legitimate reason.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          6. Payments
        </h3>

        <p>
          Payments are processed through the payment methods made available
          during checkout. You agree to provide accurate information required
          to complete your purchase.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          7. Shipping and Delivery
        </h3>

        <p>
          Delivery estimates are provided for guidance and may vary depending
          on location, product availability, courier operations, weather,
          public holidays, or other circumstances outside our control.
        </p>

        <p className="mt-3">
          Additional terms relating to shipping are provided in our Shipping
          Policy.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          8. Returns, Refunds, and Cancellations
        </h3>

        <p>
          Returns, refunds, replacements, and order cancellations are governed
          by the applicable policies published by Ikigai Car Accessories.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          9. Vehicle Compatibility and Installation
        </h3>

        <p>
          Customers are responsible for confirming that a product is suitable
          for their vehicle where compatibility information is provided.
          Products that require technical installation should be installed by
          a suitably qualified professional.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          10. Intellectual Property
        </h3>

        <p>
          Website content, branding, logos, graphics, images, text, and other
          materials belong to Ikigai Car Accessories or their respective
          rights holders. They must not be copied, reproduced, modified, or
          distributed without appropriate permission.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          11. Prohibited Activities
        </h3>

        <p>Users must not:</p>

        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Use the website for unlawful activities.</li>
          <li>Attempt to gain unauthorised access to systems or accounts.</li>
          <li>Interfere with website security or functionality.</li>
          <li>Submit fraudulent or misleading information.</li>
          <li>Use automated methods to abuse or overload the website.</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          12. Limitation of Liability
        </h3>

        <p>
          To the extent permitted by applicable law, Ikigai Car Accessories
          will not be responsible for losses arising from circumstances beyond
          its reasonable control or from misuse of products or services by the
          customer.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          13. Changes to These Terms
        </h3>

        <p>
          We may update these Terms & Conditions when our services, business
          practices, or legal requirements change. Updated terms will be
          published on the website.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-white">
          14. Contact
        </h3>

        <p>
          If you have questions about these Terms & Conditions, contact Ikigai
          Car Accessories through the contact information provided on our
          website.
        </p>
      </section>
    </PolicyModal>
  )
}