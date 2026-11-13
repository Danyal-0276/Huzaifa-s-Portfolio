import { createSocialImage } from "./social-image";

export const alt =
  "Muhammad Huzaifa Ali — Business development and B2B lead generation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSocialImage();
}
