import { Link } from 'react-router-dom'
import { Shield, Brain, Lock, ChevronRight, Zap, Eye, HeartPulse, Database, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-[#09090b] overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] animate-breathe" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-zinc-500/[0.02] rounded-full blur-[100px] animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[-5%] w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[80px] animate-breathe" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
              <HeartPulse size={18} strokeWidth={2.5} />
            </div>
            <span>MedChain<span className="text-zinc-400 font-medium">AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">How It Works</a>
            <a href="#security" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Security</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex h-9 px-4 items-center justify-center rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="inline-flex h-9 px-5 items-center justify-center gap-2 rounded-xl text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-all duration-200 active:scale-[0.97]">
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-zinc-400 mb-8 animate-fade-in">
            <Zap size={12} className="text-white" />
            Powered by Blockchain & AI
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in">
            Your Health Data,
            <br />
            <span className="text-gradient">Your Control.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
            A decentralised healthcare platform combining AI-driven disease prediction
            and medical imaging analysis with blockchain-secured patient data ownership.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl text-base font-medium bg-white text-black hover:bg-zinc-200 transition-all duration-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-[0.97]">
              Start Free
              <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl text-base font-medium border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-all duration-200">
              Doctor Portal
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 sm:gap-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-gradient">256-bit</span>
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest">AES Encryption</span>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-gradient">IPFS</span>
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Decentralised</span>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-gradient">AI/ML</span>
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Prediction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Why <span className="text-gradient">MedChain AI</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Bridging the gap between cutting-edge AI diagnostics and patient-owned, decentralised health records.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: "Patient Data Ownership", desc: "Your medical records are encrypted and stored on IPFS. Smart contracts enforce granular access.", color: "bg-emerald-500/10 text-emerald-400" },
              { icon: Brain, title: "AI Disease Prediction", desc: "TensorFlow-powered models predict risks for diabetes, cardiovascular disease, and cancer.", color: "bg-blue-500/10 text-blue-400" },
              { icon: Eye, title: "Medical Imaging Analysis", desc: "Upload X-rays, MRIs, and CT scans for automated CNN-based analysis with annotated findings.", color: "bg-amber-500/10 text-amber-400" },
              { icon: Lock, title: "Seamless Web2 Login", desc: "No seed phrases. No wallet downloads. Blockchain wallets are managed transparently under the hood.", color: "bg-purple-500/10 text-purple-400" },
            ].map((feature, i) => (
              <div key={i} className="group glass rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1">
                <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How It <span className="text-gradient-accent">Works</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { num: "01", title: "Sign Up & Get Your Wallet", desc: "Create an account with email and password. A secure blockchain wallet is generated for you automatically." },
              { num: "02", title: "Upload & Encrypt Records", desc: "Upload your medical records. They're encrypted with AES-256 and pinned to IPFS — only you hold the keys." },
              { num: "03", title: "Grant Access to Doctors", desc: "Use smart contracts to grant (or revoke) access to specific healthcare providers with a single click." },
              { num: "04", title: "Get AI-Powered Insights", desc: "Chat with HealthAI for personalised health insights, or let doctors view AI diagnostics on their portal." },
            ].map((step, i) => (
              <div key={i} className="group flex gap-5 p-6 rounded-2xl bg-zinc-900/30 border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
                <span className="text-2xl font-bold text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0">{step.num}</span>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Enterprise-Grade <span className="text-gradient">Security</span>
                </h2>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  Every piece of data is encrypted at rest and in transit. Smart contracts enforce strict access controls, and immutable blockchain logs provide complete audit trails.
                </p>
                <div className="space-y-4">
                  {[
                    "AES-256 encryption for all medical records",
                    "IPFS decentralised storage with pinning",
                    "Smart contract access control",
                    "Immutable blockchain audit logs",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      <span className="text-sm text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 rounded-full border border-white/[0.04] animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-4 rounded-full border border-white/[0.06] animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute inset-8 rounded-full border border-white/[0.08] animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Shield size={28} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass rounded-3xl p-10 sm:p-14">
            <Database size={40} className="text-zinc-500 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Ready to Own Your Health Data?</h2>
            <p className="text-zinc-400 mb-8">Join the decentralised healthcare revolution. Your data. Your rules. Your future.</p>
            <Link to="/register" className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl text-base font-medium bg-white text-black hover:bg-zinc-200 transition-all duration-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-[0.97]">
              Get Started Now
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <HeartPulse size={18} />
            <span>MedChain AI</span>
          </div>
          <p className="text-xs text-zinc-600">© 2026 MedChain AI — Decentralised Healthcare Platform</p>
        </div>
      </footer>
    </div>
  )
}
