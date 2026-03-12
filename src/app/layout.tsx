import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-urdu",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Aghaaz — Matric & FSc Video Lessons, Quizzes & AI Tutor",
  description:
    "10-minute video lessons with built-in quizzes and Blitz AI tutor. Built for Pakistani Matric and FSc students. PKR 2,000/month.",
  icons: { icon: "/aghaaz-logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/ethnocentric.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/mehr/mehr-font.css"
        />
      </head>
      <body
        className={`${inter.className} ${nastaliq.variable}`}
        style={{
          background:
            "linear-gradient(165deg, #0a4a2e 0%, #063b22 20%, #042e1a 45%, #021810 75%, #010d08 100%)",
          backgroundAttachment: "fixed",
          color: "#ffffff",
        }}
      >
        {/* Fixed minimal header */}
        <div className="fixed top-3 left-0 right-0 z-50 flex items-center justify-between px-6 py-3" id="global-header">
          <a
            href="/login"
            className="text-sm font-medium px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all"
          >
            Sign in
          </a>
        </div>

        <div className="aurora-bg">
          <div className="aurora-blob blob-1" />
          <div className="aurora-blob blob-2" />
          <div className="aurora-blob blob-3" />
        </div>
        <div className="glow-orb" />
        <div className="aurora-noise" />
        <div className="stars" />
        <div className="particles" />
        <div className="vignette" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
  document.addEventListener('visibilitychange', function() {
    document.querySelectorAll('.aurora-blob').forEach(function(el) {
      el.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  });
`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
