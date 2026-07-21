import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRemoteUsers, type RemoteUser } from '../admin/useAdminData'

const initials = (user: RemoteUser) => (user.displayName ?? user.email ?? '?').slice(0, 2).toUpperCase()

export function useLeaderboard(limit = 10): RemoteUser[] {
 const { users } = useRemoteUsers()
 return (users ?? []).filter((user) => (user.xp ?? 0) > 0).sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)).slice(0, limit)
}

export function LeaderboardRow({ user, rank }: { user: RemoteUser; rank: number }) {
 return <Link to={`/profile/${user.id}`} className={`leaderboard-row rank-${rank <= 3 ? rank : 'rest'}`}>
  <span className="leaderboard-rank">{rank}</span>
  <span className="leaderboard-avatar">{user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer"/> : initials(user)}</span>
  <span className="leaderboard-name">{user.displayName ?? 'FCA Learner'}</span>
  <span className="leaderboard-xp">+{(user.xp ?? 0).toLocaleString()} IQ <Sparkles size={13}/></span>
 </Link>
}

export function Leaderboard({ limit = 5 }: { limit?: number }) {
 const ranked = useLeaderboard(limit)
 if (!ranked.length) return <p className="admin-empty">No one's on the board yet — complete a lesson to claim the top spot.</p>
 return <div className="leaderboard-list">{ranked.map((user, index) => <LeaderboardRow user={user} rank={index + 1} key={user.id}/>)}</div>
}

/** A compact "current leader" call-out for pages that just want to show who's
 * in first place right now, without the full ranked list. */
export function LeaderSpotlight() {
 const [leader] = useLeaderboard(1)
 if (!leader) return null
 return <Link to={`/profile/${leader.id}`} className="leader-spotlight">
  <span className="leader-spotlight-badge"><Sparkles size={12}/> Current leader</span>
  <span className="leader-spotlight-row">
   <span className="leaderboard-avatar">{leader.photoURL ? <img src={leader.photoURL} alt="" referrerPolicy="no-referrer"/> : initials(leader)}</span>
   <span className="leader-spotlight-name">{leader.displayName ?? 'FCA Learner'}</span>
   <span className="leader-spotlight-xp">{(leader.xp ?? 0).toLocaleString()} IQ</span>
  </span>
 </Link>
}
