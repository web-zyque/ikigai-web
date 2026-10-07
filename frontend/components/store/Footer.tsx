"use client"

import { useState } from "react"
import PrivacyPolicyModal from "./PrivacyPolicyModal"
import TermsConditionsModal from "./TermsConditionsModal"


import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "ABOUT US", href: "/about" },
  { label: "LOGIN", href: "/login" },
  { label: "ACCESSORIES", href: "/products" },
  { label: "CONTACT US", href: "/contact" },
];

const socials = [
  { name: "Instagram", icon: FaInstagram, href: "#" },
  { name: "Facebook", icon: FaFacebook, href: "#" },
  { name: "Twitter", icon: FaXTwitter, href: "#" },
  { name: "YouTube", icon: FaYoutube, href: "#" },
];




export default function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  return (
    <footer className="bg-black py-16 h-[15vh] text-white border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Image
            src="/images/logo.png"
            alt="IKIGAI"
            height={80}
            width={80}
            className="object-contain"
          />
        </Link>

        <nav className="flex flex-wrap justify-center gap-6 sm:gap-10 text-xs tracking-widest text-white/60">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-white uppercase">
              {l.label}
            </Link>
          ))}
        </nav>

        <ul className="flex gap-4">
          {socials.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.name}>
                <a
                  href={s.href}
                  aria-label={s.name}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/50 transition-colors hover:border-white hover:text-white hover:bg-white/5"
                >
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 mb-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs text-white/30">
          <span>
            © {new Date().getFullYear()} IKIGAI Accessories. All rights reserved.
          </span>

          <span>·</span>

          <span>See our</span>

          <button
            type="button"
            onClick={() => setPrivacyOpen(true)}
            className="text-white/50 underline underline-offset-2 transition-colors hover:text-white"
          >
            Privacy Policy
          </button>

          <span>and</span>

          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="text-white/50 underline underline-offset-2 transition-colors hover:text-white"
          >
            Terms & Conditions
          </button>
        </div>
        <PrivacyPolicyModal
          open={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
        />

        <TermsConditionsModal
          open={termsOpen}
          onClose={() => setTermsOpen(false)}
        />
      </div>
    </footer>
  );
}
