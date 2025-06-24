import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';

// Helper hook to easily get URL query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function HomePage() {
    const query = useQuery();
    const navigate = useNavigate();
    const location = useLocation();

    // State to determine if we should show featured events or filtered results
    const [isInitialLoad, setIsInitialLoad] = useState(!query.get('category_id') && !query.get('sort'));
    
    // State for UI controls
    const [viewMode, setViewMode] = useState('daily');
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({
        date: new Date().toISOString().slice(0, 10), // e.g., "2025-06-24"
        month: new Date().toISOString().slice(0, 7),  // e.g., "2025-06"
        years: '',
        sort: query.get('sort') || 'historical',
        category_id: query.get('category_id') || ''
    });

    // State for loading and error messages
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // The main function to fetch event data from the backend
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError('');
        
        const params = new URLSearchParams();
        let url = '/api/events';

        if (isInitialLoad) {
            url = '/api/events/featured';
        } else {
            // If filtering by a category, it takes top priority
            if (filters.category_id) {
                params.append('category_id', filters.category_id);
            } else {
                // Otherwise, use the date/year filters
                // Year text input takes priority over date pickers
                if (filters.years) {
                    params.append('years', filters.years);
                } else {
                    if (viewMode === 'daily') {
                        const [year] = filters.date.split('-').map(Number);
                        params.append('year', year);
                    } else { // monthly view
                        const [year] = filters.month.split('-').map(Number);
                        params.append('year', year);
                    }
                }
                
                // Month and Day filters are always added based on the view mode
                if (viewMode === 'daily') {
                    const [, month, day] = filters.date.split('-').map(Number);
                    params.append('month', month);
                    params.append('day', day);
                } else {
                    const [, month] = filters.month.split('-').map(Number);
                    params.append('month', month);
                }
            }
            
            // Add the sorting parameter
            if (filters.sort === 'newest') {
                params.append('sort', 'newest');
            }
        }

        try {
            const response = await axios.get(`${url}?${params.toString()}`);
            setEvents(response.data);
            if (response.data.length === 0) setError('No events found for this selection.');
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while fetching events.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, isInitialLoad, viewMode]);

    // This effect runs the fetchEvents function whenever its dependencies change
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // This effect listens for changes in the URL (e.g., clicking a category link)
    useEffect(() => {
        const categoryId = query.get('category_id');
        const sort = query.get('sort');
        if (categoryId || sort) {
            setFilters(f => ({ ...f, category_id: categoryId || '', sort: sort || 'historical', years: '' }));
            if (isInitialLoad) setIsInitialLoad(false);
        }
    }, [location.search]);

    // This function handles all changes from the filter controls
    const handleFilterChange = (updates) => {
        // Create new filter state by merging updates, but clear category_id
        const newFilters = { ...filters, ...updates, category_id: '' };
        
        // Synchronize the date/month pickers if a single year is typed
        if ('years' in updates) {
            const yearInput = updates.years;
            if (/^\d{4}$/.test(yearInput)) {
                const newYear = yearInput;
                newFilters.date = `${newYear}${filters.date.substring(4)}`;
                newFilters.month = `${newYear}${filters.month.substring(4)}`;
            }
        }

        setFilters(newFilters);
        if (isInitialLoad) setIsInitialLoad(false);
        // Navigate to root to clear URL params when using main filters
        navigate('/'); 
    };
    
    // This function handles deleting an event from the list without a page refresh
    const handleEventDelete = (deletedEventId) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== deletedEventId));
    };
    
    return (
        <div>
            <h1>Explore Tech History</h1>
            <p>{isInitialLoad ? "Showing a random selection of featured events. Use the filters to find specific moments." : `Showing filtered results.`}</p>
            
            <div style={{ marginBottom: '2rem', background: '#282c34', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <strong>View Mode:</strong>
                        <button onClick={() => { setViewMode('daily'); if(isInitialLoad) setIsInitialLoad(false); }} disabled={viewMode === 'daily'}>Daily</button>
                        <button onClick={() => { setViewMode('monthly'); if(isInitialLoad) setIsInitialLoad(false); }} disabled={viewMode === 'monthly'}>Monthly</button>
                    </div>
                    <div style={{marginLeft: 'auto'}}>
                        <strong>Sort By:</strong>
                        <select value={filters.sort} onChange={(e) => handleFilterChange({ sort: e.target.value })}>
                            <option value="historical">Historical Date</option>
                            <option value="newest">Recently Added</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                    {viewMode === 'daily' ? (
                        <input type="date" value={filters.date} onChange={(e) => handleFilterChange({ date: e.target.value })} />
                    ) : (
                        <input type="month" value={filters.month} onChange={(e) => handleFilterChange({ month: e.target.value })} />
                    )}
                    <input 
                        type="text" 
                        placeholder="Or filter by single/multiple years" 
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