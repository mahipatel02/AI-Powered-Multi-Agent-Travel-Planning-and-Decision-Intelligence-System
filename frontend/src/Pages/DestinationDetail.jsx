import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Clock, ArrowLeft, Image as ImageIcon, ShieldAlert, Navigation, X } from 'lucide-react'

export default function DestinationDetail() {
    const { name } = useParams()
    const [image, setImage] = useState(null)
    const [gallery, setGallery] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAdvisoryModal, setShowAdvisoryModal] = useState(false)

    const displayName = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

    useEffect(() => {
        const fetchImage = async () => {
            const fallbackHero = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=900&fit=crop";
            const fallbackGallery = [
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=300&fit=crop"
            ];
            
            try {
                if (!import.meta.env.VITE_UNSPLASH_ACCESS_KEY) throw new Error("No API key");
                const res = await fetch(`https://api.unsplash.com/search/photos?query=${displayName}+landscape&orientation=landscape&per_page=4&client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`)
                if (!res.ok) throw new Error("API Limit Reached");
                const data = await res.json()
                if (data && data.results && data.results.length > 0) {
                    setImage(data.results[0].urls.raw + "&w=1600&h=900&fit=crop")
                    setGallery(data.results.slice(1, 4).map(img => img.urls.raw + "&w=400&h=300&fit=crop"))
                } else {
                    throw new Error("No images found");
                }
            } catch (err) {
                setImage(fallbackHero)
                setGallery(fallbackGallery)
            } finally {
                setLoading(false)
            }
        }
        fetchImage()
    }, [displayName])

    return (
        <div style={{ minHeight: '100vh', background: 'var(--abyss)' }}>
            
            {/* Hero Section */}
            <div style={{ position: 'relative', height: '60vh', display: 'flex', alignItems: 'flex-end', padding: '40px' }}>
                {loading ? (
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><ImageIcon color="var(--steel)" size={32} /></motion.div>
                    </div>
                ) : (
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--abyss) 0%, transparent 100%)' }} />
                        <div className="film-grain"></div>
                    </div>
                )}

                <Link to="/" style={{ position: 'absolute', top: '100px', left: '40px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mist)', textDecoration: 'none', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '50px', backdropFilter: 'blur(8px)' }}>
                    <ArrowLeft size={16} /> Back to explore
                </Link>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                    <div className="section-tag" style={{ border: 'none', background: 'var(--teal)', color: 'var(--abyss)' }}><MapPin size={12} /> Global Destination</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 72px)', color: 'var(--cream)', lineHeight: 1, marginBottom: '16px' }}>{displayName}</h1>
                    <p style={{ color: 'var(--mist)', fontSize: '18px', fontWeight: 300 }}>Experience the magic of {displayName}. AI-analyzed insights below.</p>
                </motion.div>
            </div>

            {/* Content Container */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '40px' }}>
                
                {/* Left Col - Overview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--cream)', marginBottom: '24px' }}>AI Travel Brief</h2>
                    
                    <div className="glass" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
                            <div>
                                <div style={{ color: 'var(--sky)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}><Calendar size={14} style={{ display:'inline', verticalAlign:'text-bottom' }}/> Best Time</div>
                                <div style={{ color: 'var(--cream)', fontSize: '16px' }}>May - September</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--sky)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}><Clock size={14} style={{ display:'inline', verticalAlign:'text-bottom' }}/> Ideal Duration</div>
                                <div style={{ color: 'var(--cream)', fontSize: '16px' }}>5-7 Days</div>
                            </div>
                        </div>
                        <p style={{ color: 'var(--mist)', lineHeight: 1.8, fontWeight: 300 }}>
                            {displayName} is globally renowned for its atmosphere, historical landmarks, and world-class culinary scenes. 
                            Our AI identifies this as a high-demand destination with excellent infrastructure for both solo and group travel.
                        </p>
                    </div>

                    {gallery.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--cream)', marginBottom: '16px' }}>Top Sights Gallery</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                {gallery.map((imgUrl, i) => (
                                    <motion.div key={i} whileHover={{ scale: 1.05 }} style={{ height: '120px', borderRadius: '12px', overflow: 'hidden', backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--cream)', marginBottom: '16px', marginTop: '40px' }}>Plan your trip to {displayName}</h2>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link to="/chat" style={{ textDecoration: 'none' }}><button className="btn-primary">Generate AI Itinerary</button></Link>
                        <Link to="/packvote" style={{ textDecoration: 'none' }}><button className="btn-ghost">Propose in PackVote</button></Link>
                    </div>
                </motion.div>

                {/* Right Col - Advanced AI Preview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="glass-warm" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--coral)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--coral)', marginBottom: '12px', fontWeight: 600 }}>
                            <ShieldAlert size={18} /> Scam & Safety Guardian
                        </div>
                        <p style={{ color: 'var(--mist)', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                            <strong>AI Alert:</strong> Reports indicate a 15% increase in unauthorized taxi scams near the central station in {displayName}. 
                        </p>
                        <button onClick={() => setShowAdvisoryModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--coral)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>View all advisories</button>
                    </div>

                    <div className="glass" style={{ padding: '24px', borderLeft: '4px solid var(--sky)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sky)', marginBottom: '12px', fontWeight: 600 }}>
                            <Navigation size={18} /> Crowd Predictor
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--cream)', fontSize: '14px' }}>City Center</span>
                            <span style={{ color: 'var(--coral)', fontSize: '12px', background: 'rgba(220, 88, 109, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>Very Busy</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--cream)', fontSize: '14px' }}>Historical District</span>
                            <span style={{ color: 'var(--sage)', fontSize: '12px', background: 'rgba(142, 181, 169, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>Quiet</span>
                        </div>
                    </div>

                    {/* Events Block */}
                    <div className="glass" style={{ padding: '24px', borderLeft: '4px solid #DF86B2', marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DF86B2', marginBottom: '16px', fontWeight: 600 }}>
                            <Calendar size={18} /> Upcoming Events & Markets
                        </div>
                        {(() => {
                            const mockEvents = {
                                'Goa': [{ name: 'Sunburn Festival', date: 'Dec 27-29', type: 'Music Fest' }, { name: 'Arpora Night Market', date: 'Every Saturday', type: 'Flea Market' }],
                                'Jaipur': [{ name: 'Jaipur Literature Fest', date: 'Jan 23-27', type: 'Culture' }, { name: 'Kite Festival', date: 'Jan 14', type: 'Fair' }],
                                'Tokyo': [{ name: 'Cherry Blossom Viewing', date: 'Late March', type: 'Nature' }, { name: 'Summer Sonic', date: 'August', type: 'Concerts' }],
                                'London': [{ name: 'Notting Hill Carnival', date: 'August Bank Holiday', type: 'Festival' }, { name: 'Portobello Road Market', date: 'Saturdays', type: 'Flea Market' }],
                                'Paris': [{ name: 'Fête de la Musique', date: 'June 21', type: 'Music Fest' }, { name: 'Bastille Day', date: 'July 14', type: 'National Fair' }]
                            }
                            const events = mockEvents[displayName] || [
                                { name: `Annual ${displayName} Fair`, date: 'Next Weekend', type: 'Local Fair' },
                                { name: 'City Center Night Market', date: 'Every Friday', type: 'Flea Market' }
                            ]
                            return events.map((e, i) => (
                                <div key={i} style={{ marginBottom: i === events.length - 1 ? 0 : '16px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ color: 'var(--cream)', fontSize: '15px', fontWeight: 500 }}>{e.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                        <span style={{ color: 'var(--mist)', fontSize: '12px' }}>{e.date}</span>
                                        <span style={{ color: '#DF86B2', fontSize: '11px', background: 'rgba(223, 134, 178, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>{e.type}</span>
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>
                </motion.div>
                
            </div>

            {/* Advisory Modal */}
            <AnimatePresence>
                {showAdvisoryModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,29,57,0.85)', backdropFilter: 'blur(8px)', padding: '24px' }}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-warm" style={{ width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden' }}>
                            
                            <div style={{ padding: '24px', borderBottom: '1px solid rgba(220, 88, 109, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--coral)', fontWeight: 600, fontSize: '18px' }}>
                                    <ShieldAlert size={20} /> Safety Guardian Report
                                </div>
                                <button onClick={() => setShowAdvisoryModal(false)} style={{ background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                                {gallery[0] && (
                                    <div style={{ height: '140px', borderRadius: '12px', backgroundImage: `url(${gallery[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '20px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(220, 88, 109, 0.4)', borderRadius: '12px' }} />
                                    </div>
                                )}
                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ color: 'var(--cream)', fontSize: '15px', marginBottom: '4px' }}>1. Unmetered Taxi Scams</h4>
                                    <p style={{ color: 'var(--mist)', fontSize: '13px', lineHeight: 1.6 }}>Always ensure the meter is running or negotiate the fare before getting into a taxi. Consider using official ride-hailing apps available in {displayName}.</p>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ color: 'var(--cream)', fontSize: '15px', marginBottom: '4px' }}>2. Pickpocketing in Crowds</h4>
                                    <p style={{ color: 'var(--mist)', fontSize: '13px', lineHeight: 1.6 }}>High tourist traffic areas in the City Center have seen a minor spike in pickpocketing. Keep valuables secure and avoid carrying large amounts of cash.</p>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--cream)', fontSize: '15px', marginBottom: '4px' }}>3. Public Wi-Fi Sniffing</h4>
                                    <p style={{ color: 'var(--mist)', fontSize: '13px', lineHeight: 1.6 }}>Avoid processing bookings or banking transactions on public café networks without a trusted VPN.</p>
                                </div>
                            </div>

                            <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.2)', textAlign: 'right' }}>
                                <button className="btn-coral" onClick={() => setShowAdvisoryModal(false)} style={{ fontSize: '13px', padding: '10px 24px' }}>Acknowledge</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
