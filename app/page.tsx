'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
type SectionId = 'home' | 'services' | 'clinics' | 'contact' | 'appointment';
type UserRole = 'patient' | 'doctor';
export default function HealthcareLanding() {
  const [headerBg, setHeaderBg] = useState('bg-white/95');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHeaderBg('bg-white/98');
      } else {
        setHeaderBg('bg-white/95');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const selectRole = (role:UserRole) => {
    if (role === 'patient') {
      router.push('/patient-login');

    } else if (role === 'doctor') {
      // alert('Redirecting to Doctor Portal...');
      router.push('/login')
    }
  };

  const scrollToSection = (sectionId:SectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your medical data is protected with bank-level encryption and HIPAA compliance standards.'
    },
    {
      icon: '⚡',
      title: 'Fast Appointments',
      description: 'Book appointments instantly with available doctors in your area or consult online.'
    },
    {
      icon: '📱',
      title: '24/7 Access',
      description: 'Access your health records, prescriptions, and telemedicine services anytime, anywhere.'
    },
    {
      icon: '🧠',
      title: 'AI-Powered Insights',
      description: 'Get personalized health recommendations powered by advanced AI and machine learning.'
    },
    {
      icon: '🌐',
      title: 'Integrated Network',
      description: 'Connect with a vast network of specialists, labs, and healthcare providers.'
    },
    {
      icon: '📊',
      title: 'Health Analytics',
      description: 'Track your health progress with detailed analytics and visual health reports.'
    }
  ];

  return (
    <div className="font-sans overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 w-full ${headerBg} backdrop-blur-lg border-b border-black/10 z-50 transition-all duration-300`}>
        <nav className="flex justify-between items-center px-8 py-4 max-w-6xl mx-auto">
          <button 
            onClick={() => scrollToSection('home')}
            className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            N6T Technologies
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('services')} className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection('clinics')} className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Clinics
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Contact
            </button>
            <button 
              onClick={() => scrollToSection('appointment')}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
            >
              Make an Appointment
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-lg border-t border-gray-200 shadow-lg">
            <div className="px-8 py-4 space-y-4">
              <button 
                onClick={() => {
                  scrollToSection('home');
                  setMobileMenuOpen(false);
                }} 
                className="block w-full text-left text-gray-700 font-medium hover:text-blue-600 transition-colors py-2"
              >
                Home
              </button>
              <button 
                onClick={() => {
                  scrollToSection('services');
                  setMobileMenuOpen(false);
                }} 
                className="block w-full text-left text-gray-700 font-medium hover:text-blue-600 transition-colors py-2"
              >
                Services
              </button>
              <button 
                onClick={() => {
                  scrollToSection('clinics');
                  setMobileMenuOpen(false);
                }} 
                className="block w-full text-left text-gray-700 font-medium hover:text-blue-600 transition-colors py-2"
              >
                Clinics
              </button>
              <button 
                onClick={() => {
                  scrollToSection('contact');
                  setMobileMenuOpen(false);
                }} 
                className="block w-full text-left text-gray-700 font-medium hover:text-blue-600 transition-colors py-2"
              >
                Contact
              </button>
              <button 
                onClick={() => {
                  scrollToSection('appointment');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 mt-4"
              >
                Make an Appointment
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 flex items-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/10 rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-white/15 rounded-full animate-pulse animation-delay-2000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center relative z-10">
          {/* Hero Text */}
          <div className="text-center md:text-left animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Advanced Healthcare Solutions
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Experience the future of healthcare with our comprehensive digital platform. 
              Connect with doctors/patients, manage appointments, and access your medical records seamlessly.
            </p>
          </div>
          
          {/* Role Selector */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 animate-fade-in-up animation-delay-300">
            <h3 className="text-white text-2xl font-semibold mb-6 text-center">
              Choose Your Role to Continue
            </h3>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => selectRole('patient')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-8 rounded-full text-lg font-semibold transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700 active:bg-emerald-900"
              >
                🩺 I AM A PATIENT
              </button>
              <button 
                onClick={() => selectRole('doctor')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-full text-lg font-semibold transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700 active:bg-blue-900"
              >
                👨‍⚕️ I AM A DOCTOR
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-12">
            Why Choose N6T Healthcare?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Placeholder sections for other nav items */}
      <section id="clinics" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Partner Clinics</h2>
          <p className="text-xl text-gray-600">Connect with our network of certified healthcare providers.</p>
        </div>
      </section>

      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-12">
            Contact Us
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Phone */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group animate-fade-in-up">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                📞
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600 leading-relaxed">+91 8908329226</p>
            </div>

            {/* Email */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group animate-fade-in-up" style={{ animationDelay: `100ms` }}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                📧
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
              <a href="team@n6t.in" className="text-gray-600 leading-relaxed">team@n6t.in </a>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@teamclinqow@gmail.com"
                target="_blank"
                rel="noopener noreferrer" className="text-gray-600 leading-relaxed">teamclinqow@gmail.com</a>
            </div>

            {/* Website */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group animate-fade-in-up" style={{ animationDelay: `200ms` }}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                🌐
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Website</h3>
              <a href="https://www.n6thealth.com" target="_blank" className="text-blue-600 hover:underline">www.n6t.in</a>
            </div>

            {/* Address */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group animate-fade-in-up" style={{ animationDelay: `300ms` }}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                📍
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600 leading-relaxed">
                N6T Tech Park,<br />
                Sector-5, Bangalore,<br />
                India
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="appointment" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Book Your Appointment</h2>
          <p className="text-xl text-gray-600">Schedule your consultation with our expert doctors.</p>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease forwards;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        @media (max-width: 768px) {
          .grid.md\\:grid-cols-2 {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}