import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Users, Zap, Trophy, AlertTriangle, Copy, Check, Send, Link } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useSearchParams } from 'react-router-dom'

const API = 'https://ai-powered-multi-agent-travel-planning.onrender.com'
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const floatingIcons = [
  { icon: '🎒', delay: 0, x: '5%', y: '15%' },
  { icon: '⚔️', delay: 0.5, x: '90%', y: '25%' },
  { icon: '🗺️', delay: 1, x: '10%', y: '75%' },
  { icon: '🏕️', delay: 0.3, x: '85%', y: '80%' },
]

const VIBES = [
  { id: 'beach', label: 'Beach', icon: '🏖️', color: '#4E8EA2' },
  { id: 'mountains', label: 'Mountains', icon: '🏔️', color: '#49769F' },
  { id: 'city', label: 'City life', icon: '🌆', color: '#7C2D8E' },
  { id: 'nature', label: 'Nature', icon: '🌿', color: '#8EB5A9' },
  { id: 'adventure', label: 'Adventure', icon: '🧗', color: '#DC586D' },
  { id: 'culture', label: 'Culture', icon: '🏛️', color: '#A78D78' },
  { id: 'nightlife', label: 'Nightlife', icon: '🎉', color: '#DF86B2' },
  { id: 'relaxed', label: 'Relaxed', icon: '🧘', color: '#6E473B' },
  { id: 'food', label: 'Food trip', icon: '🍜', color: '#EF9F27' },
  { id: 'wildlife', label: 'Wildlife', icon: '🦁', color: '#639922' },
]

const DESTINATIONS = [
  { name: 'Goa', icon: '🏖️' },
  { name: 'Manali', icon: '🏔️' },
  { name: 'Kerala', icon: '🌿' },
  { name: 'Jaipur', icon: '🏰' },
  { name: 'Ladakh', icon: '⛰️' },
  { name: 'Coorg', icon: '☕' },
  { name: 'Rishikesh', icon: '🧘' },
  { name: 'Andaman', icon: '🏝️' },
  { name: 'Udaipur', icon: '🏯' },
  { name: 'Meghalaya', icon: '🌧️' },
]

const BUDGETS = [
  { value: 'low', label: 'Budget', icon: '💸', desc: 'Under ₹15k' },
  { value: 'medium', label: 'Mid-range', icon: '💳', desc: '₹15k–40k' },
  { value: 'high', label: 'Luxury', icon: '💎', desc: '₹40k+' },
]

const PACES = [
  { value: 'slow', label: 'Slow', icon: '🧘' },
  { value: 'moderate', label: 'Balanced', icon: '⚖️' },
  { value: 'fast', label: 'Pack it in', icon: '⚡' },
]

function SelectCard({ item, selected, onToggle, multi = false }) {
  const key = item.id || item.value || item.name
  const isSelected = multi ? selected.includes(key) : selected === key
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} onClick={() => onToggle(key)}
      style={{
        background: isSelected ? `${item.color || '#7C2D8E'}33` : 'rgba(43,18,76,0.3)',
        border: `1.5px solid ${isSelected ? (item.color || '#DF86B2') : 'rgba(124,45,142,0.25)'}`,
        borderRadius: '12px', padding: '12px 8px', cursor: 'pointer', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
      }}>
      <span style={{ fontSize: '20px' }}>{item.icon}</span>
      <span style={{ color: isSelected ? '#FBE4D8' : '#BDD8E9', fontSize: '11px', fontWeight: 500, lineHeight: 1.2 }}>{item.label || item.name}</span>
      {item.desc && <span style={{ color: '#7BBDE8', fontSize: '9px' }}>{item.desc}</span>}
    </motion.button>
  )
}

