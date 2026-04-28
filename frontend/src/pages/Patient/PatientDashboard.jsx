import { useState, useRef, useEffect } from 'react'
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  HeartPulse, LayoutDashboard, FileText, Shield, MessageCircle,
  Image, LogOut, ChevronRight, Activity, Upload, TrendingUp, Users, Loader2,
  Brain, Search, Stethoscope, Copy, Check, AlertTriangle, Download, QrCode
} from 'lucide-react'
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant'
import useAuthStore from '../../store/useAuthStore'
import { imagingAPI, recordsAPI, accessAPI } from '../../services/api'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'

function Overview() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] || 'Patient'
  const [recordCount, setRecordCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      if (!user?.walletAddress) return
      try {
        const { data } = await recordsAPI.getRecords(user.walletAddress)
        setRecordCount(data.data.records?.length || 0)
      } catch {
        setRecordCount(0)
      }
    }
    fetchCount()
  }, [user?.walletAddress])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Good morning, <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="text-zinc-400">Here's your health overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Medical Records', value: recordCount.toString(), color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Users, label: 'Authorized Doctors', value: '0', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: TrendingUp, label: 'Overall Risk Score', value: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Image, label: 'Imaging Scans', value: '0', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="hover:border-white/[0.1] transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={18} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 hover:border-white/[0.1] transition-all duration-300">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-zinc-400" />
              Recent Activity
            </h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 mb-3">
                <Activity size={24} />
              </div>
              <p className="text-sm text-zinc-400 font-medium">No recent activity</p>
              <p className="text-xs text-zinc-600 mt-1">Upload a record or interact with HealthAI to generate insights.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 hover:border-white/[0.1] transition-all duration-300">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={16} className="text-zinc-400" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { icon: Upload, label: 'Upload Record', to: '/patient/records' },
                { icon: Shield, label: 'Manage Access', to: '/patient/access' },
                { icon: MessageCircle, label: 'Ask HealthAI', to: '/patient/chat' },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group"
                >
                  <action.icon size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                  <span className="flex-1 font-medium">{action.label}</span>
                  <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Records() {
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)
  const [records, setRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadResult, setUploadResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const fetchRecords = async () => {
    if (!user?.walletAddress) return
    setLoadingRecords(true)
    try {
      const { data } = await recordsAPI.getRecords(user.walletAddress)
      setRecords(data.data.records || [])
    } catch (err) {
      console.error('Failed to fetch records:', err)
    } finally {
      setLoadingRecords(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [user?.walletAddress])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setUploadResult(null)
    setCopied(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await recordsAPI.uploadFile(formData)
      setUploadResult(data.data)
      fetchRecords()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload record. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const copyKey = () => {
    if (uploadResult?.encryptionKey) {
      navigator.clipboard.writeText(uploadResult.encryptionKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(Number(timestamp) * 1000)
    return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Medical Records</h1>
        <p className="text-sm text-zinc-400">Encrypted records stored on IPFS. Only you and authorized doctors can access them.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button variant="default" size="sm" onClick={handleUploadClick} disabled={uploading}>
        {uploading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
        {uploading ? 'Uploading...' : 'Upload New Record'}
      </Button>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {uploadResult && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check size={18} />
              <span className="font-medium text-sm">
                {uploadResult.analysis ? 'Image uploaded & analyzed!' : 'Record uploaded successfully!'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-300">File:</span> {uploadResult.fileName}
            </p>
            {uploadResult.analysis && (
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/[0.06] space-y-2">
                <p className="text-xs font-medium text-blue-400">AI Analysis Results</p>
                <p className="text-xs text-zinc-300">
                  <span className="text-zinc-400">Findings:</span> {uploadResult.analysis.findings} detected
                </p>
                <p className="text-xs text-zinc-300">
                  <span className="text-zinc-400">Assessment:</span> {uploadResult.analysis.overallAssessment}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  The AI has also saved the full analysis as a text record. Ask HealthAI about it in chat!
                </p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-amber-400">Save this encryption key securely</span>
                <button
                  onClick={copyKey}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code className="block text-xs font-mono text-zinc-300 break-all">{uploadResult.encryptionKey}</code>
            </div>
          </CardContent>
        </Card>
      )}

      {loadingRecords ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-zinc-500 animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <Card className="hover:border-white/[0.1] transition-all duration-300">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 mb-4">
              <FileText size={28} />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No records uploaded yet</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm">Securely encrypt and upload your medical history to IPFS.</p>
            <Button variant="default" size="sm" onClick={handleUploadClick}>
              <Upload size={16} /> Upload First Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => (
            <Card key={i} className="hover:border-white/[0.1] transition-all duration-300">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    Record #{records.length - i}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono truncate">{record.ipfsHash}</p>
                  <p className="text-xs text-zinc-600">Uploaded: {formatDate(record.timestamp)}</p>
                </div>
                <Badge variant="default" className="shrink-0">IPFS</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AccessControl() {
  const { user } = useAuthStore()
  const [address, setAddress] = useState('')
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [granting, setGranting] = useState(false)
  const [revokingId, setRevokingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const { data } = await accessAPI.getDoctors()
      setDoctors(data.data.doctors || [])
    } catch (err) {
      console.error('Failed to fetch doctors:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const copyWallet = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGrant = async (e) => {
    e.preventDefault()
    if (!address.trim() || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError('Please enter a valid Ethereum wallet address (0x...).')
      return
    }

    setGranting(true)
    setError('')
    setSuccess('')

    try {
      const { data } = await accessAPI.grant(address)
      setSuccess(data.data.message)
      setAddress('')
      fetchDoctors()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to grant access. Please try again.')
    } finally {
      setGranting(false)
    }
  }

  const handleRevoke = async (doctorAddress) => {
    setRevokingId(doctorAddress)
    setError('')
    setSuccess('')

    try {
      const { data } = await accessAPI.revoke(doctorAddress)
      setSuccess(data.data.message)
      fetchDoctors()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to revoke access. Please try again.')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Access Control</h1>
        <p className="text-sm text-zinc-400">Manage which doctors can view your medical records via smart contracts.</p>
      </div>

      {/* Patient Wallet Address Card */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <QrCode size={16} />
            <span className="text-sm font-medium">Your Wallet Address</span>
          </div>
          <p className="text-xs text-zinc-400 mb-3">
            Share this address with your doctor so they can tell you their address to grant access.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-xs font-mono text-zinc-300 bg-zinc-900/50 px-3 py-2 rounded-lg border border-white/[0.06] truncate">
              {user?.walletAddress || 'Not available'}
            </code>
            <button
              onClick={copyWallet}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Grant Form */}
      <Card className="hover:border-white/[0.1] transition-all duration-300">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Grant New Access</h3>
          <form className="flex gap-3" onSubmit={handleGrant}>
            <input
              type="text"
              className="flex-1 h-11 rounded-xl border border-white/[0.08] bg-zinc-900/50 px-4 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/20 transition-all duration-200 font-mono"
              placeholder="Doctor's Ethereum Wallet Address (0x...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Button type="submit" disabled={granting || !address.trim()}>
              {granting ? <Loader2 size={16} className="animate-spin mr-1" /> : <Shield size={16} className="mr-1" />}
              Grant
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
          <Check size={18} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Doctors List */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Authorized Doctors</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-zinc-500 animate-spin" />
          </div>
        ) : doctors.length === 0 ? (
          <Card className="hover:border-white/[0.1] transition-all duration-300">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <Shield size={32} className="text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-500">No doctors currently have access to your records.</p>
              <p className="text-xs text-zinc-600 mt-2">Enter a doctor's wallet address above to grant access.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {doctors.map((doc) => (
              <Card key={doc._id} className="hover:border-white/[0.1] transition-all duration-300">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Stethoscope size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white">{doc.doctorName || 'Unknown Doctor'}</h3>
                    <p className="text-xs text-zinc-500 font-mono truncate">{doc.doctorWalletAddress}</p>
                    <p className="text-xs text-zinc-600">Granted: {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevoke(doc.doctorWalletAddress)}
                    disabled={revokingId === doc.doctorWalletAddress}
                  >
                    {revokingId === doc.doctorWalletAddress ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      'Revoke'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
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

    // Reset input so the same file can be selected again
    e.target.value = ''

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
      console.error('Imaging upload error:', err)
      const serverError = err.response?.data?.error
      const status = err.response?.status
      if (status === 400 && serverError) {
        setError(serverError)
      } else if (status === 413) {
        setError('File is too large. Maximum size is 100MB.')
      } else if (status === 500) {
        setError('Server error. Please make sure the backend is running and try again.')
      } else if (!err.response) {
        setError('Network error. Please check that the backend server is running on http://localhost:5000.')
      } else {
        setError(serverError || 'Failed to analyze image. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Medical Imaging</h1>
        <p className="text-sm text-zinc-400">Upload X-rays, MRIs, and CT scans for AI-powered diagnostic analysis via Gemini Vision.</p>
      </div>

      <div className="flex gap-2">
        {['xray', 'mri', 'ct_scan'].map((type) => (
          <Button
            key={type}
            variant={analysisType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnalysisType(type)}
          >
            {type === 'xray' ? 'X-Ray' : type === 'mri' ? 'MRI' : 'CT Scan'}
          </Button>
        ))}
      </div>

      <div
        className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 group"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 size={40} className="text-white animate-spin mb-4" />
            <h3 className="text-base font-semibold text-white mb-1">Analyzing with Gemini Vision...</h3>
            <p className="text-sm text-zinc-500">This may take a few seconds</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 group-hover:text-zinc-400 transition-colors mb-4">
              <Image size={28} />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Drop your medical image here</h3>
            <p className="text-sm text-zinc-500 mb-4">Supports JPEG, PNG, WebP · Max 100MB</p>
            <Button variant="default" size="sm" onClick={(e) => e.stopPropagation()}>
              Browse Files
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <Card className="animate-fade-in">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Analysis Result</h2>
              <p className="text-sm text-zinc-400">
                <span className="text-zinc-300">File:</span> {result.filename} · <span className="text-zinc-300">Model:</span> {result.modelUsed}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Overall Assessment</h3>
              <p className="text-sm text-zinc-400">{result.overallAssessment}</p>
            </div>

            {result.findings?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Findings</h3>
                {result.findings.map((f, i) => (
                  <Card key={i} className="bg-zinc-900/30">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white">{f.condition}</h3>
                        <p className="text-xs text-zinc-500">{f.description || f.region}</p>
                      </div>
                      <Badge variant={f.severity === 'high' || f.severity === 'critical' ? 'danger' : f.severity === 'moderate' ? 'warning' : 'default'}>
                        {Math.round(f.probability * 100)}% · {f.severity}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {result.recommendations && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Recommendations</h3>
                <p className="text-sm text-zinc-400">{result.recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>
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

  const navItems = [
    { to: '/patient', end: true, icon: LayoutDashboard, label: 'Overview' },
    { to: '/patient/records', icon: FileText, label: 'Records' },
    { to: '/patient/access', icon: Shield, label: 'Access Control' },
    { to: '/patient/chat', icon: MessageCircle, label: 'HealthAI Chat' },
    { to: '/patient/imaging', icon: Image, label: 'Imaging' },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Sidebar */}
      <aside className="w-64 fixed top-0 left-0 bottom-0 z-50 bg-[#0c0c10] border-r border-white/[0.04] flex flex-col">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
            <HeartPulse size={16} strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold tracking-tight">MedChain<span className="text-zinc-500 font-medium">AI</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.04]">
          {user && (
            <div className="px-3 py-2 mb-3">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-zinc-600 font-mono">
                {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
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
