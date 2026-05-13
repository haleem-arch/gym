
import { useNavigate } from 'react-router-dom';
import { useDiet } from '../hooks/useDiet';
import { MacroProgressBar } from '../components/MacroProgressBar';
import { Plus, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { supabase } from '../lib/supabase';

const DietHome = () => {
  const navigate = useNavigate();
  const { log, meals, loading, targets, createMeal, reload } = useDiet();

  const handleCreateMeal = async () => {
    const name = window.prompt("Enter meal name (e.g. Breakfast, Post-Workout Shake):");
    if (name && name.trim()) {
      const newMeal = await createMeal(name.trim());
      if (newMeal) {
        navigate(`/diet/meal/${newMeal.id}`);
      }
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    await supabase.from('diet_meals').delete().eq('id', mealId);
    reload(); // Refresh the list
  };

  const calculateMealMacros = (meal: any) => {
    let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    meal.items?.forEach((item: any) => {
      totals.kcal += item.macros.kcal;
      totals.protein += item.macros.protein;
      totals.carbs += item.macros.carbs;
      totals.fat += item.macros.fat;
    });
    return totals;
  };

  if (loading) {
    return (
      <div className="p-5 flex flex-col gap-6 min-h-full items-center justify-center text-gray-500">
        Loading nutrition data...
      </div>
    );
  }

  const totals = log?.daily_totals || { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="p-5 flex flex-col gap-6 min-h-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Nutrition</h1>
        <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider mt-1 block">Daily Dashboard</span>
      </motion.div>

      {/* Macro Summary Dashboard */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-xl"
      >
        <div className="flex flex-col gap-5">
          <MacroProgressBar 
            label="Calories" 
            current={totals.kcal} 
            target={targets.kcal} 
            colorClass="bg-primary" 
            unit="kcal" 
          />
          <div className="h-px bg-gray-800 w-full" />
          <div className="flex flex-col gap-3">
            <MacroProgressBar label="Protein" current={totals.protein} target={targets.protein} colorClass="bg-blue-500" />
            <MacroProgressBar label="Carbs" current={totals.carbs} target={targets.carbs} colorClass="bg-green-500" />
            <MacroProgressBar label="Fat" current={totals.fat} target={targets.fat} colorClass="bg-yellow-500" />
          </div>
        </div>
      </motion.div>

      {/* Meals List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-2 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Today's Meals</h2>
        </div>

        {meals.length === 0 ? (
          <div className="text-center text-gray-500 py-6 bg-surface border border-gray-800 rounded-xl">
            <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No meals logged today.</p>
          </div>
        ) : (
          meals.map((meal) => {
            const mealMacros = calculateMealMacros(meal);
            return (
              <SwipeToDeleteRow 
                key={meal.id} 
                onDelete={() => handleDeleteMeal(meal.id)}
                backgroundRounded="rounded-xl"
              >
                <div 
                  onClick={() => navigate(`/diet/meal/${meal.id}`)}
                  className="bg-surface rounded-xl p-4 border border-gray-800 flex flex-col cursor-pointer active:scale-[0.98] transition-transform w-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-white text-lg">{meal.name}</span>
                    <span className="text-sm font-bold text-primary">{Math.round(mealMacros.kcal)} kcal</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                    <span>P: <span className="text-blue-400">{Math.round(mealMacros.protein)}g</span></span>
                    <span>C: <span className="text-green-400">{Math.round(mealMacros.carbs)}g</span></span>
                    <span>F: <span className="text-yellow-400">{Math.round(mealMacros.fat)}g</span></span>
                  </div>
                  
                  {meal.items && meal.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {meal.items.map(i => i.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </SwipeToDeleteRow>
            );
          })
        )}

        {/* Add Meal Button */}
        <button 
          onClick={handleCreateMeal}
          className="w-full mt-2 border-2 border-dashed border-gray-700 hover:border-primary text-gray-400 hover:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          CREATE MEAL
        </button>
      </motion.div>
    </div>
  );
};

export default DietHome;
