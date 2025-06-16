import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

function HomePage() {
    const [viewMode, setViewMode] = useState('daily');
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        years: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const params = new URLSearchParams();

        if (viewMode === 'daily') {
            const [, month, day] = filters.date.split('-').map(Number);
            params.append('month', month);
            params.append('day', day);
        } else {
            const [, month] = filters.month.split('-').map(Number);
            params.append('month', month);
        }

        if (filters.years) {
            params.append('years', filters.years);
        }

        try {
            const response = await axios.get(`/api/events?${params.toString()}`);
            setEvents(response.data);
            if (response.data.length === 0) {
                setError('No events found for this selection. Try another date!');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while fetching events.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, viewMode]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
    
    return (
        <div>
            <h1>Explore Tech History</h1>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => setViewMode('daily')} disabled={viewMode === 'daily'}>Daily View</button>
                <button onClick={() => setViewMode('monthly')} disabled={viewMode === 'monthly'}>Monthly View</button>
            </div>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                {viewMode === 'daily' ? (
                    <input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
                ) : (
                    <input type="month" value={filters.month} onChange={(e) => setFilters({...filters, month: e.target.value})} />
                )}
                <input 
                    type="text" 
                    placeholder="Filter years (e.g., 2007,2010)" 
                    value={filters.years}
                    onChange={(e) => setFilters({...filters, years: e.target.value})}
                />
            </div>
            {isLoading && <p>Loading events...</p>}
            {error && <p style={{color: 'orange'}}>{error}</p>}
            {!isLoading && events.map(event => <EventCard key={event.id} event={event} />)}
        </div>
    );
}

export default HomePage;