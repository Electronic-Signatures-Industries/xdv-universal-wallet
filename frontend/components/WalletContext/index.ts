import { Wallet } from "@xdvplatform/universal-wallet-core";
import { createContext } from "react";

export interface IWalletContext {
  wallet: Wallet
}

export const WalletContext = createContext<IWalletContext>({
  wallet: new Wallet({ isWeb: true })
});
