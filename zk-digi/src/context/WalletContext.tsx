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

const ALGOD_URL = "https://testnet-api.algonode.cloud";
const ALGOD_TOKEN = "";
const ALGOD_PORT = 443;

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const { activeAddress, activeWallet, transactionSigner } = useWallet();
  const isConnected = !!activeAddress;
  const connectWalletMutation = useDbMutation(db.wallets.connect);
  const logActivityMutation = useDbMutation(db.activity.log);

  const algodClient = useMemo(() => {
    return new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT);
  }, []);

  const algorand = useMemo(() => {
    const client = AlgorandClient.testNet();
    if (activeAddress) {
      client.setSigner(activeAddress, transactionSigner);
    }
    return client;
  }, [activeAddress, transactionSigner]);

  useEffect(() => {
    if (isConnected && activeAddress) {
      connectWalletMutation({
        address: activeAddress,
        network: "testnet",
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
