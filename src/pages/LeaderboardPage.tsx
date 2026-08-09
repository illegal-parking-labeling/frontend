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
          <h2>AI 예측 신뢰도</h2>
          <p>
            전체 AI 예측 {stats.total_predictions}건 중 사람이 그대로 승인한 라벨 {stats.matched_labels}건
          </p>
          <p className="stat-highlight">{(stats.acceptance_rate * 100).toFixed(1)}%</p>
        </div>
      )}

      <h2>라벨러 활동 랭킹</h2>
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
              <td>{idx + 1}</td>
              <td>{entry.labeler_name}</td>
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
  )
}
