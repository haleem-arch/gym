import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { UserPlus, Mail, User, Ruler, Target, ChevronLeft, Upload, ShieldCheck, Activity } from 'lucide-react';

export default function AddClientPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    email: '',
    age: '',
    height: '',
    experience_level: 'beginner',
    workouts_per_week: 3,
    goals: '',
    injuries_notes: ''
  });
  const [inbodyFile, setInbodyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePasscode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: any) => {
    if (e.target.files) {
      setInbodyFile(e.target.files[0]);
    }
  };

  const parseInBodyCSV = async (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const inbodyData: any = {};
        lines.forEach((line) => {
          if (line.includes('Weight')) inbodyData.weight = parseFloat(line.split(':')[1]);
          if (line.includes('Skeletal Muscle Mass')) inbodyData.smm = parseFloat(line.split(':')[1]);
          if (line.includes('Body Fat %')) inbodyData.bf_percent = parseFloat(line.split(':')[1]);
          if (line.includes('InBody Score')) inbodyData.inbody_score = parseFloat(line.split(':')[1]);
        });
        resolve(inbodyData);
      };
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const passcode = generatePasscode();
      
      const { data: { user: coachUser } } = await supabase.auth.getUser();
      if (!coachUser) throw new Error('COACH AUTH REQUIRED');

      // Note: In this environment, we simulate the userId for the client
      const userId = crypto.randomUUID();

      // 1. Create profile
      await supabase.from('profiles').insert({
        id: userId,
        username: formData.username,
        email: formData.email,
        display_name: formData.display_name,
        role: 'client',
        coach_id: coachUser.id
      });

      // 2. Create client profile
      await supabase.from('client_profiles').insert({
        user_id: userId,
        coach_id: coachUser.id,
        age: parseInt(formData.age) || null,
        height: parseFloat(formData.height) || null,
        experience_level: formData.experience_level,
        workouts_per_week: formData.workouts_per_week,
        goals: formData.goals,
        injuries_notes: formData.injuries_notes,
        generated_passcode: passcode
      });

      // 3. Handle InBody
      if (inbodyFile) {
        const inbodyData: any = await parseInBodyCSV(inbodyFile);
        await supabase.from('inbody_scans').insert({
          user_id: userId,
          coach_id: coachUser.id,
          date: new Date().toISOString().split('T')[0],
          weight: inbodyData.weight,
          smm: inbodyData.smm,
          bf_percent: inbodyData.bf_percent,
          score: inbodyData.inbody_score
        });
      }

      // 4. Create workout days
      for (let i = 1; i <= formData.workouts_per_week; i++) {
        await supabase.from('client_workout_days').insert({
          user_id: userId,
          day_number: i,
          day_name: `Day ${i}`,
          exercises: []
        });
      }

      toast.success(`DEPLOYMENT SUCCESS: ${passcode}`);
      navigate(`/coach/clients/${userId}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto pb-24 animate-slide-up">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/coach/clients')} className="p-2 bg-background/40 hover:bg-surface/60 rounded-xl transition-all border border-white/[0.05] hover:border-white/[0.15] active:scale-95">
          <ChevronLeft size={20} className="text-secondary" />
        </button>
        <div>
          <h1 className="font-outfit text-4xl font-black tracking-tight uppercase">Deploy <span className="text-secondary">Athlete</span></h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">Initialize New Tactical Profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="font-outfit text-xs font-black uppercase tracking-[3px] text-gray-500 mb-6 border-b border-white/[0.05] pb-2 flex items-center gap-2">
            <User size={14} className="text-secondary" /> Identity Data
          </h2>
          
          <div className="space-y-4">
            <InputGroup icon={<User size={16} />} label="Display Name" name="display_name" value={formData.display_name} onChange={handleInputChange} required placeholder="FULL NAME" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup icon={<ShieldCheck size={16} />} label="Handle" name="username" value={formData.username} onChange={handleInputChange} required placeholder="USERNAME" />
              <InputGroup icon={<Mail size={16} />} label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="EMAIL ADDRESS" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup icon={<Activity size={16} />} label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} placeholder="YEARS" />
              <InputGroup icon={<Ruler size={16} />} label="Height" name="height" type="number" value={formData.height} onChange={handleInputChange} placeholder="CENTIMETERS" />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-outfit text-xs font-black uppercase tracking-[3px] text-gray-500 mb-6 border-b border-white/[0.05] pb-2 flex items-center gap-2">
            <Target size={14} className="text-accent" /> Mission Parameters
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 group/select">
                <label className="font-mono text-[8px] text-gray-500 uppercase tracking-widest group-focus-within/select:text-secondary transition-colors">Experience Tier</label>
                <select 
                  name="experience_level" 
                  value={formData.experience_level} 
                  onChange={handleInputChange} 
                  className="bg-background/40 border border-white/[0.05] rounded-xl px-4 py-3.5 font-mono text-xs text-white uppercase outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all duration-300"
                >
                  <option value="beginner" className="bg-[#0b0e14]">Beginner</option>
                  <option value="intermediate" className="bg-[#0b0e14]">Intermediate</option>
                  <option value="advanced" className="bg-[#0b0e14]">Advanced</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 group/select">
                <label className="font-mono text-[8px] text-gray-500 uppercase tracking-widest group-focus-within/select:text-secondary transition-colors">Session Frequency</label>
                <select 
                  name="workouts_per_week" 
                  value={formData.workouts_per_week} 
                  onChange={handleInputChange} 
                  className="bg-background/40 border border-white/[0.05] rounded-xl px-4 py-3.5 font-mono text-xs text-white uppercase outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all duration-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n} className="bg-[#0b0e14]">{n} Sessions / Week</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 group/textarea">
              <label className="font-mono text-[8px] text-gray-500 uppercase tracking-widest group-focus-within/textarea:text-accent transition-colors">Primary Objectives</label>
              <textarea 
                name="goals" 
                value={formData.goals} 
                onChange={handleInputChange} 
                className="bg-background/40 border border-white/[0.05] rounded-xl px-4 py-3.5 font-mono text-xs text-white uppercase outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all duration-300 min-h-[100px] placeholder:text-gray-600" 
                placeholder="DESCRIBE THE ATHLETE'S STRATEGIC OBJECTIVES..." 
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-outfit text-xs font-black uppercase tracking-[3px] text-gray-500 mb-6 border-b border-white/[0.05] pb-2 flex items-center gap-2">
            <Upload size={14} className="text-success" /> Initial Intelligence (Optional)
          </h2>
          
          <div className="border border-dashed border-white/[0.08] hover:border-success/40 bg-background/20 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group hover:bg-success/[0.02]">
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="inbody-upload" />
            <label htmlFor="inbody-upload" className="cursor-pointer flex flex-col items-center">
              <Upload size={32} className="text-gray-600 group-hover:text-success mb-3 transition-all duration-300 transform group-hover:-translate-y-0.5" />
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Import InBody CSV Protocol</p>
              {inbodyFile && (
                <span className="mt-4 bg-success/15 text-success text-[10px] font-black px-3.5 py-1 rounded-full border border-success/25 animate-pulse">
                  ✓ {inbodyFile.name}
                </span>
              )}
            </label>
          </div>
        </Card>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 disabled:from-surface disabled:to-surface text-white py-4 rounded-2xl font-outfit font-black text-lg uppercase tracking-widest shadow-2xl hover:shadow-secondary/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-white/10"
        >
          {loading ? 'INITIALIZING PROTOCOL...' : 'DEPLOY ATHLETE'}
        </button>
      </form>
    </div>
  );
}

function InputGroup({ icon, label, ...props }: any) {
  return (
    <div className="flex flex-col gap-2 group/input">
      <label className="font-mono text-[8px] text-gray-500 uppercase tracking-widest group-focus-within/input:text-secondary transition-colors">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-secondary transition-colors">{icon}</div>
        <input 
          {...props} 
          className="w-full bg-background/40 border border-white/[0.05] rounded-xl pl-12 pr-4 py-3.5 font-mono text-xs text-white uppercase outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all duration-300 placeholder:text-gray-600" 
        />
      </div>
    </div>
  );
}
