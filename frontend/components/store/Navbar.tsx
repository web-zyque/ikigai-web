import Image from "next/image";
import Link from "next/link";
import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About us", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

const socials = [
  { name: "Instagram", icon: FaInstagram, href: "" },
  { name: "Twitter", icon: FaXTwitter, href: "" },
  { name: "LinkedIn", icon: FaLinkedin, href: "" },
  { name: "Facebook", icon: FaFacebook, href: "" },
];

export default function Navbar() {
  return (
    <header className="w-full border-b border-white/5 bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Image src="/images/logo.png" alt="IKIGAI" height={32} width={32} />
          IKIGAI
        </Link>

        <nav className="hidden gap-10 text-xs text-white/80 md:flex">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/login"
            className="rounded-full border border-white/25 px-5 py-2 transition-colors hover:bg-white/10 text-white"
          >
            Login
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-full bg-[#e9dede] px-5 py-2 font-medium text-black transition-colors hover:bg-white sm:block"
          >
            Contact us
          </Link>
        </div>
      </div>
    </header>
  );
}
