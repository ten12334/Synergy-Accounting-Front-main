import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageResponse } from '../Types';
import { useCsrf } from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import DOMPurify from 'dompurify';

const Register: React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confpassword, setConfPassword] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [birthday, setBirthday] = useState<Date>();
    const [address, setAddress] = useState<string>('');

    const navigate = useNavigate();

    const { csrfToken, fetchCsrfToken} = useCsrf();

    useEffect(() => {
        const initCsrfIfNeeded = async () => {
            if (!csrfToken) {
                try {
                    await fetchCsrfToken();
                } catch (error) {
                    console.error('Failed to fetch CSRF token:', error);
                }
            }
        };
        initCsrfIfNeeded().then();
    }, []);

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

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
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confpassword) {
            alert('Passwords do not match.');
            return;
        }
        if (!firstName || !lastName || !email || !address) {
            alert('Please fill out all fields.');
            return;
        }
        if (!validatePassword(password)) {
            alert('Password must be at least 8 characters long, start with a letter, and include a letter, number, and special character.');
            return;
        }
        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }
        try {
            if (birthday) {
                const response = await fetch('https://synergyaccounting.app/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        email,
                        firstName,
                        lastName,
                        birthday,
                        address,
                        password,
                        confpassword
                    }),
                });
                const msgResponse: MessageResponse = await response.json();

                if (response.ok) {
                    alert(msgResponse.message);
                    navigate('/login');
                } else {
                    alert(msgResponse.message);
                }
            } else {
                alert('Birthday cannot be left empty!')
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Your session has expired. Refreshing page..');
            navigate('/register');
        }
    };

    if (!csrfToken) {
        return <div>Loading...</div>;
    }

    return (
        <header className="app-header">
            <img src={Logo} alt="Synergy" className="logo"/>
            <div className="container">
                <div className="content">
                    <div className="center-text">Create an Account</div>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="registeremail" className="label">Enter your Email </label>
                            <input type="text" className="custom-input" value={email} name="email" id="registeremail"
                                   autoComplete="email" onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="registerfirstname" className="label">First Name </label>
                            <input type="text" className="custom-input" value={firstName} name="first name" id="registerfirstname"
                                   autoComplete="firstname" onChange={(e) => setFirstName(DOMPurify.sanitize(e.target.value))}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="registerlastname" className="label">Last Name </label>
                            <input type="text" className="custom-input" value={lastName} name="last name" id="registerlastname"
                                   autoComplete="lastname" onChange={(e) => setLastName(DOMPurify.sanitize(e.target.value))}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="registerbirthday" className="label">Birthday </label>
                            <input type="date" className="custom-input"
                                   value={birthday ? birthday.toISOString().substring(0, 10) : ""}
                                   name="birthday"
                                   id="registerbirthday"
                                   autoComplete="birthday"
                                   onChange={(e) => setBirthday(e.target.value ? new Date(e.target.value) : undefined)}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="registeraddress" className="label">Address </label>
                            <input type="text" className="custom-input" value={address} name="address" id="registeraddress"
                                   autoComplete="address" onChange={(e) => setAddress(DOMPurify.sanitize(e.target.value))}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="registerpassword" className="label">Create a Password </label>
                            <input type="password" className="custom-input" value={password} name="password" id="registerpassword"
                                   autoComplete="password" onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="registerconfpassword" className="label">Confirm Password </label>
                            <input type="password" className="custom-input" value={confpassword} name="password" id="registerconfpassword"
                                   autoComplete="confpassword" onChange={(e) => setConfPassword(DOMPurify.sanitize(e.target.value))}/>
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button" disabled={!csrfToken}>Register</button>
                        </div>
                        <div className="input-group">
                            <button onClick={() => navigate('/login')}
                                    className="custom-button">Already have an account?
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default Register;



