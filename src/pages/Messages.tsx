import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, GraduationCap, MessageCircleHeart, Plus, Search, Send, Share2, Sparkles, Sticker as StickerIcon, Users, X } from 'lucide-react'
import { useAuthStore } from '../store/auth-store'
import { useConnections } from '../store/connections-store'
import { useRemoteUsers, type RemoteUser } from '../components/admin/useAdminData'
import { sendMessage, votePoll, useConversation, useConversationsList, type Message, type PollData, type SharedPostData, type SharedCourseData } from '../store/messages-store'
import { useAllPosts } from '../data/posts'
import { useCourses, useCourseBySlug } from '../data/catalog'
import { useAcademyStore } from '../store/academy-store'
import { useShopItems } from '../store/shop-store'
import type { Post } from '../store/community-store'
import type { Course } from '../types'

const timeAgo = (timestamp: number) => {
 const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000))
 if (minutes < 60) return `${minutes}m`
 const hours = Math.round(minutes / 60)
 if (hours < 24) return `${hours}h`
 return `${Math.round(hours / 24)}d`
}

const clockTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const GROUP_WINDOW = 5 * 60 * 1000
const STICKERS = ['😂', '❤️', '🔥', '👍', '🎉', '😍', '😮', '😢', '🙌', '💯', '✨', '🥳', '😎', '🤝', '🙏', '😅', '😜', '🤩', '👏', '💪', '🎯', '🚀', '⚡', '🌈']

function Avatar({ profile, active }: { profile?: RemoteUser | null; active?: boolean }) {
 return <span className={`msg-avatar-ring ${active ? 'active' : ''}`}><span className="post-avatar" style={{ background: '#5952F4' }}>{profile?.photoURL ? <img src={profile.photoURL} alt="" referrerPolicy="no-referrer"/> : (profile?.displayName ?? '?').slice(0, 2).toUpperCase()}</span></span>
}

type ComposerTray = 'sticker' | 'poll' | 'share' | null

