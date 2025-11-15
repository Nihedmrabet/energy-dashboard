"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";

// 👉 Ajout Framer Motion
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) setMessage(msg);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">

      {/* 🎨 Animation d’apparition de la carte */}
      <motion.div
        initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚡ Smart Energy</h1>
          <p className="text-slate-400">Solar and wind energy monitoring</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
              <motion.input
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 12px rgba(48,200,160,0.25)"
                }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <motion.input
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 12px rgba(48,200,160,0.25)"
                }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Success Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-emerald-900/20 border border-emerald-700 rounded-lg text-emerald-400 text-sm"
              >
                {message}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260 }}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-medium rounded-lg"
            >
              {loading ? "Connecting..." : "Log in"}
            </motion.button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Don't have an account yet?{" "}
              <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300">
                Register
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
