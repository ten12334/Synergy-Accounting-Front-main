import React, {createContext, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {MessageResponse, User, UserType} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import {useUser} from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";

interface UpdateUserProps {
    userResponse: User | null;
    setUserResponse: (userResponse: User | null) => void;
}

const UpdateUser: React.FC<UpdateUserProps> = ({userResponse, setUserResponse}) => {

    const navigate = useNavigate();
    const location = useLocation();

    const {csrfToken} = useCsrf();
    const { user: loggedInUser, setUser: setLoggedInUser, fetchUser } = useUser();

    const [email, setEmail] = useState<string>('');
    const [emailPassword, setEmailPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userType, setUserType] = useState<UserType>(UserType.USER);
    const [userid, setUserid] = useState<bigint>();
    const [joinDate, setJoinDate] = useState<Date>();
    const [address, setAddress] = useState<string>('');
    const [isVerified, setIsVerified] = useState<boolean>();
    const [isActive, setIsActive] = useState<boolean>();
    const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);

    const [tempLeaveStart, setTempLeaveStart] = useState<Date>();
    const [tempLeaveEnd, setTempLeaveEnd] = useState<Date>();

    const [birthday, setBirthday] = useState<Date>();

    useEffect(() => {
        if (location.state && location.state.userResponse) {
            setUserResponse(location.state.userResponse as User);
        }
    }, [location.state, userResponse, setUserResponse]);

    const formattedBirthDate: string = birthday instanceof Date && !isNaN(birthday.getTime()) ? birthday.toISOString().substring(0, 10) : '';
    const formattedLeaveStart: string = tempLeaveStart instanceof Date && !isNaN(tempLeaveStart.getTime()) ? tempLeaveStart.toISOString().substring(0, 10) : '';
    const formattedLeaveEnd: string = tempLeaveEnd instanceof Date && !isNaN(tempLeaveEnd.getTime()) ? tempLeaveEnd.toISOString().substring(0, 10) : '';

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
        if (!loggedInUser || loggedInUser.userType !== "ADMINISTRATOR") {
            navigate('/login');
        }
    }, [loggedInUser, isLoading, navigate]);
    useEffect(() => {
        if (!csrfToken) {
            navigate('/login');
        }
    }, [csrfToken, navigate]);

    useEffect(() => {
        if (!loggedInUser) {
            navigate('/login');
        }
        if (!userResponse) {
            alert('User data failed to be passed. Please try again.')
            navigate('/dashboard')
            return;
        }
        console.log('adjusting user data now...')
        setEmail(userResponse.email ?? "");
        setUsername(userResponse.username ?? "");
        setUserType(userResponse.userType ?? UserType.DEFAULT);
        setUserid(userResponse.userid ?? BigInt(0));
        setFirstName(userResponse.firstName ?? "");
        setLastName(userResponse.lastName ?? "");
        setIsActive(userResponse.isActive ?? false);
        setIsVerified(userResponse.isVerified ?? false);
        setAddress(userResponse.address ?? "");
        setFailedLoginAttempts(userResponse.failedLoginAttempts ?? 0);
        setBirthday(userResponse.birthday ? new Date(userResponse.birthday) : undefined);
        setJoinDate(userResponse.joinDate ? new Date(userResponse.joinDate) : undefined);
        setTempLeaveStart(userResponse.tempLeaveStart ? new Date(userResponse.tempLeaveStart) : undefined);
        setTempLeaveEnd(userResponse.tempLeaveEnd ? new Date(userResponse.tempLeaveEnd) : undefined);
        setEmailPassword(userResponse.emailPassword ?? "");
        console.log('user data adjusted..')
    }, [loggedInUser, navigate, userResponse]);

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserType(e.target.value as UserType);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!firstName || !lastName || !email) {
            alert('First name, last name, and email must be kept at a minimum.');
            return;
        }
        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }
        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/updateuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    userid,
                    email,
                    username,
                    firstName,
                    lastName,
                    userType,
                    birthday,
                    address,
                    failedLoginAttempts,
                    isVerified,
                    isActive,
                    tempLeaveStart,
                    tempLeaveEnd,
                    emailPassword
                }),
            });
            if (response.ok) {
                const updatedUser: User = await response.json();
                alert("User: " + updatedUser.username + " has been updated");
                if (updatedUser.userid === loggedInUser?.userid) {
                    setLoggedInUser(updatedUser);
                }
                setUserResponse(updatedUser);
                navigate('/dashboard/admin/update-user', {state: ({userResponse: updatedUser})});
            } else {
                const msgResponse: MessageResponse = await response.json();
                alert(msgResponse.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };
    return (
        <div className="dashboard" style={{height: "auto", fontFamily: "Copperplate,serif"}}>
            <RightDashboard />
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="update-user-dash">
                <div className="update-user-column">
                    <div className="profile-container"
                         onClick={() => navigate('/upload-image', {state: {userResponse}})}>
                        <img
                            className="profile-icon"
                            src={`https://synergyaccounting.app/api/dashboard/uploads/${userResponse?.userid.toString()}.jpg`}
                            alt="Profile Picture"
                        />
                    </div>
                    {userType === UserType.DEFAULT ? (
                        <button className="control-button" onClick={() => setUserType(UserType.USER)}>Approve
                            User</button>
                    ) : (
                        <button className="empty-button" disabled>Approve User</button>
                    )}
                    {failedLoginAttempts && failedLoginAttempts >= 3 ? (
                        <button className="control-button" onClick={() => setFailedLoginAttempts(0)}>Unlock
                            Account</button>
                    ) : (
                        <button className="empty-button" disabled>Unlock Account</button>
                    )}
                    <button className="control-button" onClick={() => setIsActive(false)}>Deactivate Account</button>
                    <button className="control-button">Delete User</button>
                </div>
                <div style={{width: "12.5vmin"}}></div>
                <div className="update-user-column" style={{justifyContent: "flex-end"}}>
                    <div className="label-large">{firstName} {lastName}</div>
                    <div style={{marginBottom: "auto", fontSize: "2.5vmin"}}>
                        <br/>
                        Username: {username}<br/>
                        User ID: {userid?.toString()}<br/>
                        Verified: {isVerified ? "True" : "False"}<br/>
                        Role: {userType.toString()}<br/>
                        Member Since: {joinDate?.toDateString()}<br/>
                    </div>
                    <div>
                        <div className="input-group">
                            <label htmlFor="updaterole" className="label">Role </label>
                            <select
                                id="updaterole"
                                value={userType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e)}
                                className="dropdown-custom"
                                style={{height: "3.771vmin"}}
                                name="role"
                            >
                                <option value={UserType.USER}>User</option>
                                <option value={UserType.MANAGER}>Manager</option>
                                <option value={UserType.ADMINISTRATOR}>Administrator</option>
                            </select>
                        </div>
                        {[
                            {label: 'Username', value: username, setValue: setUsername},
                            {label: 'Email', value: email, setValue: setEmail},
                            {label: 'First Name', value: firstName, setValue: setFirstName},
                            {label: 'Last Name', value: lastName, setValue: setLastName},
                            {
                                label: 'Birthday',
                                value: formattedBirthDate || '',
                                setValue: (dateString: string) => setBirthday(dateString ? new Date(dateString) : undefined),
                                type: 'date'
                            },
                            {label: 'Address', value: address, setValue: setAddress}
                        ].map(({label, value, setValue, type = 'text'}, index) => (
                            <div className="input-group" key={index}
                                 style={{margin: "1.5625vmin 0", height: "3.771vmin"}}>
                                <label htmlFor={"update" + label} className="label">{label} </label>
                                <input
                                    type={type}
                                    name={label}
                                    id={"update" + label}
                                    className="custom-input"
                                    value={value || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setValue(e.target.value as any);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{width: "12.5vmin"}}></div>
                <div className="update-user-column" style={{justifyContent: "space-around"}}>
                    <label htmlFor="updatestarttempleave" className="label">Start Temporary Leave </label>
                    <div className="input-group" style={{margin: "1.5625vmin 0", height: "3.771vmin", justifyContent: "center"}}>
                        <input type="date" className="custom-input" value={formattedLeaveStart} name="leavestart" id="updatestarttempleave"
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempLeaveStart(e.target.value ? new Date(e.target.value) : undefined)}/>
                    </div>
                    <label htmlFor="updateendtempleave" className="label">End Temporary Leave </label>
                    <div className="input-group" style={{margin: "1.5625vmin 0", height: "3.771vmin", justifyContent: "center"}}>
                        <input type="date" className="custom-input" value={formattedLeaveEnd} name="leaveend" id="updateendtempleave"
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempLeaveEnd(e.target.value ? new Date(e.target.value) : undefined)}/>
                    </div>
                    <form style={{marginTop: "auto"}} onSubmit={handleSubmit}>
                        <button type="submit" className="control-button">Save Changes</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateUser;



