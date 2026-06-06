import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ChevronLeft } from 'lucide-react';

const FoodCreator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    kcal: '',
    protein: '',
    carbs: '',
    fat: '',
    serving_type: 'per_100g'
  });

  const handleSave = async () => {
    if (!formData.name || !formData.kcal || !formData.protein || !formData.carbs || !formData.fat) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newFood = {
      user_id: session.user.id,
      name: formData.name,
      barcode: formData.barcode || null,
      kcal_per_100g: parseFloat(formData.kcal),
      protein: parseFloat(formData.protein),
      carbs: parseFloat(formData.carbs),
      fat: parseFloat(formData.fat),
      source: 'manual',
      serving_type: formData.serving_type
    };

    const { error } = await supabase.from('food_inventory').insert(newFood);
    
    setLoading(false);
    
    if (error) {
      alert("Error saving food: " + error.message);
    } else {
      navigate(-1); // Go back to search
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background relative">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900/60 border border-gray-850 hover:border-gray-700 rounded-xl transition-all active:scale-95 shrink-0 flex items-center justify-center">
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
        <h1 className="text-xl font-bold text-white flex-1">Create Custom Food</h1>
      </div>
      
      <div className="p-5 flex flex-col gap-6 pb-24 overflow-y-auto">
        <p className="text-sm text-gray-400">Add an Egyptian product that isn't in the database yet. It will be saved permanently for future searches.</p>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name <span className="text-danger">*</span></label>
          <input 
            type="text" 
            placeholder="e.g. Juhayna Greek Yogurt Plain"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-surface border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Barcode (Optional)</label>
          <input 
            type="text"
            inputMode="numeric" 
            placeholder="Scan or type barcode"
            value={formData.barcode}
            onChange={(e) => setFormData({...formData, barcode: e.target.value})}
            className="w-full bg-surface border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Serving Type <span className="text-danger">*</span></label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, serving_type: 'per_100g' })}
              className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                formData.serving_type === 'per_100g'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Per 100g
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, serving_type: 'per_item' })}
              className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                formData.serving_type === 'per_item'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Per Serving
            </button>
          </div>
        </div>

        <div className="bg-surface border border-gray-800 rounded-2xl p-5 mt-2 shadow-xl">
          <h2 className="text-sm font-bold text-white mb-4 border-b border-gray-800 pb-2">
            Nutritional Values ({formData.serving_type === 'per_item' ? 'Per Serving' : 'Per 100g'})
          </h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-gray-300 w-24">Calories <span className="text-danger">*</span></label>
              <div className="relative flex-1">
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={formData.kcal}
                  onChange={(e) => setFormData({...formData, kcal: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-3 pr-10 text-white focus:border-primary outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {formData.serving_type === 'per_item' ? 'kcal/serv' : 'kcal'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-gray-300 w-24">Protein <span className="text-danger">*</span></label>
              <div className="relative flex-1">
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={formData.protein}
                  onChange={(e) => setFormData({...formData, protein: e.target.value})}
                  className="w-full bg-gray-900 border border-blue-900/50 rounded-lg py-2 pl-3 pr-8 text-white focus:border-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {formData.serving_type === 'per_item' ? 'g/serv' : 'g'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-gray-300 w-24">Carbs <span className="text-danger">*</span></label>
              <div className="relative flex-1">
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={formData.carbs}
                  onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                  className="w-full bg-gray-900 border border-green-900/50 rounded-lg py-2 pl-3 pr-8 text-white focus:border-green-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {formData.serving_type === 'per_item' ? 'g/serv' : 'g'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-gray-300 w-24">Fat <span className="text-danger">*</span></label>
              <div className="relative flex-1">
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={formData.fat}
                  onChange={(e) => setFormData({...formData, fat: e.target.value})}
                  className="w-full bg-gray-900 border border-yellow-900/50 rounded-lg py-2 pl-3 pr-8 text-white focus:border-yellow-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {formData.serving_type === 'per_item' ? 'g/serv' : 'g'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 mb-8">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-success hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-success/20 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'SAVING...' : (
              <>
                <Save size={20} />
                SAVE TO DATABASE
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCreator;
