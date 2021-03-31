import { Wallet } from "@xdvplatform/universal-wallet-core";
import React, { PropsWithChildren, useState } from "react";
import { ActionBar } from "./ActionBar";
import { WalletContext } from "./WalletContext";

export interface LayoutProps { }

export function Layout({ children }: PropsWithChildren<LayoutProps>) {
  const [wallet, setWallet] = useState<Wallet>(new Wallet({ isWeb: true }))

  return (
    <WalletContext.Provider value={{ wallet }}>
      <main>
        <ActionBar />
        {children}
      </main>
    </WalletContext.Provider>
  )
}
