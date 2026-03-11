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

type ActiveQuiz = {
  checkpoint: (typeof CHECKPOINTS)[number];
  selectedIndex: number | null;
  isCorrect: boolean | null;
} | null;

export default function Home() {
  const [name, setName] = useState('');

  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz>(null);

  const answeredCount = answeredIds.size;
  const checkpointProgress =
    CHECKPOINTS.length > 0 ? (answeredCount / CHECKPOINTS.length) * 100 : 0;

  const getCheckpointPosition = useCallback(
    (timestamp: number) => {
      if (!duration || duration <= 0) return 0;
      return Math.min(Math.max((timestamp / duration) * 100, 0), 100);
    },
    [duration]
  );

  // HLS init
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => setDuration(video.duration);
    video.addEventListener('loadedmetadata', onMeta);

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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Checkpoint detection via timeupdate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (activeQuiz) return;
      const ct = video.currentTime;
      const hit = CHECKPOINTS.find(
        (cp) => !answeredIds.has(cp.id) && ct >= cp.timestamp
      );
      if (hit) {
        video.pause();
        setActiveQuiz({ checkpoint: hit, selectedIndex: null, isCorrect: null });
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [answeredIds, activeQuiz]);

  const handleAnswer = (
    checkpoint: (typeof CHECKPOINTS)[number],
    index: number
  ) => {
    const correct = index === checkpoint.correctIndex;
    setActiveQuiz({ checkpoint, selectedIndex: index, isCorrect: correct });
    setAnsweredIds((prev) => new Set(prev).add(checkpoint.id));

    const delay = correct ? 1500 : 2000;
    timeoutRef.current = setTimeout(() => {
      setActiveQuiz(null);
      videoRef.current?.play().catch(() => {});
    }, delay);
  };

  // Scene scroll animations
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scene-active');
            const idx = entry.target.getAttribute('data-scene');
            document.querySelectorAll('.progress-dot').forEach((dot, i) => {
              dot.classList.toggle('active', i === Number(idx));
            });
          }
        });
      },
      { threshold: isMobile ? 0.15 : 0.3 }
    );

    document.querySelectorAll('[data-scene]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll effects (streaks + glow)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const streaks = document.querySelector('.star-streaks');
    const glowOrb = document.querySelector('.glow-orb');

    const onScroll = () => {
      streaks?.classList.add('is-scrolling');
      clearTimeout(timeout);
      timeout = setTimeout(() => streaks?.classList.remove('is-scrolling'), 300);

      if (glowOrb) {
        const total = document.body.scrollHeight - window.innerHeight;
        const fraction = total > 0 ? window.scrollY / total : 0;
        const zone = fraction < 0.25 ? 0 : fraction < 0.50 ? 1 : fraction < 0.75 ? 2 : 3;
        glowOrb.className = `glow-orb glow-zone-${zone}`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToScene1 = () => {
    document
      .querySelector('[data-scene="1"]')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
    <main className="relative z-10" style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}>
      {/* Star streaks */}
      <div className="star-streaks">
        <div className="star-streak" style={{ left: '10%', height: 80, opacity: 0.2, animationDuration: '0.7s' }} />
        <div className="star-streak" style={{ left: '25%', height: 120, opacity: 0.15, animationDuration: '1.1s' }} />
        <div className="star-streak" style={{ left: '45%', height: 60, opacity: 0.35, animationDuration: '0.6s' }} />
        <div className="star-streak" style={{ left: '60%', height: 100, opacity: 0.2, animationDuration: '0.9s' }} />
        <div className="star-streak" style={{ left: '78%', height: 70, opacity: 0.25, animationDuration: '1.2s' }} />
        <div className="star-streak" style={{ left: '92%', height: 90, opacity: 0.18, animationDuration: '0.8s' }} />
      </div>

      {/* Progress dots */}
      <div className="progress-track">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`progress-dot${i === 0 ? ' active' : ''}`} />
        ))}
      </div>

      {/* ════════════════════════════════════════
          SCENE 0 — HERO
          ════════════════════════════════════════ */}
      <section
        data-scene="0"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <div className="scene-text delay-1 flex flex-col items-center gap-4 mb-6">
            <img src="/aghaaz-logo.png" alt="Aghaaz" className="h-16 md:h-20 w-auto object-contain" />
            <p className="font-ethnocentric text-xs tracking-widest uppercase text-white/90">
              AGHAAZ
            </p>
          </div>

          <h1
            className="scene-text delay-2 gradient-text font-extrabold text-center"
            style={{ fontSize: 'clamp(36px, 7vw, 80px)' }}
          >
            Helping Matric & FSc students score better
          </h1>

          <div className="scene-text delay-4 mt-8 flex justify-center">
            <div className="name-input-row flex items-center gap-3">
              <input
                type="text"
                placeholder="Your first name"
                className="bg-white/15 border border-white/30 rounded-xl px-5 py-4 text-white placeholder-white/60 text-base focus:outline-none focus:border-[#BFFF00]/60 focus:ring-2 focus:ring-[#BFFF00]/30 w-48"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) scrollToScene1(); }}
              />
              <button
                onClick={scrollToScene1}
                disabled={!name.trim()}
                className={`bg-[#BFFF00] text-[#04160c] font-semibold px-8 py-4 rounded-xl transition-all ${
                  name.trim()
                    ? 'hover:shadow-[0_0_40px_rgba(191,255,0,0.2)] hover:-translate-y-0.5 cursor-pointer'
                    : 'opacity-50 pointer-events-none'
                }`}
              >
                Begin →
              </button>
            </div>
          </div>

          <div className="scene-text delay-5 mt-6">
            <a
              href="/login"
              className="signin-link text-white/30 text-sm underline underline-offset-4 hover:text-white/50 transition-colors"
            >
              Already a member? Sign in
            </a>
          </div>
        </div>

        <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 scroll-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SCENE 1 — THE PROBLEM
          ════════════════════════════════════════ */}
      <section
        data-scene="1"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE REALITY
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
            For years, students in Pakistan have been stuck with boring
            40-minute lectures.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            برسوں سے پاکستان کے طلبا بورنگ لیکچرز میں پھنسے ہوئے ہیں
          </p>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 2 — 10-MINUTE LESSONS
          ════════════════════════════════════════ */}
      <section
        data-scene="2"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE FIX
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
            Every topic. Broken into 10-minute lessons.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            ہر ٹاپک۔ دس منٹ کے آسان سبق میں۔
          </p>

          <div className="scene-text delay-4 bar-visual mt-10 max-w-lg mx-auto">
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
                {/* Before */}
                <div className="w-full sm:w-[45%] text-center sm:text-left">
                  <p className="bar-label text-white/50 text-[10px] uppercase tracking-wider mb-2">Before</p>
                  <div className="bar-long rounded-lg h-4 w-full border border-red-500/50 shadow-inner" style={{ background: 'rgba(239, 68, 68, 0.9)' }} />
                  <p className="bar-label text-white/70 text-xs mt-2 font-medium">40 min lecture</p>
                </div>

                <div className="flex-shrink-0 text-[#BFFF00]/50 text-2xl hidden sm:block" aria-hidden>→</div>
                <div className="flex sm:hidden text-[#BFFF00]/40 text-lg">↓</div>

                {/* After — Aghaaz */}
                <div className="w-full sm:w-[45%] text-center sm:text-left">
                  <p className="bar-label text-[#BFFF00]/80 text-[10px] uppercase tracking-wider mb-2">With Aghaaz</p>
                  <div className="bar-short-row flex gap-2 justify-center sm:justify-start">
                    <div className="bar-short bar-short-glow rounded-lg h-4 w-[23%] min-w-[48px] bg-[#BFFF00]" />
                    <div className="bar-short bar-short-glow rounded-lg h-4 w-[23%] min-w-[48px] bg-[#BFFF00]" />
                    <div className="bar-short bar-short-glow rounded-lg h-4 w-[23%] min-w-[48px] bg-[#BFFF00]" />
                    <div className="bar-short bar-short-glow rounded-lg h-4 w-[23%] min-w-[48px] bg-[#BFFF00]" />
                  </div>
                  <p className="bar-label text-white/70 text-xs mt-2 font-medium">10 min each · 4 lessons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 3 — BUILT-IN QUIZZES
          ════════════════════════════════════════ */}
      <section
        data-scene="3"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[900px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE CHECK
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
            Every lecture has a built-in quiz.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            ہر لیکچر کے اندر کوئز ہے۔
          </p>

          {/* Desktop: row — Mobile: horizontal scroll */}
          <div className="hidden md:flex gap-4 mt-8 max-w-4xl mx-auto">
            <div className="quiz-card flex-1 glass-card border-[#22c55e]/20 rounded-2xl p-6 text-left">
              <p className="text-[#22c55e] text-xs tracking-wide uppercase mb-3">Biology</p>
              <p className="question-text text-white font-medium mb-4">What is the powerhouse of the cell?</p>
              <div className="space-y-2">
                <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">Nucleus</div>
                <div className="option-btn bg-[#22c55e]/10 border border-[#22c55e]/50 rounded-xl py-3 px-5 text-[#22c55e]">Mitochondria</div>
              </div>
              <p className="text-[#22c55e] text-sm mt-3">✓ Correct!</p>
            </div>

            <div className="quiz-card flex-1 glass-card border-[#3b82f6]/20 rounded-2xl p-6 text-left">
              <p className="text-[#3b82f6] text-xs tracking-wide uppercase mb-3">Physics</p>
              <p className="question-text text-white font-medium mb-4">What is the SI unit of force?</p>
              <div className="space-y-2">
                <div className="option-btn bg-[#3b82f6]/10 border border-[#3b82f6]/50 rounded-xl py-3 px-5 text-[#3b82f6]">Newton</div>
                <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">Joule</div>
              </div>
              <p className="text-[#3b82f6] text-sm mt-3">✓ Correct!</p>
            </div>

            <div className="quiz-card flex-1 glass-card border-[#a855f7]/20 rounded-2xl p-6 text-left">
              <p className="text-[#a855f7] text-xs tracking-wide uppercase mb-3">Mathematics</p>
              <p className="question-text text-white font-medium mb-4">What is the value of sin(90°)?</p>
              <div className="space-y-2">
                <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">0</div>
                <div className="option-btn bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-xl py-3 px-5 text-[#a855f7]">1</div>
              </div>
              <p className="text-[#a855f7] text-sm mt-3">✓ Correct!</p>
            </div>
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="flex md:hidden gap-4 mt-8 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide">
            <div className="snap-center shrink-0 w-[280px]">
              <div className="quiz-card glass-card border-[#22c55e]/20 rounded-2xl p-6 text-left h-full">
                <p className="text-[#22c55e] text-xs tracking-wide uppercase mb-3">Biology</p>
                <p className="question-text text-white font-medium mb-4">What is the powerhouse of the cell?</p>
                <div className="space-y-2">
                  <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">Nucleus</div>
                  <div className="option-btn bg-[#22c55e]/10 border border-[#22c55e]/50 rounded-xl py-3 px-5 text-[#22c55e]">Mitochondria</div>
                </div>
                <p className="text-[#22c55e] text-sm mt-3">✓ Correct!</p>
              </div>
            </div>
            <div className="snap-center shrink-0 w-[280px]">
              <div className="quiz-card glass-card border-[#3b82f6]/20 rounded-2xl p-6 text-left h-full">
                <p className="text-[#3b82f6] text-xs tracking-wide uppercase mb-3">Physics</p>
                <p className="question-text text-white font-medium mb-4">What is the SI unit of force?</p>
                <div className="space-y-2">
                  <div className="option-btn bg-[#3b82f6]/10 border border-[#3b82f6]/50 rounded-xl py-3 px-5 text-[#3b82f6]">Newton</div>
                  <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">Joule</div>
                </div>
                <p className="text-[#3b82f6] text-sm mt-3">✓ Correct!</p>
              </div>
            </div>
            <div className="snap-center shrink-0 w-[280px]">
              <div className="quiz-card glass-card border-[#a855f7]/20 rounded-2xl p-6 text-left h-full">
                <p className="text-[#a855f7] text-xs tracking-wide uppercase mb-3">Mathematics</p>
                <p className="question-text text-white font-medium mb-4">What is the value of sin(90°)?</p>
                <div className="space-y-2">
                  <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">0</div>
                  <div className="option-btn bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-xl py-3 px-5 text-[#a855f7]">1</div>
                </div>
                <p className="text-[#a855f7] text-sm mt-3">✓ Correct!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 4 — MEET BLITZ
          ════════════════════════════════════════ */}
      <section
        data-scene="4"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[900px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE BACKUP
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
            Meet Blitz. Your AI tutor trained on every Matric and FSc exam.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            بلٹز سے ملو۔ تمہارا AI ٹیوٹر جو میٹرک اور ایف ایس سی کے ہر امتحان پر تیار ہے۔
          </p>

          {/* Desktop: two chats side by side */}
          <div className="hidden md:flex gap-4 mt-10 max-w-4xl mx-auto">
            <div className="scene-text delay-4 chat-mockup flex-1 glass-card rounded-2xl p-6 text-left space-y-4">
              <p className="text-white/50 text-xs tracking-wide uppercase mb-1">English</p>
              <p className="text-[#BFFF00] text-xs tracking-wide">⚡ Blitz</p>

              <div className="flex justify-end chat-bubble">
                <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                  I don&apos;t understand Newton&apos;s third law
                </div>
              </div>
              <div className="flex justify-start chat-bubble">
                <div className="bg-[#0d6b3f] rounded-2xl rounded-bl-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                  Think of it this way — when you push a wall, the wall pushes back on your hand with the same force. That&apos;s why your hand hurts! The forces are equal and opposite. 🧱
                </div>
              </div>
              <div className="flex justify-end chat-bubble">
                <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                  Oh that makes sense!
                </div>
              </div>
            </div>

            <div className="scene-text delay-4 chat-mockup flex-1 glass-card rounded-2xl p-6 text-left space-y-4">
              <p className="text-white/50 text-xs tracking-wide uppercase mb-1">Urdu</p>
              <p className="text-[#BFFF00] text-xs tracking-wide">⚡ Blitz</p>

              <div className="flex justify-end chat-bubble">
                <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                  mujhe newton ka teesra law samajh nahi araha
                </div>
              </div>
              <div className="flex justify-start chat-bubble">
                <div className="bg-[#0d6b3f] rounded-2xl rounded-bl-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                  Socho aise — jab aap deewar ko dhakelte hain, deewar aap ke haath par usi qawat se wapas dhakelti hai. Isi liye haath dard karta hai! Qawatein barabar aur mukhalif hain. 🧱
                </div>
              </div>
              <div className="flex justify-end chat-bubble">
                <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                  Oh samajh aa gayi!
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: horizontal scroll, two chats */}
          <div className="flex md:hidden gap-4 mt-10 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide">
            <div className="snap-center shrink-0 w-[280px]">
              <div className="scene-text delay-4 chat-mockup h-full glass-card rounded-2xl p-5 text-left space-y-3">
                <p className="text-white/50 text-xs tracking-wide uppercase mb-1">English</p>
                <p className="text-[#BFFF00] text-xs tracking-wide">⚡ Blitz</p>
                <div className="flex justify-end chat-bubble">
                  <div className="bg-white/10 rounded-2xl rounded-br-md py-2.5 px-4 text-white/90 max-w-[85%] text-sm">I don&apos;t understand Newton&apos;s third law</div>
                </div>
                <div className="flex justify-start chat-bubble">
                  <div className="bg-[#0d6b3f] rounded-2xl rounded-bl-md py-2.5 px-4 text-white/90 max-w-[85%] text-sm">Think of it this way — when you push a wall, the wall pushes back. The forces are equal and opposite. 🧱</div>
                </div>
                <div className="flex justify-end chat-bubble">
                  <div className="bg-white/10 rounded-2xl rounded-br-md py-2.5 px-4 text-white/90 max-w-[85%] text-sm">Oh that makes sense!</div>
                </div>
              </div>
            </div>
            <div className="snap-center shrink-0 w-[280px]">
              <div className="scene-text delay-4 chat-mockup h-full glass-card rounded-2xl p-5 text-left space-y-3">
                <p className="text-white/50 text-xs tracking-wide uppercase mb-1">Urdu</p>
                <p className="text-[#BFFF00] text-xs tracking-wide">⚡ Blitz</p>
                <div className="flex justify-end chat-bubble">
                  <div className="bg-white/10 rounded-2xl rounded-br-md py-2.5 px-4 text-white/90 max-w-[85%] text-sm">mujhe newton ka teesra law samajh nahi araha</div>
                </div>
                <div className="flex justify-start chat-bubble">
                  <div className="bg-[#0d6b3f] rounded-2xl rounded-bl-md py-2.5 px-4 text-white/90 max-w-[85%] text-sm">Socho aise — jab aap deewar ko dhakelte hain, deewar wapas dhakelti hai. Qawatein barabar aur mukhalif hain. 🧱</div>
                </div>
                <div className="flex justify-end chat-bubble">
                  <div className="bg-white/10 rounded-2xl rounded-br-md py-2.5 px-4 text-white/90 max-w-[85%] text-sm">Oh samajh aa gayi!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 5 — THE PRICE
          ════════════════════════════════════════ */}
      <section
        data-scene="5"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE PRICE
          </p>

          <p className="scene-text delay-2 crossed-price text-2xl md:text-4xl text-white/30 line-through decoration-white/30">
            PKR 12,000/month
          </p>

          <h2
            className="real-price delay-3 gradient-text font-bold mt-4"
            style={{ fontSize: 'clamp(40px, 8vw, 80px)' }}
          >
            PKR 2,000/month
          </h2>

          <p className="scene-text delay-4 text-2xl md:text-3xl urdu-text text-white/20">
            صرف دو ہزار ماہانہ
          </p>

          <p className="scene-text delay-5 text-lg text-white/40 mt-6">
            All subjects. All quizzes. Blitz included. Cancel anytime.
          </p>

          <p className="scene-text delay-6 text-base urdu-text text-white/15">
            تمام مضامین۔ تمام کوئزز۔ بلٹز شامل۔ کبھی بھی بند کرو۔
          </p>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 6 — TRY IT NOW (DEMO)
          ════════════════════════════════════════ */}
      <section
        data-scene="6"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[900px] w-full">
          <div className="scene-text delay-1">
            <p className="eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-1">
              TRY IT NOW
            </p>
            <p className="text-sm urdu-text text-[#BFFF00]/40">
              آزما کر دیکھو
            </p>
          </div>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow mt-6">
            See what an Aghaaz lesson feels like.
          </h2>

          <p className="scene-text delay-2 text-xl md:text-2xl urdu-text">
            دیکھو آغاز کا سبق کیسا ہوتا ہے۔
          </p>

          {/* Header bar above video */}
          <div className="scene-text delay-3 w-full max-w-3xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-ethnocentric bg-[#04160c] border border-white/5 text-white text-[10px] tracking-wide px-3 py-1.5 rounded-full">
                AGHAAZ
              </span>
              <span className="text-[#BFFF00] border border-[#BFFF00]/30 bg-[#BFFF00]/5 text-xs px-3 py-1 rounded-full">
                9th Computer Science
              </span>
            </div>
            <p className="text-left text-white/80 text-sm mb-0.5">Hassam Explains Binary Conversion</p>
            <p className="text-left text-white/40 text-xs mb-3">Lesson 1 · Chapter 1: Introduction to Computers</p>
          </div>

          {/* Video container */}
          <div className="scene-text delay-3 demo-container w-full max-w-3xl mx-auto rounded-xl overflow-hidden glass bg-[#04160c]/80 shadow-2xl shadow-black/50 relative">
            <div className="relative aspect-video">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                poster={THUMBNAIL_URL}
                controls
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Quiz overlay rendered outside <main> to escape 3D containing block */}
            </div>
          </div>

          {/* Checkpoint progress bar */}
          <div className="scene-text delay-4 w-full max-w-3xl mx-auto mt-4">
            <div className="flex items-center justify-between text-white/40 text-xs mb-2">
              <span>Checkpoint progress</span>
              <span>{answeredCount} / {CHECKPOINTS.length} answered</span>
            </div>
            <div className="relative h-1.5 bg-white/5 rounded-full w-full">
              <div
                className="absolute inset-y-0 left-0 bg-[#BFFF00]/30 rounded-full transition-all duration-500"
                style={{ width: `${checkpointProgress}%` }}
              />
              {CHECKPOINTS.map((cp) => {
                const pos = getCheckpointPosition(cp.timestamp);
                const done = answeredIds.has(cp.id);
                return (
                  <div
                    key={cp.id}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${pos}%` }}
                  >
                    <div
                      className={`w-2.5 h-2.5 rotate-45 border ${
                        done
                          ? 'bg-[#BFFF00] border-[#BFFF00]'
                          : 'bg-transparent border-white/30'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="scene-text delay-4 demo-note mt-4">
            <p className="text-sm text-white/30">
              This is a real Aghaaz lesson with a built-in quiz. Try answering
              when it pops up.
            </p>
            <p className="text-sm urdu-text text-white/15">
              یہ ایک اصلی آغاز سبق ہے جس میں کوئز شامل ہے۔ جب سوال آئے تو جواب دو۔
            </p>
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 7 — FINAL DECISION
          ════════════════════════════════════════ */}
      <section
        data-scene="7"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <h2 className="scene-text delay-1 text-4xl md:text-6xl font-bold text-white headline-glow">
            Ready, {name || 'friend'}?
          </h2>

          <p className="scene-text delay-1 text-2xl md:text-3xl urdu-text">
            {name || 'دوست'}، تیار ہو؟
          </p>

          <div className="scene-text delay-2 mt-8">
            <div className="final-cta-row flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/signup"
                className="cta-button bg-[#BFFF00] text-[#04160c] font-semibold px-10 py-4 rounded-xl hover:shadow-[0_0_40px_rgba(191,255,0,0.2)] hover:-translate-y-0.5 transition-all text-lg"
              >
                Start Learning →
              </a>
              <a
                href="https://wa.me/923315319850"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/15 text-white font-medium px-10 py-4 rounded-xl hover:bg-white/10 hover:border-white/25 transition-all text-lg"
              >
                Talk to an Aghaaz Rep ↗
              </a>
            </div>
          </div>

          <footer className="scene-text delay-3 pt-20">
            <p className="text-white/20 text-xs">
              Aghaaz (private) limited
            </p>
            <div className="text-white/20 text-xs mt-2 space-x-1">
              <a
                href="https://www.instagram.com/aghaaz.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/40 transition-colors"
              >
                Instagram
              </a>
              <span>·</span>
              <a
                href="https://www.linkedin.com/company/aghaazpak/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/40 transition-colors"
              >
                LinkedIn
              </a>
              <span>·</span>
              <a
                href="https://wa.me/923315319850"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/40 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </footer>
        </div>
      </section>
    </main>

      {activeQuiz && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm z-[9999] p-4">
          <div className="rounded-2xl border border-[#BFFF00]/15 bg-[#0a1a0f]/95 backdrop-blur-xl p-5 sm:p-8 max-w-sm w-full text-left max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/40">
            <p className="text-[#BFFF00] text-xs tracking-wide uppercase mb-1">Checkpoint Quiz</p>
            <p className="text-lg sm:text-xl font-semibold text-white mb-5">
              {activeQuiz.checkpoint.question}
            </p>
            <div className="space-y-3">
              {activeQuiz.checkpoint.options.map((opt, i) => {
                const selected = activeQuiz.selectedIndex === i;
                const correct = i === activeQuiz.checkpoint.correctIndex;
                const answered = activeQuiz.selectedIndex !== null;

                let btnClass =
                  'w-full text-left py-3 px-5 rounded-xl border transition-all duration-200 text-sm sm:text-base ';
                if (answered && selected && activeQuiz.isCorrect) {
                  btnClass += 'bg-[#BFFF00]/15 border-[#BFFF00] text-[#BFFF00]';
                } else if (answered && selected && !activeQuiz.isCorrect) {
                  btnClass += 'bg-red-500/15 border-red-500/50 text-red-400';
                } else if (answered && correct) {
                  btnClass += 'bg-[#BFFF00]/15 border-[#BFFF00] text-[#BFFF00]';
                } else {
                  btnClass +=
                    'bg-white/5 border-white/10 text-white hover:border-[#BFFF00]/50 hover:bg-[#BFFF00]/5';
                }

                return (
                  <button
                    key={i}
                    className={btnClass}
                    disabled={answered}
                    onClick={() => handleAnswer(activeQuiz.checkpoint, i)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {activeQuiz.selectedIndex !== null && (
              <p
                className={`mt-4 text-sm font-medium ${
                  activeQuiz.isCorrect ? 'text-[#BFFF00]' : 'text-red-400'
                }`}
              >
                {activeQuiz.isCorrect
                  ? '✓ Correct!'
                  : activeQuiz.checkpoint.explanation}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
