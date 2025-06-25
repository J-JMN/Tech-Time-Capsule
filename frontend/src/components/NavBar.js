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

    const linkStyle = { color: '#f0f0f0', textDecoration: 'none', marginRight: '1.5rem', fontWeight: 'bold' };
    const activeLinkStyle = { color: '#61dafb' };

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#282c34' }}>
            <div>
                <NavLink to="/" style={linkStyle}>Tech Time Capsule</NavLink>
            </div>
            <nav>
                <NavLink to="/categories" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>Categories</NavLink>
                <NavLink to="/trivia" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>Play Trivia</NavLink>
                {user ? (
                    <>
                        <NavLink to="/submit" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>Submit Event</NavLink>
                        <span style={{ color: '#aaa', marginRight: '1.5rem' }}>Welcome, {user.username}!</span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <NavLink to="/login" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>Login / Signup</NavLink>
                )}
            </nav>
        </header>
    );
}

export default NavBar;