import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, auth } from '@/api/supabaseClient'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import PageContainer from '@/Components/PageContainer'

/**\n * Authentication Page\n * Handles user login, signup, and password recovery\n */\nexport default function AuthPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Signup state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  })

  // Password recovery state
  const [recoveryData, setRecoveryData] = useState({
    email: '',
    step: 'email' // email, code, newPassword
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        navigate('/dashboard')
      }
    }
    checkUser()
  }, [navigate])

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate inputs
      if (!loginData.email || !loginData.password) {
        throw new Error('يرجى ملء جميع الحقول')
      }

      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      if (signInError) throw signInError

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      // If no profile, create one
      if (!profile) {
        await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || ''
          })

        await supabase
          .from('user_settings')
          .insert({
            user_id: data.user.id
          })
      }

      setSuccess('تم تسجيل الدخول بنجاح!')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate inputs
      if (!signupData.email || !signupData.password || !signupData.fullName) {
        throw new Error('يرجى ملء جميع الحقول')
      }

      if (signupData.password !== signupData.confirmPassword) {
        throw new Error('كلمات المرور غير متطابقة')
      }

      if (signupData.password.length < 8) {
        throw new Error('يجب أن تكون كلمة المرور 8 أحرف على الأقل')
      }

      if (!signupData.acceptTerms) {
        throw new Error('يجب قبول الشروط والأحكام')
      }

      // Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName
          }
        }
      })

      if (signUpError) throw signUpError

      // Create user profile
      await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: signupData.email,
          full_name: signupData.fullName
        })

      // Create user settings
      await supabase
        .from('user_settings')
        .insert({
          user_id: data.user.id
        })

      setSuccess('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني')
      setSignupData({ email: '', password: '', confirmPassword: '', fullName: '', acceptTerms: false })
      
      setTimeout(() => setActiveTab('login'), 2000)
    } catch (err) {
      setError(err.message || 'فشل إنشاء الحساب')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Password Recovery
  const handlePasswordRecovery = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (recoveryData.step === 'email') {
        if (!recoveryData.email) {
          throw new Error('يرجى إدخال بريدك الإلكتروني')
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          recoveryData.email,
          {
            redirectTo: `${window.location.origin}/auth/reset-password`
          }
        )

        if (resetError) throw resetError

        setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
        setRecoveryData({ email: '', step: 'email' })
      }
    } catch (err) {
      setError(err.message || 'فشلت عملية استرجاع كلمة المرور')
      console.error('Recovery error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Shadow Seven</h1>
          <p className="text-slate-400">منصة النشر الذكية</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert className="mb-4 bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-500/10 border-green-500/50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}

        {/* Auth Tabs */}
        <Card className="bg-slate-800 border-slate-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900 border-b border-slate-700">
              <TabsTrigger value="login" className="data-[state=active]:bg-slate-700">
                دخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-slate-700">
                إنشاء حساب
              </TabsTrigger>
              <TabsTrigger value="recovery" className="data-[state=active]:bg-slate-700">
                استرجاع
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-white">تسجيل الدخول</CardTitle>
                <CardDescription>أدخل بيانات حسابك للمتابعة</CardDescription>
              </CardHeader>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                    className="rounded border-slate-600"
                    disabled={loading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-400">
                    تذكرني
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    'دخول'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4 p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-white">إنشاء حساب جديد</CardTitle>
                <CardDescription>انضم إلى منصة النشر الذكية</CardDescription>
              </CardHeader>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    الاسم الكامل
                  </label>
                  <Input
                    type="text"
                    placeholder="أحمد محمد"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={signupData.acceptTerms}
                    onChange={(e) => setSignupData({ ...signupData, acceptTerms: e.target.checked })}
                    className="rounded border-slate-600 mt-1"
                    disabled={loading}
                  />
                  <label htmlFor="acceptTerms" className="ml-2 text-sm text-slate-400">
                    أوافق على الشروط والأحكام وسياسة الخصوصية
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    'إنشاء حساب'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Recovery Tab */}
            <TabsContent value="recovery" className="space-y-4 p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-white">استرجاع كلمة المرور</CardTitle>
                <CardDescription>أدخل بريدك الإلكتروني لاستقبال رابط إعادة التعيين</CardDescription>
              </CardHeader>

              <form onSubmit={handlePasswordRecovery} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={recoveryData.email}
                    onChange={(e) => setRecoveryData({ ...recoveryData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال رابط الاستعادة'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          جميع الحقوق محفوظة © 2024 Shadow Seven
        </p>
      </div>
    </PageContainer>
  )
}
