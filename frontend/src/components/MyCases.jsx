import React, { useState } from 'react';
import { FolderOpen, ArrowRight, PlusCircle, Clock } from 'lucide-react';

const INITIAL_CASES = [
  {
    id: 'case-1',
    title: 'Tenant Security Deposit Recovery Notice',
    category: 'Tenant Rights',
    date: 'Updated 2 days ago',
    status: 'In Draft',
    statusColor: 'var(--color-warning)',
    type: 'Legal Notice',
    snippet: 'Draft notice to landlord for non-refund of ₹45,000 security deposit under State Rent Control guidelines.'
  },
  {
    id: 'case-2',
    title: 'RTI Application for Municipal Drainage Works',
    category: 'RTI Application',
    date: 'Updated 5 days ago',
    status: 'Ready to File',
    statusColor: 'var(--color-secondary)',
    type: 'RTI Form',
    snippet: 'Seeking breakdown of budget allocation & contractor timeline for ward 14 storm water drain.'
  },
  {
    id: 'case-3',
    title: 'Defective Electronic Appliance Refund Claim',
    category: 'Consumer Complaints',
    date: 'Updated 1 week ago',
    status: 'Completed',
    statusColor: 'var(--color-success)',
    type: 'Consumer Notice',
    snippet: 'Formal complaint notice under Consumer Protection Act 2019.'
  }
];

export default function MyCases({ onNavigate }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = INITIAL_CASES.filter((item) => {
    const matchesFilter = filter === 'all' || 
      (filter === 'draft' && item.status === 'In Draft') ||
      (filter === 'ready' && item.status === 'Ready to File') ||
      (filter === 'completed' && item.status === 'Completed');
    
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="cases-container">
      <div className="cases-header">
        <div>
          <h2 className="cases-title">
            <FolderOpen size={26} className="cases-title-icon" /> My Cases & Drafts
          </h2>
          <p className="cases-subtitle">Manage your saved RTI applications, legal notices, and ongoing advice threads.</p>
        </div>
        
        <button className="btn-primary" onClick={() => onNavigate('rti')}>
          <PlusCircle size={18} /> New Draft
        </button>
      </div>

      <div className="cases-toolbar">
        <div className="cases-search">
          <input 
            type="text" 
            placeholder="Search your cases or notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="cases-filters">
          <button 
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({INITIAL_CASES.length})
          </button>
          <button 
            className={`filter-chip ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            In Draft
          </button>
          <button 
            className={`filter-chip ${filter === 'ready' ? 'active' : ''}`}
            onClick={() => setFilter('ready')}
          >
            Ready to File
          </button>
          <button 
            className={`filter-chip ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="cases-grid">
        {filteredCases.map((c) => (
          <div key={c.id} className="case-card">
            <div className="case-card-top">
              <span className="case-type-badge">{c.type}</span>
              <span className="case-status-badge" style={{ backgroundColor: `${c.statusColor}15`, color: c.statusColor, borderColor: `${c.statusColor}40` }}>
                <Clock size={12} style={{ marginRight: '4px' }} />
                {c.status}
              </span>
            </div>

            <h3 className="case-card-title">{c.title}</h3>
            <p className="case-card-snippet">{c.snippet}</p>

            <div className="case-card-footer">
              <span className="case-card-date">{c.date}</span>
              <button className="btn-secondary case-action-btn" onClick={() => c.category === 'RTI Application' ? onNavigate('rti') : onNavigate('chat')}>
                Open <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
