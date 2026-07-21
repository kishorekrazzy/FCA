import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Footer, MobileNav, TopNav } from './components/ui/Layout'
import { Home } from './pages/Home'
import { Catalog } from './pages/Catalog'
import { CourseDetail } from './pages/CourseDetail'
import { Lesson } from './pages/Lesson'
import { Dashboard } from './pages/Dashboard'
import { Events } from './pages/Events'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { Certificate, VerifyCertificate } from './pages/Certificate'
import { SignIn } from './pages/SignIn'
import { Community } from './pages/Community'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, watchAuth } from './lib/firebase'
import { useAuthStore } from './store/auth-store'
import { dateKey, useAcademyStore } from './store/academy-store'
import { initCatalogSync } from './store/catalog-store'
import { initReviewsSync } from './store/reviews-store'
import { ensurePublicId } from './store/connections-store'
import { initPathsSync } from './store/paths-store'
import { initChallengesSync } from './store/challenges-store'
import { initAchievementsSync } from './store/achievements-store'
import { initBannersSync } from './store/banners-store'
import { initSiteSettingsSync } from './store/site-settings-store'
import { AdminGate, AdminShell } from './components/admin/AdminShell'
import { AdminOverview } from './pages/admin/AdminOverview'
import { AdminCourses } from './pages/admin/AdminCourses'
import { AdminCourseEditor } from './pages/admin/AdminCourseEditor'
import { AdminLessonEditor } from './pages/admin/AdminLessonEditor'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminCertificates } from './pages/admin/AdminCertificates'
import { AdminCommunity } from './pages/admin/AdminCommunity'
import { AdminPaths } from './pages/admin/AdminPaths'
import { AdminChallenges } from './pages/admin/AdminChallenges'
import { AdminAchievements } from './pages/admin/AdminAchievements'
import { AdminBanners } from './pages/admin/AdminBanners'
import './index.css'

function useProgressSync() {
 const uid = useAuthStore(state => state.user?.uid)
 useEffect(() => {
  if (!uid) return
  let ready = false
  let timer: number | undefined
  let publicId: string | null = null
  const ref = doc(db, 'users', uid)
  const push = () => {
   const state = useAcademyStore.getState()
   const profile = useAuthStore.getState().user
   setDoc(ref, {
    completed: state.completed, enrolled: state.enrolled, xp: state.xp, streak: state.streak, streakFreezes: state.streakFreezes, lastActive: state.lastActive,
    reviews: state.reviews, activityLog: state.activityLog, claimedChallenges: state.claimedChallenges, dailyReward: state.dailyReward, leaderboardVisible: state.leaderboardVisible,
    displayName: profile?.displayName ?? null, email: profile?.email ?? null, photoURL: profile?.photoURL ?? null,
    ...(publicId ? { publicId } : {}),
   }, { merge: true }).catch(() => {})
  }
  getDoc(ref).then(async (snapshot) => {
   const remote = snapshot.data()
   if (remote) {
    const state = useAcademyStore.getState()
    const today = dateKey()
    const activityDays = new Set([...Object.keys(state.activityLog), ...Object.keys(remote.activityLog ?? {})])
    useAcademyStore.setState({
     completed: [...new Set([...state.completed, ...(remote.completed ?? [])])],
     enrolled: [...new Set([...state.enrolled, ...(remote.enrolled ?? [])])],
     xp: Math.max(state.xp, remote.xp ?? 0),
     streak: Math.max(state.streak, remote.streak ?? 0),
     streakFreezes: Math.max(state.streakFreezes, remote.streakFreezes ?? 0),
     lastActive: remote.lastActive ?? state.lastActive,
     reviews: { ...(remote.reviews ?? {}), ...state.reviews },
     activityLog: Object.fromEntries([...activityDays].map((day) => [day, Math.max(state.activityLog[day] ?? 0, remote.activityLog?.[day] ?? 0)])),
     claimedChallenges: [...new Set([...state.claimedChallenges, ...(remote.claimedChallenges ?? [])])],
     // If another device already claimed today's reward, adopt that so this device
     // doesn't grant it a second time; otherwise local's claim history stands.
     dailyReward: state.dailyReward.lastClaimedDate === today || remote.dailyReward?.lastClaimedDate !== today ? state.dailyReward : remote.dailyReward,
     leaderboardVisible: remote.leaderboardVisible ?? state.leaderboardVisible,
    })
   } else {
    setDoc(ref, { joinedAt: serverTimestamp() }, { merge: true }).catch(() => {})
   }
   publicId = await ensurePublicId(uid, remote?.publicId ?? null).catch(() => null)
   ready = true
   push()
  }).catch(() => { ready = true })
  const unsubscribe = useAcademyStore.subscribe(() => {
   if (!ready) return
   window.clearTimeout(timer)
   timer = window.setTimeout(push, 800)
  })
  return () => { unsubscribe(); window.clearTimeout(timer) }
 }, [uid])
}

