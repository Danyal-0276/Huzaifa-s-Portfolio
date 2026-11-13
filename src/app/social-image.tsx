import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

const portraitData = await readFile(
  join(process.cwd(), "public/images/huzaifa-profile-light.png"),
  "base64",
);
const portraitSrc = `data:image/png;base64,${portraitData}`;

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#f7f7f5",
          color: "#141414",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "59%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 62px 54px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            <span
              style={{
                width: 15,
                height: 15,
                display: "flex",
                background: "#e04e24",
              }}
            />
            B2B GROWTH PORTFOLIO
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 74,
                fontWeight: 700,
                lineHeight: 0.94,
                letterSpacing: -4,
              }}
            >
              <span>Muhammad</span>
              <span>Huzaifa Ali</span>
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 545,
                fontSize: 29,
                lineHeight: 1.25,
                color: "#4c4b48",
              }}
            >
              Business development &amp; B2B lead generation
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 18,
              color: "#6d6c68",
              letterSpacing: 1.2,
            }}
          >
            <span
              style={{
                width: 44,
                height: 3,
                display: "flex",
                background: "#e04e24",
              }}
            />
            LAHORE, PAKISTAN
          </div>
        </div>

        <div
          style={{
            width: "41%",
            height: "100%",
            display: "flex",
            position: "relative",
            overflow: "hidden",
            borderLeft: "1px solid #deded9",
          }}
        >
          {/* ImageResponse requires a native image element for embedded data URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitSrc}
            alt=""
            width="492"
            height="630"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "62% center",
            }}
          />
        </div>

        <div
          style={{
            width: 134,
            height: 134,
            display: "flex",
            position: "absolute",
            right: -45,
            top: -45,
            border: "18px solid #e04e24",
            borderRadius: "50%",
          }}
        />
      </div>
    ),
    socialImageSize,
  );
}
