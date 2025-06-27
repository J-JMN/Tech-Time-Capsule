import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import apiClient from '../api/axios';

function EventCard({ event, onDelete }) {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

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
        <div className="event-card">
            {isOwner && (
                <div className="event-card-actions">
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={handleDelete} className="btn-delete">Delete</button>
                </div>
            )}
            <Link to={`/events/${event.id}`}>
                <h3>{event.title} ({event.year})</h3>
            </Link>
            {event.image_url && <img src={event.image_url} alt={event.title} className="event-card-image" />}
            <p>{event.description}</p>
        </div>
    );
}

export default EventCard;