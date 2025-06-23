import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function EventDetailPage() {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/events/${id}`)
            .then(res => setEvent(res.data))
            .catch(err => setError('Event not found or an error occurred.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Loading event...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!event) return null;

    return (
        <div>
            {event.image_url && <img src={event.image_url} alt={event.title} style={{width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px'}} />}
            <h1>{event.title} ({event.year})</h1>
            <p style={{color: '#aaa'}}>
                Date: {event.month}/{event.day}/{event.year} | Submitted by: {event.user.username}
            </p>
            <p style={{fontSize: '1.1rem'}}>{event.description}</p>
            <a href={event.source_link} target="_blank" rel="noopener noreferrer">Learn more at the source</a>

            <h3 style={{marginTop: '2rem', borderTop: '1px solid #444', paddingTop: '1rem'}}>Related Categories:</h3>
            {event.event_categories.length > 0 ? (
                <ul style={{listStyle: 'none', padding: 0}}>
                    {event.event_categories.map(ec => (
                        <li key={ec.id} style={{background: '#282c34', padding: '1rem', margin: '0.5rem 0', borderRadius: '5px'}}>
                            <Link to={`/?category_id=${ec.category.id}`} style={{color: '#61dafb', fontWeight: 'bold', textDecoration: 'none'}}>
                                {ec.category.name}
                            </Link>
                            <p style={{margin: '0.5rem 0 0 0', fontStyle: 'italic'}}>"{ec.relationship_description}"</p>
                        </li>
                    ))}
                </ul>
            ) : <p>No categories have been assigned to this event.</p>}
        </div>
    );
}

export default EventDetailPage;