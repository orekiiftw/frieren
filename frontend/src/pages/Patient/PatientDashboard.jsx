import { useState, useRef } from 'react'
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  HeartPulse, LayoutDashboard, FileText, Shield, MessageCircle,
  Image, LogOut, ChevronRight, Activity, Upload, TrendingUp, Users, Loader2
} from 'lucide-react'
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant'
import useAuthStore from '../../store/useAuthStore'
import { imagingAPI } from '../../services/api'
import './Dashboard.css'

function Overview() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] || 'Patient'

  return (
    <div className="dash-overview animate-fade-in">
      <div className="dash-greeting">
        <h1>Good morning, <span className="text-gradient">{firstName}</span> 👋</h1>
        <p>Here's your health overview for today.</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)' }}>
            <FileText size={20} color="var(--color-primary-hover)" />
          </div>
          <div className="stat-info">
            <span className="stat-value">0</span>
            <span className="stat-label">Medical Records</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'var(--color-accent-muted)' }}>
            <Users size={20} color="var(--color-accent)" />
          </div>
          <div className="stat-info">
            <span className="stat-value">0</span>
            <span className="stat-label">Authorized Doctors</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
            <TrendingUp size={20} color="var(--color-warning)" />
          </div>
          <div className="stat-info">
            <span className="stat-value">Pending</span>
            <span className="stat-label">Overall Risk Score</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
            <Image size={20} color="var(--color-info)" />
          </div>
          <div className="stat-info">
            <span className="stat-value">0</span>
            <span className="stat-label">Imaging Scans</span>
          </div>
        </div>
      </div>

      <div className="dash-sections">
        <div className="dash-section glass-card">
          <h2><Activity size={18} /> Recent Activity</h2>
          <div className="activity-list empty-state">
            <div className="empty-state-icon">
              <Activity size={32} />
            </div>
            <p>No recent activity</p>
            <span>Upload a record or interact with HealthAI to generate insights.</span>
          </div>
        </div>

        <div className="dash-section glass-card">
          <h2><Shield size={18} /> Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/patient/records" className="quick-action-btn">
              <Upload size={18} />
              Upload Record
              <ChevronRight size={14} />
            </Link>
            <Link to="/patient/access" className="quick-action-btn">
              <Shield size={18} />
              Manage Access
              <ChevronRight size={14} />
            </Link>
            <Link to="/patient/chat" className="quick-action-btn">
              <MessageCircle size={18} />
              Ask HealthAI
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Records() {
  return (
    <div className="page-section animate-fade-in">
      <h1>Medical Records</h1>
      <p className="page-desc">Encrypted records stored on IPFS. Only you and authorized doctors can access them.</p>
      <button className="btn btn-primary"><Upload size={16} /> Upload New Record</button>
      <div className="records-list empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
        <div className="empty-state-icon">
          <FileText size={48} />
        </div>
        <h3 style={{ marginTop: 'var(--space-md)' }}>No records uploaded yet</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          Securely encrypt and upload your medical history to IPFS.
        </p>
        <button className="btn btn-primary">
          <Upload size={16} /> 
          Upload First Record
        </button>
      </div>
    </div>
  )
}

