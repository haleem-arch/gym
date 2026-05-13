import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DietSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mealId = searchParams.get('mealId');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Bottom Sheet State
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [grams, setGrams] = useState<string>('100');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const searchFoods = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);

      // Search by name (ILIKE) or exact barcode match
      const { data, error } = await supabase
        .from('food_inventory')
        .select('*')
        .or(`name.ilike.%${query}%,barcode.eq.${query}`)
        .limit(20);

      if (data) setResults(data);
      setLoading(false);
    };

    const debounce = setTimeout(() => searchFoods(), 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleAddFood = async () => {
    if (!selectedFood || !mealId || !grams) return;
    setIsAdding(true);

    const amount = parseFloat(grams);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount in grams.');
      setIsAdding(false);
      return;
    }

    const multiplier = amount / 100;
    const calculatedMacros = {
      kcal: selectedFood.kcal_per_100g * multiplier,
      protein: selectedFood.protein * multiplier,
      carbs: selectedFood.carbs * multiplier,
      fat: selectedFood.fat * multiplier
    };

    const newItem = {
      id: crypto.randomUUID(),
      food_id: selectedFood.id,
      name: selectedFood.name,
      grams: amount,
      macros: calculatedMacros
    };

    // 1. Fetch current meal
    const { data: currentMeal } = await supabase.from('diet_meals').select('items').eq('id', mealId).single();
    
    // 2. Append item
    const updatedItems = [...(currentMeal?.items || []), newItem];
    
    // 3. Save to Supabase
    await supabase.from('diet_meals').update({ items: updatedItems }).eq('id', mealId);

    // Close and navigate back
    setSelectedFood(null);
    setIsAdding(false);
    navigate(`/diet/meal/${mealId}`);
  };

  const calculatedPreview = selectedFood ? {
    kcal: selectedFood.kcal_per_100g * (parseFloat(grams || '0') / 100),
    protein: selectedFood.protein * (parseFloat(grams || '0') / 100),
    carbs: selectedFood.carbs * (parseFloat(grams || '0') / 100),
    fat: selectedFood.fat * (parseFloat(grams || '0') / 100),
  } : null;

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-gray-800 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">Add Food</h1>
          <button 
            onClick={() => navigate('/diet/food/new')}
            className="text-primary font-bold text-sm tracking-wide"
          >
            CREATE
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food or scan barcode..." 
            className="w-full bg-surface border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : query.trim() === '' ? (
          <div className="p-8 text-center flex flex-col items-center text-gray-500 gap-2 mt-10">
            <Search className="w-8 h-8 opacity-50" />
            <p className="text-sm">Type a name or barcode to search.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center text-gray-500 gap-2 mt-10">
            <p className="text-sm">No results found for "{query}".</p>
            <button 
              onClick={() => navigate('/diet/food/new')}
              className="mt-2 text-primary font-bold"
            >
              + Create New Food
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {results.map((food) => (
              <div 
                key={food.id} 
                onClick={() => { setSelectedFood(food); setGrams('100'); }}
                className="p-4 bg-background hover:bg-surface transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-white">{food.name}</h3>
                  <span className="text-primary font-bold">{Math.round(food.kcal_per_100g)} <span className="text-xs font-normal text-gray-500">kcal/100g</span></span>
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>P: {food.protein}g</span>
                  <span>C: {food.carbs}g</span>
                  <span>F: {food.fat}g</span>
                </div>
                {food.source === 'preset' && (
                  <span className="inline-block mt-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">Verified Preset</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Amount Bottom Sheet */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSelectedFood(null)} 
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface border-t border-gray-800 rounded-t-3xl p-6 relative z-10 pb-10"
            >
              <h3 className="text-xl font-bold text-white mb-1">{selectedFood.name}</h3>
              <p className="text-xs text-gray-400 mb-6 border-b border-gray-800 pb-4">Base: {selectedFood.kcal_per_100g} kcal per 100g</p>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Amount</label>
                  <div className="relative">
                    <input 
                      type="number"
                      autoFocus
                      inputMode="decimal"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 pl-4 pr-12 text-xl font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">g</span>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Calories</span>
                  <span className="text-2xl font-bold text-primary">{Math.round(calculatedPreview?.kcal || 0)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-8 px-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Protein</span>
                  <span className="text-lg font-bold text-blue-400">{Math.round(calculatedPreview?.protein || 0)}g</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Carbs</span>
                  <span className="text-lg font-bold text-green-400">{Math.round(calculatedPreview?.carbs || 0)}g</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Fat</span>
                  <span className="text-lg font-bold text-yellow-400">{Math.round(calculatedPreview?.fat || 0)}g</span>
                </div>
              </div>
              
              <button 
                onClick={handleAddFood}
                disabled={isAdding}
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isAdding ? 'ADDING...' : (
                  <>
                    <Plus size={20} /> Add to Meal
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DietSearch;
