import Link from "next/link";

const links = [
  { label: "Shop", href: "/shop" },
  { label: "Cart", href: "/cart" },
  { label: "My Orders", href: "/profile" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <img src="/mainLogo.svg" alt="Betopia Daily" className="h-8 w-auto brightness-0 invert" />
          <p className="text-xs text-slate-400">
            Internal shop for Betopia Group employees · Cash on Delivery
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-[#FA8B24] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Betopia Daily. All rights reserved.
      </div>
    </footer>
  );
}
