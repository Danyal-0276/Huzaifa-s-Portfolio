import type { Metadata } from "next";
import PortfolioPage from "@/features/portfolio/components/portfolio-page";
import { absoluteUrl, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: `${siteConfig.name} Portfolio`,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [...siteConfig.keywords],
  category: "business",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const profileImageUrl = absoluteUrl(siteConfig.profileImage);

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${siteConfig.url}/#profile-page`,
  url: siteConfig.url,
  name: siteConfig.title,
  description: siteConfig.description,
  inLanguage: siteConfig.language,
  dateCreated: siteConfig.created,
  dateModified: siteConfig.lastModified,
  primaryImageOfPage: {
    "@type": "ImageObject",
    "@id": `${siteConfig.url}/#profile-image`,
    url: profileImageUrl,
    contentUrl: profileImageUrl,
    width: 1536,
    height: 1024,
    caption: siteConfig.name,
  },
  isPartOf: {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: `${siteConfig.name} Portfolio`,
    inLanguage: siteConfig.language,
  },
  mainEntity: {
    "@type": "Person",
    "@id": `${siteConfig.url}/#person`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: { "@id": `${siteConfig.url}/#profile-image` },
    description: siteConfig.description,
    jobTitle: [
      "Business Development Executive",
      "B2B Lead Generation Specialist",
    ],
    sameAs: [siteConfig.linkedIn],
    homeLocation: {
      "@type": "Place",
      name: siteConfig.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lahore",
        addressCountry: "PK",
      },
    },
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Green International University",
      url: "https://giu.edu.pk/",
    },
    knowsAbout: [
      "B2B lead generation",
      "Business development",
      "Prospect research",
      "LinkedIn outreach",
      "Email outreach",
      "Sales pipeline management",
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profilePageJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PortfolioPage />
    </>
  );
}
