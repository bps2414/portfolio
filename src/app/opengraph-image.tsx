import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = "Bryan Souza | Desenvolvedor Web e Landing Pages";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          color: "#fafafa",
          padding: 72,
          fontFamily: "Arial, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 78% 18%, rgba(234,179,8,0.28), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.08), transparent 42%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 16px",
              border: "1px solid rgba(234,179,8,0.38)",
              color: "#eab308",
              fontSize: 28,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Portfólio de desenvolvedor
          </div>
          <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.02, maxWidth: 860 }}>
            Bryan Souza
          </div>
          <div style={{ fontSize: 38, lineHeight: 1.24, color: "#d4d4d8", maxWidth: 930 }}>
            Desenvolvedor web focado em landing pages, sites responsivos e projetos digitais para pequenos negócios.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#a1a1aa",
            fontSize: 28,
          }}
        >
          <span>React • Next.js • TypeScript • Tailwind CSS</span>
          <span>{new URL(siteConfig.url).hostname}</span>
        </div>
      </div>
    ),
    size
  );
}
