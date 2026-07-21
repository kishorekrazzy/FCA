import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MessageCircleHeart, Search, Send, Sparkles, Users } from 'lucide-react'
import { useAuthStore } from '../store/auth-store'
import { useConnections } from '../store/connections-store'
import { useRemoteUsers, type RemoteUser } from '../components/admin/useAdminData'
import { sendMessage, useConversation, useConversationsList, type Message } from '../store/messages-store'

const timeAgo = (timestamp: number) => {
 const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000))
 if (minutes < 60) return `${minutes}m`
 const hours = Math.round(minutes / 60)
 if (hours < 24) return `${hours}h`
 return `${Math.round(hours / 24)}d`
}

const clockTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const GROUP_WINDOW = 5 * 60 * 1000

function Avatar({ profile, active }: { profile?: RemoteUser | null; active?: boolean }) {
 return <span className={`msg-avatar-ring ${active ? 'active' : ''}`}><span className="post-avatar" style={{ background: '#5952F4' }}>{profile?.photoURL ? <img src={profile.photoURL} alt="" referrerPolicy="no-referrer"/> : (profile?.displayName ?? '?').slice(0, 2).toUpperCase()}</span></span>
}

export function Messages() {
 const user = useAuthStore((state) => state.user)
 const [params, setParams] = useSearchParams()
 const withUid = params.get('with')
 const [activeUid, setActiveUid] = useState<string | null>(withUid)
 const [draft, setDraft] = useState('')
 const [search, setSearch] = useState('')
 const [sent, setSent] = useState(false)
 const scrollRef = useRef<HTMLDivElement>(null)

 const friendIds = useConnections(user?.uid)
 const { users: directory } = useRemoteUsers()
 const conversations = useConversationsList(user?.uid)
 const messages = useConversation(user?.uid, activeUid)

 useEffect(() => { if (withUid) setActiveUid(withUid) }, [withUid])
 useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages.length])

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
 const send = async () => { if (!activeUid || !draft.trim()) return; const text = draft; setDraft(''); setSent(true); window.setTimeout(() => setSent(false), 260); await sendMessage(user.uid, activeUid, text).catch(() => {}) }
 const profileFor = (uid: string) => directory?.find((item) => item.id === uid)
 const activeProfile = activeUid ? profileFor(activeUid) : null
 const friendsWithoutThread = friendIds.filter((id) => !conversations.some((item) => item.otherUid === id))

 const query = search.trim().toLowerCase()
 const matches = (uid: string) => !query || (profileFor(uid)?.displayName ?? 'fca learner').toLowerCase().includes(query)
 const filteredConversations = conversations.filter((item) => matches(item.otherUid))
 const filteredFriends = friendsWithoutThread.filter(matches)

 return <main className="messages-page page">
  <div className="messages-layout">
   <aside className="messages-list">
    <div className="messages-list-head"><h2><Sparkles size={15}/> Messages</h2></div>
    <div className="messages-search"><Search size={14}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations…"/></div>
    {!conversations.length && !friendsWithoutThread.length && <div className="messages-empty-list"><Users size={22}/><p>Add friends in the <Link to="/community">community</Link> to start chatting.</p></div>}
    {!filteredConversations.length && !filteredFriends.length && (conversations.length > 0 || friendsWithoutThread.length > 0) && <p className="admin-empty">No one matches “{search}”.</p>}
    <div className="conversation-rows">
     {filteredConversations.map((item, index) => { const profile = profileFor(item.otherUid); const active = activeUid === item.otherUid
      return <button key={item.otherUid} className={`conversation-row ${active ? 'on' : ''}`} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }} onClick={() => openChat(item.otherUid)}>
       <Avatar profile={profile} active={active}/>
       <span className="conversation-info"><b>{profile?.displayName ?? 'FCA Learner'}</b><span>{item.lastFromMe ? 'You: ' : ''}{item.lastText}</span></span>
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
      <Avatar profile={activeProfile}/>
      <Link to={`/profile/${activeUid}`} className="thread-header-name"><b>{activeProfile?.displayName ?? 'FCA Learner'}</b><span>View profile</span></Link>
     </header>
     <div className="messages-scroll" ref={scrollRef}>
      {!messages.length && <div className="messages-empty-thread"><Sparkles size={18}/><p>No messages yet — send the first one.</p></div>}
      {groups.map(({ message, startsGroup, endsGroup, daySeparator }) => <MessageBubble key={message.id} message={message} mine={message.from === user.uid} startsGroup={startsGroup} endsGroup={endsGroup} daySeparator={daySeparator}/>)}
     </div>
     <div className="messages-input"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message…" onKeyDown={(event) => event.key === 'Enter' && send()}/><button className={sent ? 'sent' : ''} onClick={send} disabled={!draft.trim()} aria-label="Send"><Send size={16}/></button></div>
    </>}
   </section>
  </div>
 </main>
}

function MessageBubble({ message, mine, startsGroup, endsGroup, daySeparator }: { message: Message; mine: boolean; startsGroup: boolean; endsGroup: boolean; daySeparator: boolean }) {
 return <>
  {daySeparator && <div className="day-separator"><span>{new Date(message.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span></div>}
  <div className={`bubble-wrap ${mine ? 'mine' : 'theirs'} ${startsGroup ? 'group-start' : ''} ${endsGroup ? 'group-end' : ''}`}>
   <div className={`bubble ${mine ? 'mine' : 'theirs'}`}>{message.text}</div>
   {endsGroup && <span className="bubble-time">{clockTime(message.createdAt)}</span>}
  </div>
 </>
}
