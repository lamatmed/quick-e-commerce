import { getAuth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

import Product from "@/models/Product";
import { inngest } from "@/config/inngest";
import User from "@/models/User";
export async function POST(request) {

    try {
        const { userId } = getAuth(request)


        const { address, items } = await request.json()

        if (!address || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' })
        }
        //Calculate amount of items
        const amount = await items.reduce(async(acca, item) => {
            const product = await Product.findById(item.product);
            return await acca + product.offerPrice * item.quantity
        }, 0)
        await inngest.send({
                name: 'order/created',
                data: {
                    userId,
                    amount: amount + Math.floor(amount * 0.02),
                    items,
                    address,
                    date: Date.now(),
                }

            })
            //clear user Cart
        const user = await User.findById(userId)
        user.cartItems = {}
        await user.save()
        return NextResponse.json({ success: true, message: 'Commande passée' })
    } catch (error) {

        console.error(error)
        return NextResponse.json({ success: false, message: error.message })
    }



}