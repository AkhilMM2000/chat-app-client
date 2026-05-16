import React from "react";

import { Github, Twitter, MessageSquare, Shield, Zap, Globe } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-white/5 bg-gray-900/60 backdrop-blur-2xl px-6 py-12 overflow-hidden">
      {/* Background Accent Flaring */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:rotate-6 transition-transform">
                <MessageSquare className="text-white" size={20} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                Nebula<span className="text-purple-500 italic">Chat</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering real-time connections with high-performance infrastructure and beautiful identities.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-white/5 hover:bg-purple-500/20 rounded-xl text-gray-500 hover:text-purple-400 transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Live Network</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500 transition-transform group-hover:scale-110">
                  <Globe size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none">Global Nodes</div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase mt-1">12 Latency Optimized</div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 transition-transform group-hover:scale-110">
                  <Zap size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none">Real-time Sync</div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase mt-1">99.9% Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 font-medium group">
                <div className="w-1 h-1 bg-purple-500/40 rounded-full group-hover:w-2 transition-all" />
                Security Overhaul
              </a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 font-medium group">
                <div className="w-1 h-1 bg-purple-500/40 rounded-full group-hover:w-2 transition-all" />
                System Status
              </a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 font-medium group">
                <div className="w-1 h-1 bg-purple-500/40 rounded-full group-hover:w-2 transition-all" />
                Developer API
              </a></li>
            </ul>
          </div>

          {/* Community Section */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Security</h4>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 text-teal-400 mb-2">
                <Shield size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Verified Secure</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed italic">
                "NebulaChat uses industry-standard encryption for all room data and identity synchronization."
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-600 mb-0">
            © {currentYear} NEBULA CHAT. <span className="text-purple-500/50 italic ml-1 font-medium">DESIGNED IN THE VOID.</span>
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Terms</a>
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">v2.4.0 Live</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
