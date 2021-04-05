import React from "react"
import { Layout } from "../../components/Layout"
import { Container, makeStyles } from "@material-ui/core"
import Head from "next/head"
import { WalletUnlocker } from "../../components/WalletUnlocker"

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridGap: theme.spacing(2),
  },
}))

export function Login() {
  const styles = useStyles()

  return (
    <Layout>
      <Head>
        <title>Login</title>
      </Head>

      <Container className={styles.container}>
        <WalletUnlocker />
      </Container>
    </Layout>
  )
}
