import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';

const APP_NAME = "Tareas";
const APP_DEFAULT_TITLE = "Tareas - Kanban";
const APP_TITLE_TEMPLATE = "%s - Tareas";
const APP_DESCRIPTION = "Organiza tu vida con tableros Kanban simples y elegantes";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased preload">
        <FirebaseClientProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                document.body.classList.remove('preload');
              }, 100);
            `
          }}
        />
      </body>
    </html>
  );
}
