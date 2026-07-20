import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'

const WhatsAppIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1s-.7.8-.9 1c-.2.2-.3.2-.6.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.4c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z"/></svg>
export const LinkedInIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9z"/></svg>
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none"/></svg>

export function ShareRow({ url, text }: { url: string; text: string }) {
 const [copied, setCopied] = useState(false)
 const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
 const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
 const shareToInstagram = async () => {
  try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); window.open('https://instagram.com', '_blank', 'noopener'); window.setTimeout(() => setCopied(false), 2500) } catch { /* clipboard unavailable */ }
 }
 const copyLink = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2000) } catch { /* clipboard unavailable */ } }
 return <div className="share-row">
  <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="share-btn wa"><WhatsAppIcon/></a>
  <a href={li} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="share-btn li"><LinkedInIcon/></a>
  <button type="button" onClick={shareToInstagram} aria-label="Share on Instagram" className="share-btn ig">{copied ? <Check/> : <InstagramIcon/>}</button>
  <button type="button" onClick={copyLink} aria-label="Copy link" className="share-btn copy">{copied ? <Check/> : <Link2/>}</button>
 </div>
}
