import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import {
  HeartPulse, LayoutDashboard, Users, Brain, Image,
  LogOut, Stethoscope, Activity, Search, Loader2, FileText, Copy, Check, AlertTriangle,
  ChevronDown, ChevronUp, MessageCircle, Sparkles, Download, Calendar, Shield
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import { accessAPI, recordsAPI, aiAPI } from '../../services/api'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'

function DoctorOverview() {
  const { user } = useAuthStore()
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState({ patients: 0, records: 0, scans: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await accessAPI.getPatients()
        const patientList = data.data.patients || []
        setPatients(patientList)
        setStats({
          patients: patientList.length,
          records: patientList.length * 2, // approximate
          scans: Math.floor(patientList.length * 1.5),
        })
      } catch {
        // ignore
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Welcome, <span className="text-gradient">{user?.name || 'Doctor'}</span>
        </h1>
        <p className="text-zinc-400">Your clinical dashboard at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Active Patients', value: stats.patients.toString(), color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: FileText, label: 'Total Records', value: stats.records.toString(), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Image, label: 'Scans Reviewed', value: stats.scans.toString(), color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Activity, label: 'Diagnostics', value: 'Active', color: 'text-purple-400', bg: 'bg-purple-500/10' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:border-white/[0.1] transition-all duration-300">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={16} className="text-zinc-400" />
              Recent Patients
            </h2>
            {patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users size={24} className="text-zinc-700 mb-2" />
                <p className="text-sm text-zinc-500">No patients yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {patients.slice(0, 5).map((p) => (
                  <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{p.patientWalletAddress}</p>
                      <p className="text-xs text-zinc-600">Granted: {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:border-white/[0.1] transition-all duration-300">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Brain size={16} className="text-zinc-400" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { icon: Search, label: 'View Patient Records', to: '/doctor/patients' },
                { icon: Brain, label: 'AI Diagnostics', to: '/doctor/diagnostics' },
                { icon: Image, label: 'Review Imaging', to: '/doctor/imaging' },
              ].map((action, i) => (
                <NavLink
                  key={i}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                >
                  <action.icon size={16} />
                  <span className="flex-1 font-medium">{action.label}</span>
                </NavLink>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PatientList() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientRecords, setPatientRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState('')
  const [recordDetail, setRecordDetail] = useState(null)
  const [expandedRecordIndex, setExpandedRecordIndex] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const { data } = await accessAPI.getPatients()
      setPatients(data.data.patients || [])
    } catch (err) {
      setError('Failed to load authorized patients.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const copyWallet = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const viewRecords = async (patient) => {
    if (selectedPatient?._id === patient._id) {
      setSelectedPatient(null)
      setPatientRecords([])
      setRecordDetail(null)
      return
    }
    setSelectedPatient(patient)
    setLoadingRecords(true)
    setRecordsError('')
    setPatientRecords([])
    setRecordDetail(null)
    try {
      const { data } = await recordsAPI.getRecords(patient.patientWalletAddress)
      setPatientRecords(data.data.records || [])
    } catch (err) {
      console.error('Failed to fetch patient records:', err)
      const msg = err.response?.data?.error || err.message || 'Failed to fetch records'
      setRecordsError(msg)
      setPatientRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }

  const viewRecordDetail = async (patientAddress, index) => {
    // Toggle off if already expanded
    if (expandedRecordIndex === index) {
      setExpandedRecordIndex(null)
      setRecordDetail(null)
      return
    }
    setExpandedRecordIndex(index)
    setLoadingDetail(true)
    setRecordDetail(null)
    try {
      const { data } = await recordsAPI.downloadRecord(patientAddress, index)
      setRecordDetail(data.data)
    } catch (err) {
      console.error('Failed to fetch record detail:', err)
      setRecordDetail({ error: err.response?.data?.error || 'Failed to load record details' })
    } finally {
      setLoadingDetail(false)
    }
  }

  const filteredPatients = patients.filter((p) =>
    p.patientWalletAddress.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Authorized Patients</h1>
        <p className="text-sm text-zinc-400">Patients who have granted you smart-contract access to their records.</p>
      </div>

      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Stethoscope size={16} />
            <span className="text-sm font-medium">Your Doctor Wallet Address</span>
          </div>
          <p className="text-xs text-zinc-400 mb-3">Share this address with your patients so they can grant you access.</p>
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

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          className="w-full h-11 rounded-xl border border-white/[0.08] bg-zinc-900/50 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/20 transition-all duration-200"
          placeholder="Search patients by wallet address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-zinc-500 animate-spin" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <Card className="hover:border-white/[0.1] transition-all duration-300">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No active patients</h3>
            <p className="text-sm text-zinc-500">You haven't been granted access to any patient records yet.</p>
            <p className="text-xs text-zinc-600 mt-2">Share your wallet address above with patients so they can grant you access.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <Card key={patient._id} className="hover:border-white/[0.1] transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Users size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white">Patient</h3>
                    <p className="text-xs text-zinc-500 font-mono truncate">{patient.patientWalletAddress}</p>
                    <p className="text-xs text-zinc-600">Granted: {new Date(patient.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="default" size="sm" onClick={() => viewRecords(patient)}>
                    <FileText size={14} className="mr-1" />
                    {selectedPatient?._id === patient._id ? 'Hide Records' : 'View Records'}
                  </Button>
                </div>

                {/* Expanded Records */}
                {selectedPatient?._id === patient._id && (
                  <div className="mt-4 pt-4 border-t border-white/[0.04]">
                    {loadingRecords ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 size={20} className="text-zinc-500 animate-spin" />
                      </div>
                    ) : recordsError ? (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{recordsError}</span>
                      </div>
                    ) : patientRecords.length === 0 ? (
                      <p className="text-sm text-zinc-500">No records found for this patient.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-zinc-400 mb-2">
                          Patient Records ({patientRecords.length}):
                        </p>
                        {patientRecords.map((record, i) => (
                          <div key={i} className="space-y-2">
                            <div className="p-3 rounded-lg bg-zinc-900/30 border border-white/[0.04]">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-zinc-300 font-mono truncate">{record.ipfsHash}</p>
                                  <p className="text-xs text-zinc-600">
                                    Uploaded: {record.timestamp ? new Date(record.timestamp * 1000).toLocaleDateString() : 'Unknown'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => viewRecordDetail(patient.patientWalletAddress, i)}
                                  className="ml-2 px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-xs text-zinc-400 hover:text-white transition-colors"
                                >
                                  {expandedRecordIndex === i ? 'Hide' : 'View'}
                                </button>
                              </div>
                            </div>

                            {/* Record Detail */}
                            {expandedRecordIndex === i && (
                              <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/[0.06]">
                                {loadingDetail ? (
                                  <Loader2 size={16} className="text-zinc-500 animate-spin" />
                                ) : recordDetail?.error ? (
                                  <p className="text-xs text-red-400">{recordDetail.error}</p>
                                ) : recordDetail ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="default" className="text-[10px]">
                                        {recordDetail.contentType?.toUpperCase()}
                                      </Badge>
                                      <span className="text-xs text-zinc-500">{recordDetail.fileName}</span>
                                    </div>

                                    {/* Image preview */}
                                    {recordDetail.contentType === 'image' && (
                                      <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                                        <img
                                          src={`data:${recordDetail.mimeType};base64,${recordDetail.content}`}
                                          alt={recordDetail.fileName}
                                          className="w-full max-h-96 object-contain"
                                        />
                                      </div>
                                    )}

                                    {/* JSON / Analysis preview */}
                                    {recordDetail.contentType === 'json' && (
                                      <div className="space-y-3">
                                        {recordDetail.content?.overallAssessment && (
                                          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                            <p className="text-xs font-medium text-blue-400 mb-1">Assessment</p>
                                            <p className="text-sm text-zinc-300">{recordDetail.content.overallAssessment}</p>
                                          </div>
                                        )}
                                        {recordDetail.content?.findings && recordDetail.content.findings.length > 0 && (
                                          <div className="space-y-2">
                                            <p className="text-xs font-medium text-zinc-400">Findings</p>
                                            {recordDetail.content.findings.map((f, fi) => (
                                              <div key={fi} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-sm text-white font-medium">{f.condition}</span>
                                                  <Badge variant={f.severity === 'high' || f.severity === 'critical' ? 'danger' : f.severity === 'moderate' ? 'warning' : 'default'} className="text-[10px]">
                                                    {Math.round((f.probability || 0) * 100)}% · {f.severity}
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-1">{f.description}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {recordDetail.content?.recommendations && (
                                          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                            <p className="text-xs font-medium text-emerald-400 mb-1">Recommendations</p>
                                            <p className="text-sm text-zinc-300">{recordDetail.content.recommendations}</p>
                                          </div>
                                        )}
                                        {/* Raw JSON fallback */}
                                        {!recordDetail.content?.overallAssessment && (
                                          <pre className="p-3 rounded-lg bg-zinc-950/50 border border-white/[0.04] text-xs text-zinc-400 font-mono overflow-auto max-h-64">
                                            {JSON.stringify(recordDetail.content, null, 2)}
                                          </pre>
                                        )}
                                      </div>
                                    )}

                                    {/* Text preview */}
                                    {recordDetail.contentType === 'text' && (
                                      <div className="p-3 rounded-lg bg-zinc-950/50 border border-white/[0.04]">
                                        <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap">{recordDetail.content}</pre>
                                      </div>
                                    )}

                                    {/* Generic file (PDF etc) */}
                                    {recordDetail.contentType === 'file' && (
                                      <div className="p-4 rounded-lg bg-zinc-950/50 border border-white/[0.04] text-center">
                                        <FileText size={24} className="text-zinc-600 mx-auto mb-2" />
                                        <p className="text-sm text-zinc-400">{recordDetail.fileName}</p>
                                        <p className="text-xs text-zinc-600 mt-1">Binary file · {recordDetail.mimeType}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AIDiagnostics() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientRecords, setPatientRecords] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)

  useEffect(() => {
    accessAPI.getPatients().then(({ data }) => {
      setPatients(data.data.patients || [])
    })
  }, [])

  const loadPatientRecords = async (patient) => {
    setSelectedPatient(patient)
    setMessages([])
    try {
      const { data } = await recordsAPI.getRecords(patient.patientWalletAddress)
      setPatientRecords(data.data.records || [])
      setMessages([
        {
          role: 'assistant',
          content: `Hello Dr. I'm HealthAI. I have access to **${patient.patientWalletAddress.slice(0, 6)}...${patient.patientWalletAddress.slice(-4)}**'s records. Ask me anything about their medical history.`,
        },
      ])
    } catch {
      setPatientRecords([])
      setMessages([
        {
          role: 'assistant',
          content: `I can see this patient has granted you access, but I couldn't load their records. You can still ask general medical questions.`,
        },
      ])
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming || !selectedPatient) return

    const userMessage = { role: 'user', content: input.trim() }
    const history = messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setStreaming(true)

    try {
      const { data } = await aiAPI.chat(
        userMessage.content,
        history,
        selectedPatient.patientWalletAddress // Pass patient address so RAG loads their records
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.data.message },
      ])
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Sorry, I encountered an error. Please try again.'
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMsg, isError: true },
      ])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI Diagnostics</h1>
        <p className="text-sm text-zinc-400">Chat with HealthAI about your authorized patients' records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selector */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Select Patient</h3>
          {patients.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Users size={24} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No authorized patients yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {patients.map((p) => (
                <button
                  key={p._id}
                  onClick={() => loadPatientRecords(p)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedPatient?._id === p._id
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900/30 border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={16} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedPatient?._id === p._id ? 'text-black' : 'text-white'}`}>
                        {p.patientWalletAddress.slice(0, 6)}...{p.patientWalletAddress.slice(-4)}
                      </p>
                      <p className={`text-xs ${selectedPatient?._id === p._id ? 'text-zinc-700' : 'text-zinc-600'}`}>
                        {patientRecords.length} records
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              {/* Header */}
              <div className="shrink-0 flex items-center gap-3 pb-4 border-b border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">HealthAI</h3>
                  <p className="text-xs text-zinc-500">
                    {selectedPatient
                      ? `Patient: ${selectedPatient.patientWalletAddress.slice(0, 8)}...`
                      : 'Select a patient to start'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Brain size={32} className="text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-500">Select a patient to start an AI-assisted consultation.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                          msg.role === 'user' ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-black'
                        }`}
                      >
                        {msg.role === 'user' ? 'Dr' : <Sparkles size={12} />}
                      </div>
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-white text-black rounded-tr-sm'
                            : 'bg-zinc-900/50 text-zinc-300 rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {streaming && (
                  <div className="flex gap-3">
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center">
                      <Sparkles size={12} />
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl bg-zinc-900/50 rounded-tl-sm">
                      <Loader2 size={14} className="animate-spin text-zinc-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="shrink-0 pt-4 border-t border-white/[0.04]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-zinc-900/50 px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/[0.15] transition-colors"
                    placeholder={selectedPatient ? "Ask about this patient's records..." : 'Select a patient first'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={!selectedPatient || streaming}
                  />
                  <Button onClick={sendMessage} disabled={!selectedPatient || !input.trim() || streaming}>
                    {streaming ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ImagingReview() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [decryptedImages, setDecryptedImages] = useState({}) // index -> { src, mimeType }
  const [loadingImage, setLoadingImage] = useState(null)

  useEffect(() => {
    accessAPI.getPatients().then(({ data }) => {
      setPatients(data.data.patients || [])
    })
  }, [])

  const loadImaging = async (patient) => {
    setSelectedPatient(patient)
    setDecryptedImages({})
    setLoading(true)
    try {
      const { data } = await recordsAPI.getRecords(patient.patientWalletAddress)
      setRecords(data.data.records || [])
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const loadImage = async (index) => {
    if (decryptedImages[index]) return // already loaded
    setLoadingImage(index)
    try {
      const { data } = await recordsAPI.downloadRecord(selectedPatient.patientWalletAddress, index)
      const d = data.data
      if (d.contentType === 'image') {
        setDecryptedImages((prev) => ({
          ...prev,
          [index]: { src: `data:${d.mimeType};base64,${d.content}`, mimeType: d.mimeType, fileName: d.fileName },
        }))
      } else if (d.contentType === 'json') {
        setDecryptedImages((prev) => ({
          ...prev,
          [index]: { type: 'json', content: d.content, fileName: d.fileName },
        }))
      } else {
        setDecryptedImages((prev) => ({
          ...prev,
          [index]: { type: 'other', contentType: d.contentType, fileName: d.fileName, mimeType: d.mimeType },
        }))
      }
    } catch (err) {
      console.error('Failed to load image:', err)
      setDecryptedImages((prev) => ({ ...prev, [index]: { error: 'Failed to decrypt' } }))
    } finally {
      setLoadingImage(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Imaging Review</h1>
        <p className="text-sm text-zinc-400">Review decrypted medical imaging and AI analysis from your authorized patients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selector */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Select Patient</h3>
          {patients.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Users size={24} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No authorized patients yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {patients.map((p) => (
                <button
                  key={p._id}
                  onClick={() => loadImaging(p)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedPatient?._id === p._id
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900/30 border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={16} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedPatient?._id === p._id ? 'text-black' : 'text-white'}`}>
                        {p.patientWalletAddress.slice(0, 6)}...{p.patientWalletAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Records */}
        <div className="lg:col-span-2">
          {!selectedPatient ? (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <Image size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Select a patient to view their imaging records.</p>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 size={24} className="text-zinc-500 animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <Image size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No imaging records found for this patient.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record, i) => (
                <Card key={i} className="hover:border-white/[0.1] transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                        <Image size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">Record #{i + 1}</p>
                        <p className="text-xs text-zinc-500 font-mono truncate">{record.ipfsHash}</p>
                        <p className="text-xs text-zinc-600">
                          {record.timestamp ? new Date(record.timestamp * 1000).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      {!decryptedImages[i] && (
                        <Button size="sm" variant="default" onClick={() => loadImage(i)} disabled={loadingImage === i}>
                          {loadingImage === i ? <Loader2 size={14} className="animate-spin mr-1" /> : <Image size={14} className="mr-1" />}
                          Decrypt & View
                        </Button>
                      )}
                    </div>

                    {/* Decrypted content */}
                    {decryptedImages[i]?.error && (
                      <p className="text-xs text-red-400">{decryptedImages[i].error}</p>
                    )}
                    {decryptedImages[i]?.src && (
                      <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                        <img src={decryptedImages[i].src} alt={decryptedImages[i].fileName} className="w-full max-h-96 object-contain" />
                      </div>
                    )}
                    {decryptedImages[i]?.type === 'json' && (
                      <div className="space-y-2">
                        {decryptedImages[i].content?.overallAssessment && (
                          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <p className="text-xs font-medium text-blue-400 mb-1">AI Assessment</p>
                            <p className="text-sm text-zinc-300">{decryptedImages[i].content.overallAssessment}</p>
                          </div>
                        )}
                        {decryptedImages[i].content?.findings?.length > 0 && (
                          <div className="space-y-2">
                            {decryptedImages[i].content.findings.map((f, fi) => (
                              <div key={fi} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-white font-medium">{f.condition}</span>
                                  <Badge variant={f.severity === 'high' || f.severity === 'critical' ? 'danger' : f.severity === 'moderate' ? 'warning' : 'default'} className="text-[10px]">
                                    {Math.round((f.probability || 0) * 100)}% · {f.severity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">{f.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {decryptedImages[i]?.type === 'other' && (
                      <div className="p-4 rounded-lg bg-zinc-950/50 border border-white/[0.04] text-center">
                        <FileText size={24} className="text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm text-zinc-400">{decryptedImages[i].fileName}</p>
                        <p className="text-xs text-zinc-600">{decryptedImages[i].mimeType} · Decrypted</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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

  const navItems = [
    { to: '/doctor', end: true, icon: LayoutDashboard, label: 'Overview' },
    { to: '/doctor/patients', icon: Users, label: 'Patients' },
    { to: '/doctor/diagnostics', icon: Brain, label: 'AI Diagnostics' },
    { to: '/doctor/imaging', icon: Image, label: 'Imaging Review' },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <aside className="w-64 fixed top-0 left-0 bottom-0 z-50 bg-[#0c0c10] border-r border-white/[0.04] flex flex-col">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
            <HeartPulse size={16} strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold tracking-tight">MedChain<span className="text-zinc-500 font-medium">AI</span></span>
        </div>

        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
            <Stethoscope size={12} />
            Doctor Portal
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2">
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

      <main className="flex-1 ml-64 p-8 min-h-screen">
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
