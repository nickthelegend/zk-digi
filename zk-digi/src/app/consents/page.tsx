"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { useZkWallet } from "@/context/WalletContext";
import { useDbQuery, useDbMutation } from "@/hooks/useDb";
import { db } from "@/lib/db";
import { useState } from "react";
import * as algokit from "@algorandfoundation/algokit-utils";
import * as algosdk from "algosdk";
import { ZkConsentFactory } from "@/contracts/ZkConsentClient";

export default function ConsentsPage() {
  const { address, isConnected, algorand } = useZkWallet();
  const consents = useDbQuery(db.consents.list, address);
  const proofs = useDbQuery(db.proofs.list, address);
  const revokeMutation = useDbMutation(db.consents.revoke);
  const grantMutation = useDbMutation(db.consents.grant);
  const logActivityMutation = useDbMutation(db.activity.log);

  const [isGranting, setIsGranting] = useState(false);
  const [deploymentStage, setDeploymentStage] = useState<"idle" | "deploying" | "initializing" | "saving">("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);

  const [selectedProofId, setSelectedProofId] = useState("");
  const [targetApp, setTargetApp] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleRevoke = async (consentId: any, appName: string) => {
    if (!address) return;
    try {
      await revokeMutation(consentId);
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

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !selectedProofId || !targetApp) {
      alert("Please fill all fields.");
      return;
    }

    const proof = proofs?.find((p: any) => p._id === selectedProofId);
    if (!proof) return;

    try {
      setIsGranting(true);
      setDeploymentStage("deploying");

      // Deploy real ZkConsent smart contract using USER'S connected wallet
      if (!address || !algorand) throw new Error("Wallet not fully connected");

      const factory = algorand.client.getTypedAppFactory(ZkConsentFactory, {
        defaultSender: address
      });

      // 1. Create a brand new App for this specific consent
      const createResult = await factory.send.create.bare();
      const appClient = createResult.appClient;
      const onChainAppId = appClient.appId.toString();
      
      setDeploymentStage("saving");
      await grantMutation({
        walletAddress: address,
        appName: targetApp,
        appId: onChainAppId,
        proofId: selectedProofId,
        proofTypes: [proof.proofType],
        purpose: purpose,
      });

      await logActivityMutation({
        walletAddress: address,
        eventType: "consent_granted",
        description: `Granted privacy consent to ${targetApp} (App ID: ${onChainAppId})`,
      });

      setCreatedAppId(onChainAppId);
      setShowSuccessModal(true);

      setTargetApp("");
      setSelectedProofId("");
      setPurpose("");
    } catch (err) {
      console.error(err);
      alert("Failed to grant consent. Please ensure you approve all wallet transactions.");
    } finally {
      setIsGranting(false);
      setDeploymentStage("idle");
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
                <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Encrypted Tunnel Active</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-8">
            <div className="p-10 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
              
              <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">
                Identity Sharing
              </span>
              <h3 className="text-xl font-headline font-bold text-white">Grant New Access</h3>
              <form onSubmit={handleGrant} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-outline">Third Party App</label>
                  <input 
                    type="text" 
                    value={targetApp}
                    onChange={(e) => setTargetApp(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-outline">Select ZK-Proof</label>
                  <select 
                    value={selectedProofId}
                    onChange={(e) => setSelectedProofId(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="">-- Choose Proof --</option>
                    {proofs?.map((p: any) => (
                      <option key={p._id} value={p._id}>{p.proofType} ({new Date(p.generatedAt).toLocaleDateString()})</option>
                    ))}
                  </select>
                </div>
                <button 
                  disabled={isGranting}
                  className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isGranting ? (deploymentStage === "deploying" ? "Deploying App..." : "Saving Data...") : "Authorize Grant"}
                </button>
              </form>
            </div>

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
          <section className="lg:col-span-2 space-y-6">
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
                          {consent.proofTypes?.map((data: string) => (
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
                        <>
                          <a 
                            href={`/share/consent/${consent.appId}`}
                            target="_blank"
                            className="w-full px-6 py-3 rounded-xl bg-primary/10 text-primary text-[10px] text-center font-bold tracking-widest uppercase hover:bg-primary/20 border border-primary/20 transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">share</span>
                            Share Link
                          </a>
                          <button 
                            onClick={() => handleRevoke(consent._id, consent.appName)}
                            className="w-full px-6 py-3 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/20 border border-red-500/20 transition-all"
                          >
                            Revoke Access
                          </button>
                        </>
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
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 shadow-2xl max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold font-headline mb-2 text-white">Consent Created!</h2>
            <p className="text-on-surface-variant mb-6 text-sm">
              Your smart contract was successfully deployed and initialized on the Algorand testnet.
            </p>
            <div className="bg-background/50 rounded-xl p-4 mb-8 border border-outline-variant/5">
                <p className="text-[10px] text-outline uppercase tracking-widest font-bold mb-2">Contract App ID</p>
                <p className="font-mono text-primary text-2xl font-bold break-all">{createdAppId}</p>
            </div>
            <button
               onClick={() => setShowSuccessModal(false)}
               className="w-full py-4 rounded-2xl bg-primary text-black font-bold tracking-widest uppercase hover:brightness-110 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
