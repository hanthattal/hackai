import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Invalid or missing URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "HackathonApp/1.0 sriramsendhil@gmail.com", // helps with SEC.gov
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch resource" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";

    // Handle PDF separately
    if (contentType.includes("pdf")) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
        },
      });
    }

    // Fallback: treat as HTML or text
    const text = await res.text();
    return new NextResponse(text, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Internal proxy error" }, { status: 500 });
  }
}