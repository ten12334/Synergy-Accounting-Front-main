import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "../Types";
import { useCsrf } from "./CsrfContext";

interface UserContextProps {
    user: User | null;
    setUser: (user: User | null) => void;
    fetchUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const { csrfToken } = useCsrf();
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const fetchUser = async () => {
        if (!csrfToken) {
            console.error('CSRF token is missing.');
            return;
        }
        try {
            const response = await fetch('https://synergyaccounting.app/api/users/validate', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('loggedInUser', JSON.stringify(userData));

            } else {
                console.error('Failed to fetch user data:', response.status);
                setUser(null);
                localStorage.removeItem('loggedInUser');
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
            localStorage.removeItem('loggedInUser');
        }
    };

    useEffect(() => {
        if (csrfToken && !user) {
            fetchUser().then();
        }
    }, [csrfToken]);

    return (
        <UserContext.Provider value={{ user, setUser, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextProps => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