export function Messages() {
 const user = useAuthStore((state) => state.user)
 const [params, setParams] = useSearchParams()
 const withUid = params.get('with')
 const [activeUid, setActiveUid] = useState<string | null>(withUid)
 const [draft, setDraft] = useState('')
 const [search, setSearch] = useState('')
 const [sent, setSent] = useState(false)
 const [tray, setTray] = useState<ComposerTray>(null)
 const [shareTab, setShareTab] = useState<'posts' | 'courses'>('posts')
 const [pollQuestion, setPollQuestion] = useState('')
 const [pollOptions, setPollOptions] = useState(['', ''])
 const scrollRef = useRef<HTMLDivElement>(null)

 const friendIds = useConnections(user?.uid)
 const { users: directory } = useRemoteUsers()
 const conversations = useConversationsList(user?.uid)
 const messages = useConversation(user?.uid, activeUid)
 const { posts: sharablePosts } = useAllPosts()
 const courses = useCourses()
 const ownedItems = useAcademyStore((state) => state.ownedItems)
 const shopItems = useShopItems()
 const ownedStickers = shopItems.filter((item) => item.type === 'sticker' && ownedItems.includes(item.id)).map((item) => item.emoji)

 useEffect(() => { if (withUid) setActiveUid(withUid) }, [withUid])
 useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages.length])
 useEffect(() => { setTray(null) }, [activeUid])

 const groups = useMemo(() => messages.map((message, index) => {
  const prev = messages[index - 1]
  const next = messages[index + 1]
  const startsGroup = !prev || prev.from !== message.from || message.createdAt - prev.createdAt > GROUP_WINDOW
  const endsGroup = !next || next.from !== message.from || next.createdAt - message.createdAt > GROUP_WINDOW
  const daySeparator = !prev || new Date(prev.createdAt).toDateString() !== new Date(message.createdAt).toDateString()
  return { message, startsGroup, endsGroup, daySeparator }
 }), [messages])

 if (!user) return <main className="page messages-page not-found"><div className="messages-signin"><MessageCircleHeart size={30}/><h1>Sign in to message friends.</h1><Link className="button primary" to="/auth/sign-in">Sign in</Link></div></main>

 const openChat = (uid: string) => { setActiveUid(uid); setParams({ with: uid }, { replace: true }) }
 const closeChat = () => { setActiveUid(null); setParams({}, { replace: true }) }
 const closeTray = () => setTray(null)
 const toggleTray = (next: Exclude<ComposerTray, null>) => setTray((current) => current === next ? null : next)

 const send = async () => { if (!activeUid || !draft.trim()) return; const text = draft; setDraft(''); setSent(true); window.setTimeout(() => setSent(false), 260); await sendMessage(user.uid, activeUid, text).catch(() => {}) }
 const sendSticker = async (emoji: string) => { if (!activeUid) return; closeTray(); await sendMessage(user.uid, activeUid, emoji, 'sticker').catch(() => {}) }

 const addPollOption = () => setPollOptions((opts) => opts.length < 4 ? [...opts, ''] : opts)
 const removePollOption = (index: number) => setPollOptions((opts) => opts.length > 2 ? opts.filter((_, i) => i !== index) : opts)
 const updatePollOption = (index: number, value: string) => setPollOptions((opts) => opts.map((opt, i) => i === index ? value : opt))
 const canSendPoll = pollQuestion.trim().length > 0 && pollOptions.filter((opt) => opt.trim()).length >= 2
 const sendPoll = async () => {
  if (!activeUid || !canSendPoll) return
  const question = pollQuestion.trim()
  const options = pollOptions.map((opt) => opt.trim()).filter(Boolean)
  closeTray(); setPollQuestion(''); setPollOptions(['', ''])
  await sendMessage(user.uid, activeUid, question, 'poll', { poll: { question, options, votes: {} } }).catch(() => {})
 }

 const sharePost = async (post: Post) => { if (!activeUid) return; closeTray()
  const payload: SharedPostData = { id: post.id, name: post.name, handle: post.handle, photo: post.photo ?? undefined, image: post.image ?? undefined, text: post.text, courseTitle: post.courseTitle ?? undefined }
  await sendMessage(user.uid, activeUid, `Shared a post from ${post.handle}`, 'post', { sharedPost: payload }).catch(() => {})
 }
 const shareCourse = async (course: Course) => { if (!activeUid) return; closeTray()
  const payload: SharedCourseData = { slug: course.slug, title: course.title, category: course.category }
  await sendMessage(user.uid, activeUid, `Shared the course "${course.title}"`, 'course', { sharedCourse: payload }).catch(() => {})
 }

 const vote = (message: Message, index: number) => { if (!user) return; votePoll(message.id, user.uid, index).catch(() => {}) }

 const profileFor = (uid: string) => directory?.find((item) => item.id === uid)
 const activeProfile = activeUid ? profileFor(activeUid) : null
 const friendsWithoutThread = friendIds.filter((id) => !conversations.some((item) => item.otherUid === id))

 const query = search.trim().toLowerCase()
 const matches = (uid: string) => !query || (profileFor(uid)?.displayName ?? 'fca learner').toLowerCase().includes(query)
 const filteredConversations = conversations.filter((item) => matches(item.otherUid))
 const filteredFriends = friendsWithoutThread.filter(matches)

 return <main className="messages-page messages-full page">
  <div className={`messages-layout ${activeUid ? 'has-active' : ''}`}>
   <aside className="messages-list">
    <div className="messages-list-head"><Link className="messages-close" to="/" aria-label="Leave messages"><ArrowLeft size={17}/></Link><h2><Sparkles size={15}/> Messages</h2></div>
    <div className="messages-search"><Search size={14}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations…"/></div>
    {!conversations.length && !friendsWithoutThread.length && <div className="messages-empty-list"><Users size={22}/><p>Add friends in the <Link to="/community">community</Link> to start chatting.</p></div>}
    {!filteredConversations.length && !filteredFriends.length && (conversations.length > 0 || friendsWithoutThread.length > 0) && <p className="admin-empty">No one matches "{search}".</p>}
    <div className="conversation-rows">
     {filteredConversations.map((item, index) => { const profile = profileFor(item.otherUid); const active = activeUid === item.otherUid
      return <button key={item.otherUid} className={`conversation-row ${active ? 'on' : ''}`} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }} onClick={() => openChat(item.otherUid)}>
       <Avatar profile={profile} active={active}/>
       <span className="conversation-info"><b>{profile?.displayName ?? 'FCA Learner'}</b><span>{item.lastKind === 'sticker' ? item.lastText : item.lastFromMe ? `You: ${item.lastText}` : item.lastText}</span></span>
       <span className="conversation-time">{timeAgo(item.lastAt)}</span>
      </button>
     })}
     {filteredFriends.map((uid, index) => { const profile = profileFor(uid); const active = activeUid === uid
      return <button key={uid} className={`conversation-row ${active ? 'on' : ''}`} style={{ animationDelay: `${Math.min(filteredConversations.length + index, 8) * 40}ms` }} onClick={() => openChat(uid)}>
       <Avatar profile={profile} active={active}/>
       <span className="conversation-info"><b>{profile?.displayName ?? 'FCA Learner'}</b><span className="muted">Say hello 👋</span></span>
      </button>
     })}
    </div>
   </aside>

   <section className="messages-thread">
    {!activeUid && <div className="messages-empty"><MessageCircleHeart size={28}/><p>Pick a friend to start chatting.</p></div>}
    {activeUid && <>
     <header className="thread-header">
      <button className="thread-back" onClick={closeChat} aria-label="Back to conversations"><ArrowLeft size={18}/></button>
      <Avatar profile={activeProfile} active/>
      <Link to={`/profile/${activeUid}`} className="thread-header-name"><b>{activeProfile?.displayName ?? 'FCA Learner'}</b><span>View profile</span></Link>
     </header>
     <div className="messages-scroll" ref={scrollRef}>
      {!messages.length && <div className="messages-empty-thread"><Sparkles size={18}/><p>No messages yet — send the first one.</p></div>}
      {groups.map(({ message, startsGroup, endsGroup, daySeparator }) => <MessageBubble key={message.id} message={message} mine={message.from === user.uid} startsGroup={startsGroup} endsGroup={endsGroup} daySeparator={daySeparator} myUid={user.uid} onVote={vote}/>)}
     </div>

     {tray === 'sticker' && <div className="composer-tray sticker-tray">
      <div className="tray-head"><span>Send a sticker</span><button onClick={closeTray} aria-label="Close"><X size={14}/></button></div>
      <div className="sticker-grid">{STICKERS.map((emoji) => <button key={emoji} onClick={() => sendSticker(emoji)}>{emoji}</button>)}</div>
      {!!ownedStickers.length && <><div className="tray-head sticker-tray-sub"><span>From the shop</span></div><div className="sticker-grid">{ownedStickers.map((emoji, index) => <button key={`${emoji}-${index}`} onClick={() => sendSticker(emoji)}>{emoji}</button>)}</div></>}
     </div>}

     {tray === 'poll' && <div className="composer-tray poll-tray">
      <div className="tray-head"><span>Ask a quiz question</span><button onClick={closeTray} aria-label="Close"><X size={14}/></button></div>
      <input className="poll-question-input" value={pollQuestion} onChange={(event) => setPollQuestion(event.target.value)} placeholder="Ask a question…"/>
      <div className="poll-options-edit">
       {pollOptions.map((option, index) => <div key={index} className="poll-option-edit">
        <input value={option} onChange={(event) => updatePollOption(index, event.target.value)} placeholder={`Option ${index + 1}`}/>
        {pollOptions.length > 2 && <button onClick={() => removePollOption(index)} aria-label="Remove option"><X size={12}/></button>}
       </div>)}
      </div>
      <div className="poll-tray-actions">
       {pollOptions.length < 4 ? <button className="poll-add" onClick={addPollOption}><Plus size={13}/> Add option</button> : <span/>}
       <button className="button primary poll-send" disabled={!canSendPoll} onClick={sendPoll}>Send</button>
      </div>
     </div>}

     {tray === 'share' && <div className="composer-tray share-tray">
      <div className="tray-head"><span>Share with {activeProfile?.displayName ?? 'friend'}</span><button onClick={closeTray} aria-label="Close"><X size={14}/></button></div>
      <div className="share-tabs">
       <button className={shareTab === 'posts' ? 'on' : ''} onClick={() => setShareTab('posts')}>Posts</button>
       <button className={shareTab === 'courses' ? 'on' : ''} onClick={() => setShareTab('courses')}>Courses</button>
      </div>
      <div className="share-list">
       {shareTab === 'posts' && (sharablePosts.length ? [...sharablePosts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20).map((post) => <button key={post.id} className="share-item" onClick={() => sharePost(post)}>
        <span className="share-item-avatar" style={{ background: post.color }}>{post.photo ? <img src={post.photo} alt=""/> : post.handle.slice(1, 3).toUpperCase()}</span>
        <span className="share-item-info"><b>{post.handle}</b><span>{post.text}</span></span>
        {post.image && <img className="share-item-thumb" src={post.image} alt=""/>}
       </button>) : <p className="admin-empty">No posts yet.</p>)}
       {shareTab === 'courses' && courses.map((course) => <button key={course.slug} className="share-item" onClick={() => shareCourse(course)}>
        <span className="share-item-course-art"><GraduationCap size={16}/></span>
        <span className="share-item-info"><b>{course.title}</b><span>{course.category}</span></span>
       </button>)}
      </div>
     </div>}

     <div className="messages-input">
      <div className="composer-icons">
       <button aria-label="Send a sticker" className={tray === 'sticker' ? 'on' : ''} onClick={() => toggleTray('sticker')}><StickerIcon size={18}/></button>
       <button aria-label="Ask a quiz question" className={tray === 'poll' ? 'on' : ''} onClick={() => toggleTray('poll')}><BarChart3 size={18}/></button>
       <button aria-label="Share a post or course" className={tray === 'share' ? 'on' : ''} onClick={() => toggleTray('share')}><Share2 size={18}/></button>
      </div>
      <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message…" onKeyDown={(event) => event.key === 'Enter' && send()}/>
      <button className={sent ? 'sent' : ''} onClick={send} disabled={!draft.trim()} aria-label="Send"><Send size={16}/></button>
     </div>
    </>}
   </section>
  </div>
 </main>
}

