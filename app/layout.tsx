import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobTracker CRM",
  description: "A CRM system for job seekers to manage their job search process",
};

/**
 * Root layout component
 * Provides global styles and metadata for all pages
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <main>{children}</main>
      </body>
    </html>
  );
}
