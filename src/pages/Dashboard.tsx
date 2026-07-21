import { useMemo } from 'react'
import { ArrowRight, Award, Bookmark, Calendar, Check, Eye, EyeOff, Flame, Gift, Map, Medal, RotateCcw, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCourses } from '../data/catalog'
import { CourseArt, ProgressBar } from '../components/ui/Course'
import { ContributionGraph, SkillRadar } from '../components/ui/Analytics'
import { StreakCard } from '../components/ui/StreakCard'
import { Leaderboard } from '../components/ui/Leaderboard'
import { isAchievementUnlocked, useAchievements } from '../store/achievements-store'
import { countCertificates, dailyRewardAmount, dateKey, levelFor, levelProgress, useAcademyStore, type DailyReward, type ReviewQuality } from '../store/academy-store'
import { useActiveChallenges, type Challenge } from '../store/challenges-store'
import { usePaths } from '../store/paths-store'
import { timeAgo, useAllPosts } from '../data/posts'
import { CountUp } from '../components/fx'
import { useAuthStore } from '../store/auth-store'
import { signOutUser } from '../lib/firebase'
import { allLessons } from '../types'
import type { Course } from '../types'

const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening' }

function StatChip({ value, label, bar }: { value: React.ReactNode; label: string; bar?: number }) {
 return <div className="stat-chip"><strong>{value}</strong><span>{label}</span>{typeof bar === 'number' && <div className="stat-chip-bar"><span style={{ width: `${bar}%` }}/></div>}</div>
}

function ActivityPanel({ xp, streak, activityLog }: { xp: number; streak: number; activityLog: Record<string, number> }) {
 const bestDay = Math.max(0, ...Object.values(activityLog))
 return <section className="dash-contrib">
  <div className="dash-contrib-head">
   <div><span className="kicker">Activity</span><h2>Your practice, <em>visualized.</em></h2></div>
   <div className="dash-contrib-stats">
    <StatChip value={String(levelFor(xp)).padStart(2, '0')} label="level" bar={levelProgress(xp)}/>
    <StatChip value={<CountUp to={xp}/>} label="IQ collected"/>
    <StatChip value={streak} label="day streak"/>
    <StatChip value={bestDay} label="best day"/>
   </div>
  </div>
  <ContributionGraph log={activityLog}/>
 </section>
}

function DailyRewardCard({ dailyReward, onClaim }: { dailyReward: DailyReward; onClaim: () => void }) {
 const today = dateKey()
 const claimedToday = dailyReward.lastClaimedDate === today
 const yesterday = dateKey(Date.now() - 86400000)
 const previewStreak = claimedToday ? dailyReward.streak : dailyReward.lastClaimedDate === yesterday ? dailyReward.streak + 1 : 1
 const amount = dailyRewardAmount(previewStreak)
 return <section className="daily-reward">
  <div className="daily-reward-info"><Calendar/><div><h3>{claimedToday ? 'Come back tomorrow' : 'Daily reward ready'}</h3><p>{claimedToday ? `Claimed — day ${dailyReward.streak} of your streak.` : `Day ${previewStreak} of your streak — claim today's IQ before it resets.`}</p></div></div>
  <button className="button primary sm" onClick={onClaim} disabled={claimedToday}>{claimedToday ? <><Check size={14}/> Claimed</> : <><Gift size={14}/> Claim +{amount} IQ</>}</button>
 </section>
}

function ReviewQueue({ reviews, courses, onReview }: { reviews: Record<string, { due: number }>; courses: Course[]; onReview: (slug: string, quality: ReviewQuality) => void }) {
 const due = Object.entries(reviews).filter(([, schedule]) => schedule.due <= Date.now()).sort((a, b) => a[1].due - b[1].due).map(([slug]) => slug)
 const locate = (slug: string) => { for (const course of courses) { const lesson = allLessons(course).find((item) => item.slug === slug); if (lesson) return { course, lesson } } return null }
 return <section className="dash-review"><div className="section-heading"><div><span className="kicker"><RotateCcw size={12}/> Spaced repetition</span><h2>Review <em>queue.</em></h2></div>{due.length > 0 && <span className="review-count">{due.length} due</span>}</div>
  {due.length ? <div className="review-list">{due.map((slug) => { const found = locate(slug); if (!found) return null; return <article className="review-card" key={slug}>
    <div><span className="kicker">{found.course.title}</span><h3>{found.lesson.title}</h3></div>
    <div className="review-actions"><button className="button ghost sm" onClick={() => onReview(slug, 'again')}>Again</button><button className="button ghost sm" onClick={() => onReview(slug, 'good')}>Good</button><button className="button primary sm" onClick={() => onReview(slug, 'easy')}>Easy</button></div>
   </article> })}</div> : <div className="empty"><p>Nothing due for review right now — completed lessons resurface here on a spaced schedule.</p></div>}
 </section>
}