function PollCard({ message, poll, mine, myUid, onVote }: { message: Message; poll: PollData; mine: boolean; myUid: string; onVote: (message: Message, index: number) => void }) {
 const votes = poll.votes ?? {}
 const counts = poll.options.map((_, i) => Object.values(votes).filter((value) => value === i).length)
 const total = counts.reduce((a, b) => a + b, 0)
 const myVote = votes[myUid]
 return <div className={`poll-card ${mine ? 'mine' : 'theirs'}`}>
  <div className="poll-card-q"><BarChart3 size={13}/> {poll.question}</div>
  <div className="poll-card-options">
   {poll.options.map((option, index) => { const pct = total ? Math.round((counts[index] / total) * 100) : 0; const chosen = myVote === index
    return <button key={index} className={`poll-option ${chosen ? 'chosen' : ''}`} onClick={() => onVote(message, index)}>
     <span className="poll-option-fill" style={{ width: `${pct}%` }}/>
     <span className="poll-option-label">{option}</span>
     <span className="poll-option-pct">{total ? `${pct}%` : ''}</span>
    </button>
   })}
  </div>
  <span className="poll-card-votes">{total} {total === 1 ? 'vote' : 'votes'}</span>
 </div>
}

function SharedPostCard({ post, mine }: { post: SharedPostData; mine: boolean }) {
 return <div className={`shared-post-card ${mine ? 'mine' : 'theirs'}`}>
  <div className="shared-post-head"><span className="shared-post-avatar" style={{ background: '#5952F4' }}>{post.photo ? <img src={post.photo} alt=""/> : post.handle.slice(1, 3).toUpperCase()}</span><b>{post.handle}</b></div>
  {post.image && <img className="shared-post-image" src={post.image} alt=""/>}
  <p className="shared-post-text">{post.text}</p>
  {post.courseTitle && <span className="shared-post-course">🎓 {post.courseTitle}</span>}
 </div>
}

