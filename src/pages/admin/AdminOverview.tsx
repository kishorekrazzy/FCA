import { Link } from 'react-router-dom'
import { Award, BookOpen, Layers, MessagesSquare, Plus, TrendingUp, Users } from 'lucide-react'
import { useAllCoursesAdmin } from '../../data/catalog'
import { useRemotePosts, useRemoteUsers } from '../../components/admin/useAdminData'
import { allLessons } from '../../types'
import type { Course } from '../../types'
import { RadialRing, Reveal } from '../../components/fx'

const countCertificatesFor = (user: { completed?: string[] }, courses: Course[]) => {
 const completed = user.completed ?? []
 return courses.filter((course) => course.status !== 'draft').filter((course) => { const lessons = allLessons(course); return lessons.length > 0 && lessons.every((lesson) => completed.includes(lesson.slug)) }).length
}
const contentHealth = (course: Course) => {
 const lessons = allLessons(course)
 if (!lessons.length) return 0
 const scored = lessons.filter((lesson) => lesson.thumbnail && ((lesson.blocks && lesson.blocks.length > 0) || lesson.sections.length > 0)).length
 return Math.round((scored / lessons.length) * 100)
}
const medal = ['🥇', '🥈', '🥉']
const onSpotlight = (event: React.MouseEvent<HTMLElement>) => { const el = event.currentTarget; const rect = el.getBoundingClientRect(); el.style.setProperty('--mx', `${event.clientX - rect.left}px`); el.style.setProperty('--my', `${event.clientY - rect.top}px`) }

