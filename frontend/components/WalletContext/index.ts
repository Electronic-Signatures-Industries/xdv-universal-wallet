import { Wallet } from "@xdvplatform/universal-wallet-core"
import { createContext } from "react"
import { IWalletContext } from "./IWalletContext"

function emptyFunction(): boolean {
  return true
}

export const DefaultWalletState: IWalletContext = {
  wallet: new Wallet({ isWeb: true }),
  setWalletId: emptyFunction,
  setIPLDManager: emptyFunction,
}

export const WalletContext = createContext<IWalletContext>(DefaultWalletState)
