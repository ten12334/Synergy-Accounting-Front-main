import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";
import RightDashboard from "./RightDashboard";

const Dashboard: React.FC = () => {

    const navigate = useNavigate();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

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
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <RightDashboard />
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="update-user-dash">
                <div className="update-user-column">
                    <button className="control-button" onClick={() => navigate("/dashboard/chart-of-accounts")}>
                        Chart of Accounts
                    </button>
                </div>
                <div className="update-user-column"></div>
                <div className="update-user-column"></div>
            </div>
        </div>

    );
};

export default Dashboard;
