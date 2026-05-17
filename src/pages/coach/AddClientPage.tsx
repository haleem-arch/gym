import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
          const parts = line.split(',');
          const key = parts[0]?.trim();
          const value = parts[1]?.trim();

          if (key === 'Weight') inbodyData.weight = parseFloat(value);
          if (key === 'Skeletal Muscle Mass') inbodyData.smm = parseFloat(value);
          if (key === 'Body Fat Mass') inbodyData.bfm = parseFloat(value);
          if (key === 'Body Fat %') inbodyData.bf_percent = parseFloat(value);
          if (key === 'BMR') inbodyData.bmr = parseFloat(value);
          if (key === 'InBody Score') inbodyData.inbody_score = parseFloat(value);
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

      // 1. Get current coach
      const { data: { user: coachUser } } = await supabase.auth.getUser();
      if (!coachUser) throw new Error('Not logged in as coach');

      // 2. Create auth user via Supabase Admin (or standard signup if admin is not available)
      // Note: Admin API requires service role key, which is usually not in frontend.
      // For this demo, we'll assume the profiles are handled differently or coach manually adds.
      // But based on the prompt, it uses admin.createUser.
      
      // Since we can't use admin.createUser in a standard client, we'll create the profile records directly.
      // In a real app, this would be a serverless function.
      
      // WORKAROUND for demonstration: We'll create a dummy ID or use a different flow.
      // However, I will follow the prompt's logic as closely as possible.
      
      // Let's assume the user has set up a trigger or we're using a specific flow.
      // For now, I'll just create the profile entries.
      
      const userId = crypto.randomUUID(); // Placeholder ID

      // 3. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        username: formData.username,
        email: formData.email,
        display_name: formData.display_name,
        role: 'client',
        coach_id: coachUser.id
      });

      if (profileError) throw profileError;

      // 4. Create client profile
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .insert({
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

      if (clientProfileError) throw clientProfileError;

      // 5. Parse and upload InBody CSV if provided
      if (inbodyFile) {
        const inbodyData: any = await parseInBodyCSV(inbodyFile);
        
        await supabase.from('inbody_scans').insert({
          user_id: userId,
          coach_id: coachUser.id,
          date: new Date().toISOString().split('T')[0],
          weight: inbodyData.weight || 0,
          smm: inbodyData.smm || 0,
          bfm: inbodyData.bfm || 0,
          bf_percent: inbodyData.bf_percent || 0,
          bmr: inbodyData.bmr || 0,
          score: inbodyData.inbody_score || 0
        });
      }

      // 6. Create workout days
      for (let i = 1; i <= formData.workouts_per_week; i++) {
        await supabase.from('client_workout_days').insert({
          user_id: userId,
          day_number: i,
          day_name: `Day ${i}`,
          exercises: []
        });
      }

      toast.success(`Client created! Passcode: ${passcode}`);
      navigate(`/coach/clients/${userId}`);
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-20 max-w-2xl mx-auto overflow-y-auto h-full">
      <h1 className="text-3xl font-bold mb-6 text-white">Add New Client</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2 font-bold">Full Name *</label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                required
                placeholder="e.g. John Doe"
                className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-bold">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="johndoe123"
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-bold">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-bold">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-bold">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Training Info */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Training</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-bold">Experience Level</label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-bold">Days/Week</label>
                <select
                  name="workouts_per_week"
                  value={formData.workouts_per_week}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
                    <option key={n} value={n}>{n} days</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2 font-bold">Goals</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 h-24 border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Build muscle, lose fat, increase strength"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2 font-bold">Injuries/Notes</label>
              <textarea
                name="injuries_notes"
                value={formData.injuries_notes}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 h-20 border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Any injuries or limitations?"
              />
            </div>
          </div>
        </div>

        {/* InBody CSV Upload */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Initial InBody (Optional)</h2>
          
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="inbody-upload"
            />
            <label htmlFor="inbody-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-2">📄</span>
                <p className="text-gray-300 font-medium">Click to upload InBody CSV</p>
                <p className="text-gray-500 text-xs mt-1">Accepts standard InBody CSV exports</p>
                {inbodyFile && (
                  <div className="mt-4 bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-800">
                    <span>✓</span> {inbodyFile.name}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform active:scale-[0.98]"
        >
          {loading ? 'Creating Client...' : 'Create Client Profile'}
        </button>
      </form>
    </div>
  );
}
