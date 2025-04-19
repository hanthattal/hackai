import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://www.sec.gov/files/company_tickers_exchange.json", {
      headers: {
        "User-Agent": "HackathonApp/1.0 sriramsendhil@gmail.com",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch SEC data" }, { status: 500 });
    }

    const data = await res.json();
  console.log("SEC data returned:", Array.isArray(data), data[0]);
  return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}