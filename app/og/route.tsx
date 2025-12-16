// app/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") ?? "andes";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          background: "#0b0b0b",
          color: "white",
          padding: "64px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>
          AndesMap
        </div>

        <div>
          <div style={{ fontSize: 48, fontWeight: 600 }}>
            {formatRegion(region)}
          </div>
          <div style={{ fontSize: 24, opacity: 0.8 }}>
            Backcountry routes · Terrain insights
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function formatRegion(region: string) {
  return region.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
}
