import { Link, Outlet } from 'react-router-dom'
import { useLabelerName } from './useLabelerName'

export interface AppContext {
  labelerName: string
}

export default function App() {
  const [labelerName, setLabelerName] = useLabelerName()

  return (
    <div className="app-shell">
      <header className="app-header">
        <nav>
          <Link to="/">라벨링</Link>
          <Link to="/leaderboard">랭킹</Link>
        </nav>
        <div className="labeler-input">
          <label htmlFor="labeler-name">라벨러 이름</label>
          <input
            id="labeler-name"
            value={labelerName}
            onChange={(e) => setLabelerName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </div>
      </header>
      <main>
        <Outlet context={{ labelerName } satisfies AppContext} />
      </main>
    </div>
  )
}
