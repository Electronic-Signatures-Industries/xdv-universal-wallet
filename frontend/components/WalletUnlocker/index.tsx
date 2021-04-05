import React, { useContext, useState } from "react"
import { WalletContext } from "../WalletContext"
import { UnlockerLayout } from "./UnlockerLayout"

export interface WalletUnlockerProps {}

export function WalletUnlocker(props: WalletUnlockerProps) {
  const [accountName, setAccountName] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const { wallet } = useContext(WalletContext)

  async function onUnlock() {
    try {
      await wallet.open(accountName, passphrase)
      const account = await wallet.getAccount()
      if (!account) {
        await wallet.enrollAccount({
          accountName,
          passphrase,
        })
        await wallet.addWallet()
      }
    } catch (e) {
      alert("Incorrect Credentials. Please try again")
    }
  }

  return (
    <UnlockerLayout
      accountName={accountName}
      passphrase={passphrase}
      setAccountName={setAccountName}
      setPassphrase={setPassphrase}
      onUnlock={onUnlock}
    />
  )
}
