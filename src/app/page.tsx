'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { MessageSquare, FileText, Zap, Shield, Users, TrendingUp, Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react'

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
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Handle navbar show/hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 10) {
        // Always show navbar at the top
        setIsNavbarVisible(true)
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide navbar
        setIsNavbarVisible(false)
      } else {
        // Scrolling up - show navbar
        setIsNavbarVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

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
      {/* Navbar */}
      <header
        style={{
          transform: isNavbarVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isNavbarVisible ? 1 : 0,
          transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-100/50 backdrop-blur-md"
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">AI Hub</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium transition-colors cursor-pointer">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium transition-colors cursor-pointer">
                How It Works
              </a>
              <a href="#contact" className="text-gray-700 hover:text-purple-600 font-medium transition-colors cursor-pointer">
                Contact
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push(authUrl)}
                className="hidden sm:inline-flex text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                Log In
              </Button>
              <Button
                data-testid="header-login-btn"
                onClick={() => router.push(authUrl)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 shadow-lg shadow-purple-200/50 cursor-pointer"
              >
                Get Started
              </Button>
            </div>
          </div>
        </nav>
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
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-purple-200 cursor-pointer"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-white/50">
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

      {/* Detailed Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div>
          {[
            {
              title: "AI-Powered Document Intelligence",
              description: "Upload any document format and let our AI automatically extract, index, and make your content searchable. From PDFs to presentations, your knowledge becomes instantly accessible.",
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center",
              reverse: false,
            },
            {
              title: "Smart Chat Interface",
              description: "Ask questions in natural language and get instant, accurate answers from your entire knowledge base. Our AI understands context and provides relevant information with source citations.",
              image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&crop=center",
              reverse: true,
            },
            {
              title: "Enterprise-Grade Security",
              description: "Protect your company's sensitive information with role-based access control, end-to-end encryption, and comprehensive audit logs. Your data stays secure and compliant.",
              image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop&crop=center",
              reverse: false,
            },
            {
              title: "Seamless Team Collaboration",
              description: "Share knowledge across your entire organization. Team members can access relevant information instantly, reducing support tickets and improving productivity.",
              image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center",
              reverse: true,
            },
          ].map((section, index) => (
            <section
              key={index}
              className={`py-24 px-6 lg:px-12 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
            >
              <div
                className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center ${section.reverse ? "md:flex-row-reverse" : ""}`}
              >
                <div className={section.reverse ? "md:order-2" : ""}>
                  <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 mb-10 text-xl">
                    {section.description}
                  </p>
                  <button
                    onClick={() => router.push(authUrl)}
                    className="group flex items-center space-x-3 bg-purple-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-purple-700 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <span>Get Started</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className={`relative ${section.reverse ? "md:order-1" : ""}`}>
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-[600px] object-cover transform hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MDAgMzAwSDQyMFYzMjBINDAwVjMwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTM4MCAzNDBINDAwVjM2MEgzODBWMzQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNDIwIDM0MEg0NDBWMzYwSDQyMFYzNDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iNDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPkltYWdlIExvYWRpbmcuLi48L3RleHQ+Cjwvc3ZnPgo='
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                </div>
              </div>
            </section>
          ))}
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
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 text-lg font-semibold cursor-pointer"
            >
              Start Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-br from-gray-50 to-purple-50/30 border-t border-purple-100">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">AI Hub</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Transform your company communication with AI-powered knowledge management.
              </p>
              <div className="flex gap-3">
                <a href="https://x.com/HarshThaku44904" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors cursor-pointer">
                  <Twitter className="w-4 h-4 text-purple-600" />
                </a>
                <a href="https://www.linkedin.com/in/harshthakur76/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors cursor-pointer">
                  <Linkedin className="w-4 h-4 text-purple-600" />
                </a>
                <a href="https://github.com/Harshthakur24/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors cursor-pointer">
                  <Github className="w-4 h-4 text-purple-600" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Integrations</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">API Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Press Kit</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-600 text-sm">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <a href="mailto:thakur2004harsh@gmail.com" className="hover:text-purple-600 transition-colors">thakur2004harsh@gmail.com</a>
                </li>
                <li className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <a href="tel: +91 9311840704" className="hover:text-purple-600 transition-colors">+91 9311840704</a>
                </li>
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                  <span>New Delhi, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-purple-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-sm">
                &copy; 2025 AI Hub. All rights reserved. Powered by RAG Technology.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Privacy Policy</a>
                <a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Terms of Service</a>
                <a href="#" className="text-gray-600 hover:text-purple-600 text-sm transition-colors cursor-pointer">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
