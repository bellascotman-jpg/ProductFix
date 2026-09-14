import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StoreFix AI — Find what’s costing your store sales',
  description: 'AI-powered e-commerce store audits that turn visible conversion problems into clear, prioritized fixes.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
