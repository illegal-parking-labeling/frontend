import { useEffect, useState } from 'react'
import { getAiStats, getLeaderboard } from '../api'
import type { AiStats, LeaderboardEntry } from '../types'

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<AiStats | null>(null)

  useEffect(() => {
    getLeaderboard().then(setEntries)
    getAiStats().then(setStats)
  }, [])

  return (
    <div className="page">
      <h1>랭킹</h1>

      {stats && (
        <div className="stat-card">
          <div className="stat-card-head">
            <h2>AI 예측 신뢰도</h2>
            <span className="stat-highlight">{(stats.acceptance_rate * 100).toFixed(1)}%</span>
          </div>
          <p>
            전체 AI 예측 {stats.total_predictions}건 중 사람이 그대로 승인한 라벨 {stats.matched_labels}건
          </p>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(stats.acceptance_rate * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <h2>라벨러 활동 랭킹</h2>
      <div className="table-wrap">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>라벨러</th>
              <th>라벨 수</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={entry.labeler_name}>
                <td>
                  <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                </td>
                <td>
                  <span className="labeler-cell">
                    <span className="avatar">{entry.labeler_name.slice(0, 1).toUpperCase()}</span>
                    {entry.labeler_name}
                  </span>
                </td>
                <td>{entry.label_count}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={3} className="empty">
                  아직 라벨링 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
