import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, ChevronDown, ChevronUp, Scale, Activity, Droplet, Flame, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { SegmentalBodyMap } from '../components/SegmentalBodyMap';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ScanCardSkeleton } from '../components/SkeletonLoaders';

export default function InBodyView() {
  const debugLoading = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug_loading') === 'true';
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(debugLoading || true);
  const effectiveLoading = debugLoading || loading;
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    weight: '',
    smm: '',
    bfm: '',
    bf_percent: '',
    bmr: '',
    score: '',
    // Segmental
    visceralFat: '',
    tbw: '', // Total Body Water
    protein: '',
    minerals: '',
    raLean: '', // Right Arm
    laLean: '', // Left Arm
    trunkLean: '',
    rlLean: '', // Right Leg
    llLean: ''  // Left Leg
  });

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Check lock status
    const { data: profile } = await supabase
      .from('profiles')
      .select('targets')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile?.targets?.disable_inbody) {
      setIsLocked(true);
    }

    const { data } = await supabase
      .from('inbody_scans')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) setScans(data);
    if (!debugLoading) setLoading(false);
  };

  const handleDeleteScan = async (id: string) => {
    setScans(prev => prev.filter(s => s.id !== id));
    await supabase.from('inbody_scans').delete().eq('id', id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const segmental = {
      visceralFat: parseFloat(formData.visceralFat) || 0,
      tbw: parseFloat(formData.tbw) || 0,
      protein: parseFloat(formData.protein) || 0,
      minerals: parseFloat(formData.minerals) || 0,
      raLean: parseFloat(formData.raLean) || 0,
      laLean: parseFloat(formData.laLean) || 0,
      trunkLean: parseFloat(formData.trunkLean) || 0,
      rlLean: parseFloat(formData.rlLean) || 0,
      llLean: parseFloat(formData.llLean) || 0,
    };

    const payload = {
      user_id: session.user.id,
      date: formData.date,
      weight: parseFloat(formData.weight) || 0,
      smm: parseFloat(formData.smm) || 0,
      bfm: parseFloat(formData.bfm) || 0,
      bf_percent: parseFloat(formData.bf_percent) || 0,
      bmr: parseInt(formData.bmr) || 0,
      score: parseInt(formData.score) || 0,
      segmental: segmental
    };

    const { error } = await supabase.from('inbody_scans').insert(payload);
    
    setIsSubmitting(false);
    if (!error) {
      setShowModal(false);
      fetchScans();
    } else {
      alert("Error saving scan: " + error.message);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setIsImporting(false);
        return;
      }

      // Simple CSV split
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        alert('Invalid CSV file or empty file.');
        setIsImporting(false);
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsImporting(false);
        return;
      }

      const payloads = [];

      // Parse rows
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim());
        if (row.length < 5) continue; // Skip malformed rows

        const getValue = (keyContains: string) => {
          const idx = headers.findIndex(h => h.includes(keyContains.toLowerCase()));
          return idx !== -1 ? parseFloat(row[idx]) : 0;
        };
        
        const getString = (keyContains: string) => {
          const idx = headers.findIndex(h => h.includes(keyContains.toLowerCase()));
          return idx !== -1 ? row[idx] : '';
        };

        const dateRaw = getString('date'); // format: 20260506155832
        if (!dateRaw) continue;

        let dateStr = new Date().toISOString().split('T')[0];
        if (dateRaw.length >= 8) {
           dateStr = `${dateRaw.substring(0,4)}-${dateRaw.substring(4,6)}-${dateRaw.substring(6,8)}`;
        }

        const segmental = {
          visceralFat: getValue('visceral fat level'),
          tbw: getValue('total body water'),
          protein: getValue('protein'),
          minerals: getValue('mineral'),
          raLean: getValue('right arm lean'),
          laLean: getValue('left arm lean'),
          trunkLean: getValue('trunk lean'),
          rlLean: getValue('right leg lean'),
          llLean: getValue('left leg lean'),
        };

        payloads.push({
          user_id: session.user.id,
          date: dateStr,
          weight: getValue('weight(kg)'),
          smm: getValue('skeletal muscle mass'),
          bfm: getValue('body fat mass'),
          bf_percent: getValue('percent body fat'),
          bmr: getValue('basal metabolic rate'),
          score: getValue('inbody score'),
          segmental: segmental
        });
      }

      if (payloads.length > 0) {
         // Batch insert (will fail on exact user_id + date unique constraint if it existed, but we don't have one for inbody_scans, so it will just add them)
         // To avoid duplicating same date, maybe we should skip existing dates or just insert.
         const { error } = await supabase.from('inbody_scans').insert(payloads);
         if (error) {
           alert("Error during bulk upload: " + error.message);
         } else {
           alert(`Successfully imported ${payloads.length} scans!`);
           fetchScans();
         }
      } else {
         alert("No valid data found in CSV.");
      }

      setIsImporting(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const calculateDelta = (current: number, previous: number, invertColors = false) => {
    if (!previous || previous === 0) return null;
    const diff = current - previous;
    if (diff === 0) return <span className="text-gray-500 text-xs ml-1">(-)</span>;
    
    const isPositive = diff > 0;
    // For things like fat, negative is good (green). For muscle, positive is good.
    const isGood = invertColors ? !isPositive : isPositive;
    
    return (
      <span className={`text-xs ml-1 font-bold ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
        ({isPositive ? '+' : ''}{diff.toFixed(1)})
      </span>
    );
  };

  const getPreviousScan = (currentIndex: number) => {
    if (currentIndex + 1 < scans.length) {
      return scans[currentIndex + 1];
    }
    return null;
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gradient-to-b from-[#080b1e] to-[#05060f] text-zinc-350">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <Scale size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-white">Section Locked</h1>
        <p className="text-gray-400 text-xs mt-3 max-w-[280px] leading-relaxed">
          This section has been locked by your coach. Please contact your coach if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-6 min-h-full pb-28 bg-gradient-to-b from-[#080b1e] to-[#05060f]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="text-zinc-400" /> InBody
          </h1>
          <p className="text-sm text-gray-400">Body composition tracking</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => setShowModal(true)}
            className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl shadow-lg transition-colors flex items-center gap-2 font-black text-xs"
          >
            <Plus size={16} /> Log Scan
          </button>
        </div>
      </motion.div>

      {/* CSV Upload Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0c1020]/40 border border-blue-900/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-lg"
      >
        <div className="w-11 h-11 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-center shrink-0">
          <Upload size={20} className={isImporting ? 'animate-pulse text-zinc-400' : 'text-zinc-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Upload from InBody Machine</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Export your scan as CSV from the InBody website and upload it here to import all your history automatically.</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="shrink-0 px-4 py-2.5 bg-[#070709]/80 border border-zinc-800 hover:bg-[#0d0d11] hover:border-zinc-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
        >
          {isImporting ? 'Importing...' : 'Upload CSV'}
        </button>
      </motion.div>

      <ErrorBoundary title="InBody Scans List">
        {effectiveLoading ? (
          <div className="space-y-4">
            <ScanCardSkeleton />
            <ScanCardSkeleton />
            <ScanCardSkeleton />
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center p-10 bg-[#0c1020]/20 border border-blue-900/15 backdrop-blur-md rounded-3xl">
            <div className="bg-zinc-900/50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
              <Scale size={32} className="text-gray-500" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No Scans Yet</h3>
            <p className="text-gray-550 text-sm">Log your first InBody test to start tracking your body composition.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan, index) => {
              const prev = getPreviousScan(index);
              const isExpanded = expandedId === scan.id;
              const seg = scan.segmental || {};
              const prevSeg = prev?.segmental || {};

              return (
                <SwipeToDeleteRow 
                  key={scan.id} 
                  onDelete={() => handleDeleteScan(scan.id)}
                  backgroundRounded="rounded-3xl"
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#0c1020]/40 backdrop-blur-md border border-blue-900/20 rounded-3xl overflow-hidden shadow-xl animate-fadeIn"
                  >
                    {/* Header (Always Visible) */}
                    <div 
                      className="p-5 cursor-pointer flex justify-between items-center"
                      onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                    >
                      <div>
                        <h3 className="font-black text-white text-lg tracking-tight">
                          {new Date(scan.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-4 mt-2">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Weight</p>
                            <p className="text-white font-black text-base mt-0.5">
                              {scan.weight}kg {prev && calculateDelta(scan.weight, prev.weight, true)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">BF %</p>
                            <p className="text-white font-black text-base mt-0.5">
                              {scan.bf_percent}% {prev && calculateDelta(scan.bf_percent, prev.bf_percent, true)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Score</p>
                            <p className="text-[#3b82f6] font-black text-base mt-0.5">
                              {scan.score} {prev && calculateDelta(scan.score, prev.score)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-zinc-400 bg-[#080b1e]/40 p-2 rounded-full border border-blue-950/25">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-blue-900/15"
                        >
                          <div className="p-5 bg-black/10 space-y-6">
                            
                            {/* Muscle-Fat Analysis */}
                            <div>
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1 select-none">
                                <Activity size={14} className="text-[#3b82f6]" /> Muscle-Fat Analysis
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0c1020]/30 p-3 rounded-xl border border-blue-900/15">
                                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Skeletal Muscle Mass</p>
                                  <p className="text-lg text-white font-black mt-0.5">{scan.smm} <span className="text-xs text-zinc-500 font-normal">kg</span> {prev && calculateDelta(scan.smm, prev.smm)}</p>
                                </div>
                                <div className="bg-[#0c1020]/30 p-3 rounded-xl border border-blue-900/15">
                                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Body Fat Mass</p>
                                  <p className="text-lg text-white font-black mt-0.5">{scan.bfm} <span className="text-xs text-zinc-500 font-normal">kg</span> {prev && calculateDelta(scan.bfm, prev.bfm, true)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Body Composition Analysis */}
                            <div>
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1 select-none">
                                <Droplet size={14} className="text-[#8b5cf6]" /> Body Composition
                              </h4>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-[#0c1020]/30 p-2 rounded-xl text-center border border-blue-900/15">
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Water</p>
                                  <p className="text-sm text-white font-black">{seg.tbw || 0}L</p>
                                </div>
                                <div className="bg-[#0c1020]/30 p-2 rounded-xl text-center border border-blue-900/15">
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Protein</p>
                                  <p className="text-sm text-white font-black">{seg.protein || 0}kg</p>
                                </div>
                                <div className="bg-[#0c1020]/30 p-2 rounded-xl text-center border border-blue-900/15">
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Minerals</p>
                                  <p className="text-sm text-white font-black">{seg.minerals || 0}kg</p>
                                </div>
                              </div>
                            </div>

                            {/* Obesity Evaluation */}
                            <div>
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1 select-none">
                                <Flame size={14} className="text-[#10b981]" /> Obesity Evaluation
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0c1020]/30 p-3 rounded-xl border border-blue-900/15">
                                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Visceral Fat Level</p>
                                  <p className="text-lg text-white font-black mt-0.5">{seg.visceralFat || 0} {prev && calculateDelta(seg.visceralFat, prevSeg.visceralFat, true)}</p>
                                </div>
                                <div className="bg-[#0c1020]/30 p-3 rounded-xl border border-blue-900/15">
                                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Basal Metabolic Rate</p>
                                  <p className="text-lg text-white font-black mt-0.5">{scan.bmr} <span className="text-xs text-zinc-500 font-normal">kcal</span></p>
                                </div>
                              </div>
                            </div>

                            {/* Segmental Lean Analysis – Interactive Body Map */}
                            <SegmentalBodyMap scan={scan} allScans={scans} />

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </SwipeToDeleteRow>
              );
            })}
          </div>
        )}
      </ErrorBoundary>

      {/* Log Scan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] overflow-y-auto no-scrollbar">
          <div className="min-h-full py-10 px-4 flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0a0d1e] w-full max-w-md rounded-3xl border border-blue-950/40 backdrop-blur-xl shadow-2xl p-6"
            >
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider">Log InBody Scan</h2>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="text-[10px] text-zinc-550 mb-1 block uppercase font-bold tracking-wider">Scan Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors" />
                </div>

                {/* Core Metrics */}
                <div className="bg-[#070a1a]/80 p-4 rounded-2xl border border-blue-900/15 backdrop-blur-md space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 mb-2 uppercase tracking-wider">Core Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Weight (kg)</label>
                      <input type="number" step="any" required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="80.5" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">InBody Score</label>
                      <input type="number" required value={formData.score} onChange={e => setFormData({...formData, score: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="85" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">SMM (kg)</label>
                      <input type="number" step="any" required value={formData.smm} onChange={e => setFormData({...formData, smm: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="38.2" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Body Fat Mass (kg)</label>
                      <input type="number" step="any" required value={formData.bfm} onChange={e => setFormData({...formData, bfm: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="12.4" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Body Fat %</label>
                      <input type="number" step="any" required value={formData.bf_percent} onChange={e => setFormData({...formData, bf_percent: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="15.5" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">BMR (kcal)</label>
                      <input type="number" required value={formData.bmr} onChange={e => setFormData({...formData, bmr: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="1850" />
                    </div>
                  </div>
                </div>

                {/* Composition & Obesity */}
                <div className="bg-[#070a1a]/80 p-4 rounded-2xl border border-blue-900/15 backdrop-blur-md space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 mb-2 uppercase tracking-wider">Detailed Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Visceral Fat Level</label>
                      <input type="number" step="any" value={formData.visceralFat} onChange={e => setFormData({...formData, visceralFat: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="6" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Total Water (L)</label>
                      <input type="number" step="any" value={formData.tbw} onChange={e => setFormData({...formData, tbw: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="45.2" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Protein (kg)</label>
                      <input type="number" step="any" value={formData.protein} onChange={e => setFormData({...formData, protein: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="12.1" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Minerals (kg)</label>
                      <input type="number" step="any" value={formData.minerals} onChange={e => setFormData({...formData, minerals: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="4.1" />
                    </div>
                  </div>
                </div>

                {/* Segmental Lean */}
                <div className="bg-[#070a1a]/80 p-4 rounded-2xl border border-blue-900/15 backdrop-blur-md space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 mb-2 uppercase tracking-wider">Segmental Lean (kg)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Left Arm</label>
                      <input type="number" step="any" value={formData.laLean} onChange={e => setFormData({...formData, laLean: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="3.5" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Right Arm</label>
                      <input type="number" step="any" value={formData.raLean} onChange={e => setFormData({...formData, raLean: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="3.6" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Trunk</label>
                      <input type="number" step="any" value={formData.trunkLean} onChange={e => setFormData({...formData, trunkLean: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="28.4" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Left Leg</label>
                      <input type="number" step="any" value={formData.llLean} onChange={e => setFormData({...formData, llLean: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="10.1" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-550 mb-1 block uppercase font-bold">Right Leg</label>
                      <input type="number" step="any" value={formData.rlLean} onChange={e => setFormData({...formData, rlLean: e.target.value})} className="w-full bg-[#05060f] border border-blue-950/30 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 transition-colors" placeholder="10.2" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#0a0d1e]/90 pb-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-850 text-zinc-400 font-extrabold hover:bg-zinc-900 transition-all uppercase tracking-wider text-xs active:scale-[0.98]">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold transition-all disabled:opacity-50 uppercase tracking-wider text-xs active:scale-[0.98]">
                    {isSubmitting ? 'Saving...' : 'Save Scan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
