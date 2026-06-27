import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "BIRDEYE_API_KEY is not configured on the server." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint") || "defi/token_overview";
  
  const targetUrl = new URL(`https://public-api.birdeye.so/${endpoint}`);
  
  searchParams.forEach((value, key) => {
    if (key !== "endpoint") {
      targetUrl.searchParams.append(key, value);
    }
  });

  try {
    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        "accept": "application/json",
        "x-chain": "solana",
        "X-API-KEY": apiKey,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Birdeye responded with status ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to contact Birdeye API" }, { status: 500 });
  }
}
