import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function AuthForm({ isLogin, onSubmit, error }) {
    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik({
        initialValues: { username: '', password: '' },
        validationSchema: Yup.object({
            username: Yup.string().required('Username is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        }),
        onSubmit: (values, { setSubmitting }) => {
            onSubmit(values);
            setSubmitting(false);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <input id="username" name="username" type="text" placeholder="Username" {...formik.getFieldProps('username')} />
            {formik.touched.username && formik.errors.username ? (<div className="error">{formik.errors.username}</div>) : null}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    {...formik.getFieldProps('password')}
                    style={{ paddingRight: '60px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '5px', background: 'transparent', border: 'none', color: '#61dafb', cursor: 'pointer', padding: '5px' }}>
                    {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>
            {formik.touched.password && formik.errors.password ? (<div className="error">{formik.errors.password}</div>) : null}
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={formik.isSubmitting}>
                {isLogin ? 'Login' : 'Sign Up'}
            </button>
        </form>
    );
}

export default AuthForm;