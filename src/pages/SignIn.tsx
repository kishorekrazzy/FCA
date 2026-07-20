import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BlurText, Magnetic, Reveal } from '../components/fx'
import { signInWithGoogle } from '../lib/firebase'
import { useAuthStore } from '../store/auth-store'

const slides = [
 { kicker: 'SYSTEMS', title: 'See the hidden structure.', body: 'Short lessons that change how you look at problems.', color: '#6871FA' },
 { kicker: 'PRACTICE', title: 'Taste, made teachable.', body: 'Drills that turn good judgment into reflex.', color: '#A993F8' },
 { kicker: 'PROOF', title: 'Finish. Then prove it.', body: 'Verifiable certificates for the work you complete.', color: '#FFD86B' },
]

const GoogleG = () => <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>

export function SignIn() {
 const [slide, setSlide] = useState(0)
 const [error, setError] = useState('')
 const user = useAuthStore(state => state.user)
 const navigate = useNavigate()
 useEffect(() => { const timer = window.setInterval(() => setSlide(current => (current + 1) % slides.length), 4200); return () => window.clearInterval(timer) }, [])
 useEffect(() => { if (user) navigate('/dashboard') }, [user, navigate])
 const login = async () => { setError(''); try { await signInWithGoogle() } catch { setError('Sign-in was interrupted. Please try again.') } }
 return <main className="login-shell">
  <aside className="login-slides">{slides.map((item, index) => <div key={item.kicker} className={`login-slide ${index === slide ? 'active' : ''}`} style={{ '--slide-color': item.color } as React.CSSProperties}><div className="slide-orb"/><i/><i/><div className="slide-copy"><span className="kicker">{item.kicker}</span><h2>{item.title}</h2><p>{item.body}</p></div></div>)}<Link className="slides-brand" to="/"><img src="/logo.svg" alt="Future Creators Academy"/></Link><div className="slide-dots">{slides.map((item, index) => <button key={item.kicker} className={index === slide ? 'on' : ''} onClick={() => setSlide(index)} aria-label={`Show slide ${index + 1}`}/>)}</div></aside>
  <section className="login-panel"><Reveal><img className="login-logo" src="/logo.svg" alt=""/></Reveal><h1><BlurText text="Welcome back." startDelay={120}/></h1><Reveal delay={300}><p className="login-sub">Sign in to keep your IQ, streaks, and certificates in one place — on every device.</p></Reveal><Reveal delay={420}><Magnetic strength={0.15}><button className="google-btn" onClick={login}><GoogleG/> Continue with Google</button></Magnetic></Reveal><Reveal delay={520}><div className="login-divider"><span>or</span></div><Link className="button ghost full" to="/academy">Continue as guest</Link></Reveal>{error && <p className="login-error">{error}</p>}<Reveal delay={640}><p className="login-terms">By continuing, you agree to the FCA Terms and acknowledge the Privacy Policy.</p></Reveal></section>
 </main>
}
