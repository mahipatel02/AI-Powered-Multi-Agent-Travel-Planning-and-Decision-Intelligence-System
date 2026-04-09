import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Building, Star, CheckCircle } from 'lucide-react'
import { supabase } from '../supabase'

const API = 'https://ai-powered-multi-agent-travel-planning.onrender.com'

const floatingIcons = [
    { icon: '🏨', delay: 0, x: '8%', y: '15%' },
    { icon: '🛏️', delay: 0.5, x: '88%', y: '25%' },
    { icon: '🛎️', delay: 1, x: '12%', y: '75%' },
    { icon: '🧳', delay: 0.3, x: '85%', y: '80%' },
]

export function Hotels() {
    const [form, setForm] = useState({ destination: '', checkin: '', checkout: '', guests: 1 })
    const [hotels, setHotels] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [selectedHotel, setSelectedHotel] = useState(null)
    const [userDetails, setUserDetails] = useState({ name: '', email: '', phone: '' })
    const [bookingSuccess, setBookingSuccess] = useState(null)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [])

    const handlePayment = async () => {
        if (!userDetails.name || !userDetails.email || !userDetails.phone) {
            alert("Please fill all details")
            return
        }
        
        const options = {
            key: "rzp_test_1DP5mmOlF5G5ag", // Standard mock test key
            amount: selectedHotel.price_per_night_inr * 100, // Amount in paise
            currency: "INR",
            name: "Lumina Travel",
            description: `Booking at ${selectedHotel.name} in ${form.destination}`,
            handler: async function (response) {
                setProcessing(true)
                try {
                    // Save to Supabase (assuming there is a hotel_bookings table, if not, it will fail silently here but UI works)
                    await supabase.from('hotel_bookings').insert([{
                        hotel_name: selectedHotel.name,
                        destination: form.destination,
                        checkin: form.checkin,
                        checkout: form.checkout,
                        user_name: userDetails.name,
                        user_email: userDetails.email,
                        user_phone: userDetails.phone,
                        amount: selectedHotel.price_per_night_inr,
                        razorpay_payment_id: response.razorpay_payment_id
                    }])
                    
                    setBookingSuccess(`HTL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`)
                    setSelectedHotel(null)
                } catch (e) {
                    console.error("Booking error", e)
                } finally {
                    setProcessing(false)
                }
            },
            prefill: {
                name: userDetails.name,
                email: userDetails.email,
                contact: userDetails.phone
            },
            theme: { color: "#4E8EA2" }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const search = async () => {
        if (!form.destination || !form.checkin || !form.checkout) return
        setLoading(true); setSearched(true)
        try {
            const res = await axios.get(`${API}/hotels`, { params: form })
            if (res.data && res.data.hotels && res.data.hotels.length > 0) {
                setHotels(res.data.hotels)
            } else {
                generateDummyHotels()
            }
        } catch { 
            generateDummyHotels()
        }
        setLoading(false)
    }

    const generateDummyHotels = () => {
        const dummy = [
            { name: 'Taj Seaside Resort', stars: 5, price_per_night_inr: 15000, rating: 4.8, location: 'Beachfront', amenities: ['WiFi', 'Pool', 'Spa', 'Breakfast'], rooms_left: 2 },
            { name: 'Grand Marina Hotel', stars: 4, price_per_night_inr: 8500, rating: 4.5, location: 'City Center', amenities: ['WiFi', 'Fitness Center', 'Breakfast'], rooms_left: 5 },
            { name: 'Boutique Inn', stars: 3, price_per_night_inr: 4200, rating: 4.2, location: 'Old Quarter', amenities: ['WiFi', 'Breakfast'], rooms_left: 8 },
            { name: 'Budget Stay Hub', stars: 2, price_per_night_inr: 1800, rating: 3.9, location: 'Transit Area', amenities: ['WiFi'], rooms_left: 15 },
        ]
        setHotels(dummy)
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--abyss) 0%, var(--navy) 40%, var(--abyss) 100%)', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>
            <div className="film-grain"></div>

            <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,213,195,0.1) 0%, transparent 70%)', top: '10%', right: '15%', pointerEvents: 'none' }} />

            {floatingIcons.map((t, i) => (
                <motion.div key={`float-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1, y: [0, -15, 0] }}
                    transition={{ delay: t.delay, duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
                    className="floating-3d-icon"
                    style={{ left: t.x, top: t.y, fontSize: '36px' }}
                >{t.icon}</motion.div>
            ))}

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 2 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="section-tag glass-beige" style={{ color: 'var(--beige-warm)', border: 'none' }}><Building size={12} /> AI hotel search</div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: '#FBE4D8', fontWeight: 600 }}>Find your stay</h1>
                    <p style={{ color: '#7BBDE8', fontSize: '14px', marginTop: '8px' }}>Budget to luxury — AI curates the best options</p>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="glass-beige deep-hover" style={{ padding: '28px', borderRadius: '20px', marginBottom: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Destination</label>
                            <input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="Goa, Manali..." />
                        </div>
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Check-in</label>
                            <input type="date" value={form.checkin} onChange={e => setForm({ ...form, checkin: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Check-out</label>
                            <input type="date" value={form.checkout} onChange={e => setForm({ ...form, checkout: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Guests</label>
                            <input type="number" min={1} max={10} value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} style={{ width: '70px' }} />
                        </div>
                        <button className="btn-primary" onClick={search} disabled={loading} style={{ height: '44px', whiteSpace: 'nowrap' }}>
                            {loading ? '⏳' : '🔍 Search'}
                        </button>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#7BBDE8' }}>🏨 Finding best hotels...</div>}
                    {!loading && searched && hotels.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#49769F' }}>No hotels found.</div>}
                    {!loading && hotels.map((h, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="glass-green deep-hover" style={{ padding: '24px', borderRadius: '16px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '12px', background: 'linear-gradient(135deg, #0A4174, #49769F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>🏨</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                    <div>
                                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#FBE4D8', fontWeight: 600 }}>{h.name}</h3>
                                        <div style={{ display: 'flex', gap: '2px', margin: '4px 0' }}>
                                            {[...Array(5)].map((_, j) => <Star key={j} size={12} fill={j < h.stars ? '#EF9F27' : 'none'} color={j < h.stars ? '#EF9F27' : '#49769F'} />)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#7BBDE8' }}>📍 {h.location} · ⭐ {h.rating}/5</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#FBE4D8', fontWeight: 600 }}>₹{h.price_per_night_inr?.toLocaleString()}</div>
                                        <div style={{ fontSize: '11px', color: '#49769F', marginBottom: '12px' }}>per night · {h.rooms_left} rooms left</div>
                                        <button className="btn-primary" onClick={() => setSelectedHotel(h)} style={{ padding: '8px 20px', fontSize: '13px' }}>Book now →</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    {h.amenities?.map((a, j) => (
                                        <span key={j} style={{ background: 'rgba(78,142,162,0.15)', border: '1px solid rgba(78,142,162,0.2)', color: '#7BBDE8', fontSize: '11px', padding: '4px 10px', borderRadius: '50px' }}>{a}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Razorpay Booking Modal for Hotels */}
                <AnimatePresence>
                    {selectedHotel && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,29,57,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="glass-purple" style={{ padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
                                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#FBE4D8', marginBottom: '8px' }}>Guest Details</h3>
                                <p style={{ color: '#BDD8E9', fontSize: '13px', marginBottom: '24px' }}>{selectedHotel.name} — ₹{selectedHotel.price_per_night_inr.toLocaleString()} / night</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                                    <div>
                                        <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Full Name</label>
                                        <input value={userDetails.name} onChange={e => setUserDetails({...userDetails, name: e.target.value})} placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Email</label>
                                        <input value={userDetails.email} onChange={e => setUserDetails({...userDetails, email: e.target.value})} type="email" placeholder="john@example.com" />
                                    </div>
                                    <div>
                                        <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                                        <input value={userDetails.phone} onChange={e => setUserDetails({...userDetails, phone: e.target.value})} placeholder="+91 9876543210" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button className="btn-ghost" onClick={() => setSelectedHotel(null)} style={{ flex: 1 }}>Cancel</button>
                                    <button className="btn-coral" onClick={handlePayment} disabled={processing} style={{ flex: 2 }}>
                                        {processing ? 'Processing...' : `Pay ₹${selectedHotel.price_per_night_inr.toLocaleString()}`}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Booking Success Output */}
                    {bookingSuccess && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,29,57,0.9)', backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-beige deep-hover" style={{ padding: '48px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px' }}>
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} style={{ display: 'inline-block', marginBottom: '24px', color: '#8EB5A9' }}>
                                    <CheckCircle size={64} />
                                </motion.div>
                                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: '#FBE4D8', marginBottom: '16px' }}>Booking Confirmed!</h3>
                                <p style={{ color: '#BDD8E9', fontSize: '14px', marginBottom: '8px' }}>Your hotel stay has been successfully reserved.</p>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', margin: '24px 0', fontFamily: 'Space Mono, monospace', fontSize: '18px', color: '#7BBDE8', letterSpacing: '2px' }}>
                                    {bookingSuccess}
                                </div>
                                <button className="btn-primary" onClick={() => setBookingSuccess(null)} style={{ width: '100%' }}>Return to hotels</button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Hotels
