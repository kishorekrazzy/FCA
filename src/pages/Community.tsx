import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bookmark, BookOpen, Check, Clock, Flame, Heart, ImagePlus, MessageCircle, MessageSquare, MoreHorizontal, Send, Sparkles, TrendingUp, UserPlus, Users, X } from 'lucide-react'
import { addDoc, collection, doc, increment, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Reveal } from '../components/fx'
import { db } from '../lib/firebase'
import { useAuthStore } from '../store/auth-store'
import { useCommunityStore, type Post } from '../store/community-store'
import { useRemoteUsers, type RemoteUser } from '../components/admin/useAdminData'
import { acceptFriendRequest, declineFriendRequest, redeemReferralCode, sendFriendRequest, useConnections, useFriendState, useIncomingRequests, type RedeemResult } from '../store/connections-store'
import { addComment, useComments } from '../store/comments-store'
import { useCourses } from '../data/catalog'
import { ShareRow } from '../components/ui/ShareRow'

const Ig = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none"/></svg>
const Xx = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.7 3H21l-7.3 8.3L22.2 21h-6.6l-5.2-6.1L4.5 21H1.2l7.8-8.9L2 3h6.8l4.7 5.6L17.7 3zm-1.2 16h1.9L7.6 4.9H5.6L16.5 19z"/></svg>
const In = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9z"/></svg>
const Yt = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.8.3c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.3 7.6.3s4.6 0 7.8-.3c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.9 15.1V8.4l6.2 3.4-6.2 3.3z"/></svg>

const pile = [
 { text: 'SYSTEMS THINKING (FEEDBACK LOOPS)', x: '-5%', y: '-7%', r: -14, c: '#6871FA' },
 { text: 'TASTE CALIBRATION', x: '15%', y: '-9%', r: 9, c: '#A993F8' },
 { text: 'STREAKS, XP & PROOF', x: '37%', y: '-11%', r: -6, c: '#FFD86B' },
 { text: 'PROTOTYPE LAB: SMALLEST TRUE TEST', x: '59%', y: '-8%', r: 12, c: '#CDC6FB' },
 { text: 'MAKER GRANT 2026', x: '81%', y: '-10%', r: -17, c: '#6871FA' },
 { text: 'RESEARCH RITUALS', x: '-8%', y: '26%', r: 13, c: '#FFD86B' },
 { text: 'MAPS BEFORE MOVES', x: '13%', y: '23%', r: -19, c: '#CDC6FB' },
 { text: 'FIELD NOTES & DAILY DRILLS', x: '36%', y: '27%', r: 7, c: '#5952F4' },
 { text: 'DECISION DESIGN', x: '60%', y: '24%', r: -9, c: '#A993F8' },
 { text: 'LEVERAGE OVER EFFORT', x: '82%', y: '27%', r: 15, c: '#FFD86B' },
 { text: 'QUESTION BANKS & EVIDENCE TRAILS', x: '-6%', y: '58%', r: -8, c: '#A993F8' },
 { text: 'CREATIVE DIRECTION, CLEARLY', x: '16%', y: '62%', r: 11, c: '#FFD86B' },
 { text: 'CERTIFICATES THAT VERIFY', x: '38%', y: '59%', r: -13, c: '#6871FA' },
 { text: 'THE QUESTION BANK', x: '61%', y: '63%', r: 6, c: '#CDC6FB' },
 { text: 'CAPSTONE: DRAW THE SYSTEM', x: '82%', y: '60%', r: -11, c: '#5952F4' },
]

const timeAgo = (timestamp: number) => {
 const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000))
 if (minutes < 60) return `${minutes}m`
 const hours = Math.round(minutes / 60)
 if (hours < 24) return `${hours}h`
 return `${Math.round(hours / 24)}d`
}

const LIKED_KEY = 'fca-liked'
const SAVED_KEY = 'fca-saved'
const readIds = (key: string): string[] => { try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] } }
const engagement = (post: Post) => post.likes + post.replies * 2

type Tab = 'friends' | 'new' | 'trending'

