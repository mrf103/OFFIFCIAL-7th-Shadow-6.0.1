import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/api/supabaseClient'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, LogOut, Upload } from 'lucide-react'
import PageContainer from '@/Components/PageContainer'

/**\n * Profile Page\n * User profile management and settings\n */\nexport default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    avatar_url: ''
  })

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    language: 'ar',
    theme: 'dark',
    notifications_enabled: true,
    email_notifications: true,
    marketing_emails: false,
    two_factor_enabled: false
  })

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          navigate('/auth')
          return
        }

        setUser(user)

        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)
        setProfileForm({
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        })

        // Load settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (settingsError) throw settingsError
        setSettings(settingsData)
        setSettingsForm(settingsData)
      } catch (err) {
        setError(err.message)
        console.error('Error loading user data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [navigate])

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(profileForm)
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess('تم تحديث الملف الشخصي بنجاح')
      setProfile({ ...profile, ...profileForm })
    } catch (err) {
      setError(err.message)
      console.error('Error updating profile:', err)
    } finally {
      setSaving(false)
    }
  }

  // Handle settings update
  const handleSettingsUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('user_settings')
        .update(settingsForm)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setSuccess('تم تحديث الإعدادات بنجاح')
      setSettings(settingsForm)
    } catch (err) {
      setError(err.message)
      console.error('Error updating settings:', err)
    } finally {
      setSaving(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        throw new Error('يرجى ملء جميع الحقول')
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('كلمات المرور الجديدة غير متطابقة')
      }

      if (passwordForm.newPassword.length < 8) {
        throw new Error('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل')
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (updateError) throw updateError

      setSuccess('تم تغيير كلمة المرور بنجاح')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
      console.error('Error changing password:', err)
    } finally {
      setSaving(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    setError('')

    try {
      // Upload to storage
      const fileName = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfileForm({ ...profileForm, avatar_url: publicUrl })
      setSuccess('تم تحديث الصورة الشخصية بنجاح')
    } catch (err) {
      setError(err.message)
      console.error('Error uploading avatar:', err)
    } finally {
      setSaving(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/auth')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">الملف الشخصي</h1>
            <p className="text-slate-400 mt-2">إدارة حسابك والإعدادات</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </Button>
        </div>

        {/* Alerts */}
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

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="subscription">الاشتراك</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">معلومات الملف الشخصي</CardTitle>
                <CardDescription>تحديث معلومات حسابك الشخصية</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {profileForm.avatar_url ? (
                        <img
                          src={profileForm.avatar_url}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-2 border-slate-600"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                          <span className="text-2xl text-slate-400">👤</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="avatar" className="block">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                          disabled={saving}
                        >
                          <Upload size={18} />
                          تحميل صورة جديدة
                        </Button>
                      </label>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={saving}
                      />
                      <p className="text-sm text-slate-400 mt-2">JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-slate-700 border-slate-600 text-slate-400"
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      الاسم الكامل
                    </label>
                    <Input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={saving}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      السيرة الذاتية
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      disabled={saving}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      'حفظ التغييرات'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">الإعدادات</CardTitle>
                <CardDescription>تخصيص تجربتك</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSettingsUpdate} className="space-y-6">
                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      اللغة
                    </label>
                    <select
                      value={settingsForm.language}
                      onChange={(e) => setSettingsForm({ ...settingsForm, language: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                      disabled={saving}
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      المظهر
                    </label>
                    <select
                      value={settingsForm.theme}
                      onChange={(e) => setSettingsForm({ ...settingsForm, theme: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                      disabled={saving}
                    >
                      <option value="light">فاتح</option>
                      <option value="dark">غامق</option>
                      <option value="auto">تلقائي</option>
                    </select>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      الإشعارات
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={settingsForm.notifications_enabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, notifications_enabled: e.target.checked })}
                        className="rounded border-slate-600"
                        disabled={saving}
                      />
                      <label htmlFor="notifications" className="ml-2 text-sm text-slate-300">
                        تفعيل الإشعارات
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={settingsForm.email_notifications}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email_notifications: e.target.checked })}
                        className="rounded border-slate-600"
                        disabled={saving}
                      />
                      <label htmlFor="emailNotifications" className="ml-2 text-sm text-slate-300">
                        إشعارات البريد الإلكتروني
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="marketingEmails"
                        checked={settingsForm.marketing_emails}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marketing_emails: e.target.checked })}
                        className="rounded border-slate-600"
                        disabled={saving}
                      />
                      <label htmlFor="marketingEmails" className="ml-2 text-sm text-slate-300">
                        رسائل التسويق
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      'حفظ الإعدادات'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">الأمان</CardTitle>
                <CardDescription>إدارة أمان حسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      كلمة المرور الحالية
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={saving}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري التحديث...
                      </>
                    ) : (
                      'تغيير كلمة المرور'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">الاشتراك</CardTitle>
                <CardDescription>معلومات اشتراكك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-400">نوع الاشتراك</p>
                    <p className="text-lg font-semibold text-white capitalize">
                      {profile?.subscription_tier === 'free' && 'مجاني'}
                      {profile?.subscription_tier === 'pro' && 'احترافي'}
                      {profile?.subscription_tier === 'enterprise' && 'مؤسسي'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-400">حالة الاشتراك</p>
                    <p className="text-lg font-semibold text-white capitalize">
                      {profile?.subscription_status === 'active' && 'نشط'}
                      {profile?.subscription_status === 'cancelled' && 'ملغي'}
                      {profile?.subscription_status === 'expired' && 'منتهي'}
                    </p>
                  </div>

                  {profile?.subscription_ends_at && (
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-sm text-slate-400">تاريخ انتهاء الاشتراك</p>
                      <p className="text-lg font-semibold text-white">
                        {new Date(profile.subscription_ends_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  )}

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    ترقية الاشتراك
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
