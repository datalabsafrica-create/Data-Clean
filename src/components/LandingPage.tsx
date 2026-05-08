import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, BarChart3, Fingerprint, Database, ArrowRight, CheckCircle2, Moon, Sun } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo?: () => void;
}

export default function LandingPage({ onGetStarted, onViewDemo }: LandingPageProps) {
  const [isDark, setIsDark] = useState(false);

  // Toggle dark mode by adding/removing class on document element
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10 glass-panel sticky top-0 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Sparkles size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            CleanFlow AI
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="hidden md:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Log in
          </button>
          <button 
            onClick={onGetStarted}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            Start Free
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-24 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>AI-Powered Data Cleaning is Here</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
            Stop wrestling with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              messy datasets.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            CleanFlow AI automatically detects anomalies, fills missing values, and standardizes formats in seconds. Like having an expert data analyst on your team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              Upload Dataset
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={onViewDemo}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-full text-lg font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              View Example Demo
            </button>
          </div>
        </motion.div>


      </main>

      {/* Feature Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Intelligent Data Prep</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Everything you need to turn raw data into pure insights.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Database className="text-indigo-500" size={32} />}
              title="Universal Formats"
              description="Drop CSV, Excel, or JSON files. We parse them instantly in your browser with complete privacy."
            />
            <FeatureCard 
              icon={<Sparkles className="text-purple-500" size={32} />}
              title="AI Assistants"
              description="Our LLMs analyze your schemas, find anomalies, and suggest natural-language fixes."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-blue-500" size={32} />}
              title="Quality Scoring"
              description="Get instant visual overviews of missing data, outliers, and formatting inconsistencies."
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles size={20} className="text-indigo-500" />
          <span className="font-semibold text-slate-900 dark:text-white">CleanFlow AI</span>
        </div>
        <p>&copy; {new Date().getFullYear()} CleanFlow AI. Demo Applet.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
      <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
