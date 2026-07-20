import { ArrowRight, Award, Calendar, Check, Gift, Map, RotateCcw, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCourses } from '../data/catalog'
import { CourseArt, ProgressBar } from '../components/ui/Course'
import { ActivityHeatmap, SkillRadar } from '../components/ui/Analytics'
import { achievementRules, dailyRewardAmount, dateKey, levelFor, levelProgress, useAcademyStore, xpToNext, type DailyReward, type ReviewQuality } from '../store/academy-store'
import { useActiveChallenges, type Challenge } from '../store/challenges-store'
import { usePaths } from '../store/paths-store'
import { CountUp } from '../components/fx'
import { useAuthStore } from '../store/auth-store'
import { signOutUser } from '../lib/firebase'
import { allLessons } from '../types'
import type { Course } from '../types'

const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening' }

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

export function Dashboard() {
 const user = useAuthStore(auth => auth.user)
 const courses = useCourses()
 const state = useAcademyStore(); const active = courses.filter(course => state.enrolled.includes(course.slug))
 const unlocked = achievementRules.filter(rule => rule.unlocked(state))
 const resumeLink = (courseSlug: string) => { const course = courses.find(item => item.slug === courseSlug)!; const next = allLessons(course).find(lesson => !state.completed.includes(lesson.slug)); return next ? `/academy/${courseSlug}/${next.slug}` : `/academy/${courseSlug}/certificate` }
 return <main className="dashboard page"><section className="dash-hero"><div><span className="kicker">Your practice</span><h1>{greeting()},<br/><em>{user?.displayName ? user.displayName.split(" ")[0] : "curious one"}.</em></h1><p>Every small return to the work counts.{user && <> · <Link className="link-button" to={`/profile/${user.uid}`}>View public profile</Link> · <button className="link-button" onClick={() => signOutUser()}>Sign out</button></>}</p></div><div className="level-card"><span>LEVEL {String(levelFor(state.xp)).padStart(2, '0')}</span><strong><CountUp to={state.xp}/></strong><small>IQ COLLECTED</small><ProgressBar value={levelProgress(state.xp)}/><p>{xpToNext(state.xp)} IQ to level {levelFor(state.xp) + 1}</p></div></section>
 {user && <DailyRewardCard dailyReward={state.dailyReward} onClaim={state.claimDailyReward}/>}
 <section className="dash-stats"><article><img className="stat-icon" src="/icon-streak.svg" alt=""/><div><strong>{state.streak} {state.streak === 1 ? 'day' : 'days'}</strong><p>current streak</p></div><span>{state.streak > 0 ? 'Keep the ember alive.' : 'Complete a lesson to start one.'}</span></article><article><img className="stat-icon" src="/icon-xp.svg" alt=""/><div><strong><CountUp to={state.completed.length}/></strong><p>lessons completed</p></div><span>Every rep sharpens the instinct.</span></article><article><Award/><div><strong>{String(unlocked.length).padStart(2, '0')}</strong><p>{unlocked.length === 1 ? 'badge earned' : 'badges earned'}</p></div><span>{unlocked.length ? unlocked[unlocked.length - 1].title + ' unlocked.' : 'Your shelf is waiting.'}</span></article></section>
 <section className="learning"><div className="section-heading"><div><span className="kicker">Continue</span><h2>In your <em>orbit.</em></h2></div></div>{active.length ? <div className="continue-list">{active.map(course => <article key={course.slug}><CourseArt course={course}/><div><span className="kicker">{course.category}</span><h3>{course.title}</h3><p>{state.progress(course.slug)}% complete</p><ProgressBar value={state.progress(course.slug)}/></div><Link className="button ghost" to={resumeLink(course.slug)}>{state.progress(course.slug) === 100 ? 'Certificate' : 'Resume'} <ArrowRight/></Link></article>)}</div> : <div className="empty"><p>Your next curiosity is waiting.</p><Link className="button primary" to="/academy">Explore courses</Link></div>}</section>
 <section className="achievements"><span className="kicker">Achievement shelf</span><div>{achievementRules.map(rule => <article className={`achievement ${rule.unlocked(state) ? 'unlocked' : ''}`} key={rule.key}><span>{rule.icon}</span><h3>{rule.title}</h3><p>{rule.body}</p></article>)}</div></section>
 <ReviewQueue reviews={state.reviews} courses={courses} onReview={state.reviewLesson}/>
 <LearningPaths courses={courses} progress={state.progress}/>
 <WeeklyChallenges streak={state.streak} activityLog={state.activityLog} claimed={state.claimedChallenges} onClaim={state.claimChallenge}/>
 <section className="dash-analytics"><div className="section-heading"><div><span className="kicker">Your data</span><h2>Personal <em>analytics.</em></h2></div></div>
  <div className="analytics-grid">
   <div className="analytics-card"><h3>Activity, last 16 weeks</h3><ActivityHeatmap log={state.activityLog}/></div>
   <div className="analytics-card"><h3>Skill distribution</h3><SkillRadar completed={state.completed} courses={courses}/></div>
  </div>
 </section>
 </main>
}