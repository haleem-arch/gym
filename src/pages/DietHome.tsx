import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiet } from '../hooks/useDiet';
import { MacroProgressBar } from '../components/MacroProgressBar';
import { Plus, Utensils, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { supabase } from '../lib/supabase';
import { DumbbellLoader } from '../components/DumbbellLoader';
import { DietNutritionSettings } from '../components/DietNutritionSettings';

const DietHome = () => {
  const navigate = useNavigate();
  const { log, meals, waterLogs, loading, targets, dayType, dayNutrition, allDayTypes, saveDayNutrition, activeDate, setActiveDate, createMeal, startDay, toggleDayCompletion, reload, resetWater } = useDiet();
  const [showSettings, setShowSettings] = useState(false);

  const waterTotalMl = waterLogs?.reduce((sum, entry) => sum + (entry.amount_ml || 0), 0) || 0;
  const WATER_GOAL_ML = 3500; // 3.5 Liters

  const handlePrevDay = () => setActiveDate(new Date(activeDate.getTime() - 86400000));
  const handleNextDay = () => setActiveDate(new Date(activeDate.getTime() + 86400000));
  
  const isToday = activeDate.toDateString() === new Date().toDateString();
  const dateDisplay = isToday ? 'Today' : activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleCreateMeal = async () => {
    if (!log) return;
    if (log.daily_totals.completed) {
      alert("This day is marked as completed! Uncheck it to add meals.");
      return;
    }
    const name = window.prompt("Enter meal name (e.g. Breakfast, Post-Workout Shake):");
    if (name && name.trim()) {
      const newMeal = await createMeal(name.trim());
      if (newMeal) {
        navigate(`/diet/meal/${newMeal.id}`);
      }
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (log?.daily_totals.completed) return;
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <DumbbellLoader label="Loading nutrition data..." size={100} />
      </div>
    );
  }

  const totals = log?.daily_totals || { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <>
    <div className="p-5 flex flex-col gap-6 min-h-full pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nutrition</h1>
          <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider mt-1 block">Daily Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/diet/inventory')}
            className="text-xs font-bold bg-surface border border-gray-700 text-gray-300 px-3 py-2 rounded-lg flex items-center gap-1.5 active:scale-95 transition-transform shadow-md"
          >
            <Utensils size={14} />
            MY FOODS
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 bg-surface border border-gray-700 rounded-lg flex items-center justify-center text-gray-300 active:scale-95 transition-transform shadow-md"
            title="Nutrition Targets"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </motion.div>

      {/* Date Navigation + Day Type Badge */}
      <div className="flex items-center justify-between bg-surface border border-gray-800 rounded-xl p-2">
        <button onClick={handlePrevDay} className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-bold text-lg">{dateDisplay}</span>
          {dayType && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
              {dayType}
            </span>
          )}
        </div>
        <button onClick={handleNextDay} className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {!log ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center mt-10">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Utensils className="text-primary w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">No data for {dateDisplay}</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-[250px]">Start tracking to begin logging your meals and hydration for this day.</p>
          <button 
            onClick={startDay}
            className="bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg"
          >
            START DAY
          </button>
        </motion.div>
      ) : (
        <>
          {/* Macro Summary Dashboard */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-xl relative overflow-hidden"
          >
            {totals.completed && (
              <div className="absolute top-0 right-0 bg-success text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                COMPLETED
              </div>
            )}
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

          {/* Water Tracker Dashboard */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.15 }}
            className="mt-4 rounded-2xl overflow-hidden shadow-xl"
          >
            <SwipeToDeleteRow onDelete={resetWater} threshold={60} backgroundRounded="rounded-2xl">
              <div className="bg-surface p-5 border border-blue-900/40 w-full h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💧</span>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Hydration</h2>
                </div>
                
                <MacroProgressBar 
                  label="Water Intake" 
                  current={waterTotalMl} 
                  target={WATER_GOAL_ML} 
                  colorClass="bg-blue-400" 
                  unit="ml" 
                />

                {waterLogs && waterLogs.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-gray-800">
                    {waterLogs.map((log: any) => {
                      const d = new Date(log.time);
                      const timeStr = isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                      return (
                        <div key={log.id} className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">{timeStr}</span>
                          <span className="font-bold text-blue-200">+{log.amount_ml} ml</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </SwipeToDeleteRow>
          </motion.div>

          {/* Meals List */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Logged Meals</h2>
            </div>

            {meals.length === 0 ? (
              <div className="text-center text-gray-500 py-6 bg-surface border border-gray-800 rounded-xl">
                <p className="text-sm">No meals logged yet.</p>
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
                      onClick={() => !totals.completed && navigate(`/diet/meal/${meal.id}`)}
                      className={`bg-surface rounded-xl p-4 border border-gray-800 flex flex-col w-full ${totals.completed ? 'opacity-70 cursor-default' : 'cursor-pointer active:scale-[0.98] transition-transform'}`}
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
            {!totals.completed && (
              <button 
                onClick={handleCreateMeal}
                className="w-full mt-2 border-2 border-dashed border-gray-700 hover:border-primary active:scale-95 text-gray-400 hover:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={20} />
                CREATE MEAL
              </button>
            )}
            
            {/* End Day Button */}
            <button
              onClick={toggleDayCompletion}
              className={`w-full mt-4 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${totals.completed ? 'bg-surface border border-gray-700 text-gray-400' : 'bg-success text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {totals.completed ? 'REOPEN DAY' : 'FINISH DAY'}
            </button>
          </motion.div>
        </>
      )}
    </div>

    {/* Nutrition Targets Settings Modal */}
    <DietNutritionSettings
      open={showSettings}
      onClose={() => setShowSettings(false)}
      currentDayType={dayType}
      allDayTypes={allDayTypes}
      dayNutrition={dayNutrition}
      onSave={async (map) => { await saveDayNutrition(map); }}
    />
    </>
  );
};

export default DietHome;
