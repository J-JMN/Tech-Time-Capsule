import React, { createContext, useState, useEffect, useCallback } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(() => {
        setLoading(true);
        fetch('/api/check_session')
            .then(res => {
                if (res.status === 204) {
                    setUser(null);
                    return null; 
                }
                if (res.ok) {
                    return res.json();
                }
                setUser(null);
                return null;
            })
            .then(data => {
                if (data) {
                    setUser(data);
                }
            })
            .catch(error => {
                console.error("Error checking session:", error);
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