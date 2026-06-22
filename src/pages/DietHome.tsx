import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiet } from '../hooks/useDiet';
import { MacroProgressBar } from '../components/MacroProgressBar';
import { Plus, Utensils, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { supabase } from '../lib/supabase';
import { DietNutritionSettings } from '../components/DietNutritionSettings';
import { NutritionCardSkeleton, HydrationCardSkeleton, MealItemSkeleton } from '../components/SkeletonLoaders';

const DietHome = () => {
  const navigate = useNavigate();
  const { log, meals, waterLogs, loading, targets, dayType, dayNutrition, allDayTypes, saveDayNutrition, activeDate, setActiveDate, createMeal, startDay, toggleDayCompletion, reload, resetWater, waterGoalMl } = useDiet();
  const debugLoading = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug_loading') === 'true';
  const effectiveLoading = debugLoading || loading;
  const [showSettings, setShowSettings] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [disableNutritionTargets, setDisableNutritionTargets] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showWaterDetails, setShowWaterDetails] = useState(false);

  useEffect(() => {
    const fetchToggles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || null;
      setUserId(uid);

      let myTargets: any = null;
      let myProfileData: any = null;
      if (uid) {
        const { data: myProfile } = await supabase.from('profiles').select('targets, coach_id').eq('id', uid).maybeSingle();
        if (myProfile?.targets?.disable_diet && myProfile.coach_id) {
          setIsLocked(true);
        }
        myTargets = myProfile?.targets;
        myProfileData = myProfile;
      }

      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      const ownerTargets = ownerProfile?.targets;

      let shouldDisable = true;
      if (myProfileData && !myProfileData.coach_id) {
        shouldDisable = false; // Self-guided athletes can always edit targets
      } else if (myTargets && myTargets.disable_nutrition_targets !== undefined) {
        shouldDisable = !!myTargets.disable_nutrition_targets;
      } else if (ownerTargets && ownerTargets.disable_nutrition_targets !== undefined) {
        shouldDisable = !!ownerTargets.disable_nutrition_targets;
      }
      setDisableNutritionTargets(shouldDisable);
    };

    fetchToggles();
  }, []);

  const waterTotalMl = waterLogs?.reduce((sum, entry) => sum + (entry.amount_ml || 0), 0) || 0;
  const WATER_GOAL_ML = waterGoalMl || 3500; // Dynamic Water Goal

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

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gradient-to-b from-[#080b1e] to-[#05060f] text-zinc-350">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <Utensils size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-white">Section Locked</h1>
        <p className="text-gray-400 text-xs mt-3 max-w-[280px] leading-relaxed">
          This section has been locked by your coach. Please contact your coach if you need access.
        </p>
      </div>
    );
  }

  if (effectiveLoading) {
    return (
      <>
      <div className="p-5 flex flex-col gap-6 min-h-full pb-28 bg-gradient-to-b from-[#080b1e] to-[#05060f]">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Nutrition</h1>
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mt-1 block">Daily Dashboard</span>
          </div>
        </motion.div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-[#0c1020]/40 border border-blue-900/20 backdrop-blur-md rounded-xl p-2">
          <button onClick={handlePrevDay} className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="font-black text-white text-base tracking-tight">{dateDisplay}</span>
          <button onClick={handleNextDay} className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {/* Skeleton components */}
        <NutritionCardSkeleton />
        <HydrationCardSkeleton />
        
        <div className="flex flex-col gap-3 mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Logged Meals</h2>
          <MealItemSkeleton />
          <MealItemSkeleton />
          <MealItemSkeleton />
        </div>
      </div>
      </>
    );
  }

  const totals = log?.daily_totals || { kcal: 0, protein: 0, carbs: 0, fat: 0, completed: false };

  return (
    <>
    <div className="p-5 flex flex-col gap-6 min-h-full pb-28 bg-gradient-to-b from-[#080b1e] to-[#05060f]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Nutrition</h1>
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mt-1 block">Daily Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/diet/inventory')}
            className="text-[10px] font-black uppercase tracking-wider bg-[#0c1020]/50 border border-blue-900/25 text-zinc-300 px-3 py-2.5 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-md hover:bg-[#0c1020]/75"
          >
            <Utensils size={13} />
            MY FOODS
          </button>
          {(userId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' || !disableNutritionTargets) && (
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 bg-[#0c1020]/50 border border-blue-900/25 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition-all shadow-md hover:bg-[#0c1020]/75"
              title="Nutrition Targets"
            >
              <SlidersHorizontal size={14} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Date Navigation + Day Type Badge */}
      <div className="flex items-center justify-between bg-[#0c1020]/40 border border-blue-900/20 backdrop-blur-md rounded-xl p-2">
        <button onClick={handlePrevDay} className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-black text-white text-base tracking-tight">{dateDisplay}</span>
          {dayType && (
            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
              {dayType}
            </span>
          )}
        </div>
        <button onClick={handleNextDay} className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {!log ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center mt-10">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Utensils className="text-white w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">No data for {dateDisplay}</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-[250px]">Start tracking to begin logging your meals and hydration for this day.</p>
          <button 
            onClick={startDay}
            className="bg-white hover:bg-zinc-200 text-black font-black py-3.5 px-8 rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider active:scale-95"
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
            onClick={() => (userId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' || !disableNutritionTargets) && setShowSettings(true)}
            className={`bg-[#0c1020]/40 backdrop-blur-md rounded-2xl p-5 border border-blue-900/20 shadow-2xl relative overflow-hidden transition-all ${
              (userId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' || !disableNutritionTargets)
                ? 'cursor-pointer hover:border-blue-500/40 hover:bg-[#0c1020]/60 active:scale-[0.99]' 
                : ''
            }`}
          >
            {/* Edit Target Indicator Badge */}
            {(userId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' || !disableNutritionTargets) && (
              <div className="absolute top-3 right-3 text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                <span>Edit Targets</span>
                <span className="text-[10px]">✏️</span>
              </div>
            )}
            {totals.completed && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider border-l border-b border-[#0c1020]/50">
                COMPLETED
              </div>
            )}
            <div className="flex flex-col gap-4">
              <MacroProgressBar 
                label="Calories" 
                current={totals.kcal} 
                target={targets.kcal} 
                colorClass="bg-gradient-to-r from-[#6366f1] to-[#4f46e5]" 
                unit="kcal" 
              />
              <div className="h-px bg-blue-900/15 w-full" />
              <div className="flex flex-col gap-3.5">
                <MacroProgressBar label="Protein" current={totals.protein} target={targets.protein} colorClass="bg-gradient-to-r from-[#2563eb] to-[#3b82f6]" />
                <MacroProgressBar label="Carbs" current={totals.carbs} target={targets.carbs} colorClass="bg-gradient-to-r from-[#10b981] to-[#059669]" />
                <MacroProgressBar label="Fat" current={totals.fat} target={targets.fat} colorClass="bg-gradient-to-r from-[#f59e0b] to-[#d97706]" />
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
              <div className="bg-[#0c1020]/40 backdrop-blur-md p-5 border border-blue-900/20 w-full h-full">
                <div 
                  className="flex items-center justify-between mb-3 border-b border-blue-900/15 pb-2.5 cursor-pointer hover:opacity-80 transition-opacity select-none"
                  onClick={() => setShowWaterDetails(!showWaterDetails)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💧</span>
                    <h2 className="text-xs font-black uppercase tracking-wider text-blue-400">Hydration Logger</h2>
                    {(userId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' || !disableNutritionTargets) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSettings(true);
                        }}
                        className="text-[9px] font-black text-sky-400 hover:text-white uppercase tracking-widest px-2 py-0.5 rounded bg-sky-900/20 hover:bg-sky-900/40 border border-sky-500/20 transition-all cursor-pointer ml-1 active:scale-95"
                      >
                        Edit Target ✏️
                      </button>
                    )}
                  </div>
                  {waterLogs && waterLogs.length > 0 && (
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                      {showWaterDetails ? 'Hide Logs ▴' : 'Show Logs ▾'}
                    </span>
                  )}
                </div>
                
                <div 
                  onClick={() => setShowWaterDetails(!showWaterDetails)} 
                  className="cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <MacroProgressBar 
                    label="Water Intake" 
                    current={waterTotalMl} 
                    target={WATER_GOAL_ML} 
                    colorClass="bg-gradient-to-r from-[#38bdf8] to-[#0284c7]" 
                    unit="ml" 
                  />
                </div>

                <AnimatePresence initial={false}>
                  {showWaterDetails && waterLogs && waterLogs.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 flex flex-col gap-2 pt-3.5 border-t border-blue-900/15">
                        {waterLogs.map((log: any) => {
                          const d = new Date(log.time);
                          const timeStr = isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                          return (
                            <div key={log.id} className="flex justify-between items-center text-[11px] font-sans border-b border-blue-950/20 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-zinc-555 font-medium">{timeStr}</span>
                              <span className="font-extrabold text-blue-300">+{log.amount_ml} ml</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SwipeToDeleteRow>
          </motion.div>

          {/* Meals List */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 select-none">Logged Meals</h2>
            </div>

            {meals.length === 0 ? (
              <div className="text-center text-zinc-500 py-6 bg-[#0c1020]/20 border border-blue-900/15 backdrop-blur-md rounded-xl select-none">
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
                      className={`bg-[#0c1020]/40 backdrop-blur-sm rounded-xl p-4 border border-blue-900/20 flex flex-col w-full ${totals.completed ? 'opacity-70 cursor-default' : 'cursor-pointer active:scale-[0.98] transition-transform hover:border-blue-900/35'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-white text-base tracking-tight">{meal.name}</span>
                        <span className="text-xs font-black text-zinc-300 bg-[#080b1e]/40 px-2.5 py-1 rounded-lg border border-blue-950/25">{Math.round(mealMacros.kcal)} kcal</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider text-zinc-550">
                        <span>P: <span className="text-[#3b82f6]">{Math.round(mealMacros.protein)}g</span></span>
                        <span>C: <span className="text-[#10b981]">{Math.round(mealMacros.carbs)}g</span></span>
                        <span>F: <span className="text-[#f59e0b]">{Math.round(mealMacros.fat)}g</span></span>
                      </div>
                      
                      {meal.items && meal.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-900/15">
                          <p className="text-[10px] text-zinc-500 line-clamp-1">
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
                className="w-full mt-2 border-2 border-dashed border-blue-900/30 hover:border-blue-700/50 hover:text-white active:scale-95 text-zinc-550 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
              >
                <Plus size={16} />
                CREATE MEAL
              </button>
            )}
            
            {/* End Day Button */}
            <button
              onClick={toggleDayCompletion}
              className={`w-full mt-4 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-xs uppercase tracking-wider ${totals.completed ? 'bg-[#0c1020]/40 border border-blue-900/20 text-zinc-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
      waterGoalMl={waterGoalMl}
      onSave={async (map, newWaterGoal) => { await saveDayNutrition(map, newWaterGoal); }}
    />
    </>
  );
};

export default DietHome;
