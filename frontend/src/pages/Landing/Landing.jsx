import { Link } from 'react-router-dom'
import { Shield, Brain, Lock, ChevronRight, Zap, Eye, HeartPulse, Database } from 'lucide-react'
import './Landing.css'

export default function Landing() {
  return (
    <div className="landing">
      {/* ─── Ambient Glow Background ─── */}
      <div className="landing-glow" />
      <div className="landing-glow-accent" />

      {/* ─── Header ─── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="logo">
            <HeartPulse size={28} />
            <span>MedChain<span className="logo-ai">AI</span></span>
          </Link>
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-content animate-fade-in">
          <div className="hero-badge badge badge-primary">
            <Zap size={12} />
            Powered by Blockchain & AI
          </div>
          <h1 className="hero-title">
            Your Health Data,
            <br />
            <span className="text-gradient">Your Control.</span>
          </h1>
          <p className="hero-subtitle">
            A decentralised healthcare platform combining AI-driven disease prediction
            and medical imaging analysis with blockchain-secured patient data ownership.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Free
              <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Doctor Portal
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value text-gradient">256-bit</span>
              <span className="hero-stat-label">AES Encryption</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value text-gradient-accent">IPFS</span>
              <span className="hero-stat-label">Decentralised Storage</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value text-gradient">AI/ML</span>
              <span className="hero-stat-label">Disease Prediction</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="features" id="features">
        <h2 className="section-title">
          Why <span className="text-gradient">MedChain AI</span>
        </h2>
        <p className="section-desc">
          Bridging the gap between cutting-edge AI diagnostics and patient-owned, decentralised health records.
        </p>
        <div className="feature-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-wrap" style={{ background: 'var(--color-primary-muted)' }}>
              <Shield size={24} color="var(--color-primary-hover)" />
            </div>
            <h3>Patient Data Ownership</h3>
            <p>Your medical records are encrypted and stored on IPFS. Smart contracts enforce granular access — you decide who sees your data.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrap" style={{ background: 'var(--color-accent-muted)' }}>
              <Brain size={24} color="var(--color-accent)" />
            </div>
            <h3>AI Disease Prediction</h3>
            <p>TensorFlow-powered models predict risks for diabetes, cardiovascular disease, and cancer using your anonymised health data.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
              <Eye size={24} color="var(--color-warning)" />
            </div>
            <h3>Medical Imaging Analysis</h3>
            <p>Upload X-rays, MRIs, and CT scans for automated CNN-based analysis with annotated heatmaps and findings.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
              <Lock size={24} color="var(--color-info)" />
            </div>
            <h3>Seamless Web2 Login</h3>
            <p>No seed phrases. No wallet downloads. Log in with email & password — blockchain wallets are managed transparently under the hood.</p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="how-it-works" id="how-it-works">
        <h2 className="section-title">
          How It <span className="text-gradient-accent">Works</span>
        </h2>
        <div className="steps">
          <div className="step animate-fade-in">
            <div className="step-number">01</div>
            <h3>Sign Up & Get Your Wallet</h3>
            <p>Create an account with email and password. A secure blockchain wallet is generated for you automatically.</p>
          </div>
          <div className="step animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="step-number">02</div>
            <h3>Upload & Encrypt Records</h3>
            <p>Upload your medical records. They're encrypted with AES-256 and pinned to IPFS — only you hold the keys.</p>
          </div>
          <div className="step animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="step-number">03</div>
            <h3>Grant Access to Doctors</h3>
            <p>Use smart contracts to grant (or revoke) access to specific healthcare providers with a single click.</p>
          </div>
          <div className="step animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="step-number">04</div>
            <h3>Get AI-Powered Insights</h3>
            <p>Chat with HealthAI for personalised health insights, or let doctors view AI diagnostics on their portal.</p>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-card glass-card">
          <Database size={40} className="cta-icon" />
          <h2>Ready to Own Your Health Data?</h2>
          <p>Join the decentralised healthcare revolution. Your data. Your rules. Your future.</p>
          <Link to="/register" className="btn btn-accent btn-lg">
            Get Started Now
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <HeartPulse size={20} />
            <span>MedChain AI</span>
          </div>
          <p className="footer-copy">© 2026 MedChain AI — Decentralised Healthcare Platform. Built for BCS-753.</p>
        </div>
      </footer>
    </div>
  )
}