function SuggestedPersonRow({ person, myUid }: { person: RemoteUser; myUid?: string }) {
 const state = useFriendState(myUid, person.id)
 const request = () => { if (myUid) sendFriendRequest(myUid, person.id).catch(() => {}) }
 return <div className="suggested-row">
  <Link to={`/profile/${person.id}`} className="post-avatar sm">{person.photoURL ? <img src={person.photoURL} alt="" referrerPolicy="no-referrer"/> : (person.displayName ?? '?').slice(0, 2).toUpperCase()}</Link>
  <Link to={`/profile/${person.id}`} className="suggested-name">{person.displayName ?? 'FCA Learner'}</Link>
  {myUid && state === 'none' && <button className="add-friend-btn" onClick={request} aria-label="Send friend request"><UserPlus size={13}/></button>}
  {myUid && state === 'outgoing' && <span className="request-pending" title="Request sent"><Clock size={13}/></span>}
  {myUid && state === 'friends' && <span className="request-pending on" title="Friends"><Check size={13}/></span>}
 </div>
}

function PostComments({ postId, myUid, myName, myPhoto }: { postId: string; myUid?: string | null; myName: string; myPhoto?: string | null }) {
 const comments = useComments(postId)
 const [text, setText] = useState('')
 const [sending, setSending] = useState(false)
 const submit = async () => {
  if (!text.trim()) return
  setSending(true)
  try { await addComment(postId, myUid ?? null, myName, myPhoto ?? null, text); setText('') }
  catch { window.alert('Could not post your comment — try again.') }
  setSending(false)
 }
 return <div className="ig-comments">
  <div className="ig-comments-list">{!comments.length && <p className="ig-comments-empty">No comments yet — be the first.</p>}{comments.map((comment) => <div className="ig-comment" key={comment.id}><span className="post-avatar sm">{comment.photo ? <img src={comment.photo} alt="" referrerPolicy="no-referrer"/> : comment.name.slice(0, 2).toUpperCase()}</span><p><b>{comment.name}</b> {comment.text}</p></div>)}</div>
  <div className="ig-comment-input"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Add a comment…" onKeyDown={(event) => event.key === 'Enter' && submit()}/><button onClick={submit} disabled={!text.trim() || sending} aria-label="Post comment"><Send size={14}/></button></div>
 </div>
}

