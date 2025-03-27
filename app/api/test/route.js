import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { userId } = getAuth(request);
    return NextResponse.json({ userId });
}