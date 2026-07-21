import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Award, BookOpen, LayoutGrid, Lock, Map, MessagesSquare, ShieldAlert, Sparkles, Trophy, Users } from 'lucide-react'
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
 if (!authorized) return <main className="admin-gate"><div className="admin-gate-card"><span className="brand-mark"><ShieldAlert size={15}/></span><h1>Restricted</h1><p>This area is only available to the site owner's account. Sign in with an authorized account to continue.</p><Link className="button primary full" to="/auth/sign-in">Sign in</Link><Link className="text-link" to="/">← Back to site</Link></div></main>
 const submit = () => { if (unlock(code)) { setError(false) } else setError(true) }
 return <main className="admin-gate"><div className="admin-gate-card"><span className="brand-mark"><Sparkles size={15}/></span><h1>Admin access</h1><p>Enter the operator passcode to manage courses, users, and the community.</p><div className="admin-gate-row"><input type="password" value={code} onChange={(event) => { setCode(event.target.value); setError(false) }} onKeyDown={(event) => event.key === 'Enter' && submit()} placeholder="Passcode" autoFocus/><button className="button primary" onClick={submit}>Enter</button></div>{error && <p className="admin-error">Incorrect passcode.</p>}<Link className="text-link" to="/">← Back to site</Link></div></main>
}

export function AdminShell({ children }: { children: React.ReactNode }) {
 const lock = useAdminStore((state) => state.lock)
 return <div className="admin-shell">
  <aside className="admin-sidebar">
   <Link className="brand admin-brand" to="/admin"><img className="brand-logo" src="/logo.svg" alt=""/> FCA Admin</Link>
   <nav>
    <NavLink to="/admin" end><LayoutGrid/> Overview</NavLink>
    <NavLink to="/admin/courses"><BookOpen/> Courses</NavLink>
    <NavLink to="/admin/users"><Users/> Users</NavLink>
    <NavLink to="/admin/certificates"><Award/> Certificates</NavLink>
    <NavLink to="/admin/community"><MessagesSquare/> Community</NavLink>
    <NavLink to="/admin/paths"><Map/> Learning paths</NavLink>
    <NavLink to="/admin/challenges"><Trophy/> Events</NavLink>
   </nav>
   <div className="admin-sidebar-foot"><Link to="/" className="text-link">View site</Link><button className="text-link" onClick={lock}><Lock size={13}/> Lock</button></div>
  </aside>
  <main className="admin-main">{children}</main>
 </div>
}
