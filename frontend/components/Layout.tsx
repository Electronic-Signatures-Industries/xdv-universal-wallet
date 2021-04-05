import { IPLDManager, Wallet } from "@xdvplatform/universal-wallet-core"
import React, { PropsWithChildren, useState } from "react"
import { ActionBar } from "./ActionBar"
import { WalletContext } from "./WalletContext"

export interface LayoutProps {}

export function Layout({ children }: PropsWithChildren<LayoutProps>) {
  const [wallet, _] = useState<Wallet>(new Wallet({ isWeb: true }))
  const [walletId, setWalletId] = useState<string | null>()
  const [ipldManager, setIPLDManager] = useState<IPLDManager | null>()

  return (
    <WalletContext.Provider
      value={{ wallet, ipldManager, walletId, setIPLDManager, setWalletId }}
    >
      <main>
        <ActionBar />
        {children}
      </main>
    </WalletContext.Provider>
  )
}
