import React, {useState} from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import {BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import ResetPassword from "./components/ResetPassword";
import ResetPasswordForm from './components/ResetPasswordForm';
import ConfirmUser from "./components/ConfirmUser";
import Verify from "./components/Verify";
import Dashboard from "./components/Dashboard";
import ImageUpload from "./components/ImageUploader";
import AddUser from "./components/AddUser";
import UpdateUserSearch from "./components/UpdateUserSearch";
import UpdateUser from "./components/UpdateUser";
import SendAdminEmail from "./components/SendAdminEmail";
import ChartOfAccounts from "./components/ChartOfAccounts";
import AdminInbox from "./components/AdminInbox";
import Logout from "./components/Logout";
import {User} from "./Types";

function App() {

    const [userResponse, setUserResponse] = useState<User | null>(null);

    return (
        <div className="app">
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login"/>}/>
                    <Route path="/logout" element={<Logout/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/verify" element={<Verify/>}/>
                    <Route path="/forgot-password" element={<ResetPassword/>}/>
                    <Route path="/password-reset" element={<ResetPasswordForm/>}/>
                    <Route path="/confirm-user" element={<ConfirmUser/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/upload-image" element={<ImageUpload/>}/>
                    <Route path="/dashboard/admin/add-user" element={<AddUser/>}/>
                    <Route path="/dashboard/admin/update-user-search" element={<UpdateUserSearch/>}/>
                    <Route path="/dashboard/admin/update-user"
                           element={<UpdateUser userResponse={userResponse} setUserResponse={setUserResponse}/>}/>
                    <Route path="/dashboard/admin/send-email" element={<SendAdminEmail/>}/>
                    <Route path="/dashboard/admin/inbox" element={<AdminInbox/>}/>
                    <Route path="/dashboard/chart-of-accounts" element={<ChartOfAccounts/>}/>
                </Routes>
            </Router>
        </div>
    );
}

export default App;