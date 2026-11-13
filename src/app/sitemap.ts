import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(siteConfig.lastModified),
      images: [
        absoluteUrl("/images/huzaifa-hero-headphones.png"),
        absoluteUrl(siteConfig.profileImage),
      ],
    },
  ];
}
