import { useState } from 'react'
import { supabase } from '../supabase'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plane } from 'lucide-react'

export default function Login() {
    const [isLogin, setIsLogin] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                navigate('/')
            } else {
                const { error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { data: { full_name: name } }
                })
                if (error) throw error
                // Check if session exists (auto-login), otherwise show message to verify
                const { data } = await supabase.auth.getSession()
                if (data?.session) {
                    navigate('/')
                } else {
                    setError('Please check your email to verify your account.')
                }
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '64px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className="glass" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '12px', margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #4E8EA2, #0A4174)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Plane size={24} color="#BDD8E9" />
                    </div>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: '#FBE4D8', fontWeight: 600 }}>
                        {isLogin ? 'Welcome back' : 'Join TripMind'}
                    </h2>
                    <p style={{ color: '#7BBDE8', fontSize: '14px', marginTop: '8px' }}>
                        {isLogin ? 'Enter your details to access your trips' : 'Sign up to start planning with AI'}
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(220, 88, 109, 0.1)', border: '1px solid rgba(220, 88, 109, 0.3)', borderRadius: '8px', color: '#F89590', fontSize: '14px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isLogin && (
                        <div>
                            <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Full Name</label>
                            <input required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
                        </div>
                    )}
                    <div>
                        <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Email</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                        <label style={{ color: '#7BBDE8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Password</label>
                        <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    
                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null) }} 
                        style={{ background: 'none', border: 'none', color: '#7BBDE8', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
