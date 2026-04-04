"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";

export default function ConsentsPage() {
  return (
    <div className="bg-background text-on-background selection:bg-primary/30 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Consent Manager
            </h1>
            <p className="text-on-surface-variant font-body max-w-xl text-lg">
              Manage Zero-Knowledge permissions granted to external
              decentralized applications without revealing sensitive personal
              data.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-primary">
                  security
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-secondary">
                  verified_user
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-tertiary">
                  lock
                </span>
              </div>
            </div>
            <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">
              Active Protections
            </span>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Stats */}
          <aside className="lg:col-span-3 flex flex-col gap-8">
            <div className="p-8 rounded-xl bg-surface-container-low border-none flex flex-col gap-2">
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">
                Active Consents
              </span>
              <span className="text-4xl font-headline font-bold text-primary">
                12
              </span>
            </div>
            <div className="p-8 rounded-xl bg-surface-container-low border-none flex flex-col gap-2">
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">
                Pending Requests
              </span>
              <span className="text-4xl font-headline font-bold text-secondary">
                04
              </span>
            </div>
            <div className="p-8 rounded-xl bg-surface-container-low border-none flex flex-col gap-2">
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">
                Security Score
              </span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-headline font-bold text-white tracking-tighter">
                  98<span className="text-xl text-on-surface-variant">/100</span>
                </span>
              </div>
            </div>
          </aside>

          {/* Main Consents List */}
          <section className="lg:col-span-9 space-y-6">
            {/* Active Consent Card 1 */}
            <div className="group relative bg-surface-container border-l-4 border-primary p-8 rounded-r-xl transition-all duration-300 hover:bg-surface-container-high shadow-[0_0_40px_rgba(139,92,246,0.05)]">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(186,158,255,0.2)] transition-all">
                    <span
                      className="material-symbols-outlined text-3xl text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      currency_exchange
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-bold text-white mb-1">
                      Crypto Exchange Access
                    </h3>
                    <div className="flex flex-wrap gap-3 items-center mb-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-label uppercase tracking-widest rounded font-bold">
                        ZK-Proof Verified
                      </span>
                      <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-label uppercase tracking-widest rounded font-bold">
                        Age &gt; 18
                      </span>
                      <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-label uppercase tracking-widest rounded font-bold">
                        Resident: EU
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant font-body">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-sm font-bold">
                          schedule
                        </span>
                        Expires: 30 Days
                      </div>
                      <div className="flex items-center gap-1.5 text-primary/80 font-bold">
                        <span className="material-symbols-outlined text-sm pulse-secure font-bold">
                          shield_lock
                        </span>
                        End-to-End Encrypted
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
                  <button className="w-full px-4 py-2 rounded-lg bg-surface-container-highest text-white text-sm font-medium hover:bg-surface-container border border-outline-variant/20 transition-all font-bold tracking-wide uppercase text-[10px]">
                    Extend
                  </button>
                  <button className="w-full px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all font-bold tracking-wide uppercase text-[10px]">
                    Revoke
                  </button>
                </div>
              </div>
            </div>

            {/* Active Consent Card 2 */}
            <div className="group relative bg-surface-container border-l-4 border-primary p-8 rounded-r-xl transition-all duration-300 hover:bg-surface-container-high shadow-[0_0_40px_rgba(139,92,246,0.05)]">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(186,158,255,0.2)] transition-all">
                    <span
                      className="material-symbols-outlined text-3xl text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      account_balance_wallet
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-bold text-white mb-1">
                      DeFi Lending Protocol
                    </h3>
                    <div className="flex flex-wrap gap-3 items-center mb-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-label uppercase tracking-widest rounded font-bold">
                        Collateral Proof
                      </span>
                      <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-label uppercase tracking-widest rounded font-bold">
                        Solvency Check
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant font-body">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-sm font-bold">
                          schedule
                        </span>
                        Expires: 12 Days
                      </div>
                      <div className="flex items-center gap-1.5 text-primary/80 font-bold">
                        <span className="material-symbols-outlined text-sm pulse-secure font-bold">
                          shield_lock
                        </span>
                        ZK-Asset Masking
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
                  <button className="w-full px-4 py-2 rounded-lg bg-surface-container-highest text-white text-sm font-medium hover:bg-surface-container border border-outline-variant/20 transition-all font-bold tracking-wide uppercase text-[10px]">
                    Extend
                  </button>
                  <button className="w-full px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all font-bold tracking-wide uppercase text-[10px]">
                    Revoke
                  </button>
                </div>
              </div>
            </div>

            {/* Inactive / Lower Priority Consent */}
            <div className="group relative bg-surface-container-low p-8 rounded-xl transition-all duration-300 hover:bg-surface-container border border-outline-variant/5 text-on-surface-variant">
              <div className="flex flex-col md:flex-row justify-between gap-6 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                      shopping_bag
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-bold text-white mb-1">
                      NFT Marketplace KYC
                    </h3>
                    <div className="flex flex-wrap gap-3 items-center mb-4">
                      <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-label uppercase tracking-widest rounded font-bold">
                        ID Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-body">
                      <div className="flex items-center gap-1.5 text-red-400/80 font-bold">
                        <span className="material-symbols-outlined text-sm font-bold">
                          warning
                        </span>
                        Expired 2 days ago
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
                  <button className="w-full px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all font-bold tracking-wide uppercase text-[10px]">
                    Re-verify
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Secondary Information Section */}
        <section className="mt-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent"></div>
            <h2 className="font-label uppercase tracking-[0.3em] text-on-surface-variant text-xs font-bold">
              Security Protocol Documentation
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-surface-container-low/50 backdrop-blur-md hover:bg-surface-container-low transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">
                  history
                </span>
              </div>
              <h4 className="text-white font-headline font-bold text-lg mb-3">
                Audit Logs
              </h4>
              <p className="text-on-surface-variant text-sm font-body leading-relaxed">
                Every consent action is recorded as a cryptographic hash on the
                ZK-Registry, ensuring immutable proof of permissioning.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-surface-container-low/50 backdrop-blur-md hover:bg-surface-container-low transition-colors">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-secondary">
                  visibility_off
                </span>
              </div>
              <h4 className="text-white font-headline font-bold text-lg mb-3">
                Zero Revelation
              </h4>
              <p className="text-on-surface-variant text-sm font-body leading-relaxed">
                Apps never see your actual data. They receive a mathematical
                proof that your data meets their specific requirements.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-surface-container-low/50 backdrop-blur-md hover:bg-surface-container-low transition-colors">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-tertiary">
                  timer
                </span>
              </div>
              <h4 className="text-white font-headline font-bold text-lg mb-3">
                Auto-Revocation
              </h4>
              <p className="text-on-surface-variant text-sm font-body leading-relaxed">
                Set smart expiration rules that automatically terminate
                third-party access once a specific task is completed.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Decoration */}
      <footer className="py-12 border-t border-outline-variant/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-headline font-bold text-on-surface-variant/40 tracking-widest text-sm uppercase">
            ZK LOCKER // SECURE CONSENT MODULE V4.0
          </div>
          <div className="flex gap-8">
            <a
              className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-bold"
              href="#"
            >
              Documentation
            </a>
            <a
              className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-bold"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-bold"
              href="#"
            >
              Github
            </a>
          </div>
        </div>
      </footer>

      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full"></div>
      </div>
      
      <style jsx>{`
        .pulse-secure {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
