import React, { useState } from "react"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  TextField,
} from "@material-ui/core"

export interface WalletUnlockerProps {
  containerClassName?: string
}

export function WalletUnlocker(props: WalletUnlockerProps) {
  const [passphrase, setPassphrase] = useState<string>("")

  async function onClick() {
    alert("Password received")
  }

  return (
    <Card className={props.containerClassName}>
      <CardHeader title="Unlock Wallet" />
      <CardContent>
        <TextField
          fullWidth
          type="password"
          variant="outlined"
          label="Wallet Passphrase"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
        />
      </CardContent>

      <CardActions>
        <Button color="primary" onClick={onClick}>
          Unlock Wallet
        </Button>
      </CardActions>
    </Card>
  )
}
