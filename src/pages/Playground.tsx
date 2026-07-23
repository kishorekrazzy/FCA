import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Flame, Gamepad2, Grid3x3, Medal, ShoppingBag, Sparkles, Ticket, Trophy } from 'lucide-react'
import { Reveal, RadialRing, CountUp } from '../components/fx'
import { ScrollStagger, useHeroTimeline } from '../components/fx/scroll'
import { Pop, TiltCard } from '../components/fx/motion'
import { ProgressBar } from '../components/ui/Course'
import { Leaderboard, LeaderSpotlight } from '../components/ui/Leaderboard'
import { SudokuBoard } from '../components/ui/Sudoku'
import { AchievementGrid } from '../components/ui/Achievements'
import { useAuthStore } from '../store/auth-store'
import { countCertificates, dateKey, levelFor, levelProgress, xpToNext, useAcademyStore, type AcademyState } from '../store/academy-store'
import { useChallenges, type Challenge } from '../store/challenges-store'
import { redeemShopCoupon, useShopItems, type ShopItem } from '../store/shop-store'

const SUDOKU_XP = 40

type Status = 'upcoming' | 'live' | 'ended'
const statusOf = (challenge: Challenge, now: number): Status => now < challenge.startAt ? 'upcoming' : now > challenge.endAt ? 'ended' : 'live'

function ChallengeCard({ challenge, signedIn, state, onClaim }: { challenge: Challenge; signedIn: boolean; state: AcademyState; onClaim: (id: string, xp: number) => void }) {
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
  {challenge.goalType !== 'manual' ? <><ProgressBar value={Math.min(100, Math.round((value / challenge.goalCount) * 100))}/><span className="event-meta">{Math.min(value, challenge.goalCount)}/{challenge.goalCount} {challenge.goalType === 'streak' ? 'day streak' : 'lessons'} · +{challenge.xpReward} <img className="mini-icon" src="/icon-xp.svg" alt=""/> IQ</span></> : <span className="event-meta">Honor system · +{challenge.xpReward} <img className="mini-icon" src="/icon-xp.svg" alt=""/> IQ</span>}
  <div className="event-window">{new Date(challenge.startAt).toLocaleDateString()} – {new Date(challenge.endAt).toLocaleDateString()}</div>
  {!signedIn && <Link className="button ghost sm" to="/auth/sign-in">Sign in to participate</Link>}
  {signedIn && isClaimed && <span className="challenge-claimed"><Check size={14}/> Claimed</span>}
  {signedIn && !isClaimed && status !== 'ended' && challenge.goalType === 'manual' && (certificatesEarned > 0
   ? <label className="event-confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)}/> I've done this and confirm it's true.</label>
   : <p className="event-locked">Complete a course to unlock this event.</p>)}
  {signedIn && !isClaimed && status !== 'ended' && <button className="button primary sm" disabled={!canClaim} onClick={() => onClaim(challenge.id, challenge.xpReward)}><ArrowRight size={14}/> Claim +{challenge.xpReward} <img className="mini-icon" src="/icon-xp.svg" alt=""/> IQ</button>}
 </article>
}

function GameTile({ art, title, description, meta, cta, onClick }: { art: React.ReactNode; title: string; description: string; meta?: string; cta: string; onClick: () => void }) {
 return <TiltCard tilt={4} lift={4}><button className="pg-game-tile" onClick={onClick}>
  <span className="pg-game-art">{art}</span>
  <div className="pg-game-body"><h3>{title}</h3><p>{description}</p>{meta && <span className="pg-game-meta">{meta}</span>}</div>
  <span className="pg-game-cta">{cta} <ArrowRight size={13}/></span>
 </button></TiltCard>
}

function MoreGamesTile() {
 return <div className="pg-game-tile pg-more-tile">
  <span className="pg-game-art placeholder"><Gamepad2 size={22}/></span>
  <div className="pg-game-body"><h3>More games</h3><p>New puzzles and daily games are on the way — check back soon.</p></div>
 </div>
}

type CouponStatus = 'ok' | 'invalid' | 'used' | 'maxed' | 'owned' | 'pending' | null

function ShopCard({ item, owned, canAfford, equipped, onBuy, onEquip }: { item: ShopItem; owned: boolean; canAfford: boolean; equipped: boolean; onBuy: () => void; onEquip: () => void }) {
 return <TiltCard tilt={3} lift={4}><article className={`pg-shop-card ${owned ? 'owned' : ''}`}>
  <span className="pg-shop-thumb">{item.image ? <img src={item.image} alt=""/> : item.emoji}</span>
  <h3>{item.name}</h3>
  <p>{item.description}</p>
  {!owned && <button className="button primary sm" onClick={onBuy} disabled={!canAfford}><img className="mini-icon" src="/icon-xp.svg" alt=""/> {item.price}</button>}
  {owned && item.type === 'cosmetic' && <button className={`button ${equipped ? 'primary' : 'ghost'} sm`} onClick={onEquip}>{equipped ? <><Check size={13}/> Equipped</> : 'Equip'}</button>}
  {owned && item.type === 'sticker' && <span className="pg-shop-owned"><Check size={13}/> Owned — in your sticker tray</span>}
 </article></TiltCard>
}

