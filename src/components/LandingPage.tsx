'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display antialiased">
      {/* Hero Gradient Background */}
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(180deg, #FBBF24, #FFFFF0, #F4A460, #3B0066);
          mix-blend-mode: multiply;
          filter: blur(80px);
        }
      `}</style>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Image
                src="/logo/credation-logo_final.png"
                alt="Credation Logo"
                width={180}
                height={45}
                className="h-8 w-auto"
                priority
              />
            </div>
            <div className="hidden md:flex md:items-center md:space-x-8">
              {/* Navigation items can be added here */}
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT dark:hover:text-primary-light">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary-DEFAULT rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-16">
        {/* Hero Background Gradient */}
        <div className="absolute inset-0 w-full h-full hero-gradient opacity-30 dark:opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-light dark:text-text-dark">
                Secure, Verifiable
                <span className="block text-primary-DEFAULT">Academic Credentials</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0">
                A seamless platform for students and faculty to manage, verify, and showcase academic
                achievements with the power of modern technology.
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                <Link href="/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT">
                  Get Started
                  <span className="material-icons ml-2">arrow_forward</span>
                </Link>
              </div>
            </div>
            
            {/* Dashboard Preview */}
            <div className="relative hidden md:block">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative bg-card-light dark:bg-card-dark p-6 rounded-2xl shadow-2xl border border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="material-icons text-gray-400">school</span>
                    <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">STUDENT DASHBOARD</span>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-primary-DEFAULT/20 flex items-center justify-center">
                      <span className="material-icons text-primary-DEFAULT text-2xl">school</span>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-text-light dark:text-text-dark">Web Development Certificate</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Issued by: CS Department</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                      Approved
                    </span>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-primary-DEFAULT rounded-lg hover:bg-primary-dark">
                      View Details
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg border border-border-light dark:border-border-dark">
                  <p className="font-semibold text-text-light dark:text-text-dark">Pending Approval</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">AI in Research - Certificate</p>
                  <div className="mt-3 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-2 bg-yellow-400 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900" id="features">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-text-light dark:text-text-dark sm:text-4xl">
              A Platform Built for the Future of Education
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Empowering students and faculty with robust, modern tools.
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-light/20 dark:bg-primary-dark/30 text-primary-DEFAULT">
                <span className="material-icons">school</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">📚 All-in-One Student Portfolio</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Capture every achievement — from academics to hidden contributions — across 6+ activity categories in a single trusted hub.
              </p>
            </div>

            <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-light/20 dark:bg-primary-dark/30 text-primary-DEFAULT">
                <span className="material-icons">integration_instructions</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">🔗 Seamless Integrations</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Easily sync with leading LMS/ERP platforms (Samarth, Fedena, Moodle, and more) through our API-first engine.
              </p>
            </div>

            <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-light/20 dark:bg-primary-dark/30 text-primary-DEFAULT">
                <span className="material-icons">security</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">🔐 Fraud-Proof Certifications</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Every certificate is validated on Hyperledger Fabric blockchain with smart contracts — ensuring authenticity you can trust.
              </p>
            </div>

            <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-light/20 dark:bg-primary-dark/30 text-primary-DEFAULT">
                <span className="material-icons">verified_user</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">✅ Faculty-Verified Credentials</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Upload external certificates, and once approved by faculty, they&apos;re instantly added to your profile.
              </p>
            </div>

            <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-light/20 dark:bg-primary-dark/30 text-primary-DEFAULT">
                <span className="material-icons">psychology</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">🤖 AI-Powered Insights</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Ask questions, generate reports, or explore your journey with our interactive AI chatbot.
              </p>
            </div>

            <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-light/20 dark:bg-primary-dark/30 text-primary-DEFAULT">
                <span className="material-icons">assessment</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">📊 Compliance Made Simple</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Generate NAAC, NIRF, and AICTE-ready audit dashboards in one click — with prebuilt accreditation templates.
              </p>
            </div>

            <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-light/20 dark:bg-primary-dark/30 text-primary-DEFAULT">
                <span className="material-icons">work</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">💼 Smart Career Portfolio</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Get an automatically generated professional portfolio — shareable as a responsive web page or downloadable PDF.
              </p>
            </div>

            <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-light/20 dark:bg-primary-dark/30 text-primary-DEFAULT">
                <span className="material-icons">face</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-text-light dark:text-text-dark">🧑‍🤝‍🧑 Verified Attendance System</h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Dual-authentication with QR and AI-driven facial recognition ensures foolproof attendance records for events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24" id="how-it-works">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-DEFAULT font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-text-light dark:text-text-dark sm:text-4xl">
              A Simple, Transparent Process
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
              Three easy steps to a verified digital credential portfolio.
            </p>
          </div>
          
          <div className="mt-12">
            <div className="relative">
              <div aria-hidden="true" className="absolute left-1/2 -ml-px h-full w-0.5 bg-border-light dark:bg-border-dark"></div>
              
              {/* Step 1 */}
              <div className="relative flex items-start group mb-12">
                <div className="w-1/2 pr-8 text-right">
                  <h3 className="text-xl font-bold text-text-light dark:text-text-dark">1. Upload Certificate</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Students securely upload their certificate or proof of achievement through their personal dashboard.
                  </p>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-background-light dark:bg-background-dark p-1 rounded-full">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-DEFAULT text-white">
                    <span className="material-icons">upload_file</span>
                  </div>
                </div>
                <div className="w-1/2 pl-8"></div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start group mb-12">
                <div className="w-1/2 pr-8"></div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-background-light dark:bg-background-dark p-1 rounded-full">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-DEFAULT text-white">
                    <span className="material-icons">how_to_reg</span>
                  </div>
                </div>
                <div className="w-1/2 pl-8 text-left">
                  <h3 className="text-xl font-bold text-text-light dark:text-text-dark">2. Faculty Review</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Designated faculty members are notified and can review the submission, then approve or reject it with comments.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start group">
                <div className="w-1/2 pr-8 text-right">
                  <h3 className="text-xl font-bold text-text-light dark:text-text-dark">3. Portfolio Updated</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Upon approval, the credential is instantly added to the student&apos;s verified portfolio, ready to be shared.
                  </p>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-background-light dark:bg-background-dark p-1 rounded-full">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-DEFAULT text-white">
                    <span className="material-icons">card_membership</span>
                  </div>
                </div>
                <div className="w-1/2 pl-8"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-border-light dark:border-border-dark">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <Image
                src="/logo/credation-logo_final.png"
                alt="Credation Logo"
                width={200}
                height={50}
                className="h-8 w-auto"
              />
              <p className="text-gray-500 dark:text-gray-400 text-base">
                Modernizing academic credentials for the digital age.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Solutions
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#features">Student Portfolio</a></li>
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#features">Faculty Dashboard</a></li>
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#features">Verification API</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#contact">Documentation</a></li>
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#contact">Contact Us</a></li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#about">About</a></li>
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#careers">Careers</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                    Legal
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#privacy">Privacy</a></li>
                    <li><a className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT" href="#terms">Terms</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-border-light dark:border-border-dark pt-8">
            <p className="text-base text-gray-400 dark:text-gray-500 xl:text-center">
              © 2024 Credation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}