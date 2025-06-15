import React from 'react';

function EventCard({ event }) {
    const cardStyle = {
        border: '1px solid #444',
        margin: '1rem 0',
        padding: '1.5rem',
        borderRadius: '8px',
        backgroundColor: '#282c34'
    };

    return (
        <div style={cardStyle}>
            <h3>{event.title} ({event.year})</h3>
            {event.image_url && <img src={event.image_url} alt={event.title} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }} />}
            <p>{event.description}</p>
            {event.source_link && <a href={event.source_link} target="_blank" rel="noopener noreferrer">Source</a>}
        </div>
    );
}

export default EventCard;