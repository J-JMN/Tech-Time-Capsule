import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import apiClient from '../api/axios';

function NavBar() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        apiClient.delete('/api/logout').then(() => {
            setUser(null);
            navigate('/login');
        });
    };

    return (
        <header className="navbar">
            <div className="navbar-brand">
                <NavLink to="/" className="nav-link">📅 Tech Time Capsule</NavLink>
            </div>
            <nav className="navbar-links">
                <NavLink to="/categories" className="nav-link">Categories</NavLink>
                <NavLink to="/trivia" className="nav-link">Play Trivia</NavLink>
                {user ? (
                    <NavLink to="/submit" className="nav-link">Submit Event</NavLink>
                ) : null}
            </nav>
            <div className="navbar-user">
                {user ? (
                    <>
                        <span>Welcome, {user.username}!</span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <NavLink to="/login" className="nav-link">Login / Signup</NavLink>
                )}
            </div>
        </header>
    );
}

export default NavBar;