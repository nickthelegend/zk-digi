"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { useZkWallet } from "@/context/WalletContext";
import { useDbQuery } from "@/hooks/useDb";
import { db } from "@/lib/db";

const EVENT_ICONS: Record<string, string> = {
  wallet_connected: "account_balance_wallet",
  document_uploaded: "description",
  proof_generated: "verified_user",
  consent_granted: "how_to_reg",
  consent_revoked: "block",
};

const EVENT_COLORS: Record<string, string> = {
  wallet_connected: "text-blue-400",
  document_uploaded: "text-green-400",
  proof_generated: "text-primary",
  consent_granted: "text-tertiary",
  consent_revoked: "text-red-400",
};

export default function ActivityPage() {
  const { address, isConnected } = useZkWallet();
  const activity = useDbQuery(db.activity.list, address);

  if (!isConnected) {
    return (
      <div className="bg-surface selection:bg-primary/30 min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-8 max-w-[1920px] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-5xl">history</span>
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="font-headline text-4xl font-bold">Access Denied</h1>
            <p className="font-body text-on-surface-variant">
              Connect your wallet to view your cryptographic activity log.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen selection:bg-primary/30 font-body">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl font-headline font-bold tracking-tighter text-on-surface leading-tight">
              Activity Ledger
            </h1>
            <p className="text-on-surface-variant mt-4 max-w-xl text-lg leading-relaxed">
              A cryptographically verified audit log of your identity operations. 
              The vault records metadata but never raw data.
            </p>
          </div>
          <div className="flex gap-3">
             <div className="px-5 py-3 bg-surface-container-low rounded-2xl flex items-center gap-3 border border-outline-variant/10">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-label uppercase tracking-widest font-bold">Live Monitoring</span>
             </div>
          </div>
        </header>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-outline-variant/20"></div>
          
          <div className="space-y-12 relative z-10">
            {activity === undefined ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activity.length === 0 ? (
              <div className="glass-card p-12 rounded-[2rem] text-center italic text-on-surface-variant border border-outline-variant/10">
                No activity recorded yet for this wallet.
              </div>
            ) : (
              activity.map((event: any, idx: number) => (
                <div key={event._id} className="flex gap-10 group">
                  <div className={`w-14 h-14 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${EVENT_COLORS[event.eventType] || "text-on-surface"}`}>
                    <span className="material-symbols-outlined text-2xl font-bold">
                      {EVENT_ICONS[event.eventType] || "event_note"}
                    </span>
                  </div>
                  
                  <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/10 w-full hover:bg-surface-container-low/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-headline font-bold text-on-surface uppercase tracking-tight">
                          {event.eventType.split('_').join(' ')}
                        </h3>
                        <p className="text-xs font-label text-outline uppercase tracking-widest font-bold mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-surface-container-highest text-[10px] font-mono text-outline-variant font-bold border border-outline-variant/5 truncate max-w-[150px]">
                        ID: {event._id.substring(0, 16)}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-base leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10">
              <span className="material-symbols-outlined text-primary text-3xl mb-4 font-bold">security</span>
              <h4 className="text-lg font-headline font-bold mb-2">Zero Reveal</h4>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Log entries describe actions but ensure no sensitive document or proof data is ever stored in plaintext.
              </p>
            </div>
            <div className="p-8 rounded-[2rem] bg-secondary/5 border border-secondary/10">
              <span className="material-symbols-outlined text-secondary text-3xl mb-4 font-bold">history_edu</span>
              <h4 className="text-lg font-headline font-bold mb-2">Audit Ready</h4>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Every entry is timestamped and cryptographically linked to your wallet for personal sovereignty.
              </p>
            </div>
            <div className="p-8 rounded-[2rem] bg-tertiary/5 border border-tertiary/10">
              <span className="material-symbols-outlined text-tertiary text-3xl mb-4 font-bold">delete_sweep</span>
              <h4 className="text-lg font-headline font-bold mb-2">Self Pruning</h4>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Your activity history can be configured to auto-purge from local cache while remaining in your vault.
              </p>
            </div>
        </section>
      </main>

      <footer className="mt-32 py-16 px-10 border-t border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-2">
            <div className="font-headline font-bold text-2xl tracking-tighter text-primary">ZK-DIGI</div>
            <div className="text-[10px] font-label text-outline uppercase tracking-widest font-bold">v2.4.0LTS | SECURE LEDGER ACTIVE</div>
          </div>
          <div className="flex gap-12">
            <a className="text-xs font-label uppercase tracking-widest text-outline hover:text-primary transition-colors font-bold" href="#">Documentation</a>
            <a className="text-xs font-label uppercase tracking-widest text-outline hover:text-primary transition-colors font-bold" href="#">Privacy</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .glass-card {
            background: rgba(31, 31, 40, 0.3);
            backdrop-filter: blur(15px);
        }
      `}</style>
    </div>
  );
}

