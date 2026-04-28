import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [userName, setUserName] = useState('Loading...')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUserName(data.name))
      .catch(() => setUserName('Error'));

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleDownload = () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-file.txt';
    a.click();
  };

  return (
    <div className="container">
      <header>
        <h1>Playwright Demo</h1>
      </header>

      <main className="grid-layout">
        {/* 各セクションを独立したカードとして配置 */}
        <section className="card">
          <h2>Counter</h2>
          <button 
            className="btn-counter"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p>Status: {count > 5 ? 'Active' : 'Normal'}</p>
        </section>

        <section className="card">
          <h2>Network</h2>
          <p>User: <span data-testid="user-name">{userName}</span></p>
          {isOffline && <p className="offline-alert">You are offline</p>}
        </section>

        <section className="card">
          <h2>Files</h2>
          <div className="stack">
            <input type="file" aria-label="file-upload" />
            <button onClick={handleDownload}>Download File</button>
          </div>
        </section>

        <section className="card">
          <h2>Links</h2>
          <a href="https://playwright.dev" target="_blank" rel="noreferrer" className="link-btn">
            Open New Tab
          </a>
        </section>

        <section className="card">
          <h2>Locales</h2>
          <p>Locale: {Intl.DateTimeFormat().resolvedOptions().locale}</p>
          <p>TZ: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        </section>
      </main>
    </div>
  )
}

export default App
