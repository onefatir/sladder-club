import Head from "next/head";
import { Pixelify_Sans } from "next/font/google";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";

const pixelify = Pixelify_Sans({ subsets: ["latin"], weight: "400" });

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>Sladder Club</title>
                <meta name="description" content="A modern, interactive 'Snake and Ladders' inspired board game built with PhaserJS and Next.js. Experience the classic childhood game with beautiful custom artwork, smooth animations, and engaging gameplay mechanics." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#EAC7A3"></meta>

                <meta property="og:image:alt" content="Sladder Club - A modern Snake and Ladders inspired board game"></meta>
                <meta property="og:image:type" content="image/png"></meta>
                <meta property="og:image:width" content="1920"></meta>
                <meta property="og:image:height" content="1080"></meta>
                <meta property="og:image" content="https://sladder.onefatir.dev/opengraph-image.png"></meta>
                <meta property="og:title" content="Sladder Club"></meta>
                <meta property="og:description" content="A modern, interactive 'Snake and Ladders' inspired board game built with PhaserJS and Next.js. Experience the classic childhood game with beautiful custom artwork, smooth animations, and engaging gameplay mechanics."></meta>
                <meta property="og:type" content="website"></meta>
                <meta property="og:url" content="https://sladder.onefatir.dev"></meta>
                <meta property="og:site_name" content="Sladder Club"></meta>
            </Head>
            <main className={`${styles.main} ${pixelify.className}`}>
                <AppWithoutSSR />
            </main>
        </>
    );
}
