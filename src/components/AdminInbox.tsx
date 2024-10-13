import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";
import {Email, MessageResponse} from "../Types";
import EmailPopup from "./EmailPopup";
import RightDashboard from "./RightDashboard";

const AdminInbox: React.FC = () => {

    const navigate = useNavigate();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [emails, setEmails] = useState<Email[] | null>([]);
    const [selectedEmails, setSelectedEmails] = useState<Email[]>([]);
    const [clickedEmail, setClickedEmail] = useState<Email | null>();
    const [isEmailOpen, setIsEmailOpen] = useState(false);

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
        } else {
            getEmails().then();
        }
    }, [loggedInUser, isLoading, navigate]);

    const getEmails = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const response = await fetch(`https://synergyaccounting.app/api/admin/emails/${loggedInUser?.username}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });

            if (response.status === 403) {
                alert('You do not have permission to view these emails.');
                navigate('/dashboard');
                return;
            } else if (response.status === 204) {
                setEmails(null);
                return;
            } else if (response.ok) {
                const emails: Email[] = await response.json();
                const sortedEmails = emails.sort((a, b) => {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });
                setEmails(sortedEmails);
            } else {
                const message: MessageResponse = await response.json();
                alert(message.message);
            }

        } catch (error) {
            alert('An error has occurred. Please try again.');
            console.log(error);
            navigate('/dashboard');
        }
    };

    const handleChange = async (email: Email, isChecked: boolean) => {
        if (emails) {
            if (isChecked) {
                setSelectedEmails(prev => [...prev, email]);
            } else {
                setSelectedEmails(prev => prev.filter(id => id !== email));
            }
        }
    }

    const openEmail = (email: Email) => {
        setClickedEmail(email);
        setIsEmailOpen(true);
    };

    const closeEmail = () => {
        setIsEmailOpen(false);
        setClickedEmail(null);
    };

    const handleDelete = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }

        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/emails/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(selectedEmails)
            });

            if (response.status === 403) {
                alert('You do not have permission to delete these emails.');
                return;
            }

            const responseMsg: MessageResponse = await response.json();
            alert(responseMsg.message)

            if (!(response.status === 204) && emails && selectedEmails) {
                if (response.ok) {
                    setEmails(emails.filter(email => !selectedEmails.includes(email)));
                    setSelectedEmails([]);
                }
            }

        } catch (error) {
            alert('An error occurred while deleting emails.');
            console.log(error);
        }
    };

    const handleSort = async (key: keyof Email) => {
        if (emails) {
            const sortedEmails = [...emails].sort((a, b) => {
                if (key === 'date') {
                    if (new Date(a.date) < new Date(b.date)) {
                        return 1;
                    }
                    if (new Date(a.date) > new Date(b.date)) {
                        return -1;
                    }
                    return 0;
                } else {
                    if (a[key] < b[key]) {
                        return -1;
                    }
                    if (a[key] > b[key]) {
                        return 1;
                    }
                }
                return 0;
            });
            setEmails(sortedEmails);
        }
    }

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard" style={{height: "auto", minHeight: "100vh"}}>
            <RightDashboard />
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="dashboard-center" style={{top: "unset", justifyContent: "unset"}}>
                <div className="chart-container">
                    <div className="center-text" style={{fontSize: "5vmin", marginBottom: "2vmin", display: "unset"}}>Inbox</div>
                    <button className="control-button add-account-button"
                            onClick={handleDelete}
                            disabled={selectedEmails?.length === 0}
                            style={{right: "unset", left: "5vmin"}}>Delete Selected Emails
                    </button>
                    <button className="control-button add-account-button"
                            onClick={() => navigate("/dashboard/admin/send-email")}>Compose New Email
                    </button>
                    <table id="chartOfAccountsTable">
                        <thead>
                        <tr>
                            <th>Select</th>
                            <th onClick={() => handleSort('date')}>Date</th>
                            <th onClick={() => handleSort('from')}>From</th>
                            <th onClick={() => handleSort('subject')}>Subject</th>
                        </tr>
                        </thead>
                        <tbody>
                        {emails?.map((email) => (
                            <tr key={email.date} onClick={() => openEmail(email)}>
                                <td>
                                    <input type="checkbox"
                                           id={email.id}
                                           onClick={(e) => e.stopPropagation()}
                                           onChange={(e) => handleChange(email, e.target.checked)}>
                                    </input>
                                </td>
                                <td>{new Date(email.date).toLocaleString()}</td>
                                <td>{email.from}</td>
                                <td>{email.subject}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {isEmailOpen && clickedEmail && (
                        <EmailPopup email={clickedEmail} onClose={closeEmail} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminInbox;
