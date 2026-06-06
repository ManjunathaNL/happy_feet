import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { LayoutDashboard, TrendingUp, ShoppingBag, Users } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <LayoutDashboard className="text-indigo-400" /> Operational Metrics
        </h1>
        <p className="opacity-60 text-sm">Real-time overview matrix for Happy Feet Enterprise.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="bg-black/20 border-white/5 flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl"><TrendingUp /></div>
          <div><div className="text-xs opacity-50">Today's Sales Revenue</div><div className="text-2xl font-black">₹1,42,350</div></div>
        </GlassCard>
        <GlassCard className="bg-black/20 border-white/5 flex items-center gap-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl"><ShoppingBag /></div>
          <div><div className="text-xs opacity-50">Active Orders Count</div><div className="text-2xl font-black">84 New</div></div>
        </GlassCard>
        <GlassCard className="bg-black/20 border-white/5 flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl"><Users /></div>
          <div><div className="text-xs opacity-50">Customer Profiles</div><div className="text-2xl font-black font-mono">2,410</div></div>
        </GlassCard>
      </div>
    </div>
  );
};