import { v2 as cloudinary } from "cloudinary";
import { getAuth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request) {

    try {
        const { userId } = getAuth(request)
        console.log(userId)

        const fromData = await request.formData()
        const name = fromData.get('name');
        const description = fromData.get('description');
        const category = fromData.get('category');
        const price = fromData.get('price');
        const offerPrice = fromData.get('offerPrice');

        const files = await fromData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: 'No  images found' })

        }

        const result = await Promise.all(files.map(async(file) => {
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' },
                    (error, result) => {
                        if (error) {
                            reject(error)
                        } else {
                            resolve(result)
                        }
                    })

                stream.end(buffer)
            })
        }));

        const image = result.map(result => result.secure_url)

        await connectDB()
        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image,
            date: Date.now()

        })
        return NextResponse.json({ success: true, message: 'Produit ajouté avec succès' })
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }



}