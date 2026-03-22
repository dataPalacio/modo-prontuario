import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // =========================================================================
  // Turbopack — define root explícito para evitar warning de lockfile múltiplo
  // O aviso ocorre porque C:\git-clones também tem um package-lock.json
  // =========================================================================
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  // =========================================================================
  // Headers de Segurança — Prontuário HOF
  // Proteção contra XSS, Clickjacking, MIME sniffing, etc.
  // =========================================================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: 'self' + inline necessário para Next.js hydration
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Estilos: inline necessário para CSS-in-JS / globals
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Imagens: data: para base64 de assinaturas e fotos
              "img-src 'self' data: blob: https:",
              // APIs: próprio servidor + Supabase + Uploadthing
              "connect-src 'self' https://*.supabase.co https://uploadthing.com https://utfs.io",
              // Frames: bloquear completamente (proteção clickjacking)
              "frame-ancestors 'none'",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },

          // Proteção contra Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          // Prevenção de MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },

          // Referrer Policy — não vazar URL para terceiros
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },

          // HSTS — forçar HTTPS por 1 ano (ativar apenas em produção)
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),

          // Permissions Policy — bloquear recursos desnecessários
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'interest-cohort=()',
            ].join(', '),
          },

          // Cross-Origin Opener Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },

          // Cross-Origin Resource Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
