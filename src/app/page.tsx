'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { MessageSquare, FileText, Zap, Shield, Users, TrendingUp } from 'lucide-react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="fade-in glass rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
      <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const redirectUrl = encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`)
  const authUrl = `/auth`

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render landing page if user is authenticated (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">AI Hub</span>
          </div>
          <Button
            data-testid="header-login-btn"
            onClick={() => router.push(authUrl)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="slide-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Company&apos;s
              <br />
              <span className="gradient-text">AI Knowledge Hub</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Replace internal emails with intelligent, always-updated communication.
              Instant answers to any company query, powered by RAG technology.
            </p>
            <Button
              data-testid="hero-get-started-btn"
              onClick={() => router.push(authUrl)}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-purple-200"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8 text-purple-600" />}
              title="AI Chat Interface"
              description="Natural language queries with instant, accurate answers from your knowledge base."
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8 text-purple-600" />}
              title="Document Intelligence"
              description="Upload PDFs, DOCX, and text files. AI automatically indexes and retrieves relevant info."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-purple-600" />}
              title="Real-Time Updates"
              description="Event-driven architecture ensures your knowledge base is always current."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-purple-600" />}
              title="Enterprise Security"
              description="Role-based access control, end-to-end encryption, and full audit logs."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-purple-600" />}
              title="Team Collaboration"
              description="Shared knowledge base accessible to all team members with proper permissions."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
              title="Integration Ready"
              description="Connect with Slack, Teams, Jira, and Notion for seamless workflows."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass rounded-3xl p-12 shadow-xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Company Communication?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join modern teams using AI-powered knowledge management.
            </p>
            <Button
              data-testid="cta-get-started-btn"
              onClick={() => router.push(authUrl)}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 text-lg font-semibold"
            >
              Start Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-purple-100">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2025 AI Hub. Powered by RAG Technology.</p>
        </div>
      </footer>
    </div>
  )
}
