import { IPLDManager, Wallet } from "@xdvplatform/universal-wallet-core"

export interface IWalletContext {
  wallet: Wallet
  ipldManager?: IPLDManager
  walletId?: string
  setIPLDManager(manager?: IPLDManager): void
  setWalletId(id: string): void
}