function SharedCourseCard({ course, mine }: { course: SharedCourseData; mine: boolean }) {
 const live = useCourseBySlug(course.slug)
 const inner = <><span className="shared-course-art"><GraduationCap size={18}/></span><span className="shared-course-info"><b>{live?.title ?? course.title}</b><span>{live?.category ?? course.category}</span></span></>
 return live ? <Link to={`/academy/${course.slug}`} className={`shared-course-card ${mine ? 'mine' : 'theirs'}`}>{inner}</Link> : <div className={`shared-course-card ${mine ? 'mine' : 'theirs'} disabled`}>{inner}</div>
}

function MessageBubble({ message, mine, startsGroup, endsGroup, daySeparator, myUid, onVote }: { message: Message; mine: boolean; startsGroup: boolean; endsGroup: boolean; daySeparator: boolean; myUid: string; onVote: (message: Message, index: number) => void }) {
 const kind = message.kind ?? 'text'
 return <>
  {daySeparator && <div className="day-separator"><span>{new Date(message.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span></div>}
  <div className={`bubble-wrap ${mine ? 'mine' : 'theirs'} ${startsGroup ? 'group-start' : ''} ${endsGroup ? 'group-end' : ''}`}>
   {kind === 'text' && <div className={`bubble ${mine ? 'mine' : 'theirs'}`}>{message.text}</div>}
   {kind === 'sticker' && <div className="bubble-sticker">{message.text}</div>}
   {kind === 'poll' && message.poll && <PollCard message={message} poll={message.poll} mine={mine} myUid={myUid} onVote={onVote}/>}
   {kind === 'post' && message.sharedPost && <SharedPostCard post={message.sharedPost} mine={mine}/>}
   {kind === 'course' && message.sharedCourse && <SharedCourseCard course={message.sharedCourse} mine={mine}/>}
   {endsGroup && <span className="bubble-time">{clockTime(message.createdAt)}</span>}
  </div>
 </>
}