export default function PackVote() {
  const [phase, setPhase] = useState('home')
  const [groupName, setGroupName] = useState('')
  const [groupId, setGroupId] = useState(null)
  const [memberName, setMemberName] = useState('')
  const [budget, setBudget] = useState('')
  const [pace, setPace] = useState('')
  const [selectedVibes, setSelectedVibes] = useState([])
  const [selectedDest, setSelectedDest] = useState('')
  const [memberId, setMemberId] = useState(null)
  const [members, setMembers] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [joinId, setJoinId] = useState('')
  const [copied, setCopied] = useState(false)
  const [prefAdded, setPrefAdded] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [wishlist, setWishlist] = useState([])
  const [wishlistInput, setWishlistInput] = useState('')
  const chatBottomRef = useRef(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const joinParam = searchParams.get('joinId')
    if (joinParam && phase === 'home') {
      setJoinId(joinParam)
      setPhase('join')
    }
  }, [searchParams, phase])

  const toggleVibe = id => setSelectedVibes(p => p.includes(id) ? p.filter(v => v !== id) : [...p, id])

  useEffect(() => {
    if (!groupId || phase !== 'room') return
    const channel = supabase.channel(`war-room-${groupId}`)
      .on('broadcast', { event: 'chat' }, ({ payload }) => setChatMessages(p => [...p, payload]))
      .on('broadcast', { event: 'wishlist' }, ({ payload }) => setWishlist(p => [payload, ...p]))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [groupId, phase])

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const sendChat = async () => {
    if (!chatInput.trim() || !memberName) return
    const msg = { name: memberName, text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setChatMessages(p => [...p, msg])
    await supabase.channel(`war-room-${groupId}`).send({ type: 'broadcast', event: 'chat', payload: msg })
    setChatInput('')
  }

  const addWishlist = async () => {
    if (!wishlistInput.trim() || !memberName || !groupId) return
    const payload = { link_url: wishlistInput.trim(), member_name: memberName }
    try {
      const res = await axios.post(`${API}/groups/${groupId}/wishlist`, new URLSearchParams(payload))
      setWishlist(p => [res.data, ...p])
      await supabase.channel(`war-room-${groupId}`).send({ type: 'broadcast', event: 'wishlist', payload: res.data })
      setWishlistInput('')
    } catch { alert('Error adding wishlist link') }
  }

  const createGroup = async () => {
    if (!groupName.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/groups`, new URLSearchParams({ group_name: groupName }))
      setGroupId(res.data.group_id); setPhase('room')
    } catch { alert('Error creating group') }
    setLoading(false)
  }

  const joinGroup = () => { if (!joinId.trim()) return; setGroupId(parseInt(joinId)); setPhase('room') }

  const addMember = async () => {
    if (!memberName.trim() || !budget || !pace) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/groups/${groupId}/members`, new URLSearchParams({ name: memberName, budget, pace }))
      setMemberId(res.data.id); fetchMembers()
    } catch { alert('Error joining room') }
    setLoading(false)
  }

  const addPreference = async () => {
    if (!selectedDest || !memberId) return
    setLoading(true)
    try {
      await axios.post(`${API}/members/${memberId}/preferences`,
        new URLSearchParams({ destination: selectedDest, activity: selectedVibes.join(', '), vibe: selectedVibes.join(', ') }))
      setPrefAdded(true); fetchMembers()
    } catch { alert('Error adding preference') }
    setLoading(false)
  }

  const fetchMembers = async () => {
    if (!groupId) return
    try { const res = await axios.get(`${API}/groups/${groupId}/members`); setMembers(res.data) } catch { }
  }

  const fetchWishlist = async () => {
    if (!groupId) return
    try { const res = await axios.get(`${API}/groups/${groupId}/wishlist`); setWishlist(res.data) } catch { }
  }

  const generateDecision = async () => {
    setLoading(true)
    try { const res = await axios.post(`${API}/groups/${groupId}/generate-decision`); setResult(res.data); setPhase('result') }
    catch { alert('Error generating decision') }
    setLoading(false)
  }

  const copyLink = () => { 
    const url = `${window.location.origin}/packvote?joinId=${groupId}`
    navigator.clipboard.writeText(`Join my Lumina War Room! ⚔️\nClick here: ${url}\nOr use code manually: ${groupId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) 
  }

  useEffect(() => {
    if (groupId && phase === 'room') { fetchMembers(); fetchWishlist(); const t = setInterval(fetchMembers, 5000); return () => clearInterval(t) }
  }, [groupId, phase])

  const chaosColor = result ? (result.chaos_level === 'Low' ? '#8EB5A9' : result.chaos_level === 'Medium' ? '#EF9F27' : '#DC586D') : '#49769F'
  const chaosWidth = result ? (result.chaos_level === 'Low' ? '30%' : result.chaos_level === 'Medium' ? '60%' : '90%') : '0%'
  const resetAll = () => { setPhase('home'); setResult(null); setGroupId(null); setMemberId(null); setMembers([]); setPrefAdded(false); setSelectedVibes([]); setSelectedDest(''); setChatMessages([]); setWishlist([]) }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--abyss) 0%, var(--plum) 50%, var(--void) 100%)', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>
      <div className="film-grain"></div>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[...Array(24)].map((_, i) => (
          <motion.div key={i} animate={{ y: [0, -40, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: i % 3 === 0 ? 'var(--dusty-pink)' : 'var(--grape)', left: `${4 + i * 4}%`, top: `${10 + (i % 6) * 12}%` }} />
        ))}
      </div>

      {floatingIcons.map((t, i) => (
          <motion.div key={`float-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1, y: [0, -15, 0] }}
              transition={{ delay: t.delay, duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
              className="floating-3d-icon"
              style={{ left: t.x, top: t.y, fontSize: '36px' }}
          >{t.icon}</motion.div>
      ))}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>

        {/* HOME */}
        {phase === 'home' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>⚔️</div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '60px', color: '#FBE4D8', fontWeight: 600, marginBottom: '8px' }}>PackVote</h1>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#DF86B2', fontWeight: 300, marginBottom: '20px' }}>War Room</h2>
            <p style={{ color: '#7BBDE8', fontSize: '15px', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 40px', fontWeight: 300 }}>
              End group travel chaos. Create a war room, crew joins, taps their vibes — AI finds the perfect trip everyone agrees on.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
              <button className="btn-coral" onClick={() => setPhase('create')} style={{ fontSize: '15px', padding: '16px 36px' }}>⚔️ Create war room</button>
              <button className="btn-ghost" onClick={() => setPhase('join')} style={{ fontSize: '15px', padding: '16px 36px' }}>🔗 Join with code</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { step: '01', title: 'Create room', desc: 'One person creates and shares the war room code.', icon: '⚔️' },
                { step: '02', title: 'Tap your vibes', desc: 'Everyone picks travel vibe cards — no typing needed.', icon: '✨' },
                { step: '03', title: 'Discuss live', desc: 'Chat in real-time with your crew inside the war room.', icon: '💬' },
                { step: '04', title: 'AI decides', desc: 'PackVote AI finds the perfect destination for the group.', icon: '🤖' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                  className="glass-purple deep-hover" style={{ padding: '24px', textAlign: 'left', borderRadius: '16px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'var(--dusty-pink)', marginBottom: '6px' }}>{s.step}</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#FBE4D8', fontWeight: 600, marginBottom: '6px' }}>{s.title}</div>
                  <div style={{ fontSize: '13px', color: '#7BBDE8', lineHeight: 1.6, fontWeight: 300 }}>{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CREATE */}
        {phase === 'create' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-purple" style={{ padding: '40px', borderRadius: '24px', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: '#FBE4D8', marginBottom: '8px' }}>Create war room</h2>
            <p style={{ color: '#DF86B2', fontSize: '14px', marginBottom: '28px' }}>Give your trip group a name</p>
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. South India Trip 2025"
              onKeyDown={e => e.key === 'Enter' && createGroup()}
              style={{ marginBottom: '24px', background: 'rgba(43,18,76,0.5)', borderColor: 'rgba(124,45,142,0.4)' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" onClick={() => setPhase('home')} style={{ flex: 1 }}>Back</button>
              <button className="btn-coral" onClick={createGroup} disabled={loading} style={{ flex: 2 }}>{loading ? 'Creating...' : '⚔️ Create room'}</button>
            </div>
          </motion.div>
        )}

        {/* JOIN */}
        {phase === 'join' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-purple" style={{ padding: '40px', borderRadius: '24px', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: '#FBE4D8', marginBottom: '8px' }}>Join war room</h2>
            <p style={{ color: '#DF86B2', fontSize: '14px', marginBottom: '28px' }}>Enter the group code your friend shared</p>
            <input value={joinId} onChange={e => setJoinId(e.target.value)} placeholder="e.g. 8451" type="number"
              style={{ marginBottom: '24px', background: 'rgba(43,18,76,0.5)', borderColor: 'rgba(124,45,142,0.4)' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" onClick={() => setPhase('home')} style={{ flex: 1 }}>Back</button>
              <button className="btn-coral" onClick={joinGroup} style={{ flex: 2 }}>🔗 Join room</button>
            </div>
          </motion.div>
        )}

        {/* WAR ROOM */}
        {phase === 'room' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', color: '#FBE4D8' }}>⚔️ War Room #{groupId}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#8EB5A9' }} />
                  <span style={{ color: '#DF86B2', fontSize: '13px' }}>Live session</span>
                </div>
              </div>
              <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 159, 39, 0.15)', border: '1px solid #EF9F27', color: '#EF9F27', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 12px rgba(239,159,39,0.2)' }}>
                {copied ? <Check size={16} /> : <Link size={16} />}{copied ? 'Link Copied!' : `Copy Invite Link`}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {!memberId ? (
                <div className="glass-purple" style={{ padding: '28px', borderRadius: '20px' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#FBE4D8', marginBottom: '20px' }}>Join the room</h3>
                  <input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Your name"
                    style={{ marginBottom: '16px', background: 'rgba(43,18,76,0.5)', borderColor: 'rgba(124,45,142,0.4)' }} />
                  <div style={{ color: '#DF86B2', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Budget</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
                    {BUDGETS.map(b => <SelectCard key={b.value} item={b} selected={budget} onToggle={setBudget} />)}
                  </div>
                  <div style={{ color: '#DF86B2', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Travel pace</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
                    {PACES.map(p => <SelectCard key={p.value} item={p} selected={pace} onToggle={setPace} />)}
                  </div>
                  <button className="btn-coral" onClick={addMember} disabled={loading || !memberName || !budget || !pace} style={{ width: '100%' }}>
                    {loading ? 'Joining...' : 'Join room →'}
                  </button>
                </div>
              ) : !prefAdded ? (
                <div className="glass-purple" style={{ padding: '28px', borderRadius: '20px' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#FBE4D8', marginBottom: '4px' }}>Your travel vibe</h3>
                  <p style={{ color: '#DF86B2', fontSize: '13px', marginBottom: '16px' }}>Hi {memberName}! Tap your dream destination & vibes</p>
                  <div style={{ color: '#DF86B2', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Dream destination</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px', marginBottom: '16px' }}>
                    {DESTINATIONS.map(d => <SelectCard key={d.name} item={d} selected={selectedDest} onToggle={setSelectedDest} />)}
                  </div>
                  <div style={{ color: '#DF86B2', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Vibes (pick multiple)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px', marginBottom: '20px' }}>
                    {VIBES.map(v => <SelectCard key={v.id} item={v} selected={selectedVibes} onToggle={toggleVibe} multi />)}
                  </div>
                  <button className="btn-coral" onClick={addPreference} disabled={loading || !selectedDest} style={{ width: '100%' }}>
                    {loading ? 'Locking in...' : '✨ Lock in my vibe →'}
                  </button>
                </div>
              ) : (
                <div className="glass-purple" style={{ padding: '28px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#FBE4D8', marginBottom: '8px' }}>Vibe locked!</h3>
                  <p style={{ color: '#DF86B2', fontSize: '14px', marginBottom: '4px' }}>{selectedDest}</p>
                  <p style={{ color: '#7BBDE8', fontSize: '12px' }}>{selectedVibes.join(' · ')}</p>
                  <p style={{ color: '#49769F', fontSize: '12px', marginTop: '12px' }}>Waiting for the crew...</p>
                </div>
              )}

              <div className="glass-purple" style={{ padding: '28px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#FBE4D8' }}>
                    <Users size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />Crew ({members.length})
                  </h3>
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#8EB5A9' }} />
                </div>
                {members.length === 0
                  ? <p style={{ color: '#49769F', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Share the code to invite your crew!</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {members.map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(124,45,142,0.2)', borderRadius: '10px' }}>
                        <div>
                          <div style={{ color: '#FBE4D8', fontSize: '14px', fontWeight: 500 }}>{m.name}</div>
                          <div style={{ color: '#DF86B2', fontSize: '11px' }}>{m.budget} · {m.pace}</div>
                        </div>
                        <div style={{ fontSize: '11px', color: m.preferences?.length > 0 ? '#8EB5A9' : '#49769F' }}>
                          {m.preferences?.length > 0 ? '✓ voted' : 'picking...'}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </div>

            {/* Real-time chat */}
            <div className="glass-purple" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#FBE4D8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                💬 War room chat
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ fontSize: '11px', color: '#8EB5A9', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>● live</motion.span>
              </h3>
              <div style={{ height: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px', paddingRight: '4px' }}>
                {chatMessages.length === 0
                  ? <div style={{ color: '#49769F', fontSize: '13px', textAlign: 'center', paddingTop: '70px' }}>No messages yet. Start the discussion! 🗣️</div>
                  : chatMessages.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7C2D8E,#DF86B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#FBE4D8', fontWeight: 700, flexShrink: 0 }}>
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '2px' }}>
                          <span style={{ color: '#DF86B2', fontSize: '12px', fontWeight: 600 }}>{m.name}</span>
                          <span style={{ color: '#49769F', fontSize: '10px' }}>{m.time}</span>
                        </div>
                        <div style={{ color: '#BDD8E9', fontSize: '13px', lineHeight: 1.6 }}>{m.text}</div>
                      </div>
                    </motion.div>
                  ))
                }
                <div ref={chatBottomRef} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder={memberName ? `Message as ${memberName}...` : 'Join the room first to chat...'}
                  disabled={!memberName}
                  style={{ flex: 1, background: 'rgba(43,18,76,0.5)', borderColor: 'rgba(124,45,142,0.4)' }} />
                <button onClick={sendChat} disabled={!memberName || !chatInput.trim()}
                  style={{ background: chatInput.trim() && memberName ? 'rgba(124,45,142,0.6)' : 'rgba(43,18,76,0.3)', border: '1px solid rgba(124,45,142,0.4)', color: '#DF86B2', padding: '0 16px', borderRadius: '10px', cursor: 'pointer' }}>
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Wishlist */}
            <div className="glass-purple" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#FBE4D8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📌 Mood Board & Links
              </h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input value={wishlistInput} onChange={e => setWishlistInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWishlist()}
                  placeholder={memberName ? `Paste Instagram Reel, Pinterest, or YouTube link...` : 'Join the room first to add links...'}
                  disabled={!memberName}
                  style={{ flex: 1, background: 'rgba(43,18,76,0.5)', borderColor: 'rgba(124,45,142,0.4)', color: '#FBE4D8' }} />
                <button className="btn-coral" onClick={addWishlist} disabled={!memberName || !wishlistInput.trim()} style={{ padding: '0 16px', borderRadius: '10px' }}>
                  Add Link
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {wishlist.length === 0 ? (
                    <div style={{ color: '#49769F', fontSize: '13px', gridColumn: '1 / -1' }}>No links yet. Share some inspiration! ✨</div>
                ) : wishlist.map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'rgba(10,65,116,0.2)', border: '1px solid rgba(123,189,232,0.1)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#7C2D8E,#DF86B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#FBE4D8', fontWeight: 700 }}>
                                {item.member_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span style={{ color: '#7BBDE8', fontSize: '11px' }}>{item.member_name} shared</span>
                        </div>
                        <a href={item.link_url} target="_blank" rel="noreferrer" style={{ color: '#BDD8E9', fontSize: '13px', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', wordBreak: 'break-all', display: 'block' }}>
                            {item.link_url.substring(0, 40)}{item.link_url.length > 40 ? '...' : ''}
                        </a>
                    </div>
                ))}
              </div>
            </div>

            {members.length >= 1 && (
              <div style={{ textAlign: 'center' }}>
                <button className="btn-coral" onClick={generateDecision} disabled={loading} style={{ fontSize: '16px', padding: '16px 48px' }}>
                  {loading ? '🤖 AI mediating...' : '⚡ Generate group decision'}
                </button>
                <p style={{ color: '#49769F', fontSize: '12px', marginTop: '8px' }}>AI analyzes all vibes and finds the perfect destination</p>
              </div>
            )}
          </motion.div>
        )}

        {/* RESULT */}
        {phase === 'result' && result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
              <p style={{ color: '#DF86B2', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>AI has decided</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '72px', color: '#FBE4D8', fontWeight: 600, marginBottom: '8px' }}>{result.selected_destination}</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Trophy size={18} color="#EF9F27" />
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '24px', color: '#EF9F27', fontWeight: 700 }}>{result.group_happiness}%</span>
                <span style={{ color: '#7BBDE8', fontSize: '15px' }}>group happiness</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="glass-purple" style={{ padding: '28px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <AlertTriangle size={16} color={chaosColor} />
                  <h3 style={{ color: '#FBE4D8', fontSize: '16px', fontWeight: 500 }}>Chaos meter</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '50px', height: '8px', marginBottom: '8px' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: chaosWidth }} transition={{ duration: 1, delay: 0.3 }}
                    style={{ height: '8px', borderRadius: '50px', background: chaosColor }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: chaosColor, fontSize: '14px', fontWeight: 600 }}>{result.chaos_level} disagreement</span>
                  <span style={{ color: '#49769F', fontSize: '12px', fontFamily: 'Space Mono, monospace' }}>{result.chaos_score}</span>
                </div>
              </div>
              <div className="glass-purple" style={{ padding: '28px', borderRadius: '20px' }}>
                <h3 style={{ color: '#FBE4D8', fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>Vote breakdown</h3>
                {Object.entries(result.score_distribution || {}).map(([dest, score], i) => {
                  const total = Object.values(result.score_distribution).reduce((a, b) => a + b, 0)
                  const pct = Math.round((score / total) * 100)
                  return (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: dest === result.selected_destination ? '#FBE4D8' : '#7BBDE8', fontSize: '13px' }}>{dest}</span>
                        <span style={{ color: '#49769F', fontSize: '12px', fontFamily: 'Space Mono, monospace' }}>{pct}%</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '50px', height: '4px' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          style={{ height: '4px', borderRadius: '50px', background: dest === result.selected_destination ? '#DF86B2' : '#49769F' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="glass-purple" style={{ padding: '28px', borderRadius: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={16} color="#DF86B2" />
                <h3 style={{ color: '#FBE4D8', fontSize: '16px', fontWeight: 500 }}>AI mediator says</h3>
              </div>
              <p style={{ color: '#BDD8E9', fontSize: '14px', lineHeight: 1.8, fontStyle: 'italic' }}>{result.ai_reason}</p>
            </div>

            {result.ai_suggestions?.length > 0 && (
              <div className="glass-purple" style={{ padding: '28px', borderRadius: '20px', marginBottom: '32px' }}>
                <h3 style={{ color: '#FBE4D8', fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>Alternative suggestions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {result.ai_suggestions.map((s, i) => (
                    <div key={i} style={{ padding: '16px', background: 'rgba(124,45,142,0.2)', borderRadius: '12px' }}>
                      <div style={{ color: '#FBE4D8', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{s.name}</div>
                      <div style={{ color: '#DF86B2', fontSize: '12px', lineHeight: 1.5 }}>{s.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button className="btn-ghost" onClick={resetAll}>Start new war room</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