export function Playground() {
 const user = useAuthStore((state) => state.user)
 const state = useAcademyStore()
 const heroRef = useRef<HTMLElement>(null)
 useHeroTimeline(['.pg-hero-copy .pill', '.pg-hero-copy h2', '.pg-hero-copy p', '.pg-hero-meta', '.pg-hero-copy .button', '.pg-hero-art'], heroRef)
 const challenges = useChallenges()
 const shopItems = useShopItems()
 const now = Date.now()
 const activeAndUpcoming = challenges.filter((challenge) => statusOf(challenge, now) !== 'ended').sort((a, b) => {
  const rank = (challenge: Challenge) => statusOf(challenge, now) === 'live' ? 0 : 1
  return rank(a) - rank(b) || a.startAt - b.startAt
 })
 const past = challenges.filter((challenge) => statusOf(challenge, now) === 'ended').sort((a, b) => b.endAt - a.endAt)

 const [playingSudoku, setPlayingSudoku] = useState(false)
 const solvedToday = state.sudokuCompletedDate === dateKey()
 const certificates = countCertificates(state.completed)

 const [couponInput, setCouponInput] = useState('')
 const [couponStatus, setCouponStatus] = useState<CouponStatus>(null)
 const [couponItemName, setCouponItemName] = useState('')

 const recent = useMemo(() => {
  const items: { key: string; icon: React.ReactNode; title: string; meta: string }[] = []
  if (solvedToday) items.push({ key: 'sudoku', icon: <Grid3x3 size={14}/>, title: 'Daily Sudoku', meta: 'Solved today' })
  for (const challenge of [...challenges].reverse()) {
   if (state.claimedChallenges.includes(challenge.id)) items.push({ key: challenge.id, icon: <span>{challenge.icon || '🏆'}</span>, title: challenge.title || 'Untitled event', meta: `+${challenge.xpReward} IQ claimed` })
  }
  return items.slice(0, 5)
 }, [challenges, state.claimedChallenges, solvedToday])

 const buy = (item: ShopItem) => { state.buyShopItem({ id: item.id, price: item.price }) }
 const equip = (item: ShopItem) => { state.equipFlair(state.equippedFlair === item.emoji ? null : item.emoji) }

 const redeemCoupon = async () => {
  if (!user || !couponInput.trim()) return
  setCouponStatus('pending')
  const outcome = await redeemShopCoupon(couponInput, user.uid, (id) => state.ownedItems.includes(id)).catch(() => ({ result: 'invalid' as const, itemId: undefined }))
  if (outcome.result === 'ok' && outcome.itemId) {
   state.grantShopItem(outcome.itemId)
   setCouponItemName(shopItems.find((item) => item.id === outcome.itemId)?.name ?? 'item')
  }
  setCouponStatus(outcome.result)
  setCouponInput('')
 }

 return <main className="playground-page page">
  <div className="pg-top">
   <Reveal><span className="kicker"><Flame size={13}/> Playground</span><h1>Play daily, <em>earn IQ.</em></h1><p>Solve today's puzzle, clear time-boxed challenges, and keep your streak alive — one place for everything that isn't a lesson.</p></Reveal>
   <Reveal delay={80}><LeaderSpotlight/></Reveal>
  </div>

  <div className="pg-layout">
   <div className="pg-main">
    <section className="pg-hero" ref={heroRef}>
     <i className="pg-aurora" aria-hidden="true"/>
     <div className="pg-hero-copy">
      <span className="pill">Your progress</span>
      <h2>Keep the streak <em>alive.</em></h2>
      <p>Every game, challenge, and lesson counts toward the same streak and IQ balance — spend what you earn in the shop below.</p>
      <div className="pg-hero-meta"><span><Flame size={14}/> {state.streak} day streak</span><span><Trophy size={14}/> Level {levelFor(state.xp)}</span></div>
      <a className="button primary" href="#pg-shop">Visit the shop <ArrowRight size={15}/></a>
     </div>
     <div className="pg-hero-art" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i}/>)}</div>
    </section>

    <section className="pg-achievements">
     <div className="section-heading"><div><span className="kicker"><Medal size={12}/> Milestones</span><h2>Achievement <em>shelf.</em></h2></div></div>
     <AchievementGrid stats={{ completed: state.completed, streak: state.streak, xp: state.xp, certificates }}/>
    </section>

    <section className="pg-games">
     <div className="section-heading"><div><span className="kicker">New</span><h2>New <em>games.</em></h2></div></div>
     <ScrollStagger className="pg-games-grid">
      <MoreGamesTile/>
      <GameTile art={<Grid3x3 size={22}/>} title="Daily Sudoku" description="Today's puzzle, resets at midnight." meta={solvedToday ? 'Solved today ✓' : `+${SUDOKU_XP} IQ`} cta="Play" onClick={() => setPlayingSudoku(true)}/>
     </ScrollStagger>
     <Pop show={playingSudoku} className="pg-hero pg-sudoku-panel"><SudokuBoard xpReward={SUDOKU_XP} alreadySolvedToday={solvedToday} onWin={() => state.completeSudoku(SUDOKU_XP)} onClose={() => setPlayingSudoku(false)}/></Pop>
    </section>

    <section className="pg-shop" id="pg-shop">
     <div className="section-heading"><div><span className="kicker"><ShoppingBag size={12}/> Spend your IQ</span><h2>The <em>shop.</em></h2></div></div>
     {!shopItems.length && <p className="admin-empty">Nothing in the shop yet — check back soon.</p>}
     {!!shopItems.length && <ScrollStagger className="pg-shop-grid">{shopItems.map((item) => <ShopCard item={item} owned={state.ownedItems.includes(item.id)} canAfford={state.xp >= item.price} equipped={state.equippedFlair === item.emoji} onBuy={() => buy(item)} onEquip={() => equip(item)} key={item.id}/>)}</ScrollStagger>}
     {user && <div className="pg-coupon-row">
      <Ticket size={15}/>
      <input value={couponInput} onChange={(event) => { setCouponInput(event.target.value); setCouponStatus(null) }} placeholder="Have a coupon code?" onKeyDown={(event) => event.key === 'Enter' && redeemCoupon()}/>
      <button className="button ghost sm" onClick={redeemCoupon} disabled={!couponInput.trim() || couponStatus === 'pending'}>Redeem</button>
      {couponStatus === 'ok' && <span className="pg-coupon-status success">Unlocked {couponItemName}!</span>}
      {couponStatus === 'invalid' && <span className="pg-coupon-status error">Code not found.</span>}
      {couponStatus === 'used' && <span className="pg-coupon-status error">You've already used this code.</span>}
      {couponStatus === 'owned' && <span className="pg-coupon-status error">You already own this item.</span>}
      {couponStatus === 'maxed' && <span className="pg-coupon-status error">This code has run out.</span>}
     </div>}
    </section>

    {!!activeAndUpcoming.length && <section className="pg-challenges">
     <div className="section-heading"><div><span className="kicker">Time-boxed</span><h2>Active <em>challenges.</em></h2></div></div>
     <ScrollStagger className="events-grid">{activeAndUpcoming.map((challenge) => <ChallengeCard challenge={challenge} signedIn={!!user} state={state} onClaim={state.claimChallenge} key={challenge.id}/>)}</ScrollStagger>
    </section>}

    {!!past.length && <section className="events-past"><div className="section-heading"><div><span className="kicker">Archive</span><h2>Past <em>challenges.</em></h2></div></div>
     <ScrollStagger className="events-grid">{past.map((challenge) => <ChallengeCard challenge={challenge} signedIn={!!user} state={state} onClaim={state.claimChallenge} key={challenge.id}/>)}</ScrollStagger>
    </section>}
   </div>

   <aside className="pg-side">
    <Reveal><div className="pg-stat-card">
     <RadialRing percent={levelProgress(state.xp)} color="var(--accent)" label={`Lv ${levelFor(state.xp)}`} sublabel={`${xpToNext(state.xp)} to next`}/>
     <div className="pg-stat-pills">
      <span className="pg-pill"><img className="mini-icon" src="/icon-xp.svg" alt=""/> <CountUp to={state.xp}/></span>
      <span className="pg-pill"><img className="mini-icon" src="/icon-streak.svg" alt=""/> {state.streak}</span>
      <span className="pg-pill"><Grid3x3 size={13}/> {state.sudokuSolvedCount}</span>
     </div>
     {state.equippedFlair && <span className="pg-flair-preview"><Sparkles size={11}/> Equipped flair: {state.equippedFlair}</span>}
    </div></Reveal>

    {!!recent.length && <Reveal delay={60}><div className="pg-recent">
     <h3>Recent activity</h3>
     <div className="pg-recent-list">{recent.map((item) => <div className="pg-recent-row" key={item.key}><span className="pg-recent-icon">{item.icon}</span><span className="pg-recent-info"><b>{item.title}</b><span>{item.meta}</span></span></div>)}</div>
    </div></Reveal>}

    <Reveal delay={120}><div className="pg-friends">
     <h3><Medal size={14}/> Leaderboard</h3>
     <Leaderboard limit={5}/>
     <Link className="button ghost sm" to="/leaderboard">View full board <ArrowRight size={13}/></Link>
    </div></Reveal>
   </aside>
  </div>
 </main>
}
