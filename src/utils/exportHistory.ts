import { supabase } from '../lib/supabase';

export interface ExportRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export async function exportHistoryToCsv(startDate: string, endDate: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'User is not logged in.' };
    }
    const userId = session.user.id;

    // 1. Fetch workouts in range
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select(`
        id,
        date,
        day_type,
        duration,
        total_volume,
        notes,
        status,
        workout_exercises(
          sets,
          exercises(name)
        )
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (workoutsError) throw workoutsError;

    // 2. Fetch diet logs in range
    const { data: dietLogs, error: dietError } = await supabase
      .from('diet_logs')
      .select(`
        id,
        date,
        daily_totals,
        diet_meals(
          name,
          time,
          items
        )
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (dietError) throw dietError;

    // 3. Fetch water logs in range
    const { data: waterLogs, error: waterError } = await supabase
      .from('water_logs')
      .select('date, amount_ml')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (waterError) throw waterError;

    // 4. Fetch schedules to check active templates
    const { data: schedules } = await supabase
      .from('schedules')
      .select('week_start, days')
      .eq('user_id', userId);

    // Create maps for efficient date merging
    const workoutMap = new Map<string, any>();
    workouts?.forEach(w => {
      workoutMap.set(w.date, w);
    });

    const dietMap = new Map<string, any>();
    dietLogs?.forEach(d => {
      dietMap.set(d.date, d);
    });

    const waterMap = new Map<string, number>();
    waterLogs?.forEach(w => {
      const current = waterMap.get(w.date) || 0;
      waterMap.set(w.date, current + (w.amount_ml || 0));
    });

    // Generate chronological array of dates (latest on top)
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const curr = new Date(start);

    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    dates.reverse();

    // CSV Header row
    const headers = [
      'Date',
      'Day of Week',
      'Scheduled Day',
      'Workout Status',
      'Total Lifted Volume (kg)',
      'Duration (mins)',
      'Workout Log Details (Exercises & Sets)',
      'Nutrition Status',
      'Calories Logged (kcal)',
      'Protein Logged (g)',
      'Carbs Logged (g)',
      'Fat Logged (g)',
      'Daily Meals Logged',
      'Water Consumed (Liters)'
    ];

    // Helper to safely format CSV values (escape quotes, wrap in quotes)
    const escapeCsv = (val: any): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).trim();
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvRows: string[] = [headers.map(escapeCsv).join(',')];

    for (const dateStr of dates) {
      const dateObj = new Date(dateStr);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

      // Check Schedule type
      let scheduledType = 'REST';
      if (schedules) {
        for (const s of schedules) {
          if (s.days && s.days[dateStr]) {
            scheduledType = s.days[dateStr];
            break;
          }
        }
      }

      // ─── Workout Info ───
      const workout = workoutMap.get(dateStr);
      const workoutStatus = workout ? (workout.status === 'completed' ? 'Completed' : 'In Progress') : 'No Workout Logged';
      const volume = workout?.total_volume ? `${workout.total_volume} kg` : '0 kg';
      const duration = workout?.duration ? `${Math.round(workout.duration / 60)}` : '';

      // Format exercises & sets details
      let workoutDetails = '';
      if (workout?.workout_exercises && workout.workout_exercises.length > 0) {
        const exercisesList = workout.workout_exercises.map((we: any) => {
          const exName = we.exercises?.name || 'Exercise';
          const setsSummary = we.sets?.map((s: any, idx: number) => {
            return `Set ${idx + 1}: ${s.weight}kg x ${s.reps} (RPE ${s.rpe || 'N/A'})${s.done ? ' [✓]' : ''}`;
          }).join(', ') || 'No sets';
          return `${exName} -> [${setsSummary}]`;
        });
        workoutDetails = exercisesList.join(' | ');
      }

      // ─── Nutrition Info ───
      const diet = dietMap.get(dateStr);
      const totals = diet?.daily_totals || { kcal: 0, protein: 0, carbs: 0, fat: 0, completed: false };
      const nutritionStatus = totals.completed ? 'Completed' : (diet ? 'In Progress' : 'No Calories Logged');
      const kcal = Math.round(totals.kcal || 0);
      const protein = totals.protein || 0;
      const carbs = totals.carbs || 0;
      const fat = totals.fat || 0;

      // Format meals
      let mealsDetails = '';
      if (diet?.diet_meals && diet.diet_meals.length > 0) {
        const mealsList = diet.diet_meals.map((m: any) => {
          const itemsSummary = m.items?.map((item: any) => {
            return `${item.name} (${item.grams}g: ${item.macros?.kcal || 0} kcal, ${item.macros?.protein || 0}g P)`;
          }).join(', ') || 'No items';
          return `${m.name} [${m.time || 'no-time'}] -> (${itemsSummary})`;
        });
        mealsDetails = mealsList.join(' | ');
      }

      // ─── Hydration Info ───
      const waterTotalMl = waterMap.get(dateStr) || 0;
      const waterLiters = (waterTotalMl / 1000).toFixed(2);

      const row = [
        dateStr,
        dayOfWeek,
        scheduledType,
        workoutStatus,
        volume,
        duration,
        workoutDetails,
        nutritionStatus,
        kcal,
        protein,
        carbs,
        fat,
        mealsDetails,
        `${waterLiters} L`
      ];

      csvRows.push(row.map(escapeCsv).join(','));
    }

    // Convert rows to single string
    const csvContent = csvRows.join('\r\n');

    // Prepend UTF-8 Byte Order Mark (\uFEFF) to make Excel parse Arabic and symbols correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create hidden download trigger
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `athlete_history_${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    console.error('History export failed:', error);
    return { success: false, error: error.message || 'Unknown export error.' };
  }
}
