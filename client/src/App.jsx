import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('agent');
  const [testMessage, setTestMessage] = useState('');
  const [agentInput, setAgentInput] = useState('');
  const [agentReply, setAgentReply] = useState('');
  const [issueInput, setIssueInput] = useState('');
  const [prData, setPrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then((res) => res.json())
      .then((data) => setTestMessage(data.message))
      .catch(() => setError('Failed to connect to backend. Check your terminal.'));
  }, []);

  const handleAskAgent = async (e) => {
    e.preventDefault();
    if (!agentInput.trim()) return;
    setLoading(true);
    setAgentReply('');
    setError(null);

    try {
      const resp = await fetch('http://localhost:5000/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: agentInput }),
      });
      const data = await resp.json();
      setAgentReply(data.reply);
    } catch (err) {
      setError('Agent failed to respond.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePR = async (e) => {
    e.preventDefault();
    if (!issueInput.trim()) return;
    setLoading(true);
    setPrData(null);
    setError(null);

    try {
      const resp = await fetch('http://localhost:5000/api/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue: issueInput }),
      });
      const data = await resp.json();
      
      if (data.error) throw new Error(data.details || data.error);
      setPrData(data);
    } catch (err) {
      setError(err.message || 'PR generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'agent' ? 'active' : ''}`}
          onClick={() => setActiveTab('agent')}
        >
          Inventory Chat
        </div>
        <div 
          className={`tab ${activeTab === 'pr' ? 'active' : ''}`}
          onClick={() => setActiveTab('pr')}
        >
          AI PR Simulator
        </div>
      </div>

      {activeTab === 'agent' && (
        <div className="card">
          <h1>Inventory AI</h1>
          <p className="subtitle">Conversational Agent</p>
          
          <form className="form-group" onSubmit={handleAskAgent}>
            <input 
              placeholder="e.g. 'What is low in stock?'"
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Thinking...' : 'Ask Agent'}
            </button>
          </form>

          {agentReply && (
            <div className="reply-box">
              <h3>Agent:</h3>
              <p>{agentReply}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pr' && (
        <div className={`card ${prData ? 'wide' : ''}`}>
          <h1>PR Generator</h1>
          <p className="subtitle">Issue to Pull Request</p>
          
          <form className="form-group" onSubmit={handleGeneratePR}>
            <textarea 
              placeholder="Describe the issue (e.g. 'Add a login function that takes username and password')"
              value={issueInput}
              onChange={(e) => setIssueInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Analyzing Codebase...' : 'Generate Pull Request'}
            </button>
          </form>

          {prData && (
            <div className="pr-container">
              <div className="pr-header">
                <span className="pr-tag">Open PR</span>
                <h2 className="pr-title">{prData.prTitle}</h2>
                <p className="pr-desc">{prData.prDescription}</p>
                <p style={{ marginTop: '12px', fontSize: '0.8rem', opacity: 0.5 }}>
                  Target File: <code>{prData.file}</code>
                </p>
              </div>

              <div className="diff-grid">
                <div className="diff-col">
                  <h4>Old: {prData.file}</h4>
                  <div className="code-block original">{prData.originalCode}</div>
                </div>
                <div className="diff-col">
                  <h4>New: {prData.file}</h4>
                  <div className="code-block updated">{prData.updatedCode}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="error">⚠️ {error}</div>}
    </div>
  );
}

export default App;
