import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Heart, TrendingDown, Star, Brain } from 'lucide-react'

const API = 'https://ai-powered-multi-agent-travel-planning.onrender.com'

export default function RegretScore() {
    const [form, setForm] = useState({ destination: '', would_revisit: true, overrated_aspects: '', exceeded_expectations: '', crowds_score: 3, expense_score: 3, safety_score: 3, expectations_score: 3 })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const submit = async () => {
        if (!form.destination) return
        setLoading(true)
        setErrorMsg('')
        try {
            const res = await axios.post(`${API}/regret`, new URLSearchParams({ ...form, would_revisit: form.would_revisit }))
            setResult(res.data)
        } catch { setErrorMsg('Failed to calculate score. Please check connection.') }
        setLoading(false)
    }

    const score = result?.regret_score ?? 0
    const scoreColor = score < 0.3 ? '#8EB5A9' : score < 0.6 ? '#EF9F27' : '#DC586D'
    const scoreLabel = score < 0.3 ? 'No regrets!' : score < 0.6 ? 'Mixed feelings' : 'Would not recommend'
    const scorePct = Math.round(score * 100)

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #4C1D3D 0%, #190019 50%, #001D39 100%)', paddingTop: '80px' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div className="section-tag" style={{ background: 'rgba(220,88,109,0.15)', borderColor: 'rgba(220,88,109,0.3)', color: '#DC586D' }}>
                        <Brain size={12} /> AI self-learning
                    </div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', color: '#FBE4D8', fontWeight: 600, marginBottom: '12px' }}>Regret Score</h1>
                    <p style={{ color: '#F89590', fontSize: '15px', fontWeight: 300, lineHeight: 1.7 }}>
                        Tell us about your trip. AI learns from your experience to give better recommendations to everyone.
                    </p>
                </motion.div>

                {!result ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ background: 'rgba(76,29,61,0.4)', border: '1px solid rgba(248,149,144,0.2)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(8px)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ color: '#F89590', fontSize: '13px', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Where did you travel?</label>
                                <input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })}
                                    placeholder="e.g. Goa, Manali, Kerala..." style={{ background: 'rgba(76,29,61,0.5)', borderColor: 'rgba(248,149,144,0.3)', color: '#FBE4D8' }} />
                            </div>

                            <div>
                                <label style={{ color: '#F89590', fontSize: '13px', display: 'block', marginBottom: '12px', fontWeight: 500 }}>Would you visit again?</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {[{ v: true, label: '❤️ Absolutely yes', color: '#8EB5A9' }, { v: false, label: '😔 Probably not', color: '#DC586D' }].map(opt => (
                                        <button key={String(opt.v)} onClick={() => setForm({ ...form, would_revisit: opt.v })}
                                            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${form.would_revisit === opt.v ? opt.color : 'rgba(248,149,144,0.2)'}`, background: form.would_revisit === opt.v ? `${opt.color}22` : 'transparent', color: form.would_revisit === opt.v ? opt.color : '#F89590', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif' }}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ margin: '12px 0', padding: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '16px', border: '1px solid rgba(248,149,144,0.1)' }}>
                                <h4 style={{ color: '#FBE4D8', fontSize: '14px', marginBottom: '20px', fontWeight: 500 }}>Rate your experience</h4>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ color: '#F89590', fontSize: '12px', fontWeight: 500 }}>Crowds & Comfort</label>
                                        <span style={{ color: '#FBE4D8', fontSize: '12px', fontWeight: 600 }}>{form.crowds_score} / 5</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={form.crowds_score} onChange={e => setForm({ ...form, crowds_score: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#DC586D' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#49769F', fontSize: '10px', marginTop: '4px' }}><span>Too crowded</span><span>Comfortable</span></div>
                                </div>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ color: '#F89590', fontSize: '12px', fontWeight: 500 }}>Value for Money</label>
                                        <span style={{ color: '#FBE4D8', fontSize: '12px', fontWeight: 600 }}>{form.expense_score} / 5</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={form.expense_score} onChange={e => setForm({ ...form, expense_score: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#DC586D' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#49769F', fontSize: '10px', marginTop: '4px' }}><span>Too expensive</span><span>Great value</span></div>
                                </div>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ color: '#F89590', fontSize: '12px', fontWeight: 500 }}>Safety</label>
                                        <span style={{ color: '#FBE4D8', fontSize: '12px', fontWeight: 600 }}>{form.safety_score} / 5</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={form.safety_score} onChange={e => setForm({ ...form, safety_score: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#DC586D' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#49769F', fontSize: '10px', marginTop: '4px' }}><span>Felt unsafe</span><span>Very safe</span></div>
                                </div>
                                
                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ color: '#F89590', fontSize: '12px', fontWeight: 500 }}>Expectations Met</label>
                                        <span style={{ color: '#FBE4D8', fontSize: '12px', fontWeight: 600 }}>{form.expectations_score} / 5</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={form.expectations_score} onChange={e => setForm({ ...form, expectations_score: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#DC586D' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#49769F', fontSize: '10px', marginTop: '4px' }}><span>Disappointed</span><span>Blown away</span></div>
                                </div>
                            </div>

                            <div>
                                <label style={{ color: '#F89590', fontSize: '13px', display: 'block', marginBottom: '8px', fontWeight: 500 }}>What felt overrated?</label>
                                <textarea value={form.overrated_aspects} onChange={e => setForm({ ...form, overrated_aspects: e.target.value })}
                                    rows={3} placeholder="e.g. The famous beach was too crowded, food was expensive..."
                                    style={{ background: 'rgba(76,29,61,0.5)', borderColor: 'rgba(248,149,144,0.3)', color: '#FBE4D8', resize: 'none' }} />
                            </div>

                            <div>
                                <label style={{ color: '#F89590', fontSize: '13px', display: 'block', marginBottom: '8px', fontWeight: 500 }}>What exceeded expectations?</label>
                                <textarea value={form.exceeded_expectations} onChange={e => setForm({ ...form, exceeded_expectations: e.target.value })}
                                    rows={3} placeholder="e.g. The local food was incredible, sunsets were breathtaking..."
                                    style={{ background: 'rgba(76,29,61,0.5)', borderColor: 'rgba(248,149,144,0.3)', color: '#FBE4D8', resize: 'none' }} />
                            </div>

                            {errorMsg && (
                                <div style={{ color: '#DC586D', background: 'rgba(220,88,109,0.1)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid rgba(220,88,109,0.2)' }}>
                                    ⚠️ {errorMsg}
                                </div>
                            )}
                            <button className="btn-coral" onClick={submit} disabled={loading || !form.destination}
                                style={{ padding: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Brain size={16} />
                                {loading ? 'AI calculating regret score...' : 'Calculate my regret score →'}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        {/* Score reveal */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px' }}>
                                <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                                    <motion.circle cx="80" cy="80" r="70" fill="none" stroke={scoreColor} strokeWidth="12"
                                        strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 70}`}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - score) }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }} />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', color: scoreColor, fontWeight: 600 }}>{scorePct}</div>
                                    <div style={{ fontSize: '11px', color: '#49769F' }}>regret score</div>
                                </div>
                            </div>
                            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: '#FBE4D8', marginBottom: '8px' }}>{scoreLabel}</h2>
                            <div style={{ color: scoreColor, fontSize: '14px' }}>for your trip to {form.destination}</div>
                        </div>

                        <div style={{ background: 'rgba(76,29,61,0.4)', border: '1px solid rgba(248,149,144,0.2)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(8px)', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Brain size={16} color="#DC586D" />
                                <h3 style={{ color: '#FBE4D8', fontSize: '16px', fontWeight: 500 }}>AI analysis</h3>
                            </div>
                            <p style={{ color: '#BDD8E9', fontSize: '14px', lineHeight: 1.8, fontStyle: 'italic' }}>{result.summary}</p>
                        </div>

                        {result.recommendation_for_others && (
                            <div style={{ background: 'rgba(76,29,61,0.4)', border: '1px solid rgba(248,149,144,0.2)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(8px)', marginBottom: '24px' }}>
                                <h3 style={{ color: '#FBE4D8', fontSize: '16px', fontWeight: 500, marginBottom: '12px' }}>💡 For future travelers</h3>
                                <p style={{ color: '#F89590', fontSize: '14px', lineHeight: 1.8 }}>{result.recommendation_for_others}</p>
                            </div>
                        )}

                        <div style={{ textAlign: 'center' }}>
                            <button className="btn-ghost" onClick={() => { setResult(null); setForm({ destination: '', would_revisit: true, overrated_aspects: '', exceeded_expectations: '', crowds_score: 3, expense_score: 3, safety_score: 3, expectations_score: 3 }) }}
                                style={{ borderColor: 'rgba(248,149,144,0.3)', color: '#F89590' }}>
                                Review another trip
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
