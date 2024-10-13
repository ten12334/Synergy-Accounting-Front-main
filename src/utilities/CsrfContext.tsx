import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {MessageResponse} from "../Types";

interface CsrfContextType {
    csrfToken: string | null;
    fetchCsrfToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

interface CsrfProviderProps {
    children: ReactNode;
}

export const CsrfProvider: React.FC<CsrfProviderProps> = ({ children }) => {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    const fetchCsrfTokenWithRetry = async (retries: number = 3, delay: number = 1000) => {
        for (let i = 0; i < retries; i++) {
            console.log(`Attempt ${i + 1} to fetch CSRF Token...`);
            try {
                const response = await fetch('https://synergyaccounting.app/api/csrf', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const csrfData = await response.json();
                    setCsrfToken(csrfData.token);
                    console.log("CSRF Token fetched successfully:", csrfData.token);
                    return;
                } else {
                    const message: MessageResponse = await response.json();
                    console.error(message);
                }
            } catch (error) {
                console.error('Error fetching CSRF token:', error);
            }

            await new Promise(res => setTimeout(res, delay));
        }
        console.error('Failed to fetch CSRF token after multiple attempts.');
    };

    useEffect(() => {
        console.log("CsrfProvider mounting...");
        fetchCsrfTokenWithRetry().then(() => {
            console.log("CsrfProvider mounted successfully.");
        });
    }, []);

    return (
        <CsrfContext.Provider value={{ csrfToken, fetchCsrfToken: fetchCsrfTokenWithRetry }}>
            {children}
        </CsrfContext.Provider>
    );
};

export const useCsrf = (): CsrfContextType => {
    const context = useContext(CsrfContext);
    if (context) {
        return context;
    }
    console.error("useCsrf was called outside of a CsrfProvider.");
    throw new Error("useCsrf must be used within a CsrfProvider");
};
