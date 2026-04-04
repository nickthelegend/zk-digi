"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="bg-surface selection:bg-primary/30 min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-20 px-8 max-w-[1920px] mx-auto min-h-screen">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="font-headline uppercase tracking-[0.3em] text-[10px] text-primary/80 font-bold">
              Secure Access
            </span>
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-on-surface">
              Your Private <br />
              <span className="text-primary-dim">Identity Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <div className="flex flex-col items-end">
              <span className="font-headline text-[10px] uppercase tracking-widest text-outline">
                Security Status
              </span>
              <span className="text-sm font-bold text-primary">ZK-ENCRYPTED</span>
            </div>
            <div className="w-2 h-10 bg-primary/20 rounded-full overflow-hidden">
              <div className="w-full h-2/3 bg-primary secure-pulse"></div>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Documents Count */}
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  description
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
                arrow_outward
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-5xl font-bold">5</h3>
              <p className="font-body text-on-surface-variant text-sm font-medium">
                Documents
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest">
                Vault Storage
              </span>
              <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div className="w-[20%] h-full bg-primary"></div>
              </div>
            </div>
          </div>

          {/* 2. Active Consents */}
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors">
                arrow_outward
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-5xl font-bold">3</h3>
              <p className="font-body text-on-surface-variant text-sm font-medium">
                Active Consents
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-surface bg-surface-container-high"></div>
                <div className="w-6 h-6 rounded-full border-2 border-surface bg-surface-container-high"></div>
                <div className="w-6 h-6 rounded-full border-2 border-surface bg-surface-container-high"></div>
              </div>
            </div>
          </div>

          {/* 3. Generated Proofs */}
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  enhanced_encryption
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-tertiary transition-colors">
                arrow_outward
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-5xl font-bold">7</h3>
              <p className="font-body text-on-surface-variant text-sm font-medium">
                Generated Proofs
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10 text-[10px] text-outline tracking-widest uppercase font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 secure-pulse"></span>{" "}
              Valid & Active
            </div>
          </div>

          {/* 4. Connected Apps */}
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-dim/5 rounded-full blur-2xl group-hover:bg-primary-dim/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary-dim/10 flex items-center justify-center text-primary-dim">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  grid_view
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary-dim transition-colors">
                arrow_outward
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-5xl font-bold">2</h3>
              <p className="font-body text-on-surface-variant text-sm font-medium">
                Connected Apps
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="text-[10px] text-outline font-bold uppercase tracking-widest">
                Active Links
              </span>
              <span className="material-symbols-outlined text-primary-dim text-lg">
                link
              </span>
            </div>
          </div>

          {/* Large Asymmetric Content Area */}
          <div className="lg:col-span-3 glass-card rounded-[2rem] p-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span className="text-[10px] font-bold uppercase tracking-widest font-headline">
                  Identity Protection Active
                </span>
              </div>
              <h2 className="font-headline text-4xl font-bold leading-tight">
                Privacy by default. <br />
                Security by design.
              </h2>
              <p className="font-body text-on-surface-variant leading-relaxed">
                Your data remains encrypted and stored on-chain using
                zero-knowledge proofs. Share only what you need, when you need
                it, without ever revealing your underlying identity.
              </p>
              <div className="flex gap-4 pt-4">
                <button className="px-8 py-3 rounded-full bg-primary text-black font-bold text-sm hover:brightness-110 transition-all">
                  Generate Proof
                </button>
                <button className="px-8 py-3 rounded-full bg-surface-container-highest text-on-surface font-bold text-sm border border-outline-variant/20 hover:bg-surface-bright transition-all">
                  Vault Settings
                </button>
              </div>
            </div>
            <div className="w-full md:w-[400px] h-[300px] rounded-2xl overflow-hidden relative group shadow-2xl">
              <img
                alt="Abstract ZK visualization"
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZyNGDtlI1givjubM2ehXEtzNdEWeoqUUPQxZm8OJR6Dzz1LULoMPq73O9UFxkXPdyGR3NC6NqaIMDFog-odQ0ntMG9nB_BZEL-bfVNAspHK1i2KMNNUHz4MNMmF48LfoAUbjaxANXPoAHLcmBP5rq3GztrHHeohtwiqR2nQZ3Z0ZnkU6xWwSztw-ySXd5Tbb1DY0Re9Ccl-FGDKSdOIK7KLF-nQIOr_36EW9bsinqj_gcqTGztRHJ4RkMYfLr89owZtglkHNE4h4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 p-4 backdrop-blur-md bg-slate-900/40 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-1">
                  Network Activity
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span className="text-xs font-mono text-on-surface">
                    ZK-P Node: Active - 12ms latency
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity / Side Stats */}
          <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-headline text-lg font-bold mb-6">
                Recent Activity
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-primary">
                      key
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      Proof Generated
                    </span>
                    <span className="text-[10px] text-outline">
                      2 mins ago • Uniswap V3
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-secondary">
                      visibility
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      Consent Verified
                    </span>
                    <span className="text-[10px] text-outline">
                      1 hour ago • Bankless ID
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-error-container">
                      lock_reset
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      Locker Re-keyed
                    </span>
                    <span className="text-[10px] text-outline">
                      Yesterday • Auto-rotate
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full py-3 mt-8 border-t border-outline-variant/10 text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors">
              View Full Audit Log
            </button>
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
    </div>
  );
}


