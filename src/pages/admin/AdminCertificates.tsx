import { useRemoteUsers } from '../../components/admin/useAdminData'
import { useAllCoursesAdmin } from '../../data/catalog'
import { allLessons } from '../../types'

export function AdminCertificates() {
 const { users, error } = useRemoteUsers()
 const courses = useAllCoursesAdmin().filter((course) => course.status !== 'draft')
 const rows = (users ?? []).flatMap((user) => courses.filter((course) => { const lessons = allLessons(course); return lessons.length > 0 && lessons.every((lesson) => (user.completed ?? []).includes(lesson.slug)) }).map((course) => ({ user, course })))

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Credentials</span><h1>Certificates</h1><p>Every learner who has completed 100% of a published course's lessons.</p></div></header>
  <div className="admin-panel">
   {error && <p className="admin-empty">Firestore isn't reachable yet — connect it to see issued certificates here.</p>}
   {!error && !rows.length && <p className="admin-empty">No certificates have been unlocked yet.</p>}
   {!!rows.length && <table className="admin-table wide"><thead><tr><th>Learner</th><th>Course</th><th>IQ at completion</th><th>Last active</th></tr></thead><tbody>{rows.map(({ user, course }) => <tr key={user.id + course.slug}><td>{user.displayName ?? user.email ?? user.id.slice(0, 10)}</td><td>{course.title}</td><td>{user.xp ?? 0}</td><td>{user.lastActive ?? '—'}</td></tr>)}</tbody></table>}
  </div>
 </div>
}
