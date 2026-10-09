"use client"

import { useState } from "react"
import { ArrowUpRight, ChevronDown, MessageCircle } from "lucide-react"
import Link from "next/link"

const faqs = [
    {
        question: "How do I know if a product fits my car?",
        answer:
            "Check the product description and compatibility details before ordering. If you're unsure whether an accessory fits your vehicle, contact our team for assistance before purchasing.",
    },
    {
        question: "Do you sell accessories for all car brands?",
        answer:
            "Our collection includes automotive accessories across different categories. Compatibility varies by product, so check the specifications and supported vehicle models before ordering.",
    },
    {
        question: "Can I cancel or modify my order?",
        answer:
            "Contact our team as soon as possible if you need to change or cancel an order. Requests depend on the order's processing and shipping status and our cancellation policy.",
    },
    {
        question: "Can I return or exchange a product?",
        answer:
            "Returns and exchanges are subject to our return and refund policy. Please review the applicable conditions before submitting a return or exchange request.",
    },
    {
        question: "What should I do if my order arrives damaged or incorrect?",
        answer:
            "Contact our support team with your order details and clear photographs of the issue. We will review your request and explain the available next steps under our applicable policy.",
    },
    {
        question: "Do your accessories require professional installation?",
        answer:
            "Some accessories are easy to install, while others require specialist tools or technical knowledge. Check the product details and seek professional installation when necessary.",
    },
]

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (<section className="bg-black py-16 text-white sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <div className="order-1 flex flex-col items-start">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="h-1 w-6 rounded-full bg-[#640C0C]" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#640C0C] sm:text-xs">
                            Need Help?
                        </span>
                    </div>

                    <h2 className="max-w-md text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Frequently Asked
                        <span className="mt-1 block text-white/50">
                            Questions.
                        </span>
                    </h2>

                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
                        Everything you need to know before choosing the right
                        accessories for your vehicle.
                    </p>
                </div>
                <div className="order-2 space-y-3 lg:col-start-2 lg:row-span-2">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index

                        return (
                            <div
                                key={faq.question}
                                className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${isOpen
                                    ? "border-white/15 bg-[#0a0a0a]"
                                    : "border-white/5 bg-[#0a0a0a] hover:border-white/10"
                                    }`}
                            >
                                <button
                                    type="button"
                                    id={`faq-trigger-${index}`}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-panel-${index}`}
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left sm:px-5 sm:py-6"
                                >
                                    <span
                                        className={`text-sm font-medium leading-relaxed transition-colors sm:text-base ${isOpen ? "text-white" : "text-white/75"
                                            }`}
                                    >
                                        {faq.question}
                                    </span>

                                    <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen
                                            ? "rotate-180 border-[#640C0C]/50 bg-[#640C0C]/10 text-[#640C0C]"
                                            : "border-white/10 bg-[#121212] text-white/50"
                                            }`}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </span>
                                </button>

                                <div
                                    id={`faq-panel-${index}`}
                                    role="region"
                                    aria-labelledby={`faq-trigger-${index}`}
                                    hidden={!isOpen}
                                >
                                    <div className="px-4 pb-5 sm:px-5 sm:pb-6">
                                        <div className="mb-4 h-px w-full bg-white/5" />

                                        <p className="text-sm leading-7 text-white/50">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="order-3 self-start rounded-[20px] border border-white/10 bg-[#0a0a0a] p-5 sm:p-6 lg:col-start-1 lg:row-start-2">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#121212]">
                            <MessageCircle
                                className="h-5 w-5 text-[#640C0C]"
                                strokeWidth={1.7}
                            />
                        </div>

                        <h3 className="text-base font-semibold text-white">
                            Still have questions?
                        </h3>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-white/45">
                        Need help finding the right part? Get in touch with our
                        team for assistance.
                    </p>

                    <Link
                        href="/contact"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#640C0C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1010]"
                    >
                        Contact Us
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>

            </div>
        </div>
    </section>
    )
}