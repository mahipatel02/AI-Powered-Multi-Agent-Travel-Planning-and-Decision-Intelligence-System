import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Camera, Users, Brain, MapPin, Zap, Shield, Star } from 'lucide-react'

const destinationsIndia = [
    { name: 'Manali', tag: 'Mountains · Adventure', icon: '🏔️', color: '#4E8EA2' },
    { name: 'Goa', tag: 'Beach · Nightlife', icon: '🏖️', color: '#49769F' },
    { name: 'Kerala', tag: 'Nature · Backwaters', icon: '🌿', color: '#8EB5A9' },
    { name: 'Jaipur', tag: 'Heritage · Culture', icon: '🕌', color: '#A78D78' },
    { name: 'Ladakh', tag: 'Wilderness · Sky', icon: '⛺', color: '#7BBDE8' },
    { name: 'Coorg', tag: 'Coffee · Mist', icon: '☕', color: '#6E473B' },
    { name: 'Varanasi', tag: 'Spiritual · Ghats', icon: '🪔', color: '#DF86B2' },
    { name: 'Rishikesh', tag: 'Yoga · Adventure', icon: '🧘‍♀️', color: '#4E8EA2' },
    { name: 'Udaipur', tag: 'Lakes · Palaces', icon: '🏰', color: '#8EB5A9' },
    { name: 'Andaman', tag: 'Islands · Scuba', icon: '🐠', color: '#7BBDE8' },
]

const destinationsGlobal = [
    { name: 'Tokyo', tag: 'City · Neon', icon: '🏮', color: '#D84B6B' },
    { name: 'Santorini', tag: 'Views · Sea', icon: '🏛️', color: '#4E8EA2' },
    { name: 'Swiss Alps', tag: 'Snow · Adventure', icon: '🏔️', color: '#7BBDE8' },
    { name: 'Bali', tag: 'Beach · Spiritual', icon: '🌴', color: '#8EB5A9' },
    { name: 'New York', tag: 'Energy · Culture', icon: '🗽', color: '#A78D78' },
    { name: 'Paris', tag: 'Romance · Art', icon: '🥐', color: '#C5A880' },
    { name: 'Kyoto', tag: 'Temples · Zen', icon: '🍁', color: '#EF9F27' },
    { name: 'Rome', tag: 'History · Pasta', icon: '🍝', color: '#DC586D' },
    { name: 'London', tag: 'Royalty · Fog', icon: '🎡', color: '#49769F' },
    { name: 'Dubai', tag: 'Desert · Luxury', icon: '✨', color: '#A78D78' },
]

const features = [
    { icon: <Brain size={20} />, title: 'AI trip planner', desc: 'Chat naturally. Get a full itinerary with day-by-day plans, food stops and hidden gems.', color: '#4E8EA2' },
    { icon: <Users size={20} />, title: 'PackVote war room', desc: 'Group travel chaos ends here. Everyone votes, AI mediates, one destination wins.', color: '#7C2D8E', highlight: true },
    { icon: <Camera size={20} />, title: 'Photo → place', desc: 'Upload any travel photo from Pinterest or Instagram. AI finds the exact location.', color: '#DC586D' },
    { icon: <Zap size={20} />, title: 'Disruption recovery', desc: 'Flight cancelled? AI instantly rebooks, updates hotel, reschedules pickup.', color: '#EF9F27' },
    { icon: <Shield size={20} />, title: 'Regret score', desc: 'Post-trip AI learns from your experience to give better recommendations next time.', color: '#8EB5A9' },
    { icon: <Star size={20} />, title: 'Smart reminders', desc: 'Get notified exactly when to leave for each attraction. Never miss a moment.', color: '#DF86B2' },
]

