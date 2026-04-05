import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Send, Sparkles, Save } from 'lucide-react'

const API = 'http://localhost:8000'

const ImageGallery = ({ destination }) => {
    const [images, setImages] = useState([])
    
    useEffect(() => {
        if (!destination) return;
        const fetchImages = async () => {
             const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
             if (!key) return;
             try {
                 const res = await fetch(`https://api.unsplash.com/search/photos?query=${destination}+landscape+travel&orientation=landscape&per_page=3&client_id=${key}`)
                 const data = await res.json()
                 if (data?.results?.length > 0) {
                     setImages(data.results.map(r => r.urls.regular))
                 }
             } catch(err) { console.error('Unsplash error', err) }
        }
        fetchImages()
    }, [destination])

    if (images.length === 0) return null;

    return (
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(123,189,232,0.15)' }}>
            <div style={{ color: '#BDD8E9', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                📸 Glimpses of {destination}
            </div>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                {images.map((img, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                        style={{ width: '240px', height: '160px', borderRadius: '12px', flexShrink: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }} />
                ))}
            </div>
        </div>
    )
}

export default function Chat() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Namaste! 🌏 I\'m your AI travel planner.', type: 'greeting' },
        { role: 'bot', text: 'To get started, where would you like to travel?', type: 'ask_destination' }
    ])
    
    const [onboarding, setOnboarding] = useState({
        active: true,
        step: 'destination',
        destination: '',
        region: '',
        occasion: '',
        group: '',
        vibe: '',
        days: ''
    })

    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const sendMessage = async (text) => {
        const msg = text || input.trim()
        if (!msg || loading) return
        setInput('')
        
        setMessages(prev => [...prev, { role: 'user', text: msg }])

        if (onboarding.active) {
            if (onboarding.step === 'destination') {
                setOnboarding(prev => ({ ...prev, step: 'region', destination: msg }))
                setLoading(true)
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev.map(m => m.type === 'ask_destination' ? {...m, answered: true} : m), 
                        { role: 'bot', text: `Will this trip be within India or traveling abroad?`, type: 'ask_region' }
                    ])
                    setLoading(false)
                }, 600)
                return
            }
            if (onboarding.step === 'region') {
                setOnboarding(prev => ({ ...prev, step: 'occasion', region: msg }))
                setLoading(true)
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev.map(m => m.type === 'ask_region' ? {...m, answered: true} : m), 
                        { role: 'bot', text: `Got it. What's the occasion for this trip?`, type: 'ask_occasion' }
                    ])
                    setLoading(false)
                }, 600)
                return
            }
            if (onboarding.step === 'occasion') {
                setOnboarding(prev => ({ ...prev, step: 'group', occasion: msg }))
                setLoading(true)
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev.map(m => m.type === 'ask_occasion' ? {...m, answered: true} : m), 
                        { role: 'bot', text: `Awesome! Who's coming along?`, type: 'ask_group' }
                    ])
                    setLoading(false)
                }, 600)
                return
            }
            if (onboarding.step === 'group') {
                setOnboarding(prev => ({ ...prev, step: 'vibe', group: msg }))
                setLoading(true)
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev.map(m => m.type === 'ask_group' ? {...m, answered: true} : m), 
                        { role: 'bot', text: `Sounds fun. What's the main vibe you're going for?`, type: 'ask_vibe' }
                    ])
                    setLoading(false)
                }, 600)
                return
            }
            if (onboarding.step === 'vibe') {
                setOnboarding(prev => ({ ...prev, step: 'days', vibe: msg }))
                setLoading(true)
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev.map(m => m.type === 'ask_vibe' ? {...m, answered: true} : m), 
                        { role: 'bot', text: `Perfect! Finally, how many days will your trip be?`, type: 'ask_days' }
                    ])
                    setLoading(false)
                }, 600)
                return
            }
            if (onboarding.step === 'days') {
                setOnboarding(prev => ({ ...prev, step: 'finished', days: msg, active: false }))
                triggerAIGeneration(onboarding.destination, onboarding.region, onboarding.occasion, onboarding.group, onboarding.vibe, msg)
                return
            }
        }
        
        triggerAIGeneration(null, null, null, null, null, msg, true)
    }

    const triggerAIGeneration = async (dest, reg, occ, grp, vb, dys, isRegularMsg = false) => {
        setLoading(true)
        try {
            let finalPrompt = dys
            if (!isRegularMsg) {
                 finalPrompt = `Destination: ${dest}. Region constraint: ${reg}. Occasion: ${occ}. Group: ${grp}. Vibe: ${vb}. Duration: ${dys}.`
            }
            
            const res = await axios.post(`${API}/chat`, new URLSearchParams({
                user_input: finalPrompt
            }))
            
            let finalDest = dest;
            try {
                const parsed = JSON.parse(res.data.response.replace(/```json/g, '').replace(/```/g, '').trim());
                if (parsed.destination) finalDest = parsed.destination;
            } catch (e) {}

            setMessages(prev => [
                ...prev.map(m => ({...m, answered: true})), 
                { role: 'bot', text: res.data.response, type: 'itinerary', aiDestination: finalDest }
            ])
        } catch (e) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I had trouble connecting to the AI. Please make sure the backend is active.' }])
        }
        setLoading(false)
    }

    const formatItinerary = (text, aiDestination) => {
        if (typeof text !== 'string') return null;
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanText);
            
            const itineraryData = Array.isArray(data) ? data : (data.itinerary || []);
            const eventsData = data.events || [];
            // Use the JSON's destination if available, otherwise fallback to the prop
            const displayDest = data.destination || aiDestination;

            if (itineraryData.length > 0) {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                        {eventsData.length > 0 && (
                            <div style={{ background: 'rgba(223, 134, 178, 0.1)', borderRadius: '12px', padding: '16px', borderLeft: '3px solid #DF86B2' }}>
                                <div style={{ color: '#DF86B2', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    🎟️ Upcoming Events & Experiences
                                </div>
                                <ul style={{ color: '#FBE4D8', fontSize: '13px', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
                                    {eventsData.map((e, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{e}</li>)}
                                </ul>
                            </div>
                        )}
                        {itineraryData.map((day, i) => (
                            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', borderLeft: '3px solid #4E8EA2' }}>
                                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#FBE4D8', fontWeight: 600, marginBottom: '12px' }}>
                                    Day {day.day}: {day.title || 'Overview'}
                                </div>
                                {day.plan && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {day.plan.morning && <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><div style={{ color: '#BDD8E9', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px', width: '70px', flexShrink: 0 }}>Morning</div> <div style={{ color: '#7BBDE8', fontSize: '13px', lineHeight: 1.5 }}>{day.plan.morning}</div></div>}
                                        {day.plan.afternoon && <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><div style={{ color: '#EF9F27', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px', width: '70px', flexShrink: 0 }}>Afternoon</div> <div style={{ color: '#7BBDE8', fontSize: '13px', lineHeight: 1.5 }}>{day.plan.afternoon}</div></div>}
                                        {day.plan.evening && <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><div style={{ color: '#DC586D', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px', width: '70px', flexShrink: 0 }}>Evening</div> <div style={{ color: '#7BBDE8', fontSize: '13px', lineHeight: 1.5 }}>{day.plan.evening}</div></div>}
                                    </div>
                                )}
                            </div>
                        ))}
                        {displayDest && <ImageGallery destination={displayDest} />}
                    </div>
                );
            }
        } catch (e) {}
        
        return text.split('\n').map((line, i) => {
            if (line.startsWith('Day ')) return <div key={i} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#FBE4D8', fontWeight: 600, marginTop: '16px', marginBottom: '4px' }}>{line}</div>
            if (line.startsWith('- ')) return <div key={i} style={{ color: '#BDD8E9', fontSize: '14px', paddingLeft: '16px', lineHeight: 1.7, borderLeft: '2px solid rgba(78,142,162,0.3)', marginLeft: '8px', marginBottom: '4px' }}>{line.slice(2)}</div>
            return <div key={i} style={{ color: '#7BBDE8', fontSize: '13px', marginBottom: '4px' }}>{line}</div>
        })
    }

    const InteractiveCards = ({ type, answered }) => {
        if (answered || loading) return null;

        if (type === 'ask_destination') {
            return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '16px' }}>
                    <button onClick={() => sendMessage('Surprise Me')} className="deep-hover"
                        style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #7C2D8E, #DC586D)', border: 'none', borderRadius: '50px', color: '#FBE4D8', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: '0 4px 16px rgba(124,45,142,0.3)' }}>
                        <Sparkles size={16} /> Surprise Me (AI Magic)
                    </button>
                    <div style={{ color: '#7BBDE8', fontSize: '13px', marginTop: '12px', fontStyle: 'italic', paddingLeft: '4px' }}>Or simply type a specific location below...</div>
                </motion.div>
            )
        }

        if (type === 'ask_region') {
            return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px', marginTop: '16px' }}>
                    {[ 
                        { id: 'In India', icon: '🇮🇳' }, 
                        { id: 'Abroad', icon: '✈️' }
                    ].map(g => (
                        <button key={g.id} onClick={() => sendMessage(g.id)} className="deep-hover"
                            style={{ padding: '16px', background: 'rgba(10,65,116,0.5)', border: '1px solid rgba(123,189,232,0.15)', borderRadius: '12px', color: '#FBE4D8', fontSize: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '28px' }}>{g.icon}</span>
                            <span style={{ fontWeight: 500 }}>{g.id}</span>
                        </button>
                    ))}
                </motion.div>
            )
        }

        if (type === 'ask_occasion') {
            return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px', marginTop: '16px' }}>
                    {[ 
                        { id: 'Romantic Getaway', icon: '🍷' }, 
                        { id: 'Birthday Bash', icon: '🎂' }, 
                        { id: 'Peace & Quiet', icon: '🧘‍♀️' }, 
                        { id: 'Just Escaping', icon: '✈️' } 
                    ].map(g => (
                        <button key={g.id} onClick={() => sendMessage(g.id)} className="deep-hover"
                            style={{ padding: '16px', background: 'rgba(10,65,116,0.5)', border: '1px solid rgba(123,189,232,0.15)', borderRadius: '12px', color: '#FBE4D8', fontSize: '13px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '24px' }}>{g.icon}</span>
                            <span style={{ fontWeight: 500, textAlign: 'center' }}>{g.id}</span>
                        </button>
                    ))}
                </motion.div>
            )
        }

        if (type === 'ask_group') {
            return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px', marginTop: '16px' }}>
                    {[ 
                        { id: 'Solo trip', icon: '🧍‍♂️' }, 
                        { id: 'Couples trip', icon: '👩‍❤️‍👨' }, 
                        { id: 'Family vacay', icon: '👨‍👩‍👧‍👦' }, 
                        { id: 'Friends trip', icon: '🍻' } 
                    ].map(g => (
                        <button key={g.id} onClick={() => sendMessage(g.id)} className="deep-hover"
                            style={{ padding: '16px', background: 'rgba(10,65,116,0.5)', border: '1px solid rgba(123,189,232,0.15)', borderRadius: '12px', color: '#FBE4D8', fontSize: '13px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '24px' }}>{g.icon}</span>
                            <span style={{ fontWeight: 500 }}>{g.id}</span>
                        </button>
                    ))}
                </motion.div>
            )
        }

        if (type === 'ask_vibe') {
            return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px', marginTop: '16px' }}>
                    {[ 
                        { id: 'Beach & Sun', icon: '🏖️' }, 
                        { id: 'City & Culture', icon: '🌇' }, 
                        { id: 'Nature & Hiking', icon: '🌿' }, 
                        { id: 'Nightlife & Fun', icon: '🎉' },
                        { id: 'Historical', icon: '🏛️' },
                        { id: 'Luxury Resort', icon: '💎' }
                    ].map(g => (
                        <button key={g.id} onClick={() => sendMessage(g.id)} className="deep-hover"
                            style={{ padding: '12px', background: 'rgba(10,65,116,0.5)', border: '1px solid rgba(123,189,232,0.15)', borderRadius: '12px', color: '#FBE4D8', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '20px' }}>{g.icon}</span>
                            <span style={{ fontWeight: 500 }}>{g.id}</span>
                        </button>
                    ))}
                </motion.div>
            )
        }

        if (type === 'ask_days') {
            return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                    {['Weekend', '3-4 Days', '1 Week', '10 Days'].map(d => (
                        <button key={d} onClick={() => sendMessage(d)} className="deep-hover"
                            style={{ padding: '10px 16px', background: 'rgba(10,65,116,0.5)', border: '1px solid rgba(123,189,232,0.15)', borderRadius: '50px', color: '#FBE4D8', fontSize: '13px', cursor: 'pointer' }}>
                            {d}
                        </button>
                    ))}
                </motion.div>
            )
        }
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #291C0E 0%, #0A4174 60%, #001D39 100%)', paddingTop: '64px', display: 'flex' }}>
            {/* Sidebar */}
            <div style={{ width: '260px', borderRight: '1px solid rgba(123,189,232,0.1)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0 }}>
                
                <div>
                    <div style={{ fontSize: '12px', color: '#49769F', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px' }}>Quick Starts</div>
                    {['Goa, India', 'Manali, India', 'Santorini, Greece', 'Tokyo, Japan'].map((s, i) => (
                        <button key={i} onClick={() => { setInput(s); document.querySelector('#chatInput').focus() }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'rgba(10,65,116,0.2)', border: '1px solid rgba(123,189,232,0.1)', color: '#7BBDE8', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s' }}
                        >{s}</button>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(123,189,232,0.1)', paddingTop: '24px' }}>
                    <div style={{ fontSize: '12px', color: '#49769F', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Save size={14} /> My Saved Trips</div>
                    
                    {/* Placeholder State */}
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(10,65,116,0.15)', borderRadius: '12px', border: '1px dashed rgba(123,189,232,0.2)' }}>
                        <div style={{ color: '#7BBDE8', fontSize: '13px', marginBottom: '8px' }}>No trips saved yet</div>
                        <div style={{ color: '#49769F', fontSize: '12px', lineHeight: 1.5 }}>When you generate an itinerary you love, save it here to access it later!</div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 64px)' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                {m.role === 'bot' && (
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4E8EA2, #0A4174)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0, marginTop: '4px' }}>
                                        <Sparkles size={14} color="#BDD8E9" />
                                    </div>
                                )}
                                <div style={{ maxWidth: '75%' }}>
                                    <div style={{
                                        padding: '16px 20px',
                                        borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: m.role === 'user' ? 'linear-gradient(135deg, #4E8EA2, #0A4174)' : 'rgba(10,65,116,0.3)',
                                        border: m.role === 'bot' ? '1px solid rgba(123,189,232,0.15)' : 'none',
                                        backdropFilter: 'blur(8px)',
                                    }}>
                                        {m.role === 'bot' ? <div style={{ lineHeight: 1.7, color: '#FBE4D8', fontSize: '14px' }}>{m.type === 'itinerary' ? formatItinerary(m.text, m.aiDestination) : m.text}</div>
                                            : <div style={{ color: '#FBE4D8', fontSize: '14px', lineHeight: 1.7 }}>{m.text}</div>}
                                    </div>
                                    
                                    {m.role === 'bot' && <InteractiveCards type={m.type} answered={m.answered} />}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4E8EA2, #0A4174)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={14} color="#BDD8E9" />
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[0, 1, 2].map(i => (
                                    <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#4E8EA2' }} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div style={{ borderTop: '1px solid rgba(123,189,232,0.1)', padding: '16px 32px', display: 'flex', gap: '12px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)' }}>
                    <textarea id="chatInput" value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                        placeholder={onboarding.active ? "Type here or select an option above..." : "Send a message to adjust your itinerary..."}
                        rows={1} style={{ flex: 1, resize: 'none', borderRadius: '12px', fontSize: '14px', paddingTop: '12px', paddingBottom: '12px', background: 'rgba(10,65,116,0.3)', color: '#FBE4D8', border: '1px solid rgba(123,189,232,0.2)', paddingLeft: '16px' }} />
                    <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                        style={{ width: 46, height: 46, borderRadius: '12px', background: input.trim() ? 'linear-gradient(135deg, #4E8EA2, #0A4174)' : 'rgba(10,65,116,0.2)', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        <Send size={18} color="#BDD8E9" />
                    </button>
                </div>
            </div>
        </div>
    )
}
