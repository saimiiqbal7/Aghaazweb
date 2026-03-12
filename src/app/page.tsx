'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Hls from 'hls.js';

const TOTAL_SCENES = 8;

// --- DEMO ENGINE CONSTANTS ---
const VIDEO_SRC = 'https://vz-dfa24d6f-377.b-cdn.net/e493608b-e018-4a40-8938-a6960e7d3eb6/playlist.m3u8';
const THUMBNAIL_URL = 'https://vz-dfa24d6f-377.b-cdn.net/e493608b-e018-4a40-8938-a6960e7d3eb6/thumbnail.jpg';

const CHECKPOINTS = [
  {
    id: 'q1',
    timestamp: 42,
    question: 'Which operator will be solved first?',
    options: ['Addition', 'Multiplication'],
    correctIndex: 1,
    explanation: 'Not quite — the answer is Multiplication.',
  },
] as const;

type Checkpoint = (typeof CHECKPOINTS)[number];
type BlitzMessage = { role: 'blitz' | 'system'; content: string; };

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// --- INLINE EMBEDDED DEMO COMPONENT ---
function EmbeddedDemo({ lang }: { lang: 'en' | 'ur' }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [lessonComplete, setLessonComplete] = useState(false);

  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const [messages, setMessages] = useState<BlitzMessage[]>([
    { role: 'blitz', content: lang === 'en' ? "Hey! I'm Blitz ⚡ I'll be here during your lesson. When a quiz pops up, answer it and I'll help if you get stuck. Let's go!" : "ہیلو! میں بلٹز ہوں ⚡ میں آپ کے سبق کے دوران یہاں رہوں گا۔ جب کوئی کوئز آئے تو اس کا جواب دیں، میں مدد کروں گا!" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const progress = duration && duration > 0 ? (currentTime / duration) * 100 : 0;

  const getCheckpointPosition = useCallback((timestamp: number) => {
    if (!duration || duration <= 0) return 0;
    return Math.min(Math.max((timestamp / duration) * 100, 0), 100);
  }, [duration]);

  const scrollChat = useCallback(() => {
    setTimeout(() => {
      chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => setDuration(video.duration);
    const onTime = () => setCurrentTime(video.currentTime);
    const onEnded = () => {
      setLessonComplete(true);
      setMessages((prev) => [...prev, { role: 'system', content: lang === 'en' ? '🎉 Lesson complete!' : '🎉 سبق مکمل ہو گیا!' }]);
      scrollChat();
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnded);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(VIDEO_SRC);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = VIDEO_SRC;
    }

    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnded);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [scrollChat, lang]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeCheckpoint || !hasStarted) return;

    const handler = () => {
      const ct = video.currentTime;
      const hit = CHECKPOINTS.find((cp) => !answeredIds.has(cp.id) && ct >= cp.timestamp);
      if (hit) {
        video.pause();
        setActiveCheckpoint(hit);
        setMessages((prev) => [...prev, { role: 'system', content: lang === 'en' ? '📋 Checkpoint reached — answer the question!' : '📋 چیک پوائنٹ آ گیا — سوال کا جواب دیں!' }]);
        scrollChat();
      }
    };

    video.addEventListener('timeupdate', handler);
    return () => video.removeEventListener('timeupdate', handler);
  }, [answeredIds, activeCheckpoint, scrollChat, hasStarted, lang]);

  const handleStartDemo = () => {
    setHasStarted(true);
    // Slight delay to allow crossfade animation before playing audio
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }, 400);
  };

  async function handleAnswer(index: number, checkpoint: Checkpoint) {
    const isCorrect = index === checkpoint.correctIndex;
    const studentAnswer = checkpoint.options[index];
    const correctAnswer = checkpoint.options[checkpoint.correctIndex];

    setSelectedIdx(index);
    setQuizResult(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setActiveCheckpoint(null);
      setQuizResult(null);
      setSelectedIdx(null);
    }, 600);

    setAnsweredIds((prev) => new Set(prev).add(checkpoint.id));
    setIsLoading(true);
    scrollChat();

    try {
      const res = await fetch('/api/blitz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: isCorrect ? 'correct' : 'wrong', question: checkpoint.question, studentAnswer, correctAnswer, lessonContext: 'Computer Science 9th class' }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'blitz', content: data.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'blitz', content: isCorrect ? 'Nice work! 🎯' : `Good try! The correct answer is "${correctAnswer}". Keep going!` }]);
    }

    setIsLoading(false);
    scrollChat();

    if (isCorrect) {
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
        setMessages((prev) => [...prev, { role: 'system', content: '▶ Video resumed' }]);
        scrollChat();
      }, 2000);
    } else {
      setShowContinue(true);
    }
  }

  function handleContinue() {
    setShowContinue(false);
    videoRef.current?.play().catch(() => {});
    setMessages((prev) => [...prev, { role: 'system', content: '▶ Video resumed' }]);
    scrollChat();
  }

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!videoRef.current || !duration || !hasStarted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = fraction * duration;
  }

  if (lessonComplete) {
    return (
      <div className="w-full glass-card rounded-[2rem] p-12 text-center max-w-3xl mx-auto flex flex-col items-center gap-4 border border-[#BFFF00]/30 shadow-[0_0_40px_rgba(191,255,0,0.15)] animate-in fade-in zoom-in duration-500">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {lang === 'en' ? 'Lesson Complete!' : 'سبق مکمل ہو گیا!'}
        </h1>
        <p className="text-white/50 mb-6 font-medium">
          {lang === 'en' 
            ? `You successfully answered ${answeredIds.size} / ${CHECKPOINTS.length} checkpoints.` 
            : `آپ نے کامیابی سے ${answeredIds.size} / ${CHECKPOINTS.length} چیک پوائنٹس کے جواب دیے۔`}
        </p>
        <button onClick={() => {
          const nextBtn = document.querySelector('.story-next-btn') as HTMLButtonElement;
          if(nextBtn) nextBtn.click();
        }} className="primary-pill-btn px-10 py-4 w-full md:w-auto text-lg">
          {lang === 'en' ? 'Continue to Pricing →' : 'قیمتوں کی طرف بڑھیں →'}
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-6xl h-[65vh] md:h-[75vh] rounded-[2rem] relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${hasStarted ? 'lesson-container border border-white/10 shadow-[0_0_80px_rgba(191,255,0,0.1)]' : 'bg-transparent'}`}>
      
      {/* Galaxy Button State (Before Start) */}
      <div className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-in-out ${hasStarted ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="relative flex items-center justify-center">
          {/* Intense Core Aura */}
          <div className="absolute w-[300px] h-[150px] md:w-[450px] md:h-[200px] bg-[#BFFF00] opacity-30 blur-[80px] rounded-full animate-pulse pointer-events-none"></div>
          
          <button 
            onClick={handleStartDemo} 
            className="demo-galaxy-btn relative z-10 bg-[#BFFF00] text-[#041a0e] font-extrabold px-16 py-6 rounded-full text-2xl md:text-3xl tracking-tight transition-all duration-300 hover:scale-105"
          >
            {lang === 'en' ? 'Try Aghaaz' : 'آغاز آزمائیں'}
          </button>
        </div>
      </div>

      {/* The Actual Player State (After Start) */}
      <div className={`w-full h-full flex flex-col md:flex-row transition-all duration-1000 delay-100 ease-[cubic-bezier(0.25,1,0.5,1)] ${!hasStarted ? 'opacity-0 scale-95 pointer-events-none blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        
        {/* Video Panel */}
        <div className="video-panel flex-7 p-6 flex flex-col relative min-w-0 w-full md:w-[70%]">
          <div className="lesson-header flex items-center justify-between mb-4 pr-4">
            <div className="lesson-badge font-ethnocentric bg-[#074C2B] text-[#BFFF00] text-[11px] font-bold tracking-[0.1em] px-3 py-1.5 rounded-md">AGHAAZ</div>
            <div className="lesson-info flex-1 ml-4 min-w-0">
              <p className="lesson-title text-white text-[15px] font-semibold truncate">Hassam Explains Binary Conversion</p>
              <p className="lesson-subtitle text-white/40 text-[12px] truncate">Lesson 1 · Chapter 1: Introduction to Computers</p>
            </div>
            <div className="hidden md:block lesson-subject-badge border border-[#BFFF00]/30 text-[#BFFF00] text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap">9th Computer Science</div>
          </div>

          <div className="video-wrapper relative w-full flex-1 min-h-0 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-2xl">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} poster={THUMBNAIL_URL} controls={false} playsInline className="w-full h-full object-contain" />
            
            {activeCheckpoint && hasStarted && (
              <div className="quiz-overlay absolute inset-0 bg-black/85 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="quiz-card-overlay bg-[#0a1a0f]/95 border border-[#BFFF00]/20 rounded-3xl p-8 max-w-[450px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 duration-300 text-left">
                  <p className="quiz-eyebrow text-[#BFFF00] text-[11px] uppercase tracking-[0.1em] font-bold mb-4">⚡ Checkpoint Quiz</p>
                  <p className="quiz-question text-white text-xl font-bold mb-6 leading-tight">{activeCheckpoint.question}</p>
                  <div className="quiz-options flex flex-col gap-3">
                    {activeCheckpoint.options.map((option, i) => (
                      <button
                        key={i}
                        className={`quiz-option w-full text-left p-4 bg-white/5 border border-white/10 rounded-2xl text-white/90 text-[15px] font-medium transition-all duration-200 ${quizResult !== null ? (i === activeCheckpoint.correctIndex ? '!bg-[#BFFF00]/20 !border-[#BFFF00] !text-[#BFFF00]' : quizResult === 'wrong' && i === selectedIdx ? '!bg-red-500/20 !border-red-500 !text-red-500' : '') : 'hover:bg-white/10 hover:border-[#BFFF00]/50'}`}
                        onClick={() => { if (quizResult === null) handleAnswer(i, activeCheckpoint); }}
                        disabled={quizResult !== null}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="timeline-container mt-4 flex-shrink-0">
            <div className="timeline-bar w-full h-[6px] bg-white/10 rounded-full relative cursor-pointer hover:h-[8px] transition-all" onClick={handleTimelineClick}>
              <div className="timeline-progress h-full bg-[#BFFF00] rounded-full transition-all duration-100 linear shadow-[0_0_10px_rgba(191,255,0,0.5)]" style={{ width: `${progress}%` }} />
              {CHECKPOINTS.map((cp) => {
                const pos = getCheckpointPosition(cp.timestamp);
                const done = answeredIds.has(cp.id);
                const isActive = activeCheckpoint?.id === cp.id;
                return <div key={cp.id} className={`timeline-checkpoint absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[12px] h-[12px] border-[3px] border-[#BFFF00] transition-all duration-300 z-10 rounded-full ${done ? 'bg-[#BFFF00]' : 'bg-black'} ${isActive ? 'scale-150 shadow-[0_0_15px_rgba(191,255,0,0.8)] bg-[#BFFF00]' : ''}`} style={{ left: `${pos}%` }} />;
              })}
            </div>
            <div className="timeline-meta flex justify-between mt-3 text-[11px] text-white/40 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{answeredIds.size} / {CHECKPOINTS.length} checkpoints</span>
              <span>{duration ? formatTime(duration) : '--:--'}</span>
            </div>
          </div>
        </div>

        {/* Blitz Panel */}
        <div className="blitz-panel flex-3 flex flex-col border-t md:border-t-0 md:border-l border-white/10 bg-[#0a0a0a]/50 w-full md:w-[30%]">
          <div className="blitz-header flex items-center gap-4 p-6 border-b border-white/5">
            <div className="blitz-avatar w-10 h-10 bg-[#BFFF00]/10 border border-[#BFFF00]/20 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(191,255,0,0.1)]">⚡</div>
            <div>
              <p className="blitz-name text-[#BFFF00] font-bold text-[14px]">Blitz</p>
              <p className="blitz-status text-white/40 text-[12px] font-medium">AI Tutor</p>
            </div>
          </div>
          <div className="blitz-chat flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-hide" ref={chatScrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`blitz-message flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'system' ? 'justify-center' : ''}`}>
                {msg.role === 'blitz' && <span className="blitz-msg-avatar w-7 h-7 bg-[#BFFF00]/10 rounded-lg flex items-center justify-center text-[12px] mt-1 shrink-0">⚡</span>}
                <div className={`blitz-msg-bubble ${msg.role === 'system' ? 'bg-transparent text-white/30 text-[11px] text-center' : 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] text-white/90 leading-relaxed max-w-[90%]'}`}>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="blitz-message flex gap-3 items-start animate-in fade-in duration-300">
                <span className="blitz-msg-avatar w-7 h-7 bg-[#BFFF00]/10 rounded-lg flex items-center justify-center text-[12px] mt-1 shrink-0">⚡</span>
                <div className="blitz-msg-bubble bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-4 max-w-[90%]">
                  <div className="blitz-typing flex gap-1"><span className="w-1.5 h-1.5 bg-[#BFFF00]/50 rounded-full animate-pulse"></span><span className="w-1.5 h-1.5 bg-[#BFFF00]/50 rounded-full animate-pulse delay-75"></span><span className="w-1.5 h-1.5 bg-[#BFFF00]/50 rounded-full animate-pulse delay-150"></span></div>
                </div>
              </div>
            )}
          </div>
          {showContinue && (
            <div className="blitz-continue p-6 border-t border-white/5 animate-in fade-in duration-300">
              <button onClick={handleContinue} className="blitz-continue-btn w-full bg-[#BFFF00] text-[#041a0e] font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(191,255,0,0.3)] transition-all transform hover:-translate-y-0.5">
                {lang === 'en' ? 'Continue Lesson →' : 'سبق جاری رکھیں →'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- MAIN LANDING PAGE ---
export default function Home() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [chatLang, setChatLang] = useState<'en' | 'ur'>('en');
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const glowOrb = document.querySelector('.glow-orb');
    if (!glowOrb) return;
    const zone = activeScene < 2 ? 0 : activeScene < 4 ? 1 : activeScene < 6 ? 2 : 3;
    glowOrb.className = `glow-orb glow-zone-${zone}`;
  }, [activeScene]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeScene === 4) {
        setChatLang((prev) => (prev === 'en' ? 'ur' : 'en'));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeScene]);

  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-blob blob-1" />
        <div className="aurora-blob blob-2" />
        <div className="aurora-blob blob-3" />
        <div className="aurora-noise" />
      </div>
      <div className="stars" />
      <div className="particles" />
      <div className="glow-orb glow-zone-0" />
      <div className="vignette" />

      <header className="fixed top-6 right-8 z-50 flex items-center gap-2">
        <div className="glass-pill p-1 flex items-center gap-1 rounded-full">
          <button
            onClick={() => { setLang('en'); setChatLang('en'); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${lang === 'en' ? 'bg-[#BFFF00] text-[#041a0e] shadow-[0_0_15px_rgba(191,255,0,0.3)]' : 'text-white/50 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => { setLang('ur'); setChatLang('ur'); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${lang === 'ur' ? 'bg-[#BFFF00] text-[#041a0e] shadow-[0_0_15px_rgba(191,255,0,0.3)]' : 'text-white/50 hover:text-white'}`}
          >
            اردو
          </button>
        </div>
      </header>

      <main className="relative z-10 w-full h-screen overflow-hidden" style={{ perspective: '1200px' }}>
        <div className="progress-track">
          {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
            <button key={i} type="button" className={`progress-dot ${i === activeScene ? 'active' : ''}`} onClick={() => setActiveScene(i)} />
          ))}
        </div>

        {/* 0. HERO SCENE */}
        <section data-scene="0" className={`scene-wrapper ${activeScene === 0 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-8">
            <div className="scene-text delay-1 flex flex-col items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/[0.02] border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-xl">
                <img src="/aghaaz-logo.png" alt="Aghaaz" className="h-12 md:h-14 object-contain" />
              </div>
              <p className="font-ethnocentric text-[10px] tracking-[0.4em] uppercase text-white/50">AGHAAZ</p>
            </div>
            <h1 className="scene-text delay-2 text-5xl md:text-7xl lg:text-[88px] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-[#BFFF00] to-[#66cc00] tracking-tighter leading-[1.05] headline-glow max-w-5xl pb-2">
              {lang === 'en' ? 'The End of Boring Lectures.' : 'بورنگ لیکچرز کا خاتمہ۔'}
            </h1>
            <div className="scene-text delay-4 mt-8">
              <button onClick={() => setActiveScene(1)} className="primary-pill-btn text-lg px-8 py-4">
                {lang === 'en' ? 'See how it works' : 'دیکھیں یہ کیسے کام کرتا ہے'}
              </button>
            </div>
          </div>
        </section>

        {/* 1. THE PROBLEM */}
        <section data-scene="1" className={`scene-wrapper ${activeScene === 1 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-6 max-w-4xl">
            <p className="scene-text delay-1 eyebrow">{lang === 'en' ? 'Pakistan has a broken education system' : 'پاکستان کا تعلیمی نظام خراب ہے'}</p>
            <h2 className={`scene-text delay-2 text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.15] ${lang === 'ur' ? 'urdu-text' : ''}`}>
              {lang === 'en' ? 'For years, students in Pakistan have been stuck with boring 40-minute lectures.' : 'برسوں سے پاکستان کے طلبا بورنگ لیکچرز میں پھنسے ہوئے ہیں'}
            </h2>
          </div>
        </section>

        {/* 2. THE FIX (BARS) */}
        <section data-scene="2" className={`scene-wrapper ${activeScene === 2 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-10 max-w-5xl">
            <div className="space-y-4">
              <p className="scene-text delay-1 eyebrow">{lang === 'en' ? 'Aghaaz fixes this' : 'آغاز اسے ٹھیک کرتا ہے'}</p>
              <h2 className={`scene-text delay-2 text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] ${lang === 'ur' ? 'urdu-text' : ''}`}>
                {lang === 'en' ? 'Every topic. Broken into 10-minute lessons.' : 'ہر ٹاپک، دس منٹ کے آسان اسباق میں۔'}
              </h2>
            </div>
            
            <div className="scene-text delay-4 w-full glass-card rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mt-4">
              <div className="w-full text-left">
                <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Before</p>
                <div className="w-full h-3 rounded-full bg-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
                <p className="text-white/60 text-sm mt-4 font-medium">40 min lecture</p>
              </div>
              <div className="hidden md:block text-[#BFFF00]/30 text-3xl font-light">→</div>
              <div className="w-full text-left">
                <p className="text-[#BFFF00] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">With Aghaaz</p>
                <div className="flex gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-3 w-1/4 rounded-full bg-[#BFFF00] shadow-[0_0_20px_rgba(191,255,0,0.5)] bar-short" />)}
                </div>
                <p className="text-white/80 text-sm mt-4 font-medium">10 min each · 4 lessons</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. THE QUIZZES */}
        <section data-scene="3" className={`scene-wrapper ${activeScene === 3 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-10 max-w-6xl">
            <div className="space-y-4 max-w-3xl">
              <p className="scene-text delay-1 eyebrow">{lang === 'en' ? 'Active questioning' : 'فعال سوالات'}</p>
              <h2 className={`scene-text delay-2 text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] ${lang === 'ur' ? 'urdu-text' : ''}`}>
                {lang === 'en' ? 'Every lecture has a built-in quiz.' : 'ہر لیکچر کے اندر کوئز شامل ہے۔'}
              </h2>
            </div>
            
            <div className="scene-text delay-4 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-3xl p-8 text-left transition-transform hover:-translate-y-2 hover:border-green-500/30">
                <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] tracking-widest uppercase mb-6 font-bold">Biology</div>
                <p className="text-white text-lg font-medium mb-6 leading-snug">What is the powerhouse of the cell?</p>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white/50 text-sm">Nucleus</div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl py-3.5 px-5 text-green-400 text-sm font-medium flex justify-between items-center shadow-[0_0_15px_rgba(34,197,94,0.1)]">Mitochondria <span>✓</span></div>
                </div>
              </div>
              <div className="glass-card rounded-3xl p-8 text-left transition-transform hover:-translate-y-2 hover:border-blue-500/30">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] tracking-widest uppercase mb-6 font-bold">Physics</div>
                <p className="text-white text-lg font-medium mb-6 leading-snug">What is the SI unit of force?</p>
                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl py-3.5 px-5 text-blue-400 text-sm font-medium flex justify-between items-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">Newton <span>✓</span></div>
                  <div className="bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white/50 text-sm">Joule</div>
                </div>
              </div>
              <div className="glass-card rounded-3xl p-8 text-left transition-transform hover:-translate-y-2 hover:border-purple-500/30">
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] tracking-widest uppercase mb-6 font-bold">Mathematics</div>
                <p className="text-white text-lg font-medium mb-6 leading-snug">What is the value of sin(90°)?</p>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white/50 text-sm">0</div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl py-3.5 px-5 text-purple-400 text-sm font-medium flex justify-between items-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">1 <span>✓</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BLITZ AI */}
        <section data-scene="4" className={`scene-wrapper ${activeScene === 4 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-10 max-w-4xl">
            <div className="space-y-4">
              <p className="scene-text delay-1 eyebrow">{lang === 'en' ? "A personal tutor that doesn't get angry at you" : 'ایک ذاتی ٹیوٹر جو آپ پر غصہ نہیں کرتا'}</p>
              <h2 className={`scene-text delay-2 text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] ${lang === 'ur' ? 'urdu-text' : ''}`}>
                {lang === 'en' ? 'Meet Blitz. Your AI tutor trained on every Matric and FSc exam.' : 'بلٹز سے ملو، تمہارا AI ٹیوٹر جو میٹرک اور ایف ایس سی کے ہر امتحان پر تیار ہے۔'}
              </h2>
            </div>
            
            <div className="scene-text delay-4 w-full max-w-2xl glass-card rounded-[2rem] p-6 md:p-8 text-left relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#BFFF00] to-transparent opacity-30"></div>
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#BFFF00]/10 border border-[#BFFF00]/20 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(191,255,0,0.1)]">⚡</div>
                  <p className="text-white font-semibold text-sm">Blitz AI</p>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                  <button onClick={() => setChatLang('en')} className={`text-[10px] uppercase font-bold tracking-wider px-4 py-1.5 rounded-full transition-all ${chatLang === 'en' ? 'bg-[#BFFF00] text-[#041a0e] shadow-[0_0_10px_rgba(191,255,0,0.3)]' : 'text-white/40 hover:text-white'}`}>ENG</button>
                  <button onClick={() => setChatLang('ur')} className={`text-[10px] uppercase font-bold tracking-wider px-4 py-1.5 rounded-full transition-all ${chatLang === 'ur' ? 'bg-[#BFFF00] text-[#041a0e] shadow-[0_0_10px_rgba(191,255,0,0.3)]' : 'text-white/40 hover:text-white'}`}>URDU</button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-end chat-bubble">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm py-3 px-5 text-white/80 text-sm max-w-[85%]">
                    {chatLang === 'en' ? "I don't understand Newton's third law" : "mujhe newton ka teesra law samajh nahi araha"}
                  </div>
                </div>
                <div className="flex justify-start chat-bubble">
                  <div className="bg-[#102a1c] border border-[#BFFF00]/20 rounded-2xl rounded-tl-sm py-4 px-5 text-white/95 text-sm max-w-[90%] leading-relaxed shadow-[0_0_20px_rgba(191,255,0,0.05)]">
                    {chatLang === 'en' ? "Think of it this way — when you push a wall, the wall pushes back on your hand with the same force. That's why your hand hurts! The forces are equal and opposite. 🧱" : "Socho aise — jab aap deewar ko dhakelte hain, deewar aap ke haath par usi qawat se wapas dhakelti hai. Isi liye haath dard karta hai! Qawatein barabar aur mukhalif hain. 🧱"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. THE PRICE */}
        <section data-scene="5" className={`scene-wrapper ${activeScene === 5 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-6 max-w-4xl">
            <p className="scene-text delay-1 eyebrow">{lang === 'en' ? 'THE PRICE' : 'قیمت'}</p>
            <p className="scene-text delay-2 crossed-price text-2xl md:text-3xl font-medium text-white/30 tracking-tight">
              {lang === 'en' ? 'PKR 12,000/month' : '12,000 روپے ماہانہ'}
            </p>
            <h2 className={`real-price delay-3 text-6xl md:text-[100px] font-extrabold tracking-tighter text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.15)] ${lang === 'ur' ? 'urdu-text' : ''}`}>
              {lang === 'en' ? 'PKR 2,000/mo' : 'صرف دو ہزار ماہانہ'}
            </h2>
            <p className={`scene-text delay-5 text-xl text-white/50 mt-4 font-medium tracking-tight ${lang === 'ur' ? 'urdu-text' : ''}`}>
              {lang === 'en' ? 'All subjects. All quizzes. Blitz included. Cancel anytime.' : 'تمام مضامین۔ تمام کوئزز۔ بلٹز شامل۔ کبھی بھی بند کرو۔'}
            </p>
          </div>
        </section>

        {/* 6. INLINE DEMO PLAYER (Starry Core) */}
        <section data-scene="6" className={`scene-wrapper ${activeScene === 6 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-6 max-w-6xl w-full">
            <div className="space-y-2">
              <h2 className={`scene-text delay-2 text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.1] ${lang === 'ur' ? 'urdu-text' : ''}`}>
                {lang === 'en' ? 'See what an Aghaaz lesson feels like.' : 'دیکھو آغاز کا سبق کیسا ہوتا ہے۔'}
              </h2>
            </div>
            
            <div className="scene-text delay-3 w-full mt-8 flex justify-center">
              <EmbeddedDemo lang={lang} />
            </div>
          </div>
        </section>

        {/* 7. FINAL CTA */}
        <section data-scene="7" className={`scene-wrapper ${activeScene === 7 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-10 max-w-4xl">
            <h2 className={`scene-text delay-1 text-6xl md:text-[100px] font-extrabold text-white tracking-tighter leading-[1.05] headline-glow ${lang === 'ur' ? 'urdu-text' : ''}`}>
              {lang === 'en' ? 'Ready to start?' : 'شروع کریں؟'}
            </h2>
            <div className="scene-text delay-2 flex flex-col items-center gap-6 mt-4">
              <a href="/signup" className="bg-[#BFFF00] text-[#041a0e] font-extrabold px-12 py-5 rounded-2xl hover:shadow-[0_0_50px_rgba(191,255,0,0.4)] transition-all duration-300 text-xl md:text-2xl tracking-tight transform hover:-translate-y-1">
                {lang === 'en' ? 'Start Learning for PKR 2,000/mo' : 'سیکھنا شروع کریں →'}
              </a>
              <a href="https://wa.me/923315319850" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/80 transition-colors font-medium text-sm">
                {lang === 'en' ? 'or talk to an Aghaaz rep ↗' : 'یا آغاز نمائندہ سے بات کریں ↗'}
              </a>
            </div>
          </div>
        </section>

        {/* Floating Navigation Pill (Icon Arrows - Persists on Last Slide) */}
        {activeScene > 0 && (
          <div className="fixed bottom-8 left-0 w-full z-50 flex justify-center pointer-events-none">
            <div className="flex items-center pointer-events-auto glass-pill rounded-full p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
              <button 
                onClick={() => setActiveScene((prev) => Math.max(prev - 1, 0))} 
                className={`text-white hover:bg-white/10 transition-all w-20 h-12 flex items-center justify-center rounded-full ${activeScene === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                disabled={activeScene === 0}
                aria-label="Previous scene"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              
              <div className="w-[1px] h-6 bg-white/20 mx-1"></div>
              
              <button 
                onClick={() => setActiveScene((prev) => Math.min(prev + 1, TOTAL_SCENES - 1))} 
                className={`story-next-btn text-white hover:bg-white/10 transition-all w-20 h-12 flex items-center justify-center rounded-full ${activeScene === TOTAL_SCENES - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                disabled={activeScene === TOTAL_SCENES - 1}
                aria-label="Next scene"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}