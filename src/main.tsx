import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import {CsrfProvider} from "./utilities/CsrfContext";
import {UserProvider} from "./utilities/UserContext";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
