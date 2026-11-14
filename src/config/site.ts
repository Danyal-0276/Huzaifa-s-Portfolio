const defaultSiteUrl = "https://huzaifa-portfolio-silk.vercel.app";

function normalizeSiteUrl(value: string) {
  const url = new URL(
    /^https?:\/\//i.test(value) ? value : `https://${value}`,
  );

  return url.origin;
}

export const siteConfig = {
  name: "Muhammad Huzaifa Ali",
  title: "Muhammad Huzaifa Ali | B2B Lead Generation Specialist",
  description:
    "Muhammad Huzaifa Ali is a Lahore-based B2B lead generation and business development specialist focused on prospect research, outreach, and client acquisition.",
  url: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || defaultSiteUrl,
  ),
  language: "en",
  locale: "en_US",
  location: "Lahore, Pakistan",
  linkedIn:
    "https://www.linkedin.com/in/muhammad-huzaifa-ali-075a212a2/",
  profileImage: "/images/huzaifa-profile-light.png",
  created: "2026-11-12T12:09:48+05:00",
  lastModified: "2026-11-14T00:00:00+05:00",
  keywords: [
    "Muhammad Huzaifa Ali",
    "B2B lead generation specialist",
    "business development executive",
    "prospect research",
    "LinkedIn outreach",
    "email outreach",
    "sales pipeline support",
    "lead generation Lahore",
    "remote business development",
    "video editor Lahore",
    "short-form video editing",
    "social media video editor",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.url}/`).toString();
}
