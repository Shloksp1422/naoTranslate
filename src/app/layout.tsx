import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nao Translate",
  description: "Created by Shlok Patel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* ✅ Global Footer Added Here */}
        <footer className="footer">
          <p>Created by <strong>Shlok Jayesh Patel</strong></p>
          <p>
            <a
              href="https://www.linkedin.com/in/shlokpatel140202/"
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin-link"
            >
              Connect on LinkedIn
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
