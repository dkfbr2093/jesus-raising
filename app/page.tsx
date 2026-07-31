"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Upgrade = { id: string; icon: string; name: string; description: string; baseCost: number; click?: number; passive?: number };
type Milestones = Record<number, string>;

const stages = [
  { love: 0, title: "작은 등불", mood: "아직은 조용한 시작", aura: "none" },
  { love: 30, title: "따뜻한 미소", mood: "미소가 피어났어요", aura: "warm" },
  { love: 100, title: "길 위의 친구", mood: "희망의 길을 걷는 중", aura: "warm" },
  { love: 300, title: "마을의 위로", mood: "사람들이 모여들어요", aura: "gold" },
  { love: 800, title: "평화의 노래", mood: "마음에 노래가 번져요", aura: "gold" },
  { love: 2000, title: "사랑의 빛", mood: "빛이 더 깊어졌어요", aura: "light" },
  { love: 5000, title: "희망의 등대", mood: "멀리까지 비추는 마음", aura: "light" },
  { love: 12000, title: "기적의 손길", mood: "따뜻함이 세상을 감싸요", aura: "heaven" },
  { love: 30000, title: "하늘의 평화", mood: "구름 위로 피어난 평화", aura: "heaven" },
  { love: 75000, title: "영원한 사랑", mood: "사랑으로 가득 찬 완성", aura: "divine" },
];
const upgrades: Upgrade[] = [
  { id: "smile", icon: "😊", name: "따뜻한 미소", description: "클릭 애정도 +1", baseCost: 15, click: 1 },
  { id: "candle", icon: "🕯️", name: "기도의 촛불", description: "초당 애정도 +1", baseCost: 70, passive: 1 },
  { id: "bread", icon: "🍞", name: "나눔의 빵", description: "클릭 애정도 +6", baseCost: 280, click: 6 },
  { id: "oil", icon: "🏺", name: "향유의 단지", description: "초당 애정도 +8", baseCost: 1500, passive: 8 },
  { id: "halo", icon: "✨", name: "황금 후광", description: "클릭 애정도 +30", baseCost: 8000, click: 30 },
];
const fmt = (value: number) => new Intl.NumberFormat("ko-KR").format(Math.floor(value));
const date = (value: string) => new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function Home() {
  const [love, setLove] = useState(0); const [levels, setLevels] = useState<Record<string, number>>({});
  const [nickname, setNickname] = useState(""); const [nameDraft, setNameDraft] = useState(""); const [startedAt, setStartedAt] = useState(""); const [milestones, setMilestones] = useState<Milestones>({});
  const [intro, setIntro] = useState<"welcome" | "name" | null>("welcome"); const [shopOpen, setShopOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false); const [recordOpen, setRecordOpen] = useState(false);
  const [popups, setPopups] = useState<{ id: number; x: number; y: number; amount: number }[]>([]); const [evolutionBurst, setEvolutionBurst] = useState(false); const [loaded, setLoaded] = useState(false); const previousStage = useRef(0);
  const clickPower = 1 + upgrades.reduce((sum, item) => sum + (item.click ?? 0) * (levels[item.id] ?? 0), 0);
  const passivePower = upgrades.reduce((sum, item) => sum + (item.passive ?? 0) * (levels[item.id] ?? 0), 0);
  const stageIndex = stages.reduce((current, stage, index) => (love >= stage.love * 2 ? index : current), 0);
  const stage = { ...stages[stageIndex], love: stages[stageIndex].love * 2 }; const nextStage = stages[stageIndex + 1] ? { ...stages[stageIndex + 1], love: stages[stageIndex + 1].love * 2 } : undefined;
  const progress = nextStage ? ((love - stage.love) / (nextStage.love - stage.love)) * 100 : 100;

  useEffect(() => { const saved = window.localStorage.getItem("love-raising-save"); if (saved) try { const parsed = JSON.parse(saved); setLove(parsed.love ?? 0); setLevels(parsed.levels ?? {}); setNickname(parsed.nickname ?? ""); setStartedAt(parsed.startedAt ?? ""); setMilestones(parsed.milestones ?? {}); if (parsed.nickname) setIntro(null); } catch {} setLoaded(true); }, []);
  useEffect(() => { if (loaded) window.localStorage.setItem("love-raising-save", JSON.stringify({ love, levels, nickname, startedAt, milestones })); }, [love, levels, nickname, startedAt, milestones, loaded]);
  useEffect(() => { if (!passivePower || !nickname) return; const timer = window.setInterval(() => setLove((value) => value + passivePower), 1000); return () => window.clearInterval(timer); }, [passivePower, nickname]);
  useEffect(() => { if (!loaded || !nickname || milestones[stageIndex]) return; setMilestones((value) => ({ ...value, [stageIndex]: new Date().toISOString() })); }, [stageIndex, loaded, nickname, milestones]);
  useEffect(() => { if (!loaded || !nickname) return; if (stageIndex > previousStage.current) { setEvolutionBurst(true); const timer = window.setTimeout(() => setEvolutionBurst(false), 1700); previousStage.current = stageIndex; return () => window.clearTimeout(timer); } previousStage.current = stageIndex; }, [stageIndex, loaded, nickname]);
  const price = (item: Upgrade) => Math.ceil(item.baseCost * Math.pow(1.65, levels[item.id] ?? 0));
  const begin = () => { const now = new Date().toISOString(); setNickname(nameDraft.trim() || "빛의 여행자"); setStartedAt(now); setMilestones({ 0: now }); setIntro(null); };
  const clickJesus = (event: React.MouseEvent<HTMLButtonElement>) => { setLove((value) => value + clickPower); const box = event.currentTarget.getBoundingClientRect(); const id = Date.now() + Math.random(); setPopups((items) => [...items, { id, x: event.clientX - box.left, y: event.clientY - box.top, amount: clickPower }]); window.setTimeout(() => setPopups((items) => items.filter((item) => item.id !== id)), 900); };
  const buy = (item: Upgrade) => { const cost = price(item); if (love < cost) return; setLove((value) => value - cost); setLevels((value) => ({ ...value, [item.id]: (value[item.id] ?? 0) + 1 })); };
  const stageDots = useMemo(() => stages.map((_, index) => index <= stageIndex), [stageIndex]);

  if (!loaded) return null;
  return <>
    {intro === "welcome" && <div className="intro-overlay"><section className="intro-card"><span>✦</span><h1>예수 키우기</h1><p>작은 애정이 모여<br />빛나는 여정이 시작돼요.</p><button onClick={() => setIntro("name")}>시작하기</button></section></div>}
    {intro === "name" && <div className="intro-overlay"><section className="intro-card"><span>♥</span><h1>이름을 알려주세요</h1><p>여정의 기록에 남길<br />나만의 닉네임을 정해요.</p><input autoFocus maxLength={12} value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && begin()} placeholder="닉네임 입력" aria-label="닉네임" /><button onClick={begin}>여정 시작하기</button></section></div>}
    <main className="game-shell">
      <section className="topbar"><div className="brand"><span className="brand-spark">✦</span><span>예수 키우기</span></div><div className="love-total"><span>♥</span> 애정도 <strong>{fmt(love)}</strong></div><button className="profile-button" onClick={() => setProfileOpen(true)} aria-label="프로필 열기">☺</button></section>
      <section className="game-grid"><aside className="evolution panel"><div className="panel-heading"><p>EVOLUTION</p><h2>성장 여정</h2></div><ol className="stage-list">{stages.map((item, index) => <li key={item.title} className={index === stageIndex ? "active" : index < stageIndex ? "done" : ""}><span className="step-dot">{stageDots[index] ? "♥" : index + 1}</span><div><b>{index + 1}단계 · {item.title}</b><small>{fmt(item.love * 2)} 애정도</small></div></li>)}</ol></aside>
      <section className="play-area"><div className={`stage-card stage-${stageIndex} ${evolutionBurst ? "is-evolving" : ""}`}><p className="eyebrow">현재 모습 · {stageIndex + 1} / 10</p><h1>{stage.title}</h1><p className="stage-mood">{stage.mood}</p>{evolutionBurst && <div className="evolution-alert"><span>✦</span><b>진화 성공!</b><small>{stage.title} 해금</small></div>}<button className={`character-button aura-${stage.aura}`} onClick={clickJesus} aria-label={`예수님을 눌러 애정도 ${clickPower} 얻기`}><span className="rays" /><span className="halo" /><span className="evolution-sprite" style={{ backgroundPosition: `${stageIndex % 2 ? "100%" : "0%"} ${Math.floor(stageIndex / 2) * 25}%` }} /><span className="stage-ribbon">{stageIndex >= 7 ? "✦ 평화의 빛 ✦" : stageIndex >= 4 ? "따뜻한 사랑" : "작은 시작"}</span>{popups.map((popup) => <span className="love-popup" key={popup.id} style={{ left: popup.x, top: popup.y }}>+{popup.amount} ♥</span>)}</button><div className="click-callout"><span>캐릭터를 눌러주세요</span><b>+{clickPower} ♥</b></div></div><div className="next-progress">{nextStage ? <><span>다음 진화: <b>{nextStage.title}</b></span><span>{fmt(Math.max(0, nextStage.love - love))} ♥ 남음</span></> : <><span>최종 진화 완료!</span><span>사랑이 가득해요</span></>}<div className="progress-track"><i style={{ width: `${Math.max(4, progress)}%` }} /></div></div></section></section>
      <div className="bottom-dock"><div className="dock-stat"><span>☀</span><div><small>지금의 평온</small><b>초당 +{passivePower} 애정도</b></div></div><button className="open-shop" onClick={() => setShopOpen(true)}><span>🎁</span> 마음의 선물 상점 <i>→</i></button></div>
      {shopOpen && <div className="shop-overlay" role="dialog" aria-modal="true" aria-label="마음의 선물 상점" onMouseDown={() => setShopOpen(false)}><section className="shop-modal" onMouseDown={(event) => event.stopPropagation()}><div className="shop-modal-head"><div><p>BLESSING SHOP</p><h2>마음의 선물</h2><span>선물로 애정도를 더 빠르게 모아보세요.</span></div><button onClick={() => setShopOpen(false)} aria-label="상점 닫기">×</button></div><div className="shop-list">{upgrades.map((item) => { const cost = price(item); return <button className="shop-item" key={item.id} onClick={() => buy(item)} disabled={love < cost}><span className="item-icon">{item.icon}</span><span className="item-copy"><b>{item.name} <em>Lv.{levels[item.id] ?? 0}</em></b><small>{item.description}</small></span><span className="cost">♥ {fmt(cost)}</span></button>; })}</div></section></div>}
      {profileOpen && <div className="intro-overlay profile-overlay" onMouseDown={() => setProfileOpen(false)}><section className="intro-card profile-card" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setProfileOpen(false)}>×</button><div className="profile-heading"><span>☺</span><div><h2>{nickname}</h2><small>{startedAt ? `${date(startedAt)} 시작` : "새로운 여정"}</small></div></div><button className="record-button" onClick={() => { setProfileOpen(false); setRecordOpen(true); }}>📜 성장 기록 <b>›</b></button></section></div>}
      {recordOpen && <div className="intro-overlay profile-overlay" onMouseDown={() => setRecordOpen(false)}><section className="intro-card record-card" onMouseDown={(event) => event.stopPropagation()}><div className="record-title"><h2>성장 기록</h2><button className="modal-close" onClick={() => setRecordOpen(false)}>×</button></div><ol>{startedAt && <li><i>♥</i><div><b>여정 시작</b><small>{date(startedAt)}</small></div></li>}{stages.map((item, index) => milestones[index] && <li key={item.title}><i>{index + 1}</i><div><b>{item.title} 첫 도달</b><small>{date(milestones[index])}</small></div></li>)}</ol></section></div>}
    </main>
  </>;
}
