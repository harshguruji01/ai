import './globals.css';

export const metadata = {
  metadataBase: new URL('https://ai.webguruji.online'),
  title: {
    default: 'GuruAI – Free AI Chat Assistant for Students | HarshGuruJi',
    template: '%s | GuruAI',
  },
  description:
    'Ask GuruAI anything and get simple, clear answers in Hindi and English. Free AI chat assistant for study, general knowledge and daily questions.',
  keywords: [
    'GuruAI',
    'GuruAI Chatbot',
    'HarshGuruJi AI',
    'AI Assistant India',
    'Guru-Flash 1.1',
    'Stable Diffusion XL',
    'Hinglish AI Chatbot',
    'Generative AI Platform',
  ],
  authors: [{ name: 'HarshGuruJi', url: 'https://webguruji.online' }],
  creator: 'HarshGuruJi',
  publisher: 'HarshGuruJi',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://ai.webguruji.online',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai.webguruji.online',
    title: 'GuruAI – Free AI Chat Assistant',
    description:
      'Chat with GuruAI for instant, simple answers on study, technology and general knowledge.',
    siteName: 'GuruAI',
    images: [
      {
        url: 'https://ai.webguruji.online/guruai-chat-assistant.webp',
        width: 1200,
        height: 630,
        alt: 'GuruAI chat assistant interface preview - Free online study and coding assistant in Hindi and English',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GuruAI – Free AI Chat Assistant',
    description:
      'Chat with GuruAI for instant, simple answers on study, technology and general knowledge.',
    creator: '@harshguruji',
    images: ['https://ai.webguruji.online/guruai-chat-assistant.webp'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#090d16',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

