import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Domovník Admin',
  description: 'Správa systému Domovník',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
    </html>
  )
}
