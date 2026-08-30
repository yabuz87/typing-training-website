'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { texts } from '@/lib/texts';

const makeCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
const makeId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function TypingRace() {
  const [name, setName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [room, setRoom] = useState('');
  const [playerId] = useState(makeId);
  const [host, setHost] = useState(false);
  const [players, setPlayers] = useState({});
  const [raceStatus, setRaceStatus] = useState('lobby');
  const [startAt, setStartAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [typed, setTyped] = useState('');
  const [startedTypingAt, setStartedTypingAt] = useState(0);
  const channelRef = useRef(null);
  const inputRef = useRef(null);
  const passage = texts.English[1];
  const joined = Boolean(room);
  const countdown = startAt ? Math.max(0, Math.ceil((startAt - now) / 1000)) : 0;
  const canType = raceStatus === 'racing' && countdown === 0;

  function send(message) { channelRef.current?.postMessage({ ...message, sender: playerId }); }

  useEffect(() => {
    if (!room) return undefined;
    const channel = new BroadcastChannel(`eltype-race-${room}`);
    channelRef.current = channel;
    const me = { id: playerId, name, progress: 0, wpm: 0, finishedAt: null };
    setPlayers({ [playerId]: me });
    channel.onmessage = ({ data }) => {
      if (!data || data.sender === playerId) return;
      if (data.type === 'join') {
        setPlayers((current) => ({ ...current, [data.player.id]: data.player }));
        if (host) channel.postMessage({ type: 'snapshot', sender: playerId, players: { ...players, [playerId]: me, [data.player.id]: data.player }, raceStatus, startAt });
      }
      if (data.type === 'snapshot') { setPlayers((current) => ({ ...data.players, ...current })); setRaceStatus(data.raceStatus); setStartAt(data.startAt); }
      if (data.type === 'player') setPlayers((current) => ({ ...current, [data.player.id]: data.player }));
      if (data.type === 'start') { setTyped(''); setStartedTypingAt(0); setRaceStatus('racing'); setStartAt(data.startAt); setPlayers((current) => Object.fromEntries(Object.entries(current).map(([id, p]) => [id, { ...p, progress: 0, wpm: 0, finishedAt: null }]))); }
    };
    channel.postMessage({ type: 'join', sender: playerId, player: me });
    return () => { channel.postMessage({ type: 'leave', sender: playerId }); channel.close(); channelRef.current = null; };
  }, [room, playerId, name, host]);

  useEffect(() => {
    if (!joined || raceStatus !== 'racing') return undefined;
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, [joined, raceStatus]);
  useEffect(() => { if (canType) inputRef.current?.focus(); }, [canType]);

  function enterRoom(isHost) {
    const cleanName = name.trim();
    const code = isHost ? makeCode() : roomInput.trim().toUpperCase();
    if (!cleanName || !code) return;
    setHost(isHost); setRoom(code); setRaceStatus('lobby');
  }
  function startRace() {
    const time = Date.now() + 3500;
    setTyped(''); setRaceStatus('racing'); setStartAt(time); setNow(Date.now());
    send({ type: 'start', startAt: time });
  }
  function handleTyping(event) {
    if (!canType) return;
    const value = event.target.value.slice(0, passage.length);
    const began = startedTypingAt || Date.now();
    if (!startedTypingAt && value.length) setStartedTypingAt(began);
    setTyped(value);
    let correct = 0;
    for (let i = 0; i < value.length; i += 1) if (value[i] === passage[i]) correct += 1;
    const progress = Math.round((value.length / passage.length) * 100);
    const minutes = Math.max(1 / 60, (Date.now() - began) / 60000);
    const wpm = Math.round(correct / 5 / minutes);
    const finishedAt = value.length === passage.length ? Date.now() : null;
    const player = { id: playerId, name, progress, wpm, finishedAt };
    setPlayers((current) => ({ ...current, [playerId]: player }));
    send({ type: 'player', player });
    if (finishedAt) setRaceStatus('finished');
  }
  function leave() { channelRef.current?.close(); channelRef.current = null; setRoom(''); setPlayers({}); setTyped(''); setRaceStatus('lobby'); setHost(false); }
  const standings = useMemo(() => Object.values(players).sort((a, b) => (b.progress - a.progress) || (b.wpm - a.wpm)), [players]);

  return <section className="race shell" id="race">
    <div className="raceIntro"><span className="sectionNo">02 / GROUP RACE</span><h2>Race your<br />people.</h2><p>Create a room, share its code, and watch everyone move through the same passage in real time.</p></div>
    <div className="raceCard">
      {!joined ? <div className="raceJoin">
        <div><span>Your display name</span><input value={name} onChange={(e) => setName(e.target.value.slice(0, 18))} placeholder="e.g. Yabets" /></div>
        <button className="racePrimary" onClick={() => enterRoom(true)}>Create a race <b>→</b></button>
        <div className="joinDivider"><span>or join with a code</span></div>
        <div className="joinCode"><input value={roomInput} onChange={(e) => setRoomInput(e.target.value.toUpperCase().slice(0, 5))} placeholder="ROOM CODE" /><button onClick={() => enterRoom(false)}>Join room</button></div>
        <small className="raceNotice">Local preview: room sync currently works between tabs in this browser. A hosted realtime adapter is required for different devices.</small>
      </div> : <div className="raceRoom">
        <div className="roomTop"><div><span>Room code</span><strong>{room}</strong></div><button onClick={() => navigator.clipboard?.writeText(room)}>Copy code</button><button onClick={leave}>Leave</button></div>
        {raceStatus === 'lobby' && <div className="lobby"><p>{standings.length} racer{standings.length === 1 ? '' : 's'} ready</p>{host ? <button className="racePrimary" onClick={startRace}>Start race <b>→</b></button> : <span>Waiting for the host to start…</span>}</div>}
        {raceStatus === 'racing' && countdown > 0 && <div className="countdown"><span>Race begins in</span><strong>{countdown}</strong></div>}
        {(raceStatus === 'racing' || raceStatus === 'finished') && <div className="raceTyping" onClick={() => inputRef.current?.focus()}>
          <p>{passage.split('').map((char, index) => <span key={index} className={index < typed.length ? typed[index] === char ? 'correct' : 'incorrect' : index === typed.length ? 'current' : ''}>{char}</span>)}</p>
          <textarea ref={inputRef} value={typed} onChange={handleTyping} disabled={!canType} aria-label="Race typing input" spellCheck="false" />
        </div>}
        <div className="racers">{standings.map((player, index) => <div className="racer" key={player.id}><b>{index + 1}</b><span>{player.name}{player.id === playerId ? ' (you)' : ''}</span><div><i style={{ width: `${player.progress}%` }} /></div><strong>{player.wpm} WPM</strong></div>)}</div>
      </div>}
    </div>
  </section>;
}
