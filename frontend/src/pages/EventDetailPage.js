import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';

function EventDetailPage() {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);
        apiClient.get(`/api/events/${id}`)
            .then(res => setEvent(res.data))
            .catch(err => setError('Event not found or an error occurred.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Loading event...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!event) return null;

    return (
        <div>
            {event.image_url && <img src={event.image_url} alt={event.title} className="event-card-image" />}
            <h1>{event.title} ({event.year})</h1>
            <p style={{color: '#aaa'}}>
                Date: {event.month}/{event.day}/{event.year} | Submitted by: {event.user.username}
            </p>
            <p style={{fontSize: '1.1rem'}}>{event.description}</p>
            {event.source_link && <a href={event.source_link} target="_blank" rel="noopener noreferrer">Learn more at the source</a>}

            <h3 style={{marginTop: '2rem', borderTop: '1px solid #444', paddingTop: '1rem'}}>Related Categories:</h3>
            {event.event_categories.length > 0 ? (
                <ul className="category-list">
                    {event.event_categories.map(ec => (
                        <li key={ec.id} className="category-item">
                            <Link to={`/?category_id=${ec.category.id}`} className="category-name">
                                {ec.category.name}
                            </Link>
                            <p className="category-desc" style={{fontStyle: 'italic'}}>"{ec.relationship_description}"</p>
                        </li>
                    ))}
                </ul>
            ) : <p>No categories have been assigned to this event.</p>}
        </div>
    );
}

export default EventDetailPage;