function LearningPaths({ courses, progress }: { courses: Course[]; progress: (slug: string) => number }) {
 const paths = usePaths()
 if (!paths.length) return null
 return <section className="dash-paths"><div className="section-heading"><div><span className="kicker"><Map size={12}/> Guided</span><h2>Learning <em>paths.</em></h2></div></div>
  <div className="paths-grid">{paths.map((path) => {
   const pathCourses = path.courseSlugs.map((slug) => courses.find((course) => course.slug === slug)).filter(Boolean) as Course[]
   const pct = pathCourses.length ? Math.round(pathCourses.reduce((sum, course) => sum + progress(course.slug), 0) / pathCourses.length) : 0
   const nextCourse = pathCourses.find((course) => progress(course.slug) < 100) ?? pathCourses[0]
   return <article className="path-card" key={path.id}><span className="path-card-icon">{path.icon}</span><h3>{path.title}</h3><p>{path.description}</p><ProgressBar value={pct}/><div className="path-card-foot"><span>{pct}% complete · {pathCourses.length} {pathCourses.length === 1 ? 'course' : 'courses'}</span>{nextCourse && <Link className="button ghost sm" to={`/academy/${nextCourse.slug}`}>Continue <ArrowRight/></Link>}</div></article>
  })}</div>
 </section>
}

function WeeklyChallenges({ streak, activityLog, claimed, onClaim }: { streak: number; activityLog: Record<string, number>; claimed: string[]; onClaim: (id: string, xp: number) => void }) {
 // Honor-system events need a confirmation checkbox, which lives on the full /events
 // page — this condensed dashboard widget only surfaces the auto-tracked ones.
 const active = useActiveChallenges().filter((challenge) => challenge.goalType !== 'manual')
 if (!active.length) return null
 const progressFor = (challenge: Challenge) => {
  if (challenge.goalType === 'streak') return Math.min(streak, challenge.goalCount)
  const start = dateKey(challenge.startAt), end = dateKey(challenge.endAt)
  const count = Object.entries(activityLog).filter(([day]) => day >= start && day <= end).reduce((sum, [, value]) => sum + value, 0)
  return Math.min(count, challenge.goalCount)
 }
 return <section className="dash-challenges"><div className="section-heading"><div><span className="kicker"><Trophy size={12}/> Time-boxed</span><h2>Active <em>events.</em></h2></div><Link className="link-button" to="/events">See all events</Link></div>
  <div className="challenges-grid">{active.map((challenge) => {
   const value = progressFor(challenge)
   const done = value >= challenge.goalCount
   const isClaimed = claimed.includes(challenge.id)
   return <article className={`challenge-card ${done ? 'done' : ''}`} key={challenge.id}>
    <span className="challenge-icon">{challenge.icon}</span>
    <div className="challenge-body"><h3>{challenge.title}</h3><p>{challenge.description}</p><ProgressBar value={Math.round((value / challenge.goalCount) * 100)}/><span className="challenge-meta">{value}/{challenge.goalCount} {challenge.goalType === 'streak' ? 'day streak' : 'lessons'} · +{challenge.xpReward} IQ</span></div>
    {isClaimed ? <span className="challenge-claimed"><Check size={14}/> Claimed</span> : <button className="button primary sm" disabled={!done} onClick={() => onClaim(challenge.id, challenge.xpReward)}><Gift size={14}/> Claim</button>}
   </article>
  })}</div>
 </section>
}

