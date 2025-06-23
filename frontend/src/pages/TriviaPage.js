import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function TriviaPage() {
    const initialScore = Number(localStorage.getItem('triviaScore')) || 0;
    const [score, setScore] = useState(initialScore);
    const [question, setQuestion] = useState(null);
    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [answered, setAnswered] = useState(false);

    useEffect(() => {
        localStorage.setItem('triviaScore', score);
    }, [score]);

    const fetchQuestion = useCallback(() => {
        setLoading(true);
        setFeedback('');
        setGuess('');
        setAnswered(false);
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
        if (answered) return;
        const userGuess = parseInt(guess);
        if (isNaN(userGuess)) {
            setFeedback('Please enter a valid year.');
            return;
        }
        setAnswered(true);
        if (userGuess === question.correct_year) {
            setFeedback(`✅ Correct! The year was ${question.correct_year}.`);
            setScore(prev => prev + 1);
        } else {
            setFeedback(`❌ Not quite. The correct year was ${question.correct_year}.`);
        }
        setTimeout(() => {
            fetchQuestion();
        }, 3000);
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
                        <input type="number" placeholder="Enter Year (e.g., 1995)" value={guess} onChange={e => setGuess(e.target.value)} style={{ textAlign: 'center', marginBottom: '1rem' }} disabled={answered} />
                        <button type="submit" disabled={answered}>
                            {answered ? 'Waiting for next question...' : 'Submit Guess'}
                        </button>
                    </form>
                    {feedback && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{feedback}</p>}
                </div>
            ) : <p>No questions available.</p>}
        </div>
    );
}

export default TriviaPage;