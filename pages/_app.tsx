import "antd/dist/reset.css";
import "../styles/globals.css";

import { ConfigProvider } from "antd";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import React, { ReactElement, ReactNode } from "react";

import AdminLayout from "../components/layout/layout";
import { primaryColor } from "../utils/constant";
import { convertRoutePathToArray } from "../utils/function";

import type { AppProps } from "next/app";
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();

  /// Only get 3 first value from array
  const arrPathname = convertRoutePathToArray(router.pathname)
    .slice(0, 3)
    .map((val) => (val[0]?.toUpperCase() ?? "") + val.slice(1));

  ConfigProvider.config({
    theme: {
      primaryColor: primaryColor,
    },
  });

  const getLayout =
    Component.getLayout ?? ((page) => <AdminLayout>{page}</AdminLayout>);

  return getLayout(
    <>
      <Head>
        <title>{arrPathname.join(" - ")}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <NextNProgress />

      <ConfigProvider
        theme={{
          token: {
            colorPrimary: primaryColor,
          },
        }}
      >
        <Component {...pageProps} />
      </ConfigProvider>
    </>
  );
}
