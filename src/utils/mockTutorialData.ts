// Simulated Onboarding Tutorial Mock Data (Steve Rogers, Tony Stark, Bruce Banner, Natasha Romanoff)

export const FAKE_CLIENTS = [
  {
    id: 'fake_client_1',
    display_name: 'Steve Rogers',
    username: 'captain_america',
    role: 'client',
    coach_id: 'tutorial_coach',
    targets: {
      client_code: '1941',
      kcal: 3200,
      protein: 220,
      carbs: 400,
      fat: 80,
      water_goal_ml: 4000
    }
  },
  {
    id: 'fake_client_2',
    display_name: 'Tony Stark',
    username: 'iron_man',
    role: 'client',
    coach_id: 'tutorial_coach',
    targets: {
      client_code: '1963',
      kcal: 2500,
      protein: 180,
      carbs: 280,
      fat: 70,
      water_goal_ml: 3000
    }
  },
  {
    id: 'fake_client_3',
    display_name: 'Bruce Banner',
    username: 'incredible_hulk',
    role: 'client',
    coach_id: 'tutorial_coach',
    targets: {
      client_code: '1962',
      kcal: 3500,
      protein: 240,
      carbs: 450,
      fat: 85,
      water_goal_ml: 4500
    }
  },
  {
    id: 'fake_client_4',
    display_name: 'Natasha Romanoff',
    username: 'black_widow',
    role: 'client',
    coach_id: 'tutorial_coach',
    targets: {
      client_code: '1964',
      kcal: 2200,
      protein: 160,
      carbs: 240,
      fat: 65,
      water_goal_ml: 3500
    }
  }
];

export const getMockClientProfile = (clientId: string) => {
  if (clientId === 'fake_client_1' || clientId === 'fake_client_3') {
    const userObj = FAKE_CLIENTS.find(c => c.id === clientId) || FAKE_CLIENTS[0];
    return {
      id: 'fake_cp_1_' + clientId,
      user_id: clientId,
      coach_id: 'tutorial_coach',
      age: clientId === 'fake_client_3' ? 54 : 105,
      height: clientId === 'fake_client_3' ? 178 : 188,
      experience_level: 'advanced',
      workouts_per_week: 6,
      goals: clientId === 'fake_client_3' ? 'Anger management, heart rate containment, and core breathing.' : 'Maintain peak strength, increase agility, and practice shield throwing forms.',
      injuries_notes: clientId === 'fake_client_3' ? 'Avoid high stress exercises.' : 'None (Super Soldier serum is active).',
      has_active_plan: true,
      user: userObj
    };
  }
  const userObj = FAKE_CLIENTS.find(c => c.id === clientId) || FAKE_CLIENTS[1];
  return {
    id: 'fake_cp_2_' + clientId,
    user_id: clientId,
    coach_id: 'tutorial_coach',
    age: clientId === 'fake_client_4' ? 39 : 53,
    height: clientId === 'fake_client_4' ? 170 : 185,
    experience_level: 'intermediate',
    workouts_per_week: 3,
    goals: clientId === 'fake_client_4' ? 'Agility training, reflex work, and low-volume bodyweight splits.' : 'Cardio conditioning, chest arc-reactor mobility recovery, and light endurance lifting.',
    injuries_notes: clientId === 'fake_client_4' ? 'Minor wrist stiffness.' : 'Cardiovascular recovery following surgery; shoulder tightness.',
    has_active_plan: true,
    user: userObj
  };
};

