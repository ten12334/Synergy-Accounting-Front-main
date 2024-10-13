import React, {useState} from 'react';

interface AccountFormProps{
    onSubmit: (accountData: any) => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ onSubmit })=> {
    const [account, setAccount] = useState({
        accountName: '',
        accountNumber: '',
        description: '',
        normalSide: '',
        category: '',
        subCategory: '',
        initialBalance: '',
        debit: '',
        credit: '',
        statement: '',
        comment: ''
    });

    const handleChange= (e: React.ChangeEvent<HTMLInputElement>) =>{
        setAccount({...account, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(account);
    };

    return (
        <form onSubmit=(handleSubmit)>
            <label>Account Name:</label>
                <input type="text" name="accountName" onChange={handleChange} />

                <label>Account Number:</label>
                <input type="text" name="accountNumber" onChange={handleChange} />

                {/* Add more fields for other account properties... */}

                <button type="submit">Submit</button>
            </form>
            );
        );

import default AccountForm;

