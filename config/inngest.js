import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

// Créer un client pour Inngest
export const inngest = new Inngest({ id: "quickcart-next" });

// Fonction pour créer un utilisateur
export const syncUserCreation = inngest.createFunction({
    id: 'sync-user-from-clerk'
}, {
    event: 'clerk/user.created'
}, async({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    // Vérification si email_addresses est défini et contient des éléments
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : null;

    // Si l'email est présent, on continue
    if (email) {
        const userData = {
            _id: id,
            email: email,
            name: first_name + ' ' + last_name, // Ajout d'un espace entre le prénom et le nom
            imageUrl: image_url,

        };

        await connectDB();

        await User.create(userData);
    } else {
        console.error('Erreur : Aucun email trouvé pour l\'utilisateur avec l\'ID', id);
    }
});

// Fonction pour mettre à jour un utilisateur
export const syncUserUpdation = inngest.createFunction({
    id: 'update-user-from-clerk'
}, {
    event: 'clerk/user.updated'
}, async({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    // Vérification si email_addresses est défini et contient des éléments
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : null;

    // Si l'email est présent, on continue
    if (email) {
        const userData = {
            _id: id,
            email: email,
            name: first_name + ' ' + last_name, // Ajout d'un espace entre le prénom et le nom
            imageUrl: image_url
        };
        await connectDB();
        await User.findByIdAndUpdate(id, userData);
    } else {
        console.error('Erreur : Aucun email trouvé pour l\'utilisateur avec l\'ID', id);
    }
});

// Fonction pour supprimer un utilisateur
export const syncUserDeletion = inngest.createFunction({
    id: 'delete-user-with-clerk'
}, {
    event: 'clerk/user.deleted'
}, async({ event }) => {
    const { id } = event.data;
    await connectDB();
    await User.findByIdAndDelete(id);
});

// Fonction pour créer Order de l'utilisateur


export const createUserOrder  = inngest.createFunction({
    id: 'create-user-with-order',
    batchEvents:{
        maxSize:25,
        timeout: '5s'
    }
},
{ events: 'order/created'}, 
 async({ events }) => {
   
  const orders = events.map((event)=>{
   
    return {
       userId: event.data.userId, 
       items: event.data.items ,
       amount: event.data.amount,
       status: event.data.status,
       address:event.data.address,
       date: event.data.date
    }
  })
  await connectDB();
  await Order.insertMany(orders);
  return {success: true, processed: orders.length};
 }
);