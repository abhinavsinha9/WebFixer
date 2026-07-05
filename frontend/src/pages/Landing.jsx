import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineBugAnt, HiOutlineBolt, HiOutlineShieldCheck, HiOutlineChartBar,
  HiOutlineEye, HiOutlineMagnifyingGlass, HiOutlineDocumentText, HiOutlineCodeBracket,
  HiOutlineArrowRight, HiOutlineCheck, HiOutlineStar, HiOutlineChevronDown,
  HiOutlineGlobeAlt, HiOutlineCpuChip, HiOutlineCommandLine, HiOutlineRocketLaunch,
  HiOutlineSun, HiOutlineMoon, HiOutlineEnvelope, HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const Landing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    { icon: HiOutlineBugAnt, title: 'Smart Bug Detection', desc: 'AI-powered scanning detects bugs, broken links, console errors, and code smells across your entire project.', color: 'from-red-500 to-rose-500' },
    { icon: HiOutlineBolt, title: 'Performance Audit', desc: 'Lighthouse-style analysis measuring LCP, INP, CLS, bundle size, and optimization opportunities.', color: 'from-amber-500 to-orange-500' },
    { icon: HiOutlineShieldCheck, title: 'Security Scanner', desc: 'Detect XSS vulnerabilities, hardcoded secrets, dependency issues, and OWASP top 10 risks.', color: 'from-emerald-500 to-green-500' },
    { icon: HiOutlineEye, title: 'Accessibility Check', desc: 'WCAG 2.1 compliance validation including ARIA labels, color contrast, keyboard navigation.', color: 'from-blue-500 to-cyan-500' },
    { icon: HiOutlineMagnifyingGlass, title: 'SEO Analyzer', desc: 'Meta tags, Open Graph, structured data, heading hierarchy, and search ranking factors.', color: 'from-violet-500 to-purple-500' },
    { icon: HiOutlineCpuChip, title: 'AI Suggestions', desc: 'GPT-powered code review generating refactoring suggestions, architecture improvements, and best practices.', color: 'from-pink-500 to-rose-500' },
  ];

  const workflow = [
    { step: '01', title: 'Import Project', desc: 'Upload ZIP, connect GitHub, or paste a URL to import your project.' },
    { step: '02', title: 'Auto-Analyze', desc: 'Our engine scans every file for bugs, performance issues, and vulnerabilities.' },
    { step: '03', title: 'Review Results', desc: 'Browse categorized issues with severity levels, affected files, and fix suggestions.' },
    { step: '04', title: 'Export Reports', desc: 'Generate professional PDF, CSV, or Excel reports for stakeholders.' },
  ];

  const pricing = [
    { name: 'Starter', price: 'Free', features: ['3 projects', '100 files per scan', 'Basic analysis', 'Bug reports', 'Community support'], popular: false },
    { name: 'Pro', price: '$19', features: ['Unlimited projects', 'Unlimited file scans', 'AI-powered suggestions', 'PDF/Excel export', 'Priority support', 'GitHub integration'], popular: true },
    { name: 'Enterprise', price: '$49', features: ['Everything in Pro', 'Team collaboration', 'Custom rules', 'API access', 'SSO/SAML', 'Dedicated support', 'SLA guarantee'], popular: false },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Frontend Lead @ Stripe', text: 'BugFinder caught 47 accessibility issues we missed. The AI suggestions saved us weeks of manual review.', rating: 5 },
    { name: 'Marcus Johnson', role: 'CTO @ Startup', text: 'We integrated BugFinder into our CI pipeline. Our code quality score went from 62 to 94 in two months.', rating: 5 },
    { name: 'Emily Rodriguez', role: 'Full Stack Dev', text: 'The security scanner found a critical XSS vulnerability in production. Worth every penny.', rating: 5 },
  ];

  const faqs = [
    { q: 'How does the AI analysis work?', a: 'Our analysis engine combines rule-based static analysis with OpenAI GPT models. It parses your HTML, CSS, and JavaScript files, checks against hundreds of rules for bugs, performance issues, accessibility violations, and security vulnerabilities, then generates actionable suggestions.' },
    { q: 'Is my code safe and private?', a: 'Absolutely. Your code is processed in isolated containers and never stored permanently. We use end-to-end encryption for all data transfers. Enterprise plans offer on-premise deployment.' },
    { q: 'What project types are supported?', a: 'We support React, Next.js, Vue, Angular, HTML/CSS/JS, Node.js, and any web project. Upload a ZIP, connect your GitHub/GitLab, or paste a URL.' },
    { q: 'Can I export reports?', a: 'Yes! Export professional reports in PDF, CSV, Excel, JSON, or Markdown format. Perfect for stakeholder presentations and team handoffs.' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-dark-50 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-500 rounded-lg flex items-center justify-center">
                <HiOutlineBugAnt className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BugFinder</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-dark-300 hover:text-white transition-colors font-medium">
                  {item}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-dark-300 hover:text-white transition-colors font-medium px-4 py-2">
                Log in
              </Link>
              <Link to="/signup" className="gradient-btn text-sm px-5 py-2">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
              <HiOutlineRocketLaunch className="w-4 h-4" />
              AI-Powered Website Analysis
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Find bugs before<br />
            <span className="gradient-text">your users do</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any web project and get instant analysis for bugs, performance issues, 
            security vulnerabilities, and accessibility problems — powered by AI.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')}
              className="gradient-btn text-base px-8 py-3.5 flex items-center gap-2 w-full sm:w-auto justify-center">
              Start Free Analysis
              <HiOutlineArrowRight className="w-5 h-5" />
            </button>
            <a href="#features" className="gradient-btn-outline text-base px-8 py-3.5 flex items-center gap-2 w-full sm:w-auto justify-center">
              See How It Works
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto">
            {[
              { value: '50K+', label: 'Bugs Found' },
              { value: '12K+', label: 'Projects Scanned' },
              { value: '99.2%', label: 'Accuracy Rate' },
              { value: '< 30s', label: 'Scan Time' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-dark-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary-400 font-semibold text-sm tracking-wider uppercase">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Everything you need to ship quality code</h2>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">Comprehensive analysis covering every aspect of web development quality.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass-card-hover p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary-400 font-semibold text-sm tracking-wider uppercase">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">From upload to insights in minutes</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((step, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="relative text-center group">
                <div className="text-5xl font-black text-primary-500/10 mb-4 group-hover:text-primary-500/20 transition-colors">{step.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-dark-400 text-sm">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-dark-600">
                    <HiOutlineArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary-400 font-semibold text-sm tracking-wider uppercase">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Simple, transparent pricing</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className={`glass-card p-8 relative ${plan.popular ? 'border-primary-500/50 ring-1 ring-primary-500/20 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 to-violet-500 rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.price !== 'Free' && <span className="text-dark-400 text-sm">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-dark-300">
                      <HiOutlineCheck className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    plan.popular ? 'gradient-btn' : 'gradient-btn-outline'
                  }`}
                >
                  {plan.price === 'Free' ? 'Get Started' : 'Start Free Trial'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary-400 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Loved by developers worldwide</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <HiOutlineStar key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-dark-200 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-dark-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary-400 font-semibold text-sm tracking-wider uppercase">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Frequently asked questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white text-sm pr-4">{faq.q}</span>
                  <HiOutlineChevronDown className={`w-5 h-5 text-dark-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-5 pb-5">
                    <p className="text-sm text-dark-300 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-violet-500/5 to-cyan-500/5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to find bugs smarter?</h2>
              <p className="text-dark-300 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of developers shipping better code with BugFinder.
              </p>
              <button onClick={() => navigate('/signup')} className="gradient-btn text-base px-10 py-3.5 inline-flex items-center gap-2">
                Get Started Free <HiOutlineArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <HiOutlineBugAnt className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">BugFinder</span>
              </div>
              <p className="text-xs text-dark-400 leading-relaxed">AI-powered website analysis and bug detection platform for modern developers.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Documentation'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-xs text-dark-400 hover:text-primary-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-700/50 pt-6 text-center">
            <p className="text-xs text-dark-500">© 2024 BugFinder. All rights reserved. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
