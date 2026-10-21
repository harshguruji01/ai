import './globals.css';

export const metadata = {
  metadataBase: new URL('https://ai.webguruji.online'),
  title: {
    default: 'GuruAI — AI Chat Assistant',
    template: '%s | GuruAI',
  },
  description:
    'Experience intelligent conversation with Guru-Flash 1.1 and hyper-realistic AI image generation powered by Stable Diffusion XL on GuruAI by HarshGuruJi.',
  keywords: [
    'GuruAI',
    'Guru AI Chatbot',
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
    title: 'GuruAI — AI Chat Assistant',
    description:
      'Supercharge your productivity with GuruAI: intelligent conversational AI powered by Guru-Flash 1.1 and high-resolution Stable Diffusion XL image generation by HarshGuruJi.',
    siteName: 'GuruAI',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'GuruAI Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'GuruAI — AI Chat Assistant',
    description:
      'Chat with Guru-Flash 1.1 and generate high-resolution art with Stable Diffusion XL on GuruAI.',
    creator: '@harshguruji',
    images: ['/logo.png'],
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
        {/* Hostinger Reach Onsite Tracking */}
        <script src="https://cdn-reach.hostinger.com/js/embed.js" async></script>
      </body>
    </html>
  );
}

