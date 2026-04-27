import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [userName, setUserName] = useState('Loading...')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // ネットワーク状態の監視 (ネットワーク制御テスト用)
  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // APIモックの検証用
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUserName(data.name))
      .catch(() => setUserName('Error'));

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // 疑似ダウンロード処理
  const handleDownload = () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-file.txt';
    a.click();
  };

  return (
    <div className="App">
      <h1>Playwright Demo</h1>

      {/* E2E / スタイル検証用 */}
      <section className="card">
        <button 
          onClick={() => setCount((count) => count + 1)}
          style={{ backgroundColor: '#f9f9f9', color: '#333' }}
        >
          count is {count}
        </button>
        <p>Button is {count > 5 ? 'Active' : 'Normal'}</p>
      </section>

      {/* ネットワーク/モック検証用 */}
      <section className="card">
        <p>User Name: <span data-testid="user-name">{userName}</span></p>
        {isOffline && <p style={{ color: 'red' }}>You are offline</p>}
      </section>

      {/* ファイル操作検証用 */}
      <section className="card">
        <input type="file" aria-label="file-upload" />
        <button onClick={handleDownload}>Download File</button>
      </section>

      {/* 複数タブ検証用 */}
      <section className="card">
        <a href="https://playwright.dev" target="_blank" rel="noreferrer">
          Open New Tab
        </a>
      </section>

      {/* 言語設定検証用 */}
      <section className="card">
        <p>Current Locale: {Intl.DateTimeFormat().resolvedOptions().locale}</p>
        <p>Current Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
      </section>
    </div>
  )
}

export default App
