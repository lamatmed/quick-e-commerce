'use client'

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
}

export const AppContextProvider = ({ children }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY;
    const router = useRouter();
    const { user } = useUser();
    const { getToken } = useAuth();
    
    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [cartItems, setCartItems] = useState({});

    const fetchProductData = async () => {
        try {
            const { data } = await axios.get('/api/product/list');
            if (data?.products) {
                setProducts(data.products);
            } else {
                toast.error(data?.message || "Erreur lors du chargement des produits");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Une erreur s'est produite");
        }
    }

    const fetchUserData = async () => {
        try {
            if (user?.publicMetadata?.role === 'seller') {
                setIsSeller(true);
            }

            const token = await getToken();
            const { data } = await axios.get('/api/user/data', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data?.success) {
                setUserData(data.user);
                setCartItems(data.user.cartItems || {});
            } else {
                toast.error(data?.message || "Impossible de récupérer les informations utilisateur");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Une erreur s'est produite");
        }
    }

    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            
            cartData[itemId]++;
        }
        else{
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
      
        if (user) {
            try {
                const token = getToken()
                await  axios.post('/api/cart/update', { cartData }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Article ajouté au panier');
            } catch (error) {
                
                toast.error(error.message);
            }
        
        }
      
    }

    const updateCartQuantity = async(itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity===0) {
            delete cartData[itemId];
        } else{
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        if (user) {
            try {
                const token = getToken()
                await  axios.post('/api/cart/update', { cartData }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Mise a jour au panier');
            } catch (error) {
                
                toast.error(error.message);
            }
        
        }
    }

    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, qty) => total + qty, 0);
    }

    const getCartAmount = () => {
        return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
            const itemInfo = products.find(product => product._id === itemId);
            return total + (itemInfo?.offerPrice || 0) * qty;
        }, 0).toFixed(2);
    }

    useEffect(() => {
        fetchProductData();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    return (
        <AppContext.Provider value={{
            user, getToken,
            currency, router,
            isSeller, setIsSeller,
            userData, fetchUserData,
            products, fetchProductData,
            cartItems, setCartItems,
            addToCart, updateCartQuantity,
            getCartCount, getCartAmount
        }}>
            {children}
        </AppContext.Provider>
    );
};
