import { Link, NavLink, Outlet } from 'react-router-dom'
import { useLabelerName } from './useLabelerName'

export interface AppContext {
  labelerName: string
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'active' : undefined
}

export default function App() {
  const [labelerName, setLabelerName] = useLabelerName()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          <Link to="/" className="brand">
            <span className="brand-mark">P</span>
            불법주차 라벨링
          </Link>
          <nav>
            <NavLink to="/" end className={navClass}>
              라벨링
            </NavLink>
            <NavLink to="/leaderboard" className={navClass}>
              랭킹
            </NavLink>
          </nav>
        </div>
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
