import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Créer un client pour Inngest
export const inngest = new Inngest({ id: "quickcart-next" });

// Fonction pour créer un utilisateur
// Fonction pour synchroniser la création d'un utilisateur
export const syncUserCreation = inngest.createFunction({
    id: 'sync-user-from-clerk'
}, {
    event: 'clerk/user.created'
}, async({ event }) => {

    const { id, first_name, last_name, email_address, image_url } = event.data;

    // Vérification si email_address est défini et contient des éléments
    const email = email_address && email_address.length > 0 ? email_address[0].email_address : null;

    // Si l'email est présent, on continue
    if (email) {
        const userData = {
            _id: id,
            email: email,
            name: first_name + ' ' + last_name, // Ajout d'un espace entre le prénom et le nom
            imageUrl: image_url
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

    const { id, first_name, last_name, email_address, image_url } = event.data;

    // Vérification si email_address est défini et contient des éléments
    const email = email_address && email_address.length > 0 ? email_address[0].email_address : null;

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
    },
    async({ event }) => {
        const {
            id
        } = event.data
        await connectDB();

        await User.findByIdAndDelete(id);

    }

);