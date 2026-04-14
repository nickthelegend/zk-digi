"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useDbQuery } from "@/hooks/useDb";
import { db } from "@/lib/db";
import { useParams } from "next/navigation";

export default function SharedConsentPage() {
  const params = useParams();
  const appId = params.appId as string;
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<"success" | "idle">("idle");
  const [showProofData, setShowProofData] = useState(false);

  // We fetch consents and proofs (in a real app, this would be a public endpoint fetching the specific shared record)
  // For the demo, we'll try to find a consent that matches this appId across the current wallet's scopes
  const { address } = { address: "0xMockAddressForDemo" }; // Mocked for public view
  
  // We'll simulate fetching the public data needed to verify the consent
  const [consentData, setConsentData] = useState<any>(null);

  useEffect(() => {
    // Mocking finding the consent data
    setTimeout(() => {
      setConsentData({
        appName: "HDFC Bank (Demo)",
        appId: appId,
        proofTypes: ["age_verification"],
        purpose: "KYC Onboarding",
        status: "active",
        lastUpdated: Date.now(),
        proofJson: JSON.stringify({
          pi_a: ["123", "456", "1"],
          pi_b: [["1", "2"], ["3", "4"], ["1", "0"]],
          pi_c: ["789", "012", "1"],
          protocol: "groth16",
          curve: "bn128"
        }, null, 2),
        publicSignals: JSON.stringify(["1"])
      });
    }, 500);
  }, [appId]);

  const handleVerify = async () => {
    setIsVerifying(true);
    // Simulate complex zero-knowledge verification
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult("success");
    }, 2500);
  };

  if (!consentData) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-8 max-w-4xl mx-auto">
        <div className="mb-12 text-center">
           <div className="w-20 h-20 rounded-[2rem] bg-surface-container-highest flex items-center justify-center text-primary shadow-lg shadow-primary/20 mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl font-bold">verified_user</span>
           </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Zero-Knowledge Consent Proof
          </h1>
          <p className="text-on-surface-variant text-lg">
            A mathematically verifiable proof that requirements are met.
          </p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
          {verificationResult === "success" && (
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_#22c55e]"></div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-label uppercase tracking-widest text-outline font-bold mb-2">Recipient Application</h3>
                <div className="text-xl font-headline font-bold text-white">{consentData.appName}</div>
              </div>

              <div>
                <h3 className="text-[10px] font-label uppercase tracking-widest text-outline font-bold mb-2">Verified Claims</h3>
                <div className="flex flex-wrap gap-2">
                  {consentData.proofTypes.map((pt: string) => (
                    <span key={pt} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">
                      {pt.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-[10px] font-label uppercase tracking-widest text-outline font-bold mb-2">Cryptographic Details</h3>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                   <li className="flex items-center justify-between border-b border-outline-variant/5 pb-2">
                     <span>Protocol</span>
                     <span className="font-mono text-white">Groth16 BN254</span>
                   </li>
                   <li className="flex items-center justify-between border-b border-outline-variant/5 pb-2">
                     <span>App ID (Algorand)</span>
                     <span className="font-mono text-white">{consentData.appId}</span>
                   </li>
                   <li className="flex items-center justify-between border-b border-outline-variant/5 pb-2">
                     <span>Status</span>
                     <span className="text-green-400 font-bold uppercase text-[10px] tracking-widest px-2 py-1 bg-green-400/10 rounded-md">Valid</span>
                   </li>
                </ul>
              </div>

            </div>

             <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 flex flex-col justify-between">
                <div className="mb-8">
                   <h3 className="text-lg font-headline font-bold text-white mb-2">Verify zk-SNARK</h3>
                   <p className="text-sm text-on-surface-variant">
                     Anyone can verify this mathematical proof without exposing the underlying private data.
                   </p>
                </div>

                <div className="space-y-4">
                  {verificationResult === "success" ? (
                    <div className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-center font-bold flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      MATHEMATICALLY VERIFIED
                    </div>
                  ) : (
                    <button 
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="w-full py-4 rounded-2xl bg-primary text-black font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          VERIFYING EQUATIONS...
                        </>
                      ) : (
                        "VERIFY PROOF NOW"
                      )}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setShowProofData(!showProofData)}
                    className="w-full py-3 text-xs font-bold uppercase tracking-widest text-outline hover:text-on-surface transition-colors"
                  >
                    {showProofData ? "Hide Raw Proof Data" : "View Raw Proof Data"}
                  </button>
                </div>
             </div>
          </div>

          {showProofData && (
            <div className="mt-8 pt-8 border-t border-outline-variant/10 animate-in slide-in-from-top-4 duration-300">
               <h3 className="text-[10px] font-label uppercase tracking-widest text-outline font-bold mb-4">Raw JSON Output</h3>
               <pre className="bg-[#0D0D12] p-6 rounded-2xl text-xs text-primary-dim font-mono overflow-x-auto border border-outline-variant/5 shadow-inner">
                 {consentData.proofJson}
               </pre>
            </div>
          )}
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
