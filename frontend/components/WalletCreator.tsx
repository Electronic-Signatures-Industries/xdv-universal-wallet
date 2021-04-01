import { Card, CardContent, CardHeader } from "@material-ui/core"
import React from "react"

export interface WalletCreatorProps {
  containerClassName?: string
}

export function WalletCreator(props: WalletCreatorProps) {
  return (
    <Card className={props.containerClassName}>
      <CardHeader title="Create new Wallet" />

      <CardContent>
        <pre>Under Construction</pre>
      </CardContent>
    </Card>
  )
}
