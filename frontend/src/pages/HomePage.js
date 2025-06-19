import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

function HomePage() {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
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
        
        let url;
        const params = new URLSearchParams();

        if (isInitialLoad) {
            url = '/api/events/featured';
        } else {
            url = '/api/events';
            if (filters.years) {
                params.append('years', filters.years);
            } else {
                if (viewMode === 'daily') {
                    const [year, month, day] = filters.date.split('-').map(Number);
                    params.append('year', year);
                    params.append('month', month);
                    params.append('day', day);
                } else { // monthly view
                    const [year, month] = filters.month.split('-').map(Number);
                    params.append('year', year);
                    params.append('month', month);
                }
            }
        }

        try {
            const response = await axios.get(`${url}?${params.toString()}`);
            setEvents(response.data);
            if (response.data.length === 0) {
                setError('No events found for this selection.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while fetching events.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, isInitialLoad, viewMode]);

    useEffect(() => {
        // fetch when filters change, not on every render
        if (!isInitialLoad) {
            fetchEvents();
        }
    }, [filters, isInitialLoad]); 

    useEffect(() => {
        fetchEvents();
    }, []); 

    const handleFilterChange = (updates) => {
        const newFilters = { ...filters, ...updates };
        // Check if the 'years' text input was the one that changed.
        if ('years' in updates) {
            const yearInput = updates.years;
            // Check if the input is a single, valid 4-digit year
            if (/^\d{4}$/.test(yearInput)) {
                const newYear = yearInput;
                // Update the date and month pickers to reflect this new year
                const currentMonthDay = newFilters.date.substring(4); // -MM-DD
                const currentMonth = newFilters.month.substring(4);   // -MM
                newFilters.date = `${newYear}${currentMonthDay}`;
                newFilters.month = `${newYear}${currentMonth}`;
            }
        }

        setFilters(newFilters);
        if (isInitialLoad) {
            setIsInitialLoad(false);
        }
    };

    const handleEventDelete = (deletedEventId) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== deletedEventId));
    };
    
    return (
        <div>
            <h1>Explore Tech History</h1>
            <p>{isInitialLoad ? "Showing a random selection of featured events. Use the filters to find specific moments." : `Showing ${viewMode} results.`}</p>
            
            <div style={{ marginBottom: '2rem', background: '#282c34', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '1rem' }}>
                    <strong>View Mode:</strong>
                    <button onClick={() => { setViewMode('daily'); if(isInitialLoad) setIsInitialLoad(false); }} disabled={viewMode === 'daily'}>Daily</button>
                    <button onClick={() => { setViewMode('monthly'); if(isInitialLoad) setIsInitialLoad(false); }} disabled={viewMode === 'monthly'}>Monthly</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {viewMode === 'daily' ? (
                        <input type="date" value={filters.date} onChange={(e) => handleFilterChange({ date: e.target.value })} />
                    ) : (
                        <input type="month" value={filters.month} onChange={(e) => handleFilterChange({ month: e.target.value })} />
                    )}
                    <input 
                        type="text" 
                        placeholder="Or filter by a single year (e.g., 2007)" 
                        value={filters.years}
                        onChange={(e) => handleFilterChange({ years: e.target.value })}
                        style={{flex: 1, minWidth: '250px'}}
                    />
                </div>
            </div>

            {isLoading && <p>Loading events...</p>}
            {error && <p style={{color: 'orange'}}>{error}</p>}
            {!isLoading && events.map(event => <EventCard key={event.id} event={event} onDelete={handleEventDelete} />)}
        </div>
    );
}

export default HomePage;