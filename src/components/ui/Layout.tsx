import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, Compass, GraduationCap, MessageCircle, MessagesSquare, Moon, Search, Shield, Sun } from 'lucide-react'
import { useAcademyStore } from '../../store/academy-store'
import { useAuthStore } from '../../store/auth-store'
import { useAdminStore } from '../../store/admin-store'
import { useThemeStore } from '../../store/theme-store'

const ADMIN_EMAIL = 'kishore.officialedit@gmail.com'

export function TopNav() {
  const xp = useAcademyStore((state) => state.xp)
  const streak = useAcademyStore((state) => state.streak)
  const user = useAuthStore((state) => state.user)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const navigate = useNavigate()
  const openAdmin = () => { useAdminStore.getState().unlock('ck24'); navigate('/admin') }
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let last = 0
    const onScroll = () => { const y = window.scrollY; setHidden(y > 120 && y > last); last = y }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <header className={`top-nav ${hidden ? 'nav-hidden' : ''}`}><Link className="brand" to="/"><img className="brand-logo" src="/logo.svg" alt="Future Creators Academy"/><span className="brand-text">FUTURE CREATORS <span>ACADEMY</span></span></Link><nav><NavLink to="/academy">Academy</NavLink><NavLink to="/community">Community</NavLink><NavLink to="/events">Events <b>NEW</b></NavLink><NavLink to="/dashboard">Dashboard</NavLink></nav><div className="nav-actions"><button aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button>{user?.email === ADMIN_EMAIL && <button aria-label="Admin" onClick={openAdmin}><Shield size={17}/></button>}{user && <Link aria-label="Messages" to="/messages"><MessageCircle size={17}/></Link>}<button aria-label="Search courses" onClick={() => navigate('/academy?focus=1')}><Search size={17}/></button><span className="xp-chip"><img className="mini-icon" src="/icon-xp.svg" alt=""/>{xp.toLocaleString()} IQ</span>{streak > 0 && <span className="streak"><img className="mini-icon" src="/icon-streak.svg" alt=""/> {streak}</span>}{user ? <Link className="avatar" to="/dashboard" aria-label="Your dashboard">{user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer"/> : (user.displayName ?? "FC").slice(0, 2).toUpperCase()}</Link> : <Link className="button light sign-in-btn" to="/auth/sign-in">Sign in</Link>}</div></header>
}

export function Footer() {
  return <footer className="footer"><div className="footer-word" aria-hidden="true"><div className="fw-inner"><span className="fw-seg">F<span className="fw-rest">uture</span></span><span className="fw-seg">C<span className="fw-rest">reators</span></span><span className="fw-seg">A<span className="fw-rest">cademy</span></span></div></div><div className="footer-grid"><div><div className="brand"><img className="brand-logo" src="/logo.svg" alt=""/><span className="brand-text">FUTURE CREATORS <span>ACADEMY</span></span></div><p>Learning for people who make what matters. Short, serious courses — practiced, not just watched.</p></div><div><h4>Learn</h4><Link to="/academy">All courses</Link><Link to="/dashboard">My dashboard</Link></div><div><h4>Events</h4><Link to="/events">All events</Link></div></div><div className="footer-base"><span>© 2026 Future Creators Academy</span><span>Made for the curious ✦ <Link to="/admin" className="admin-entry">Admin</Link></span></div></footer>
}

export function MobileNav() { return <nav className="mobile-nav"><NavLink to="/" end><Compass/>Home</NavLink><NavLink to="/academy"><BookOpen/>Learn</NavLink><NavLink to="/community"><MessagesSquare/>Commons</NavLink><NavLink to="/dashboard"><GraduationCap/>Progress</NavLink></nav> }
