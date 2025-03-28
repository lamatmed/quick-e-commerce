import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: "user" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: Array, required: true },
    date: { type: Date, default: Date.now }



})
const Product = mongoose.models.product || mongoose.model('Product', productSchema)
export default Product;