import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import apiClient from '../api/axios';

function EventCard({ event, onDelete }) {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const cardStyle = { border: '1px solid #444', margin: '1rem 0', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#282c34', position: 'relative'};
    const isOwner = user && user.id === event.user_id;

    const handleEdit = () => {
        navigate('/submit', { state: { eventId: event.id } });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            apiClient.delete(`/api/events/${event.id}`)
                .then(() => {
                    alert('Event deleted successfully.');
                    if (onDelete) onDelete(event.id);
                })
                .catch(err => {
                    alert(err.response?.data?.error || 'Failed to delete event.');
                });
        }
    };

    return (
        <div style={cardStyle}>
            {isOwner && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleEdit} style={{padding: '5px 10px', fontSize: '0.8rem'}}>Edit</button>
                    <button onClick={handleDelete} style={{padding: '5px 10px', fontSize: '0.8rem', backgroundColor: '#ff6b6b'}}>Delete</button>
                </div>
            )}
            <Link to={`/events/${event.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <h3>{event.title} ({event.year})</h3>
            </Link>
            {event.image_url && <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }} />}
            <p>{event.description}</p>
        </div>
    );
}

export default EventCard;