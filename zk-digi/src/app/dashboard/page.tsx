"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useZkWallet } from "@/context/WalletContext";
import { useDbQuery } from "@/hooks/useDb";
import { db } from "@/lib/db";
import Link from "next/link";
import { ZkVerifierClient } from "@/contracts/ZkVerifierClient";
import { VERIFIER_APP_ID } from "@/contracts/config";

export default function Dashboard() {
  const { address, isConnected, algorand } = useZkWallet();
  const [onChainProofCount, setOnChainProofCount] = useState<number | null>(null);
  const stats = useDbQuery(db.dashboard.getStats, address);

  useEffect(() => {
    async function fetchOnChainStats() {
      if (VERIFIER_APP_ID && algorand) {
        try {
          const client = new ZkVerifierClient({ appId: BigInt(VERIFIER_APP_ID), algorand });
          const state = await client.appClient.getGlobalState();
          if (state.proofCount) {
             const val = state.proofCount as any;
             setOnChainProofCount(Number(typeof val === 'bigint' ? val : val.asBigInt?.() ?? val.value));
          }
        } catch (e) {
          console.error("Failed to fetch on-chain stats:", e);
        }
      }
    }
    fetchOnChainStats();
  }, [algorand]);

  if (!isConnected) {
    return (
      <div className="bg-surface selection:bg-primary/30 min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-8 max-w-[1920px] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-5xl">account_balance_wallet</span>
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="font-headline text-4xl font-bold">Connect Your Wallet</h1>
            <p className="font-body text-on-surface-variant">
              To access your private identity vault and manage your ZK proofs, please connect your Algorand wallet.
            </p>
          </div>
          <div className="flex gap-4">
            {/* The Navbar already has the button, but we can prompt the user */}
            <p className="text-sm font-bold text-primary-dim uppercase tracking-widest">
              Check the navbar to connect
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isLoading = stats === undefined;

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
          <Link href="/documents" className="glass-card p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  description
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
                arrow_outward
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-5xl font-bold">
                {isLoading ? "..." : stats.documentCount}
              </h3>
              <p className="font-body text-on-surface-variant text-sm font-medium">Documents</p>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Vault Storage</span>
              <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${Math.min((stats?.documentCount || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </Link>

          {/* 2. Active Consents */}
          <Link href="/consents" className="glass-card p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors">
                arrow_outward
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-5xl font-bold">
                {isLoading ? "..." : stats.activeConsents}
              </h3>
              <p className="font-body text-on-surface-variant text-sm font-medium">Active Consents</p>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10 text-[10px] text-outline tracking-widest uppercase font-bold">
              Shared Metadata
            </div>
          </Link>

          {/* 3. Generated Proofs */}
          <Link href="/proofs" className="glass-card p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  enhanced_encryption
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-tertiary transition-colors">
                arrow_outward
              </span>
            </div>
            <div className="space-y-1">
                <div className="text-4xl font-headline font-bold text-on-surface">
                  {onChainProofCount !== null ? onChainProofCount : stats ? stats.proofCount : "0"}
                </div>
                <div className="text-on-surface-variant font-label text-sm uppercase tracking-wider">
                  {onChainProofCount !== null ? "On-Chain Verified" : "Active Proofs"}
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10 text-[10px] text-outline tracking-widest uppercase font-bold flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${stats?.verifiedProofs ? "bg-green-500 secure-pulse" : "bg-outline"}`}></span>{" "}
              {stats?.verifiedProofs || 0} Verified
            </div>
          </Link>

          {/* 4. Connected Apps */}
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden group cursor-default">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-dim/5 rounded-full blur-2xl group-hover:bg-primary-dim/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary-dim/10 flex items-center justify-center text-primary-dim">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  grid_view
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-5xl font-bold">0</h3>
              <p className="font-body text-on-surface-variant text-sm font-medium">Apps Linked</p>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10 text-[10px] text-outline font-bold uppercase tracking-widest">
              Ecosystem Status: Beta
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
                <Link href="/proofs" className="px-8 py-3 rounded-full bg-primary text-black font-bold text-sm hover:brightness-110 transition-all text-center">
                  Generate Proof
                </Link>
                <Link href="/documents" className="px-8 py-3 rounded-full bg-surface-container-highest text-on-surface font-bold text-sm border border-outline-variant/20 hover:bg-surface-bright transition-all text-center">
                  My Documents
                </Link>
              </div>
            </div>
            <div className="w-full md:w-[400px] h-[300px] rounded-2xl overflow-hidden relative group shadow-2xl">
              <img
                alt="Abstract ZK visualization"
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 p-4 backdrop-blur-md bg-slate-900/40 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-1">
                  Network Activity
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span className="text-xs font-mono text-on-surface">
                    ZK-P Node: Active - Testnet
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
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : stats.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-outline text-sm italic">
                    No recent activity
                  </div>
                ) : (
                  stats.recentActivity.map((activity: any) => (
                    <div key={activity._id} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm text-primary">
                          {activity.eventType === "wallet_connected" ? "account_balance_wallet" : 
                           activity.eventType === "proof_generated" ? "key" :
                           activity.eventType === "document_uploaded" ? "upload_file" : "history"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate max-w-[150px]">
                          {activity.description}
                        </span>
                        <span className="text-[10px] text-outline">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Link href="/activity" className="w-full py-3 mt-8 border-t border-outline-variant/10 text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors text-center block">
              View Full Audit Log
            </Link>
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
    </div>
  );
}



