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

export default function Hero() {
  return (
    <section className="relative isolate h-screen overflow-hidden bg-black text-white">

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
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
            className="rounded-full border border-white/25 px-5 py-2 transition-colors hover:bg-white/10"
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
      </header>

      <div className="relative mx-auto grid h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-12">

        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Find your{" "}
            <span className="bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
              Perfect
            </span>
            <br />
            Ride Today!
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
            Through innovative design and strategic thinking, we create brands
            that spark connections, inspire loyalty and elevate your message
          </p>

          <div className="mt-8 flex w-full max-w-[300px] items-center overflow-hidden rounded-full bg-white/10 pl-4 pr-1 py-1 backdrop-blur-md border border-white/20 transition-colors focus-within:border-white/40 focus-within:bg-white/15">
            <input
              type="text"
              placeholder="Search accessories, parts..."
              className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-white/50 outline-none"
            />
            <button
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#640C0C] text-white transition-opacity hover:opacity-90"
              aria-label="Search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <ul className="mt-20 hidden gap-4 lg:flex">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.name}>
                  <a
                    href={s.href || "#"}
                    aria-label={s.name}
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/30 text-white/70 transition-colors hover:border-white hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative h-[400px] sm:h-[500px] lg:h-[650px]">
          <div className="absolute inset-0 -z-10 rounded-full bg-white/5 blur-3xl" />
          <Image
            src="/images/car3.png"
            alt="Black classic sports car"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain object-center scale-110 lg:scale-150 lg:object-right"
          />
        </div>
      </div>
    </section>
  );
}