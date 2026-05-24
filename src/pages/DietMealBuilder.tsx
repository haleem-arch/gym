import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus } from 'lucide-react';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { useDiet, type DietMeal, type DietMealItem } from '../hooks/useDiet';
import { DumbbellLoader } from '../components/DumbbellLoader';

const DietMealBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reload } = useDiet();
  
  const [meal, setMeal] = useState<DietMeal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeal = async () => {
    if (!id) return;
    const { data } = await supabase.from('diet_meals').select('*').eq('id', id).single();
    if (data) setMeal(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMeal();
  }, [id]);

  const handleRemoveItem = async (itemIdToRemove: string) => {
    if (!meal) return;
    
    // Filter out the item
    const newItems = meal.items.filter(item => item.id !== itemIdToRemove);
    
    // Optimistic update
    setMeal({ ...meal, items: newItems });
    
    // DB update
    await supabase.from('diet_meals').update({ items: newItems }).eq('id', meal.id);
    
    // Tell the global diet hook to reload so the dashboard recalculates
    reload();
  };

  const calculateMealMacros = () => {
    let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    meal?.items?.forEach((item: DietMealItem) => {
      totals.kcal += item.macros.kcal;
      totals.protein += item.macros.protein;
      totals.carbs += item.macros.carbs;
      totals.fat += item.macros.fat;
    });
    return totals;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <DumbbellLoader label="Loading meal details..." size={100} />
      </div>
    );
  }
  if (!meal) return <div className="p-4 text-center text-danger">Meal not found.</div>;

  const macros = calculateMealMacros();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center gap-4">
        <button onClick={() => navigate('/diet')} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white flex-1">{meal.name}</h1>
      </div>

      {/* Meal Header Stats */}
      <div className="bg-surface p-5 border-b border-gray-800">
        <div className="flex justify-between items-end mb-4">
          <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Meal Totals</span>
          <span className="text-2xl font-bold text-primary">{Math.round(macros.kcal)} <span className="text-sm text-gray-500">kcal</span></span>
        </div>
        <div className="flex items-center justify-between text-sm font-bold">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">PROTEIN</span>
            <span className="text-blue-400">{Math.round(macros.protein)}g</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">CARBS</span>
            <span className="text-green-400">{Math.round(macros.carbs)}g</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">FAT</span>
            <span className="text-yellow-400">{Math.round(macros.fat)}g</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <button 
          onClick={() => navigate(`/diet/search?mealId=${meal.id}`)}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] mb-6"
        >
          <Plus size={20} />
          ADD FOOD
        </button>

        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Logged Items</h2>
        
        {meal.items.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-surface border border-gray-800 rounded-xl border-dashed">
            No foods added yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {meal.items.map((item) => (
              <SwipeToDeleteRow key={item.id} onDelete={() => handleRemoveItem(item.id)}>
                <div className="bg-surface rounded-lg p-3 border border-gray-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <span className="text-xs font-semibold text-gray-400">{item.grams}g</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary block">{Math.round(item.macros.kcal)} kcal</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      P:{Math.round(item.macros.protein)} C:{Math.round(item.macros.carbs)} F:{Math.round(item.macros.fat)}
                    </span>
                  </div>
                </div>
              </SwipeToDeleteRow>
            ))}
          </div>
        )}
        
        {meal.items.length > 0 && (
          <div className="mt-8">
            <button 
              onClick={() => navigate('/diet')}
              className="w-full border-2 border-success text-success font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-success hover:text-white transition-colors active:scale-95 shadow-lg shadow-success/10"
            >
              SAVE MEAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietMealBuilder;
