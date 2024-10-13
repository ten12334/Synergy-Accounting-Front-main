import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";
import RightDashboard from "./RightDashboard";

const SendAdminEmail: React.FC = () => {

    const navigate = useNavigate();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [to, setTo] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    const [body, setBody] = useState<string>('');

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!loggedInUser) {
                await fetchUser();
            }
            setIsLoading(false);
        };
        init().then();
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading && (!loggedInUser || loggedInUser.userType !== "ADMINISTRATOR")) {
            navigate('/login');
        }
    }, [loggedInUser, isLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!to || !subject || !body) {
            alert('Please fill in all fields.');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ to, from: loggedInUser?.username, subject, body }),
            });

            if (response.ok) {
                alert('Email has been sent successfully.');
                navigate('/dashboard/admin/inbox')

            } else {
                const errorResponse = await response.json();
                alert(`Failed to send email: ${errorResponse.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <RightDashboard />
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="dashboard-center" style={{justifyContent: "center"}}>
                <div className="email-dashboard">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="emailbody" className="label default-font"
                               style={{marginBottom: "20px", textAlign: "center", display: "block"}}>Send an
                            Email</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="custom-input"
                                value={to}
                                name="recipient email"
                                onChange={(e) => setTo(e.target.value)}
                                placeholder="Recipient email address"
                                style={{width: "100%"}}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                className="custom-input"
                                value={subject}
                                name="email subject"
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject"
                                style={{width: "100%"}}
                            />
                        </div>
                        <div className="input-group">
                    <textarea
                        className="custom-textarea"
                        value={body}
                        name="emailbody"
                        id="emailbody"
                        style={{width: "75vmin"}}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Email body"
                        rows={10}
                    />
                        </div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Send Email</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SendAdminEmail;
