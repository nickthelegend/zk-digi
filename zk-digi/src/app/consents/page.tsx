"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { useZkWallet } from "@/context/WalletContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ConsentsPage() {
  const { address, isConnected } = useZkWallet();
  const consents = useQuery(api.consents.getConsents, 
    address ? { walletAddress: address } : "skip"
  );
  const revokeMutation = useMutation(api.consents.revokeConsent);
  const logActivityMutation = useMutation(api.activity.logActivity);

  const handleRevoke = async (consentId: any, appName: string) => {
    if (!address) return;
    try {
      await revokeMutation({ id: consentId });
      await logActivityMutation({
        walletAddress: address,
        eventType: "consent_revoked",
        description: `Revoked privacy consent for ${appName}`,
      });
      alert(`Consent for ${appName} has been revoked.`);
    } catch (err) {
      console.error(err);
      alert("Failed to revoke consent.");
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-background selection:bg-primary/30 min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-5xl">lock_person</span>
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="font-headline text-4xl font-bold">Access Denied</h1>
            <p className="font-body text-on-surface-variant">
              Manage your privacy permissions by connecting your wallet first.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background selection:bg-primary/30 min-h-screen font-body">
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 leading-none">
              Consent Manager
            </h1>
            <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
              Manage cryptographic permissions granted to external applications. 
              Control who can request ZK-Proofs from your vault.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-6 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-primary secure-pulse"></span>
                <span className="text-xs font-label uppercase tracking-widest font-bold">Privacy Layer: Shielded</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Stats */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-outline-variant/5 flex flex-col gap-2">
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">
                Active Consents
              </span>
              <span className="text-5xl font-headline font-bold text-primary">
                {consents ? consents.filter((c: any) => c.status === "active").length : "--"}
              </span>
            </div>
            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-outline-variant/5 flex flex-col gap-2">
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">
                Privacy Score
              </span>
              <span className="text-5xl font-headline font-bold text-white tracking-widest">
                98<span className="text-base font-normal opacity-40">/100</span>
              </span>
            </div>
          </aside>

          {/* Main Consents List */}
          <section className="lg:col-span-9 space-y-6">
             <h2 className="font-headline text-2xl font-bold border-b border-outline-variant/10 pb-4">
               Connected Applications
             </h2>

            {consents === undefined ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : consents.length === 0 ? (
              <div className="glass-card p-16 rounded-[2.5rem] text-center border border-dashed border-outline-variant/20 italic text-on-surface-variant">
                No apps have requested identity access yet.
              </div>
            ) : (
              consents.map((consent: any) => (
                <div key={consent._id} className={`glass-card p-8 rounded-[2rem] border border-outline-variant/10 transition-all duration-300 ${consent.status !== 'active' ? 'opacity-50' : ''}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex gap-8">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-surface-container-highest flex items-center justify-center text-primary shadow-lg shadow-black/20">
                        <span className="material-symbols-outlined text-3xl font-bold">apps</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-headline font-bold text-on-surface mb-2 tracking-tight">
                          {consent.appName}
                        </h3>
                        <div className="flex flex-wrap gap-3 items-center mb-5">
                          {consent.requestedData.map((data: string) => (
                            <span key={data} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-label uppercase tracking-widest rounded-lg border border-primary/20 font-bold">
                              {data.split('_').join(' ')}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-label text-outline uppercase tracking-widest font-bold">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm font-bold">update</span>
                            Active Since: {new Date(consent.lastUpdated).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-sm font-bold">verified</span>
                            Encrypted Channel
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-end gap-3 min-w-[150px]">
                      {consent.status === 'active' ? (
                        <button 
                          onClick={() => handleRevoke(consent._id, consent.appName)}
                          className="w-full px-6 py-3 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/20 border border-red-500/20 transition-all"
                        >
                          Revoke Access
                        </button>
                      ) : (
                         <span className="text-center text-[10px] uppercase font-bold tracking-widest text-outline bg-surface-container-highest py-2 rounded-lg border border-outline-variant/10">
                           {consent.status}
                         </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>

        <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined font-bold">visibility_off</span>
              </div>
              <h4 className="text-lg font-headline font-bold text-on-surface">ZK Verification</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                Apps receive a mathematical proof that conditions are met, without ever seeing your profile data.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined font-bold">timer</span>
              </div>
              <h4 className="text-lg font-headline font-bold text-on-surface">Auto Expiry</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                Permissions are transient by default. High security actions require one-time approval sessions.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined font-bold">history</span>
              </div>
              <h4 className="text-lg font-headline font-bold text-on-surface">Access Audit</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                You maintain a complete, tamper-proof record of every time an app requested a verification proof.
              </p>
            </div>
        </section>
      </main>

      <footer className="mt-32 py-16 border-t border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="font-headline font-bold text-3xl tracking-tighter text-outline opacity-30">ZK-DIGI</div>
          <div className="flex gap-12">
            <a className="text-[10px] font-label uppercase tracking-widest text-outline hover:text-on-surface transition-colors font-bold" href="#">Security Docs</a>
            <a className="text-[10px] font-label uppercase tracking-widest text-outline hover:text-on-surface transition-colors font-bold" href="#">Data Processing</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .glass-card {
          background: rgba(31, 31, 40, 0.4);
          backdrop-filter: blur(20px);
        }
        .secure-pulse {
          animation: pulse 3s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
