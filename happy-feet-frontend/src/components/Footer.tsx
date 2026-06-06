import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Footprints } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black/10 pt-12 pb-6 mt-auto text-xs font-medium w-full transition-all duration-300 shadow-inner bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        
        {/* Shopping Links Subsection */}
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-1">
            Shopping Links
          </h3>
          <ul className="space-y-2 opacity-80 text-inherit">
            <li><Link to="/products-gallery?gender=Men" className="hover:underline">Men's Running Shoes</Link></li>
            <li><Link to="/products-gallery?gender=Women" className="hover:underline">Women's Premium Line</Link></li>
            <li><Link to="/products-gallery?gender=Kids" className="hover:underline">Kids Comfortable Shoes</Link></li>
            <li><Link to="/products-gallery?gender=Boys" className="hover:underline">Boys Sports Shoes</Link></li>
            <li><Link to="/products-gallery?gender=Girls" className="hover:underline">Girls Casual Classics</Link></li>
          </ul>
        </div>

        {/* Quick Links Subsection */}
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-1">
            Quick Links
          </h3>
          <ul className="space-y-2 opacity-80 text-inherit">
            <li><Link to="/" className="hover:underline">About Our Company</Link></li>
            <li><Link to="/" className="hover:underline">Contact Store Support</Link></li>
            <li><Link to="/" className="hover:underline">Terms of Service</Link></li>
            <li><Link to="/" className="hover:underline">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Mobile App Store Buttons Subsection */}
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-1">
            Download Our Apps
          </h3>
          <div className="flex flex-col gap-2 max-w-[140px]">
            {/* Styled as clean, clear white buttons matching our light-theme look */}
            <button className="bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-left hover:bg-slate-50 transition-all cursor-pointer shadow-xs">
              Google Play
            </button>
            <button className="bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-left hover:bg-slate-50 transition-all cursor-pointer shadow-xs">
              App Store
            </button>
          </div>
        </div>

        {/* About Company Subsection */}
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-4 border-b border-white/20 pb-1 flex items-center gap-1.5">
            <Footprints size={16} /> Happy Feet Shoes
          </h3>
          <p className="leading-relaxed opacity-80 mb-4 font-medium">
            India's leading footwear platform, linking physical store branches with real-time online inventory for a smooth shopping experience.
          </p>
          <div className="flex gap-3">
            <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center text-inherit"><Facebook size={14} /></a>
            <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center text-inherit"><Instagram size={14} /></a>
            <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center text-inherit"><Linkedin size={14} /></a>
          </div>
        </div>

      </div>

      {/* Bottom Copyright & Tax Compliance Ribbon */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-white/10 text-[10px] font-mono flex flex-col sm:flex-row justify-between items-center gap-2 opacity-90">
        <p>COPYRIGHT © 2026 HAPPYFEET.COM. ALL RIGHTS RESERVED.</p>
        <p className="font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 tracking-widest uppercase">
          GST Invoicing Compliant Active
        </p>
      </div>
    </footer>
  );
};