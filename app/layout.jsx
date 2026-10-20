import './globals.css';

export const metadata = {
  metadataBase: new URL('https://ai.webguruji.online'),
  title: {
    default: 'GuruAI — AI Chat Assistant',
    template: '%s | GuruAI',
  },
  description:
    'Experience intelligent conversation with NVIDIA Nemotron 3 Ultra 550B and hyper-realistic AI image generation powered by Stable Diffusion XL on GuruAI by HarshGuruJi.',
  keywords: [
    'GuruAI',
    'Guru AI Chatbot',
    'HarshGuruJi AI',
    'AI Assistant India',
    'NVIDIA Nemotron 3 Ultra 550B',
    'Stable Diffusion XL',
    'NVIDIA NIM AI',
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
    title: 'GuruAI — AI Chat Assistant',
    description:
      'Supercharge your productivity with GuruAI: intelligent conversational AI powered by NVIDIA Nemotron 3 Ultra 550B and high-resolution Stable Diffusion XL image generation by HarshGuruJi.',
    siteName: 'GuruAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GuruAI Chatbot Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GuruAI — AI Chat Assistant',
    description:
      'Chat with NVIDIA Nemotron 3 Ultra 550B and generate high-resolution art with Stable Diffusion XL on GuruAI.',
    creator: '@harshguruji',
    images: ['/og-image.png'],
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
      </head>
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
