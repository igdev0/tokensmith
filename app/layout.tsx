import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.scss";
import {Theme} from '@radix-ui/themes';
import Head from 'next/head';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Solana Coin Generator",
  description: "A solana token generator based on program 2022",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <Head>
        <link rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48"/>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <link rel="shortcut icon" href="/favicon.ico"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <meta name="apple-mobile-web-app-title" content="Solana coin generator"/>
        <link rel="manifest" href="/site.webmanifest"/>
      </Head>
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Theme appearance="dark" accentColor="purple" scaling="110%">
        {children}
      </Theme>
      </body>
      </html>
  );
}
