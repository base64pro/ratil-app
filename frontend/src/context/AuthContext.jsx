import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- START: MODIFICATION ---
// Define a default guest user object for public access
const guestUser = {
    username: 'Guest',
    role: 'public',
    can_access_portfolio: false,
};

export const AuthProvider = ({ children }) => {
    // Initialize state with the guestUser object, not null
    const [user, setUser] = useState(guestUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This effect runs once when the app starts
        try {
            const storedUser = localStorage.getItem('ratilUser');
            if (storedUser) {
                // If a user is found in storage, set them as the current user
                setUser(JSON.parse(storedUser));
            } else {
                // Otherwise, ensure the state is the default guest user
                setUser(guestUser);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('ratilUser');
            setUser(guestUser); // Fallback to guest user on error
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, {
                username,
                password,
            });
            
            if (response.data && response.data.status === 'success') {
                const userData = response.data.user;
                localStorage.setItem('ratilUser', JSON.stringify(userData));
                // This setUser call is what instantly updates the UI across the app
                setUser(userData);
                return userData;
            }
        } catch (error) {
            console.error("Login failed:", error);
            const detail = error.response?.data?.detail || 'فشل الاتصال بالخادم.';
            Swal.fire({
                icon: 'error',
                title: 'خطأ في تسجيل الدخول',
                text: detail,
            });
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('ratilUser');
        // On logout, revert to the guest user state, instantly updating the UI
        setUser(guestUser);
    };
    
    // A helper function to easily check if the user is a guest
    const isGuest = user.role === 'public';

    // The value provided to the context now includes the user state, login/logout functions, and the isGuest helper
    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isGuest }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
// --- END: MODIFICATION ---

