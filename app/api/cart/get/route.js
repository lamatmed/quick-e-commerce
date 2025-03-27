import connectDB from "@/config/db";


import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import User from "@/models/User";
export async function GET(request) {

    try {
        const { userId } = getAuth(request)
        await connectDB()
        const user = await User.findById(userId)
        const { cartItemes } = user
        return NextResponse.json({ success: true, cartItemes })
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }


}