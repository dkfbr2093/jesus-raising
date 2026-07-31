import type { LeaderboardEntry } from "./firebase-ranking";

type Props = {
  open: boolean;
  enabled: boolean;
  entries: LeaderboardEntry[];
  status: "loading" | "ready" | "error";
  onClose: () => void;
};

const format = (value: number) => new Intl.NumberFormat("ko-KR").format(value);

export function RankingDialog({ open, enabled, entries, status, onClose }: Props) {
  if (!open) return null;
  return <div className="intro-overlay ranking-overlay" role="dialog" aria-modal="true" aria-label="사랑의 전당 랭킹" onMouseDown={onClose}>
    <section className="intro-card ranking-card" onMouseDown={(event) => event.stopPropagation()}>
      <div className="record-title"><div><p>LOVE HALL OF FAME</p><h2>사랑의 전당</h2></div><button className="modal-close" onClick={onClose} aria-label="랭킹 닫기">×</button></div>
      {!enabled ? <div className="ranking-message"><span>🔒</span><b>랭킹 서버를 연결하는 중이에요</b><small>Firebase 연결을 마치면 모두의 기록이 여기에 실시간으로 표시됩니다.</small></div> : status === "error" ? <div className="ranking-message"><span>☁</span><b>랭킹을 불러오지 못했어요</b><small>잠시 후 다시 열어 주세요.</small></div> : status === "loading" ? <div className="ranking-message"><span>✦</span><b>랭킹을 불러오는 중…</b></div> : <ol className="ranking-list">{entries.length ? entries.map((entry, index) => <li key={entry.id}><i>{index + 1}</i><div><b>{entry.nickname}</b><small>{entry.stage}단계</small></div><strong>♥ {format(entry.bestLove)}</strong></li>) : <li className="ranking-empty">첫 번째 사랑의 기록을 남겨 주세요.</li>}</ol>}
    </section>
  </div>;
}
