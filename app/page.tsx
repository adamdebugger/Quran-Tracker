"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, BookOpen, Calendar, Check, Eye, EyeOff, Moon, Settings, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "./providers"
// تحديث استيراد useTheme
import { useTheme } from "next-themes"

// في بداية المكون، نقوم بتحديث استخدام useTheme
export default function Home() {
  const { theme, setTheme } = useTheme()

  // حالة الموضوع (فاتح/داكن)
  // const { theme, setTheme } = useTheme()

  // حالة إظهار كلمة المرور
  const [showPassword, setShowPassword] = useState(false)

  // تحديث نوع بيانات المستخدم
  const [user, setUser] = useState<{
    username: string
    email: string
    password: string
    isLoggedIn: boolean
    plan: {
      type: string
      value: number
      dailyPages: number
      totalPages: number
      completedPages: number
      startDate: string
      endDate: string
    }
    notifications: boolean
  }>({
    username: "",
    email: "",
    password: "",
    isLoggedIn: false,
    plan: {
      type: "khatma",
      value: 1,
      dailyPages: 20,
      totalPages: 604,
      completedPages: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
    },
    notifications: true,
  })

  // تحديث بيانات تسجيل الدخول
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // تحديث بيانات التسجيل الجديد
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // حالة الصفحة الحالية
  const [activeTab, setActiveTab] = useState<string>("login")

  // حالة نموذج التسجيل (تسجيل دخول أو إنشاء حساب)
  const [formMode, setFormMode] = useState<"login" | "register">("login")

  // تحميل بيانات المستخدم من التخزين المحلي عند تحميل الصفحة
  useEffect(() => {
    try {
      // تحميل قائمة المستخدمين
      const savedUsers = localStorage.getItem("quranUsers")
      if (!savedUsers) {
        localStorage.setItem("quranUsers", JSON.stringify({}))
      }

      // تحميل المستخدم الحالي إذا كان مسجل الدخول
      const currentUser = localStorage.getItem("quranCurrentUser")
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser)
        if (parsedUser.isLoggedIn) {
          setUser(parsedUser)
          setActiveTab("progress")
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }, [])

  // تبديل الموضوع (فاتح/داكن)
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginData.email || !loginData.password) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      })
      return
    }

    try {
      // التحقق من وجود المستخدم
      const savedUsers = JSON.parse(localStorage.getItem("quranUsers") || "{}")
      const userFound = Object.values(savedUsers).find(
        (u: any) => u.email.toLowerCase() === loginData.email.toLowerCase() && u.password === loginData.password,
      )

      if (!userFound) {
        toast({
          title: "خطأ",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          variant: "destructive",
        })
        return
      }

      // تسجيل الدخول بنجاح
      const loggedInUser = {
        ...userFound,
        isLoggedIn: true,
      }

      setUser(loggedInUser)

      // تحديث بيانات المستخدم في التخزين المحلي
      savedUsers[loggedInUser.email] = loggedInUser
      localStorage.setItem("quranUsers", JSON.stringify(savedUsers))
      localStorage.setItem("quranCurrentUser", JSON.stringify(loggedInUser))

      setActiveTab("progress")

      toast({
        title: "مرحباً بك",
        description: `أهلاً ${loggedInUser.username}، بارك الله في جهودك لقراءة القرآن`,
      })

      setLoginData({
        email: "",
        password: "",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      })
    }
  }

  // إنشاء حساب جديد
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "الرجاء إكمال جميع الحقول",
        variant: "destructive",
      })
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      })
      return
    }

    try {
      // التحقق من عدم وجود المستخدم مسبقاً
      const savedUsers = JSON.parse(localStorage.getItem("quranUsers") || "{}")
      const emailExists = Object.values(savedUsers).some(
        (u: any) => u.email.toLowerCase() === registerData.email.toLowerCase(),
      )

      if (emailExists) {
        toast({
          title: "خطأ",
          description: "البريد الإلكتروني مستخدم بالفعل",
          variant: "destructive",
        })
        return
      }

      // إنشاء مستخدم جديد
      const newUser = {
        username: registerData.username,
        email: registerData.email.toLowerCase(),
        password: registerData.password,
        isLoggedIn: true,
        plan: {
          type: "khatma",
          value: 1,
          dailyPages: 20,
          totalPages: 604,
          completedPages: 0,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
        },
        notifications: true,
      }

      // حفظ المستخدم الجديد
      savedUsers[newUser.email] = newUser
      localStorage.setItem("quranUsers", JSON.stringify(savedUsers))
      localStorage.setItem("quranCurrentUser", JSON.stringify(newUser))

      setUser(newUser)
      setActiveTab("plan")

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `أهلاً ${newUser.username}، بارك الله في جهودك لقراءة القرآن`,
      })

      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      })

      setFormMode("login")
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      })
    }
  }

  // تحديث خطة القراءة
  const updatePlan = (e: React.FormEvent) => {
    e.preventDefault()

    let totalPages = 604 // عدد صفحات القرآن الكريم
    let dailyPages = 0

    // حساب عدد الصفحات اليومية بناءً على نوع الخطة
    if (user.plan.type === "khatma") {
      totalPages = 604 * user.plan.value
      const days = Math.ceil(
        (new Date(user.plan.endDate).getTime() - new Date(user.plan.startDate).getTime()) / (1000 * 60 * 60 * 24),
      )
      dailyPages = Math.ceil(totalPages / days)
    } else if (user.plan.type === "juz") {
      totalPages = user.plan.value * 20 // كل جزء حوالي 20 صفحة
      const days = Math.ceil(
        (new Date(user.plan.endDate).getTime() - new Date(user.plan.startDate).getTime()) / (1000 * 60 * 60 * 24),
      )
      dailyPages = Math.ceil(totalPages / days)
    } else if (user.plan.type === "hizb") {
      totalPages = user.plan.value * 10 // كل حزب حوالي 10 صفحات
      const days = Math.ceil(
        (new Date(user.plan.endDate).getTime() - new Date(user.plan.startDate).getTime()) / (1000 * 60 * 60 * 24),
      )
      dailyPages = Math.ceil(totalPages / days)
    } else if (user.plan.type === "pages") {
      dailyPages = user.plan.value
      const days = Math.ceil(
        (new Date(user.plan.endDate).getTime() - new Date(user.plan.startDate).getTime()) / (1000 * 60 * 60 * 24),
      )
      totalPages = dailyPages * days
    }

    const updatedUser = {
      ...user,
      plan: {
        ...user.plan,
        dailyPages,
        totalPages,
      },
    }

    setUser(updatedUser)

    // تحديث بيانات المستخدم في التخزين المحلي
    localStorage.setItem("quranCurrentUser", JSON.stringify(updatedUser))

    // تحديث بيانات المستخدم في قائمة المستخدمين
    const savedUsers = JSON.parse(localStorage.getItem("quranUsers") || "{}")
    savedUsers[user.email] = updatedUser
    localStorage.setItem("quranUsers", JSON.stringify(savedUsers))

    setActiveTab("progress")
    toast({
      title: "تم تحديث الخطة",
      description: `ستقرأ ${dailyPages} صفحة يومياً للوصول إلى هدفك`,
    })
  }

  // تحديث التقدم
  const updateProgress = (newPages: number) => {
    const newCompletedPages = user.plan.completedPages + newPages

    const updatedUser = {
      ...user,
      plan: {
        ...user.plan,
        completedPages: newCompletedPages,
      },
    }

    setUser(updatedUser)

    // تحديث بيانات المستخدم في التخزين المحلي
    localStorage.setItem("quranCurrentUser", JSON.stringify(updatedUser))

    // تحديث بيانات المستخدم في قائمة المستخدمين
    const savedUsers = JSON.parse(localStorage.getItem("quranUsers") || "{}")
    savedUsers[user.email] = updatedUser
    localStorage.setItem("quranUsers", JSON.stringify(savedUsers))

    if (newCompletedPages >= user.plan.totalPages) {
      toast({
        title: "تهانينا! 🎉",
        description: "لقد أتممت خطة قراءة القرآن الكريم. بارك الله فيك.",
      })

      if (Notification.permission === "granted") {
        new Notification("تهانينا! 🎉", {
          body: "لقد أتممت خطة قراءة القرآن الكريم. بارك الله فيك.",
          icon: "/quran-icon.png",
        })
      }
    } else {
      toast({
        title: "أحسنت!",
        description: `تم تسجيل ${newPages} صفحة. استمر في القراءة بارك الله فيك.`,
      })
    }
  }

  // إعادة ضبط الخطة
  const resetPlan = () => {
    const updatedUser = {
      ...user,
      plan: {
        ...user.plan,
        completedPages: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
      },
    }

    setUser(updatedUser)

    // تحديث بيانات المستخدم في التخزين المحلي
    localStorage.setItem("quranCurrentUser", JSON.stringify(updatedUser))

    // تحديث بيانات المستخدم في قائمة المستخدمين
    const savedUsers = JSON.parse(localStorage.getItem("quranUsers") || "{}")
    savedUsers[user.email] = updatedUser
    localStorage.setItem("quranUsers", JSON.stringify(savedUsers))

    toast({
      title: "تم إعادة ضبط الخطة",
      description: "يمكنك البدء من جديد. بارك الله في جهودك.",
    })
  }

  // تسجيل الخروج
  const logout = () => {
    // تحديث حالة المستخدم إلى تسجيل الخروج
    const updatedUser = {
      ...user,
      isLoggedIn: false,
    }

    // تحديث بيانات المستخدم في قائمة المستخدمين
    const savedUsers = JSON.parse(localStorage.getItem("quranUsers") || "{}")
    savedUsers[user.email] = updatedUser
    localStorage.setItem("quranUsers", JSON.stringify(savedUsers))

    // إزالة المستخدم الحالي
    localStorage.removeItem("quranCurrentUser")

    // إعادة تعيين حالة المستخدم
    setUser({
      username: "",
      email: "",
      password: "",
      isLoggedIn: false,
      plan: {
        type: "khatma",
        value: 1,
        dailyPages: 20,
        totalPages: 604,
        completedPages: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
      },
      notifications: true,
    })

    setActiveTab("login")

    toast({
      title: "تم تسجيل الخروج",
      description: "نتمنى أن نراك قريباً. بارك الله فيك.",
    })
  }

  // تبديل حالة الإشعارات
  const toggleNotifications = () => {
    if (!user.notifications && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const updatedUser = {
            ...user,
            notifications: true,
          }

          setUser(updatedUser)

          // تحديث بيانات المستخدم في التخزين المحلي
          localStorage.setItem("quranCurrentUser", JSON.stringify(updatedUser))

          // تحديث بيانات المستخدم في قائمة المستخدمين
          const savedUsers = JSON.parse(localStorage.getItem("quranUsers") || "{}")
          savedUsers[user.email] = updatedUser
          localStorage.setItem("quranUsers", JSON.stringify(savedUsers))

          toast({
            title: "تم تفعيل الإشعارات",
            description: "ستتلقى تذكيرات بقراءة القرآن الكريم.",
          })
        } else {
          toast({
            title: "تعذر تفعيل الإشعارات",
            description: "الرجاء السماح بالإشعارات من إعدادات المتصفح.",
            variant: "destructive",
          })
        }
      })
    } else {
      const updatedUser = {
        ...user,
        notifications: !user.notifications,
      }

      setUser(updatedUser)

      // تحديث بيانات المستخدم في التخزين المحلي
      localStorage.setItem("quranCurrentUser", JSON.stringify(updatedUser))

      // تحديث بيانات المستخدم في قائمة المستخدمين
      const savedUsers = JSON.parse(localStorage.getItem("quranUsers") || "{}")
      savedUsers[user.email] = updatedUser
      localStorage.setItem("quranUsers", JSON.stringify(savedUsers))

      toast({
        title: user.notifications ? "تم إيقاف الإشعارات" : "تم تفعيل الإشعارات",
        description: user.notifications ? "لن تتلقى تذكيرات بعد الآن." : "ستتلقى تذكيرات بقراءة القرآن الكريم.",
      })
    }
  }

  // حساب نسبة التقدم
  const progressPercentage = Math.min(Math.round((user.plan.completedPages / user.plan.totalPages) * 100), 100)

  // الصفحات المتبقية
  const remainingPages = Math.max(user.plan.totalPages - user.plan.completedPages, 0)

  // الأيام المتبقية
  const remainingDays = Math.ceil(
    (new Date(user.plan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#1a1a2e] text-right" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-[#2e7d32] dark:text-[#4caf50]" />
              <h1 className="text-2xl font-bold text-[#1b5e20] dark:text-[#81c784]">متابعة ختم القرآن</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-[#e8f5e9] dark:bg-[#1b5e20] text-[#2e7d32] dark:text-[#e8f5e9]"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              {user.isLoggedIn && (
                <div className="flex items-center gap-2">
                  <span className="text-[#1b5e20] dark:text-[#e8f5e9]">{user.username}</span>
                  <User className="h-5 w-5 text-[#2e7d32] dark:text-[#4caf50]" />
                </div>
              )}
            </div>
          </header>

          <main className="max-w-4xl mx-auto">
            <Card className="border-[#2e7d32] dark:border-[#4caf50] bg-white dark:bg-[#222831] shadow-lg">
              <CardHeader className="border-b border-[#e8f5e9] dark:border-[#1b5e20]">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#1b5e20] dark:text-[#e8f5e9] text-xl">
                    {activeTab === "login" && (formMode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد")}
                    {activeTab === "plan" && "تحديد خطة القراءة"}
                    {activeTab === "progress" && "متابعة التقدم"}
                    {activeTab === "settings" && "الإعدادات"}
                  </CardTitle>
                  {user.isLoggedIn && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("progress")}
                        className={`${activeTab === "progress" ? "bg-[#e8f5e9] dark:bg-[#1b5e20]" : ""} flex-1 min-w-[100px]`}
                      >
                        <BookOpen className="h-4 w-4 ml-2" />
                        التقدم
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("plan")}
                        className={`${activeTab === "plan" ? "bg-[#e8f5e9] dark:bg-[#1b5e20]" : ""} flex-1 min-w-[100px]`}
                      >
                        <Calendar className="h-4 w-4 ml-2" />
                        الخطة
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("settings")}
                        className={`${activeTab === "settings" ? "bg-[#e8f5e9] dark:bg-[#1b5e20]" : ""} flex-1 min-w-[100px]`}
                      >
                        <Settings className="h-4 w-4 ml-2" />
                        الإعدادات
                      </Button>
                    </div>
                  )}
                </div>
                <CardDescription className="text-[#388e3c] dark:text-[#a5d6a7]">
                  {activeTab === "login" &&
                    (formMode === "login"
                      ? "أدخل بيانات حسابك للدخول"
                      : "أنشئ حساباً جديداً للبدء في متابعة قراءة القرآن الكريم")}
                  {activeTab === "plan" && "حدد خطة القراءة التي تناسبك"}
                  {activeTab === "progress" && "تابع تقدمك في قراءة القرآن الكريم"}
                  {activeTab === "settings" && "تخصيص إعدادات التطبيق"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                {activeTab === "login" && formMode === "login" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="border-[#2e7d32] dark:border-[#4caf50]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="border-[#2e7d32] dark:border-[#4caf50] pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2e7d32] dark:text-[#4caf50]"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] dark:bg-[#4caf50] dark:hover:bg-[#388e3c]"
                    >
                      دخول
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setFormMode("register")}
                        className="text-[#2e7d32] dark:text-[#4caf50] text-sm hover:underline"
                      >
                        ليس لديك حساب؟ سجل الآن
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "login" && formMode === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">اسم المستخدم</Label>
                      <Input
                        id="register-username"
                        placeholder="أدخل اسم المستخدم"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        className="border-[#2e7d32] dark:border-[#4caf50]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">البريد الإلكتروني</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="border-[#2e7d32] dark:border-[#4caf50]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="border-[#2e7d32] dark:border-[#4caf50] pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2e7d32] dark:text-[#4caf50]"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="أعد إدخال كلمة المرور"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="border-[#2e7d32] dark:border-[#4caf50]"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] dark:bg-[#4caf50] dark:hover:bg-[#388e3c]"
                    >
                      إنشاء حساب
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setFormMode("login")}
                        className="text-[#2e7d32] dark:text-[#4caf50] text-sm hover:underline"
                      >
                        لديك حساب بالفعل؟ سجل دخول
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "plan" && (
                  <form onSubmit={updatePlan} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="plan-type">نوع الخطة</Label>
                        <Select
                          value={user.plan.type}
                          onValueChange={(value) => setUser({ ...user, plan: { ...user.plan, type: value } })}
                        >
                          <SelectTrigger id="plan-type" className="border-[#2e7d32] dark:border-[#4caf50]">
                            <SelectValue placeholder="اختر نوع الخطة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="khatma">عدد الختمات</SelectItem>
                            <SelectItem value="juz">عدد الأجزاء</SelectItem>
                            <SelectItem value="hizb">عدد الأحزاب</SelectItem>
                            <SelectItem value="pages">عدد الصفحات اليومية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plan-value">
                          {user.plan.type === "khatma" && "عدد الختمات"}
                          {user.plan.type === "juz" && "عدد الأجزاء"}
                          {user.plan.type === "hizb" && "عدد الأحزاب"}
                          {user.plan.type === "pages" && "عدد الصفحات اليومية"}
                        </Label>
                        <Input
                          id="plan-value"
                          type="number"
                          min="1"
                          value={user.plan.value}
                          onChange={(e) =>
                            setUser({ ...user, plan: { ...user.plan, value: Number.parseInt(e.target.value) || 1 } })
                          }
                          className="border-[#2e7d32] dark:border-[#4caf50]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">تاريخ البداية</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={user.plan.startDate}
                            onChange={(e) => setUser({ ...user, plan: { ...user.plan, startDate: e.target.value } })}
                            className="border-[#2e7d32] dark:border-[#4caf50]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">تاريخ النهاية</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={user.plan.endDate}
                            onChange={(e) => setUser({ ...user, plan: { ...user.plan, endDate: e.target.value } })}
                            className="border-[#2e7d32] dark:border-[#4caf50]"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] dark:bg-[#4caf50] dark:hover:bg-[#388e3c]"
                    >
                      تحديث الخطة
                    </Button>
                  </form>
                )}

                {activeTab === "progress" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#1b5e20] dark:text-[#e8f5e9] font-medium">التقدم الكلي</span>
                        <span className="text-[#2e7d32] dark:text-[#4caf50] font-bold">{progressPercentage}%</span>
                      </div>
                      <Progress
                        value={progressPercentage}
                        className="h-3 bg-[#e8f5e9] dark:bg-[#1b5e20]"
                        indicatorClassName="bg-[#2e7d32] dark:bg-[#4caf50]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-[#e8f5e9] dark:bg-[#1b5e20] border-none">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-[#1b5e20] dark:text-[#e8f5e9] text-sm mb-1">الصفحات المقروءة</p>
                            <p className="text-[#2e7d32] dark:text-[#4caf50] text-2xl font-bold">
                              {user.plan.completedPages}
                            </p>
                            <p className="text-[#388e3c] dark:text-[#a5d6a7] text-xs">من أصل {user.plan.totalPages}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-[#e8f5e9] dark:bg-[#1b5e20] border-none">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-[#1b5e20] dark:text-[#e8f5e9] text-sm mb-1">الصفحات المتبقية</p>
                            <p className="text-[#2e7d32] dark:text-[#4caf50] text-2xl font-bold">{remainingPages}</p>
                            <p className="text-[#388e3c] dark:text-[#a5d6a7] text-xs">
                              {remainingDays > 0 ? `${remainingDays} يوم متبقي` : "انتهت المدة"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[#1b5e20] dark:text-[#e8f5e9] font-medium">تسجيل القراءة اليومية</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateProgress(user.plan.dailyPages)}
                          className="flex-1 bg-[#2e7d32] hover:bg-[#1b5e20] dark:bg-[#4caf50] dark:hover:bg-[#388e3c]"
                        >
                          <Check className="h-4 w-4 ml-2" />
                          قرأت الورد اليومي ({user.plan.dailyPages} صفحة)
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateProgress(5)}
                          variant="outline"
                          className="flex-1 border-[#2e7d32] text-[#2e7d32] hover:bg-[#f0f9f0] dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#222831]"
                        >
                          +5 صفحات
                        </Button>
                        <Button
                          onClick={() => updateProgress(10)}
                          variant="outline"
                          className="flex-1 border-[#2e7d32] text-[#2e7d32] hover:bg-[#f0f9f0] dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#222831]"
                        >
                          +10 صفحات
                        </Button>
                        <Button
                          onClick={() => updateProgress(20)}
                          variant="outline"
                          className="flex-1 border-[#2e7d32] text-[#2e7d32] hover:bg-[#f0f9f0] dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#222831]"
                        >
                          +20 صفحة
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="عدد الصفحات"
                          className="border-[#2e7d32] dark:border-[#4caf50]"
                          id="custom-pages"
                        />
                        <Button
                          onClick={() => {
                            const input = document.getElementById("custom-pages") as HTMLInputElement
                            const pages = Number.parseInt(input.value)
                            if (pages > 0) {
                              updateProgress(pages)
                              input.value = ""
                            }
                          }}
                          className="bg-[#2e7d32] hover:bg-[#1b5e20] dark:bg-[#4caf50] dark:hover:bg-[#388e3c]"
                        >
                          إضافة
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">الإشعارات</Label>
                        <p className="text-[#388e3c] dark:text-[#a5d6a7] text-sm">تلقي تذكيرات بقراءة القرآن الكريم</p>
                      </div>
                      <Switch id="notifications" checked={user.notifications} onCheckedChange={toggleNotifications} />
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={() => setActiveTab("plan")}
                        variant="outline"
                        className="w-full border-[#2e7d32] text-[#2e7d32] hover:bg-[#f0f9f0] dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#222831]"
                      >
                        <Calendar className="h-4 w-4 ml-2" />
                        تعديل خطة القراءة
                      </Button>

                      <Button
                        onClick={resetPlan}
                        variant="outline"
                        className="w-full border-[#2e7d32] text-[#2e7d32] hover:bg-[#f0f9f0] dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#222831]"
                      >
                        <BookOpen className="h-4 w-4 ml-2" />
                        إعادة ضبط التقدم
                      </Button>

                      <Button onClick={logout} variant="destructive" className="w-full">
                        <User className="h-4 w-4 ml-2" />
                        تسجيل الخروج
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-[#e8f5e9] dark:border-[#1b5e20] pt-4 flex justify-between items-center">
                <div className="text-[#388e3c] dark:text-[#a5d6a7] text-sm">
                  {user.isLoggedIn && activeTab === "progress" && <>الورد اليومي: {user.plan.dailyPages} صفحة</>}
                </div>
                <div className="flex items-center gap-2 text-[#2e7d32] dark:text-[#4caf50] text-sm">
                  <Bell className="h-4 w-4" />
                  <span>رمضان كريم</span>
                </div>
              </CardFooter>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-[#388e3c] dark:text-[#a5d6a7] text-sm">{'"وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"'}</p>
              <p className="text-[#1b5e20] dark:text-[#e8f5e9] text-xs mt-2">تم إنشاء هذا التطبيق بواسطة آدم ضالع</p>
            </div>
          </main>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

