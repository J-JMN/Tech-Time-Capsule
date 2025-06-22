import React, { createContext, useState, useEffect, useCallback } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(() => {
        setLoading(true);
        fetch('/api/check_session')
            .then(res => {
                // FIX: Check for a 204 No Content status.
                // If the user is not logged in, the response has no body.
                // Trying to call .json() on an empty body causes a crash.
                if (res.status === 204) {
                    setUser(null);
                    return null; // Return null to stop the promise chain
                }
                if (res.ok) {
                    return res.json(); // Only parse JSON if the response is OK and has content
                }
                // Handle other error statuses if needed
                setUser(null);
                return null;
            })
            .then(data => {
                // This 'then' block will only run if data is not null
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
            {!loading && children}
        </UserContext.Provider>
    );
};