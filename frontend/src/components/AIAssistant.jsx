import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send, AlertOctagon, HelpCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const AIAssistant = ({ isOpen, onClose, onTaskCreated, onMissionPlanned }) => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('idle'); // idle | listening | processing | result | error
  const [errorMsg, setErrorMsg] = useState('');
  const [aiResult, setAiResult] = useState(null); // stores task_data or proposal_data
  const [originalPrompt, setOriginalPrompt] = useState('');
  
  // Speech Recognition setup (Web Speech API)
  const [recognition, setRecognition] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        
        rec.onstart = () => {
          setStatus('listening');
          setErrorMsg('');
        };
        
        rec.onerror = (e) => {
          console.error(e);
          setStatus('idle');
          setErrorMsg('AUDIO_RECOGNITION_ERROR: Failed to capture speech.');
        };
        
        rec.onend = () => {
          // If we didn't transit to processing, reset to idle
          setStatus(current => current === 'listening' ? 'idle' : current);
        };
        
        rec.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          setInputText(transcript);
          setStatus('processing');
          handleExecute(transcript);
        };
        
        setRecognition(rec);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleStartListening = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    } else {
      setErrorMsg('SYS_AUDIO_FAILURE: Web Speech API is not supported in this browser.');
    }
  };

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
      setStatus('idle');
    }
  };

  const handleExecute = async (overridePrompt = null, force = false) => {
    const promptToSend = (overridePrompt || inputText).trim();
    if (!promptToSend) return;
    
    setOriginalPrompt(promptToSend);
    setStatus('processing');
    setErrorMsg('');
    setAiResult(null);
    
    try {
      const response = await api.post('/api/ai/classify/', {
        prompt: promptToSend,
        force: force
      });
      
      const data = response.data;
      setAiResult(data);
      setStatus('result');
      
      if (data.intent === 'create_task') {
        if (onTaskCreated) onTaskCreated();
      } else if (data.intent === 'create_mission') {
        if (onMissionPlanned) onMissionPlanned();
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'AI_MATRIX_DECODE_FAILED: Could not parse input.');
    }
  };

  const handleCreateDuplicateAnyway = () => {
    if (aiResult && aiResult.task) {
      handleExecute(originalPrompt, true);
    }
  };

  const resetAssistant = () => {
    setInputText('');
    setStatus('idle');
    setErrorMsg('');
    setAiResult(null);
  };

  return (
    <div className="retro-modal-backdrop" onClick={onClose}>
      <div 
        className="retro-card retro-card-pink" 
        style={{ width: '100%', maxWidth: '560px', backgroundColor: '#070913', boxShadow: '0 0 25px rgba(255, 0, 127, 0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid var(--neon-pink)', paddingBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '0.85rem', color: 'var(--neon-pink)', fontFamily: 'var(--font-header)', letterSpacing: '1px' }}>
            👾 TASKY_AI // MISSION_CONTROL
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--neon-pink)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Console Body */}
        <div style={{ background: '#030408', border: '1px solid var(--neon-pink-dark)', padding: '1.5rem', minHeight: '220px', fontFamily: 'var(--font-body)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* IDLE STATE */}
          {status === 'idle' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--neon-pink)', fontSize: '1.1rem', marginBottom: '1rem' }} className="crt-glow">
                [ READY_FOR_COMMAND ]
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                "Tell me what you need to accomplish..."
              </p>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your objective (e.g. 'I need to buy milk' or 'I need to launch my portfolio by Monday')"
                className="retro-input"
                style={{ borderColor: 'var(--neon-pink-dark)', color: 'var(--neon-pink)', height: '80px', resize: 'none', marginBottom: '1rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleExecute();
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={handleStartListening} className="retro-btn retro-btn-pink" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mic size={14} /> 🎙️ SPEAK
                </button>
                <button onClick={() => handleExecute()} className="retro-btn retro-btn-green" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Send size={14} /> EXECUTE
                </button>
              </div>
            </div>
          )}

          {/* LISTENING STATE */}
          {status === 'listening' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ color: 'var(--neon-red)', fontSize: '1.1rem', marginBottom: '1.25rem' }} className="flash-pulse">
                🎙️ LISTENING...
              </div>
              
              {/* Retro Wave Visualizer Simulation */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', height: '30px', marginBottom: '1.5rem' }}>
                <div style={{ width: '6px', height: '10px', backgroundColor: 'var(--neon-red)', animation: 'wave 0.8s infinite alternate' }}></div>
                <div style={{ width: '6px', height: '24px', backgroundColor: 'var(--neon-red)', animation: 'wave 0.5s infinite alternate' }}></div>
                <div style={{ width: '6px', height: '14px', backgroundColor: 'var(--neon-red)', animation: 'wave 0.7s infinite alternate' }}></div>
                <div style={{ width: '6px', height: '30px', backgroundColor: 'var(--neon-red)', animation: 'wave 0.4s infinite alternate' }}></div>
                <div style={{ width: '6px', height: '18px', backgroundColor: 'var(--neon-red)', animation: 'wave 0.6s infinite alternate' }}></div>
              </div>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                "Tell me your task..."
              </p>
              
              <button onClick={handleStopListening} className="retro-btn retro-btn-red" style={{ width: 'auto' }}>
                [ STOP ]
              </button>
            </div>
          )}

          {/* PROCESSING STATE */}
          {status === 'processing' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <Loader2 size={36} color="var(--neon-pink)" className="spin" style={{ margin: '0 auto 1.25rem auto' }} />
              <div style={{ color: 'var(--neon-pink)', fontSize: '1rem', marginBottom: '0.5rem' }}>
                PROCESSING INPUT...
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                CLASSIFYING TASK PARAMS & SCHEMA...
              </p>
            </div>
          )}

          {/* RESULT STATE */}
          {status === 'result' && aiResult && (
            <div style={{ textAlign: 'left' }}>
              
              {/* Scenario 1: Duplicate Warning */}
              {aiResult.intent === 'duplicate_warning' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--neon-amber)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <AlertOctagon size={20} /> ⚠ POSSIBLE DUPLICATE
                  </div>
                  <div className="retro-card" style={{ display: 'inline-block', borderStyle: 'dashed', borderColor: 'var(--neon-amber)', padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#090a12', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Active task already in board:
                    </div>
                    <strong style={{ color: 'var(--neon-cyan)', fontSize: '0.95rem' }}>{aiResult.task?.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.3rem' }}>
                      Category: {aiResult.task?.category?.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button onClick={resetAssistant} className="retro-btn" style={{ width: 'auto' }}>
                      [ KEEP EXISTING ]
                    </button>
                    <button onClick={handleCreateDuplicateAnyway} className="retro-btn retro-btn-green" style={{ width: 'auto' }}>
                      [ CREATE ANYWAY ]
                    </button>
                  </div>
                </div>
              )}

              {/* Scenario 2: Simple Task Created */}
              {aiResult.intent === 'create_task' && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ color: 'var(--neon-green)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                    ✓ ADDED TO BOARD
                  </div>
                  <div className="retro-card" style={{ display: 'inline-block', padding: '1rem', backgroundColor: '#090a12', textAlign: 'left', minWidth: '280px', marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--neon-cyan)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{aiResult.task?.title}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                      <span className="retro-badge badge-category">{aiResult.task?.category?.toUpperCase()}</span>
                      <span className={`retro-badge ${
                        aiResult.task?.priority === 'urgent' ? 'badge-prio-urgent' :
                        aiResult.task?.priority === 'high' ? 'badge-prio-high' :
                        aiResult.task?.priority === 'medium' ? 'badge-prio-medium' : 'badge-prio-low'
                      }`}>{aiResult.task?.priority?.toUpperCase()}</span>
                    </div>
                  </div>
                  <button onClick={resetAssistant} className="retro-btn retro-btn-green" style={{ width: 'auto' }}>
                    [ CREATE ANOTHER ]
                  </button>
                </div>
              )}

              {/* Scenario 3: Complex Mission Created */}
              {aiResult.intent === 'create_mission' && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ color: 'var(--neon-pink)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                    MISSION DETECTED
                  </div>
                  <div className="retro-card" style={{ display: 'inline-block', padding: '1.25rem', backgroundColor: '#090a12', textAlign: 'left', minWidth: '280px', marginBottom: '1.5rem' }}>
                    <strong style={{ color: 'var(--neon-pink)', fontSize: '0.95rem' }}>{aiResult.proposal?.goal}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {aiResult.proposal?.proposed_tasks?.length || 0} objectives generated.
                    </div>
                  </div>
                  <div style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    → SENT TO APPROVAL QUEUE
                  </div>
                  <button onClick={resetAssistant} className="retro-btn" style={{ width: 'auto' }}>
                    [ DISMISS ]
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ color: 'var(--neon-red)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertOctagon size={20} /> ⚠ AI SYSTEM ERROR
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '1.5rem', background: 'rgba(255, 51, 102, 0.1)', padding: '0.75rem', border: '1px solid var(--neon-red)' }}>
                {errorMsg}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={resetAssistant} className="retro-btn" style={{ width: 'auto' }}>
                  [ TRY AGAIN ]
                </button>
                <button onClick={onClose} className="retro-btn retro-btn-red" style={{ width: 'auto' }}>
                  [ DISMISS ]
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Wave CSS animations */}
      <style>{`
        @keyframes wave {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.2); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .flash-pulse {
          animation: flash-pulse 1s infinite alternate;
        }
        @keyframes flash-pulse {
          0% { opacity: 0.6; text-shadow: 0 0 2px var(--neon-red); }
          100% { opacity: 1; text-shadow: 0 0 10px var(--neon-red); }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
