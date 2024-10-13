import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";
import { useCsrf } from "../utilities/CsrfContext"

const Verify: React.FC = () => {

    const [searchParams] = useSearchParams();

    const token = searchParams.get('token');

    const navigate = useNavigate();
    const  {csrfToken, fetchCsrfToken}  = useCsrf();

    const [isLoading, setIsLoading] = useState<boolean>(true);


    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                alert('Confirmation token is missing. Please check your confirmation link.');
                navigate('/login');
                return;
            }
            try {
                try {
                    if (!csrfToken) {
                        await fetchCsrfToken();
                    }
                } catch (error) {
                    console.error('Failed to fetch CSRF token:', error);
                }
                const response = await fetch(`https://synergyaccounting.app/api/users/verify?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || ''
                    },
                    credentials: 'include'
                });

                const message: MessageResponse = await response.json();
                if (response.ok) {
                    alert(message.message);
                } else {
                    alert(`Verification failed: ${message.message}`);
                }
            } catch (error) {
                console.error('Error validating verification token:', error);
                alert('An error has occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        if (token) {
            validateToken().then();
        }
    }, [csrfToken, fetchCsrfToken, token, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    } else {
        navigate('/login');
    }

    return null;
};

export default Verify;
