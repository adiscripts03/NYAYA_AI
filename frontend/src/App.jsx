import React, { useState } from 'react';
import './App.css';
import { House, FolderOpen, Briefcase, ArrowLeft } from 'lucide-react';
import Landing from './components/Landing';
import LoadingScreen from './components/LoadingScreen';
import Home from './components/Home';
import AIChat from './components/AIChat';
import RTIDrafting from './components/RTIDrafting';
import MyCases from './components/MyCases';
import Resources from './components/Resources';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const handleNavigate = (view, query = '') => {
    setCurrentView(view);
    if (query) {
      setInitialQuery(query);
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
        return <Home onNavigate={handleNavigate} />;
      case 'chat':
        return <AIChat onNavigate={handleNavigate} initialQuery={initialQuery} clearQuery={() => setInitialQuery('')} />;
      case 'rti':
        return <RTIDrafting onNavigate={handleNavigate} />;
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
        <header className="top-bar">
          <div className="top-bar-left">
            {/* Minimal Back Arrow Button */}
            <button 
              className="back-arrow-btn"
              onClick={() => setCurrentView('landing')}
              title="Go back to landing page"
              aria-label="Go back to landing page"
            >
              <ArrowLeft size={22} />
            </button>

            <h1 onClick={() => handleNavigate('home')} className="top-bar-brand">
              Nyaya AI
            </h1>
            
            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <button 
                className={`desktop-nav-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => handleNavigate('home')}
              >
                <House size={18} />
                <span>Home</span>
              </button>
              
              <button 
                className={`desktop-nav-item ${currentView === 'cases' ? 'active' : ''}`}
                onClick={() => handleNavigate('cases')}
              >
                <FolderOpen size={18} />
                <span>My Cases</span>
              </button>

              <button 
                className={`desktop-nav-item ${currentView === 'resources' ? 'active' : ''}`}
                onClick={() => handleNavigate('resources')}
              >
                <Briefcase size={18} />
                <span>Resources</span>
              </button>
            </nav>
          </div>
        </header>
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
