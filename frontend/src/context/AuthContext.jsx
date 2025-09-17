import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AuthContext = createContext(null);
// --- تم التعديل هنا ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('ratilUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('ratilUser');
            setUser(null);
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
            throw error; // Re-throw the error to be caught in the component
        }
    };

    const logout = () => {
        localStorage.removeItem('ratilUser');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};