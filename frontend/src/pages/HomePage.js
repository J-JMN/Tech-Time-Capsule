import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

function HomePage() {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [viewMode, setViewMode] = useState('daily');
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({
        date: new Date().toISOString().slice(0, 10),
        month: new Date().toISOString().slice(0, 7),
        years: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError('');
        
        const params = new URLSearchParams();
        let url = '/api/events';

        if (isInitialLoad) {
            url = '/api/events/featured';
        } else {
            // FIX STARTS HERE: This logic is now flattened to combine all filters correctly.
            // It no longer uses an if/else block that separates the filters.

            // Always add the month and day filter based on the current view mode.
            if (viewMode === 'daily') {
                const [year, month, day] = filters.date.split('-').map(Number);
                params.append('month', month);
                params.append('day', day);
            } else { // monthly view
                const [month] = filters.month.split('-').map(Number).slice(1);
                params.append('month', month);
            }

            // Now, determine the year filter. The text input takes priority.
            if (filters.years) {
                // If the text input has a value, use it for the year(s).
                params.append('years', filters.years);
            } else {
                // Otherwise, use the year from the relevant date/month picker.
                if (viewMode === 'daily') {
                    const [year] = filters.date.split('-').map(Number);
                    params.append('year', year);
                } else { // monthly view
                    const [year] = filters.month.split('-').map(Number);
                    params.append('year', year);
                }
            }
            // FIX ENDS HERE
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
        // This effect now triggers a fetch whenever a filter changes.
        // The initial fetch is handled by the effect below this one.
        if (!isInitialLoad) {
            fetchEvents();
        }
    }, [filters, viewMode, isInitialLoad]); // Removed fetchEvents from here to prevent loops

    useEffect(() => {
        // This effect runs only once on initial load to get featured events
        fetchEvents();
    }, []); // Empty dependency array ensures it runs once on mount

    const handleFilterChange = (updates) => {
        const newFilters = { ...filters, ...updates };
        if ('years' in updates) {
            const yearInput = updates.years;
            if (/^\d{4}$/.test(yearInput)) {
                const newYear = yearInput;
                const currentMonthDay = newFilters.date.substring(4);
                const currentMonth = newFilters.month.substring(4);
                newFilters.date = `${newYear}${currentMonthDay}`;
                newFilters.month = `${newYear}${currentMonth}`;
            }
        }
        setFilters(newFilters);
        if (isInitialLoad) {
            setIsInitialLoad(false);
        }
    };
    
    // The rest of the component remains the same
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