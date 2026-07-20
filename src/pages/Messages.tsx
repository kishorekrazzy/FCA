import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useAuthStore } from '../store/auth-store'
import { useConnections } from '../store/connections-store'
import { useRemoteUsers } from '../components/admin/useAdminData'
import { sendMessage, useConversation, useConversationsList } from '../store/messages-store'

const timeAgo = (timestamp: number) => {
 const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000))
 if (minutes < 60) return `${minutes}m`
 const hours = Math.round(minutes / 60)
 if (hours < 24) return `${hours}h`
 return `${Math.round(hours / 24)}d`
}

export function Messages() {
 const user = useAuthStore((state) => state.user)
 const [params, setParams] = useSearchParams()
 const withUid = params.get('with')
 const [activeUid, setActiveUid] = useState<string | null>(withUid)
 const [draft, setDraft] = useState('')
 const scrollRef = useRef<HTMLDivElement>(null)

 const friendIds = useConnections(user?.uid)
 const { users: directory } = useRemoteUsers()
 const conversations = useConversationsList(user?.uid)
 const messages = useConversation(user?.uid, activeUid)

 useEffect(() => { if (withUid) setActiveUid(withUid) }, [withUid])
 useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages.length])

 if (!user) return <main className="page messages-page not-found"><h1>Sign in to message friends.</h1><Link className="button primary" to="/auth/sign-in">Sign in</Link></main>

 const openChat = (uid: string) => { setActiveUid(uid); setParams({ with: uid }, { replace: true }) }
 const send = async () => { if (!activeUid || !draft.trim()) return; const text = draft; setDraft(''); await sendMessage(user.uid, activeUid, text).catch(() => {}) }
 const profileFor = (uid: string) => directory?.find((item) => item.id === uid)
 const activeProfile = activeUid ? profileFor(activeUid) : null
 const friendsWithoutThread = friendIds.filter((id) => !conversations.some((item) => item.otherUid === id))

 return <main className="messages-page page">
  <div className="messages-layout">
   <aside className="messages-list">
    <h2>Messages</h2>
    {!conversations.length && !friendsWithoutThread.length && <p className="admin-empty">Add friends in the <Link to="/community">community</Link> to start chatting.</p>}
    {conversations.map((item) => { const profile = profileFor(item.otherUid); const active = activeUid === item.otherUid
     return <button key={item.otherUid} className={`conversation-row ${active ? 'on' : ''}`} onClick={() => openChat(item.otherUid)}>
      <span className="post-avatar" style={{ background: '#5952F4' }}>{profile?.photoURL ? <img src={profile.photoURL} alt="" referrerPolicy="no-referrer"/> : (profile?.displayName ?? '?').slice(0, 2).toUpperCase()}</span>
      <span className="conversation-info"><b>{profile?.displayName ?? 'FCA Learner'}</b><span>{item.lastFromMe ? 'You: ' : ''}{item.lastText}</span></span>
      <span className="conversation-time">{timeAgo(item.lastAt)}</span>
     </button>
    })}
    {friendsWithoutThread.map((uid) => { const profile = profileFor(uid); const active = activeUid === uid
     return <button key={uid} className={`conversation-row ${active ? 'on' : ''}`} onClick={() => openChat(uid)}>
      <span className="post-avatar" style={{ background: '#5952F4' }}>{profile?.photoURL ? <img src={profile.photoURL} alt="" referrerPolicy="no-referrer"/> : (profile?.displayName ?? '?').slice(0, 2).toUpperCase()}</span>
      <span className="conversation-info"><b>{profile?.displayName ?? 'FCA Learner'}</b><span className="muted">Say hello 👋</span></span>
     </button>
    })}
   </aside>

   <section className="messages-thread">
    {!activeUid && <div className="messages-empty"><p>Pick a friend to start chatting.</p></div>}
    {activeUid && <>
     <header className="thread-header"><span className="post-avatar" style={{ background: '#5952F4' }}>{activeProfile?.photoURL ? <img src={activeProfile.photoURL} alt="" referrerPolicy="no-referrer"/> : (activeProfile?.displayName ?? '?').slice(0, 2).toUpperCase()}</span><Link to={`/profile/${activeUid}`}><b>{activeProfile?.displayName ?? 'FCA Learner'}</b></Link></header>
     <div className="messages-scroll" ref={scrollRef}>
      {!messages.length && <p className="messages-empty-thread">No messages yet — send the first one.</p>}
      {messages.map((message) => <div key={message.id} className={`bubble ${message.from === user.uid ? 'mine' : 'theirs'}`}>{message.text}</div>)}
     </div>
     <div className="messages-input"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message…" onKeyDown={(event) => event.key === 'Enter' && send()}/><button onClick={send} disabled={!draft.trim()} aria-label="Send"><Send size={16}/></button></div>
    </>}
   </section>
  </div>
 </main>
}