function ScrollToTop() {
 const { pathname } = useLocation()
 useEffect(() => { window.scrollTo(0, 0) }, [pathname])
 return null
}

function NotFound() { return <main className="page not-found"><span className="kicker">404</span><h1>This page drifted<br/>out of orbit.</h1><Link className="button primary" to="/">Back to home</Link></main> }

function Admin({ children }: { children: React.ReactNode }) { return <AdminGate><AdminShell>{children}</AdminShell></AdminGate> }

function Shell() {
 const { pathname } = useLocation()
 const bare = pathname.startsWith('/auth') || pathname.startsWith('/admin')
 return <>
  <ScrollToTop/>
  {!bare && <TopNav/>}
  <Routes>
   <Route path="/" element={<Home/>}/>
   <Route path="/academy" element={<Catalog/>}/>
   <Route path="/academy/:courseSlug" element={<CourseDetail/>}/>
   <Route path="/academy/:courseSlug/certificate" element={<Certificate/>}/>
   <Route path="/academy/:courseSlug/:lessonSlug" element={<Lesson/>}/>
   <Route path="/dashboard" element={<Dashboard/>}/>
   <Route path="/community" element={<Community/>}/>
   <Route path="/profile/:uid" element={<Profile/>}/>
   <Route path="/messages" element={<Messages/>}/>
   <Route path="/events" element={<Events/>}/>
   <Route path="/leaderboard" element={<LeaderboardPage/>}/>
   <Route path="/certificates/:certId" element={<VerifyCertificate/>}/>
   <Route path="/auth/sign-in" element={<SignIn/>}/>
   <Route path="/admin" element={<Admin><AdminOverview/></Admin>}/>
   <Route path="/admin/courses" element={<Admin><AdminCourses/></Admin>}/>
   <Route path="/admin/courses/new" element={<Admin><AdminCourseEditor/></Admin>}/>
   <Route path="/admin/courses/:slug" element={<Admin><AdminCourseEditor/></Admin>}/>
   <Route path="/admin/courses/:slug/lessons/:lessonId" element={<Admin><AdminLessonEditor/></Admin>}/>
   <Route path="/admin/users" element={<Admin><AdminUsers/></Admin>}/>
   <Route path="/admin/certificates" element={<Admin><AdminCertificates/></Admin>}/>
   <Route path="/admin/community" element={<Admin><AdminCommunity/></Admin>}/>
   <Route path="/admin/paths" element={<Admin><AdminPaths/></Admin>}/>
   <Route path="/admin/challenges" element={<Admin><AdminChallenges/></Admin>}/>
   <Route path="/admin/achievements" element={<Admin><AdminAchievements/></Admin>}/>
   <Route path="/admin/banners" element={<Admin><AdminBanners/></Admin>}/>
   <Route path="*" element={<NotFound/>}/>
  </Routes>
  {!bare && <Footer/>}
  {!bare && <MobileNav/>}
 </>
}

function AuthAndSync() {
 useEffect(() => watchAuth(user => useAuthStore.getState().setUser(user)), [])
 useEffect(() => { initCatalogSync(); initReviewsSync(); initPathsSync(); initChallengesSync(); initAchievementsSync(); initBannersSync(); initSiteSettingsSync() }, [])
 useProgressSync()
 return null
}

function App() {
 return <BrowserRouter><AuthAndSync/><Shell/></BrowserRouter>
}
export default App
