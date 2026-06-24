'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  Users,
  Star,
  ChevronRight,
  Calendar,
  Award,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  CheckCircle2,
  PlayCircle,
  Clock,
  Flame,
  TrendingUp,
  FileText,
  MessageSquare,
  Sparkles,
  LayoutDashboard,
  Settings,
  HelpCircle,
  BookMarked,
  Plus
} from 'lucide-react';

import { cn } from '@/lib/utils';

// Interfaces for data state
interface Notification {
  id: number;
  title: string;
  time: string;
  isRead: boolean;
  category: 'kelas' | 'tugas' | 'sistem';
}

interface Course {
  id: string;
  title: string;
  mentor: string;
  progress: number;
  totalChapters: number;
  nextClass: string;
  nextClassTime: string;
  image: string;
  category: string;
}

export default function PendidikanMasterPage() {
  // Navigation View State: 'login', 'register', 'forgot-password', 'dashboard'
  const [view, setView] = useState<'login' | 'register' | 'forgot-password' | 'dashboard'>('login');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'siswa' | 'guru'>('siswa');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'siswa' | 'guru'>('siswa');
  const [regAgree, setRegAgree] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Simulated Logged In User
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: 'siswa' | 'guru';
    avatar: string;
    streak: number;
    hoursLearned: number;
    completedAssignments: number;
  } | null>(null);

  // Dashboard Active Tab: 'overview', 'courses', 'schedule', 'grades', 'assistant'
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'courses' | 'schedule' | 'assistant'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Interaction States for Dashboard
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Kelas UI/UX Design Baru dimulai 15 menit lagi', time: '5m', isRead: false, category: 'kelas' },
    { id: 2, title: 'Tugas Aljabar Linear telah dinilai dengan nilai A+', time: '2j', isRead: false, category: 'tugas' },
    { id: 3, title: 'Pemberitahuan: Pemeliharaan sistem terjadwal pukul 23:00', time: '1h', isRead: true, category: 'sistem' },
  ]);

  // Enrolled Courses Status
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'c1',
      title: 'UI/UX Design Masterclass 2026',
      mentor: 'Rian Wijaya (Principal Designer)',
      progress: 68,
      totalChapters: 12,
      nextClass: 'Prinsip Keterbacaan & Hierarki Visual',
      nextClassTime: 'Hari ini, 10:00 WIB',
      image: 'https://picsum.photos/seed/uiux/400/250',
      category: 'Desain',
    },
    {
      id: 'c2',
      title: 'Fullstack Next.js & TypeScript Modern',
      mentor: 'Ahmad Faisal (Senior Dev)',
      progress: 45,
      totalChapters: 18,
      nextClass: 'Integrasi Database Serverless & ORM',
      nextClassTime: 'Besok, 13:00 WIB',
      image: 'https://picsum.photos/seed/coding/400/250',
      category: 'Teknologi',
    },
    {
      id: 'c3',
      title: 'Kalkulus Lanjut & Matematika Komputasi',
      mentor: 'Dr. Indah Lestari (Dosen Matematika)',
      progress: 82,
      totalChapters: 10,
      nextClass: 'Aplikasi Turunan Parsial dalam ML',
      nextClassTime: 'Kamis, 09:00 WIB',
      image: 'https://picsum.photos/seed/math/400/250',
      category: 'Sains',
    },
    {
      id: 'c4',
      title: 'Bahasa Inggris Bisnis & Presentasi Profesional',
      mentor: 'Ms. Sarah Connor (Native Educator)',
      progress: 20,
      totalChapters: 8,
      nextClass: 'Pitching Ide Bisnis & Negosiasi',
      nextClassTime: 'Jumat, 15:30 WIB',
      image: 'https://picsum.photos/seed/english/400/250',
      category: 'Bahasa',
    },
  ]);

  // Interactive Live Class Simulation State
  const [isLiveClassRunning, setIsLiveClassRunning] = useState(false);
  const [liveChat, setLiveChat] = useState<{ sender: string; msg: string; time: string }[]>([
    { sender: 'Sistem', msg: 'Selamat datang di Ruang Belajar Mandiri PendidikanMaster!', time: '10:00' },
    { sender: 'Rian (Mentor)', msg: 'Halo semuanya! Hari ini kita akan membahas tentang responsive layout.', time: '10:01' },
    { sender: 'Siswa1', msg: 'Selamat pagi pak Rian, tidak sabar memulai kelas.', time: '10:02' },
  ]);
  const [chatMessage, setChatMessage] = useState('');

  // AI Assistant Chat state (Simulated on Client Side)
  const [aiChat, setAiChat] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya Asisten Belajar AI PendidikanMaster. Apa yang ingin kamu pelajari hari ini? Saya bisa membantumu menjelaskan topik rumit, membuat ringkasan, atau mempersiapkan ujian.',
      time: '08:00'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Quick Action Study Notes state
  const [quickNotes, setQuickNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pm_notes') || 'Tulis catatan harian belajarmu di sini agar tidak terlupa...';
    }
    return 'Tulis catatan harian belajarmu di sini agar tidak terlupa...';
  });

  // Save notes locally on edit
  useEffect(() => {
    localStorage.setItem('pm_notes', quickNotes);
  }, [quickNotes]);

  // Auto clean alert messages after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Form Submission Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Silakan masukkan email dan password Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SSO_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID ?? '',
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message ?? 'Email atau password salah.');
        return;
      }

      // Simpan token
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      setCurrentUser({
        name: data.user.fullName,
        email: data.user.email,
        role: loginRole,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.user.fullName}`,
        streak: 5,
        hoursLearned: 24.5,
        completedAssignments: 8,
      });
      setSuccessMsg('Login berhasil! Selamat datang kembali.');
      setView('dashboard');
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }
    if (!regAgree) {
      setErrorMsg('Anda harus menyetujui Syarat dan Ketentuan.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SSO_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID ?? '',
        },
        body: JSON.stringify({
          fullName: regName,
          email: regEmail,
          password: regPassword,
          role: regRole === 'guru' ? 'TEACHER' : 'STUDENT',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message ?? 'Pendaftaran gagal, coba lagi.');
        return;
      }

      setSuccessMsg('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      setLoginEmail(regEmail);
      setLoginRole(regRole);
      setView('login');
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg('Silakan masukkan email pemulihan akun.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Tautan pengaturan ulang kata sandi telah dikirim ke email Anda.');
      setView('login');
    }, 1200);
  };

  // Demo Login Helper
  const handleDemoLogin = (role: 'siswa' | 'guru') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentUser({
        name: role === 'siswa' ? 'Raffi Ahmad' : 'Budi Santoso',
        email: role === 'siswa' ? 'raffi@pendidikanmaster.id' : 'budi@pendidikanmaster.id',
        role: role,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${role === 'siswa' ? 'Raffi' : 'Budi'}`,
        streak: 12,
        hoursLearned: 48.2,
        completedAssignments: 15,
      });
      setSuccessMsg(`Login Demo berhasil sebagai ${role === 'siswa' ? 'Siswa' : 'Guru'}!`);
      setView('dashboard');
    }, 800);
  };

  // Live Class Chat Handler
  const handleSendLiveChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setLiveChat(prev => [
      ...prev,
      {
        sender: currentUser?.name || 'Saya',
        msg: chatMessage,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatMessage('');

    // Simulated instructor feedback after a short delay
    setTimeout(() => {
      setLiveChat(prev => [
        ...prev,
        {
          sender: 'Rian (Mentor)',
          msg: `Terima kasih atas pertanyaannya, ${currentUser?.name || 'Siswa'}. Pertanyaan yang sangat bagus, akan bapak bahas selanjutnya!`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  // AI Assistant trigger
  const handleSendAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    setAiChat(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }]);
    setAiInput('');
    setIsAiTyping(true);

    // Dynamic educational responses based on queries
    setTimeout(() => {
      let aiResponse = 'Itu adalah pertanyaan yang menarik! Di PendidikanMaster, kami memiliki tutor dan materi interaktif lengkap untuk bidang tersebut. Apakah ada sub-bab materi spesifik yang ingin saya rincikan?';

      const lower = userMsg.toLowerCase();
      if (lower.includes('next.js') || lower.includes('react')) {
        aiResponse = 'Next.js adalah kerangka kerja React untuk produksi. Fitur utamanya meliputi Server Side Rendering (SSR), Static Site Generation (SSG), App Router, dan Server Actions yang berjalan langsung di server side tanpa perlu API route eksternal yang rumit.';
      } else if (lower.includes('ui/ux') || lower.includes('desain')) {
        aiResponse = 'Desain UI/UX yang baik berfokus pada Pengguna (User-Centered Design). Aturan penting visual meliputi kontras warna yang cukup (aksesibilitas WCAG), jenis huruf yang terbaca (typography scale), serta jarak aman elemen (padding minimum 16px dan touch target 44px).';
      } else if (lower.includes('kalkulus') || lower.includes('matematika')) {
        aiResponse = 'Dalam kalkulus, turunan memetakan laju perubahan instan dari suatu fungsi. Contohnya, turunan parsial memegang peranan krusial dalam algoritma Pembelajaran Mesin (Machine Learning) untuk mendegradasi tingkat kesalahan (Gradient Descent).';
      } else if (lower.includes('bahasa inggris') || lower.includes('inggris')) {
        aiResponse = 'Untuk Bahasa Inggris Bisnis, kunci utamanya adalah formalitas dan efisiensi kata. Cobalah struktur formula "PREP" (Point, Reason, Example, Point) ketika melakukan pitching ide agar terlihat sangat profesional.';
      }

      setAiChat(prev => [...prev, { sender: 'ai', text: aiResponse, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }]);
      setIsAiTyping(false);
    }, 1500);
  };

  // Checkbox or action items trigger
  const toggleCourseProgress = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        const newProg = c.progress >= 100 ? 0 : Math.min(100, c.progress + 10);
        return { ...c, progress: newProg };
      }
      return c;
    }));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setSuccessMsg('Semua notifikasi ditandai sebagai dibaca.');
  };

  return (
    <div id="pendidikanmaster_app" className="min-h-screen relative overflow-hidden bg-[#fafbfe] font-sans antialiased">
      {/* Background blobs for a modern tech-visual edge */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-violet-200/10 blur-[100px] pointer-events-none" />

      {/* Dynamic Header Toast Alerts */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-lg flex items-start gap-3"
          >
            <div className="size-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">!</div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-rose-800">Opps! Terjadi Kesalahan</h4>
              <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-600 transition">
              <X className="size-4" />
            </button>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-lg flex items-start gap-3"
          >
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-800">Berhasil!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600 transition">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view !== 'dashboard' ? (
          // ==========================================
          // 1. SIGN IN, REGISTER & FORGOT PASSWORD VIEW (SPLIT LAYOUT)
          // ==========================================
          <motion.div
            key="auth-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
          >
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-12 min-h-[600px] border border-slate-100/50">

              {/* Left Side: Modern Interactive Brand Showcase Banner (hidden on smaller displays) */}
              <div className="hidden lg:flex lg:col-span-5 bg-indigo-700 text-white p-12 flex-col justify-between relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl pointer-events-none" />

                {/* Top Logo */}
                <div className="flex items-center gap-3 relative z-10 select-none">
                  <div className="size-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                    <GraduationCap className="size-5 text-indigo-600" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-white font-display">PendidikanMaster</span>
                </div>

                {/* Center Content: Interactive Testimonial Carousel or Stats */}
                <div className="my-auto py-10 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-indigo-100 mb-6 font-medium">
                    <Sparkles className="size-3.5" /> Platform Belajar Pilihan Terbaik #1
                  </div>

                  <h2 className="text-4xl font-display font-extrabold tracking-tight leading-tight text-white mb-6">
                    Bangun Karir Impian &amp; Kuasai Skill Masa Depan
                  </h2>
                  <p className="text-indigo-100 text-base leading-relaxed font-sans max-w-md">
                    Akses ribuan materi pembelajaran premium yang dikurasi oleh para ahli industri di seluruh Indonesia.
                  </p>

                  {/* Trust metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-2xl font-display">12k+</span>
                      <span className="text-indigo-200 text-xs font-semibold tracking-wide uppercase">Mahasiswa Aktif</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-2xl font-display">450+</span>
                      <span className="text-indigo-200 text-xs font-semibold tracking-wide uppercase">Instruktur Ahli</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Credits */}
                <div className="flex items-center justify-between text-xs text-indigo-200/60 relative z-10 pt-4 border-t border-white/5">
                  <span>© 2026 PendidikanMaster</span>
                  <div className="flex gap-3">
                    <span className="hover:text-white transition cursor-pointer">Bantuan</span>
                    <span className="hover:text-white transition cursor-pointer">Kebijakan</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Elegant, Accessibility-Aligned Authorization Form Panel */}
              <div className="lg:col-span-7 p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between bg-white min-h-[550px]">
                <div>
                  {/* Brand name for Mobile Screens */}
                  <div className="flex lg:hidden items-center gap-2.5 mb-8 select-none">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                      <GraduationCap className="size-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 font-display">PendidikanMaster</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* ====================
                      A. LOGIN FORM VIEW
                      ==================== */}
                    {view === 'login' && (
                      <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <h3 className="text-3xl font-bold tracking-tight text-slate-900">Selamat Datang Kembali</h3>
                          <p className="text-sm text-slate-500">Masukkan detail akun Anda untuk mengakses dashboard.</p>
                        </div>

                        {/* Role Selector Tabs (Siswa vs Guru) */}
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600" id="role_selector">
                          <button
                            type="button"
                            onClick={() => setLoginRole('siswa')}
                            className={cn(
                              "py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                              loginRole === 'siswa' ? "bg-white text-indigo-600 shadow-sm font-bold" : "hover:text-slate-900"
                            )}
                          >
                            <User className="size-3.5" /> Sebagai Siswa
                          </button>
                          <button
                            type="button"
                            onClick={() => setLoginRole('guru')}
                            className={cn(
                              "py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                              loginRole === 'guru' ? "bg-white text-indigo-600 shadow-sm font-bold" : "hover:text-slate-900"
                            )}
                          >
                            <GraduationCap className="size-3.5" /> Sebagai Guru
                          </button>
                        </div>

                        {/* Primary Login Form */}
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-1.5">
                            <label htmlFor="login_email" className="block text-sm font-medium text-slate-700 tracking-wide">
                              Email Address <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                id="login_email"
                                type="email"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="nama@instansi.com"
                                className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-sans"
                              />
                              <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label htmlFor="login_password" className="block text-sm font-medium text-slate-700 tracking-wide">
                                Password <span className="text-rose-500">*</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => setView('forgot-password')}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                              >
                                Lupa password?
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                id="login_password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-sans"
                              />
                              <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
                              >
                                {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Remember Me Checkbox */}
                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 group cursor-pointer">
                              <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 border-slate-300 size-4 transition cursor-pointer"
                              />
                              <span className="text-sm text-slate-600 group-hover:text-slate-800 select-none">Ingat saya di perangkat ini</span>
                            </label>
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                Masuk Sekarang
                                <ArrowRight className="size-4" />
                              </>
                            )}
                          </button>
                        </form>

                        {/* Social Authenticators Divider */}
                        <div className="relative my-6 text-center">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                          <span className="relative bg-white px-2 text-xs uppercase tracking-wider text-slate-450 font-semibold">Atau masuk dengan</span>
                        </div>

                        {/* Demo Quick Logins */}
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => handleDemoLogin('siswa')}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 bg-white hover:bg-slate-50 transition-colors active:scale-[0.98]"
                          >
                            <User className="size-4 text-indigo-600 shrink-0" />
                            Demo Siswa
                          </button>
                          <button
                            onClick={() => handleDemoLogin('guru')}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-705 bg-white hover:bg-slate-50 transition-colors active:scale-[0.98]"
                          >
                            <GraduationCap className="size-4 text-violet-600 shrink-0" />
                            Demo Guru
                          </button>
                        </div>

                        {/* Register Redirect bar */}
                        <div className="pt-4 text-center">
                          <p className="text-center text-sm text-slate-600">
                            Belum punya akun?{' '}
                            <button
                              onClick={() => setView('register')}
                              className="font-bold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4 transition-colors"
                            >
                              Daftar Gratis
                            </button>
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* =======================
                      B. REGISTER FORM VIEW
                      ======================= */}
                    {view === 'register' && (
                      <motion.div
                        key="register-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="space-y-1">
                          <h3 className="text-3xl font-bold tracking-tight text-slate-900">Bergabung Sekarang</h3>
                          <p className="text-sm text-slate-500">Buat akun belajar di PendidikanMaster hari ini secara gratis.</p>
                        </div>

                        {/* Role selection card for registration */}
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                          <button
                            type="button"
                            onClick={() => setRegRole('siswa')}
                            className={cn(
                              "py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                              regRole === 'siswa' ? "bg-white text-indigo-600 shadow-sm font-bold" : "hover:text-slate-900"
                            )}
                          >
                            <User className="size-3.5" /> Sebagai Siswa
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegRole('guru')}
                            className={cn(
                              "py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                              regRole === 'guru' ? "bg-white text-indigo-600 shadow-sm font-bold" : "hover:text-slate-900"
                            )}
                          >
                            <GraduationCap className="size-3.5" /> Sebagai Guru
                          </button>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                          <div className="space-y-1.5">
                            <label htmlFor="reg_name" className="block text-sm font-medium text-slate-700 tracking-wide">
                              Nama Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                id="reg_name"
                                type="text"
                                required
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                placeholder="Masukkan nama lengkap Anda"
                                className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-sans"
                              />
                              <User className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label htmlFor="reg_email" className="block text-sm font-medium text-slate-700 tracking-wide">
                              Email <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                id="reg_email"
                                type="email"
                                required
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-sans"
                              />
                              <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label htmlFor="reg_password" className="block text-sm font-medium text-slate-700 tracking-wide">
                                Password <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  id="reg_password"
                                  type="password"
                                  required
                                  value={regPassword}
                                  onChange={(e) => setRegPassword(e.target.value)}
                                  placeholder="Min. 6 karakter"
                                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-sans"
                                />
                                <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label htmlFor="reg_confirm_password" className="block text-sm font-medium text-slate-700 tracking-wide">
                                Konfirmasi Password <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  id="reg_confirm_password"
                                  type="password"
                                  required
                                  value={regConfirmPassword}
                                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                                  placeholder="Ketik ulang password"
                                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-sans"
                                />
                                <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                              </div>
                            </div>
                          </div>

                          {/* Agree to terms */}
                          <div className="pt-1">
                            <label className="flex items-start gap-2.5 group cursor-pointer">
                              <input
                                type="checkbox"
                                required
                                checked={regAgree}
                                onChange={(e) => setRegAgree(e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 border-slate-300 size-4 mt-0.5 transition cursor-pointer"
                              />
                              <span className="text-xs font-medium text-slate-600 leading-normal select-none">
                                Saya menyetujui <span className="font-bold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4 cursor-pointer">Syarat &amp; Ketentuan</span> &amp; <span className="font-bold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4 cursor-pointer">Kebijakan Privasi</span> platform PendidikanMaster.
                              </span>
                            </label>
                          </div>

                          {/* Register Button */}
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] active:bg-indigo-800 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                Buat Akun Sekarang
                                <ArrowRight className="size-4" />
                              </>
                            )}
                          </button>
                        </form>

                        {/* Login redirect bar */}
                        <div className="pt-4 text-center border-t border-slate-150">
                          <p className="text-sm text-slate-600">
                            Sudah terdaftar?{' '}
                            <button
                              onClick={() => setView('login')}
                              className="font-bold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4 transition-colors"
                            >
                              Masuk
                            </button>
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ================================
                      C. FORGOT PASSWORD VIEW CODE
                      ================================ */}
                    {view === 'forgot-password' && (
                      <motion.div
                        key="forgot-password-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <h3 className="text-3xl font-bold tracking-tight text-slate-900">Lupa Kata Sandi?</h3>
                          <p className="text-sm text-slate-500">Masukkan email terdaftar Anda dan kami akan mengirimkan tautan guna mengatur ulang sandi akun.</p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="space-y-1.5">
                            <label htmlFor="forgot_email" className="block text-sm font-medium text-slate-700 tracking-wide">
                              Email Terdaftar <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                id="forgot_email"
                                type="email"
                                required
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-sans"
                              />
                              <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                            </div>
                          </div>

                          {/* Reset password button */}
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] active:bg-indigo-800 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Kirim Email Pemulihan'
                            )}
                          </button>
                        </form>

                        {/* Back to login option */}
                        <div className="pt-4 text-center border-t border-slate-150">
                          <button
                            onClick={() => setView('login')}
                            className="text-sm font-bold text-indigo-650 hover:text-indigo-800 transition-colors"
                          >
                            ← Kembali ke Halaman Login
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Credits with premium layout */}
                <div className="pt-8 mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-t border-slate-100 w-full mt-auto">
                  <span className="hover:text-slate-650 cursor-pointer transition-colors">Kebijakan Privasi</span>
                  <span className="hover:text-slate-650 cursor-pointer transition-colors">Syarat &amp; Ketentuan</span>
                  <span className="hover:text-slate-650 cursor-pointer transition-colors">Pusat Bantuan</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // ==========================================
          // 2. COMPREHENSIVE RESPONSIVE STUDENT DASHBOARD VIEW
          // ==========================================
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex text-slate-800 relative bg-[#f8fafc]"
          >
            {/* Sidebar Navigation - Collapsible on Mobile, responsive sidebar state */}
            <aside className={cn(
              "fixed inset-y-0 left-0 bg-slate-900 text-white w-64 z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col shrink-0 border-r border-slate-800",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-0 lg:translate-x-0"
            )}>
              {/* Sidebar Header logotype */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-md">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm tracking-wide leading-none">PendidikanMaster</h2>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#a5b4fc]/70">Dasbor Siswa</span>
                  </div>
                </div>
                {/* Mobile close button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white transition hover:bg-slate-800"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Sidebar items */}
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setDashboardTab('overview'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wide transition-all focus:outline-none",
                    dashboardTab === 'overview' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <LayoutDashboard className="size-4.5" /> Ringkasan Dasbor
                </button>
                <button
                  type="button"
                  onClick={() => { setDashboardTab('courses'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wide transition-all focus:outline-none",
                    dashboardTab === 'courses' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <BookOpen className="size-4.5" /> Kursus Saya
                </button>
                <button
                  type="button"
                  onClick={() => { setDashboardTab('schedule'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wide transition-all focus:outline-none",
                    dashboardTab === 'schedule' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <Calendar className="size-4.5" /> Jadwal & Live Class
                </button>
                <button
                  type="button"
                  onClick={() => { setDashboardTab('assistant'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wide transition-all focus:outline-none",
                    dashboardTab === 'assistant' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-450 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <Sparkles className="size-4.5 text-indigo-400 shrink-0" /> Tanya AI Tutor
                </button>

                <div className="h-px bg-slate-800/60 my-6" />

                <div className="px-4 text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Utilitas Belajar</div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Catatan Cepat</span>
                    <FileText className="size-3.5 text-slate-550" />
                  </div>
                  <textarea
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 h-20 outline-none focus:border-indigo-600 placeholder:text-slate-600 resize-none font-sans"
                  />
                  <div className="text-[9px] text-slate-500 text-right">Otomatis tersimpan</div>
                </div>
              </nav>

              {/* Sidebar bottom: user card and logout control */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser?.avatar}
                    alt="avatar"
                    className="size-11 rounded-xl bg-slate-800 border border-slate-700 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=user';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-100 truncate">{currentUser?.name}</h3>
                    <p className="text-[10px] text-slate-450 truncate uppercase font-semibold tracking-wide">
                      {currentUser?.role === 'siswa' ? 'Siswa Premium' : 'Pengajar / Guru'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setCurrentUser(null);
                    setSuccessMsg('Keluar dari akun berhasil.');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-rose-950/20 hover:border-rose-950/40 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="size-4" /> Keluar Sesi
                </button>
              </div>
            </aside>

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
              {/* Fixed Search, Notifications and Quick Bar Header */}
              <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100/85 px-6 py-4 flex items-center justify-between shadow-sm">

                {/* Mobile Menu Open Toggle Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Menu className="size-5.5" />
                  </button>
                  <div className="hidden sm:block">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selamat Belajar</span>
                    <h2 className="text-base font-display font-bold text-slate-900 leading-tight">Halo, {currentUser?.name}! 👋</h2>
                  </div>
                </div>

                {/* Search Bar Desktop */}
                <div className="hidden md:flex relative max-w-xs w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari materi kuliah, kuis, atau tugas..."
                    className="w-full py-2 pl-9 pr-4 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
                  />
                  <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                </div>

                {/* Right side utility icons (Notif, Settings, Badges) */}
                <div className="flex items-center gap-3 relative">
                  {/* Streak Flame indicator */}
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200 select-none">
                    <Flame className="size-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold">{currentUser?.streak} Hari Streak</span>
                  </div>

                  {/* Notification Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition relative focus:outline-none"
                    >
                      <Bell className="size-4 text-slate-600" />
                      {notifications.some(n => !n.isRead) && (
                        <span className="absolute top-1 right-1.5 size-2 rounded-full bg-rose-500 animate-bounce" />
                      )}
                    </button>

                    {/* Popover Alerts list */}
                    <AnimatePresence>
                      {showNotifDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 py-1"
                          >
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-800">Notifikasi Terbaru</h4>
                              <button
                                onClick={markAllNotificationsAsRead}
                                className="text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                Tandai semua dibaca
                              </button>
                            </div>
                            <div className="max-h-[250px] overflow-y-auto divide-y divide-slate-50">
                              {notifications.map(notif => (
                                <div key={notif.id} className={cn("p-4.5 hover:bg-slate-50/50 transition flex gap-3", !notif.isRead && "bg-indigo-50/20")}>
                                  <span className={cn(
                                    "size-2 rounded-full shrink-0 mt-1.5",
                                    notif.isRead ? "bg-slate-300" : "bg-indigo-600"
                                  )} />
                                  <div className="flex-1">
                                    <p className="text-xs text-slate-600 leading-normal font-medium">{notif.title}</p>
                                    <span className="text-[9px] text-slate-400 block mt-1">{notif.time} yang lalu</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </header>

              {/* Dynamic Tabs Panel Content */}
              <main className="p-6 flex-1 space-y-6">

                {/* A. OVERVIEW TABS PANEL */}
                {dashboardTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Welcome Hero Banner */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="space-y-3 relative z-10 text-center md:text-left">
                        <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[11px] font-bold text-indigo-100">
                          <Award className="size-3.5 text-amber-300" /> Akun Premium Terdaftar
                        </span>
                        <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Kembangkan Potensimu, Capai Nilai Terbaik!</h2>
                        <p className="text-xs text-indigo-100/90 leading-relaxed max-w-lg">
                          Anda memiliki 1 jadwal live webinar masterclass pagi ini. Selesaikan sisa modul pemrograman web lanjutan Anda untuk mendapatkan sertifikat kompetensi.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => setDashboardTab('courses')}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-indigo-600 font-bold text-xs hover:bg-slate-50 transition active:scale-95 duration-100"
                          >
                            Mulai Belajar
                            <PlayCircle className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-slate-950/20 backdrop-blur-md rounded-2xl p-4.5 border border-white/10 w-full md:max-w-xs shrink-0 select-none">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="space-y-1 border-r border-white/10 pr-2">
                            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block">Jam Belajar</span>
                            <span className="text-xl font-bold font-display">{currentUser?.hoursLearned} j</span>
                          </div>
                          <div className="space-y-1 pl-2">
                            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block font-sans">Tugas Selesai</span>
                            <span className="text-xl font-bold font-display">{currentUser?.completedAssignments} task</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Analytics Counters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="size-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <BookMarked className="size-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kursus Berjalan</span>
                          <h4 className="text-lg font-bold text-slate-900 mt-1">{courses.length} Kursus Aktif</h4>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="size-11 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                          <TrendingUp className="size-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skor Pembelajaran</span>
                          <h4 className="text-lg font-bold text-slate-900 mt-1">94% Akurasi Kuis</h4>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="size-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                          <Flame className="size-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Konsistensi Mingguan</span>
                          <h4 className="text-lg font-bold text-slate-900 mt-1">{currentUser?.streak} Hari Beruntun</h4>
                        </div>
                      </div>
                    </div>

                    {/* Courses progress cards & activities schedule preview split */}
                    <div className="grid lg:grid-cols-12 gap-6">

                      {/* Left: Active Course Progress summary list */}
                      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                          <h3 className="text-sm font-bold text-slate-800">Progres Kursus Terbaru</h3>
                          <button
                            onClick={() => setDashboardTab('courses')}
                            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            Lihat semua <ChevronRight className="size-3.5" />
                          </button>
                        </div>

                        <div className="space-y-4 pt-1">
                          {courses.slice(0, 3).map(course => (
                            <div
                              key={course.id}
                              className="group p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition duration-200"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                    {course.category}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                                    {course.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-450">Mentor: {course.mentor}</p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleCourseProgress(course.id)}
                                  className="text-[9.5px] font-bold text-indigo-600 hover:text-indigo-8o0 bg-slate-100 py-1 px-2.5 rounded-lg shrink-0"
                                  title="Simulasi centang penyelesaian modul"
                                >
                                  +10% Selesai
                                </button>
                              </div>

                              {/* Progress bar and label */}
                              <div className="mt-4 flex items-center gap-3">
                                <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{course.progress}% Modul</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Upcoming Live Webinar and Class schedule calendar summary */}
                      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm flex flex-col justify-between gap-5">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                            <h3 className="text-sm font-bold text-slate-800">Kelas Live Hari Ini</h3>
                            <button
                              onClick={() => setDashboardTab('schedule')}
                              className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                              Lihat kalender
                            </button>
                          </div>

                          <div className="bg-slate-950 text-white rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-rose-450">
                                <span className="size-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Sedang Berlangsung</span>
                              </div>
                              <h4 className="text-xs font-bold leading-snug">Interactive UI/UX Review & Pitching Project</h4>
                              <p className="text-[10px] text-slate-400">Bersama Rian Wijaya • Sesi Tanya Jawab Terbuka</p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-800 text-slate-400">
                              <span className="flex items-center gap-1"><Clock className="size-3.5" /> 10:00 - 11:30 WIB</span>
                              <button
                                onClick={() => { setDashboardTab('schedule'); setIsLiveClassRunning(true); }}
                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold transition flex items-center gap-1"
                              >
                                Join Webinar
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Student statistics tracker graph alternative */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Minggu Ini</span>
                            <p className="text-xs font-bold text-slate-800 leading-snug">Belajar 5 Jam & Selesaikan 2 Tugas Mandiri</p>
                          </div>
                          <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* B. COURSES LISTS PANEL */}
                {dashboardTab === 'courses' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-display font-semibold tracking-tight text-slate-900">Kurikulum Belajarmu</h2>
                        <p className="text-xs text-slate-500">Kumpulan mata pelajaran terpopuler dari PendidikanMaster yang Anda ambil.</p>
                      </div>

                      {/* Course Category Filters (Mock) */}
                      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                        <span className="px-3.5 py-1.5 font-bold rounded-xl bg-indigo-600 text-white shadow-sm cursor-pointer whitespace-nowrap">Semua Bidang ({courses.length})</span>
                        <span className="px-3.5 py-1.5 font-semibold rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Teknologi</span>
                        <span className="px-3.5 py-1.5 font-semibold rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer whitespace-nowrap">Desain</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {courses.map(course => (
                        <div
                          key={course.id}
                          className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col h-full"
                        >
                          <div className="h-40 relative bg-slate-100 w-full">
                            <img
                              src={course.image}
                              alt={course.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/400/250';
                              }}
                            />
                            <span className="absolute top-3 left-3 px-2 py-1 rounded bg-[#a5b4fc] text-[#1e1b4b] text-[9px] font-bold uppercase tracking-wider">
                              {course.category}
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-xs font-bold text-slate-900 leading-snug hover:text-indigo-600 transition cursor-pointer">
                                {course.title}
                              </h3>
                              <p className="text-[10px] text-slate-450 font-medium">Tutor: {course.mentor}</p>
                            </div>

                            <div className="space-y-4.5 pt-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold">
                                  <span>Kelulusan Bab ({course.progress}%)</span>
                                  <span>{Math.round((course.progress / 100) * course.totalChapters)} / {course.totalChapters} Bab</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-50 text-[10px] flex items-center justify-between text-slate-500">
                                <span className="truncate max-w-[130px]" title={course.nextClass}>Next: {course.nextClass}</span>
                                <span className="font-semibold text-slate-700 whitespace-nowrap">{course.nextClassTime.split(',')[0]}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleCourseProgress(course.id)}
                                className="w-full py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 text-indigo-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                              >
                                {course.progress >= 100 ? 'Ulangi Kursus' : 'Selesaikan Sub-modul (+10%)'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* C. SCHEDULES AND LIVE WEBINAR CLASS STUDY ROOM */}
                {dashboardTab === 'schedule' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-display font-semibold tracking-tight text-slate-900">Jadwal Sesi Live Webinar & Kalender Belajar</h2>
                      <p className="text-xs text-slate-500">Hadir dan bertatap muka langsung secara virtual dengan tutor favorit Anda.</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-6 items-start">

                      {/* Left: Interactive live video panel simulation */}
                      <div className="lg:col-span-8 space-y-4">
                        {isLiveClassRunning ? (
                          <div className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
                            {/* Simulator Stream screen */}
                            <div className="h-[280px] sm:h-[350px] relative bg-slate-900 flex items-center justify-center">
                              {/* Background loop representation or static presentation */}
                              <div className="text-center space-y-3 p-4">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500 text-white font-bold uppercase tracking-wider rounded-full text-[10px] animate-pulse">
                                  ● Live Streaming Review
                                </div>
                                <h3 className="text-sm font-semibold tracking-wide">Interactive UI/UX Review & Pitching Project</h3>
                                <p className="text-xs text-slate-400">Disampaikan oleh: Rian Wijaya (Principal Designer di Tokopedia)</p>

                                {/* Centered avatar simulation */}
                                <div className="size-20 rounded-full border border-indigo-500/50 bg-indigo-950/40 p-1 mx-auto flex items-center justify-center relative">
                                  <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
                                  <img
                                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=Rian"
                                    className="size-full rounded-full object-cover"
                                    alt="Rian Wijaya"
                                  />
                                </div>
                              </div>

                              <button
                                onClick={() => setIsLiveClassRunning(false)}
                                className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 text-slate-300 border border-slate-800"
                              >
                                Keluar Kelas
                              </button>
                            </div>

                            {/* Live Webinar Chat panel */}
                            <div className="border-t border-slate-800 p-4.5 bg-slate-900 space-y-4 flex flex-col justify-between min-h-[220px]">
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-indigo-400">Obrolan Kelas Live</h4>
                                <div className="h-32 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                                  {liveChat.map((chat, idx) => (
                                    <div key={idx} className="text-xs space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-200">{chat.sender}</span>
                                        <span className="text-[9px] text-slate-500">{chat.time}</span>
                                      </div>
                                      <p className="text-slate-400 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-900">{chat.msg}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <form onSubmit={handleSendLiveChat} className="flex gap-2">
                                <input
                                  type="text"
                                  value={chatMessage}
                                  onChange={(e) => setChatMessage(e.target.value)}
                                  placeholder="Ketik pertanyaan atau tanggapan..."
                                  className="flex-1 px-4 py-2 text-xs bg-slate-950 rounded-xl border border-slate-800 text-slate-350 focus:border-indigo-600 outline-none"
                                />
                                <button
                                  type="submit"
                                  className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs"
                                >
                                  Kirim
                                </button>
                              </form>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center space-y-4 flex flex-col items-center">
                            <div className="size-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <PlayCircle className="size-8" />
                            </div>
                            <div className="space-y-1.5 max-w-sm">
                              <h3 className="text-sm font-bold text-slate-800">Ruang Webinar PendidikanMaster</h3>
                              <p className="text-xs text-slate-500">
                                Anda dapat mengklik tombol &quot;Mulai Sesi&quot; pada jadwal webinar terdekat untuk masuk ke simulasi kelas interaktif tatap muka dengan guru pembimbing.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setIsLiveClassRunning(true);
                                setSuccessMsg('Berhasil masuk ke ruang kelas interaktif!');
                              }}
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-850 text-white font-bold text-sm rounded-xl transition"
                            >
                              Mulai Sesi Belajar Mandiri Live
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right: Upcoming timetables */}
                      <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-50">Daftar Jadwal Pekan Ini</h3>
                        <div className="space-y-3.5">
                          <div className="p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition flex items-start gap-3">
                            <span className="size-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">Sel</span>
                            <div className="space-y-1">
                              <h4 className="text-[11px] font-bold text-slate-900 leading-snug">UI/UX Layout Review</h4>
                              <p className="text-[9.5px] text-slate-450">10:00 - 11:30 WIB • Rian Wijaya</p>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition flex items-start gap-3">
                            <span className="size-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">Rab</span>
                            <div className="space-y-1">
                              <h4 className="text-[11px] font-bold text-slate-900 leading-snug">Next.js REST API Design</h4>
                              <p className="text-[9.5px] text-slate-450">13:00 - 15:00 WIB • Ahmad Faisal</p>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition flex items-start gap-3">
                            <span className="size-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">Kam</span>
                            <div className="space-y-1">
                              <h4 className="text-[11px] font-bold text-slate-900 leading-snug">Turunan Parsial & ML</h4>
                              <p className="text-[9.5px] text-slate-450">09:00 - 10:30 WIB • Dr. Indah Lestari</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* D. AI TEACHER TUTOR ASSISTANT SCREEN */}
                {dashboardTab === 'assistant' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-display font-semibold tracking-tight text-slate-900">Pembimbing Belajar Virtual AI</h2>
                      <p className="text-xs text-slate-500">Tanyakan konsep rumus sulit, minta dibuatkan kuis latihan, atau perjelas topik akademik apa saja disini.</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden grid lg:grid-cols-12 min-h-[480px]">

                      {/* Left side assistant description suggestions */}
                      <div className="lg:col-span-4 bg-slate-50 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Saran Bahan Diskusi</h3>

                          <div className="space-y-2 text-xs">
                            <button
                              onClick={() => setAiInput('Jelaskan konsep dasar Server Side Rendering (SSR) di Next.js dengan analogi sederhana.')}
                              className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-600 hover:text-indigo-600 transition"
                            >
                              &quot;Jelaskan dasar SSR Next.js&quot;
                            </button>
                            <button
                              onClick={() => setAiInput('Kirimkan aturan aksesibilitas warna menurut standar WCAG untuk UI Design.')}
                              className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-600 hover:text-indigo-600 transition"
                            >
                              &quot;Aksesibilitas Kontras WCAG&quot;
                            </button>
                            <button
                              onClick={() => setAiInput('Bagaimana cara turunan pertama dipakai untuk mencari nilai maksimum-minimum kelaikan bisnis?')}
                              className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-600 hover:text-indigo-600 transition"
                            >
                              &quot;Aplikasi Turunan Kalkulus&quot;
                            </button>
                          </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                          <Sparkles className="size-5 text-indigo-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">
                            Asisten AI kami diprogram khusus untuk menjawab dengan struktur kurikulum PendidikanMaster demi pemahaman optimal kognitif Anda.
                          </p>
                        </div>
                      </div>

                      {/* Right side active messaging UI */}
                      <div className="lg:col-span-8 flex flex-col justify-between min-h-[400px]">

                        <div className="p-4 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                              <Sparkles className="size-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 leading-none">Asisten AI Master</h4>
                              <span className="text-[9px] text-[#4f46e5] font-semibold">Tutor Matematika, Coding & Desain</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setAiChat([
                              { sender: 'ai', text: 'Halo! Sesi riwayat telah dibersihkan. Apakah ada topik belajar baru yang ingin kamu diskusikan pagi ini?', time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
                            ])}
                            className="text-[10px] font-semibold text-slate-400 hover:text-slate-650"
                          >
                            Hapus Riwayat
                          </button>
                        </div>

                        {/* Message list container */}
                        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[320px] scrollbar-thin scrollbar-thumb-slate-200">
                          {aiChat.map((chat, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "flex flex-col gap-1 max-w-[80%]",
                                chat.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                              )}
                            >
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                                <span>{chat.sender === 'user' ? currentUser?.name : 'AI Tutor'}</span>
                                <span>• {chat.time}</span>
                              </div>
                              <div className={cn(
                                "p-3.5 rounded-2xl text-xs leading-relaxed",
                                chat.sender === 'user'
                                  ? "bg-indigo-600 text-white rounded-tr-none"
                                  : "bg-slate-100 text-slate-850 rounded-tl-none border border-slate-200/50"
                              )}>
                                {chat.text}
                              </div>
                            </div>
                          ))}

                          {isAiTyping && (
                            <div className="flex flex-col gap-1 mr-auto items-start max-w-[80%]">
                              <span className="text-[9px] text-slate-400">AI Tutor sedang berpikir...</span>
                              <div className="bg-slate-100 border border-slate-250 p-3.5 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                <span className="size-1.5 rounded-full bg-slate-450 animate-bounce delay-100" />
                                <span className="size-1.5 rounded-full bg-slate-455 animate-bounce delay-200" />
                                <span className="size-1.5 rounded-full bg-slate-460 animate-bounce delay-300" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer AI inputs */}
                        <form onSubmit={handleSendAi} className="p-4 border-t border-slate-100 bg-slate-50/10 flex gap-2">
                          <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="Tanyakan rumus trigonometri, syntax Next.js, konsep UI/UX..."
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 font-sans"
                          />
                          <button
                            type="submit"
                            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-805 text-white font-bold text-xs shadow-md shadow-indigo-600/10 transition flex items-center justify-center shrink-0"
                          >
                            Tanya AI
                          </button>
                        </form>

                      </div>

                    </div>
                  </div>
                )}

              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
