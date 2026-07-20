import { useRemoteUsers } from '../../components/admin/useAdminData'
import { useAllCoursesAdmin } from '../../data/catalog'
import { allLessons } from '../../types'

export function AdminUsers() {
 const { users, error } = useRemoteUsers()
 const courses = useAllCoursesAdmin().filter((course) => course.status !== 'draft')
 const certCount = (completed: string[] = []) => courses.filter((course) => { const lessons = allLessons(course); return lessons.length > 0 && lessons.every((lesson) => completed.includes(lesson.slug)) }).length
 const sorted = users ? [...users].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)) : []

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">People</span><h1>Users</h1><p>Every learner who has signed in with Google, synced live from Firestore.</p></div></header>
  <div className="admin-panel">
   {error && <p className="admin-empty">Firestore isn't reachable — create the database in the Firebase console (project <code>fcacademy</code>) and open read access on the <code>users</code> collection to populate this table.</p>}
   {!error && !sorted.length && <p className="admin-empty">No learners have signed in yet.</p>}
   {!!sorted.length && <table className="admin-table wide"><thead><tr><th>Learner</th><th>Email</th><th>IQ</th><th>Streak</th><th>Lessons done</th><th>Certificates</th><th>Last active</th></tr></thead><tbody>{sorted.map((user) => <tr key={user.id}><td><div className="admin-user-cell">{user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer"/> : <span className="admin-user-fallback">{(user.displayName ?? '?').slice(0, 2).toUpperCase()}</span>}{user.displayName ?? '—'}</div></td><td>{user.email ?? '—'}</td><td>{user.xp ?? 0}</td><td>{user.streak ?? 0}</td><td>{user.completed?.length ?? 0}</td><td>{certCount(user.completed)}</td><td>{user.lastActive ?? '—'}</td></tr>)}</tbody></table>}
  </div>
 </div>
}
