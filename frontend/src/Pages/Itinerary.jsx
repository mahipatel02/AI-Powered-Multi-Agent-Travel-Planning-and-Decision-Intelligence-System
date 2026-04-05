// Itinerary.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { MapPin, Bell, Calendar, Save, ShieldAlert, Navigation } from 'lucide-react'

const API = 'http://localhost:8000'

export function Itinerary() {
    const [destination, setDestination] = useState('')
    const [days, setDays] = useState(3)
    const [itineraryText, setItineraryText] = useState('')
    const [savedId, setSavedId] = useState(null)
    const [place, setPlace] = useState('')
    const [remindAt, setRemindAt] = useState('')
    const [reminderMsg, setReminderMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [reminderSaved, setReminderSaved] = useState(false)

    const save = async () => {
        if (!destination || !itineraryText) return
        setLoading(true)
        try {
            const res = await axios.post(`${API}/itinerary/save`, new URLSearchParams({ destination, days, itinerary_text: itineraryText }))
            setSavedId(res.data.itinerary_id)
        } catch { alert('Error saving') }
        setLoading(false)
    }

    const addReminder = async () => {
        if (!savedId || !place || !remindAt) return
        setLoading(true)
        try {
            await axios.post(`${API}/reminders`, new URLSearchParams({ itinerary_id: savedId, place, remind_at: remindAt, message: reminderMsg }))
            setReminderSaved(true)
        } catch { alert('Error adding reminder') }
        setLoading(false)
    }

    const lines = itineraryText.split('\n').filter(Boolean)

    const scamAlerts = {
        'paris': 'Watch out for the "friendship bracelet" scam near Sacré-Cœur.',
        'bali': 'Avoid unofficial money changers in Kuta. Ensure they count money in front of you.',
        'tokyo': 'Roppongi nightlife promoters can be aggressive. Stick to known venues.',
        'new york': 'Ignore people handing out "free" CDs in Times Square.',
        'goa': 'Always negotiate taxi fares before getting in.',
        'manali': 'Verify adventure sports operators have valid safety certifications.'
    }
    const currentScam = destination ? scamAlerts[destination.toLowerCase()] || 'Stay alert for pickpockets in crowded tourist areas.' : null

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #291C0E 0%, #0A4174 60%, #001D39 100%)', paddingTop: '80px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                    <div className="section-tag"><Calendar size={12} /> Trip itinerary</div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: '#FBE4D8', fontWeight: 600 }}>Your itinerary</h1>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Save form */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-warm" style={{ padding: '28px', borderRadius: '20px' }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#FBE4D8', marginBottom: '20px' }}>Save itinerary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination" />
                            <input type="number" value={days} onChange={e => setDays(e.target.value)} placeholder="Number of days" min={1} max={30} />
                            <textarea value={itineraryText} onChange={e => setItineraryText(e.target.value)} rows={8} placeholder="Paste your AI-generated itinerary here..." />
                            <button className="btn-primary" onClick={save} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Save size={14} />{loading ? 'Saving...' : 'Save itinerary'}
                            </button>
                            {savedId && <div style={{ color: '#8EB5A9', fontSize: '13px', textAlign: 'center' }}>✅ Saved! ID: #{savedId}</div>}
                        </div>
                    </motion.div>

                    {/* Reminder + Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {savedId && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-warm" style={{ padding: '28px', borderRadius: '20px' }}>
                                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#FBE4D8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Bell size={18} color="#EF9F27" /> Add reminder
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <input value={place} onChange={e => setPlace(e.target.value)} placeholder="Place to visit (e.g. Taj Mahal)" />
                                    <input type="datetime-local" value={remindAt} onChange={e => setRemindAt(e.target.value)} />
                                    <input value={reminderMsg} onChange={e => setReminderMsg(e.target.value)} placeholder="Custom message (optional)" />
                                    <button className="btn-primary" onClick={addReminder} disabled={loading}>
                                        {loading ? 'Adding...' : '🔔 Set reminder'}
                                    </button>
                                    {reminderSaved && <div style={{ color: '#8EB5A9', fontSize: '13px', textAlign: 'center' }}>✅ Reminder set for {place}!</div>}
                                </div>
                            </motion.div>
                        )}

                        {/* Advanced AI: Scam Guardian */}
                        {itineraryText && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-warm" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid var(--coral)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--coral)', marginBottom: '8px', fontWeight: 600 }}>
                                    <ShieldAlert size={16} /> Scam & Safety Guardian
                                </div>
                                <p style={{ color: 'var(--mist)', fontSize: '13px', lineHeight: 1.6 }}>
                                    <strong>AI Alert:</strong> {currentScam}
                                </p>
                            </motion.div>
                        )}

                        {itineraryText && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '24px', borderRadius: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#FBE4D8', marginBottom: '16px' }}>Preview</h3>
                                {(() => {
                                    try {
                                        const cleanText = itineraryText.replace(/```json/g, '').replace(/```/g, '').trim();
                                        const data = JSON.parse(cleanText);
                                        if (Array.isArray(data)) {
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {data.map((day, i) => (
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
                                                </div>
                                            );
                                        }
                                    } catch (e) {
                                        // Fallback
                                    }
                                    return lines.map((line, i) => (
                                        <div key={i} style={{ color: line.startsWith('Day ') ? '#FBE4D8' : '#7BBDE8', fontSize: line.startsWith('Day ') ? '16px' : '13px', fontFamily: line.startsWith('Day ') ? 'Cormorant Garamond, serif' : 'DM Sans, sans-serif', fontWeight: line.startsWith('Day ') ? 600 : 300, paddingLeft: line.startsWith('Day ') ? 0 : '16px', marginTop: line.startsWith('Day ') ? '16px' : '4px', lineHeight: 1.7, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                            <span>{line}</span>
                                        </div>
                                    ));
                                })()}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Itinerary
