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
                if (res.status === 204) {
                    setUser(null);
                } else {
                    setUser(res.data);
                }
            })
            .catch(error => {
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    return (
        <UserContext.Provider value={{ user, setUser, loading, checkSession }}>
            {!loading && children}
        </UserContext.Provider>
    );
};