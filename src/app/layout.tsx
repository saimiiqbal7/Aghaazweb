import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aghaaz — The End of Boring Lectures',
  description: 'Interactive 10-minute lessons for Pakistani Matric and FSc students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/ethnocentric.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
