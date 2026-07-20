// Pixel anchors measured directly off the 3508x2480 template (public/certificate-template.jpg):
// underline runs and label baselines were located by scanning for the brightest horizontal
// run of pixels in each expected band, not eyeballed — see the coordinates below.
export const CERT_NATIVE_WIDTH = 3508
export const CERT_NATIVE_HEIGHT = 2480
export const CERT_FIELDS = {
  name: { x: 2531, y: 930 },
  course: { x: 1761, y: 1362, maxWidth: 1280 },
  certId: { x: 590, y: 2097 },
  issueDate: { x: 590, y: 2167 },
}

// Same proportions as the .cert-field* cqw font-sizes in index.css (percent of the
// certificate's own width) — kept in one place so the canvas export and the on-screen
// CSS preview can never drift apart again.
const NAME_FONT_PCT = 0.0255
const COURSE_FONT_PCT = 0.022
const LABEL_FONT_PCT = 0.0155
const FONT_TEXT_STACK = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif'
const FONT_MONO_STACK = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace'

export const formatCertDate = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const pct = (value: number, total: number) => `${(value / total) * 100}%`

export function CertificateCard({ name, courseTitle, certId, issuedAtMs }: { name: string; courseTitle: string; certId: string; issuedAtMs: number | null }) {
 return <div className="cert-template">
  <img className="cert-bg" src="/certificate-template.jpg" alt="Future Creators Academy certificate"/>
  <span className="cert-field cert-field-name" style={{ left: pct(CERT_FIELDS.name.x, CERT_NATIVE_WIDTH), top: pct(CERT_FIELDS.name.y, CERT_NATIVE_HEIGHT) }}>{name}</span>
  <span className="cert-field cert-field-course" style={{ left: pct(CERT_FIELDS.course.x, CERT_NATIVE_WIDTH), top: pct(CERT_FIELDS.course.y, CERT_NATIVE_HEIGHT) }}>{courseTitle}</span>
  <span className="cert-field cert-field-id" style={{ left: pct(CERT_FIELDS.certId.x, CERT_NATIVE_WIDTH), top: pct(CERT_FIELDS.certId.y, CERT_NATIVE_HEIGHT) }}>{certId}</span>
  <span className="cert-field cert-field-date" style={{ left: pct(CERT_FIELDS.issueDate.x, CERT_NATIVE_WIDTH), top: pct(CERT_FIELDS.issueDate.y, CERT_NATIVE_HEIGHT) }}>{issuedAtMs ? formatCertDate(issuedAtMs) : '—'}</span>
 </div>
}

/** Draws the same certificate at full native resolution onto a canvas and triggers a PNG
 * download — a real exported image rather than a browser print snapshot. */
export async function downloadCertificatePng(name: string, courseTitle: string, certId: string, issuedAtMs: number | null, fileName: string) {
 const image = new Image()
 image.crossOrigin = 'anonymous'
 image.src = '/certificate-template.jpg'
 await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject })

 // Custom fonts must be fully loaded before ctx.font metrics/rendering are accurate —
 // without this, the very first draw on a cold page load can silently fall back to a
 // system default and measure/wrap text against the wrong metrics.
 await document.fonts.ready

 const canvas = document.createElement('canvas')
 canvas.width = CERT_NATIVE_WIDTH
 canvas.height = CERT_NATIVE_HEIGHT
 const ctx = canvas.getContext('2d')
 if (!ctx) return
 ctx.drawImage(image, 0, 0, CERT_NATIVE_WIDTH, CERT_NATIVE_HEIGHT)
 ctx.fillStyle = '#F5F5F7'
 ctx.textAlign = 'center'
 // 'bottom' baseline mirrors the CSS anchor (transform: translate(-50%,-100%)), which
 // pins each field's box-bottom to its measured line-y — no manual offset needed.
 ctx.textBaseline = 'bottom'

 const nameFontPx = CERT_NATIVE_WIDTH * NAME_FONT_PCT
 ctx.font = `600 ${nameFontPx}px ${FONT_TEXT_STACK}`
 ctx.fillText(name, CERT_FIELDS.name.x, CERT_FIELDS.name.y)

 const courseFontPx = CERT_NATIVE_WIDTH * COURSE_FONT_PCT
 ctx.font = `600 ${courseFontPx}px ${FONT_TEXT_STACK}`
 wrapCenteredText(ctx, courseTitle, CERT_FIELDS.course.x, CERT_FIELDS.course.y, CERT_FIELDS.course.maxWidth, courseFontPx * 1.3)

 const labelFontPx = CERT_NATIVE_WIDTH * LABEL_FONT_PCT
 ctx.textAlign = 'left'
 ctx.textBaseline = 'middle' // mirrors the CSS transform: translateY(-50%) center-on-line anchor
 ctx.font = `400 ${labelFontPx}px ${FONT_MONO_STACK}`
 ctx.fillStyle = 'rgba(245,245,247,.9)'
 ctx.fillText(certId, CERT_FIELDS.certId.x, CERT_FIELDS.certId.y)
 ctx.fillText(issuedAtMs ? formatCertDate(issuedAtMs) : '—', CERT_FIELDS.issueDate.x, CERT_FIELDS.issueDate.y)

 // JPEG, not PNG — the template's noisy gradient background makes a lossless PNG export
 // balloon to 15MB+ at full resolution, which is unusable for sharing or emailing.
 const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
 if (!blob) return
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = fileName
 link.click()
 URL.revokeObjectURL(url)
}

function wrapCenteredText(ctx: CanvasRenderingContext2D, text: string, cx: number, bottomY: number, maxWidth: number, lineHeight: number) {
 const words = text.split(' ')
 const lines: string[] = []
 let line = ''
 for (const word of words) {
  const test = line ? `${line} ${word}` : word
  if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word } else line = test
 }
 if (line) lines.push(line)
 const startY = bottomY - (lines.length - 1) * lineHeight
 lines.forEach((text, index) => ctx.fillText(text, cx, startY + index * lineHeight))
}
