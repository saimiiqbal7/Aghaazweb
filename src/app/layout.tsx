import type { Metadata } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-urdu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aghaaz — The Aghaaz Flight",
  description: "Take the Aghaaz Flight",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${nastaliq.variable}`}
        style={{
          background: "linear-gradient(160deg, #095c34 0%, #074C2B 40%, #021c0f 100%)",
          backgroundAttachment: "fixed",
          color: "#ffffff",
        }}
      >
        <div className="grid-bg" />
        <div className="grid-perspective" />
        <div className="glow-orb" />
        <div className="stars" />
        <div className="vignette" />
        {children}
      </body>
    </html>
  );
}
