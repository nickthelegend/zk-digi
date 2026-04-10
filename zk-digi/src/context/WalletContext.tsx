"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import algosdk from "algosdk";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  algodClient: algosdk.Algodv2;
  activeWallet: any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const ALGOD_URL = "https://testnet-api.algonode.cloud";
const ALGOD_TOKEN = "";
const ALGOD_PORT = 443;

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const { activeAddress, isConnected, activeWallet } = useWallet();
  const connectWalletMutation = useMutation(api.wallets.connectWallet);
  const logActivityMutation = useMutation(api.activity.logActivity);

  const algodClient = useMemo(() => {
    return new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT);
  }, []);

  useEffect(() => {
    if (activeWallet?.isConnected && activeAddress) {
      connectWalletMutation({
        address: activeAddress,
        network: "testnet",
      });
      
      logActivityMutation({
        walletAddress: activeAddress,
        eventType: "wallet_connected",
        description: `Connected to ${activeWallet?.metadata.name || "Algorand Wallet"}`,
      });
    }
  }, [activeWallet?.isConnected, activeAddress, activeWallet?.metadata.name]);

  const value = {
    address: activeAddress || null,
    isConnected: !!activeWallet?.isConnected,
    algodClient,
    activeWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useZkWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useZkWallet must be used within a WalletContextProvider");
  }
  return context;
}
