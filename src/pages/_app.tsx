import { Footer } from "@/components/root/footer";
import { Navbar } from "@/components/root/navbar";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { Space_Grotesk } from "next/font/google";
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={cn(spaceGrotesk.className, "flex min-h-screen flex-col")}>
      <Navbar />
      <div className="grow">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
  );
}
