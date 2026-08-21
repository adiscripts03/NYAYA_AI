import React, { useState } from 'react';
import { Briefcase, BookOpen, FileCheck, PhoneCall, Scale, ArrowRight, ShieldCheck } from 'lucide-react';

const LEGAL_TEMPLATES = [
  {
    id: 'tmpl-1',
    title: 'RTI Application Form (Sec 6(1))',
    desc: 'Standard template for requesting public information from central & state departments.',
    actionTarget: 'rti'
  },
  {
    id: 'tmpl-2',
    title: 'Security Deposit Legal Notice',
    desc: 'Formal demand notice under Rent Control guidelines for non-refund of tenant deposit.',
    actionTarget: 'chat'
  },
  {
    id: 'tmpl-3',
    title: 'Consumer Redressal Complaint Draft',
    desc: 'Template for filing grievance regarding defective products or deficient service.',
    actionTarget: 'chat'
  }
];

const GUIDES = [
  {
    title: 'Know Your Rights: Tenant & Landlord Law',
    summary: 'Key provisions under Model Tenancy Act & State Rent Control laws.',
    tag: 'Housing'
  },
  {
    title: 'Consumer Protection Act 2019 Guide',
    summary: 'E-commerce rights, refund policies, and filing process in NCH portal.',
    tag: 'Consumer'
  },
  {
    title: 'Workplace Rights & Severance Guide',
    summary: 'Notice period terms, gratuity calculation, and unlawful termination remedies.',
    tag: 'Labor'
  }
];

const HELPLINES = [
  { name: 'National Consumer Helpline (NCH)', number: '1915', desc: 'Free consumer grievance portal' },
  { name: 'RTI Information & Assistance', number: '1800-11-2355', desc: 'Central CIC Information desk' },
  { name: 'National Legal Services Authority (NALSA)', number: '15100', desc: 'Free legal aid helpline' }
];

export default function Resources({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="resources-container">
      <div className="resources-header">
        <div>
          <h2 className="resources-title">
            <Briefcase size={26} className="resources-title-icon" /> Legal Resources & Knowledge Hub
          </h2>
          <p className="resources-subtitle">Free legal notice templates, statutory guides, and national helpline directories.</p>
        </div>
      </div>

      <div className="resources-tabs">
        <button 
          className={`resource-tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FileCheck size={18} /> Templates & Forms
        </button>
        <button 
          className={`resource-tab ${activeTab === 'guides' ? 'active' : ''}`}
          onClick={() => setActiveTab('guides')}
        >
          <BookOpen size={18} /> Rights & Legal Guides
        </button>
        <button 
          className={`resource-tab ${activeTab === 'helplines' ? 'active' : ''}`}
          onClick={() => setActiveTab('helplines')}
        >
          <PhoneCall size={18} /> National Helplines
        </button>
      </div>

      {activeTab === 'templates' && (
        <div className="resources-grid">
          {LEGAL_TEMPLATES.map((tmpl) => (
            <div key={tmpl.id} className="resource-card">
              <div className="resource-card-icon">
                <FileCheck size={24} />
              </div>
              <h3 className="resource-card-title">{tmpl.title}</h3>
              <p className="resource-card-desc">{tmpl.desc}</p>
              <button 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '16px', fontSize: '0.9rem' }}
                onClick={() => onNavigate(tmpl.actionTarget)}
              >
                Use Template <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'guides' && (
        <div className="resources-grid">
          {GUIDES.map((guide, idx) => (
            <div key={idx} className="resource-card">
              <span className="resource-tag">{guide.tag}</span>
              <h3 className="resource-card-title" style={{ marginTop: '10px' }}>{guide.title}</h3>
              <p className="resource-card-desc">{guide.summary}</p>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', marginTop: '16px', fontSize: '0.9rem' }}
                onClick={() => onNavigate('chat')}
              >
                Ask Assistant About This <Scale size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'helplines' && (
        <div className="resources-grid">
          {HELPLINES.map((h, idx) => (
            <div key={idx} className="resource-card helpline-card">
              <div className="helpline-icon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="resource-card-title">{h.name}</h3>
              <div className="helpline-number">{h.number}</div>
              <p className="resource-card-desc">{h.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
