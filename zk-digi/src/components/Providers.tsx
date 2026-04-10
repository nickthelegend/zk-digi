'use client'

import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import '@txnlab/use-wallet-ui-react/dist/style.css'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { WalletContextProvider } from '@/context/WalletContext'

const walletManager = new WalletManager({
  wallets: [WalletId.PERA, WalletId.DEFLY, WalletId.LUTE],
  defaultNetwork: NetworkId.TESTNET,
})

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <WalletProvider manager={walletManager}>
        <WalletUIProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </WalletUIProvider>
      </WalletProvider>
    </ConvexProvider>
  )
}
