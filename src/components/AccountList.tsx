import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AccountList: React.FC = () => {
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        axios.get('/api/accounts').then(response => {
            setAccounts(response.data);
        });
    }, []);

    const filterAccounts = (searchTerm: string) => {
        const filtered = accounts.filter(account =>
            account.accountName.includes(searchTerm) || account.accountNumber.includes(searchTerm)
        );
        setAccounts(filtered);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search by account name or number"
                onChange={(e) => filterAccounts(e.target.value)}
            />
            <ul>
                {accounts.map((account) => (
                    <li key={account.id}>
                        {account.accountName} - {account.accountNumber}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AccountList;
