import React from "react"
import { Layout } from "../components/Layout"
import { Container, makeStyles } from "@material-ui/core"
import Head from "next/head"
import { WalletUnlocker } from "../components/WalletUnlocker"
import { WalletCreator } from "../components/WalletCreator"

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridGap: theme.spacing(2),
  },
}))

export default function Home() {
  const styles = useStyles()

  return (
    <Layout>
      <Head>
        <title>XDV Universal Wallet</title>
      </Head>

      <Container className={styles.container}>
        <WalletUnlocker />
        <WalletCreator />
      </Container>
    </Layout>
  )
}
