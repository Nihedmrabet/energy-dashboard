"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Dashboard } from "@/components/dashboard"
import { LogOut } from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
      }
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription?.unsubscribe()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  /**
   * -------------------------------------------------
   * LOADING ANIMATION
   * -------------------------------------------------
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-white text-xl font-medium"
        >
          Chargement...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">

      {/* -------------------------------------------------
          HEADER ANIMÉ
      ------------------------------------------------- */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center"
      >
        <div>
          <p className="text-slate-400 text-sm">Logged in as: {user?.email}</p>
        </div>

        {/* Bouton logout animé */}
        <motion.button
          whileHover={{ scale: 1.05, opacity: 0.9 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Log out
        </motion.button>
      </motion.div>

      {/* -------------------------------------------------
          DASHBOARD ANIMÉ (fade + slide)
      ------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <Dashboard />
      </motion.div>
    </div>
  )
}