export const getMockClientData = (clientId: string, dateStr: string) => {
  if (clientId === 'fake_deployed_thor') {
    return {
      dietLog: {
        id: 'fake_dl_thor',
        user_id: clientId,
        date: dateStr,
        daily_totals: { kcal: 3950, protein: 245, carbs: 435, fat: 88 }
      },
      meals: [
        {
          id: 'fake_m_thor_1',
          diet_log_id: 'fake_dl_thor',
          name: 'Asgardian Feast',
          time: '08:00:00',
          items: [
            { name: 'Roast Wild Boar', grams: 400, serving_type: 'grams', macros: { kcal: 1800, protein: 120, carbs: 0, fat: 50 } },
            { name: 'Golden Apples of Idunn', grams: 300, serving_type: 'grams', macros: { kcal: 280, protein: 3, carbs: 65, fat: 2 } },
            { name: 'Asgardian Mead', grams: 500, serving_type: 'grams', macros: { kcal: 420, protein: 12, carbs: 80, fat: 6 } }
          ]
        },
        {
          id: 'fake_m_thor_2',
          diet_log_id: 'fake_dl_thor',
          name: 'Thunderbolt Post-Workout',
          time: '14:30:00',
          items: [
            { name: 'Lightning-Grilled Ribeye', grams: 350, serving_type: 'grams', macros: { kcal: 910, protein: 84, carbs: 0, fat: 25 } },
            { name: 'Mashed Potatoes (Asgard Style)', grams: 400, serving_type: 'grams', macros: { kcal: 540, protein: 12, carbs: 110, fat: 5 } },
            { name: 'God of Thunder Shake', grams: 80, serving_type: 'grams', macros: { kcal: 400, protein: 60, carbs: 25, fat: 5 } }
          ]
        }
      ],
      waterLogs: [
        { id: 'fake_w_thor_1', amount_ml: 2000, time: '08:15' },
        { id: 'fake_w_thor_2', amount_ml: 1500, time: '13:00' },
        { id: 'fake_w_thor_3', amount_ml: 1500, time: '17:30' }
      ],
      workoutsList: [
        {
          id: 'fake_wo_thor',
          user_id: clientId,
          date: dateStr,
          day_type: 'PUSH',
          duration: 5400,
          total_volume: 24500,
          notes: 'Felt extremely strong. Discharged minor lightning into the barbell.'
        }
      ],
      scans: [
        {
          id: 'fake_s_thor_1',
          user_id: clientId,
          date: '2026-06-01',
          weight: 198.0,
          smm: 98.5,
          bfm: 12.5,
          bf_percent: 6.3,
          bmr: 3850,
          score: 99,
          segmental: {}
        },
        {
          id: 'fake_s_thor_2',
          user_id: clientId,
          date: '2026-05-15',
          weight: 197.5,
          smm: 97.8,
          bfm: 13.0,
          bf_percent: 6.5,
          bmr: 3820,
          score: 98,
          segmental: {}
        }
      ],
      workoutPlans: [
        {
          id: 'fake_wp_thor_1',
          user_id: clientId,
          plan_type: 'PUSH',
          exercises: [
            { name: 'Barbell Bench Press', sets: [{ setNum: 1, reps: 8, weight: 180 }, { setNum: 2, reps: 6, weight: 200 }] },
            { name: 'Military Press', sets: [{ setNum: 1, reps: 8, weight: 120 }] }
          ]
        },
        {
          id: 'fake_wp_thor_2',
          user_id: clientId,
          plan_type: 'PULL',
          exercises: [
            { name: 'Deadlifts', sets: [{ setNum: 1, reps: 5, weight: 280 }, { setNum: 2, reps: 3, weight: 310 }] }
          ]
        }
      ],
      schedule: {
        id: 'fake_sc_thor',
        user_id: clientId,
        week_start: '2026-06-01',
        days: {
          'Monday': { type: 'PUSH', exercises: [] },
          'Tuesday': { type: 'PULL', exercises: [] },
          'Wednesday': { type: 'REST', exercises: [] },
          'Thursday': { type: 'PUSH', exercises: [] },
          'Friday': { type: 'PULL', exercises: [] },
          'Saturday': { type: 'REST', exercises: [] },
          'Sunday': { type: 'REST', exercises: [] }
        }
      }
    };
  }

  const isRogers = clientId === 'fake_client_1' || clientId === 'fake_client_3';
  return {
    dietLog: {
      id: isRogers ? 'fake_dl_1' : 'fake_dl_2',
      user_id: clientId,
      date: dateStr,
      daily_totals: isRogers 
        ? { kcal: 3100, protein: 215, carbs: 390, fat: 78 }
        : { kcal: 2420, protein: 175, carbs: 265, fat: 68 }
    },
    meals: [
      {
        id: isRogers ? 'fake_m_1' : 'fake_m_3',
        diet_log_id: isRogers ? 'fake_dl_1' : 'fake_dl_2',
        name: isRogers ? 'Super Soldier Breakfast' : 'Billionaire Power Breakfast',
        time: '08:00:00',
        items: isRogers ? [
          { name: 'Oatmeal with Honey', grams: 150, serving_type: 'grams', macros: { kcal: 380, protein: 12, carbs: 65, fat: 6 } },
          { name: 'Boiled Eggs (6 Whole)', grams: 300, serving_type: 'grams', macros: { kcal: 460, protein: 38, carbs: 3, fat: 33 } },
          { name: 'Whey Protein Shake', grams: 50, serving_type: 'grams', macros: { kcal: 200, protein: 40, carbs: 3, fat: 2 } }
        ] : [
          { name: 'Avocado Toast with Poached Egg', grams: 200, serving_type: 'grams', macros: { kcal: 450, protein: 16, carbs: 36, fat: 26 } },
          { name: 'Black Coffee', grams: 250, serving_type: 'grams', macros: { kcal: 5, protein: 0, carbs: 0, fat: 0 } },
          { name: 'Smoked Salmon Slice', grams: 100, serving_type: 'grams', macros: { kcal: 180, protein: 22, carbs: 0, fat: 10 } }
        ]
      },
      {
        id: isRogers ? 'fake_m_2' : 'fake_m_4',
        diet_log_id: isRogers ? 'fake_dl_1' : 'fake_dl_2',
        name: 'Post-Workout Fuel',
        time: '14:30:00',
        items: isRogers ? [
          { name: 'Grilled Chicken Breast', grams: 250, serving_type: 'grams', macros: { kcal: 410, protein: 78, carbs: 0, fat: 9 } },
          { name: 'White Rice (Cooked)', grams: 300, serving_type: 'grams', macros: { kcal: 390, protein: 8, carbs: 85, fat: 1 } },
          { name: 'Mixed Vegetables', grams: 150, serving_type: 'grams', macros: { kcal: 80, protein: 4, carbs: 14, fat: 1 } }
        ] : [
          { name: 'Double Espresso', grams: 50, serving_type: 'grams', macros: { kcal: 5, protein: 0, carbs: 0, fat: 0 } },
          { name: 'Mixed Nuts', grams: 50, serving_type: 'grams', macros: { kcal: 320, protein: 10, carbs: 12, fat: 28 } },
          { name: 'Isolate Protein Bar', grams: 60, serving_type: 'grams', macros: { kcal: 220, protein: 20, carbs: 22, fat: 6 } }
        ]
      }
    ],
    waterLogs: [
      { id: 'fake_w_1', amount_ml: 1000, time: '08:15' },
      { id: 'fake_w_2', amount_ml: 1500, time: '13:00' },
      { id: 'fake_w_3', amount_ml: 1000, time: '17:30' }
    ],
    workoutsList: [
      {
        id: isRogers ? 'fake_wo_1' : 'fake_wo_2',
        user_id: clientId,
        date: dateStr,
        day_type: isRogers ? 'PUSH' : 'CARDIO',
        duration: isRogers ? 4500 : 3600,
        total_volume: isRogers ? 12400 : 0,
        notes: isRogers ? 'Explosive bench and overhead presses.' : 'Light arc-reactor recovery and zone-2 running.'
      }
    ],
    scans: [
      {
        id: isRogers ? 'fake_s_1' : 'fake_s_2',
        user_id: clientId,
        date: '2026-06-01',
        weight: isRogers ? 95.0 : 82.5,
        smm: isRogers ? 48.5 : 38.2,
        bfm: isRogers ? 4.5 : 12.8,
        bf_percent: isRogers ? 4.7 : 15.5,
        bmr: isRogers ? 2450 : 1850,
        score: isRogers ? 98 : 82,
        segmental: {}
      },
      {
        id: isRogers ? 'fake_s_3' : 'fake_s_4',
        user_id: clientId,
        date: '2026-05-15',
        weight: isRogers ? 94.5 : 83.1,
        smm: isRogers ? 48.0 : 37.8,
        bfm: isRogers ? 4.8 : 13.5,
        bf_percent: isRogers ? 5.0 : 16.2,
        bmr: isRogers ? 2430 : 1830,
        score: isRogers ? 97 : 80,
        segmental: {}
      }
    ],
    workoutPlans: [
      {
        id: isRogers ? 'fake_wp_1' : 'fake_wp_4',
        user_id: clientId,
        plan_type: isRogers ? 'PUSH' : 'CARDIO & CORE',
        exercises: isRogers ? [
          { name: 'Barbell Bench Press', sets: [{ setNum: 1, reps: 8, weight: 120 }, { setNum: 2, reps: 8, weight: 120 }] },
          { name: 'Incline Dumbbell Press', sets: [{ setNum: 1, reps: 10, weight: 45 }, { setNum: 2, reps: 10, weight: 45 }] },
          { name: 'Seated Military Press', sets: [{ setNum: 1, reps: 8, weight: 80 }] }
        ] : [
          { name: 'Treadmill Jog', sets: [{ setNum: 1, reps: 1, weight: 0 }] },
          { name: 'Planks', sets: [{ setNum: 1, reps: 3, weight: 0 }] }
        ]
      },
      {
        id: isRogers ? 'fake_wp_2' : 'fake_wp_5',
        user_id: clientId,
        plan_type: isRogers ? 'PULL' : 'UPPER BODY STRENGTH',
        exercises: isRogers ? [
          { name: 'Weighted Pullups', sets: [{ setNum: 1, reps: 8, weight: 25 }, { setNum: 2, reps: 8, weight: 25 }] },
          { name: 'Barbell Rows', sets: [{ setNum: 1, reps: 10, weight: 90 }] }
        ] : [
          { name: 'Dumbbell Bicep Curls', sets: [{ setNum: 1, reps: 12, weight: 15 }] }
        ]
      }
    ],
    schedule: {
      id: isRogers ? 'fake_sc_1' : 'fake_sc_2',
      user_id: clientId,
      week_start: '2026-06-01',
      days: {
        'Monday': { type: isRogers ? 'PUSH' : 'CARDIO & CORE', exercises: [] },
        'Tuesday': { type: isRogers ? 'PULL' : 'UPPER BODY STRENGTH', exercises: [] },
        'Wednesday': { type: isRogers ? 'LEGS' : 'REST', exercises: [] },
        'Thursday': { type: 'REST', exercises: [] },
        'Friday': { type: isRogers ? 'PUSH' : 'CARDIO & CORE', exercises: [] },
        'Saturday': { type: isRogers ? 'PULL' : 'REST', exercises: [] },
        'Sunday': { type: 'REST', exercises: [] }
      }
    }
  };
};
