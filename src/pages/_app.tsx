import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Panorama Viewer</title>
        <meta
          name="description"
          content="Interactive 3D panorama tour with floor navigation"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/panorama-viewer-icon.png"
        />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
