import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Créer un client pour Inngest
export const inngest = new Inngest({ id: "quickcart-next" });

// Fonction pour créer un utilisateur
export const syncUserCreation = inngest.createFunction({ id: 'sync-user-from-clerk' }, { event: 'clerk/user.created' },
    async({ event }) => {

        const { id, first_name, last_name, email_address, image_url } = event.data

        const userData = {
            _id: id,
            email: email_address[0].email_address,
            name: first_name + '' + last_name,
            imageUrl: image_url
        }
        await connectDB()
        await User.create(userData)


    }
)

// Fonction pour mettre à jour un utilisateur
export const syncUserUpdation = inngest.createFunction({
        id: 'update-user-from-clerk'
    }, {
        event: 'clerk/user.updated'
    },
    async({ event }) => {

        const { id, first_name, last_name, email_address, image_url } = event.data

        const userData = {
            _id: id,
            email: email_address[0].email_address,
            name: first_name + '' + last_name,
            imageUrl: image_url
        }
        await connectDB()
        await User.findByIdAndUpdate(id, userData)


    }
);

// Fonction pour supprimer un utilisateur
export const syncUserDeletion = inngest.createFunction({
        id: 'delete-user-with-clerk'
    }, {
        event: 'clerk/user.deleted'
    },
    async({ event }) => {
        const {
            id
        } = event.data
        await connectDB();

        await User.findByIdAndDelete(id);

    }

);