function SavedPosts({ savedIds, onUnsave }: { savedIds: string[]; onUnsave: (id: string) => void }) {
 const { posts } = useAllPosts()
 const saved = useMemo(() => posts.filter((post) => savedIds.includes(post.id)).sort((a, b) => b.createdAt - a.createdAt), [posts, savedIds])
 return <section className="side-panel saved-posts-panel">
  <div className="side-panel-head"><h3><Bookmark size={14}/> Saved from Community</h3>{saved.length > 0 && <Link className="link-button" to="/community">View feed</Link>}</div>
  {!saved.length && <p className="admin-empty">Bookmark a post in the community feed and it'll show up here.</p>}
  <div className="saved-posts-list">{saved.slice(0, 6).map((post) => <article className="saved-post-card" key={post.id}>
   <span className="post-avatar sm" style={{ background: post.color }}>{post.photo ? <img src={post.photo} alt="" referrerPolicy="no-referrer"/> : post.name.slice(0, 2).toUpperCase()}</span>
   <div className="saved-post-body"><p><b>{post.handle}</b> {post.text}</p><span>{timeAgo(post.createdAt)} ago · {post.likes} likes</span></div>
   <button className="saved-post-remove" onClick={() => onUnsave(post.id)} aria-label="Remove from saved"><Bookmark size={14}/></button>
  </article>)}</div>
 </section>
}

function AchievementShelf({ stats, profileUid }: { stats: { completed: string[]; streak: number; xp: number; certificates: number }; profileUid?: string }) {
 const achievements = useAchievements()
 const unlocked = achievements.filter((achievement) => isAchievementUnlocked(achievement, stats))
 return <section className="side-panel">
  <div className="side-panel-head"><h3><Award size={14}/> Achievements</h3>{profileUid && <Link className="link-button" to={`/profile/${profileUid}`}>View shelf</Link>}</div>
  {!achievements.length && <p className="admin-empty">No achievements yet — check back soon.</p>}
  <div className="shelf-mini-row">{achievements.slice(0, 10).map((achievement) => { const isUnlocked = unlocked.some((item) => item.id === achievement.id); return <span className={`shelf-sticker ${isUnlocked ? 'unlocked' : ''}`} key={achievement.id} title={achievement.title}>{achievement.stickerUrl ? <img src={achievement.stickerUrl} alt=""/> : <Medal/>}</span> })}</div>
  {achievements.length > 0 && <span className="shelf-mini-count">{unlocked.length}/{achievements.length} unlocked</span>}
 </section>
}

export function Dashboard() {
 const user = useAuthStore(auth => auth.user)
 const courses = useCourses()
 const state = useAcademyStore(); const active = courses.filter(course => state.enrolled.includes(course.slug))
 const achievementStats = { completed: state.completed, streak: state.streak, xp: state.xp, certificates: countCertificates(state.completed) }
 const resumeLink = (courseSlug: string) => { const course = courses.find(item => item.slug === courseSlug)!; const next = allLessons(course).find(lesson => !state.completed.includes(lesson.slug)); return next ? `/academy/${courseSlug}/${next.slug}` : `/academy/${courseSlug}/certificate` }

 return <main className="dashboard page dashboard-v2">
  <header className="dash-topbar">
   <div><span className="kicker">Your practice</span><h1>{greeting()}, <em>{user?.displayName ? user.displayName.split(" ")[0] : "curious one"}.</em></h1></div>
   {user && <div className="dash-topbar-actions"><Link className="link-button" to={`/profile/${user.uid}`}>View public profile</Link><button className="link-button" onClick={() => signOutUser()}>Sign out</button></div>}
  </header>

  <ActivityPanel xp={state.xp} streak={state.streak} activityLog={state.activityLog}/>

  {user && <div className="dash-boosts"><DailyRewardCard dailyReward={state.dailyReward} onClaim={state.claimDailyReward}/><StreakCard streak={state.streak} streakFreezes={state.streakFreezes} activityLog={state.activityLog}/></div>}

  <div className="dash-grid">
   <div className="dash-col-main">
    <section className="learning"><div className="section-heading"><div><span className="kicker">Continue</span><h2>In your <em>orbit.</em></h2></div></div>{active.length ? <div className="continue-list">{active.map(course => <article key={course.slug}><CourseArt course={course}/><div><span className="kicker">{course.category}</span><h3>{course.title}</h3><p>{state.progress(course.slug)}% complete</p><ProgressBar value={state.progress(course.slug)}/></div><Link className="button ghost" to={resumeLink(course.slug)}>{state.progress(course.slug) === 100 ? 'Certificate' : 'Resume'} <ArrowRight/></Link></article>)}</div> : <div className="empty"><p>Your next curiosity is waiting.</p><Link className="button primary" to="/academy">Explore courses</Link></div>}</section>
    <ReviewQueue reviews={state.reviews} courses={courses} onReview={state.reviewLesson}/>
    <LearningPaths courses={courses} progress={state.progress}/>
    <WeeklyChallenges streak={state.streak} activityLog={state.activityLog} claimed={state.claimedChallenges} onClaim={state.claimChallenge}/>
   </div>

   <aside className="dash-col-side">
    {user && <SavedPosts savedIds={state.savedPostIds} onUnsave={state.toggleSavedPost}/>}
    <section className="side-panel">
     <div className="side-panel-head"><h3><Trophy size={14}/> Leaderboard</h3><Link className="link-button" to="/leaderboard">View all</Link></div>
     <Leaderboard limit={5}/>
     {user && <button className="leaderboard-visibility-toggle" onClick={() => state.setLeaderboardVisible(!state.leaderboardVisible)}>{state.leaderboardVisible ? <><Eye size={13}/> Visible on the public leaderboard</> : <><EyeOff size={13}/> Hidden from the public leaderboard</>} — <span>{state.leaderboardVisible ? 'hide me' : 'show me'}</span></button>}
    </section>
    <AchievementShelf stats={achievementStats} profileUid={user?.uid}/>
    <section className="side-panel">
     <div className="side-panel-head"><h3><Flame size={14}/> Skill distribution</h3></div>
     <SkillRadar completed={state.completed} courses={courses}/>
    </section>
   </aside>
  </div>
 </main>
}
