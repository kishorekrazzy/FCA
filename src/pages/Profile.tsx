import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { Award, Check, Clock, Flame, MessageSquare, Sparkles, UserPlus, Users, X } from 'lucide-react'
import { db } from '../lib/firebase'
import { useAllCoursesAdmin } from '../data/catalog'
import { achievementRules, countCertificates, levelFor } from '../store/academy-store'
import { useAuthStore } from '../store/auth-store'
import { acceptFriendRequest, declineFriendRequest, sendFriendRequest, useConnections, useFriendState } from '../store/connections-store'
import { useRemoteUsers } from '../components/admin/useAdminData'
import { allLessons } from '../types'
import { CourseArt, ProgressBar } from '../components/ui/Course'
import { ShareRow } from '../components/ui/ShareRow'
import { Reveal } from '../components/fx'

type ProfileUser = { displayName?: string; photoURL?: string; xp?: number; streak?: number; completed?: string[]; enrolled?: string[]; publicId?: string }

export function Profile() {
 const { uid } = useParams()
 const [user, setUser] = useState<ProfileUser | null | undefined>(undefined)
 const courses = useAllCoursesAdmin().filter((course) => course.status !== 'draft')
 const me = useAuthStore((state) => state.user)
 const friendState = useFriendState(me?.uid, uid)
 const friendIds = useConnections(uid)
 const { users: directory } = useRemoteUsers()
 const friendProfiles = (directory ?? []).filter((item) => friendIds.includes(item.id)).slice(0, 12)

 useEffect(() => {
  if (!uid) return
  return onSnapshot(doc(db, 'users', uid), (snap) => setUser(snap.exists() ? (snap.data() as ProfileUser) : null), () => setUser(null))
 }, [uid])

 if (user === undefined) return <main className="page profile-page"><p className="admin-empty">Loading profile…</p></main>
 if (!user) return <main className="page profile-page not-found"><h1>Learner not found.</h1><Link className="button primary" to="/academy">Explore the academy</Link></main>

 const completed = user.completed ?? []
 const enrolled = user.enrolled ?? []
 const xp = user.xp ?? 0
 const certificates = countCertificates(completed)
 const enrolledCourses = courses.filter((course) => enrolled.includes(course.slug))
 const progressFor = (course: (typeof courses)[number]) => { const lessons = allLessons(course); return lessons.length ? Math.round((lessons.filter((lesson) => completed.includes(lesson.slug)).length / lessons.length) * 100) : 0 }
 const isOwnProfile = me?.uid === uid
 const profileUrl = `${window.location.origin}/profile/${uid}`

 return <main className="profile-page page">
  <Reveal><section className="profile-hero"><span className="profile-avatar">{user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer"/> : (user.displayName ?? '?').slice(0, 2).toUpperCase()}</span><div><span className="kicker">Learner profile{user.publicId && <> · {user.publicId}</>}</span><h1>{user.displayName ?? 'FCA Learner'}</h1><p>Level {levelFor(xp)} · {xp.toLocaleString()} IQ · {completed.length} lessons completed</p></div>
   {!isOwnProfile && me && uid && <div className="profile-friend-actions">
    {friendState === 'none' && <button className="button primary" onClick={() => sendFriendRequest(me.uid, uid)}><UserPlus size={15}/> Add friend</button>}
    {friendState === 'outgoing' && <button className="button ghost" disabled><Clock size={15}/> Requested</button>}
    {friendState === 'incoming' && <><button className="button primary" onClick={() => acceptFriendRequest(me.uid, uid)}><Check size={15}/> Accept</button><button className="button ghost" onClick={() => declineFriendRequest(me.uid, uid)}><X size={15}/> Decline</button></>}
    {friendState === 'friends' && <><span className="button ghost friends-badge"><Check size={15}/> Friends</span><Link className="button primary" to={`/messages?with=${uid}`}><MessageSquare size={15}/> Message</Link></>}
   </div>}
  </section></Reveal>
  <Reveal delay={40}><div className="profile-share"><span>Share this profile</span><ShareRow url={profileUrl} text={`Check out ${user.displayName ?? 'this learner'}'s progress on Future Creators Academy:`}/></div></Reveal>
  <Reveal delay={80}><section className="profile-stats"><article><Sparkles/><strong>{xp.toLocaleString()}</strong><span>total IQ</span></article><article><Flame/><strong>{user.streak ?? 0}</strong><span>day streak</span></article><article><Award/><strong>{certificates}</strong><span>certificates</span></article></section></Reveal>
  <Reveal delay={140}><section className="profile-section"><h2>Achievement shelf</h2><div className="achievements-grid">{achievementRules.map((rule) => <article className={`achievement ${rule.unlocked({ completed }) ? 'unlocked' : ''}`} key={rule.key}><span>{rule.icon}</span><h3>{rule.title}</h3><p>{rule.body}</p></article>)}</div></section></Reveal>
  <Reveal delay={180}><section className="profile-section"><h2><Users size={18}/> Friends {friendIds.length > 0 && <span className="friend-count">{friendIds.length}</span>}</h2>{friendProfiles.length ? <div className="friends-grid">{friendProfiles.map((friend) => <Link to={`/profile/${friend.id}`} className="friend-chip" key={friend.id} title={friend.displayName}>{friend.photoURL ? <img src={friend.photoURL} alt="" referrerPolicy="no-referrer"/> : (friend.displayName ?? '?').slice(0, 2).toUpperCase()}</Link>)}</div> : <p className="admin-empty">No connections yet.</p>}</section></Reveal>
  <Reveal delay={220}><section className="profile-section"><h2>Courses in progress</h2>{enrolledCourses.length ? <div className="continue-list">{enrolledCourses.map((course) => <article key={course.slug}><CourseArt course={course}/><div><span className="kicker">{course.category}</span><h3>{course.title}</h3><p>{progressFor(course)}% complete</p><ProgressBar value={progressFor(course)}/></div><Link className="button ghost" to={`/academy/${course.slug}`}>View course</Link></article>)}</div> : <p className="admin-empty">No courses started yet.</p>}</section></Reveal>
 </main>
}
