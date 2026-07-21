import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBanners, type Banner, type BannerPlacement } from '../../store/banners-store'

function BannerSlide({ banner }: { banner: Banner }) {
 const inner = <><img src={banner.imageUrl} alt=""/>{banner.title && <span className="banner-title">{banner.title}</span>}</>
 if (!banner.linkUrl) return <div className="banner-slide">{inner}</div>
 if (banner.linkUrl.startsWith('/')) return <Link to={banner.linkUrl} className="banner-slide">{inner}</Link>
 return <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="banner-slide">{inner}</a>
}

export function BannerCarousel({ placement }: { placement: BannerPlacement }) {
 const banners = useBanners(placement)
 const [index, setIndex] = useState(0)

 useEffect(() => {
  setIndex(0)
  if (banners.length < 2) return
  const timer = window.setInterval(() => setIndex((current) => (current + 1) % banners.length), 5500)
  return () => window.clearInterval(timer)
 }, [banners.length, placement])

 if (!banners.length) return null
 const active = banners[index % banners.length]

 return <div className="banner-carousel">
  <BannerSlide banner={active} key={active.id}/>
  {banners.length > 1 && <div className="banner-dots">{banners.map((banner, dotIndex) => <button key={banner.id} className={dotIndex === index ? 'on' : ''} onClick={() => setIndex(dotIndex)} aria-label={`Show banner ${dotIndex + 1}`}/>)}</div>}
 </div>
}
