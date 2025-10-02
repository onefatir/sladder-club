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
                <title>Phaser Nextjs Template</title>
                <meta name="description" content="A Phaser 3 Next.js project template that demonstrates Next.js with React communication and uses Vite for bundling." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className={`${styles.main} ${pixelify.className}`}>
                <AppWithoutSSR />
            </main>
        </>
    );
}
