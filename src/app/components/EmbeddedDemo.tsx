'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type Hls from 'hls.js';

const VIDEO_SRC =
  'https://vz-dfa24d6f-377.b-cdn.net/e493608b-e018-4a40-8938-a6960e7d3eb6/playlist.m3u8';
const THUMBNAIL_URL =
  'https://vz-dfa24d6f-377.b-cdn.net/e493608b-e018-4a40-8938-a6960e7d3eb6/thumbnail.jpg';

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
type BlitzMessage = { role: 'blitz' | 'system'; content: string };

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function EmbeddedDemo({
  lang,
  isActive,
  onComplete,
}: {
  lang: 'en' | 'ur';
  isActive: boolean;
  onComplete: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [lessonComplete, setLessonComplete] = useState(false);

  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(
    null,
  );
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(
    null,
  );
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const [messages, setMessages] = useState<BlitzMessage[]>([
    {
      role: 'blitz',
      content:
        lang === 'en'
          ? "Hey! I'm Blitz ⚡ I'll be here during your lesson. When a quiz pops up, answer it and I'll help if you get stuck. Let's go!"
          : 'ہیلو! میں بلٹز ہوں ⚡ میں آپ کے سبق کے دوران یہاں رہوں گا۔ جب کوئی کوئز آئے تو اس کا جواب دیں، میں مدد کروں گا!',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const progress =
    duration && duration > 0 ? (currentTime / duration) * 100 : 0;

  const getCheckpointPosition = useCallback(
    (timestamp: number) => {
      if (!duration || duration <= 0) return 0;
      return Math.min(Math.max((timestamp / duration) * 100, 0), 100);
    },
    [duration],
  );

  const scrollChat = useCallback(() => {
    setTimeout(() => {
      chatScrollRef.current?.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  }, []);

  // PERFORMANCE FIX: Only initialize HLS when the user actually reaches Scene 6
  useEffect(() => {
    if (!isActive) return;

    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => setDuration(video.duration);
    const onTime = () => setCurrentTime(video.currentTime);
    const onEnded = () => {
      setLessonComplete(true);
      setMessages(prev => [
        ...prev,
        {
          role: 'system',
          content:
            lang === 'en'
              ? '🎉 Lesson complete!'
              : '🎉 سبق مکمل ہو گیا!',
        },
      ]);
      scrollChat();
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnded);

    let cancelled = false;

    (async () => {
      const HlsModule = await import('hls.js');
      const Hls = HlsModule.default;

      if (cancelled || !videoRef.current) return;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(VIDEO_SRC);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = VIDEO_SRC;
      }
    })();

    return () => {
      cancelled = true;
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnded);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [scrollChat, lang, isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeCheckpoint || !hasStarted) return;

    const handler = () => {
      const ct = video.currentTime;
      const hit = CHECKPOINTS.find(
        cp => !answeredIds.has(cp.id) && ct >= cp.timestamp,
      );
      if (hit) {
        video.pause();
        setActiveCheckpoint(hit);
        setMessages(prev => [
          ...prev,
          {
            role: 'system',
            content:
              lang === 'en'
                ? '📋 Checkpoint reached — answer the question!'
                : '📋 چیک پوائنٹ آ گیا — سوال کا جواب دیں!',
          },
        ]);
        scrollChat();
      }
    };

    video.addEventListener('timeupdate', handler);
    return () => video.removeEventListener('timeupdate', handler);
  }, [answeredIds, activeCheckpoint, scrollChat, hasStarted, lang]);

  const handleStartDemo = () => {
    setHasStarted(true);
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

    setAnsweredIds(prev => new Set(prev).add(checkpoint.id));
    setIsLoading(true);
    scrollChat();

    try {
      const res = await fetch('/api/blitz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isCorrect ? 'correct' : 'wrong',
          question: checkpoint.question,
          studentAnswer,
          correctAnswer,
          lessonContext: 'Computer Science 9th class',
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'blitz', content: data.message }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'blitz',
          content: isCorrect
            ? 'Nice work! 🎯'
            : `Good try! The correct answer is "${correctAnswer}". Keep going!`,
        },
      ]);
    }

    setIsLoading(false);
    scrollChat();

    if (isCorrect) {
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
        setMessages(prev => [
          ...prev,
          { role: 'system', content: '▶ Video resumed' },
        ]);
        scrollChat();
      }, 2000);
    } else {
      setShowContinue(true);
    }
  }

  function handleContinue() {
    setShowContinue(false);
    videoRef.current?.play().catch(() => {});
    setMessages(prev => [
      ...prev,
      { role: 'system', content: '▶ Video resumed' },
    ]);
    scrollChat();
  }

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!videoRef.current || !duration || !hasStarted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    videoRef.current.currentTime = fraction * duration;
  }

  if (lessonComplete) {
    return (
      <div className="w-full glass-card rounded-[2rem] p-8 md:p-12 text-center max-w-3xl mx-auto flex flex-col items-center gap-4 border border-[#BFFF00]/30 shadow-[0_0_40px_rgba(191,255,0,0.15)] animate-in fade-in zoom-in duration-500">
        <p className="text-5xl md:text-6xl mb-4">🎉</p>
        <h1 className="text-2xl md:text-4xl font-bold text-white">
          {lang === 'en' ? 'Lesson Complete!' : 'سبق مکمل ہو گیا!'}
        </h1>
        <p className="text-white/50 text-sm md:text-base mb-6 font-medium">
          {lang === 'en'
            ? `You successfully answered ${answeredIds.size} / ${CHECKPOINTS.length} checkpoints.`
            : `آپ نے کامیابی سے ${answeredIds.size} / ${CHECKPOINTS.length} چیک پوائنٹس کے جواب دیے۔`}
        </p>
        <button
          onClick={onComplete}
          className="primary-pill-btn px-8 py-4 w-full md:w-auto text-base md:text-lg"
        >
          {lang === 'en'
            ? 'Continue to Pricing →'
            : 'قیمتوں کی طرف بڑھیں →'}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-6xl h-[70vh] md:h-[75vh] rounded-[2rem] relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        hasStarted
          ? 'lesson-container border border-white/10 shadow-[0_0_80px_rgba(191,255,0,0.1)]'
          : 'bg-transparent'
      }`}
    >
      {/* Galaxy Button State (Before Start) */}
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-in-out ${
          hasStarted
            ? 'opacity-0 scale-110 pointer-events-none'
            : 'opacity-100 scale-100'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {/* Intense Core Aura */}
          <div className="absolute w-[200px] h-[100px] md:w-[450px] md:h-[200px] bg-[#BFFF00] opacity-30 blur-[60px] md:blur-[80px] rounded-full animate-pulse pointer-events-none"></div>

          <button
            onClick={handleStartDemo}
            className="demo-galaxy-btn relative z-10 bg-[#BFFF00] text-[#041a0e] font-extrabold px-12 py-5 md:px-16 md:py-6 rounded-full text-xl md:text-3xl tracking-tight transition-all duration-300 hover:scale-105"
          >
            {lang === 'en' ? 'Try Aghaaz' : 'آغاز آزمائیں'}
          </button>
        </div>
      </div>

      {/* The Actual Player State (After Start) */}
      <div
        className={`w-full h-full flex flex-col md:flex-row transition-all duration-1000 delay-100 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          !hasStarted ? 'opacity-0 scale-95 pointer-events-none blur-sm' : 'opacity-100 scale-100 blur-0'
        }`}
      >
        {/* Video Panel */}
        <div className="video-panel flex-7 p-4 md:p-6 flex flex-col relative min-w-0 w-full md:w-[70%]">
          <div className="lesson-header flex items-center justify-between mb-3 md:mb-4 pr-2 md:pr-4">
            <div className="lesson-badge font-ethnocentric bg-[#074C2B] text-[#BFFF00] text-[9px] md:text-[11px] font-bold tracking-[0.1em] px-2 py-1 md:px-3 md:py-1.5 rounded-md">
              AGHAAZ
            </div>
            <div className="lesson-info flex-1 ml-3 md:ml-4 min-w-0">
              <p className="lesson-title text-white text-[13px] md:text-[15px] font-semibold truncate">
                Hassam Explains Binary Conversion
              </p>
              <p className="lesson-subtitle text-white/40 text-[10px] md:text-[12px] truncate">
                Lesson 1 · Chapter 1: Introduction to Computers
              </p>
            </div>
            <div className="hidden sm:block lesson-subject-badge border border-[#BFFF00]/30 text-[#BFFF00] text-[10px] md:text-[11px] px-2 py-1 md:px-3 md:py-1.5 rounded-full whitespace-nowrap">
              9th Computer Science
            </div>
          </div>

          <div className="video-wrapper relative w-full flex-1 min-h-[200px] md:min-h-0 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-2xl">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              poster={THUMBNAIL_URL}
              controls={false}
              playsInline
              className="w-full h-full object-contain"
            />

            {activeCheckpoint && hasStarted && (
              <div className="quiz-overlay absolute inset-0 bg-black/85 flex items-center justify-center z-10 backdrop-blur-sm p-4">
                <div className="quiz-card-overlay bg-[#0a1a0f]/95 border border-[#BFFF00]/20 rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-[450px] w-[95%] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 duration-300 text-left overflow-y-auto max-h-[90%]">
                  <p className="quiz-eyebrow text-[#BFFF00] text-[10px] md:text-[11px] uppercase tracking-[0.1em] font-bold mb-3 md:mb-4">
                    ⚡ Checkpoint Quiz
                  </p>
                  <p className="quiz-question text-white text-lg md:text-xl font-bold mb-4 md:mb-6 leading-tight">
                    {activeCheckpoint.question}
                  </p>
                  <div className="quiz-options flex flex-col gap-2 md:gap-3">
                    {activeCheckpoint.options.map((option, i) => (
                      <button
                        key={i}
                        className={`quiz-option w-full text-left p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white/90 text-[13px] md:text-[15px] font-medium transition-all duration-200 ${
                          quizResult !== null
                            ? i === activeCheckpoint.correctIndex
                              ? '!bg-[#BFFF00]/20 !border-[#BFFF00] !text-[#BFFF00]'
                              : quizResult === 'wrong' && i === selectedIdx
                              ? '!bg-red-500/20 !border-red-500 !text-red-500'
                              : ''
                            : 'hover:bg-white/10 hover:border-[#BFFF00]/50'
                        }`}
                        onClick={() => {
                          if (quizResult === null) handleAnswer(i, activeCheckpoint);
                        }}
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

          <div className="timeline-container mt-3 md:mt-4 flex-shrink-0">
            <div
              className="timeline-bar w-full h-[6px] bg-white/10 rounded-full relative cursor-pointer hover:h-[8px] transition-all"
              onClick={handleTimelineClick}
            >
              <div
                className="timeline-progress h-full bg-[#BFFF00] rounded-full transition-all duration-100 linear shadow-[0_0_10px_rgba(191,255,0,0.5)]"
                style={{ width: `${progress}%` }}
              />
              {CHECKPOINTS.map(cp => {
                const pos = getCheckpointPosition(cp.timestamp);
                const done = answeredIds.has(cp.id);
                const isActiveCp = activeCheckpoint?.id === cp.id;
                return (
                  <div
                    key={cp.id}
                    className={`timeline-checkpoint absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] md:w-[12px] md:h-[12px] border-[2px] md:border-[3px] border-[#BFFF00] transition-all duration-300 z-10 rounded-full ${
                      done ? 'bg-[#BFFF00]' : 'bg-black'
                    } ${
                      isActiveCp
                        ? 'scale-150 shadow-[0_0_15px_rgba(191,255,0,0.8)] bg-[#BFFF00]'
                        : ''
                    }`}
                    style={{ left: `${pos}%` }}
                  />
                );
              })}
            </div>
            <div className="timeline-meta flex justify-between mt-2 md:mt-3 text-[10px] md:text-[11px] text-white/40 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>
                {answeredIds.size} / {CHECKPOINTS.length} checkpoints
              </span>
              <span>{duration ? formatTime(duration) : '--:--'}</span>
            </div>
          </div>
        </div>

        {/* Blitz Panel */}
        <div className="blitz-panel flex-3 flex flex-col border-t md:border-t-0 md:border-l border-white/10 bg-[#0a0a0a]/50 w-full md:w-[30%]">
          <div className="blitz-header flex items-center gap-3 md:gap-4 p-4 md:p-6 border-b border-white/5">
            <div className="blitz-avatar w-8 h-8 md:w-10 md:h-10 bg-[#BFFF00]/10 border border-[#BFFF00]/20 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl shadow-[0_0_15px_rgba(191,255,0,0.1)]">
              ⚡
            </div>
            <div>
              <p className="blitz-name text-[#BFFF00] font-bold text-[13px] md:text-[14px]">
                Blitz
              </p>
              <p className="blitz-status text-white/40 text-[11px] md:text-[12px] font-medium">
                AI Tutor
              </p>
            </div>
          </div>
          <div
            className="blitz-chat flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scrollbar-hide"
            ref={chatScrollRef}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`blitz-message flex gap-2 md:gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === 'system' ? 'justify-center' : ''
                }`}
              >
                {msg.role === 'blitz' && (
                  <span className="blitz-msg-avatar w-6 h-6 md:w-7 md:h-7 bg-[#BFFF00]/10 rounded-md md:rounded-lg flex items-center justify-center text-[10px] md:text-[12px] mt-1 shrink-0">
                    ⚡
                  </span>
                )}
                <div
                  className={`blitz-msg-bubble ${
                    msg.role === 'system'
                      ? 'bg-transparent text-white/30 text-[10px] md:text-[11px] text-center'
                      : 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2 md:px-4 md:py-3 text-[12px] md:text-[13px] text-white/90 leading-relaxed max-w-[90%]'
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="blitz-message flex gap-2 md:gap-3 items-start animate-in fade-in duration-300">
                <span className="blitz-msg-avatar w-6 h-6 md:w-7 md:h-7 bg-[#BFFF00]/10 rounded-md md:rounded-lg flex items-center justify-center text-[10px] md:text-[12px] mt-1 shrink-0">
                  ⚡
                </span>
                <div className="blitz-msg-bubble bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-3 md:px-4 md:py-4 max-w-[90%]">
                  <div className="blitz-typing flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#BFFF00]/50 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-1.5 bg-[#BFFF00]/50 rounded-full animate-pulse delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-[#BFFF00]/50 rounded-full animate-pulse delay-150"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {showContinue && (
            <div className="blitz-continue p-4 md:p-6 border-t border-white/5 animate-in fade-in duration-300">
              <button
                onClick={handleContinue}
                className="blitz-continue-btn w-full bg-[#BFFF00] text-[#041a0e] font-bold py-3 md:py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(191,255,0,0.3)] transition-all transform hover:-translate-y-0.5 text-[13px] md:text-[15px]"
              >
                {lang === 'en' ? 'Continue Lesson →' : 'سبق جاری رکھیں →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmbeddedDemo;

