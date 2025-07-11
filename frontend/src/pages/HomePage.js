import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
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
        const params = new URLSearchParams();
        let url = '/api/events';

        if (isInitialLoad) {
            url = '/api/events/featured';
        } else {
            if (filters.category_id) {
                params.append('category_id', filters.category_id);
            } else {
                if (filters.years) {
                    params.append('years', filters.years);
                } else {
                    const [year] = (viewMode === 'daily' ? filters.date : filters.month).split('-').map(Number);
                    params.append('year', year);
                }
                if (viewMode === 'daily') {
                    const [, month, day] = filters.date.split('-').map(Number);
                    params.append('month', month);
                    params.append('day', day);
                } else {
                    const [, monthOnly] = filters.month.split('-').map(Number);
                    params.append('month', monthOnly);
                }
            }
            if (filters.sort === 'newest') {
                params.append('sort', 'newest');
            }
        }
        try {
            const response = await apiClient.get(`${url}?${params.toString()}`);
            setEvents(response.data);
            if (response.data.length === 0) setError('No events found for this selection.');
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while fetching events.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, isInitialLoad, viewMode]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        const categoryId = query.get('category_id');
        if (categoryId && categoryId !== filters.category_id) {
            setIsInitialLoad(false);
            setFilters(f => ({ ...f, category_id: categoryId, years: '' }));
        }
    }, [location.search]);

    const handleFilterChange = (updates) => {
        const newFilters = { ...filters, ...updates, category_id: '' };
        if ('years' in updates) {
            const yearInput = updates.years;
            if (/^\d{4}$/.test(yearInput)) {
                newFilters.date = `${yearInput}${filters.date.substring(4)}`;
                newFilters.month = `${yearInput}${filters.month.substring(4)}`;
            }
        }
        setIsInitialLoad(false);
        setFilters(newFilters);
        if (location.search) navigate('/');
    };

    const handleEventDelete = (deletedEventId) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== deletedEventId));
    };
    
    return (
        <div>
            <h1>Explore Tech History</h1>
            <p>{isInitialLoad && !filters.category_id ? "Showing a random selection of featured events. Use the filters to find specific moments." : "Showing filtered results."}</p>
            
            <div className="filter-controls">
                <div className="filter-row">
                    <div>
                        <strong>View Mode:</strong>
                        <button onClick={() => setViewMode('daily')} disabled={viewMode === 'daily'}>Daily</button>
                        <button onClick={() => setViewMode('monthly')} disabled={viewMode === 'monthly'}>Monthly</button>
                    </div>
                    <div>
                        <strong>Sort By:</strong>
                        <select value={filters.sort} onChange={(e) => handleFilterChange({ sort: e.target.value })}>
                            <option value="historical">Historical Date</option>
                        </select>
                    </div>
                </div>

                <div className="filter-group">
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
