import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Camera, MapPin, Heart, Plus, Map } from 'lucide-react'
import LazyImage from '../components/LazyImage'

const API = 'https://ai-powered-multi-agent-travel-planning.onrender.com'

const floatingIcons = [
    { icon: '🎞️', delay: 0, x: '8%', y: '15%' },
    { icon: '🥂', delay: 0.5, x: '88%', y: '25%' },
    { icon: '💌', delay: 1, x: '12%', y: '75%' },
    { icon: '✨', delay: 0.3, x: '85%', y: '80%' },
]

export default function Memories() {
    const [memories, setMemories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ destination: '', image_url: '', caption: '', user_name: '' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchMemories()
    }, [])

    const fetchMemories = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API}/memories`)
            setMemories(res.data)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const submitMemory = async () => {
        if (!form.destination || !form.image_url || !form.caption || !form.user_name) return
        setSubmitting(true)
        try {
            await axios.post(`${API}/memories`, new URLSearchParams(form))
            setShowModal(false)
            setForm({ destination: '', image_url: '', caption: '', user_name: '' })
            fetchMemories() // Refresh feed
        } catch (e) {
            alert('Failed to post memory')
        }
        setSubmitting(false)
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--abyss) 0%, var(--navy) 40%, var(--abyss) 100%)', paddingTop: '80px', paddingBottom: '40px', position: 'relative', overflow: 'hidden' }}>
            <div className="film-grain"></div>

            <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,213,195,0.1) 0%, transparent 70%)', top: '20%', left: '10%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,141,120,0.15) 0%, transparent 70%)', bottom: '10%', right: '5%', pointerEvents: 'none' }} />

            {floatingIcons.map((t, i) => (
                <motion.div key={`float-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1, y: [0, -15, 0] }}
                    transition={{ delay: t.delay, duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
                    className="floating-3d-icon"
                    style={{ left: t.x, top: t.y, fontSize: '36px' }}
                >{t.icon}</motion.div>
            ))}

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="section-tag glass-beige" style={{ color: 'var(--beige-warm)', border: 'none' }}>
                            <Camera size={12} /> Community Feed
                        </div>
                        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '56px', color: '#FBE4D8', fontWeight: 600, lineHeight: 1.1, marginTop: '12px' }}>Travel Memories</h1>
                        <p style={{ color: '#7BBDE8', fontSize: '15px', marginTop: '12px', maxWidth: '500px' }}>
                            Share your favorite moments, hidden gems, and real experiences with the Lumina community.
                        </p>
                    </motion.div>
                    
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        onClick={() => setShowModal(true)}
                        style={{ background: 'linear-gradient(135deg, #4E8EA2, #0A4174)', border: 'none', color: '#FBE4D8', padding: '14px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                    >
                        <Plus size={18} /> Share your trip
                    </motion.button>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} style={{ height: '350px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', animation: 'pulse 1.5s infinite linear', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 100%)' }} />
                        ))}
                    </div>
                ) : memories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(123,189,232,0.2)' }}>
                        <Map size={48} color="#4E8EA2" style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#FBE4D8', marginBottom: '8px' }}>No memories yet</h3>
                        <p style={{ color: '#49769F', fontSize: '14px' }}>Be the first to share your travel experience!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {memories.map((m, i) => (
                            <motion.div key={m.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="glass-green deep-hover"
                                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                                    <LazyImage src={m.image_url} alt={m.destination} />
                                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#FBE4D8', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <MapPin size={12} color="#EF9F27" /> {m.destination}
                                    </div>
                                </div>
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <p style={{ color: '#BDD8E9', fontSize: '14px', lineHeight: 1.6, flex: 1, fontStyle: 'italic', marginBottom: '16px' }}>"{m.caption}"</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(123,189,232,0.1)', paddingTop: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #EF9F27, #DC586D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#FFF' }}>
                                                {m.user_name?.charAt(0).toUpperCase() || 'A'}
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#7BBDE8' }}>{m.user_name || 'Anonymous'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC586D', fontSize: '12px' }}>
                                            <Heart size={14} fill={m.likes > 0 ? '#DC586D' : 'none'} /> {m.likes || 0}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 29, 57, 0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setShowModal(false)} />
                        
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="glass-beige deep-hover" style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '32px', zIndex: 1 }}>
                            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#FBE4D8', marginBottom: '8px' }}>Share your journey</h2>
                            <p style={{ color: '#7BBDE8', fontSize: '13px', marginBottom: '24px' }}>Drop an image URL and let others know how it went.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ color: '#BDD8E9', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Your Name</label>
                                    <input value={form.user_name} onChange={e => setForm({...form, user_name: e.target.value})} placeholder="e.g. Alex M." style={{ width: '100%', background: 'rgba(0,0,0,0.2)' }} />
                                </div>
                                <div>
                                    <label style={{ color: '#BDD8E9', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Destination / Place</label>
                                    <input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="e.g. Paro Taktsang, Bhutan" style={{ width: '100%', background: 'rgba(0,0,0,0.2)' }} />
                                </div>
                                <div>
                                    <label style={{ color: '#BDD8E9', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Image URL</label>
                                    <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://images.unsplash.com/..." style={{ width: '100%', background: 'rgba(0,0,0,0.2)' }} />
                                    {form.image_url && (
                                        <div style={{ height: '100px', width: '100%', marginTop: '8px', borderRadius: '8px', overflow: 'hidden' }}>
                                            <LazyImage src={form.image_url} alt="Preview" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ color: '#BDD8E9', fontSize: '12px', display: 'block', marginBottom: '6px' }}>What was it like?</label>
                                    <textarea value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} rows={3} placeholder="The hike was tough but the view was unreal..." style={{ width: '100%', background: 'rgba(0,0,0,0.2)', resize: 'none' }} />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                    <button className="btn-primary" onClick={submitMemory} disabled={submitting || !form.destination || !form.image_url || !form.caption || !form.user_name} style={{ flex: 2 }}>
                                        {submitting ? 'Posting...' : 'Post Memory'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
