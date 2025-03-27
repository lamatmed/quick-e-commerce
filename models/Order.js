import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: "user" },
    items: [{
        product: { type: String, required: true , ref: "product" },
        quantity: { type: Number, required: true },
      
    }] ,
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    address: { type: String, required: true , ref: "address" },
    status: { type: String, required: true, default: "Order Placed" },
    date: { type: Date,required: true, default: Date.now },

})
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;