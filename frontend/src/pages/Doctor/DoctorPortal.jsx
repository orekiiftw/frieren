import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import {
  HeartPulse, LayoutDashboard, Users, Brain, Image,
  LogOut, Stethoscope, FileText, Activity, Search
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import '../Patient/Dashboard.css'
import './Doctor.css'

function DoctorOverview() {
  const { user } = useAuthStore()
  const displayName = user?.name || 'Doctor'

  return (
    <div className="dash-overview animate-fade-in">
      <div className="dash-greeting">
        <h1>Welcome, <span className="text-gradient">{displayName}</span> 🩺</h1>
        <p>Your clinical dashboard at a glance.</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-muted)' }}>
            <Users size={20} color="var(--color-primary-hover)" />
          </div>
          <div className="stat-info">
            <span className="stat-value">24</span>
            <span className="stat-label">Active Patients</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'var(--color-accent-muted)' }}>
            <Brain size={20} color="var(--color-accent)" />
          </div>
          <div className="stat-info">
            <span className="stat-value">8</span>
            <span className="stat-label">AI Predictions Today</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
            <Image size={20} color="var(--color-warning)" />
          </div>
          <div className="stat-info">
            <span className="stat-value">5</span>
            <span className="stat-label">Scans Pending Review</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
            <Activity size={20} color="var(--color-info)" />
          </div>
          <div className="stat-info">
            <span className="stat-value">97%</span>
            <span className="stat-label">Diagnostics Accuracy</span>
          </div>
        </div>
      </div>

      <div className="dash-section glass-card">
        <h2><Activity size={18} /> Recent Patient Activity</h2>
        <div className="activity-list empty-state">
          <div className="empty-state-icon">
            <Activity size={32} />
          </div>
          <p>No recent activity detected.</p>
        </div>
      </div>
    </div>
  )
}

function PatientList() {
  const [search, setSearch] = useState('')
  const patients = [] // Empty for now

  return (
    <div className="page-section animate-fade-in">
      <h1>Authorized Patients</h1>
      <p className="page-desc">Patients who have granted you smart-contract access to their records.</p>

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          className="input-field"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {patients.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)', marginTop: 'var(--space-md)' }}>
          <div className="empty-state-icon">
            <Users size={40} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>No active patients</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't been granted access to any patient records yet.</p>
        </div>
      ) : (
        <div className="patient-list">
          {/* Patient rows would go here */}
        </div>
      )}
    </div>
  )
}

function AIDiagnostics() {
  return (
    <div className="page-section animate-fade-in">
      <h1>AI Diagnostics Dashboard</h1>
      <p className="page-desc">View ML-driven disease predictions and medical imaging analysis for your patients.</p>

      <div className="diagnostics-grid">
        <div className="diagnostic-card glass-card">
          <div className="diagnostic-header">
            <h3>Diabetes Risk Prediction</h3>
            <span className="badge badge-accent">Active</span>
          </div>
          <p>Uses patient vitals, blood glucose, BMI, and family history to predict Type 2 diabetes risk.</p>
          <div className="diagnostic-meta">
            <span>Model: Gemini 2.0 Flash</span>
            <span>AI-powered analysis</span>
          </div>
        </div>
        <div className="diagnostic-card glass-card">
          <div className="diagnostic-header">
            <h3>Cardiovascular Risk</h3>
            <span className="badge badge-accent">Active</span>
          </div>
          <p>Analyzes blood pressure, cholesterol, ECG data, and lifestyle factors for heart disease prediction.</p>
          <div className="diagnostic-meta">
            <span>Model: Gemini 2.0 Flash</span>
            <span>AI-powered analysis</span>
          </div>
        </div>
        <div className="diagnostic-card glass-card">
          <div className="diagnostic-header">
            <h3>Cancer Risk Assessment</h3>
            <span className="badge badge-warning">Beta</span>
          </div>
          <p>Multi-factor risk analysis using genetic markers, imaging data, and patient history.</p>
          <div className="diagnostic-meta">
            <span>Model: Gemini 2.0 Flash Vision</span>
            <span>Multimodal analysis</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImagingReview() {
  return (
    <div className="page-section animate-fade-in">
      <h1>Imaging Analysis Review</h1>
      <p className="page-desc">Review CNN-analyzed medical images (X-rays, MRI, CT scans) with annotated findings.</p>

      <div className="empty-state glass-card" style={{ padding: 'var(--space-3xl)' }}>
        <div className="empty-state-icon">
          <Image size={40} />
        </div>
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>No pending scans</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Imaging analysis from your authorized patients will appear here.</p>
      </div>
    </div>
  )
}

export default function DoctorPortal() {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar sidebar-doctor">
        <div className="sidebar-header">
          <HeartPulse size={24} />
          <span className="sidebar-title">MedChain<span className="logo-ai">AI</span></span>
        </div>

        <div className="sidebar-role-badge">
          <Stethoscope size={14} />
          Doctor Portal
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/doctor" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          <NavLink to="/doctor/patients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} /> Patients
          </NavLink>
          <NavLink to="/doctor/diagnostics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Brain size={18} /> AI Diagnostics
          </NavLink>
          <NavLink to="/doctor/imaging" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Image size={18} /> Imaging Review
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

      <main className="dashboard-main">
        <Routes>
          <Route index element={<DoctorOverview />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="diagnostics" element={<AIDiagnostics />} />
          <Route path="imaging" element={<ImagingReview />} />
        </Routes>
      </main>
    </div>
  )
}
