import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Award, BookOpen, Image, LayoutGrid, Library, Lock, Map, MessagesSquare, Medal, ShieldAlert, ShoppingBag, Sparkles, Trophy, Users } from 'lucide-react'
import { ADMIN_EMAIL, useAdminStore } from '../../store/admin-store'
import { useAuthStore } from '../../store/auth-store'

export function AdminGate({ children }: { children: React.ReactNode }) {
 const unlocked = useAdminStore((state) => state.unlocked)
 const unlock = useAdminStore((state) => state.unlock)
 const user = useAuthStore((state) => state.user)
 const [code, setCode] = useState('')
 const [error, setError] = useState(false)
 const authorized = user?.email === ADMIN_EMAIL
 if (unlocked && authorized) return <>{children}</>
 // Even someone who knows the passcode can't get in unless they're signed in
 // with the one authorized account — the passcode alone is no longer enough.
 if (!authorized) return <main className="admin-gate"><div className="admin-gate-card"><span className="brand-mark restricted"><ShieldAlert size={15}/></span><h1>Restricted</h1><p>This area is only available to the site owner's account. Sign in with an authorized account to continue.</p><Link className="button primary full" to="/auth/sign-in">Sign in</Link><Link className="text-link" to="/">← Back to site</Link></div></main>
 const submit = () => { if (unlock(code)) { setError(false) } else setError(true) }
 return <main className="admin-gate"><div className="admin-gate-card"><span className="brand-mark"><Sparkles size={15}/></span><h1>Admin access</h1><p>Enter the operator passcode to manage courses, users, and the community.</p><div className="admin-gate-row"><input type="password" value={code} onChange={(event) => { setCode(event.target.value); setError(false) }} onKeyDown={(event) => event.key === 'Enter' && submit()} placeholder="Passcode" autoFocus/><button className="button primary" onClick={submit}>Enter</button></div>{error && <p className="admin-error">Incorrect passcode.</p>}<Link className="text-link" to="/">← Back to site</Link></div></main>
}

export function AdminShell({ children }: { children: React.ReactNode }) {
 const lock = useAdminStore((state) => state.lock)
 const user = useAuthStore((state) => state.user)
 return <div className="admin-shell">
  <aside className="admin-sidebar">
   <Link className="brand admin-brand" to="/admin"><img className="brand-logo" src="/logo.svg" alt=""/> FCA Admin</Link>
   <nav>
    <NavLink to="/admin" end><span className="admin-nav-icon"><LayoutGrid/></span> Overview</NavLink>
    <span className="admin-nav-label">Content</span>
    <NavLink to="/admin/courses"><span className="admin-nav-icon"><BookOpen/></span> Courses</NavLink>
    <NavLink to="/admin/books"><span className="admin-nav-icon"><Library/></span> Books</NavLink>
    <NavLink to="/admin/paths"><span className="admin-nav-icon"><Map/></span> Learning paths</NavLink>
    <span className="admin-nav-label">People</span>
    <NavLink to="/admin/users"><span className="admin-nav-icon"><Users/></span> Users</NavLink>
    <NavLink to="/admin/certificates"><span className="admin-nav-icon"><Award/></span> Certificates</NavLink>
    <NavLink to="/admin/community"><span className="admin-nav-icon"><MessagesSquare/></span> Community</NavLink>
    <span className="admin-nav-label">Engagement</span>
    <NavLink to="/admin/challenges"><span className="admin-nav-icon"><Trophy/></span> Events</NavLink>
    <NavLink to="/admin/achievements"><span className="admin-nav-icon"><Medal/></span> Achievements</NavLink>
    <NavLink to="/admin/banners"><span className="admin-nav-icon"><Image/></span> Banners</NavLink>
    <NavLink to="/admin/shop"><span className="admin-nav-icon"><ShoppingBag/></span> Shop</NavLink>
   </nav>
   <div className="admin-sidebar-foot">
    {user && <div className="admin-whoami"><span className="admin-whoami-avatar">{user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer"/> : (user.displayName ?? '?').slice(0, 2).toUpperCase()}</span><span className="admin-whoami-email">{user.email}</span></div>}
    <div className="admin-sidebar-foot-actions"><Link to="/" className="text-link">View site</Link><button className="text-link" onClick={lock}><Lock size={13}/> Lock</button></div>
   </div>
  </aside>
  <main className="admin-main">{children}</main>
 </div>
}
