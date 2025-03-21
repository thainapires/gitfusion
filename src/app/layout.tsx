import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Noto_Color_Emoji } from "next/font/google";
import "./globals.css";

const notoColorEmoji = Noto_Color_Emoji({
  variable: "--font-emoji",
  subsets: ["emoji"],
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Git Fusion",
  description: "Merged contributions graph",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoColorEmoji.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}> 
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
