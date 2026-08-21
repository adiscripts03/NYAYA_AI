import React, { useEffect, useState } from 'react';
import themisImg from '../assets/themis.jpg';
import logoImg from '../assets/logo.svg'; 
import { ArrowRight } from 'lucide-react';

export default function Landing({ onNavigate }) {
  const [emerged, setEmerged] = useState(false);

  useEffect(() => {
    setTimeout(() => setEmerged(true), 100);
  }, []);

  return (
    <div className="landing-page minimalist">
      
      {/* Single Full-Bleed Hero Image with Overlays */}
      <section className={`landing-hero-fullscreen ${emerged ? 'emerged' : ''}`}>
        <img 
          src={themisImg} 
          alt="Lady of Justice" 
          className="themis-bg-image"
        />
        <div className="themis-ambient-glow"></div>
        
        {/* Absolute Logo Overlay */}
        <div className="landing-logo-overlay">
          <img src={logoImg} alt="Ashoka Stambh Logo" className="landing-logo-img" />
          <span className="landing-logo-text">NYAYA AI</span>
        </div>

        {/* Overlay Content */}
        <div className="landing-overlay-content">
          <div className={`landing-slogan ${emerged ? 'emerged' : ''}`}>
            <h2>जानीहि, रक्ष स्वाधिकारम्</h2>
            <p>"Know it. Protect your own rights."</p>
          </div>

          <div className={`landing-action ${emerged ? 'emerged' : ''}`}>
            <button className="btn-landing-minimal" onClick={() => onNavigate('home')}>
              <span>Enter System</span>
              <ArrowRight size={20} className="btn-arrow-icon" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
