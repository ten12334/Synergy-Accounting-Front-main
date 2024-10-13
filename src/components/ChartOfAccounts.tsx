import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";
import {Account, MessageResponse} from "../Types";
import RightDashboard from "./RightDashboard";

const ChartOfAccounts: React.FC = () => {

    const navigate = useNavigate();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [accounts, setAccounts] = useState<Account[]>([]);

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
        if (!isLoading && (!loggedInUser || loggedInUser.userType === "DEFAULT")) {
            navigate('/login');
        } else {
            getAccounts().then();
        }
    }, [loggedInUser, isLoading, navigate]);

    const getAccounts = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const response = await fetch(`https://synergyaccounting.app/api/accounts/chart-of-accounts`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });

            if (response.ok) {
                const accounts: Account[] = await response.json();
                setAccounts(accounts);
            } else if (response.status === 403) {
                alert('You do not have permission to access this resource.');
                navigate('/dashboard');
                return;
            } else {
                const message: MessageResponse = await response.json();
                alert(message);
                navigate('/dashboard');
                return;
            }
        } catch (error) {
            alert('An error has occurred. Please try again! Please try again.');
            navigate('/dashboard');
        }
    };

    const handleSort = (key: keyof Account) => {
        const sortedAccounts = [...accounts].sort((a, b) => {
            if (key === 'creator') {
                if (a.creator.username < b.creator.username) {
                    return 1;
                }
                if (a.creator.username > b.creator.username) {
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

        setAccounts(sortedAccounts);
    };

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard" style={{height: "auto", minHeight: "100vh"}}>
            <RightDashboard />
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="dashboard-center" style={{top: "unset", justifyContent: "unset"}}>
                <div className="chart-container">
                    <label className="center-text" style={{fontSize: "5vmin", marginBottom: "2vmin"}}>Chart of
                        Accounts</label>
                    <button className="control-button add-account-button">+</button>
                    <table id="chartOfAccountsTable">
                        <thead>
                        <tr>
                            <th onClick={() => handleSort('accountNumber')}>Account Number</th>
                            <th onClick={() => handleSort('accountName')}>Account Name</th>
                            <th onClick={() => handleSort('accountDescription')}>Account Description</th>
                            <th onClick={() => handleSort('accountCategory')}>Category</th>
                            <th onClick={() => handleSort('accountSubCategory')}>Subcategory</th>
                            <th onClick={() => handleSort('initialBalance')}>Initial Balance</th>
                            <th onClick={() => handleSort('currentBalance')}>Current Balance</th>
                            <th onClick={() => handleSort('dateAdded')}>Date Added</th>
                            <th onClick={() => handleSort('creator')}>Creator</th>
                        </tr>
                        </thead>
                        <tbody>
                        {accounts.map((account) => (
                            <tr key={account.accountNumber}>
                                <td>{account.accountNumber}</td>
                                <td>{account.accountName}</td>
                                <td>{account.accountDescription}</td>
                                <td>{account.accountCategory}</td>
                                <td>{account.accountSubCategory}</td>
                                <td>{account.initialBalance.toFixed(2)}</td>
                                <td>{account.currentBalance.toFixed(2)}</td>
                                <td>{new Date(account.dateAdded).toLocaleDateString()}</td>
                                <td>{account.creator.username}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
};

export default ChartOfAccounts;
