'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { texts } from '@/lib/texts';

const durations = [15, 30, 60];
const emptyStats = { wpm: 0, raw: 0, accuracy: 100, consistency: 100, errors: 0, uncorrectedErrors: 0, correctedErrors: 0, correct: 0, keystrokes: 0 };

export default function TypingTest() {
  const [language, setLanguage] = useState('English');
  const [duration, setDuration] = useState(30);
  const [textIndex, setTextIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState('idle');
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [samples, setSamples] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [correctedErrors, setCorrectedErrors] = useState(0);
  const inputRef = useRef(null);
  const passageRef = useRef(null);
  const currentCharRef = useRef(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, height: 42, visible: false });

  const passage = texts[language][textIndex % texts[language].length];
  const elapsed = status === 'idle' ? 0 : Math.max(1, duration - secondsLeft);

  const stats = useMemo(() => {
    if (!typed.length && !keystrokes) return emptyStats;
    let correct = 0;
    for (let i = 0; i < typed.length; i += 1) if (typed[i] === passage[i]) correct += 1;
    const uncorrectedErrors = typed.length - correct;
    const minutes = elapsed / 60;
    const raw = minutes ? Math.round(keystrokes / 5 / minutes) : 0;
    const wpm = minutes ? Math.max(0, Math.round((correct / 5) / minutes)) : 0;
    return { wpm, raw, accuracy: keystrokes ? Math.round(((keystrokes - mistakes) / keystrokes) * 100) : 100, errors: mistakes, uncorrectedErrors, correctedErrors, correct, keystrokes, consistency: 100 };
  }, [typed, passage, elapsed, keystrokes, mistakes, correctedErrors]);

  const finish = useCallback(() => {
    if (status !== 'running') return;
    const values = samples.map((s) => s.wpm).filter(Boolean);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : stats.wpm;
    const variance = values.length ? values.reduce((sum, n) => sum + ((n - avg) ** 2), 0) / values.length : 0;
    const consistency = avg ? Math.max(0, Math.round(100 - ((Math.sqrt(variance) / avg) * 100))) : 100;
    const final = { ...stats, consistency, duration, language, date: Date.now() };
    setResult(final);
    setStatus('finished');
    setHistory((prev) => [final, ...prev].slice(0, 8));
  }, [duration, language, samples, stats, status]);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem('eltype-history') || '[]')); } catch { /* private mode */ }
  }, []);
  useEffect(() => {
    if (history.length) localStorage.setItem('eltype-history', JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    if (status !== 'running') return undefined;
    const timer = setInterval(() => setSecondsLeft((value) => value > 0 ? value - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [status]);
  useEffect(() => { if (status === 'running' && secondsLeft === 0) finish(); }, [finish, secondsLeft, status]);
  useEffect(() => {
    if (status !== 'running') return undefined;
    const sampler = setInterval(() => setSamples((prev) => [...prev, { second: duration - secondsLeft, wpm: stats.wpm }]), 1000);
    return () => clearInterval(sampler);
  }, [duration, secondsLeft, stats.wpm, status]);
  useEffect(() => { if (typed.length >= passage.length && status === 'running') finish(); }, [finish, passage.length, status, typed.length]);
  useLayoutEffect(() => {
    function positionCursor() {
      const passageNode = passageRef.current;
      const characterNode = currentCharRef.current;
      if (!passageNode || !characterNode || status === 'finished') { setCursor((value) => ({ ...value, visible: false })); return; }
      setCursor({ x: passageNode.offsetLeft + characterNode.offsetLeft - 2, y: passageNode.offsetTop + characterNode.offsetTop + 5, height: characterNode.getBoundingClientRect().height * 0.78, visible: true });
    }
    positionCursor();
    window.addEventListener('resize', positionCursor);
    return () => window.removeEventListener('resize', positionCursor);
  }, [typed, passage, status]);

  function reset(nextIndex = textIndex + 1) {
    setTyped(''); setStatus('idle'); setSecondsLeft(duration); setSamples([]); setResult(null); setTextIndex(nextIndex); setKeystrokes(0); setMistakes(0); setCorrectedErrors(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }
  function configure(type, value) {
    if (status === 'running') return;
    if (type === 'language') { setLanguage(value); setTextIndex(0); }
    else { setDuration(value); setSecondsLeft(value); }
    setTyped(''); setResult(null); setStatus('idle'); setKeystrokes(0); setMistakes(0); setCorrectedErrors(0);
  }
  function handleInput(event) {
    if (status === 'finished') return;
    if (status === 'idle') return;
    const value = event.target.value.slice(0, passage.length);
    if (value.length > typed.length) {
      const added = value.slice(typed.length);
      let newMistakes = 0;
      for (let i = 0; i < added.length; i += 1) if (added[i] !== passage[typed.length + i]) newMistakes += 1;
      setKeystrokes((count) => count + added.length);
      setMistakes((count) => count + newMistakes);
    } else if (value.length < typed.length) {
      const removed = typed.slice(value.length);
      let fixed = 0;
      for (let i = 0; i < removed.length; i += 1) if (removed[i] !== passage[value.length + i]) fixed += 1;
      setCorrectedErrors((count) => count + fixed);
    }
    setTyped(value);
  }
  function handleKeyDown(event) {
    if (status === 'idle' && event.key === 'Enter') {
      event.preventDefault();
      setStatus('running');
      return;
    }
    if (event.key === 'Enter') event.preventDefault();
  }
  const best = Math.max(0, ...history.map((item) => item.wpm));
  const display = result || stats;
  const chart = result ? (samples.length ? samples : [{ second: duration, wpm: result.wpm }]) : [];
  const maxChart = Math.max(20, ...chart.map((item) => item.wpm));
  const chartPoints = chart.map((item, index) => ({ x: chart.length === 1 ? 300 : 18 + (index / (chart.length - 1)) * 564, y: 172 - (item.wpm / maxChart) * 142, ...item }));
  const chartLine = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const chartArea = chartPoints.length ? `M ${chartPoints[0].x} 172 L ${chartPoints.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${chartPoints[chartPoints.length - 1].x} 172 Z` : '';
  const recommendation = display.accuracy < 92 ? 'Slow down slightly and prioritize clean keystrokes. Speed follows accuracy.' : display.consistency < 75 ? 'Keep a steadier rhythm instead of accelerating through familiar words.' : 'Strong control. Try the next duration to build endurance without losing precision.';

  return <>
    <section className="testWrap" id="test">
      <div className="testPanel shell">
        <div className="testTop">
          <div className="segmented" aria-label="Language">
            {Object.keys(texts).map((item) => <button key={item} className={language === item ? 'active' : ''} onClick={() => configure('language', item)} disabled={status === 'running'}>{item}</button>)}
          </div>
          <div className="timer" aria-live="polite"><span>{String(secondsLeft).padStart(2, '0')}</span><small>seconds</small></div>
          <div className="segmented duration" aria-label="Duration">
            {durations.map((item) => <button key={item} className={duration === item ? 'active' : ''} onClick={() => configure('duration', item)} disabled={status === 'running'}>{item}s</button>)}
          </div>
        </div>

        <div className="liveMetrics">
          <div><strong>{display.wpm}</strong><span>WPM</span></div><div><strong>{display.accuracy}%</strong><span>Accuracy</span></div><div><strong>{display.errors}</strong><span>Errors</span></div>
        </div>

        <div className={`typingArea ${status === 'idle' ? 'waiting' : ''}`} onClick={() => inputRef.current?.focus()} dir={language === 'Amharic' ? 'auto' : 'ltr'}>
          <p ref={passageRef} aria-hidden="true">{passage.split('').map((char, index) => <span ref={index === typed.length ? currentCharRef : null} key={`${char}-${index}`} className={index < typed.length ? (typed[index] === char ? 'correct' : 'incorrect') : ''}>{char}</span>)}</p>
          <i className="smoothCursor" style={{ height: cursor.height, opacity: cursor.visible ? 1 : 0, transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }} />
          <textarea ref={inputRef} value={typed} onChange={handleInput} onKeyDown={handleKeyDown} disabled={status === 'finished'} aria-label="Press Enter to start, then type the passage shown above" autoCapitalize="off" autoCorrect="off" spellCheck="false" />
          {status === 'idle' && <div className="startHint"><kbd>Enter ↵</kbd> to start the test</div>}
        </div>
        <div className="testActions">
          <span>{status === 'running' ? 'Test in progress' : status === 'finished' ? 'Session complete' : 'Click the text, then press Enter'}</span>
          <button className="reset" onClick={() => reset()}><span>↻</span> New passage</button>
        </div>
      </div>
    </section>

    {(result || history.length > 0) && <section className="insights shell" id="insights">
      <div className="insightsHeading"><div><span className="sectionNo">YOUR PERFORMANCE</span><h2>{result ? 'Session analysis.' : 'Recent progress.'}</h2></div><div className="best"><span>Personal best</span><strong>{best} <small>WPM</small></strong></div></div>
      {result && <>
        <div className="metricGrid">
          <article className="featured"><span>Net speed</span><strong>{result.wpm}</strong><small>words per minute</small></article>
          <article><span>Raw speed</span><strong>{result.raw}</strong><small>WPM before errors</small></article>
          <article><span>Accuracy</span><strong>{result.accuracy}<i>%</i></strong><small>{result.correct} correct characters</small></article>
          <article><span>Consistency</span><strong>{result.consistency}<i>%</i></strong><small>rhythm stability</small></article>
          <article><span>Total errors</span><strong>{result.errors}</strong><small>{result.correctedErrors} corrected · {result.uncorrectedErrors} left</small></article>
        </div>
        <div className="analysisRow">
          <article className="chartCard"><div><div><h3>Speed over time</h3><span>Your rhythm throughout the session</span></div><div className="chartPeak"><small>Peak</small><strong>{Math.max(...chart.map((item) => item.wpm))} WPM</strong></div></div><div className="lineChart" aria-label="WPM over time">
            <svg viewBox="0 0 600 190" role="img" aria-label={`Typing speed graph with a peak of ${Math.max(...chart.map((item) => item.wpm))} words per minute`} preserveAspectRatio="none">
              <defs><linearGradient id="speedArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d8ff3e" stopOpacity=".7" /><stop offset="100%" stopColor="#d8ff3e" stopOpacity="0" /></linearGradient></defs>
              {[30, 77, 124, 171].map((y) => <line key={y} x1="18" x2="582" y1={y} y2={y} className="chartGrid" />)}
              <path d={chartArea} className="chartArea" />
              <polyline points={chartLine} className="chartLine" />
              {chartPoints.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3.5" className="chartPoint"><title>{point.second}s · {point.wpm} WPM</title></circle>)}
            </svg><div className="chartAxis"><span>Start</span><span>{Math.round(duration / 2)}s</span><span>{duration}s</span></div>
          </div></article>
          <article className="coach"><span>COACH&apos;S NOTE</span><h3>{result.accuracy >= 95 ? 'Precision is your advantage.' : 'Accuracy is the next unlock.'}</h3><p>{recommendation}</p><button onClick={() => reset()}>Try again <b>→</b></button></article>
        </div>
      </>}
      <div className="history"><div className="historyTitle"><h3>Recent sessions</h3><span>Stored only on this device</span></div>{history.length ? history.map((item) => <div className="historyRow" key={item.date}><span>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><span>{item.language} · {item.duration}s</span><strong>{item.wpm} WPM</strong><span>{item.accuracy}% accuracy</span></div>) : <p>No sessions yet.</p>}</div>
    </section>}
  </>;
}
