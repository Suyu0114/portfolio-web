import { ImageResponse } from "next/og";

// Single site-wide OG image — SPEC §6.5 (one 1200×630 image for v1).
// Rendered once at build via next/og. Tokens are inlined as literal hex
// because Satori doesn't read the CSS custom properties (values mirror
// SPEC §4.1 v1.3).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Suyu — field notes";

const PAPER = "#FBF6EA";
const INK = "#2B2620";
const INK_SOFT = "#5C5546";
const MUTED = "#777063";
const ACCENT = "#B45628";
const ACCENT_2 = "#657744";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          color: INK,
          padding: "72px 80px",
          border: `3px solid ${INK}`,
          borderRadius: "40px",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: MUTED, letterSpacing: 1 }}>
          Suyu — portfolio
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 132, fontWeight: 700, lineHeight: 1 }}>
            field notes
          </div>
          <div
            style={{
              display: "flex",
              width: 360,
              height: 12,
              marginTop: 18,
              backgroundColor: ACCENT,
              borderRadius: 8,
              transform: "rotate(-1deg)",
            }}
          />
          <div style={{ display: "flex", fontSize: 34, color: INK_SOFT, marginTop: 40, maxWidth: 940 }}>
            Six years building the systems businesses actually run on: planning, approvals, assets, sales. End to end, and lately with AI features on top.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: ACCENT_2 }}>
          Toronto · full-stack · ERP & business systems · AI integration
        </div>
      </div>
    ),
    { ...size },
  );
}
