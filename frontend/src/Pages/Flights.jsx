import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Plane, Clock, Users, ArrowRight, Zap, CheckCircle } from 'lucide-react'
import { supabase } from '../supabase'

const API = 'https://ai-powered-multi-agent-travel-planning.onrender.com'

const floatingIcons = [
    { icon: '✈️', delay: 0, x: '10%', y: '15%' },
    { icon: '🎫', delay: 0.5, x: '85%', y: '20%' },
    { icon: '🧳', delay: 1, x: '15%', y: '80%' },
    { icon: '🌍', delay: 0.3, x: '80%', y: '75%' },
]

export default function Flights() {
    const [form, setForm] = useState({ origin: '', destination: '', date: '', passengers: 1 })
    const [flights, setFlights] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [selectedFlight, setSelectedFlight] = useState(null)
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
            amount: selectedFlight.price_inr * 100, // Amount in paise
            currency: "INR",
            name: "Lumina Travel",
            description: `Flight ${selectedFlight.flight_number} to ${selectedFlight.arrival}`,
            handler: async function (response) {
                setProcessing(true)
                try {
                    // Save to Supabase
                    const { error } = await supabase.from('bookings').insert([{
                        flight_number: selectedFlight.flight_number,
                        airline: selectedFlight.airline,
                        departure: selectedFlight.departure,
                        arrival: selectedFlight.arrival,
                        user_name: userDetails.name,
                        user_email: userDetails.email,
                        user_phone: userDetails.phone,
                        amount: selectedFlight.price_inr,
                        razorpay_payment_id: response.razorpay_payment_id
                    }])
                    if (error) console.error("Supabase Save Error:", error)
                    
                    setBookingSuccess(`BKG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`)
                    setSelectedFlight(null)
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
        if (!form.origin || !form.destination || !form.date) return
        setLoading(true)
        setSearched(true)
        try {
            const res = await axios.get(`${API}/flights`, { params: form })
            if (res.data && res.data.flights && res.data.flights.length > 0) {
                setFlights(res.data.flights)
            } else {
                generateDummyFlights()
            }
        } catch { 
            generateDummyFlights() 
        }
        setLoading(false)
    }

    const generateDummyFlights = () => {
        const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Akasa Air']
        const dummy = Array(5).fill(0).map((_, i) => {
            const h = 6 + i * 3
            return {
                airline: airlines[i],
                flight_number: `${airlines[i].substring(0, 2).toUpperCase()}-${100 + i * 15}`,
                departure: `${h < 10 ? '0' : ''}${h}:00`,
                arrival: `${h + 2 < 10 ? '0' : ''}${h + 2}:15`,
                duration: '2h 15m',
                price_inr: 4500 + i * 800 + Math.floor(Math.random() * 500),
                class: 'Economy',
                stops: 'Non-stop',
                seats_left: 5 + i * 2,
            }
        })
        setFlights(dummy)
    }

    const airlineColors = { 'IndiGo': '#6C63FF', 'Air India': '#DC143C', 'SpiceJet': '#FF6B35', 'Vistara': '#7B2D8E', 'Akasa Air': '#FF8C00' }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--abyss) 0%, var(--navy) 40%, var(--abyss) 100%)', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>
            <div className="film-grain"></div>

            <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,141,120,0.15) 0%, transparent 70%)', top: '10%', right: '10%', pointerEvents: 'none' }} />

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
                    <div className="section-tag glass-green" style={{ color: 'var(--subway-green)', border: 'none' }}><Plane size={12} /> AI flight search</div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', color: '#FBE4D8', fontWeight: 600 }}>Find your flight</h1>
                    <p style={{ color: '#7BBDE8', fontSize: '14px', marginTop: '8px' }}>Powered by AI — realistic results, zero booking fees</p>
                </motion.div>

                {/* Search form */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-beige deep-hover" style={{ padding: '28px', borderRadius: '20px', marginBottom: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 500 }}>From</label>
                            <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="Mumbai, Delhi..." />
                        </div>
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 500 }}>To</label>
                            <input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="Goa, Bangalore..." />
                        </div>
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Date</label>
                            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Pax</label>
                            <input type="number" min={1} max={9} value={form.passengers} onChange={e => setForm({ ...form, passengers: e.target.value })} style={{ width: '70px' }} />
                        </div>
                        <button className="btn-primary" onClick={search} disabled={loading} style={{ whiteSpace: 'nowrap', height: '44px' }}>
                            {loading ? '⏳' : '🔍 Search'}
                        </button>
                    </div>
                </motion.div>

                {/* Results */}
                <AnimatePresence>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', fontSize: '32px' }}>✈️</motion.div>
                            <p style={{ color: '#7BBDE8', marginTop: '16px' }}>AI is generating realistic flights...</p>
                        </div>
                    )}

                    {!loading && searched && flights.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#49769F' }}>No flights found. Try different cities.</div>
                    )}

                    {!loading && flights.map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="glass-green deep-hover" style={{ padding: '24px', borderRadius: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{ minWidth: '120px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: airlineColors[f.airline] || '#7BBDE8', letterSpacing: '1px', marginBottom: '4px' }}>{f.airline}</div>
                                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#49769F' }}>{f.flight_number}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#FBE4D8', fontWeight: 600 }}>{f.departure}</div>
                                    <div style={{ fontSize: '11px', color: '#49769F' }}>{form.origin}</div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: '#49769F', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        <Clock size={10} />{f.duration}
                                    </div>
                                    <div style={{ height: '1px', background: 'rgba(123,189,232,0.2)', position: 'relative' }}>
                                        <ArrowRight size={12} color="#49769F" style={{ position: 'absolute', right: -6, top: -6 }} />
                                    </div>
                                    <div style={{ fontSize: '11px', color: f.stops === 'Non-stop' ? '#8EB5A9' : '#EF9F27', marginTop: '4px' }}>{f.stops}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#FBE4D8', fontWeight: 600 }}>{f.arrival}</div>
                                    <div style={{ fontSize: '11px', color: '#49769F' }}>{form.destination}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#FBE4D8', fontWeight: 600 }}>₹{f.price_inr?.toLocaleString()}</div>
                                <div style={{ fontSize: '11px', color: '#49769F', marginBottom: '12px' }}>{f.seats_left} seats left · {f.class}</div>
                                <button className="btn-primary" onClick={() => setSelectedFlight(f)} style={{ padding: '8px 20px', fontSize: '13px' }}>Select →</button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Razorpay Booking Modal */}
                <AnimatePresence>
                    {selectedFlight && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,29,57,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="glass-purple" style={{ padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
                                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#FBE4D8', marginBottom: '8px' }}>Passenger Details</h3>
                                <p style={{ color: '#BDD8E9', fontSize: '13px', marginBottom: '24px' }}>{selectedFlight.airline} {selectedFlight.flight_number} — ₹{selectedFlight.price_inr.toLocaleString()}</p>
                                
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
                                    <button className="btn-ghost" onClick={() => setSelectedFlight(null)} style={{ flex: 1 }}>Cancel</button>
                                    <button className="btn-coral" onClick={handlePayment} disabled={processing} style={{ flex: 2 }}>
                                        {processing ? 'Processing...' : `Pay ₹${selectedFlight.price_inr.toLocaleString()}`}
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
                                <p style={{ color: '#BDD8E9', fontSize: '14px', marginBottom: '8px' }}>Your tickets have been issued directly to the war room.</p>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', margin: '24px 0', fontFamily: 'Space Mono, monospace', fontSize: '18px', color: '#7BBDE8', letterSpacing: '2px' }}>
                                    {bookingSuccess}
                                </div>
                                <button className="btn-primary" onClick={() => setBookingSuccess(null)} style={{ width: '100%' }}>Return to flights</button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