export function Community() {
 const user = useAuthStore(state => state.user)
 const local = useCommunityStore()
 const [remote, setRemote] = useState<Post[] | null>(null)
 const [draft, setDraft] = useState('')
 const [imageOpen, setImageOpen] = useState(false)
 const [imageUrl, setImageUrl] = useState('')
 const [coursePickerOpen, setCoursePickerOpen] = useState(false)
 const [attachedCourse, setAttachedCourse] = useState<{ slug: string; title: string } | null>(null)
 const [likedIds, setLikedIds] = useState<string[]>(() => readIds(LIKED_KEY))
 const [savedIds, setSavedIds] = useState<string[]>(() => readIds(SAVED_KEY))
 const [shareMenuId, setShareMenuId] = useState<string | null>(null)
 const [expandedId, setExpandedId] = useState<string | null>(null)
 const [notice, setNotice] = useState('')
 const [tab, setTab] = useState<Tab>('new')
 const [redeemInput, setRedeemInput] = useState('')
 const [redeemStatus, setRedeemStatus] = useState<RedeemResult | 'pending' | null>(null)
 const [params] = useSearchParams()
 const referralHint = params.get('ref')

 const { users: directory } = useRemoteUsers()
 const myFriendIds = useConnections(user?.uid)
 const incomingRequests = useIncomingRequests(user?.uid)
 const courses = useCourses()

 useEffect(() => { if (referralHint) setRedeemInput(referralHint) }, [referralHint])

 useEffect(() => {
  try {
   const feed = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100))
   return onSnapshot(feed, snapshot => {
    setRemote(snapshot.docs.map(item => { const data = item.data(); return { ...data, id: item.id, createdAt: data.createdAt?.toMillis?.() ?? Date.now(), liked: false } as Post }))
   }, () => setRemote(null))
  } catch { setRemote(null) }
 }, [])

 const remoteIds = useMemo(() => new Set((remote ?? []).map(post => post.id)), [remote])
 const allPosts = useMemo(() => {
  const map = new Map<string, Post>()
  for (const post of local.posts) map.set(post.id, post)
  for (const post of remote ?? []) map.set(post.id, post)
  return [...map.values()]
 }, [local.posts, remote])

 const posts = useMemo(() => {
  if (tab === 'friends') return allPosts.filter(post => post.uid && myFriendIds.includes(post.uid)).sort((a, b) => b.createdAt - a.createdAt)
  if (tab === 'trending') return [...allPosts].sort((a, b) => engagement(b) - engagement(a))
  return [...allPosts].sort((a, b) => b.createdAt - a.createdAt)
 }, [allPosts, tab, myFriendIds])

 const trendingIds = useMemo(() => new Set([...allPosts].sort((a, b) => engagement(b) - engagement(a)).slice(0, 3).map(post => post.id)), [allPosts])

 const name = user?.displayName ?? 'Guest Learner'
 const handle = user?.email?.split('@')[0] ?? 'guest'
 const me = directory?.find(item => item.id === user?.uid)
 const suggested = (directory ?? []).filter(item => item.id !== user?.uid && !myFriendIds.includes(item.id)).slice(0, 5)
 const friendProfiles = (directory ?? []).filter(item => myFriendIds.includes(item.id)).slice(0, 8)

 const publish = async () => {
  const text = draft.trim()
  if (!text) return
  const post = { uid: user?.uid ?? null, name, handle, photo: user?.photoURL ?? null, image: imageUrl.trim() || null, color: '#6871FA', text, courseSlug: attachedCourse?.slug ?? null, courseTitle: attachedCourse?.title ?? null, likes: 0, replies: 0 }
  setDraft(''); setImageUrl(''); setImageOpen(false); setAttachedCourse(null); setCoursePickerOpen(false)
  try { await addDoc(collection(db, 'posts'), { ...post, createdAt: serverTimestamp() }); setNotice('Posted to the community ✦') }
  catch { local.addPost(post); setNotice('Posted on this device (cloud sync unavailable)') }
  window.setTimeout(() => setNotice(''), 3000)
 }

 const toggleLike = (post: Post) => {
  const liked = likedIds.includes(post.id)
  const next = liked ? likedIds.filter(id => id !== post.id) : [...likedIds, post.id]
  setLikedIds(next); localStorage.setItem(LIKED_KEY, JSON.stringify(next))
  if (remoteIds.has(post.id)) { updateDoc(doc(db, 'posts', post.id), { likes: increment(liked ? -1 : 1) }).catch(() => {}) }
  else local.toggleLike(post.id)
 }

 const toggleSave = (postId: string) => {
  const next = savedIds.includes(postId) ? savedIds.filter(id => id !== postId) : [...savedIds, postId]
  setSavedIds(next); localStorage.setItem(SAVED_KEY, JSON.stringify(next))
 }

 const displayLikes = (post: Post) => remoteIds.has(post.id) ? post.likes : post.likes + (likedIds.includes(post.id) && !post.liked ? 1 : 0)

 const respondRequest = (otherUid: string, accept: boolean) => { if (!user) return; (accept ? acceptFriendRequest(user.uid, otherUid) : declineFriendRequest(user.uid, otherUid)).catch(() => {}) }

 const redeem = async () => {
  if (!user || !redeemInput.trim()) return
  setRedeemStatus('pending')
  try { setRedeemStatus(await redeemReferralCode(redeemInput.trim(), user.uid)) }
  catch { setRedeemStatus('invalid') }
 }

 const myUrl = me?.publicId ? `${window.location.origin}/community?ref=${me.publicId}` : window.location.origin

 return <main className="community">
  <section className="community-hero">{pile.map((card, index) => <div className="pile-card" key={card.text} style={{ left: card.x, top: card.y, background: card.c, '--r': `${card.r}deg`, animationDelay: `${index * 55}ms` } as React.CSSProperties}>{card.text}</div>)}
   <div className="quote-card"><p>IF YOU LEARN SOMETHING AND TELL NO ONE, THE IDEA STOPS WITH YOU.</p><span>Say it below ↓</span></div>
   <div className="connect-pill"><span>Connect with us:</span><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Ig/></a><a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X"><Xx/></a><a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><In/></a><a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Yt/></a></div>
  </section>

  <section className="feed section community-layout">
   <div className="feed-main">
    <Reveal><div className="feed-heading"><span className="kicker">The commons</span><h2>What learners are <em>saying.</em></h2><p>Wins, hot takes, questions, requests — if it helps someone learn, it belongs here.{remote && <span className="live-dot"> · Live</span>}</p></div></Reveal>

    <div className="feed-tabs">
     <button className={tab === 'friends' ? 'on' : ''} onClick={() => setTab('friends')}><Users size={14}/> Friends</button>
     <button className={tab === 'new' ? 'on' : ''} onClick={() => setTab('new')}><Sparkles size={14}/> New</button>
     <button className={tab === 'trending' ? 'on' : ''} onClick={() => setTab('trending')}><TrendingUp size={14}/> Trending</button>
    </div>

    <Reveal delay={80}><div className="composer"><span className="post-avatar" style={{ background: '#5952F4' }}>{user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer"/> : name.slice(0, 2).toUpperCase()}</span><div className="composer-main"><textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder="Share a thought, a win, or a question…" rows={3} maxLength={420}/>
     {imageOpen && <div className="composer-image"><input value={imageUrl} onChange={event => setImageUrl(event.target.value)} placeholder="Paste an image URL (optional — a default photo is used if empty)"/><button onClick={() => { setImageOpen(false); setImageUrl('') }} aria-label="Remove image"><X/></button></div>}
     {coursePickerOpen && !attachedCourse && <div className="composer-course-picker">{courses.map(course => <button key={course.slug} onClick={() => { setAttachedCourse({ slug: course.slug, title: course.title }); setCoursePickerOpen(false) }}>{course.title}</button>)}</div>}
     {attachedCourse && <div className="composer-attached-course"><BookOpen size={14}/> {attachedCourse.title}<button onClick={() => setAttachedCourse(null)} aria-label="Remove course"><X size={13}/></button></div>}
     <div className="composer-row"><div className="composer-left"><button className="composer-tool" onClick={() => setImageOpen(open => !open)} aria-label="Add image"><ImagePlus/></button><button className="composer-tool" onClick={() => setCoursePickerOpen(open => !open)} aria-label="Attach a course"><BookOpen/></button><small>{notice || `${user ? `Posting as ${name}` : 'Posting as guest'} · ${420 - draft.length} left`}</small></div><button className="button primary" onClick={publish} disabled={!draft.trim()}><Send/> Post</button></div></div></div></Reveal>

    <div className="feed-list ig-list">{posts.map((post, index) => { const liked = likedIds.includes(post.id) || post.liked; const saved = savedIds.includes(post.id); const avatarNode = post.photo ? <img src={post.photo} alt="" referrerPolicy="no-referrer"/> : post.name.slice(0, 2).toUpperCase()
     return <Reveal delay={Math.min(index, 5) * 60} key={post.id}><article className="ig-post">
      <header className="ig-post-head">
       {post.uid ? <Link to={`/profile/${post.uid}`} className="post-avatar" style={{ background: post.color }}>{avatarNode}</Link> : <span className="post-avatar" style={{ background: post.color }}>{avatarNode}</span>}
       <div className="ig-post-who">{post.uid ? <Link to={`/profile/${post.uid}`}><b>{post.handle}</b></Link> : <b>{post.handle}</b>}<span>{timeAgo(post.createdAt)} ago</span></div>
       {tab === 'trending' && trendingIds.has(post.id) && <span className="trending-badge"><Flame size={11}/> Trending</span>}
       <button className="ig-more" aria-label="More options"><MoreHorizontal size={17}/></button>
      </header>
      {post.image && <div className="ig-post-image"><img src={post.image} alt="" loading="lazy"/></div>}
      <div className={`ig-post-actions ${!post.image ? 'no-image' : ''}`}>
       <button className={liked ? 'liked' : ''} onClick={() => toggleLike(post)} aria-label="Like post"><Heart/></button>
       <button aria-label="Comment" onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}><MessageCircle/></button>
       <div className="share-wrap"><button onClick={() => setShareMenuId(shareMenuId === post.id ? null : post.id)} aria-label="Share post"><Send/></button>{shareMenuId === post.id && <div className="share-popover"><ShareRow url={`${window.location.origin}/community`} text={`"${post.text.slice(0, 180)}" — ${post.name} on FCA Commons`}/></div>}</div>
       <button className={`ig-save ${saved ? 'on' : ''}`} onClick={() => toggleSave(post.id)} aria-label="Save post"><Bookmark/></button>
      </div>
      <div className="ig-post-likes">{displayLikes(post).toLocaleString()} likes</div>
      <p className="ig-post-caption"><b>{post.handle}</b> {post.text}</p>
      {post.courseSlug && <Link to={`/academy/${post.courseSlug}`} className="post-course-chip"><BookOpen size={13}/> {post.courseTitle ?? 'View course'}</Link>}
      <button className="ig-post-comments" onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}>{expandedId === post.id ? 'Hide comments' : post.replies > 0 ? `View all ${post.replies} comments` : 'Add a comment'}</button>
      {expandedId === post.id && <PostComments postId={post.id} myUid={user?.uid} myName={name} myPhoto={user?.photoURL}/>}
      <span className="ig-post-time">{timeAgo(post.createdAt).toUpperCase()} AGO</span>
     </article></Reveal>
    })}</div>
    {!posts.length && tab === 'friends' && <div className="empty"><p>{user ? 'Your friends haven\'t posted yet — invite some from the sidebar.' : 'Sign in and add friends to see their posts here.'}</p></div>}
   </div>

   <aside className="feed-sidebar">
    <Reveal><div className="sidebar-card id-card"><h3><Sparkles size={15}/> Your ID</h3>{user ? <><div className="id-value">{me?.publicId ?? 'Generating…'}</div><p className="id-hint">This is also your referral code — friends who redeem it become instant connections, and you both get +50 IQ.</p><ShareRow url={myUrl} text={`Join me on Future Creators Academy — use my code ${me?.publicId ?? ''} when you sign up:`}/></> : <p className="id-hint"><Link to="/auth/sign-in">Sign in</Link> to get your unique ID and start inviting friends.</p>}
     {user && <div className="redeem-row"><input value={redeemInput} onChange={event => { setRedeemInput(event.target.value); setRedeemStatus(null) }} placeholder="Redeem a friend's code"/><button className="button ghost sm" onClick={redeem} disabled={!redeemInput.trim() || redeemStatus === 'pending'}>Redeem</button></div>}
     {redeemStatus === 'ok' && <p className="redeem-status success">Connected! +50 IQ is on its way to both of you.</p>}
     {redeemStatus === 'self' && <p className="redeem-status error">That's your own code.</p>}
     {redeemStatus === 'invalid' && <p className="redeem-status error">Code not found — double-check it.</p>}
     {redeemStatus === 'already' && <p className="redeem-status error">You're already connected.</p>}
    </div></Reveal>

    {user && incomingRequests.length > 0 && <Reveal delay={60}><div className="sidebar-card requests-card"><h3><UserPlus size={15}/> Friend requests <span className="friend-count">{incomingRequests.length}</span></h3><div className="suggested-list">{incomingRequests.map(uid => { const person = directory?.find(item => item.id === uid); return <div className="suggested-row" key={uid}><Link to={`/profile/${uid}`} className="post-avatar sm">{person?.photoURL ? <img src={person.photoURL} alt="" referrerPolicy="no-referrer"/> : (person?.displayName ?? '?').slice(0, 2).toUpperCase()}</Link><Link to={`/profile/${uid}`} className="suggested-name">{person?.displayName ?? 'FCA Learner'}</Link><div className="request-actions"><button className="request-accept" onClick={() => respondRequest(uid, true)} aria-label="Accept request"><Check size={13}/></button><button className="request-decline" onClick={() => respondRequest(uid, false)} aria-label="Decline request"><X size={13}/></button></div></div> })}</div></div></Reveal>}

    <Reveal delay={80}><div className="sidebar-card"><h3><UserPlus size={15}/> People you may know</h3>{!suggested.length && <p className="admin-empty">No suggestions yet.</p>}<div className="suggested-list">{suggested.map(person => <SuggestedPersonRow person={person} myUid={user?.uid} key={person.id}/>)}</div></div></Reveal>

    <Reveal delay={140}><div className="sidebar-card"><h3><Users size={15}/> Your friends {myFriendIds.length > 0 && <span className="friend-count">{myFriendIds.length}</span>}</h3>{!friendProfiles.length && <p className="admin-empty">{user ? 'No friends yet — share your ID above.' : 'Sign in to connect with other learners.'}</p>}<div className="friends-grid">{friendProfiles.map(friend => <div className="friend-chip-wrap" key={friend.id}><Link to={`/profile/${friend.id}`} className="friend-chip" title={friend.displayName}>{friend.photoURL ? <img src={friend.photoURL} alt="" referrerPolicy="no-referrer"/> : (friend.displayName ?? '?').slice(0, 2).toUpperCase()}</Link><Link to={`/messages?with=${friend.id}`} className="friend-message-btn" aria-label="Message"><MessageSquare size={11}/></Link></div>)}</div></div></Reveal>
   </aside>
  </section>
 </main>
}
