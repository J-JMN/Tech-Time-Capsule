import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(() => {
        setLoading(true);
        apiClient.get('/api/check_session')
            .then(res => {
                setUser(res.data);
            })
            .catch(error => {
                // A 401 or other error means no active session, which is normal
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    return (
        <UserContext.Provider value={{ user, setUser, loading, checkSession }}>
            {children}
        </UserContext.Provider>
    );
};