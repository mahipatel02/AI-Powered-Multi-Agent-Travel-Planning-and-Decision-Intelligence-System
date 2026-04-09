import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plane, Menu, X, Sparkles, User, LogOut } from 'lucide-react'
import { useAuth } from '../AuthContext'

const links = [
    { to: '/chat', label: 'AI Planner' },
    { to: '/flights', label: 'Flights' },
    { to: '/hotels', label: 'Hotels' },
    { to: '/packvote', label: 'PackVote ⚔️' },
    { to: '/photo', label: 'Photo Search' },
    { to: '/memories', label: 'Memories' },
    { to: '/regret', label: 'Regret Score' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [open, setOpen] = useState(false)
    const location = useLocation()
    const { user, signOut } = useAuth()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => setOpen(false), [location])

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            padding: '0 32px',
            background: scrolled ? 'rgba(0, 29, 57, 0.9)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(123,189,232,0.1)' : 'none',
            transition: 'all 0.3s ease',
            height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: 32, height: 32, borderRadius: '8px',
                    background: 'linear-gradient(135deg, #4E8EA2, #0A4174)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Plane size={16} color="#BDD8E9" />
                </div>
                <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '22px', fontWeight: 600,
                    color: '#FBE4D8', letterSpacing: '1px',
                }}>Lumina</span>
            </Link>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">
                {links.map(l => (
                    <Link key={l.to} to={l.to} style={{
                        textDecoration: 'none',
                        color: location.pathname === l.to ? '#BDD8E9' : '#7BBDE8',
                        fontSize: '13px', fontWeight: 500,
                        padding: '6px 14px', borderRadius: '50px',
                        background: location.pathname === l.to ? 'rgba(123,189,232,0.12)' : 'transparent',
                        transition: 'all 0.2s',
                    }}>{l.label}</Link>
                ))}
                
                {/* Auth Section */}
                <div style={{ borderLeft: '1px solid rgba(123,189,232,0.2)', height: '24px', margin: '0 8px' }}></div>
                
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#FBE4D8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} /> {user.user_metadata?.full_name || user.email.split('@')[0]}
                        </span>
                        <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#7BBDE8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                            <LogOut size={14} /> Log out
                        </button>
                    </div>
                ) : (
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '12px' }}>Log In</button>
                    </Link>
                )}

                <Link to="/chat" style={{ marginLeft: '8px', textDecoration: 'none' }}>
                    <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} /> Plan trip
                    </button>
                </Link>
            </div>

            <button onClick={() => setOpen(!open)} style={{
                display: 'none', background: 'none', border: 'none',
                color: '#7BBDE8', cursor: 'pointer',
            }} className="mobile-menu-btn">
                {open ? <X size={24} /> : <Menu size={24} />}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '64px', left: 0, right: 0,
                    background: 'rgba(0, 29, 57, 0.97)', backdropFilter: 'blur(16px)',
                    padding: '16px 24px', borderBottom: '1px solid rgba(123,189,232,0.1)',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                }}>
                    {links.map(l => (
                        <Link key={l.to} to={l.to} style={{
                            textDecoration: 'none', color: '#BDD8E9',
                            fontSize: '16px', padding: '12px 0',
                            borderBottom: '1px solid rgba(123,189,232,0.08)',
                        }}>{l.label}</Link>
                    ))}
                    {user ? (
                        <>
                            <div style={{ color: '#FBE4D8', fontSize: '16px', padding: '12px 0', borderBottom: '1px solid rgba(123,189,232,0.08)' }}>
                                <User size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/> 
                                {user.user_metadata?.full_name || user.email.split('@')[0]}
                            </div>
                            <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#7BBDE8', fontSize: '16px', padding: '12px 0', textAlign: 'left', cursor: 'pointer' }}>
                                <LogOut size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/> Log out
                            </button>
                        </>
                    ) : (
                        <Link to="/login" style={{ textDecoration: 'none', color: '#BDD8E9', fontSize: '16px', padding: '12px 0' }}>Log In</Link>
                    )}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
        </nav>
    )
}
 