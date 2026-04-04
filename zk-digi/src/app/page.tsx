"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface overflow-x-hidden selection:bg-primary/30 selection:text-primary min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl tonal-transition bg-gradient-to-b from-[#0e0e15] to-transparent">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-white font-headline uppercase tracking-widest">
            ZK LOCKER
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a
              className="font-headline font-bold uppercase tracking-widest text-sm text-[#ba9eff] border-b-2 border-[#ba9eff] pb-1"
              href="#"
            >
              Security
            </a>
            <a
              className="font-headline font-bold uppercase tracking-widest text-sm text-slate-400 hover:text-white transition-colors"
              href="#"
            >
              Protocol
            </a>
            <a
              className="font-headline font-bold uppercase tracking-widest text-sm text-slate-400 hover:text-white transition-colors"
              href="#"
            >
              Governance
            </a>
            <a
              className="font-headline font-bold uppercase tracking-widest text-sm text-slate-400 hover:text-white transition-colors"
              href="#"
            >
              Docs
            </a>
          </div>
          <Link
            href="/dashboard"
            className="gradient-btn px-6 py-2.5 rounded-full font-headline font-bold text-sm uppercase tracking-widest text-on-primary bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_30px_rgba(186,158,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 shadow-xl"
          >
            Launch App
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section 1: The Vision */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                  V1.0 Monolithic Mainnet Live
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold tracking-tighter leading-[0.9] text-white mb-8">
                Your Identity,
                <br />
                <span className="bg-gradient-to-r from-[#ba9eff] to-[#c180ff] bg-clip-text text-transparent">
                  Shielded.
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl font-body font-light leading-relaxed mb-12">
                The world&apos;s first ZK-powered DigiLocker for sovereign data control.
                Cryptographically secure, locally private, globally verifiable.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link
                  href="/dashboard"
                  className="gradient-btn px-10 py-5 rounded-full font-headline font-bold text-lg text-on-primary flex items-center gap-3 bg-gradient-to-r from-[#ba9eff] to-[#c180ff] hover:shadow-[0_0_30px_rgba(186,158,255,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  Enter the Vault
                  <span className="material-symbols-outlined text-xl">
                    arrow_forward
                  </span>
                </Link>
                <button className="px-10 py-5 rounded-full border border-outline-variant font-headline font-bold text-lg text-white hover:bg-white/5 transition-all uppercase tracking-widest">
                  Read the Protocol
                </button>
              </div>
            </motion.div>
          </div>
          {/* Floating Abstract Element */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl opacity-40">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-12 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto px-8">
            <p className="text-center font-label text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-8 font-bold">
              Secured Across Ecosystems
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default group">
                <span className="material-symbols-outlined text-3xl group-hover:text-primary transition-colors">
                  token
                </span>
                <span className="font-headline font-bold text-xl tracking-tight text-white">
                  Ethereum
                </span>
              </div>
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default group">
                <span className="material-symbols-outlined text-3xl group-hover:text-primary transition-colors">
                  hexagon
                </span>
                <span className="font-headline font-bold text-xl tracking-tight text-white">
                  Polygon
                </span>
              </div>
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default group">
                <span className="material-symbols-outlined text-3xl group-hover:text-primary transition-colors">
                  star
                </span>
                <span className="font-headline font-bold text-xl tracking-tight text-white">
                  Starknet
                </span>
              </div>
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default group">
                <span className="material-symbols-outlined text-3xl group-hover:text-primary transition-colors">
                  shield_moon
                </span>
                <span className="font-headline font-bold text-xl tracking-tight text-white">
                  Arbitrum
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section 2: The Tech (ZK-Proofs) */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-square bg-surface-container-low/20 backdrop-blur-2xl border border-white/5 rounded-full flex items-center justify-center p-12 shadow-[0_8px_60px_0_rgba(139,92,246,0.08)] overflow-hidden">
                {/* Abstract Visual */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10"></div>
                <div className="relative w-full h-full border-2 border-dashed border-primary/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute w-2/3 h-2/3 border-2 border-primary/40 rounded-xl rotate-45"></div>
                <div className="absolute w-1/3 h-1/3 bg-primary/20 backdrop-blur-3xl rounded-full border border-primary/50 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-5xl text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </div>
                <img
                  alt="ZK Tech Visualization"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 transition-opacity duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzfqZmFcKegzhMpySgQED-ImptwD_Gy99cnDudJmRKQ_Cdn9jqkU7Nt0ex83qeNa3zWNVmqe633OA50hXKmBGdYT7rTdTCR3_T1Z7MKk_X7sgtGrLagYVpRjAHZA_6uOKBHKaZwTsIpGSCGNK41H5w0StlGxPvGw_ZSPKHeyU1BRtMIzS7Y7KmXbl1OOZhder9940G9d0GhxA6tM3vAweTM4tPz69XccDP9xpDCauxHQr67GNx7aWmWEvXF7uOqRPR4oAJ6rq7Gfo"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-headline text-primary text-sm tracking-[0.4em] uppercase mb-4 block font-bold">
                Cryptographic Engine
              </span>
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-white mb-8 tracking-tighter">
                Verify Everything.
                <br />
                Reveal Nothing.
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-10 font-body">
                Our Zero-Knowledge Proof (ZKP) technology allows you to share
                proof of your documents without ever revealing the underlying
                data.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant group-hover:border-primary transition-colors">
                    <span className="material-symbols-outlined">fingerprint</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-white text-xl mb-1">
                      Identity Masking
                    </h4>
                    <p className="text-on-surface-variant text-sm font-body">
                      Transform Aadhaar, PAN, and Passports into anonymous
                      cryptographic hashes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant group-hover:border-primary transition-colors">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-white text-xl mb-1">
                      Instant Verification
                    </h4>
                    <p className="text-on-surface-variant text-sm font-body">
                      Validators can confirm the validity of a document without
                      seeing a single pixel.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant group-hover:border-primary transition-colors">
                    <span className="material-symbols-outlined">security</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-white text-xl mb-1">
                      Sovereign Control
                    </h4>
                    <p className="text-on-surface-variant text-sm font-body">
                      You hold the keys. ZK Locker never sees your data, only the
                      proof generation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section 3: The Ecosystem (Dev Centric) */}
        <section className="py-32 bg-surface-container-low/30 backdrop-blur-3xl">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="font-headline text-secondary text-sm tracking-[0.4em] uppercase mb-4 block font-bold">
                Developer SDK
              </span>
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-white mb-6 tracking-tighter">
                Built for the Privacy-First Web.
              </h2>
              <p className="text-on-surface-variant text-lg font-body">
                Integrate sovereign identity proofs into any dApp with three
                lines of code.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bento Card 1: API/Code */}
              <div className="lg:col-span-2 bg-surface-container-highest p-8 rounded-2xl overflow-hidden relative border border-white/5">
                <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                  <span className="ml-4 font-mono text-xs text-slate-500">
                    zk-locker-sdk-init.js
                  </span>
                </div>
                <pre className="font-mono text-sm text-primary-container leading-loose overflow-x-auto">
                  <span className="text-secondary font-bold">import</span> &#123; ZKClient &#125;{" "}
                  <span className="text-secondary font-bold">from</span>{" "}
                  <span className="text-on-surface">&apos;@zklocker/sdk&apos;</span>;{"\n\n"}
                  <span className="text-slate-500 font-bold">
                    // Initialize secure proof generation
                  </span>
                  {"\n"}
                  <span className="text-secondary font-bold">const</span> vault ={" "}
                  <span className="text-secondary font-bold">await</span>{" "}
                  ZKClient.connect(wallet);{"\n\n"}
                  <span className="text-slate-500 font-bold">
                    // Generate zero-knowledge proof for age &gt; 18
                  </span>
                  {"\n"}
                  <span className="text-secondary font-bold">const</span> proof ={" "}
                  <span className="text-secondary font-bold">await</span>{" "}
                  vault.proveAttribute(<span className="text-on-surface">&apos;DOB&apos;</span>, &#123;{"\n"}
                  {"  "}predicate: <span className="text-on-surface">&apos;GTE&apos;</span>,{"\n"}
                  {"  "}value: <span className="text-on-surface">&apos;18Y&apos;</span>
                  {"\n"}&#125;);{"\n\n"}
                  console.log(<span className="text-on-surface">&quot;Proof generated successfully&quot;</span>, proof.hash);
                </pre>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
              </div>
              {/* Bento Side Info */}
              <div className="flex flex-col gap-8">
                <div className="bg-surface-container-high p-8 rounded-2xl flex-1 border-l-4 border-primary border border-white/5 group hover:border-primary transition-all">
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl font-bold group-hover:scale-110 transition-transform">
                    bolt
                  </span>
                  <h4 className="font-headline font-bold text-white text-xl mb-2">
                    Gasless Proofs
                  </h4>
                  <p className="text-on-surface-variant text-sm font-body">
                    Layer-2 optimization ensures that proving identity costs
                    zero gas for end-users.
                  </p>
                </div>
                <div className="bg-surface-container-high p-8 rounded-2xl flex-1 border-l-4 border-secondary border border-white/5 group hover:border-secondary transition-all">
                  <span className="material-symbols-outlined text-secondary mb-4 text-3xl font-bold group-hover:scale-110 transition-transform">
                    hub
                  </span>
                  <h4 className="font-headline font-bold text-white text-xl mb-2">
                    Multi-Chain Sync
                  </h4>
                  <p className="text-on-surface-variant text-sm font-body">
                    Generate a proof once, use it across Ethereum, Polygon, and
                    Starknet seamlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-40 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Call to Action Background"
              className="w-full h-full object-cover opacity-20 filter grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVETFUfOtNAqc93w0w7v3Hno3FrSFATW0-Kvhatosz-9N2VglQAuKjV5QT4ImHrEadjSZSgg5y97WD8SUv97NKI1G5cPF3UO7_lwsmLEM9W-3UTexJ-WBpzdBMTLjwlA3usBesfIhL8bVZ6g2H3c_zlmmswQAJIngQjyL58v7XIw-PVgVtbu1xmgra2xbRsuZLT8AOckAJTju315mf_NbXf8-Yemgu6GNGe-IBY4ARKFt431EqnkibNlGZo-EafrRyxP56FZJw1vc"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-white mb-8 tracking-tighter leading-tight">
              Ready to Take
              <br />
              Total Control?
            </h2>
            <p className="text-on-surface-variant text-xl mb-12 max-w-2xl mx-auto font-body">
              Secure your first document in the vault and experience the future
              of private, sovereign identity.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                href="/dashboard"
                className="gradient-btn px-12 py-6 rounded-full font-headline font-bold text-xl text-on-primary bg-gradient-to-r from-primary to-secondary shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 uppercase tracking-widest"
              >
                Secure My Data Now
              </Link>
            </div>
            <p className="mt-8 font-headline text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">
              No Credit Card. No Centralized DB. Fully Decentralized.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-8 bg-[#0e0e15] border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 max-w-7xl mx-auto">
          <div className="font-headline font-bold text-[#ba9eff] text-2xl tracking-widest uppercase">
            ZK LOCKER
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-headline font-bold">
            <a
              className="text-xs tracking-tight text-slate-500 hover:text-[#c180ff] transition-colors uppercase tracking-[0.2em]"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-xs tracking-tight text-slate-500 hover:text-[#c180ff] transition-colors uppercase tracking-[0.2em]"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-xs tracking-tight text-slate-500 hover:text-[#c180ff] transition-colors uppercase tracking-[0.2em]"
              href="#"
            >
              Security Audit
            </a>
            <a
              className="text-xs tracking-tight text-slate-500 hover:text-[#c180ff] transition-colors uppercase tracking-[0.2em]"
              href="#"
            >
              Github
            </a>
          </div>
          <div className="font-body text-[10px] tracking-tight text-slate-600 text-center md:text-right uppercase tracking-widest font-bold">
            © 2024 ZK LOCKER. SECURED BY MONOLITHIC ETHER.
          </div>
        </div>
      </footer>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-high/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-50">
        <button className="flex flex-col items-center gap-1 text-[#ba9eff]">
          <span
            className="material-symbols-outlined font-bold"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield
          </span>
          <span className="text-[10px] uppercase font-headline font-bold">Vault</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 font-bold">
          <span className="material-symbols-outlined font-bold">data_object</span>
          <span className="text-[10px] uppercase font-headline font-bold">SDK</span>
        </button>
        <div className="relative -top-8">
          <Link
            href="/dashboard"
            className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-on-primary shadow-xl font-bold hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl font-bold">add</span>
          </Link>
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-500 font-bold">
          <span className="material-symbols-outlined font-bold">description</span>
          <span className="text-[10px] uppercase font-headline font-bold">Docs</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 font-bold">
          <span className="material-symbols-outlined font-bold">account_circle</span>
          <span className="text-[10px] uppercase font-headline font-bold">Profile</span>
        </button>
      </div>

      <style jsx>{`
        .tonal-transition {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
