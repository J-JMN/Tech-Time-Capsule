import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function TriviaPage() {
    const [question, setQuestion] = useState(null);
    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchQuestion = useCallback(() => {
        setLoading(true);
        setFeedback('');
        setGuess('');
        axios.get('/api/trivia')
            .then(res => setQuestion(res.data))
            .catch(err => setFeedback('Could not load a question. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const userGuess = parseInt(guess);
        if (isNaN(userGuess)) {
            setFeedback('Please enter a valid year.');
            return;
        }
        if (userGuess === question.correct_year) {
            setFeedback(`✅ Correct! The year was ${question.correct_year}.`);
            setScore(prev => prev + 1);
        } else {
            setFeedback(`❌ Not quite. The correct year was ${question.correct_year}.`);
        }
    };

    if (loading) return <p>Loading new question...</p>;

    return (
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
            <h2>Tech Trivia Challenge!</h2>
            <p style={{fontSize: '1.5rem'}}>Score: {score}</p>
            {question ? (
                <div style={{ background: '#282c34', padding: '2rem', borderRadius: '8px' }}>
                    <p>In what year did this event occur?</p>
                    <blockquote style={{ fontStyle: 'italic', margin: '2rem 0', fontSize: '1.1rem' }}>
                        "{question.description}"
                    </blockquote>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="number"
                            placeholder="Enter Year (e.g., 1995)"
                            value={guess}
                            onChange={e => setGuess(e.target.value)}
                            style={{ textAlign: 'center', marginBottom: '1rem' }}
                        />
                        <button type="submit">Submit Guess</button>
                    </form>
                    {feedback && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{feedback}</p>}
                </div>
            ) : <p>No questions available.</p>}
            <button onClick={fetchQuestion} style={{ marginTop: '2rem' }}>
                {feedback ? 'Next Question' : 'Try a Different Question'}
            </button>
        </div>
    );
}

export default TriviaPage;