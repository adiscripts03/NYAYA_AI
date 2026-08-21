import React, { useState, useEffect } from 'react';
import './App.css';
import { House, FolderOpen, Briefcase, ArrowLeft, Scale, Moon, Sun, LogOut, Gavel, User } from 'lucide-react';
import Landing from './components/Landing';
import LoadingScreen from './components/LoadingScreen';
import Home from './components/Home';
import AIChat from './components/AIChat';
import RTIDrafting from './components/RTIDrafting';
import BailDrafting from './components/BailDrafting';
import MyCases from './components/MyCases';
import Resources from './components/Resources';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const saved = sessionStorage.getItem('nyaya_current_view');
    // Restore to saved view if it exists and isn't 'landing'
    return (saved && saved !== 'landing') ? saved : 'landing';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialQuery, setInitialQuery] = useState({ text: '', autoSend: false, greeting: '', caseId: null });

  const [userPersona, setUserPersona] = useState(() => {
    return localStorage.getItem('nyaya_persona') || 'citizen';
  });

  const togglePersona = () => {
    const newPersona = userPersona === 'citizen' ? 'lawyer' : 'citizen';
    setUserPersona(newPersona);
    localStorage.setItem('nyaya_persona', newPersona);
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('nyaya_theme') === 'dark';
  });

  // Persist current view to sessionStorage
  useEffect(() => {
    if (currentView === 'landing') {
      sessionStorage.removeItem('nyaya_current_view');
    } else {
      sessionStorage.setItem('nyaya_current_view', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('nyaya_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('nyaya_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleNavigate = (view, query = '', autoSend = true, greeting = '', caseId = null) => {
    setCurrentView(view);
    if (query || greeting || caseId) {
      setInitialQuery({ text: query, autoSend, greeting, caseId });
    }
  };

  const handleEnterSystem = () => {
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setCurrentView('home');
  };

  const renderView = () => {
    if (isLoading) {
      return <LoadingScreen onComplete={handleLoadingComplete} />;
    }

    switch(currentView) {
      case 'landing':
        return <Landing onNavigate={handleEnterSystem} />;
      case 'home':
        return <Home onNavigate={handleNavigate} userPersona={userPersona} />;
      case 'chat':
        return <AIChat 
                 onNavigate={handleNavigate} 
                 initialQuery={initialQuery.text} 
                 autoSend={initialQuery.autoSend}
                 initialGreeting={initialQuery.greeting}
                 caseId={initialQuery.caseId}
                 userPersona={userPersona}
                 clearQuery={() => setInitialQuery({ text: '', autoSend: false, greeting: '', caseId: null })} 
               />;
      case 'rti':
        return <RTIDrafting onNavigate={handleNavigate} caseId={initialQuery.caseId} />;
      case 'bail':
        return <BailDrafting onNavigate={handleNavigate} caseId={initialQuery.caseId} />;
      case 'cases':
        return <MyCases onNavigate={handleNavigate} />;
      case 'resources':
        return <Resources onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-container">
      {currentView !== 'landing' && !isLoading && (
        <aside className="side-bar">
          <div className="side-bar-top">
            <div className="side-bar-brand" onClick={() => handleNavigate('home')} title="Nyaya AI">
              <Scale size={28} />
            </div>
            
            <nav className="side-nav">
              <button 
                className={`side-nav-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => handleNavigate('home')}
                title="Home"
              >
                <House size={22} />
              </button>
              
              <button 
                className={`side-nav-item ${currentView === 'cases' ? 'active' : ''}`}
                onClick={() => handleNavigate('cases')}
                title="My Cases"
              >
                <FolderOpen size={22} />
              </button>

              <button 
                className={`side-nav-item ${currentView === 'resources' ? 'active' : ''}`}
                onClick={() => handleNavigate('resources')}
                title="Resources"
              >
                <Briefcase size={22} />
              </button>
            </nav>
          </div>
          
          <div className="side-bar-bottom">
            <button 
              className="side-nav-item"
              onClick={togglePersona}
              title={userPersona === 'citizen' ? "Switch to Pro Mode" : "Switch to Citizen Mode"}
              style={userPersona === 'lawyer' ? { color: 'var(--color-primary)' } : {}}
            >
              {userPersona === 'citizen' ? <User size={22} /> : <Gavel size={22} />}
            </button>
            <button 
              className="side-nav-item"
              onClick={toggleTheme}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button 
              className="side-nav-item back-btn"
              onClick={() => {
                setCurrentView('landing');
              }}
              title="Exit to Landing"
            >
              <LogOut size={22} />
            </button>
          </div>
        </aside>
      )}

      <main className={`main-content ${currentView === 'home' ? 'single-screen' : ''}`} style={currentView === 'landing' || isLoading ? { padding: 0 } : {}}>
        {renderView()}
      </main>

      {/* Bottom Navigation for Mobile Only */}
      {currentView !== 'landing' && !isLoading && currentView !== 'rti' && currentView !== 'chat' && (
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
          >
            <House size={20} />
            <span>Home</span>
          </button>
          
          <button 
            className={`nav-item ${currentView === 'cases' ? 'active' : ''}`}
            onClick={() => handleNavigate('cases')}
          >
            <FolderOpen size={20} />
            <span>My Cases</span>
          </button>

          <button 
            className={`nav-item ${currentView === 'resources' ? 'active' : ''}`}
            onClick={() => handleNavigate('resources')}
          >
            <Briefcase size={20} />
            <span>Resources</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
