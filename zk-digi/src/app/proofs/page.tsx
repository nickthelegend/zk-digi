"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useZkWallet } from "@/context/WalletContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ZKProofService } from "@/lib/zkProofService";

export default function ProofsPage() {
  const { address, isConnected } = useZkWallet();
  const [birthYear, setBirthYear] = useState<number>(2000);
  const [isGenerating, setIsGenerating] = useState(false);

  const proofs = useQuery(api.proofs.getProofs, 
    address ? { walletAddress: address } : "skip"
  );
  const saveProofMutation = useMutation(api.proofs.saveProof);
  const logActivityMutation = useMutation(api.activity.logActivity);

  const handleGenerateAgeProof = async () => {
    if (!address) return;
    
    setIsGenerating(true);
    try {
      // 1. Generate proof client-side
      const { proof, publicSignals } = await ZKProofService.generateAgeProof(birthYear, 18);
      
      // 2. Format and verify for immediate feedback
      const isValid = await ZKProofService.verifyAgeProof(proof, publicSignals);
      
      if (!isValid) {
        throw new Error("Generated proof failed local verification check.");
      }

      // 3. Save to Convex
      const { proofJson, publicSignals: signalsJson } = ZKProofService.formatProof(proof, publicSignals);
      
      await saveProofMutation({
        walletAddress: address,
        proofType: "age_check",
        circuitName: "circuit_bn254",
        proofJson,
        publicSignals: signalsJson,
      });

      await logActivityMutation({
        walletAddress: address,
        eventType: "proof_generated",
        description: `Generated Age Verification Proof (Age > 18)`,
      });

      alert("ZK-Proof generated and verified successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message || "Failed to generate proof"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-background selection:bg-primary/30 min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-8 max-w-[1400px] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-5xl">lock_open</span>
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="font-headline text-4xl font-bold">Access Denied</h1>
            <p className="font-body text-on-surface-variant">
              Generate privacy-preserving proofs by connecting your wallet first.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-[1400px] mx-auto min-h-screen">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="font-label uppercase tracking-widest text-[10px] text-primary font-bold">
              Cryptographic Verification
            </span>
            <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter text-on-surface">
              Zero Knowledge <span className="text-primary-dim">Proofs</span>
            </h1>
            <p className="text-on-surface-variant max-w-xl text-lg font-light leading-relaxed">
              Verify attributes without revealing data. Secure, private, and mathematically immutable proofs.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List Section */}
          <section className="lg:col-span-8 space-y-8">
             <h2 className="font-headline text-2xl font-bold border-b border-outline-variant/10 pb-4">
              Your Active Proofs
            </h2>

            {proofs === undefined ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : proofs.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-16 text-center border border-dashed border-outline-variant/20 italic text-on-surface-variant">
                No generated proofs found. Use the panel to the right to generate one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {proofs.map((p: any) => (
                  <div key={p._id} className="glass-card p-8 rounded-[2rem] border border-outline-variant/10 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <span className="material-symbols-outlined text-primary text-3xl">shield_check</span>
                        </div>
                        <div>
                          <h3 className="font-headline text-2xl font-bold">
                            {p.proofType === "age_check" ? "Age Verification (> 18)" : p.proofType}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            <span className="text-xs text-green-400 font-bold uppercase tracking-widest">{p.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-outline font-bold">
                        {p.circuitName} v1.0
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">Verification Key Hash</div>
                      <code className="block bg-surface-container-low p-4 rounded-xl text-primary-dim text-xs break-all font-mono border border-outline-variant/10">
                        {p._id.substring(0, 32)}...
                      </code>
                    </div>
                    <div className="mt-8 flex gap-4">
                      <button className="flex items-center gap-2 px-6 py-2 rounded-full bg-surface-container-highest text-xs font-bold font-headline uppercase tracking-wider hover:bg-outline-variant/30 transition-all">
                        <span className="material-symbols-outlined text-sm">share</span>
                        Share Proof
                      </button>
                      <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-outline-variant/20 text-xs font-bold font-headline uppercase tracking-wider hover:border-primary/50 transition-all text-on-surface-variant hover:text-on-surface">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Generator Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-[2rem] border border-primary/20">
              <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">psychology</span>
                ZK Generator
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">Proof Template</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm outline-none">
                    <option>Age Verification {`(`}&gt; 18{`)`}</option>
                    <option disabled>Identity Anchor Verification</option>
                    <option disabled>Resident Status Proof</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">Your Birth Year</label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(parseInt(e.target.value))}
                    min="1900"
                    max="2026"
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                  <p className="text-[10px] text-on-surface-variant italic mt-1">
                    * This year stays on your device. Only the proof is shared.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAgeProof}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-primary-dim text-black font-headline font-bold py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      COMPUTING ZK-P...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">bolt</span>
                      GENERATE PROOF
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-outline-variant/10">
              <h4 className="font-headline font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                <span className="material-symbols-outlined text-secondary text-sm">info</span>
                Computational Note
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Proof generation involves solving a polynomial constraint system. 
                This process takes ~2-5 seconds depending on your device's CPU. 
                All computation is local via WebAssembly.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <style jsx>{`
        .glass-card {
          background: rgba(31, 31, 40, 0.4);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}

