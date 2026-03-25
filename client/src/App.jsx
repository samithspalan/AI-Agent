import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to connect to backend.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="icon">⚡</div>
        <h1>Full-Stack App</h1>
        <p className="subtitle">React + Vite &nbsp;|&nbsp; Node.js + Express</p>

        <div className="status-box">
          {loading && <p className="loading">Connecting to backend...</p>}
          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
