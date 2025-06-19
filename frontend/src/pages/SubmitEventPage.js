import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

function SubmitEventPage() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const eventToEdit = location.state?.event; 

    const [error, setError] = useState('');

    const formik = useFormik({
        initialValues: {
            title: eventToEdit?.title || '',
            description: eventToEdit?.description || '',
            year: eventToEdit?.year || '',
            month: eventToEdit?.month || '',
            day: eventToEdit?.day || '',
            image_url: eventToEdit?.image_url || '',
            source_link: eventToEdit?.source_link || '',
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            description: Yup.string().required('Description is required'),
            source_link: Yup.string().url('Must be a valid URL').required('Source link is required'), // Now required
            year: Yup.number().integer('Must be an integer').min(1800).max(new Date().getFullYear()).required('Year is required'),
            month: Yup.number().integer().min(1).max(12).required('Month is required'),
            day: Yup.number().integer().min(1).max(31).required('Day is required'),
            image_url: Yup.string().url('Must be a valid URL'),
        }),
        onSubmit: (values, { setSubmitting }) => {
            setError('');
            const method = eventToEdit ? 'PATCH' : 'POST';
            const url = eventToEdit ? `/api/events/${eventToEdit.id}` : '/api/events';

            axios({ method, url, data: values })
                .then(res => {
                    alert(`Event ${eventToEdit ? 'updated' : 'submitted'} successfully!`);
                    navigate('/');
                })
                .catch(err => {
                    setError(err.response?.data?.error || `Failed to ${eventToEdit ? 'update' : 'submit'} event.`);
                })
                .finally(() => setSubmitting(false));
        },
    });
    
    if (!user) {
        return <p>Please <a href="/login">log in</a> to submit an event.</p>;
    }
    
    if (eventToEdit && eventToEdit.user_id !== user.id) {
        return <p>You are not authorized to edit this event.</p>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h2>{eventToEdit ? 'Edit Tech Event' : 'Submit a New Tech Event'}</h2>
            <form onSubmit={formik.handleSubmit}>
                <input name="title" placeholder="Event Title" {...formik.getFieldProps('title')} />
                {formik.touched.title && formik.errors.title && <div className="error">{formik.errors.title}</div>}
                
                <textarea name="description" placeholder="Event Description" {...formik.getFieldProps('description')} />
                {formik.touched.description && formik.errors.description && <div className="error">{formik.errors.description}</div>}

                <input name="source_link" placeholder="Source Link (e.g., https://en.wikipedia.org/...)" {...formik.getFieldProps('source_link')} />
                {formik.touched.source_link && formik.errors.source_link && <div className="error">{formik.errors.source_link}</div>}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{flex: 1}}>
                        <input name="year" type="number" placeholder="Year (e.g., 2007)" {...formik.getFieldProps('year')} />
                        {formik.touched.year && formik.errors.year && <div className="error">{formik.errors.year}</div>}
                    </div>
                    <div style={{flex: 1}}>
                        <input name="month" type="number" placeholder="Month (1-12)" {...formik.getFieldProps('month')} />
                        {formik.touched.month && formik.errors.month && <div className="error">{formik.errors.month}</div>}
                    </div>
                    <div style={{flex: 1}}>
                        <input name="day" type="number" placeholder="Day (1-31)" {...formik.getFieldProps('day')} />
                        {formik.touched.day && formik.errors.day && <div className="error">{formik.errors.day}</div>}
                    </div>
                </div>

                <input name="image_url" placeholder="Image URL (optional)" {...formik.getFieldProps('image_url')} />
                {formik.touched.image_url && formik.errors.image_url && <div className="error">{formik.errors.image_url}</div>}
                
                {error && <div className="error">{error}</div>}
                <button type="submit" disabled={formik.isSubmitting}>{eventToEdit ? 'Update Event' : 'Submit Event'}</button>
            </form>
        </div>
    );
}

export default SubmitEventPage;