const travelIcons = [
    { icon: '🎒', label: 'backpack', x: '8%', y: '20%', delay: 0 },
    { icon: '🕶️', label: 'sunglasses', x: '88%', y: '15%', delay: 0.5 },
    { icon: '🏔️', label: 'mountain', x: '5%', y: '65%', delay: 1 },
    { icon: '🌊', label: 'wave', x: '92%', y: '60%', delay: 0.3 },
    { icon: '✈️', label: 'plane', x: '50%', y: '8%', delay: 0.7 },
    { icon: '🌴', label: 'palm', x: '20%', y: '80%', delay: 1.2 },
    { icon: '📸', label: 'camera', x: '78%', y: '78%', delay: 0.9 },
    { icon: '🗺️', label: 'map', x: '40%', y: '88%', delay: 0.4 },
]

export default function Landing() {
    const canvasRef = useRef(null)
    const [region, setRegion] = useState('India')
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/destination/${searchQuery.trim().toLowerCase().replace(/\s+/g, '-')}`)
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            speed: Math.random() * 0.3 + 0.1,
            opacity: Math.random(),
            dir: Math.random() > 0.5 ? 1 : -1,
        }))

        let raf
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            stars.forEach(s => {
                s.opacity += s.speed * 0.02 * s.dir
                if (s.opacity >= 1 || s.opacity <= 0) s.dir *= -1
                ctx.beginPath()
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(189, 216, 233, ${s.opacity})`
                ctx.fill()
            })
            raf = requestAnimationFrame(animate)
        }
        animate()
        return () => cancelAnimationFrame(raf)
    }, [])

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #001D39 0%, #0A4174 40%, #001D39 100%)' }}>

            {/* Hero */}
            <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                <div className="film-grain"></div>

                {/* Floating travel icons */}
                {travelIcons.map((t, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.6, scale: 1, y: [0, -12, 0] }}
                        transition={{ delay: t.delay, duration: 3, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
                        style={{ position: 'absolute', left: t.x, top: t.y, fontSize: '28px', pointerEvents: 'none', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
                    >{t.icon}</motion.div>
                ))}

                {/* Glow orbs */}
                <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,142,162,0.15) 0%, transparent 70%)', top: '10%', left: '10%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,45,142,0.1) 0%, transparent 70%)', bottom: '10%', right: '10%', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '80px 24px 40px', maxWidth: '800px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="section-tag"><Sparkles size={12} /> AI-powered travel intelligence</div>
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                        style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 600, lineHeight: 1.05, marginBottom: '24px', color: '#FBE4D8' }}>
                        Plan trips.<br />
                        <span style={{ background: 'linear-gradient(135deg, #7BBDE8, #4E8EA2, #BDD8E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>No stress.</span><br />
                        Zero chaos.
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
                        style={{ fontSize: '16px', color: '#7BBDE8', lineHeight: 1.8, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px', fontWeight: 300 }}>
                        The world's first AI travel platform that ends group travel chaos, finds destinations from photos, and handles everything when plans go wrong.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
                        style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/chat"><button className="btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>Start planning free →</button></Link>
                        <Link to="/packvote"><button className="btn-ghost" style={{ fontSize: '15px', padding: '14px 32px' }}>⚔️ PackVote war room</button></Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                        style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '56px', flexWrap: 'wrap' }}>
                        {[['5', 'AI agents'], ['Real-time', 'Group planning'], ['0', 'Trip stress']].map(([num, label], i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 600, color: '#BDD8E9' }}>{num}</div>
                                <div style={{ fontSize: '12px', color: '#49769F', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Destinations */}
            <section style={{ padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="section-tag"><MapPin size={12} /> Popular destinations</div>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', color: '#FBE4D8', fontWeight: 600, marginBottom: '24px' }}>Where will you go next?</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'inline-flex', background: 'rgba(10, 65, 116, 0.25)', borderRadius: '50px', padding: '4px', border: '1px solid rgba(123, 189, 232, 0.15)', backdropFilter: 'blur(8px)' }}>
                            <button onClick={() => setRegion('India')} style={{ background: region === 'India' ? 'linear-gradient(135deg, #4E8EA2, #0A4174)' : 'transparent', color: region === 'India' ? '#FBE4D8' : '#7BBDE8', border: 'none', padding: '10px 32px', borderRadius: '50px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.3s' }}>Explore India</button>
                            <button onClick={() => setRegion('Global')} style={{ background: region === 'Global' ? 'linear-gradient(135deg, #4E8EA2, #0A4174)' : 'transparent', color: region === 'Global' ? '#FBE4D8' : '#7BBDE8', border: 'none', padding: '10px 32px', borderRadius: '50px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.3s' }}>Explore Global</button>
                        </div>
                        
                        {/* Custom Search Form */}
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '440px' }}>
                            <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                placeholder="Or search for any destination..." 
                                style={{ flex: 1, padding: '14px 24px', borderRadius: '50px', border: '1px solid rgba(123, 189, 232, 0.3)', background: 'rgba(10, 65, 116, 0.4)', color: '#FBE4D8', outline: 'none', fontSize: '14px' }} 
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '14px 28px', borderRadius: '50px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                Search
                            </button>
                        </form>
                    </div>
                </motion.div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    {(region === 'India' ? destinationsIndia : destinationsGlobal).map((d, i) => (
                        <Link to={`/destination/${d.name.toLowerCase().replace(' ', '-')}`} key={`${region}-${i}`} style={{ textDecoration: 'none' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass deep-hover"
                                style={{ padding: '20px', cursor: 'pointer' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{d.icon}</div>
                                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#FBE4D8', fontWeight: 600, marginBottom: '4px' }}>{d.name}</div>
                                <div style={{ fontSize: '12px', color: '#7BBDE8' }}>{d.tag}</div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 32px', background: 'linear-gradient(180deg, rgba(41,28,14,0.4) 0%, rgba(10,65,116,0.1) 100%)', borderTop: '1px solid rgba(167, 141, 120, 0.1)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <div className="section-tag" style={{ color: '#FBE4D8', borderColor: 'rgba(251, 228, 216, 0.3)', background: 'rgba(251, 228, 216, 0.1)' }}><Zap size={12} /> What makes us different</div>
                        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', color: '#FBE4D8', fontWeight: 600, marginBottom: '12px' }}>Not your average travel app</h2>
                        <p style={{ color: '#E1D4C2', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>We solve problems no booking app has solved before.</p>
                    </motion.div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {features.map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="deep-hover"
                                style={{
                                    padding: '28px',
                                    borderRadius: '16px',
                                    border: f.highlight ? `1px solid rgba(124, 45, 142, 0.5)` : '1px solid rgba(167,141,120,0.15)',
                                    background: f.highlight ? 'rgba(43, 18, 76, 0.4)' : 'rgba(41, 28, 14, 0.25)',
                                    backdropFilter: 'blur(8px)',
                                    cursor: 'default',
                                }}>
                                <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: '16px' }}>{f.icon}</div>
                                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#FBE4D8', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
                                <p style={{ color: '#7BBDE8', fontSize: '14px', lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
                                {f.highlight && <div style={{ marginTop: '16px', display: 'inline-block', background: 'rgba(124,45,142,0.3)', color: '#DF86B2', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', padding: '4px 12px', borderRadius: '50px' }}>OUR HIGHLIGHT FEATURE</div>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ padding: '80px 32px', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    style={{ maxWidth: '700px', margin: '0 auto', padding: '56px 40px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(10,65,116,0.4), rgba(43,18,76,0.4))', border: '1px solid rgba(123,189,232,0.15)', backdropFilter: 'blur(12px)' }}>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', color: '#FBE4D8', fontWeight: 600, marginBottom: '16px' }}>Plan once. Travel stress-free.</h2>
                    <p style={{ color: '#7BBDE8', fontSize: '15px', marginBottom: '32px', fontWeight: 300 }}>We handle the rest — from planning to disruption recovery.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/chat"><button className="btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>Start with AI chat →</button></Link>
                        <Link to="/packvote"><button className="btn-coral" style={{ fontSize: '15px', padding: '14px 32px' }}>⚔️ Create war room</button></Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(123,189,232,0.08)', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#FBE4D8', marginBottom: '8px' }}>TripMind ✦</div>
                <div style={{ color: '#49769F', fontSize: '12px' }}>Final year project · AI-powered travel intelligence · Built with ♥</div>
            </footer>
        </div>
    )
}
