import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/40 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.08)] transition-all duration-300">
      <div className="flex justify-between items-center w-full px-8 h-20 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="font-headline text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
            ZK Locker
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className={`${
                pathname === "/dashboard" 
                  ? "text-primary border-b-2 border-primary-dim shadow-[0_4px_12px_rgba(192,132,252,0.3)]" 
                  : "text-slate-400 hover:text-slate-100"
              } font-bold pb-1 transition-all font-body text-sm`}
            >
              Home
            </Link>
            <Link
              href="/documents"
              className={`${
                pathname === "/documents" 
                  ? "text-primary border-b-2 border-primary-dim shadow-[0_4px_12px_rgba(192,132,252,0.3)]" 
                  : "text-slate-400 hover:text-slate-100"
              } font-bold pb-1 transition-all font-body text-sm`}
            >
              Documents
            </Link>
            <Link
              href="/proofs"
              className={`${
                pathname === "/proofs" 
                  ? "text-primary border-b-2 border-primary-dim shadow-[0_4px_12px_rgba(192,132,252,0.3)]" 
                  : "text-slate-400 hover:text-slate-100"
              } font-bold pb-1 transition-all font-body text-sm`}
            >
              Proofs
            </Link>
            <Link
              href="/consents"
              className={`${
                pathname === "/consents" 
                  ? "text-primary border-b-2 border-primary-dim shadow-[0_4px_12px_rgba(192,132,252,0.3)]" 
                  : "text-slate-400 hover:text-slate-100"
              } font-bold pb-1 transition-all font-body text-sm`}
            >
              Consents
            </Link>
            <Link
              href="#"
              className="text-slate-400 font-medium hover:text-slate-100 transition-all font-body text-sm"
            >
              Apps
            </Link>
            <Link
              href="/activity"
              className={`${
                pathname === "/activity" 
                  ? "text-primary border-b-2 border-primary-dim shadow-[0_4px_12px_rgba(192,132,252,0.3)]" 
                  : "text-slate-400 hover:text-slate-100"
              } font-bold pb-1 transition-all font-body text-sm`}
            >
              Activity
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
              search
            </span>
            <input
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary w-64 transition-all"
              placeholder="Search vault..."
              type="text"
            />
          </div>
          {/* Notification Bell */}
          <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-slate-950"></span>
          </button>
          <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-dim to-secondary-dim text-white font-body text-sm font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300">
            Connect Wallet
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20 group cursor-pointer">
            <img
              alt="User cryptographic identity avatar"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_j5v5OEZXEunttNz67pswwb5HkAjyeQ_XiZiHxLlTDoIXNfEjIiEVaWWsAZ03hjiFPzP1ULFhXKnluPcEnakLBR1mHdbddG0GVfKZWBoa6MkK7eYoiEEm2u2PBfpjOkaCkzSCywpYnVi-mYZYa1mwE9vu1pWymVanTIqaQIp8J_gl2d36pl0xHPNYRhKUA1DZ9UcFme7U1T9UK09xfuftj0keeoz2PDNv7f23x77I1LMTCVKreHKLJ6fivnHL_CDaJy5AiufgyHE"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