export function AdminOverview() {
 const courses = useAllCoursesAdmin()
 const { users, error: usersError } = useRemoteUsers()
 const { posts } = useRemotePosts()
 const totalLessons = courses.reduce((sum, course) => sum + allLessons(course).length, 0)
 const published = courses.filter((course) => course.status !== 'draft').length
 const draft = courses.length - published
 const today = new Date().toDateString()
 const activeToday = users?.filter((user) => user.lastActive === today).length ?? 0
 const totalXP = users?.reduce((sum, user) => sum + (user.xp ?? 0), 0) ?? 0
 const totalCerts = users ? users.reduce((sum, user) => sum + countCertificatesFor(user, courses), 0) : 0
 const newestUsers = users ? [...users].sort((a, b) => (b.joinedAt ?? 0) - (a.joinedAt ?? 0)).slice(0, 5) : []
 const recentPosts = posts ? [...posts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5) : []
 const leaderboard = users ? [...users].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)).slice(0, 5) : []
 const topXP = leaderboard[0]?.xp ?? 1

 const categoryCounts = courses.reduce<Record<string, number>>((map, course) => { map[course.category] = (map[course.category] ?? 0) + 1; return map }, {})
 const maxCategory = Math.max(1, ...Object.values(categoryCounts))
 const healthList = [...courses].filter((course) => course.status !== 'draft').sort((a, b) => contentHealth(a) - contentHealth(b)).slice(0, 5)

 return <div className="admin-page">
  <header className="admin-header"><div><span className="kicker">Operations</span><h1>Dashboard overview</h1><p>A live read on courses, learners, and the community.</p></div></header>

  <div className="quick-actions-row">
   <Link className="quick-action" to="/admin/courses/new"><Plus/> New course</Link>
   <Link className="quick-action" to="/admin/users"><Users/> View users</Link>
   <Link className="quick-action" to="/admin/certificates"><Award/> Certificates</Link>
   <Link className="quick-action" to="/admin/community"><MessagesSquare/> Moderate community</Link>
  </div>

  <div className="admin-stat-grid">
   <Reveal><article className="admin-stat fx-spotlight" onMouseMove={onSpotlight}><BookOpen/><div><strong>{published}</strong><span>published courses</span></div><small>{draft} in draft</small></article></Reveal>
   <Reveal delay={40}><article className="admin-stat fx-spotlight" onMouseMove={onSpotlight}><Layers/><div><strong>{totalLessons}</strong><span>total lessons</span></div><small>across all courses</small></article></Reveal>
   <Reveal delay={80}><article className="admin-stat fx-spotlight" onMouseMove={onSpotlight}><Users/><div><strong>{users ? users.length : '—'}</strong><span>registered learners</span></div><small>{usersError ? 'Firestore unavailable' : `${activeToday} active today`}</small></article></Reveal>
   <Reveal delay={120}><article className="admin-stat fx-spotlight" onMouseMove={onSpotlight}><TrendingUp/><div><strong>{totalXP.toLocaleString()}</strong><span>IQ earned platform-wide</span></div><small>sum across all learners</small></article></Reveal>
   <Reveal delay={160}><article className="admin-stat fx-spotlight" onMouseMove={onSpotlight}><Award/><div><strong>{totalCerts}</strong><span>certificates unlocked</span></div><small>full-course completions</small></article></Reveal>
   <Reveal delay={200}><article className="admin-stat fx-spotlight" onMouseMove={onSpotlight}><MessagesSquare/><div><strong>{posts ? posts.length : '—'}</strong><span>community posts</span></div><small>live in the commons</small></article></Reveal>
  </div>

  <div className="admin-columns">
   <Reveal><section className="admin-panel"><h2>Catalog status</h2><div className="ring-row"><RadialRing percent={courses.length ? (published / courses.length) * 100 : 0} color="var(--primary-500)" label={`${published}/${courses.length}`} sublabel="published"/><div className="ring-legend"><p><i style={{ background: 'var(--primary-500)' }}/> {published} published</p><p><i style={{ background: 'rgba(255,255,255,.12)' }}/> {draft} draft</p></div></div>
    <h3 className="admin-subhead">Courses by category</h3>
    <div className="category-bars">{Object.entries(categoryCounts).map(([category, count]) => <div className="category-bar-row" key={category}><span>{category}</span><div className="category-bar"><span style={{ width: `${(count / maxCategory) * 100}%` }}/></div><b>{count}</b></div>)}</div>
   </section></Reveal>

   <Reveal delay={80}><section className="admin-panel"><h2>Top learners</h2>
    {usersError && <p className="admin-empty">Firestore isn't reachable yet — create the database and rules in the Firebase console to see live users here.</p>}
    {!usersError && !leaderboard.length && <p className="admin-empty">No signed-in learners yet.</p>}
    <div className="leaderboard">{leaderboard.map((user, index) => <div className={`leaderboard-row fx-spotlight ${index < 3 ? 'ranked' : ''}`} onMouseMove={onSpotlight} key={user.id}><span className="rank">{medal[index] ?? index + 1}</span><span className="leader-name">{user.displayName ?? user.email ?? user.id.slice(0, 10)}</span><div className="leader-bar"><span style={{ width: `${((user.xp ?? 0) / topXP) * 100}%` }}/></div><b>{(user.xp ?? 0).toLocaleString()} IQ</b></div>)}</div>
    <Link className="text-link" to="/admin/users">View all users →</Link>
   </section></Reveal>
  </div>

  <div className="admin-columns">
   <Reveal><section className="admin-panel"><h2>Content that needs attention</h2><p className="admin-hint-line">Published courses with the lowest share of lessons carrying a thumbnail and body content.</p>
    {!healthList.length && <p className="admin-empty">No published courses yet.</p>}
    <div className="health-list">{healthList.map((course) => <Link className="health-row fx-spotlight" onMouseMove={onSpotlight} to={`/admin/courses/${course.slug}`} key={course.slug}><span>{course.title}</span><div className="health-bar wide"><span style={{ width: `${contentHealth(course)}%` }}/></div><b>{contentHealth(course)}%</b></Link>)}</div>
   </section></Reveal>
   <Reveal delay={80}><section className="admin-panel"><h2>Recent community activity</h2>
    {!recentPosts.length && <p className="admin-empty">No posts yet.</p>}
    <ul className="admin-activity">{recentPosts.map((post) => <li key={post.id}><b>{post.name}</b><span>{post.text.slice(0, 90)}{post.text.length > 90 ? '…' : ''}</span></li>)}</ul>
    <Link className="text-link" to="/admin/community">Moderate community →</Link>
   </section></Reveal>
  </div>

  {!!newestUsers.length && <Reveal delay={40}><section className="admin-panel"><h2>Newest learners</h2><table className="admin-table"><thead><tr><th>Learner</th><th>IQ</th><th>Streak</th><th>Certificates</th></tr></thead><tbody>{newestUsers.map((user) => <tr key={user.id}><td>{user.displayName ?? user.email ?? user.id.slice(0, 10)}</td><td>{user.xp ?? 0}</td><td>{user.streak ?? 0}</td><td>{countCertificatesFor(user, courses)}</td></tr>)}</tbody></table></section></Reveal>}
 </div>
}
