import React, {useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useCsrf} from "../utilities/CsrfContext";
import {useUser} from "../utilities/UserContext";
import {User} from "../Types"; // Assuming you have a User type defined

const RightDashboard: React.FC = () => {

    const navigate = useNavigate();

    const {csrfToken} = useCsrf();
    const {user: loggedInUser, fetchUser} = useUser();

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
        }
    }, [loggedInUser, isLoading, navigate]);

    if (isLoading || !csrfToken) {
        return null;
    }

    return (
        <div className="right-dashboard">
            <div style={{marginRight: "unset", marginBottom: "1vh"}}
                 className="label large-font">{loggedInUser?.username}</div>
            <div className="profile-container"
                 onClick={() => navigate('/upload-image')}>
                <img
                    className="profile-icon"
                    src={`https://synergyaccounting.app/api/dashboard/uploads/${loggedInUser?.userid.toString()}.jpg`}
                    alt="Profile Picture"
                />
            </div>
            {loggedInUser?.userType === "ADMINISTRATOR" && (
                <>
                    <div style={{marginRight: "unset"}} className="label large-font">Admin Panel</div>
                    <button
                        onClick={() => navigate('/dashboard/admin/add-user')}
                        className="control-button">Add User
                    </button>
                    <button onClick={() => navigate('/dashboard/admin/update-user-search')}
                            className="control-button">Update User
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/admin/inbox')}
                        className="control-button">Mailbox
                    </button>
                    <div className="extra-margin"></div>
                </>
            )}
            <div style={{marginRight: "unset"}} className="label large-font">User Panel</div>
            <button className="control-button"
                    onClick={() => navigate("/dashboard")}>Home
            </button>
            <button className="control-button">Settings</button>
            <button className="control-button" onClick={() => navigate("/logout")}>Log Out</button>
        </div>
    );
};

export default RightDashboard;
