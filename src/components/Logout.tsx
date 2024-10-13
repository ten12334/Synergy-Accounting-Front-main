import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../utilities/UserContext';
import { useCsrf } from '../utilities/CsrfContext';

const Logout: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const { csrfToken } = useCsrf();

    useEffect(() => {
        const logout = async () => {
            try {
                const response = await fetch('https://synergyaccounting.app/api/users/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || ''
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    setUser(null);
                    navigate('/login');
                } else {
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('An error occurred. Please try again.');
            }
        };
        logout().then();
    }, [csrfToken, setUser, navigate]);

    return <div>Logging out...</div>;
};

export default Logout;
