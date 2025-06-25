import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { UserContext } from '../context/UserContext';
import apiClient from '../api/axios';

function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleAuth = (values) => {
        setError('');
        const endpoint = isLogin ? '/api/login' : '/api/signup';
        
        apiClient.post(endpoint, values)
            .then(res => {
                setUser(res.data);
                navigate('/');
            })
            .catch(err => {
                setError(err.response?.data?.error || "An unexpected error occurred.");
            });
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <AuthForm isLogin={isLogin} onSubmit={handleAuth} error={error} />
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{marginTop: '1rem', background: 'transparent', color: '#61dafb' }}>
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
        </div>
    );
}

export default LoginPage;