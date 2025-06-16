import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { UserContext } from '../context/UserContext';

function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleAuth = (values) => {
        setError('');
        const endpoint = isLogin ? '/api/login' : '/api/signup';
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
            if (ok) {
                setUser(data);
                navigate('/');
            } else {
                setError(data.error);
            }
        })
        .catch(err => setError("An unexpected error occurred."));
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