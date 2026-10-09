"use client"
import Link from "next/link"
import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react"

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak with our team",
    value: "+91 9876543210",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us your enquiry",
    value: "ikigaiautomotive@gmail.com",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Chat with our team",
    value: "+91 9876543210",
  },
]

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#640C0C]"

export default function ContactPageC() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-10 lg:px-12 lg:pb-20">

          <div className="mt-12 max-w-3xl sm:mt-16">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-[#640C0C]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#640C0C]">
                Contact Us
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Let&apos;s get you the
              <span className="block text-white/45">
                Right Answers.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
              Need help choosing an accessory, checking compatibility, or
              resolving an order issue? Send us a message and tell us what
              you need.
            </p>
          </div>
        </div>
      </section>

      <section className="hidden py-10 sm:block lg:block sm:py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">
          {contactMethods.map((method) => {
            const Icon = method.icon

            return (
              <div
                key={method.title}
                className="flex items-start gap-4 rounded-[20px] border border-white/10 bg-[#0a0a0a] p-5 transition-colors hover:border-white/15 sm:p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#121212]">
                  <Icon className="h-5 w-5 text-[#640C0C]" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-semibold">{method.title}</h2>

                  <p className="mt-1 text-sm text-white/40">
                    {method.description}
                  </p>

                  <p className="mt-3 break-words text-sm text-white/70">
                    {method.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-8 lg:px-12">
          <aside className="flex flex-col rounded-[20px] border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#640C0C]">
                Get in Touch
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                We&apos;re here to help.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/50">
                Whether you need product guidance or help with an existing
                order, we&apos;re ready to assist.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#640C0C]" />

                <div>
                  <h3 className="text-sm font-medium">Email Support</h3>
                  <p className="mt-1 text-sm text-white/40">
                    ikigaiautomotive@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#640C0C]" />

                <div>
                  <h3 className="text-sm font-medium">Phone Support</h3>
                  <p className="mt-1 text-sm text-white/40">
                    +91 9876543210
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#640C0C]" />

                <div>
                  <h3 className="text-sm font-medium">Business Hours</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/40">
                    Mon - Fri : 9:00 AM - 6:00 PM <br/>
                    Sat : 9:00 AM - 4:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#640C0C]" />

                <div>
                  <h3 className="text-sm font-medium">Store Location</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/40">
                    ikigai Customs car accessories,
                    <br />
                    Cheruvattor Road, East Paipra Road,
                    <br />
                    Muvattupuzha - Ernakulam - 686673
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm leading-relaxed text-white/45">
                Prefer to browse first? Explore our automotive accessories
                and find the right products for your vehicle.
              </p>

              <Link
                href="/products"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#b91c1c]"
              >
                Explore Products
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>

          <div className="rounded-[20px] border border-white/10 bg-[#0a0a0a] p-5 sm:p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-xl font-bold sm:text-2xl">
                Send us a message
              </h2>

              <p className="mt-2 text-sm text-white/45">
                Fill in the details below and tell us how we can help.
              </p>
            </div>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="c-name"
                    className="mb-2 block text-sm text-white/70"
                  >
                    Full Name *
                  </label>

                  <input
                    id="c-name"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="c-email"
                    className="mb-2 block text-sm text-white/70"
                  >
                    Email Address *
                  </label>

                  <input
                    id="c-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="c-phone"
                    className="mb-2 block text-sm text-white/70"
                  >
                    Phone Number
                  </label>

                  <input
                    id="c-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Your phone number"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="c-subject"
                    className="mb-2 block text-sm text-white/70"
                  >
                    Subject *
                  </label>

                  <select
                    id="c-subject"
                    name="subject"
                    required
                    defaultValue=""
                    className={`${inputClass} text-white/70`}
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>
                    <option value="product">Product Enquiry</option>
                    <option value="compatibility">Vehicle Compatibility</option>
                    <option value="order">Order Status</option>
                    <option value="returns">Returns & Refunds</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="c-order"
                  className="mb-2 block text-sm text-white/70"
                >
                  Order ID
                  <span className="ml-2 text-white/30">(Optional)</span>
                </label>

                <input
                  id="c-order"
                  name="orderId"
                  placeholder="e.g. IKG10245"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="c-message"
                  className="mb-2 block text-sm text-white/70"
                >
                  Your Message *
                </label>

                <textarea
                  id="c-message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell us how we can help..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#640C0C] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#7a1010] sm:w-auto"
              >
                Send Message
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}