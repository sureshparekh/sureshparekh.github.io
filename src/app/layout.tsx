import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sureshparekh.github.io"),
  title: "Suresh Parekh | Computational Astrophysicist",
  description: "Portfolio of Suresh Parekh, PhD Student in Astrophysics at UFRGS. Specializing in computational astrophysics, GPU algorithms, Active Galactic Nuclei, and developing the BRAIN tool for massive datacubes like JWST and MaNGA.",
  keywords: [
    "Suresh Parekh",
    "Astrophysicist",
    "Computational Astrophysics",
    "UFRGS",
    "BRAIN tool",
    "JWST",
    "MaNGA dataset",
    "Active Galactic Nuclei",
    "Stellar Population Synthesis",
    "GPU algorithms in astronomy",
    "Cosmology",
  ],
  authors: [{ name: "Suresh Parekh", url: "https://sureshparekh.github.io" }],
  creator: "Suresh Parekh",
  openGraph: {
    title: "Suresh Parekh | Computational Astrophysicist",
    description: "Architecting the Cosmos. PhD Student in Astrophysics at UFRGS developing high-performance inference engines.",
    url: "https://sureshparekh.github.io",
    siteName: "Suresh Parekh Academic Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suresh Parekh | Computational Astrophysicist",
    description: "Architecting the Cosmos. PhD Student in Astrophysics at UFRGS.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Suresh Parekh",
    jobTitle: "Computational Astrophysicist",
    url: "https://sureshparekh.github.io",
    affiliation: {
      "@type": "Organization",
      name: "UFRGS, Brazil",
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Savitribai Phule Pune University",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "St. Xavier's College",
      },
    ],
    sameAs: [
      "https://scholar.google.com/citations?user=E2m8pzwAAAAJ&hl=en",
      "https://ui.adsabs.harvard.edu/search/q=author%3A%22Parekh%2C%20Suresh%22&sort=date%20desc%2C%20bibcode%20desc&p_=0",
    ],
  };

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
