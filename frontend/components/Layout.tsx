import React, { PropsWithChildren } from "react";
import { ActionBar } from "./ActionBar";

export interface LayoutProps { }

export function Layout({ children }: PropsWithChildren<LayoutProps>) {
  return (
    <main>
      <ActionBar />
      {children}
    </main>
  )
}
