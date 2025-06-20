import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runtime Google Fonts loading (prevents build-time errors) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist&family=Geist+Mono&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-geist-sans: 'Geist', sans-serif;
            --font-geist-mono: 'Geist Mono', monospace;
          }
        `}</style>
      </head>
      <body className="antialiased" style={{ fontFamily: "var(--font-geist-sans)" }}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
