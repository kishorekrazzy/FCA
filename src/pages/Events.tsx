import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Gift, Trophy } from 'lucide-react'
import { Reveal } from '../components/fx'
import { ProgressBar } from '../components/ui/Course'
import { useAuthStore } from '../store/auth-store'
import { countCertificates, dateKey, useAcademyStore, type AcademyState } from '../store/academy-store'
import { useChallenges, type Challenge } from '../store/challenges-store'

type Status = 'upcoming' | 'live' | 'ended'
const statusOf = (challenge: Challenge, now: number): Status => now < challenge.startAt ? 'upcoming' : now > challenge.endAt ? 'ended' : 'live'

function EventCard({ challenge, signedIn, state, onClaim }: { challenge: Challenge; signedIn: boolean; state: AcademyState; onClaim: (id: string, xp: number) => void }) {
 const [confirmed, setConfirmed] = useState(false)
 const now = Date.now()
 const status = statusOf(challenge, now)
 const isClaimed = state.claimedChallenges.includes(challenge.id)
 const certificatesEarned = countCertificates(state.completed)

 let value = 0
 if (challenge.goalType === 'streak') value = state.streak
 else if (challenge.goalType === 'lessons') {
  const start = dateKey(challenge.startAt), end = dateKey(challenge.endAt)
  value = Object.entries(state.activityLog).filter(([day]) => day >= start && day <= end).reduce((sum, [, count]) => sum + count, 0)
 }
 const trackedDone = challenge.goalType !== 'manual' && value >= challenge.goalCount
 const manualEligible = challenge.goalType === 'manual' && certificatesEarned > 0 && confirmed
 const canClaim = signedIn && status !== 'ended' && !isClaimed && (trackedDone || manualEligible)

 return <article className={`event-card status-${status} ${isClaimed ? 'claimed' : ''}`}>
  <div className="event-card-head"><span className="event-icon">{challenge.icon || '🏆'}</span><div><h3>{challenge.title || 'Untitled event'}</h3><span className={`event-status ${status}`}>{status === 'live' ? 'Live now' : status === 'upcoming' ? 'Upcoming' : 'Ended'}</span></div></div>
  <p className="event-desc">{challenge.description}</p>
  {challenge.goalType !== 'manual' ? <><ProgressBar value={Math.min(100, Math.round((value / challenge.goalCount) * 100))}/><span className="event-meta">{Math.min(value, challenge.goalCount)}/{challenge.goalCount} {challenge.goalType === 'streak' ? 'day streak' : 'lessons'} · +{challenge.xpReward} IQ</span></> : <span className="event-meta">Honor system · +{challenge.xpReward} IQ</span>}
  <div className="event-window">{new Date(challenge.startAt).toLocaleDateString()} – {new Date(challenge.endAt).toLocaleDateString()}</div>
  {!signedIn && <Link className="button ghost sm" to="/auth/sign-in">Sign in to participate</Link>}
  {signedIn && isClaimed && <span className="challenge-claimed"><Check size={14}/> Claimed</span>}
  {signedIn && !isClaimed && status !== 'ended' && challenge.goalType === 'manual' && (certificatesEarned > 0
   ? <label className="event-confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)}/> I've done this and confirm it's true.</label>
   : <p className="event-locked">Complete a course to unlock this event.</p>)}
  {signedIn && !isClaimed && status !== 'ended' && <button className="button primary sm" disabled={!canClaim} onClick={() => onClaim(challenge.id, challenge.xpReward)}><Gift size={14}/> Claim +{challenge.xpReward} IQ</button>}
 </article>
}

export function Events() {
 const user = useAuthStore((state) => state.user)
 const state = useAcademyStore()
 const challenges = useChallenges()
 const now = Date.now()
 const sorted = [...challenges].sort((a, b) => {
  const rank = (challenge: Challenge) => statusOf(challenge, now) === 'live' ? 0 : statusOf(challenge, now) === 'upcoming' ? 1 : 2
  return rank(a) - rank(b) || a.startAt - b.startAt
 })

 return <main className="events-page page">
  <Reveal><span className="kicker"><Trophy size={13}/> Gamified</span><h1>Earn IQ through <em>events.</em></h1><p>Time-boxed challenges and one-off events — some track your progress automatically, others just need your word.</p></Reveal>
  {!sorted.length && <div className="empty"><p>No events yet — check back soon.</p></div>}
  <div className="events-grid">{sorted.map((challenge, index) => <Reveal delay={index * 60} key={challenge.id}><EventCard challenge={challenge} signedIn={!!user} state={state} onClaim={state.claimChallenge}/></Reveal>)}</div>
 </main>
}
