'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Coins, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { fundingAPI, accountsAPI } from '@/lib/api';

export default function AdminPanelPage() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ to_account_id: '', amount: '10000' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Automatically fetch existing accounts so you can pick one easily from a dropdown
    accountsAPI.getAll().then(data => setAccounts(data.accounts || [])).catch(() => {});
  }, []);

  const handleMint = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fundingAPI.fund({
        to_account_id: form.to_account_id,
        amount: parseFloat(form.amount)
      });
      setStatus('success');
      setMessage(`Successfully minted ₹${form.amount} into account!`);
      setForm({ ...form, amount: '10000' });
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Minting failed. Ensure you have system user privileges.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Central Bank Admin Panel</h1>
          <p className="text-slate-500 text-sm">Privileged system access for treasury operations</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-amber-500/20">
        <div className="flex items-center gap-2 mb-4 text-amber-400 font-semibold text-sm">
          <Coins className="w-4 h-4" />
          <span>Liquidity Injection (Mint Funds)</span>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm mb-6 flex items-center gap-2 ${
            status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {status === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleMint} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Target Account</label>
            <select 
              className="input-glass w-full text-sm font-mono"
              value={form.to_account_id}
              onChange={(e) => setForm({ ...form, to_account_id: e.target.value })}
              required
            >
              <option value="" disabled>Select an active account...</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                  {a.id} ({a.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Amount to Mint (₹)</label>
            <input 
              type="number" 
              step="100" 
              className="input-glass w-full text-lg font-bold text-amber-400"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 px-4 rounded-xl font-semibold text-slate-950 bg-linear-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 mt-2"
          >
            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Execute Treasury Mint</span>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
