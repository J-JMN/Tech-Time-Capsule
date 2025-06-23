import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function HomePage() {
    const query = useQuery();
    const navigate = useNavigate();
    const location = useLocation();

    const [isInitialLoad, setIsInitialLoad] = useState(!query.get('category_id') && !query.get('sort'));
    const [viewMode, setViewMode] = useState('daily');
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({
        date: new Date().toISOString().slice(0, 10),
        month: new Date().toISOString().slice(0, 7),
        years: '',
        sort: query.get('sort') || 'historical',
        category_id: query.get('category_id') || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError('');
        
        let url = '/api/events';
        const params = new URLSearchParams();

        if (isInitialLoad) {
            url = '/api/events/featured';
        } else {
            if (filters.category_id) {
                params.append('category_id', filters.category_id);
            } else {
                if (filters.years) {
                    params.append('years', filters.years);
                } else {
                    if (viewMode === 'daily') {
                        const [year, month, day] = filters.date.split('-').map(Number);
                        params.append('year', year); params.append('month', month); params.append('day', day);
                    } else {
                        const [year, month] = filters.month.split('-').map(Number);
                        params.append('year', year); params.append('month', month);
                    }
                }
            }
            if (filters.sort === 'newest') {
                params.append('sort', 'newest');
            }
        }

        try {
            const response = await axios.get(`${url}?${params.toString()}`);
            setEvents(response.data);
            if (response.data.length === 0) setError('No events found for this selection.');
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, isInitialLoad, viewMode]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        const categoryId = query.get('category_id');
        if (categoryId) {
            setFilters(f => ({ ...f, category_id: categoryId, years: '' }));
            if (isInitialLoad) setIsInitialLoad(false);
        }
    }, [location.search]);

    const handleFilterChange = (updates) => {
        const newFilters = { ...filters, ...updates, category_id: '' };
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
        navigate('/'); 
    };

    const handleSortChange = (sortValue) => {
        setFilters({ ...filters, sort: sortValue });
        if (isInitialLoad) setIsInitialLoad(false);
    };

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
                        <button onClick={() => setViewMode('daily')} disabled={viewMode === 'daily'}>Daily</button>
                        <button onClick={() => setViewMode('monthly')} disabled={viewMode === 'monthly'}>Monthly</button>
                    </div>
                    <div style={{marginLeft: 'auto'}}>
                        <strong>Sort By:</strong>
                        <select value={filters.sort} onChange={(e) => handleSortChange(e.target.value)}>
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
                    <input type="text" placeholder="Or filter by single/multiple years" value={filters.years} onChange={(e) => handleFilterChange({ years: e.target.value })} style={{flex: 1, minWidth: '250px'}} />
                </div>
            </div>

            {isLoading && <p>Loading events...</p>}
            {error && <p style={{color: 'orange'}}>{error}</p>}
            {!isLoading && events.map(event => <EventCard key={event.id} event={event} onDelete={handleEventDelete} />)}
        </div>
    );
}

export default HomePage;