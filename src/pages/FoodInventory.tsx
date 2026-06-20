import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database, ChevronLeft, Barcode } from 'lucide-react';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { DumbbellLoader } from '../components/DumbbellLoader';

const FoodInventory = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch only foods created by or saved by this user (excludes global presets with null user_id)
    const { data } = await supabase
      .from('food_inventory')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setFoods(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id: string) => {
    // Optimistic update
    setFoods(foods.filter(f => f.id !== id));
    
    // DB Delete
    await supabase.from('food_inventory').delete().eq('id', id);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="sticky top-0 z-20 bg-[#07080e]/90 backdrop-blur-md border-b border-gray-800 px-4 pb-4 flex items-center gap-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900/60 border border-gray-850 hover:border-gray-700 rounded-xl transition-all active:scale-95 shrink-0 flex items-center justify-center">
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
        <h1 className="text-xl font-bold text-white flex-1 flex items-center gap-2">
          <Database size={20} className="text-primary" /> My Inventory
        </h1>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          These are the custom foods you've manually created or saved from the barcode database. Swipe left to delete them permanently.
        </p>

        {loading ? (
          <DumbbellLoader label="Loading inventory..." size={100} />
        ) : foods.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-surface border border-gray-800 rounded-xl border-dashed">
            You haven't added any custom foods yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-24">
            {foods.map((food) => (
              <SwipeToDeleteRow key={food.id} onDelete={() => handleDelete(food.id)}>
                <div className="bg-surface rounded-lg p-4 border border-gray-800">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white flex flex-col">
                      {food.name}
                      {food.source === 'barcode' && food.barcode && (
                        <span className="text-[10px] text-purple-400 font-mono mt-1 flex items-center gap-1">
                          <Barcode size={10} /> Barcode: {food.barcode}
                        </span>
                      )}
                    </h3>
                    <span className="text-primary font-bold whitespace-nowrap ml-2">
                      {Math.round(food.kcal_per_100g)} <span className="text-xs font-normal text-gray-500">{food.serving_type === 'per_item' ? 'kcal/serving' : 'kcal/100g'}</span>
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold text-gray-400 mt-2">
                    <span>P: <span className="text-blue-400">{Math.round(food.protein)}g</span></span>
                    <span>C: <span className="text-green-400">{Math.round(food.carbs)}g</span></span>
                    <span>F: <span className="text-yellow-400">{Math.round(food.fat)}g</span></span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {food.serving_type === 'per_item' ? 'Per Serving' : 'Per 100g'}
                    </span>
                  </div>
                </div>
              </SwipeToDeleteRow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodInventory;
