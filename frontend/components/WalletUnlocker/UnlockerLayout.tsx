import React from "react"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  makeStyles,
  TextField,
} from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  cardContent: {
    "& .MuiTextField-root": {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  },
}))

export interface UnlockerLayoutProps {
  accountName: string
  passphrase: string
  setAccountName(accountName: string): void
  setPassphrase(passphrase: string): void
  onUnlock(): void
}

export function UnlockerLayout(props: UnlockerLayoutProps) {
  const {
    accountName,
    passphrase,
    setAccountName,
    setPassphrase,
    onUnlock,
  } = props
  const styles = useStyles()

  return (
    <Card>
      <CardHeader title="Unlock Wallet" />
      <CardContent className={styles.cardContent}>
        <TextField
          fullWidth
          variant="outlined"
          label="Wallet Account Name"
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
        />

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
        <Button color="primary" onClick={onUnlock}>
          Unlock or Create Wallet
        </Button>
      </CardActions>
    </Card>
  )
}
