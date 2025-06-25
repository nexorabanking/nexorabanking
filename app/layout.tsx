import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nexora Banking',
  description: 'Nexora Banking',
  generator: 'Nexora Banking',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0a0a0f', color: 'white' }}>{children}</body>
    </html>
  )
}
