'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Hls from 'hls.js';

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

type BlitzMessage = {
  role: 'blitz' | 'system';
  content: string;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LessonPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [lessonComplete, setLessonComplete] = useState(false);

  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const [messages, setMessages] = useState<BlitzMessage[]>([
    {
      role: 'blitz',
      content:
        "Hey! I'm Blitz ⚡ I'll be here during your lesson. When a quiz pops up, answer it and I'll help if you get stuck. Let's go!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const progress = duration && duration > 0 ? (currentTime / duration) * 100 : 0;

  const getCheckpointPosition = useCallback(
    (timestamp: number) => {
      if (!duration || duration <= 0) return 0;
      return Math.min(Math.max((timestamp / duration) * 100, 0), 100);
    },
    [duration]
  );

  const scrollChat = useCallback(() => {
    setTimeout(() => {
      chatScrollRef.current?.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  }, []);

  // HLS init + time tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => setDuration(video.duration);
    const onTime = () => setCurrentTime(video.currentTime);
    const onEnded = () => {
      setLessonComplete(true);
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: '🎉 Lesson complete!' },
      ]);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Checkpoint detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeCheckpoint) return;

    const handler = () => {
      const ct = video.currentTime;
      const hit = CHECKPOINTS.find(
        (cp) => !answeredIds.has(cp.id) && ct >= cp.timestamp
      );
      if (hit) {
        video.pause();
        setActiveCheckpoint(hit);
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: '📋 Checkpoint reached — answer the question!' },
        ]);
        scrollChat();
      }
    };

    video.addEventListener('timeupdate', handler);
    return () => video.removeEventListener('timeupdate', handler);
  }, [answeredIds, activeCheckpoint, scrollChat]);

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
        body: JSON.stringify({
          type: isCorrect ? 'correct' : 'wrong',
          question: checkpoint.question,
          studentAnswer,
          correctAnswer,
          lessonContext: 'Computer Science 9th class - Binary conversion and operators',
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'blitz', content: data.message }]);
    } catch {
      setMessages((prev) => [
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
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = fraction * duration;
  }

  if (lessonComplete) {
    return (
      <>
        <a href="/" className="lesson-back-link">← Back to home</a>
        <div className="lesson-complete-screen">
          <div className="lesson-complete-card">
            <p className="lesson-complete-emoji">🎉</p>
            <h1 className="lesson-complete-headline">Lesson Complete!</h1>
            <p className="lesson-complete-sub">
              You answered {answeredIds.size} / {CHECKPOINTS.length} checkpoint{CHECKPOINTS.length !== 1 ? 's' : ''}.
            </p>
            <div className="lesson-complete-actions">
              <a href="/signup" className="lesson-complete-primary">
                Start Learning →
              </a>
              <a
                href="https://wa.me/923315319850"
                target="_blank"
                rel="noopener noreferrer"
                className="lesson-complete-secondary"
              >
                Talk to an Aghaaz Rep ↗
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <a href="/" className="lesson-back-link">← Back to home</a>
      <div className="lesson-container">
        {/* ── Video Panel (70%) ── */}
        <div className="video-panel">
          <div className="lesson-header">
            <div className="lesson-badge font-ethnocentric">AGHAAZ</div>
            <div className="lesson-info">
              <p className="lesson-title">Hassam Explains Binary Conversion</p>
              <p className="lesson-subtitle">
                Lesson 1 · Chapter 1: Introduction to Computers
              </p>
            </div>
            <div className="lesson-subject-badge">9th Computer Science</div>
          </div>

          <div className="video-wrapper">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              poster={THUMBNAIL_URL}
              controls
              playsInline
            />

            {activeCheckpoint && (
              <div className="quiz-overlay">
                <div className="quiz-card-overlay">
                  <p className="quiz-eyebrow">⚡ Checkpoint Quiz</p>
                  <p className="quiz-question">{activeCheckpoint.question}</p>
                  <div className="quiz-options">
                    {activeCheckpoint.options.map((option, i) => (
                      <button
                        key={i}
                        className={`quiz-option ${
                          quizResult !== null
                            ? i === activeCheckpoint.correctIndex
                              ? 'correct-flash'
                              : quizResult === 'wrong' && i === selectedIdx
                              ? 'wrong-flash'
                              : ''
                            : ''
                        }`}
                        onClick={() => {
                          if (quizResult === null) {
                            handleAnswer(i, activeCheckpoint);
                          }
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

          <div className="timeline-container">
            <div className="timeline-bar" onClick={handleTimelineClick}>
              <div
                className="timeline-progress"
                style={{ width: `${progress}%` }}
              />
              {CHECKPOINTS.map((cp) => {
                const pos = getCheckpointPosition(cp.timestamp);
                const done = answeredIds.has(cp.id);
                const isActive = activeCheckpoint?.id === cp.id;
                return (
                  <div
                    key={cp.id}
                    className={`timeline-checkpoint ${done ? 'answered' : ''} ${isActive ? 'active' : ''}`}
                    style={{ left: `${pos}%` }}
                  />
                );
              })}
            </div>
            <div className="timeline-meta">
              <span>{formatTime(currentTime)}</span>
              <span>
                {answeredIds.size} / {CHECKPOINTS.length} checkpoints
              </span>
              <span>{duration ? formatTime(duration) : '--:--'}</span>
            </div>
          </div>
        </div>

        {/* ── Blitz Panel (30%) ── */}
        <div className="blitz-panel">
          <div className="blitz-header">
            <div className="blitz-avatar">⚡</div>
            <div>
              <p className="blitz-name">Blitz</p>
              <p className="blitz-status">AI Tutor</p>
            </div>
          </div>

          <div className="blitz-chat" ref={chatScrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`blitz-message ${msg.role}`}>
                {msg.role === 'blitz' && (
                  <span className="blitz-msg-avatar">⚡</span>
                )}
                <div className="blitz-msg-bubble">
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="blitz-message blitz">
                <span className="blitz-msg-avatar">⚡</span>
                <div className="blitz-msg-bubble">
                  <div className="blitz-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>

          {showContinue && (
            <div className="blitz-continue">
              <button onClick={handleContinue} className="blitz-continue-btn">
                Continue Lesson →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
