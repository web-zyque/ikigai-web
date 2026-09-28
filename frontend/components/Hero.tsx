import Image from "next/image";
import Link from "next/link";
import { FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Project", href: "/project" },
  { label: "About us", href: "/about" },
  { label: "Contact us", href: "/contact" },
];


  const socials = [
    { name: 'Instagram', icon: FaInstagram, href: '' },
    { name: 'Twitter', icon: FaXTwitter, href: '' },
    { name: 'LinkedIn', icon: FaLinkedin, href: '' },
    { name: 'Facebook', icon: FaFacebook, href: '' },
  ];


export default function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-black text-white">

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-orange-400">✦</span>
          CAR
        </Link>

        <nav className="hidden gap-10 text-xs text-white/80 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="transition-colors hover:text-white"
            >
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

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-10 lg:min-h-[calc(100vh-88px)] lg:grid-cols-2 lg:items-center lg:px-12">

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

          <Link
            href="/feel"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#b52838] px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            Open Feel
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

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

        <div className="relative h-[320px] sm:h-[420px] lg:h-[560px]">

          <div className="absolute inset-0 -z-10 rounded-full bg-white/5 blur-3xl" />
          <Image
            src="/images/car2.png"
            alt="Black classic sports car"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain object-center lg:scale-125 lg:object-right"
          />
        </div>
      </div>
    </section>
  );
}