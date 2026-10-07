"use client";

import Image from "next/image";
import Link from "next/link";
import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { AuthButton } from "./AuthButton";
import { useCart } from "@/context/CartContext";
import { useMe } from "@/hooks/auth";

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

function CartIcon() {
  const { cartItems } = useCart();
  const { data: user, isLoading, error } = useMe();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (isLoading || error || !user) {
    return null;
  }

  return (
    <Link href="/cart" className="relative group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
      <img src="/shopping-bag.svg" alt="cart" className="h-4 w-4 brightness-0 invert opacity-90 transition-opacity" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#640C0C] text-[9px] font-bold text-white shadow-sm shadow-black">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

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

        <div className="flex items-center gap-4 text-xs">
          <CartIcon />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
