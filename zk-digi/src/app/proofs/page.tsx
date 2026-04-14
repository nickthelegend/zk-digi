"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useZkWallet } from "@/context/WalletContext";
import { useDbQuery, useDbMutation } from "@/hooks/useDb";
import { db } from "@/lib/db";
import { ZkVerifierClient } from "@/contracts/ZkVerifierClient";
import { VERIFIER_APP_ID } from "@/contracts/config";
import { ZKProofService } from "@/lib/zkProofService";
import * as algokit from "@algorandfoundation/algokit-utils";

export default function ProofsPage() {
  const { address, isConnected, algorand } = useZkWallet();
  const [birthYear, setBirthYear] = useState<number>(2000);
  const [isGenerating, setIsGenerating] = useState(false);

  const proofs = useDbQuery(db.proofs.list, address);
  const documents = useDbQuery(db.documents.list, address);
  const saveProofMutation = useDbMutation(db.proofs.save);
  const logActivityMutation = useDbMutation(db.activity.log);

  const [selectedTemplate, setSelectedTemplate] = useState("Age Verification (> 18)");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isVerifyingOnChain, setIsVerifyingOnChain] = useState(false);

  const handleGenerateProof = async () => {
    if (!address) return;
    
    setIsGenerating(true);
    try {
      const userInput: Record<string, string | number> = {};
      
      if (selectedTemplate === "Age Verification (> 18)") {
        userInput.birthYear = birthYear;
      }

      if (selectedDocumentId) {
        const doc = documents?.find((d: any) => d._id === selectedDocumentId);
        if (doc) userInput.docHash = doc.docHash;
      }

      // Generate ZK proof (client-side)
      const { generateProof } = await import("@/lib/zkProofService");
      const result = await generateProof(selectedTemplate, userInput);
      
      if (!result.locallyValid) {
        throw new Error("Generated proof failed local verification check.");
      }

      // Save to MongoDB (Status: local)
      await saveProofMutation({
        walletAddress: address,
        proofType: selectedTemplate,
        circuitName: "circuit_bn254 v1.0",
        proofJson: JSON.stringify(result.proof),
        publicSignals: JSON.stringify(result.publicSignals),
        vkeyHash: result.vkeyHash,
        sourceDocumentId: selectedDocumentId as any || undefined,
        status: "local"
      });

      await logActivityMutation({
        walletAddress: address,
        eventType: "proof_generated",
        description: `Generated ${selectedTemplate} ZK-proof locally.`,
      });

      alert("ZK-Proof generated locally! You can now verify it on-chain.");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message || "Failed to generate proof"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyOnChain = async (proofId: string) => {
    if (!address || !algorand) return;
    const proof = proofs?.find((p: any) => p._id === proofId);
    if (!proof) return;

    try {
      setIsGenerating(true); // Re-use loading state
      const { encodeGroth16Bn254ProofForAlgo } = await import("@/lib/zkAlgoUtils");
      const proofObj = JSON.parse(proof.proofJson);
      const encoded = await encodeGroth16Bn254ProofForAlgo(proofObj);
      
      console.log("Encoded proof for AVM:", {
        piA: { type: encoded.piA.constructor.name, length: encoded.piA.length },
        piB: { type: encoded.piB.constructor.name, length: encoded.piB.length },
        piC: { type: encoded.piC.constructor.name, length: encoded.piC.length }
      });
      
      const verifierClient = new ZkVerifierClient({
        appId: BigInt(VERIFIER_APP_ID),
        algorand
      });

      const signals = JSON.parse(proof.publicSignals).map((s: string) => BigInt(s));

      setIsVerifyingOnChain(true);

      const chainResult = await verifierClient.newGroup()
        .verifyProof({
          sender: address,
          extraFee: algokit.microAlgos(165000),
          note: `ZK Verification ${Date.now()}`,
          args: {
            proof: {
              piA: encoded.piA,
              piB: encoded.piB,
              piC: encoded.piC
            },
            publicSignals: signals
          }
        })
        .send();
      const txId = chainResult.txIds[0];
      console.log("On-chain verification successful! TxID:", txId);

      // Update proof status in DB
      const updateProofMutation = await fetch("/api/proofs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proofId, status: "on-chain", txId })
      });

      if (!updateProofMutation.ok) throw new Error("Failed to update status");

      await logActivityMutation({
        walletAddress: address,
        eventType: "proof_verified",
        description: `Mathematically verified ${proof.proofType} proof on Algorand Testnet.`,
        txId: txId
      });

      alert("Success! Proof verified on Algorand Blockchain.");
    } catch (err: any) {
      console.error("On-chain verification failed:", err);
      // Give more specific error message if it looks like a selector mismatch
      const errorMessage = err.message?.includes("err opcode executed") 
        ? "Verification failed (Selector Mismatch). Please check if your VERIFIER_APP_ID is correct and points to the right contract version."
        : `On-chain verification failed: ${err.message || "Unknown error"}`;
      alert(errorMessage);
    } finally {
      setIsVerifyingOnChain(false);
      setIsGenerating(false);
    }
  };

  const handleShareProof = async (proofId: string) => {
    const proof = proofs?.find((p: any) => p._id === proofId);
    if (!proof) return;
    await navigator.clipboard.writeText(proof.proofJson);
    alert("Proof JSON copied to clipboard!");
  };

  const handleInspectProof = (proofId: string) => {
    const proof = proofs?.find((p: any) => p._id === proofId);
    if (!proof) return;
    console.log("Proof details:", {
      type: proof.proofType,
      publicSignals: JSON.parse(proof.publicSignals),
      proofBody: JSON.parse(proof.proofJson),
      vkeyHash: proof.vkeyHash,
      status: proof.status,
      generatedAt: new Date(proof.generatedAt).toISOString(),
    });
    alert("Proof details logged to console (F12) for inspection.");
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
                        {p.vkeyHash ? p.vkeyHash.substring(0, 32) + "..." : p._id.substring(0, 32) + "..."}
                      </code>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4">
                      {p.status === "on-chain" ? (
                        <a 
                          href={`https://testnet.explorer.perawallet.app/tx/${p.txId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-2 rounded-full bg-green-500/10 text-green-400 text-xs font-bold font-headline uppercase tracking-wider border border-green-500/20 hover:bg-green-500/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                          View on Explorer
                        </a>
                      ) : (
                        <button 
                          onClick={() => handleVerifyOnChain(p._id)}
                          disabled={isGenerating}
                          className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-black text-xs font-bold font-headline uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                        >
                          <span className="material-symbols-outlined text-sm">link</span>
                          Verify on Algorand
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleShareProof(p._id)}
                        className="flex items-center gap-2 px-6 py-2 rounded-full bg-surface-container-highest text-xs font-bold font-headline uppercase tracking-wider hover:bg-outline-variant/30 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">share</span>
                        Share
                      </button>
                      <button 
                        onClick={() => handleInspectProof(p._id)}
                        className="flex items-center gap-2 px-6 py-2 rounded-full border border-outline-variant/20 text-xs font-bold font-headline uppercase tracking-wider hover:border-primary/50 transition-all text-on-surface-variant hover:text-on-surface"
                      >
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
                  <select 
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option>Age Verification (&gt; 18)</option>
                    <option>Document Hash Proof</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">Select Source Document</label>
                  <select 
                    value={selectedDocumentId ?? ""}
                    onChange={(e) => setSelectedDocumentId(e.target.value || null)}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="">Manual Input (No Document)</option>
                    {documents?.map((doc: any) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.docName} ({doc.docType})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate === "Age Verification (> 18)" && (
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
                )}

                <button
                  onClick={handleGenerateProof}
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

      {isVerifyingOnChain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-card p-12 rounded-[2.5rem] border border-primary/30 max-w-sm w-full text-center space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">account_balance</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Algorand Settlement</h3>
              <p className="text-on-surface-variant text-sm font-light leading-relaxed">
                Communicating with the blockchain... <br />
                Verifying ZK-proof constraints on-chain.
              </p>
            </div>
            <div className="flex justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        </div>
      )}

      {isVerifyingOnChain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-card p-12 rounded-[2.5rem] border border-primary/30 max-w-sm w-full text-center space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">account_balance</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Algorand Settlement</h3>
              <p className="text-on-surface-variant text-sm font-light leading-relaxed">
                Communicating with the blockchain... <br />
                Verifying ZK-proof constraints on-chain.
              </p>
            </div>
            <div className="flex justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .glass-card {
          background: rgba(31, 31, 40, 0.4);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}

