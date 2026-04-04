"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";

export default function DocumentsPage() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-16">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">
            Upload Secure Documents
          </h1>
          <p className="font-body text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed">
            Drag and drop your sensitive files to encrypt them with
            Zero-Knowledge proofs locally. Your privacy is our monolithic
            standard.
          </p>
        </header>

        {/* Main Interaction Area: Asymmetric Layout */}
        <div className="lg:grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
          {/* Main Upload Zone (Glassmorphism + Bento Style) */}
          <section className="glass-card rounded-[2rem] p-8 md:p-12 border border-outline-variant/20 relative overflow-hidden group mb-8 lg:mb-0">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
            <div className="relative border-2 border-dashed border-primary/40 rounded-[1.5rem] p-12 md:p-24 flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-primary/80 hover:bg-primary/5">
              <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-surface-container-highest neon-shadow">
                <span className="material-symbols-outlined text-5xl text-primary font-bold">
                  cloud_upload
                </span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-2">
                Drop your secure vault files
              </h3>
              <p className="font-body text-on-surface-variant mb-10 max-w-xs font-medium">
                Encryption happens instantly in your browser. No unencrypted
                data leaves this device.
              </p>
              <button className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white font-headline font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:shadow-[#8B5CF6]/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                Select Files
              </button>
              <div className="mt-8 flex items-center gap-2 text-sm font-label text-[#A1A1AA] uppercase tracking-widest font-bold">
                <span className="material-symbols-outlined text-sm font-bold">
                  info
                </span>
                PDF, JPG, PNG (Max 10MB)
              </div>
            </div>
          </section>

          {/* Features/Assurances Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Card 1: Client-Side Encryption */}
            <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 hover:border-primary/30 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <span
                    className="material-symbols-outlined font-bold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg mb-1">
                    Client-Side Encryption
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-body">
                    Documents are encrypted on your device before they ever touch
                    the network. We never see your raw files.
                  </p>
                </div>
              </div>
            </div>
            {/* Card 2: Zero-Knowledge Proofs */}
            <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 hover:border-tertiary/30 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-tertiary/10 text-tertiary">
                  <span
                    className="material-symbols-outlined font-bold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg mb-1">
                    Zero-Knowledge Proofs
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-body">
                    Generate proofs of age, residency, or status without revealing
                    the underlying document. Privacy by design.
                  </p>
                </div>
              </div>
            </div>
            {/* Card 3: Self-Sovereign Storage */}
            <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 hover:border-secondary/30 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
                  <span
                    className="material-symbols-outlined font-bold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    key
                  </span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg mb-1">
                    Self-Sovereign Storage
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-body">
                    You own the keys. No one, not even us, can access your files.
                    Your data is your property.
                  </p>
                </div>
              </div>
            </div>
            {/* Security Pulse Indicator */}
            <div className="mt-4 p-8 rounded-[2rem] bg-surface-container-low flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#C084FC]/20 rounded-full animate-pulse blur-xl"></div>
                <span className="material-symbols-outlined text-[#C084FC] relative z-10 text-4xl font-bold">
                  security
                </span>
              </div>
              <span className="font-label text-xs uppercase tracking-tighter text-[#C084FC] font-bold">
                Secure ZK-Node Active
              </span>
              <p className="text-[10px] text-on-surface-variant mt-1 font-body uppercase font-bold tracking-widest">
                End-to-end cryptographic tunnel established
              </p>
            </div>
          </aside>
        </div>

        {/* Decorative Background Elements */}
        <div className="fixed top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full pointer-events-none"></div>
        <div className="fixed bottom-0 -right-20 w-[600px] h-[600px] bg-secondary/5 blur-[150px] -z-10 rounded-full pointer-events-none"></div>
      </main>

      {/* Bottom Contextual Footer (Brief) */}
      <footer className="border-t border-outline-variant/10 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-label text-xs text-on-surface-variant font-bold uppercase tracking-widest">
              ZK-ENGINE v4.2.0 | ENCRYPTION: AES-256-GCM
            </span>
          </div>
          <div className="flex gap-8 font-bold">
            <a
              className="text-xs text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-xs text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
              href="#"
            >
              Audit Reports
            </a>
            <a
              className="text-xs text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
              href="#"
            >
              Documentation
            </a>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .glass-card {
            background: rgba(37, 37, 47, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .neon-shadow {
            box-shadow: 0 0 20px rgba(186, 158, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
