export type VideoProject = {
  id: string;
  title: string;
  category: string;
  summary: string;
  source: string;
  poster: string;
  posterAlt: string;
  duration: string;
  format: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  focus: readonly string[];
};

export const videoCaseStudies: readonly VideoProject[] = [
  {
    id: "finance-explainer",
    title: "Fast ideas, made clear.",
    category: "Finance explainer",
    summary:
      "A presenter-led social edit shaped with highlighted captions, topic-matched inserts, and frequent visual resets that keep a dense idea easy to follow.",
    source: "/videos/portfolio/finance-explainer.mp4",
    poster: "/images/video-work/finance-explainer.webp",
    posterAlt: "Close-up Bitcoin visual from a vertical finance explainer edit",
    duration: "00:34",
    format: "9:16 social",
    width: 1080,
    height: 1920,
    orientation: "portrait",
    focus: ["Caption hierarchy", "Topical B-roll", "Visual pacing"],
  },
  {
    id: "product-ugc",
    title: "A product story with proof in frame.",
    category: "Product-led UGC",
    summary:
      "A longer direct-to-camera product story supported by ingredient screens, pack shots, and detail cutaways without losing the speaker-led rhythm.",
    source: "/videos/portfolio/product-ugc.mp4",
    poster: "/images/video-work/product-ugc.webp",
    posterAlt: "Product pack shot from a vertical skincare UGC edit",
    duration: "01:50",
    format: "9:16 social",
    width: 1080,
    height: 1920,
    orientation: "portrait",
    focus: ["Product storytelling", "Information density", "UGC rhythm"],
  },
  {
    id: "editing-tutorial",
    title: "Long-form, without the drag.",
    category: "Educational long-form",
    summary:
      "A widescreen tutorial combining presenter footage, screen recordings, UI callouts, and animated explanations into one clean instructional flow.",
    source: "/videos/portfolio/editing-tutorial.mp4",
    poster: "/images/video-work/editing-tutorial.webp",
    posterAlt: "Presenter in a studio from a horizontal video-editing tutorial",
    duration: "02:08",
    format: "16:9 long-form",
    width: 1920,
    height: 1080,
    orientation: "landscape",
    focus: ["Screen capture", "Visual callouts", "Long-form structure"],
  },
] as const;

export const videoGalleryProjects: readonly VideoProject[] = [
  {
    id: "social-storytelling",
    title: "Conversation Story",
    category: "Social storytelling",
    summary:
      "An interview-led short with scenic footage, narrative B-roll, and graphic interludes.",
    source: "/videos/portfolio/social-storytelling.mp4",
    poster: "/images/video-work/social-storytelling.webp",
    posterAlt: "Two people in conversation outdoors in a vertical storytelling edit",
    duration: "00:21",
    format: "9:16 social",
    width: 1080,
    height: 1920,
    orientation: "portrait",
    focus: ["Narrative cut", "B-roll", "Typography"],
  },
  {
    id: "cinematic-story",
    title: "Cinematic Social",
    category: "Personal story",
    summary:
      "A low-light narrative edit mixing direct-to-camera footage with monochrome, archival-style inserts.",
    source: "/videos/portfolio/cinematic-story.mp4",
    poster: "/images/video-work/cinematic-story.webp",
    posterAlt: "Low-light close-up from a cinematic vertical social edit",
    duration: "00:28",
    format: "9:16 social",
    width: 1080,
    height: 1920,
    orientation: "portrait",
    focus: ["Mood", "Archival inserts", "Type treatment"],
  },
  {
    id: "creator-case-study",
    title: "Creator Case Study",
    category: "Business content",
    summary:
      "A creator-led business story paced with bold title cards, graphic proof points, and supporting footage.",
    source: "/videos/portfolio/creator-case-study.mp4",
    poster: "/images/video-work/creator-case-study.webp",
    posterAlt: "Creator speaking to camera in a vertical business case-study edit",
    duration: "01:00",
    format: "9:16 social",
    width: 1080,
    height: 1920,
    orientation: "portrait",
    focus: ["Kinetic type", "Graphic inserts", "Story structure"],
  },
  {
    id: "micro-montage",
    title: "Nine-second Montage",
    category: "Micro edit",
    summary:
      "A compact motivational montage built around immediate cuts, visual progression, and one clear closing idea.",
    source: "/videos/portfolio/micro-montage.mp4",
    poster: "/images/video-work/micro-montage.webp",
    posterAlt: "Creator in an Argentina football shirt in a fast vertical montage",
    duration: "00:09",
    format: "9:16 social",
    width: 1080,
    height: 1920,
    orientation: "portrait",
    focus: ["Fast pacing", "Montage", "Social hook"],
  },
] as const;

export const videoProjects = [
  ...videoCaseStudies,
  ...videoGalleryProjects,
] as const;
