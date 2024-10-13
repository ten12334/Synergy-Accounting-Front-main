import DOMPurify from 'dompurify';

import React from "react";
import {Email} from "../Types";

const EmailPopup: React.FC<{ email: Email, onClose: () => void }> = ({ email, onClose }) => {

    if (!email) {
        console.log("Email is missing...");
        return null;
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2 style={{margin: "2vh"}}>{email.subject}</h2>
                <p style={{margin: "0.5vh", fontSize: "medium"}}><strong>From:</strong> {email.from}</p>
                <p><strong>Date:</strong> {new Date(email.date).toLocaleString()}</p>
                {/*<p dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(email.body)}}></p>*/}
                <p>{email.body}</p>
            </div>
        </div>
    );
};

export default EmailPopup;