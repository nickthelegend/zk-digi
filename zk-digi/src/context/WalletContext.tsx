"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useDbMutation } from "@/hooks/useDb";
import { db } from "@/lib/db";
import algosdk from "algosdk";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  algodClient: algosdk.Algodv2;
  algorand: AlgorandClient;
  activeWallet: any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const ALGORAND_NETWORK = process.env.NEXT_PUBLIC_ALGORAND_NETWORK || "localnet";
const ALGOD_URL = ALGORAND_NETWORK === "localnet" ? "http://localhost:4001" : "https://testnet-api.algonode.cloud";
const ALGOD_TOKEN = ALGORAND_NETWORK === "localnet" ? "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" : "";
const ALGOD_PORT = ALGORAND_NETWORK === "localnet" ? 4001 : 443;

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const { activeAddress, activeWallet, transactionSigner } = useWallet();
  const isConnected = !!activeAddress;
  const connectWalletMutation = useDbMutation(db.wallets.connect);
  const logActivityMutation = useDbMutation(db.activity.log);

  const algodClient = useMemo(() => {
    return new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT);
  }, []);

  const algorand = useMemo(() => {
    const client = ALGORAND_NETWORK === "localnet" 
      ? AlgorandClient.defaultLocalNet() 
      : AlgorandClient.testNet();
      
    if (activeAddress) {
      client.setSigner(activeAddress, transactionSigner);
    }
    return client;
  }, [activeAddress, transactionSigner]);

  useEffect(() => {
    if (isConnected && activeAddress) {
      connectWalletMutation({
        address: activeAddress,
        network: ALGORAND_NETWORK as any,
      });
      
      logActivityMutation({
        walletAddress: activeAddress,
        eventType: "wallet_connected",
        description: `Connected to ${activeWallet?.metadata?.name || "Algorand Wallet"}`,
      });
    }
  }, [isConnected, activeAddress, activeWallet?.metadata?.name]);

  const value = {
    address: activeAddress || null,
    isConnected: isConnected,
    algodClient,
    algorand,
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
