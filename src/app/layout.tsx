import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prontuário HOF — Harmonização Orofacial',
  description:
    'Sistema de prontuário digital especializado em Harmonização Orofacial. Conforme CFM, CFO, CFBM e LGPD.',
  keywords: [
    'prontuário eletrônico',
    'harmonização orofacial',
    'HOF',
    'toxina botulínica',
    'ácido hialurônico',
    'prontuário digital',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
