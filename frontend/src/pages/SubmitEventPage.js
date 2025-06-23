import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

function SubmitEventPage() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const eventIdToEdit = location.state?.eventId;

    const [availableCategories, setAvailableCategories] = useState([]);
    const [initialValues, setInitialValues] = useState({
        title: '', description: '', source_link: '', year: '',
        month: '', day: '', image_url: '', categories: []
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/categories').then(res => {
            setAvailableCategories(res.data);
        });

        if (eventIdToEdit) {
            axios.get(`/api/events/${eventIdToEdit}`).then(res => {
                const event = res.data;
                setInitialValues({
                    title: event.title, description: event.description,
                    source_link: event.source_link, year: event.year,
                    month: event.month, day: event.day, image_url: event.image_url || '',
                    categories: event.event_categories.map(ec => ({
                        category_id: ec.category.id,
                        relationship_description: ec.relationship_description
                    }))
                });
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [eventIdToEdit]);

    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
        source_link: Yup.string().url('Must be a valid URL').required('Source link is required'),
        year: Yup.number().integer().min(1000).max(new Date().getFullYear()).required('Year is required'),
        month: Yup.number().integer().min(1).max(12).required('Month is required'),
        day: Yup.number().integer().min(1).max(31).required('Day is required'),
        image_url: Yup.string().url('Must be a valid URL'),
        categories: Yup.array().of(
            Yup.object().shape({
                category_id: Yup.string().required('Category selection is required'),
                relationship_description: Yup.string().required('Relationship description is required'),
            })
        )
    });

    const handleSubmit = (values, { setSubmitting }) => {
        setError('');
        const method = eventIdToEdit ? 'PATCH' : 'POST';
        const url = eventIdToEdit ? `/api/events/${eventIdToEdit}` : '/api/events';

        axios({ method, url, data: values })
            .then(res => {
                alert(`Event ${eventIdToEdit ? 'updated' : 'submitted'} successfully!`);
                navigate(`/events/${res.data.id}`);
            })
            .catch(err => setError(err.response?.data?.error || 'An error occurred.'))
            .finally(() => setSubmitting(false));
    };

    if (!user) return <p>Please <a href="/login">log in</a> to submit an event.</p>;
    if (loading) return <p>Loading form...</p>;

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <h2>{eventIdToEdit ? 'Edit Tech Event' : 'Submit a New Tech Event'}</h2>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
                {({ values, isSubmitting }) => (
                    <Form>
                        <Field name="title" placeholder="Event Title" as={CustomInput} />
                        <Field name="description" placeholder="Event Description" as="textarea" rows="5" className="input-style" />
                        <ErrorMessage name="description" component="div" className="error" />
                        <Field name="source_link" placeholder="Source Link (e.g., https://en.wikipedia.org/...)" as={CustomInput} />
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Field name="year" type="number" placeholder="Year" as={CustomInput} />
                            <Field name="month" type="number" placeholder="Month" as={CustomInput} />
                            <Field name="day" type="number" placeholder="Day" as={CustomInput} />
                        </div>

                        <Field name="image_url" placeholder="Image URL (optional)" as={CustomInput} />

                        <div style={{background: '#282c34', padding: '1rem', borderRadius: '5px', margin: '2rem 0'}}>
                            <FieldArray name="categories">
                                {({ push, remove }) => (
                                    <div>
                                        <h3 style={{marginTop: 0}}>Assign Categories</h3>
                                        {values.categories.map((cat, index) => (
                                            <div key={index} style={{display: 'flex', gap: '1rem', alignItems: 'start', borderTop: '1px solid #444', paddingTop: '1rem', marginBottom: '1rem'}}>
                                                <div style={{flex: 2}}>
                                                    <Field as="select" name={`categories.${index}.category_id`} className="input-style">
                                                        <option value="">Select a Category</option>
                                                        {availableCategories.map(ac => <option key={ac.id} value={ac.id}>{ac.name}</option>)}
                                                    </Field>
                                                    <ErrorMessage name={`categories.${index}.category_id`} component="div" className="error" />
                                                </div>
                                                <div style={{flex: 3}}>
                                                    <Field name={`categories.${index}.relationship_description`} placeholder="Relationship (e.g., 'Pioneering work')" className="input-style"/>
                                                    <ErrorMessage name={`categories.${index}.relationship_description`} component="div" className="error" />
                                                </div>
                                                <button type="button" onClick={() => remove(index)} style={{background: '#ff6b6b'}}>X</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => push({ category_id: '', relationship_description: '' })}>
                                            + Add Category Assignment
                                        </button>
                                    </div>
                                )}
                            </FieldArray>
                        </div>
                        
                        {error && <div className="error">{error}</div>}
                        <button type="submit" disabled={isSubmitting}>{eventIdToEdit ? 'Update Event' : 'Submit Event'}</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

const CustomInput = ({ field, form, ...props }) => {
    return (
        <>
            <input {...field} {...props} />
            {form.touched[field.name] && form.errors[field.name] && <div className="error">{form.errors[field.name]}</div>}
        </>
    );
};

export default SubmitEventPage;