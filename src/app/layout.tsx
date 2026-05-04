import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spirit Arc | Systems Architecture Builder",
  description: "High-performance systems architecture design tool developed by Mohammad Saeed Angiz.",
  authors: [{ name: "Mohammad Saeed Angiz" }],
  creator: "Mohammad Saeed Angiz",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="developer" content="Mohammad Saeed Angiz" />
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body>
        {children}
        <div className="developer-signature">
          Developed by Mohammad Saeed Angiz
        </div>
      </body>
    </html>
  );
}
