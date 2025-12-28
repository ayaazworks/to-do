import { Navigate } from 'react-router-dom';

// 1. Use { children } to extract the children prop
export default function Protected({ children }) {
    if (!localStorage.getItem('login')) {
        return <Navigate to="/login" replace />
    }
    return children;
}