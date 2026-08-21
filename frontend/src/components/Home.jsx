import React, { useState } from 'react';
import { Search, ArrowRight, House, Briefcase, FileText, Landmark, Scroll, Clock } from 'lucide-react';

const CATEGORIES = [
  { id: 'tenant', title: 'Tenant Rights', icon: House, greeting: "Hello! I specialize in Tenant Rights. Are you dealing with a security deposit issue, an eviction, or a lease dispute?" },
  { id: 'consumer', title: 'Consumer Complaints', icon: Search, greeting: "Hello! I can help you navigate consumer protection laws. What product, service, or seller are you having trouble with?" },
  { id: 'workplace', title: 'Workplace Issues', icon: Briefcase, greeting: "Hello! I'm here to assist with workplace rights. Are you facing problems with wrongful termination, unpaid wages, or harassment?" },
  { id: 'rti', title: 'RTI Applications', icon: FileText, greeting: "Hello! I can help you draft a Right to Information (RTI) application." },
  { id: 'welfare', title: 'Welfare Schemes', icon: Landmark, greeting: "Hello! I can help you discover government welfare schemes. Could you tell me a bit about your demographic and financial situation?" },
  { id: 'general', title: 'General Legal Advice', icon: Scroll, greeting: "Hello. I'm Nyaya AI. I can help you understand your rights and figure out your next steps. What situation are you dealing with today?" },
];

export default function Home({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onNavigate('chat', searchQuery, true); // True to auto-send from search bar
    } else {
      onNavigate('chat');
    }
  };

  return (
    <div className="home-single-screen">
      {/* Compact Hero Section */}
      <section className="home-hero">
        <h2>Hi, how can we help you today?</h2>
        <p>Explain your legal situation in plain words, and we'll guide you through your rights.</p>
      </section>

      {/* Search Input Bar */}
      <div className="home-search-bar">
        <input 
          type="text" 
          placeholder="E.g., My landlord isn't returning my deposit..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearchSubmit();
          }}
        />
        <button onClick={handleSearchSubmit} className="search-submit-btn" aria-label="Search">
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Common Topics Grid */}
      <section className="home-topics-section">
        <h3 className="home-section-title">Common Legal Topics</h3>
        <div className="home-categories-grid">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className="home-category-card"
              onClick={() => {
                if (cat.id === 'rti') onNavigate('rti');
                else onNavigate('chat', '', false, cat.greeting); // Empty query, no auto-send, custom greeting
              }}
            >
              <div className="home-category-icon">
                <cat.icon size={22} />
              </div>
              <span className="home-category-label">{cat.title}</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* Recent Activity Card */}
      <section className="home-recent-card">
        <div className="recent-left">
          <div className="recent-badge">
            <Clock size={14} /> Draft
          </div>
          <div>
            <div className="recent-title">RTI Application for Municipal Road Repair</div>
            <div className="recent-meta">Ward 14 • Saved 2 days ago</div>
          </div>
        </div>
        <button className="btn-secondary recent-resume-btn" onClick={() => onNavigate('rti')}>
          Resume Draft <ArrowRight size={14} />
        </button>
      </section>
    </div>
  );
}
