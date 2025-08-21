import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Search,
  FileText,
  Handshake,
  Truck,
  Star,
  Award,
  TrendingUp,
  Zap,
  Target,
  Heart
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Globe className="h-10 w-10 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Solomon Bharat
                </span>
                <p className="text-xs text-gray-500 -mt-1">Global Trade Simplified</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">How It Works</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#success-stories" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Success Stories</a>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Sign In</Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 mb-8">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ Global Buyers</span>
            <div className="flex -space-x-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Global Buyers, Meet<br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Verified Indian Suppliers
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Solomon Bharat is your <span className="font-semibold text-blue-600">AI-powered</span> partner for sourcing high-quality products from India. 
            We handle everything from supplier discovery to payment settlement, so you can focus on growing your business.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="text-sm text-gray-600">Verified Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">$50M+</div>
              <div className="text-sm text-gray-600">Trade Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">48hrs</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/register" 
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Find Suppliers Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/supplier/login" 
              className="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center"
            >
              <Users className="mr-2 h-5 w-5" />
              Supplier Portal
            </Link>
          </div>

          {/* Video/Demo Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">See Solomon Bharat in Action</h3>
                  <p className="text-gray-600">Watch how we connect global buyers with verified Indian suppliers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Solomon Bharat?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine AI-powered matching with human expertise to ensure you get the right product, 
              from the right supplier, at the right price.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Buyers */}
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Global Buyers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Access to 10,000+ verified Indian suppliers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">AI-powered supplier matching</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Quality control & compliance checks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">End-to-end logistics support</span>
                </li>
              </ul>
            </div>

            {/* For Suppliers */}
            <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Indian Suppliers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Direct access to global buyers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Secure payment processing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Export documentation support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Marketing & visibility boost</span>
                </li>
              </ul>
            </div>

            {/* Trust & Security */}
            <div className="group bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trust & Security</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">100% verified suppliers</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Secure escrow payments</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Quality guarantees</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Dispute resolution</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Solomon Bharat Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, transparent process from requirement to delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Submit RFQ</h3>
              <p className="text-gray-600">Tell us what you need with detailed specifications and requirements</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Matching</h3>
              <p className="text-gray-600">Our AI finds the best suppliers from our verified network instantly</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Handshake className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Quotes</h3>
              <p className="text-gray-600">Compare vetted quotations and negotiate the best terms</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fulfillment</h3>
              <p className="text-gray-600">We handle quality control, logistics, and secure payments</p>
            </div>
          </div>

          {/* Process Flow */}
          <div className="mt-16 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 via-orange-200 to-purple-200 transform -translate-y-1/2 hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how businesses worldwide are growing with Solomon Bharat
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100 shadow-lg">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Solomon Bharat helped us find the perfect textile supplier in India. The quality is exceptional and delivery was on time. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">John Davis</div>
                  <div className="text-sm text-gray-600">CEO, Fashion Forward Ltd</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-100 shadow-lg">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The AI matching system is incredible. We found 3 perfect spice suppliers within 24 hours. The platform saved us months of research!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Miller</div>
                  <div className="text-sm text-gray-600">Procurement Head, Global Foods</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 shadow-lg">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "As a supplier, Solomon Bharat opened doors to international markets. We've increased our exports by 300% in just 6 months!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">RK</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Rajesh Kumar</div>
                  <div className="text-sm text-gray-600">MD, Global Textiles Pvt Ltd</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Source Smarter from India?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of global buyers who trust Solomon Bharat for their sourcing needs. 
              Start your journey today and discover the power of AI-driven supplier matching.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                to="/register" 
                className="group bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Start Sourcing Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/supplier/login" 
                className="group border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center"
              >
                <Heart className="mr-2 h-5 w-5" />
                Join as Supplier
              </Link>
            </div>

            <div className="text-blue-100 text-sm">
              ✨ No setup fees • 🚀 Get started in minutes • 🔒 100% secure
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-8 w-8 text-blue-400" />
                <div>
                  <span className="text-2xl font-bold">Solomon Bharat</span>
                  <p className="text-xs text-gray-400 -mt-1">Global Trade Simplified</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Making Indian exports simpler, safer, and more transparent for global buyers through AI-powered matching.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">For Buyers</h4>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Sign Up Free</Link></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />How It Works</a></li>
                <li><a href="#success-stories" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Success Stories</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">For Suppliers</h4>
              <ul className="space-y-3">
                <li><Link to="/supplier/login" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Supplier Portal</Link></li>
                <li><a href="mailto:partners@solomonbharat.com" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Partnership</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Requirements</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" />Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2025 Solomon Bharat. All rights reserved. Made with ❤️ for global trade.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center"><Shield className="h-4 w-4 mr-1" />Secure Platform</span>
                <span className="flex items-center"><Award className="h-4 w-4 mr-1" />ISO Certified</span>
                <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1" />Trusted by 10K+</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;