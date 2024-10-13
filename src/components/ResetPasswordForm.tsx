import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";
import { useCsrf } from "../utilities/CsrfContext";
import Logo from "../assets/synergylogo.png";

const ResetPasswordForm: React.FC = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {csrfToken, fetchCsrfToken} = useCsrf();

    const [password, setPassword] = useState<string>('');
    const [confPassword, setConfPassword] = useState<string>('');

    const [validatedToken, setValidatedToken] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const token = searchParams.get('token');

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
                const response = await fetch(`/api/users/password-reset?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || ''
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    setValidatedToken(true);
                } else {
                    const message: MessageResponse = await response.json();
                    setValidatedToken(false);
                    alert(message.message);
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error Validating Token:', error);
                alert('An error has occurred. Please try again.');
                setValidatedToken(false);
            } finally {
                setIsLoading(false);
            }
        };
        if (token) {
            validateToken().then();
        }
    }, [csrfToken, fetchCsrfToken, token, navigate]);

    const validatePassword = (password: string): boolean => {
        const minLength = 8;
        const startsWithLetter = /^[A-Za-z]/.test(password);
        const containsLetter = /[A-Za-z]/.test(password);
        const containsNumber = /\d/.test(password);
        const containsSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return (
            password.length >= minLength &&
            startsWithLetter &&
            containsLetter &&
            containsNumber &&
            containsSpecialChar
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token || !validatedToken) {
            alert('Token is missing or invalid.');
            return;
        }
        if (password !== confPassword) {
            alert('Passwords do not match.');
            return;
        }
        if (!validatePassword(password)) {
            alert('Password must be at least 8 characters long, start with a letter, and include a letter, number, and special character.');
            return;
        }
        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
        }
        try {
            const response = await fetch(`https://synergyaccounting.app/api/users/password-reset?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({password}),
                credentials: 'include'
            });
            if (response.ok) {
                const message: MessageResponse = await response.json();
                alert(message.message);
                navigate('/login');
            } else {
                const message: MessageResponse = await response.json();
                alert(message.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <header className="app-header">
            <img src={Logo} alt="Synergy" className="logo"/>
            <div className="container">
                <div className="content">
                    <div className="center-text">Reset your Password</div>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="resetnewpasswd" className="label">New Password </label>
                            <input className="custom-input" type="password" value={password} name="password" id="resetnewpasswd"
                                   onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="resetconfpasswd" className="label">Confirm Password </label>
                            <input className="custom-input" type="password" value={confPassword} name="password" id="resetconfpasswd"
                                   onChange={(e) => setConfPassword(e.target.value)}/>
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Change Password</button>
                        </div>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default ResetPasswordForm;
