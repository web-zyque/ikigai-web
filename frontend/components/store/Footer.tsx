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

        <div className="mt-4 text-center text-xs text-white/30">
          © {new Date().getFullYear()} IKIGAI Accessories. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
