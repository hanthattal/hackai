import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !url.startsWith("https://www.sec.gov/")) {
    return NextResponse.json({ error: "Invalid or missing SEC URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "HackathonApp/1.0 sriramsendhil@gmail.com",
      },
    });

    const contentType = res.headers.get("content-type") || "text/html";
    const body = await res.text();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        // critical: DO NOT send X-Frame-Options header
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch SEC content" }, { status: 500 });
  }
}