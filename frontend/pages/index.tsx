import React from 'react';
import { Layout } from "../components/Layout";
import { Button } from "@material-ui/core";
import Head from 'next/head';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>XDV Universal Wallet</title>
      </Head>

      <Button color="primary">Hello World</Button>
    </Layout>
  )
}
