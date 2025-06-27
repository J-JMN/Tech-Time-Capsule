import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';

function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        apiClient.get('/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => setError('Could not fetch categories.'));
    }, []);

    const formik = useFormik({
        initialValues: { name: '', description: '' },
        validationSchema: Yup.object({
            name: Yup.string().max(50, 'Must be 50 characters or less').required('Required'),
            description: Yup.string(),
        }),
        onSubmit: (values, { setSubmitting, resetForm }) => {
            apiClient.post('/api/categories', values)
                .then(res => {
                    setCategories([...categories, res.data].sort((a,b) => a.name.localeCompare(b.name)));
                    resetForm();
                })
                .catch(err => alert(err.response?.data?.error || 'An error occurred.'))
                .finally(() => setSubmitting(false));
        },
    });

    const handleDelete = (catId) => {
        if (window.confirm('Are you sure? This will remove the category from all associated events.')) {
            apiClient.delete(`/api/categories/${catId}`)
                .then(() => {
                    setCategories(categories.filter(c => c.id !== catId));
                })
                .catch(err => alert(err.response?.data?.error));
        }
    };

    return (
        <div>
            <h2>Event Categories</h2>
            {error && <p className="error">{error}</p>}
            
            <div className="categories-layout">
                <div>
                    <h3>All Categories</h3>
                    <ul className="category-list">
                        {categories.map(cat => (
                            <li key={cat.id} className="category-item">
                                <div>
                                    <strong className="category-name" onClick={() => navigate(`/?category_id=${cat.id}`)}>
                                        {cat.name}
                                    </strong>
                                    <p className="category-desc">{cat.description}</p>
                                </div>
                                {user && user.id === cat.user_id && (
                                    <button onClick={() => handleDelete(cat.id)} className="btn-delete">Delete</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {user ? (
                    <div>
                        <h3>Create New Category</h3>
                        <form onSubmit={formik.handleSubmit}>
                            <input name="name" placeholder="Category Name" {...formik.getFieldProps('name')} />
                            {formik.touched.name && formik.errors.name && <div className="error">{formik.errors.name}</div>}
                            <textarea name="description" placeholder="Description" {...formik.getFieldProps('description')} />
                            <button type="submit" disabled={formik.isSubmitting}>Create</button>
                        </form>
                    </div>
                ) : <p>Log in to create a new category.</p>}
            </div>
        </div>
    );
}

export default CategoriesPage;