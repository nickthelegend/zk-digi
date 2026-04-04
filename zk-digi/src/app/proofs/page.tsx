"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";

export default function ProofsPage() {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-[1400px] mx-auto min-h-screen">
        {/* Hero Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="font-label uppercase tracking-widest text-[10px] text-primary font-bold">
              Cryptographic Verification
            </span>
            <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter text-on-surface">
              Zero Knowledge <span className="text-primary-dim">Proofs</span>
            </h1>
            <p className="text-on-surface-variant max-w-xl text-lg font-light leading-relaxed">
              Verify attributes and identities without revealing underlying
              data. Secure, private, and mathematically immutable proofs for the
              decentralized web.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 glass-panel-simple px-4 py-2 rounded-full border border-outline-variant/10">
              <span className="w-2 h-2 rounded-full bg-green-400 secure-pulse"></span>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                System Status: Shielded
              </span>
            </div>
          </div>
        </header>

        {/* Bento Grid for Proofs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Proof Card 1: Age (Large Focus) */}
          <div className="md:col-span-8 bg-surface-container-low rounded-3xl p-8 relative overflow-hidden group hover:shadow-[0_0_40px_rgba(139,92,246,0.1)] transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span
                      className="material-symbols-outlined text-primary text-3xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified_user
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl font-bold">
                      Age &gt; 18
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      <span className="text-xs text-green-400 font-medium">
                        Active Proof
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-highest px-4 py-1.5 rounded-full border border-outline-variant/20">
                  <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">
                    snark-zk-p
                  </span>
                </div>
              </div>
              <div className="my-12">
                <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4 font-bold">
                  Verification Hash
                </div>
                <code className="block glass-card p-4 rounded-xl text-primary-dim text-sm break-all font-mono border border-outline-variant/10">
                  0x7a2e...f89c21b04557d0e922c10b1a644237f3001
                </code>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-dim to-secondary-dim text-white font-headline font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-sm font-bold">
                    share
                  </span>
                  Share
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full glass-card border border-outline-variant/30 hover:border-primary/50 transition-all font-headline font-bold text-sm">
                  <span className="material-symbols-outlined text-sm font-bold">
                    refresh
                  </span>
                  Regenerate
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full glass-card border border-outline-variant/30 hover:border-red-500/50 transition-all font-headline font-bold text-sm text-red-400/80">
                  <span className="material-symbols-outlined text-sm font-bold">
                    cancel
                  </span>
                  Revoke
                </button>
              </div>
            </div>
          </div>

          {/* Stats/Status Area */}
          <div className="md:col-span-4 grid grid-rows-2 gap-6">
            <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 flex flex-col justify-center items-center text-center hover:bg-surface-container-high transition-colors">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 font-bold">
                Network Latency
              </span>
              <div className="text-4xl font-headline font-bold text-on-surface">
                14ms
              </div>
              <div className="mt-4 w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[85%] secure-pulse"></div>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10 flex flex-col justify-center items-center text-center hover:bg-surface-container-high transition-colors">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 font-bold">
                Total Verifications
              </span>
              <div className="text-4xl font-headline font-bold text-on-surface">
                1,248
              </div>
              <span className="text-xs text-primary mt-2 font-bold">
                +12 this month
              </span>
            </div>
          </div>

          {/* Proof Card 2: Indian Citizen */}
          <div className="md:col-span-6 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 group hover:bg-surface-container-high transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                  <span className="material-symbols-outlined text-secondary text-2xl font-bold">
                    public
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">
                    Indian Citizen
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    <span className="text-xs text-green-400 font-medium">
                      Active Proof
                    </span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                more_vert
              </span>
            </div>
            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
              Cryptographically valid proof of citizenship without exposing
              Aadhaar or Passport identifiers. Last refreshed 2 days ago.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs text-on-surface-variant">
                    account_balance
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs text-on-surface-variant">
                    flight
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg glass-card hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">share</span>
                </button>
                <button className="px-4 py-2 rounded-lg bg-surface-container-highest text-xs font-bold font-headline uppercase tracking-wider hover:bg-outline-variant/30 transition-all text-on-surface">
                  Details
                </button>
              </div>
            </div>
          </div>

          {/* Proof Card 3: Student Verification (Expired) */}
          <div className="md:col-span-6 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 opacity-70 hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <span className="material-symbols-outlined text-red-400 text-2xl font-bold">
                    school
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">
                    Student Verification
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="text-xs text-red-500 font-medium">
                      Expired
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
              Your institutional enrollment status proof has expired. Renew your
              status to access student-specific Web3 benefits.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-label text-red-400/60 uppercase tracking-widest font-bold">
                Expired 14 days ago
              </span>
              <button className="px-6 py-2 rounded-full border border-red-500/30 text-red-400 font-headline font-bold text-sm hover:bg-red-500 hover:text-white transition-all">
                Renew Now
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Content: Information Bento */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-3xl p-10 relative overflow-hidden">
            <div className="relative z-10 font-bold">
              <h2 className="font-headline text-3xl font-bold mb-4">
                How ZK Proofs Protect You
              </h2>
              <p className="text-on-surface-variant leading-relaxed max-w-lg mb-8 font-normal">
                Traditional verification requires sharing sensitive documents.
                With ZK Locker, you generate a mathematical certificate that
                says "True" or "False" without ever showing the data itself.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-primary font-bold text-xl mb-1">0%</div>
                  <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">
                    Data Exposure
                  </div>
                </div>
                <div>
                  <div className="text-secondary font-bold text-xl mb-1">
                    100%
                  </div>
                  <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">
                    User Control
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 pointer-events-none">
              <img
                alt="Visual representation of ZK proof computation"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDdx9oiN_fxQMFWoHH4SC3h33C8s5cnA8AxpJQ9eJiCE4nnUdt6YR3M9vWRO9J2FGYvqQULeK80-Fg4k2CDGZyVdGJiiuRGdtilVw77PrR_pubIvMazUbMz60JizEqatPJJ86YQHp-hDX3aGMq73kCt08cRL3X5oA3MlODPAVc6IlIv8n_8f8jScWDsbcmYGGkVF79drY4mwFpi2WaW9sByxuKNnuXQ43eRzNatT-VCfh5TjiYx0A4_J4vwxxLsJHjiyX9ircRGto"
              />
            </div>
          </div>
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 flex flex-col justify-between">
            <h3 className="font-headline text-xl font-bold">Recent Requests</h3>
            <div className="space-y-6 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-highest"></div>
                  <span className="text-sm font-medium">Uniswap V4</span>
                </div>
                <span className="text-[10px] text-green-400 font-bold tracking-widest">
                  VERIFIED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-highest"></div>
                  <span className="text-sm font-medium">Gitcoin Passport</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-bold tracking-widest">
                  PENDING
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-highest"></div>
                  <span className="text-sm font-medium">Lens Protocol</span>
                </div>
                <span className="text-[10px] text-green-400 font-bold tracking-widest">
                  VERIFIED
                </span>
              </div>
            </div>
            <button className="mt-8 text-primary font-headline text-sm font-bold uppercase tracking-widest text-center hover:underline transition-all">
              View All Activity
            </button>
          </div>
        </section>
      </main>

      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-secondary/5 blur-[150px] rounded-full"></div>
      </div>

      <style jsx>{`
        .glass-panel-simple {
          background: rgba(31, 31, 40, 0.4);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
