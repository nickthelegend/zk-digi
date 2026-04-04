"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";

export default function ActivityPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen selection:bg-primary/30">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl font-headline font-bold tracking-tighter text-on-surface">
              Activity Log
            </h1>
            <p className="text-on-surface-variant font-body mt-4 max-w-xl text-lg leading-relaxed">
              A cryptographically verified ledger of your Zero-Knowledge proof
              generations and data disclosures.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-surface-container-low rounded-xl flex items-center gap-2 border border-outline-variant/10">
              <span
                className="material-symbols-outlined text-primary text-sm font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span className="text-xs font-label uppercase tracking-widest font-bold">
                32 Verified Events
              </span>
            </div>
          </div>
        </header>

        <div className="relative">
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary/20 to-transparent transform md:-translate-x-1/2"></div>
          
          <div className="space-y-12">
            {/* Event 1 */}
            <div className="relative grid grid-cols-[80px_1fr] md:grid-cols-2 gap-8 items-start">
              <div className="flex justify-end md:pr-16 order-2 md:order-1">
                <div className="glass-card p-6 rounded-2xl border border-outline-variant/20 w-full hover:shadow-[0_0_30px_rgba(186,158,255,0.1)] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-label font-bold uppercase tracking-widest rounded-full border border-primary/20">
                      Success
                    </span>
                    <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">
                      2 hours ago
                    </span>
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-2 text-on-surface group-hover:text-primary transition-colors">
                    Crypto Exchange
                  </h3>
                  <p className="text-on-surface-variant text-sm font-body leading-relaxed mb-4">
                    Identity verified:{" "}
                    <span className="text-on-surface font-medium">Age &gt; 18</span>.
                    Generated a recursive SNARK proof to validate legal age
                    without disclosing birth date.
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-label text-outline uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs font-bold">key</span>{" "}
                      Hash: 0x4f...a29
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-xs font-bold">bolt</span>{" "}
                      12.4ms
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute left-0 md:left-1/2 w-20 h-20 flex items-center justify-center transform -translate-x-0 md:-translate-x-1/2 z-10 order-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border-4 border-primary flex items-center justify-center secure-pulse">
                  <span
                    className="material-symbols-outlined text-primary text-xl font-bold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    currency_exchange
                  </span>
                </div>
              </div>
              <div className="hidden md:block md:pl-16 order-3 pt-6">
                <div className="text-xs font-label text-on-surface-variant uppercase tracking-[0.2em] font-bold">
                  Verification Event
                </div>
                <div className="h-[1px] w-12 bg-outline-variant/30 mt-2"></div>
              </div>
            </div>

            {/* Event 2 */}
            <div className="relative grid grid-cols-[80px_1fr] md:grid-cols-2 gap-8 items-start">
              <div className="hidden md:flex justify-end md:pr-16 order-1 pt-6 text-right flex-col items-end">
                <div className="text-xs font-label text-on-surface-variant uppercase tracking-[0.2em] font-bold">
                  Data Request
                </div>
                <div className="h-[1px] w-12 bg-outline-variant/30 mt-2"></div>
              </div>
              <div className="absolute left-0 md:left-1/2 w-20 h-20 flex items-center justify-center transform -translate-x-0 md:-translate-x-1/2 z-10 order-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border-4 border-secondary flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-secondary text-xl font-bold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    account_balance
                  </span>
                </div>
              </div>
              <div className="md:pl-16 order-2">
                <div className="glass-card p-6 rounded-2xl border border-outline-variant/20 w-full hover:shadow-[0_0_30px_rgba(193,128,255,0.1)] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-label font-bold uppercase tracking-widest rounded-full border border-secondary/20">
                      Pending Action
                    </span>
                    <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">
                      Yesterday
                    </span>
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-2 text-on-surface group-hover:text-secondary transition-colors">
                    Lending App
                  </h3>
                  <p className="text-on-surface-variant text-sm font-body leading-relaxed mb-4">
                    Requested{" "}
                    <span className="text-on-surface font-medium">Solvency Proof</span>.
                    Verification of wallet balance exceeding 5 ETH required for
                    decentralized loan collateralization.
                  </p>
                  <button className="w-full py-2 bg-surface-container-highest border border-outline-variant/30 rounded-lg text-[10px] font-label uppercase tracking-widest hover:bg-secondary/10 hover:border-secondary/50 transition-all font-bold">
                    Authorize Proof
                  </button>
                </div>
              </div>
            </div>

            {/* Event 3 */}
            <div className="relative grid grid-cols-[80px_1fr] md:grid-cols-2 gap-8 items-start">
              <div className="flex justify-end md:pr-16 order-2 md:order-1">
                <div className="glass-card p-6 rounded-2xl border border-outline-variant/20 w-full hover:shadow-[0_0_30px_rgba(186,158,255,0.1)] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-label font-bold uppercase tracking-widest rounded-full border border-primary/20">
                      Archived
                    </span>
                    <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">
                      2 days ago
                    </span>
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-2 text-on-surface group-hover:text-primary transition-colors">
                    University
                  </h3>
                  <p className="text-on-surface-variant text-sm font-body leading-relaxed mb-4">
                    Student status verified for{" "}
                    <span className="text-on-surface font-medium">Education License</span>.
                    Credential pulled from EduChain and masked via ZK-Proof.
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-label text-outline uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs font-bold">history</span>{" "}
                      Session: 882-901
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute left-0 md:left-1/2 w-20 h-20 flex items-center justify-center transform -translate-x-0 md:-translate-x-1/2 z-10 order-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border-4 border-primary/40 flex items-center justify-center opacity-60">
                  <span
                    className="material-symbols-outlined text-primary text-xl font-bold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    school
                  </span>
                </div>
              </div>
              <div className="hidden md:block md:pl-16 order-3 pt-6">
                <div className="text-xs font-label text-on-surface-variant uppercase tracking-[0.2em] font-bold">
                  Institutional Attestation
                </div>
                <div className="h-[1px] w-12 bg-outline-variant/30 mt-2"></div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-8 rounded-3xl group hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary text-3xl mb-4 font-bold">
                security
              </span>
              <h4 className="text-lg font-headline font-bold mb-2">
                Zero Reveal
              </h4>
              <p className="text-on-surface-variant text-sm font-body">
                All activity log items represent zero-knowledge interactions
                where your raw data never left your local locker.
              </p>
            </div>
            <div className="bg-surface-container-low p-8 rounded-3xl group hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-secondary text-3xl mb-4 font-bold">
                history_edu
              </span>
              <h4 className="text-lg font-headline font-bold mb-2">
                Immutable History
              </h4>
              <p className="text-on-surface-variant text-sm font-body">
                Your activity is hashed and anchored on-chain for personal
                auditability without sacrificing privacy.
              </p>
            </div>
            <div className="bg-surface-container-low p-8 rounded-3xl group hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-tertiary text-3xl mb-4 font-bold">
                delete_sweep
              </span>
              <h4 className="text-lg font-headline font-bold mb-2">
                Auto-Prune
              </h4>
              <p className="text-on-surface-variant text-sm font-body">
                Configure your history to automatically purge local metadata
                after 30 days while maintaining proof validity.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 py-12 px-8 border-t border-outline-variant/10">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-headline font-bold text-lg opacity-50 uppercase tracking-widest">
            ZK LOCKER
          </div>
          <div className="flex gap-12 font-bold">
            <a
              className="text-xs font-label uppercase tracking-widest text-outline hover:text-primary transition-colors"
              href="#"
            >
              Documentation
            </a>
            <a
              className="text-xs font-label uppercase tracking-widest text-outline hover:text-primary transition-colors"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-xs font-label uppercase tracking-widest text-outline hover:text-primary transition-colors"
              href="#"
            >
              Audit Report
            </a>
          </div>
          <div className="text-[10px] font-label text-outline uppercase tracking-widest font-bold">
            v2.4.0-STABLE | ENCRYPTED SESSION
          </div>
        </div>
      </footer>
    </div>
  );
}
