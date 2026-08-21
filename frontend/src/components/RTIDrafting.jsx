import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Download, CheckCircle } from 'lucide-react';

export default function RTIDrafting({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    department: '',
    information: ''
  });

  const totalSteps = 3;

  const handleNext = () => setStep(Math.min(step + 1, totalSteps));
  const handlePrev = () => setStep(Math.max(step - 1, 1));

  return (
    <div className="rti-flow">
      <div className="rti-header">
        <button onClick={() => onNavigate('home')}>
          <ArrowLeft size={28} />
        </button>
        <h2>File an RTI</h2>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
      </div>

      <div className="rti-content">
        <div className="wizard-container">
          <div className="wizard-step">
            {step === 1 && (
              <div>
                <h2>Your Details</h2>
                <p>Let's start with basic information so the government knows where to send the reply.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g., Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Complete Address</label>
                    <textarea 
                      className="input-field" 
                      placeholder="Where should the response be mailed?"
                      rows={4}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2>Target Department</h2>
                <p>Which government department holds the information you need?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Department Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g., Municipal Corporation of Delhi"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2>The Information</h2>
                <p>What exactly do you want to know? Try to be as specific as possible.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Your Request</label>
                    <textarea 
                      className="input-field" 
                      placeholder="I would like to request the following information regarding..."
                      rows={6}
                      value={formData.information}
                      onChange={(e) => setFormData({...formData, information: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="wizard-actions">
            {step > 1 ? (
              <button className="btn-secondary" onClick={handlePrev}>
                Back
              </button>
            ) : <div></div>}
            
            {step < totalSteps ? (
              <button className="btn-primary" onClick={handleNext}>
                Continue <ArrowRight size={20} />
              </button>
            ) : (
              <button className="btn-primary" style={{ backgroundColor: 'var(--color-success)' }}>
                <CheckCircle size={20} /> Finalize
              </button>
            )}
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="live-preview">
          <h3>Live Document Preview</h3>
          <div className="document-content">
To,
The Public Information Officer (PIO),
{formData.department ? formData.department : '[Department Name]'}

Subject: Request for Information under Right to Information Act, 2005.

Sir/Madam,
I, {formData.name ? formData.name : '[Your Name]'}, a citizen of India, request you to provide the following information under the RTI Act, 2005:

{formData.information ? formData.information : '[Your specific questions and requests will appear here]'}

Please send the information to my mailing address:
{formData.address ? formData.address : '[Your Address]'}

Sincerely,
{formData.name ? formData.name : '[Your Name]'}
          </div>
        </div>
      </div>
    </div>
  );
}
