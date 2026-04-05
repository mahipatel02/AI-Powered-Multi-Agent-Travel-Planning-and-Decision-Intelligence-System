import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Camera, Upload, Sparkles, MapPin, Image } from 'lucide-react'
import LazyImage from '../components/LazyImage'

const API = 'http://localhost:8000'

export default function PhotoSearch() {
    const [dragOver, setDragOver] = useState(false)
    const [preview, setPreview] = useState(null)
    const [file, setFile] = useState(null)
    const [userText, setUserText] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    const handleFile = (f) => {
        if (!f || !f.type.startsWith('image/')) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setResult(null)
    }

    const onDrop = (e) => {
        e.preventDefault(); setDragOver(false)
        handleFile(e.dataTransfer.files[0])
    }

    const search = async () => {
        if (!file) return
        setLoading(true)
        const form = new FormData()
        form.append('image', file)
        form.append('user_text', userText)
        try {
            const res = await axios.post(`${API}/multimodal`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
            setResult(res.data)
        } catch { alert('Error analyzing image. Make sure backend is running.') }
        setLoading(false)
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #4C1D3D 0%, #190019 50%, #0A4174 100%)', paddingTop: '80px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div className="section-tag" style={{ background: 'rgba(220,88,109,0.15)', borderColor: 'rgba(220,88,109,0.3)', color: '#DC586D' }}>
                        <Camera size={12} /> AI photo search
                    </div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', color: '#FBE4D8', fontWeight: 600, marginBottom: '12px' }}>Find any place<br />from a photo</h1>
                    <p style={{ color: '#F89590', fontSize: '15px', fontWeight: 300 }}>Upload a Pinterest or Instagram travel photo — AI identifies the exact location or finds similar destinations.</p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr', gap: '24px' }}>
                    {/* Upload */}
                    <div>
                        <div
                            onDrop={onDrop}
                            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => inputRef.current?.click()}
                            style={{
                                border: `2px dashed ${dragOver ? '#DC586D' : 'rgba(248,149,144,0.3)'}`,
                                borderRadius: '20px',
                                padding: '40px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: dragOver ? 'rgba(220,88,109,0.1)' : 'rgba(76,29,61,0.3)',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.3s',
                                minHeight: preview ? '200px' : '300px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            }}>
                            {preview ? (
                                <LazyImage src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', objectFit: 'cover' }} />
                            ) : (
                                <>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                                    <div style={{ color: '#FBE4D8', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Drop your travel photo here</div>
                                    <div style={{ color: '#F89590', fontSize: '13px' }}>or click to browse · JPG, PNG, WEBP</div>
                                </>
                            )}
                            <input ref={inputRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
                        </div>

                        {preview && (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input value={userText} onChange={e => setUserText(e.target.value)}
                                    placeholder="Ask something (optional): Where is this? Find similar..."
                                    style={{ background: 'rgba(76,29,61,0.4)', borderColor: 'rgba(248,149,144,0.3)', color: '#FBE4D8' }} />
                                <button className="btn-coral" onClick={search} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Sparkles size={16} />
                                    {loading ? 'AI is analyzing...' : 'Analyze with AI →'}
                                </button>
                                <button onClick={() => { setPreview(null); setFile(null); setResult(null) }}
                                    className="btn-ghost" style={{ width: '100%', borderColor: 'rgba(248,149,144,0.3)', color: '#F89590' }}>
                                    Upload different photo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Result */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '48px' }}>🔍</motion.div>
                                <div style={{ color: '#F89590', fontSize: '14px', textAlign: 'center' }}>AI is analyzing your photo...<br /><span style={{ color: '#49769F', fontSize: '12px' }}>Identifying location or matching vibe</span></div>
                            </motion.div>
                        )}

                        {result && !loading && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                {result.mode === 'location_identified' && result.location && (
                                    <div style={{ background: 'rgba(76,29,61,0.4)', border: '1px solid rgba(248,149,144,0.2)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(8px)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <MapPin size={16} color="#DC586D" />
                                            <span style={{ color: '#F89590', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Location identified</span>
                                        </div>
                                        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: '#FBE4D8', fontWeight: 600, marginBottom: '4px' }}>{result.location.name}</h2>
                                        <p style={{ color: '#F89590', fontSize: '14px', marginBottom: '16px' }}>📍 {result.location.country}</p>
                                        <p style={{ color: '#BDD8E9', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{result.location.description}</p>
                                        <div style={{ background: 'rgba(220,88,109,0.1)', border: '1px solid rgba(220,88,109,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                                            <div style={{ color: '#FBE4D8', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>🗓️ Best time to visit</div>
                                            <div style={{ color: '#F89590', fontSize: '13px' }}>{result.location.best_time_to_visit}</div>
                                        </div>
                                        <div style={{ color: '#FBE4D8', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Top things to do</div>
                                        {result.location.top_things_to_do?.map((t, i) => (
                                            <div key={i} style={{ color: '#BDD8E9', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(248,149,144,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#DC586D' }}>→</span>{t}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {result.mode === 'vibe_recommendation' && result.recommendation && (
                                    <div style={{ background: 'rgba(76,29,61,0.4)', border: '1px solid rgba(248,149,144,0.2)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(8px)' }}>
                                        <div style={{ color: '#F89590', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>✨ Vibe match</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                            {[result.vibe?.primary_vibe, ...(result.vibe?.aesthetic_tags || [])].filter(Boolean).map((t, i) => (
                                                <span key={i} style={{ background: 'rgba(220,88,109,0.2)', color: '#F89590', fontSize: '12px', padding: '4px 12px', borderRadius: '50px' }}>{t}</span>
                                            ))}
                                        </div>
                                        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: '#FBE4D8', fontWeight: 600, marginBottom: '4px' }}>{result.recommendation.name}</h2>
                                        <p style={{ color: '#F89590', fontSize: '14px', marginBottom: '16px' }}>📍 {result.recommendation.country}</p>
                                        <p style={{ color: '#BDD8E9', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>{result.recommendation.why_it_matches}</p>
                                        <div style={{ color: '#7BBDE8', fontSize: '13px' }}>🌤️ Best season: {result.recommendation.best_season}</div>
                                    </div>
                                )}

                                {result.images?.length > 0 && (
                                    <div style={{ marginTop: '16px' }}>
                                        <div style={{ color: '#F89590', fontSize: '12px', marginBottom: '8px', fontWeight: 500 }}>Photos from this place</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {result.images.slice(0, 4).map((img, i) => (
                                                <LazyImage key={i} src={img} alt="Destination match" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '10px' }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
