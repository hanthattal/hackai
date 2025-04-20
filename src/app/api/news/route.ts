import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("📡 /api/news hit");

  const company = req.nextUrl.searchParams.get("company");
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!company) {
    return NextResponse.json({ error: "Missing company parameter" }, { status: 400 });
  }

  try {
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(
      company
    )}&language=en&category=business`;

    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch news", details: err }, { status: 500 });
  }
}