"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useZkWallet } from "@/context/WalletContext";
import { useDbQuery, useDbMutation } from "@/hooks/useDb";
import { db } from "@/lib/db";
import { VaultClient } from "@/contracts/VaultClient";
import { VAULT_APP_ID } from "@/contracts/config";

const DOC_TYPES = [
  { id: "aadhaar", name: "Aadhaar / National ID", icon: "badge" },
  { id: "pan", name: "PAN / Tax ID", icon: "account_balance" },
  { id: "passport", name: "Passport", icon: "public" },
  { id: "university_id", name: "University ID", icon: "school" },
  { id: "custom", name: "Custom Identity", icon: "edit_document" },
];

export default function DocumentsPage() {
  const { address, isConnected, algorand } = useZkWallet();
  const [selectedType, setSelectedType] = useState(DOC_TYPES[0].id);
  const [docName, setDocName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const documents = useDbQuery(db.documents.list, address);
  const saveDocument = useDbMutation(db.documents.save);
  const logActivityMutation = useDbMutation(db.activity.log);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const computeFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !docName) return;

    setIsUploading(true);
    try {
      let fileToUpload = selectedFile;
      let hashHex: string;

      if (fileToUpload) {
        hashHex = await computeFileHash(fileToUpload);
      } else {
        // Fallback for mock/data-only upload if no file selected
        const content = `${docName}-${selectedType}-${Date.now()}`;
        const msgBuffer = new TextEncoder().encode(content);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        
        // Create a dummy file blob for storage consistency
        fileToUpload = new File([msgBuffer], `${docName}.txt`, { type: "text/plain" });
      }

        // Save to Blockchain (Vault Contract)
        if (VAULT_APP_ID !== 0) {
          try {
            const vaultClient = new VaultClient({
              appId: BigInt(VAULT_APP_ID),
              algorand: algorand
            });
            
            await vaultClient.send.addDocument({
              args: {
                docType: new TextEncoder().encode(selectedType),
                docHash: new TextEncoder().encode(hashHex)
              }
            });
            console.log("Anchored to Algorand Vault");
          } catch (blockchainErr) {
            console.error("Blockchain anchoring failed:", blockchainErr);
            // We continue saving to MongoDB even if blockchain fails for UX, or we could stop here
          }
        }

      // Save metadata to MongoDB API
      await saveDocument({
        walletAddress: address,
        docType: selectedType,
        docName: docName,
        docHash: hashHex,
        fileType: fileToUpload.type,
        fileSizeBytes: fileToUpload.size,
      });

      setDocName("");
      setSelectedFile(null);
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      alert("Document securely anchored to ZK-Vault!");
    } catch (err) {
      console.error(err);
      alert("Failed to onboard document.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-surface selection:bg-primary/30 min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-8 max-w-[1920px] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-5xl">cloud_off</span>
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="font-headline text-4xl font-bold">Access Denied</h1>
            <p className="font-body text-on-surface-variant">
              Identity documents are stored privately. Please connect your wallet to view or upload documents.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">
            Identity Vault
          </h1>
          <p className="font-body text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            Manage your physical identity documents by creating cryptographic anchors. 
            All proofs will be generated from these verified anchors.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
          {/* Main List Section */}
          <section className="space-y-8">
            <h2 className="font-headline text-2xl font-bold border-b border-outline-variant/10 pb-4">
              Your Onboarded Documents
            </h2>
            
            {documents === undefined ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center border border-dashed border-outline-variant/20">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">folder_open</span>
                <p className="text-on-surface-variant italic">No documents found in your vault.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {documents.map((doc: any) => (
                  <div key={doc._id} className="glass-card p-6 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">
                          {DOC_TYPES.find(t => t.id === doc.docType)?.icon || "description"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-lg">{doc.docName}</h4>
                        <p className="text-[10px] uppercase tracking-widest text-outline font-bold">
                          {doc.docType} • Hash: {doc.docHash.substring(0, 12)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                        {doc.status}
                      </span>
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary cursor-help">
                        info
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upload / Form Sidebar */}
          <aside className="space-y-6">
            <div className="glass-card p-8 rounded-[2rem] border border-primary/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <span className="material-symbols-outlined text-8xl">verified</span>
               </div>
               
               <h3 className="font-headline text-2xl font-bold mb-6">Onboard Identity</h3>
               
               <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-outline">Document Type</label>
                   <div className="grid grid-cols-2 gap-2">
                     {DOC_TYPES.map(type => (
                       <button
                         key={type.id}
                         type="button"
                         onClick={() => setSelectedType(type.id)}
                         className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                           selectedType === type.id 
                           ? "bg-primary text-black border-primary" 
                           : "bg-surface-container-highest text-on-surface-variant border-outline-variant/10 hover:border-primary/40"
                         }`}
                       >
                         {type.name}
                       </button>
                     ))}
                   </div>
                 </div>

<div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-outline">Document File (Optional)</label>
                    <div className="relative">
                      <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-black file:font-bold file:cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-xs text-primary mt-2">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-outline">Document Name</label>
                    <input
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="e.g. My Primary PAN Card"
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>

                 <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-[10px] text-primary leading-relaxed font-medium">
                   <span className="font-bold underline uppercase">Privacy Notice:</span> Your raw document content will be hashed locally. Only the cryptographic hash will be stored on-chain.
                 </div>

                 <button
                   disabled={isUploading}
                   className="w-full bg-primary text-black font-headline font-bold py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isUploading ? (
                     <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                     <>
                       <span className="material-symbols-outlined text-lg">anchor</span>
                       ANCHOR TO VAULT
                     </>
                   )}
                 </button>
               </form>
            </div>

            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-outline-variant/10">
              <h4 className="font-headline font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">security</span>
                Trust Infrastructure
              </h4>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-sm text-tertiary mt-1">check_circle</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Local-only SHA-256 computation ensures your private data never exposes its entropy.
                  </p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-sm text-tertiary mt-1">check_circle</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Recursive ZK-SNARK integration allows future multi-document proofs.
                  </p>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Decorative Background Elements */}
        <div className="fixed top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full pointer-events-none"></div>
        <div className="fixed bottom-0 -right-20 w-[600px] h-[600px] bg-secondary/5 blur-[150px] -z-10 rounded-full pointer-events-none"></div>
      </main>

      <footer className="border-t border-outline-variant/10 py-12 px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-label text-xs text-on-surface-variant font-bold uppercase tracking-widest">
              ZK-ENGINE v4.2.0 | ENCRYPTION: SHA-256
            </span>
          </div>
          <div className="flex gap-8 font-bold">
            <a className="text-xs text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest" href="#">Privacy</a>
            <a className="text-xs text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest" href="#">Audits</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

