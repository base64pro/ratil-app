import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- START: MODIFICATION ---
// Define a default guest user object
const guestUser = {
    username: 'Guest',
    role: 'public',
    can_access_portfolio: false,
};

export const AuthProvider = ({ children }) => {
    // Initialize with guestUser instead of null
    const [user, setUser] = useState(guestUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('ratilUser');
            if (storedUser) {
                // If there's a stored user, parse and set it
                setUser(JSON.parse(storedUser));
            } else {
                // Otherwise, ensure it's the guest user
                setUser(guestUser);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('ratilUser');
            setUser(guestUser);
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
        // On logout, revert to the guest user state
        setUser(guestUser);
    };
    
    // Add a helper to check if the user is a guest
    const isGuest = user.role === 'public';

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