function AccessControl() {
  const [address, setAddress] = useState('')
  const [doctors, setDoctors] = useState([])

  const handleGrant = (e) => {
    e.preventDefault()
    if (!address.trim() || address.length < 40) return
    setDoctors([...doctors, { address, hasAccess: true, grantedAt: new Date().toLocaleDateString() }])
    setAddress('')
  }

  const handleRevoke = (index) => {
    setDoctors(doctors.filter((_, i) => i !== index))
  }

  return (
    <div className="page-section animate-fade-in">
      <h1>Access Control</h1>
      <p className="page-desc">Manage which doctors can view your medical records via smart contracts.</p>

      <div className="access-grant-card glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>Grant New Access</h3>
        <form className="access-form" onSubmit={handleGrant} style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <input 
            type="text" 
            className="input-field" 
            style={{ flex: 1 }}
            placeholder="Doctor's Ethereum Wallet Address (0x...)" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={!address.trim()}>
            <Shield size={16} /> Grant Access
          </button>
        </form>
      </div>

      <h2>Authorized Doctors</h2>
      {doctors.length === 0 ? (
         <div className="empty-state glass-card" style={{ padding: 'var(--space-2xl)', marginTop: 'var(--space-md)' }}>
            <Shield size={40} className="text-muted" style={{ marginBottom: 'var(--space-sm)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No doctors currently have access to your records.</p>
         </div>
      ) : (
        <div className="access-list">
          {doctors.map((doc, i) => (
            <div key={i} className="access-item glass-card">
              <div className="access-info">
                <h3>Doctor Wallet</h3>
                <p className="wallet-address">{doc.address}</p>
              </div>
              <span className="badge badge-primary" style={{ marginRight: 'var(--space-lg)' }}>
                Granted: {doc.grantedAt}
              </span>
              <button 
                onClick={() => handleRevoke(i)}
                className="btn btn-danger btn-sm"
              >
                Revoke Access
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ImagingPage() {
  const fileInputRef = useRef(null)
  const [analysisType, setAnalysisType] = useState('xray')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('analysisType', analysisType)

      const { data } = await imagingAPI.analyze(formData)
      setResult(data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page-section animate-fade-in">
      <h1>Medical Imaging</h1>
      <p className="page-desc">Upload X-rays, MRIs, and CT scans for AI-powered diagnostic analysis via Gemini Vision.</p>

      <div className="imaging-type-selector">
        {['xray', 'mri', 'ct_scan'].map((type) => (
          <button
            key={type}
            className={`btn ${analysisType === type ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setAnalysisType(type)}
          >
            {type === 'xray' ? 'X-Ray' : type === 'mri' ? 'MRI' : 'CT Scan'}
          </button>
        ))}
      </div>

      <div
        className="upload-zone glass-card"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 size={40} className="spin-icon" />
            <h3>Analyzing with Gemini Vision...</h3>
            <p>This may take a few seconds</p>
          </>
        ) : (
          <>
            <Image size={40} color="var(--text-muted)" />
            <h3>Drop your medical image here</h3>
            <p>Supports JPEG, PNG, WebP · Max 100MB</p>
            <button className="btn btn-primary" onClick={(e) => e.stopPropagation()}>Browse Files</button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div className="auth-error" style={{ marginTop: 'var(--space-md)' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="imaging-result glass-card animate-fade-in" style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-xl)' }}>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>🔬 Analysis Result</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            <strong>File:</strong> {result.filename} · <strong>Model:</strong> {result.modelUsed}
          </p>

          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Overall Assessment</h3>
          <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
            {result.overallAssessment}
          </p>

          {result.findings?.length > 0 && (
            <>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>Findings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {result.findings.map((f, i) => (
                  <div key={i} className="record-item glass-card">
                    <div className="record-info">
                      <h3>{f.condition}</h3>
                      <p>{f.description || f.region}</p>
                    </div>
                    <span className={`badge ${
                      f.severity === 'high' || f.severity === 'critical' ? 'badge-danger' :
                      f.severity === 'moderate' ? 'badge-warning' : 'badge-accent'
                    }`}>
                      {Math.round(f.probability * 100)}% · {f.severity}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {result.recommendations && (
            <>
              <h3 style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>Recommendations</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{result.recommendations}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <HeartPulse size={24} />
          <span className="sidebar-title">MedChain<span className="logo-ai">AI</span></span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/patient" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          <NavLink to="/patient/records" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> Records
          </NavLink>
          <NavLink to="/patient/access" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Shield size={18} /> Access Control
          </NavLink>
          <NavLink to="/patient/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageCircle size={18} /> HealthAI Chat
          </NavLink>
          <NavLink to="/patient/imaging" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Image size={18} /> Imaging
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-wallet">{user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}</span>
            </div>
          )}
          <button onClick={handleLogout} className="nav-link logout">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="records" element={<Records />} />
          <Route path="access" element={<AccessControl />} />
          <Route path="chat" element={<ChatAssistant />} />
          <Route path="imaging" element={<ImagingPage />} />
        </Routes>
      </main>
    </div>
  )
}
