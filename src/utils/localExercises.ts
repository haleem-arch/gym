export interface LocalExercise {
  id: string;
  name: string;
  muscle_group: string;
  tier: string;
  focus: string;
  cue: string;
  rationale: string;
  equipment: string;
  image?: string;
  images?: string[];
}

export const LOCAL_EXERCISES_DICTIONARY: LocalExercise[] = [
  {
    "id": "local-0",
    "name": "3/4 Sit-Up",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie down on the floor and secure your feet. Your legs should be bent at the knees.",
    "rationale": "Place your hands behind or to the side of your head. You will begin with your back on the ground. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/3_4_Sit-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/3_4_Sit-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/3_4_Sit-Up/1.jpg"
    ]
  },
  {
    "id": "local-1",
    "name": "90/90 Hamstring",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie on your back, with one leg extended straight out.",
    "rationale": "With the other leg, bend the hip and knee to 90 degrees. You may brace your leg with your hands if necessary. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/90_90_Hamstring/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/90_90_Hamstring/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/90_90_Hamstring/1.jpg"
    ]
  },
  {
    "id": "local-2",
    "name": "Ab Crunch Machine",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Select a light resistance and sit down on the ab machine placing your feet under the pads provided and grabbing the top handles. Your arms should be bent at a 90 degree angle as you rest the triceps on the pads provided. This will be your starting position.",
    "rationale": "At the same time, begin to lift the legs up as you crunch your upper torso. Breathe out as you perform this movement. Tip: Be sure to use a slow and controlled motion. Concentrate on using your abs to move the weight while relaxing your legs and feet.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/1.jpg"
    ]
  },
  {
    "id": "local-3",
    "name": "Ab Roller",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hold the Ab Roller with both hands and kneel on the floor.",
    "rationale": "Now place the ab roller on the floor in front of you so that you are on all your hands and knees (as in a kneeling push up position). This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/1.jpg"
    ]
  },
  {
    "id": "local-4",
    "name": "Adductor",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie face down with one leg on a foam roll.",
    "rationale": "Rotate the leg so that the foam roll contacts against your inner thigh. Shift as much weight onto the foam roll as can be tolerated.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Adductor/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Adductor/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Adductor/1.jpg"
    ]
  },
  {
    "id": "local-5",
    "name": "Adductor/Groin",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Lie on your back with your feet raised towards the ceiling.",
    "rationale": "Have your partner hold your feet or ankles. Abduct your legs as far as you can. This will be your starting position.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Adductor_Groin/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Adductor_Groin/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Adductor_Groin/1.jpg"
    ]
  },
  {
    "id": "local-6",
    "name": "Advanced Kettlebell Windmill",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Clean and press a kettlebell overhead with one arm.",
    "rationale": "Keeping the kettlebell locked out at all times, push your butt out in the direction of the locked out kettlebell. Keep the non-working arm behind your back and turn your feet out at a forty-five degree angle from the arm with the kettlebell.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Advanced_Kettlebell_Windmill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Advanced_Kettlebell_Windmill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Advanced_Kettlebell_Windmill/1.jpg"
    ]
  },
  {
    "id": "local-7",
    "name": "Air Bike",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on the floor with your lower back pressed to the ground. For this exercise, you will need to put your hands beside your head. Be careful however to not strain with the neck as you perform it. Now lift your shoulders into the crunch position.",
    "rationale": "Bring knees up to where they are perpendicular to the floor, with your lower legs parallel to the floor. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/1.jpg"
    ]
  },
  {
    "id": "local-8",
    "name": "All Fours Quad Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Start off on your hands and knees, then lift your leg off the floor and hold the foot with your hand.",
    "rationale": "Use your hand to hold the foot or ankle, keeping the knee fully flexed, stretching the quadriceps and hip flexors.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/All_Fours_Quad_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/All_Fours_Quad_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/All_Fours_Quad_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-9",
    "name": "Alternate Hammer Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand up with your torso upright and a dumbbell in each hand being held at arms length. The elbows should be close to the torso.",
    "rationale": "The palms of the hands should be facing your torso. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/1.jpg"
    ]
  },
  {
    "id": "local-10",
    "name": "Alternate Heel Touchers",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie on the floor with the knees bent and the feet on the floor around 18-24 inches apart. Your arms should be extended by your side. This will be your starting position.",
    "rationale": "Crunch over your torso forward and up about 3-4 inches to the right side and touch your right heel as you hold the contraction for a second. Exhale while performing this movement.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Heel_Touchers/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Heel_Touchers/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Heel_Touchers/1.jpg"
    ]
  },
  {
    "id": "local-11",
    "name": "Alternate Incline Dumbbell Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit down on an incline bench with a dumbbell in each hand being held at arms length. Tip: Keep the elbows close to the torso.This will be your starting position.",
    "rationale": "While holding the upper arm stationary, curl the right weight forward while contracting the biceps as you breathe out. As you do so, rotate the hand so that the palm is facing up. Continue the movement until your biceps is fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a second as you squeeze the biceps. Tip: Only the forearms should move.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-12",
    "name": "Alternate Leg Diagonal Bound",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Assume a comfortable stance with one foot slightly in front of the other.",
    "rationale": "Begin by pushing off with the front leg, driving the opposite knee forward and as high as possible before landing. Attempt to cover as much distance to each side with each bound.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Leg_Diagonal_Bound/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Leg_Diagonal_Bound/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Leg_Diagonal_Bound/1.jpg"
    ]
  },
  {
    "id": "local-13",
    "name": "Alternating Cable Shoulder Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Move the cables to the bottom of the tower and select an appropriate weight.",
    "rationale": "Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Cable_Shoulder_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Cable_Shoulder_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Cable_Shoulder_Press/1.jpg"
    ]
  },
  {
    "id": "local-14",
    "name": "Alternating Deltoid Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "In a standing position, hold a pair of dumbbells at your side.",
    "rationale": "Keeping your elbows slightly bent, raise the weights directly in front of you to shoulder height, avoiding any swinging or cheating.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Deltoid_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Deltoid_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Deltoid_Raise/1.jpg"
    ]
  },
  {
    "id": "local-15",
    "name": "Alternating Floor Press",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie on the floor with two kettlebells next to your shoulders.",
    "rationale": "Position one in place on your chest and then the other, gripping the kettlebells on the handle with the palms facing forward.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Floor_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Floor_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Floor_Press/1.jpg"
    ]
  },
  {
    "id": "local-16",
    "name": "Alternating Hang Clean",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place two kettlebells between your feet. To get in the starting position, push your butt back and look straight ahead.",
    "rationale": "Clean one kettlebell to your shoulder and hold on to the other kettlebell in a hanging position. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulders. Rotate your wrist as you do so.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Hang_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Hang_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Hang_Clean/1.jpg"
    ]
  },
  {
    "id": "local-17",
    "name": "Alternating Kettlebell Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Clean two kettlebells to your shoulders. Clean the kettlebells to your shoulders by extending through the legs and hips as you pull the kettlebells towards your shoulders. Rotate your wrists as you do so.",
    "rationale": "Press one directly overhead by extending through the elbow, turning it so the palm faces forward while holding the other kettlebell stationary .",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Kettlebell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Kettlebell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Kettlebell_Press/1.jpg"
    ]
  },
  {
    "id": "local-18",
    "name": "Alternating Kettlebell Row",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place two kettlebells in front of your feet. Bend your knees slightly and push your butt out as much as possible. As you bend over to get into the starting position grab both kettlebells by the handles.",
    "rationale": "Pull one kettlebell off of the floor while holding on to the other kettlebell. Retract the shoulder blade of the working side, as you flex the elbow, drawing the kettlebell towards your stomach or rib cage.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Kettlebell_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Kettlebell_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Kettlebell_Row/1.jpg"
    ]
  },
  {
    "id": "local-19",
    "name": "Alternating Renegade Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place two kettlebells on the floor about shoulder width apart. Position yourself on your toes and your hands as though you were doing a pushup, with the body straight and extended. Use the handles of the kettlebells to support your upper body. You may need to position your feet wide for support.",
    "rationale": "Push one kettlebell into the floor and row the other kettlebell, retracting the shoulder blade of the working side as you flex the elbow, pulling it to your side.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Renegade_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Renegade_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Renegade_Row/1.jpg"
    ]
  },
  {
    "id": "local-20",
    "name": "Ankle Circles",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Use a sturdy object like a squat rack to hold yourself.",
    "rationale": "Lift the right leg in the air (just around 2 inches from the floor) and perform a circular motion with the big toe. Pretend that you are drawing a big circle with it. Tip: One circle equals 1 repetition. Breathe normally as you perform the movement.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ankle_Circles/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ankle_Circles/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ankle_Circles/1.jpg"
    ]
  },
  {
    "id": "local-21",
    "name": "Ankle On The Knee",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "From a lying position, bend your knees and keep your feet on the floor.",
    "rationale": "Place your ankle of one foot on your opposite knee.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ankle_On_The_Knee/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ankle_On_The_Knee/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ankle_On_The_Knee/1.jpg"
    ]
  },
  {
    "id": "local-22",
    "name": "Anterior Tibialis-SMR",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Begin seated on the ground with your legs bent and your feet on the floor.",
    "rationale": "Using a Muscle Roller or a rolling pin, apply pressure to the muscles on the outside of your shins. Work from just below the knee to above the ankle, pausing at points of tension for 10-30 seconds. Repeat on the other leg.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Anterior_Tibialis-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Anterior_Tibialis-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Anterior_Tibialis-SMR/1.jpg"
    ]
  },
  {
    "id": "local-23",
    "name": "Anti-Gravity Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a bar on the ground behind the head of an incline bench.",
    "rationale": "Lay on the bench face down. With a pronated grip, pick the barbell up from the floor. Flex the elbows, performing a reverse curl to bring the bar near your chest. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Anti-Gravity_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Anti-Gravity_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Anti-Gravity_Press/1.jpg"
    ]
  },
  {
    "id": "local-24",
    "name": "Arm Circles",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Stand up and extend your arms straight out by the sides. The arms should be parallel to the floor and perpendicular (90-degree angle) to your torso. This will be your starting position.",
    "rationale": "Slowly start to make circles of about 1 foot in diameter with each outstretched arm. Breathe normally as you perform the movement.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arm_Circles/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arm_Circles/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arm_Circles/1.jpg"
    ]
  },
  {
    "id": "local-25",
    "name": "Arnold Dumbbell Press",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit on an exercise bench with back support and hold two dumbbells in front of you at about upper chest level with your palms facing your body and your elbows bent. Tip: Your arms should be next to your torso. The starting position should look like the contracted portion of a dumbbell curl.",
    "rationale": "Now to perform the movement, raise the dumbbells as you rotate the palms of your hands until they are facing forward.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": "local-26",
    "name": "Around The Worlds",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lay down on a flat bench holding a dumbbell in each hand with the palms of the hands facing towards the ceiling. Tip: Your arms should be parallel to the floor and next to your thighs. To avoid injury, make sure that you keep your elbows slightly bent. This will be your starting position.",
    "rationale": "Now move the dumbbells by creating a semi-circle as you displace them from the initial position to over the head. All of the movement should happen with the arms parallel to the floor at all times. Breathe in as you perform this portion of the movement.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Around_The_Worlds/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Around_The_Worlds/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Around_The_Worlds/1.jpg"
    ]
  },
  {
    "id": "local-27",
    "name": "Atlas Stone Trainer",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strongman",
    "cue": "This trainer is effective for developing Atlas Stone strength for those who don't have access to stones, and are typically made from bar ends or heavy pipe.",
    "rationale": "Begin by loading the desired weight onto the bar. Straddle the weight, wrapping your arms around the implement, bending at the hips.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Atlas_Stone_Trainer/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Atlas_Stone_Trainer/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Atlas_Stone_Trainer/1.jpg"
    ]
  },
  {
    "id": "local-28",
    "name": "Atlas Stones",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strongman",
    "cue": "Begin with the atlas stone between your feet. Bend at the hips to wrap your arms vertically around the Atlas Stone, attempting to get your fingers underneath the stone. Many stones will have a small flat portion on the bottom, which will make the stone easier to hold.",
    "rationale": "Pulling the stone into your torso, drive through the back half of your feet to pull the stone from the ground.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Atlas_Stones/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Atlas_Stones/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Atlas_Stones/1.jpg"
    ]
  },
  {
    "id": "local-29",
    "name": "Axle Deadlift",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strongman",
    "cue": "Approach the bar so that it is centered over your feet. You feet should be about hip width apart. Bend at the hip to grip the bar at shoulder width, allowing your shoulder blades to protract. Typically, you would use an over/under grip.",
    "rationale": "With your feet and your grip set, take a big breath and then lower your hips and flex the knees until your shins contact the bar. Look forward with your head, keep your chest up and your back arched, and begin driving through the heels to move the weight upward.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Axle_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Axle_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Axle_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-30",
    "name": "Back Flyes - With Bands",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Run a band around a stationary post like that of a squat rack.",
    "rationale": "Grab the band by the handles and stand back so that the tension in the band rises.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Back_Flyes_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Back_Flyes_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Back_Flyes_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-31",
    "name": "Backward Drag",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strongman",
    "cue": "Load a sled with the desired weight, attaching a rope or straps to the sled that you can hold onto.",
    "rationale": "Begin the exercise by moving backwards for a given distance. Leaning back, extend through the legs for short steps to move as quickly as possible.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Backward_Drag/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Backward_Drag/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Backward_Drag/1.jpg"
    ]
  },
  {
    "id": "local-32",
    "name": "Backward Medicine Ball Throw",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "This exercise is best done with a partner. If you lack a partner, the ball can be thrown and retrieved or thrown against a wall.",
    "rationale": "Begin standing a few meters in front of your partner, both facing the same direction. Begin holding the ball between your legs.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Backward_Medicine_Ball_Throw/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Backward_Medicine_Ball_Throw/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Backward_Medicine_Ball_Throw/1.jpg"
    ]
  },
  {
    "id": "local-33",
    "name": "Balance Board",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a balance board in front of you.",
    "rationale": "Stand up on it and try to balance yourself.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Balance_Board/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Balance_Board/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Balance_Board/1.jpg"
    ]
  },
  {
    "id": "local-34",
    "name": "Ball Leg Curl",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin on the floor laying on your back with your feet on top of the ball.",
    "rationale": "Position the ball so that when your legs are extended your ankles are on top of the ball. This will be your starting position.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/1.jpg"
    ]
  },
  {
    "id": "local-35",
    "name": "Band Assisted Pull-Up",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Choke the band around the center of the pullup bar. You can use different bands to provide varying levels of assistance.",
    "rationale": "Pull the end of the band down, and place one bent knee into the loop, ensuring it won't slip out. Take a medium to wide grip on the bar. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/1.jpg"
    ]
  },
  {
    "id": "local-36",
    "name": "Band Good Morning",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Using a 41 inch band, stand on one end, spreading your feet a small amount. Bend at the hips to loop the end of the band behind your neck. This will be your starting position.",
    "rationale": "Keeping your legs straight, extend through the hips to come to a near vertical position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning/1.jpg"
    ]
  },
  {
    "id": "local-37",
    "name": "Band Good Morning (Pull Through)",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Loop the band around a post. Standing a little ways away, loop the opposite end around the neck. Your hands can help hold the band in position.",
    "rationale": "Begin by bending at the hips, getting your butt back as far as possible. Keep your back flat and bend forward to about 90 degrees. Your knees should be only slightly bent.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning_Pull_Through/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning_Pull_Through/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Good_Morning_Pull_Through/1.jpg"
    ]
  },
  {
    "id": "local-38",
    "name": "Band Hip Adductions",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Anchor a band around a solid post or other object.",
    "rationale": "Stand with your left side to the post, and put your right foot through the band, getting it around the ankle.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Hip_Adductions/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Hip_Adductions/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Hip_Adductions/1.jpg"
    ]
  },
  {
    "id": "local-39",
    "name": "Band Pull Apart",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Begin with your arms extended straight out in front of you, holding the band with both hands.",
    "rationale": "Initiate the movement by performing a reverse fly motion, moving your hands out laterally to your sides.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/1.jpg"
    ]
  },
  {
    "id": "local-40",
    "name": "Band Skull Crusher",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Secure a band to the base of a rack or the bench. Lay on the bench so that the band is lined up with your head.",
    "rationale": "Take hold of the band, raising your elbows so that the upper arm is perpendicular to the floor. With the elbow flexed, the band should be above your head. This will be your starting position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Skull_Crusher/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Skull_Crusher/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Skull_Crusher/1.jpg"
    ]
  },
  {
    "id": "local-41",
    "name": "Barbell Ab Rollout",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "For this exercise you will need to get into a pushup position, but instead of having your hands of the floor, you will be grabbing on to an Olympic barbell (loaded with 5-10 lbs on each side) instead. This will be your starting position.",
    "rationale": "While keeping a slight arch on your back, lift your hips and roll the barbell towards your feet as you exhale. Tip: As you perform the movement, your glutes should be coming up, you should be keeping the abs tight and should maintain your back posture at all times. Also your arms should be staying perpendicular to the floor throughout the movement. If you don't, you will work out your shoulders and back more than the abs.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Ab_Rollout/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Ab_Rollout/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Ab_Rollout/1.jpg"
    ]
  },
  {
    "id": "local-42",
    "name": "Barbell Ab Rollout - On Knees",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hold an Olympic barbell loaded with 5-10lbs on each side and kneel on the floor.",
    "rationale": "Now place the barbell on the floor in front of you so that you are on all your hands and knees (as in a kneeling push up position). This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Ab_Rollout_-_On_Knees/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Ab_Rollout_-_On_Knees/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Ab_Rollout_-_On_Knees/1.jpg"
    ]
  },
  {
    "id": "local-43",
    "name": "Barbell Bench Press - Medium Grip",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
    "rationale": "From the starting position, breathe in and begin coming down slowly until the bar touches your middle chest.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/1.jpg"
    ]
  },
  {
    "id": "local-44",
    "name": "Barbell Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up with your torso upright while holding a barbell at a shoulder-width grip. The palm of your hands should be facing forward and the elbows should be close to the torso. This will be your starting position.",
    "rationale": "While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Tip: Only the forearms should move.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-45",
    "name": "Barbell Curls Lying Against An Incline",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie against an incline bench, with your arms holding a barbell and hanging down in a horizontal line. This will be your starting position.",
    "rationale": "While keeping the upper arms stationary, curl the weight up as high as you can while squeezing the biceps. Breathe out as you perform this portion of the movement. Tip: Only the forearms should move. Do not swing the arms.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curls_Lying_Against_An_Incline/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curls_Lying_Against_An_Incline/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curls_Lying_Against_An_Incline/1.jpg"
    ]
  },
  {
    "id": "local-46",
    "name": "Barbell Deadlift",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand in front of a loaded barbell.",
    "rationale": "While keeping the back as straight as possible, bend your knees, bend forward and grasp the bar using a medium (shoulder width) overhand grip. This will be the starting position of the exercise. Tip: If it is difficult to hold on to the bar with this grip, alternate your grip or use wrist straps.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-47",
    "name": "Barbell Full Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack just above shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/1.jpg"
    ]
  },
  {
    "id": "local-48",
    "name": "Barbell Glute Bridge",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Begin seated on the ground with a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused by this exercise. Roll the bar so that it is directly above your hips, and lay down flat on the floor.",
    "rationale": "Begin the movement by driving through with your heels, extending your hips vertically through the bar. Your weight should be supported by your upper back and the heels of your feet.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/1.jpg"
    ]
  },
  {
    "id": "local-49",
    "name": "Barbell Guillotine Bench Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over your neck with your arms locked. This will be your starting position.",
    "rationale": "As you breathe in, bring the bar down slowly until it is about 1 inch from your neck.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Guillotine_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Guillotine_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Guillotine_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-50",
    "name": "Barbell Hack Squat",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up straight while holding a barbell behind you at arms length and your feet at shoulder width. Tip: A shoulder width grip is best with the palms of your hands facing back. You can use wrist wraps for this exercise for a better grip. This will be your starting position.",
    "rationale": "While keeping your head and eyes up and back straight, squat until your upper thighs are parallel to the floor. Breathe in as you slowly go down.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hack_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hack_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hack_Squat/1.jpg"
    ]
  },
  {
    "id": "local-51",
    "name": "Barbell Hip Thrust",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused by this exercise.",
    "rationale": "Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/1.jpg"
    ]
  },
  {
    "id": "local-52",
    "name": "Barbell Incline Bench Press - Medium Grip",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie back on an incline bench. Using a medium-width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on you upper chest.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg"
    ]
  },
  {
    "id": "local-53",
    "name": "Barbell Incline Shoulder Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie back on an Incline Bench. Using a medium width grip (a grip that is slightly wider than shoulder width), lift the bar from the rack and hold it straight over you with your arms straight. This will be your starting position.",
    "rationale": "While keeping the arms straight, lift the bar by protracting your shoulder blades, raising the shoulders from the bench as you breathe out.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Shoulder_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Shoulder_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Shoulder_Raise/1.jpg"
    ]
  },
  {
    "id": "local-54",
    "name": "Barbell Lunge",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack just below shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/1.jpg"
    ]
  },
  {
    "id": "local-55",
    "name": "Barbell Rear Delt Row",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up straight while holding a barbell using a wide (higher than shoulder width) and overhand (palms facing your body) grip.",
    "rationale": "Bend knees slightly and bend over as you keep the natural arch of your back. Let the arms hang in front of you as they hold the bar. Once your torso is parallel to the floor, flare the elbows out and away from your body. Tip: Your torso and your arms should resemble the letter \"T\". Now you are ready to begin the exercise.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rear_Delt_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rear_Delt_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rear_Delt_Row/1.jpg"
    ]
  },
  {
    "id": "local-56",
    "name": "Barbell Rollout from Bench",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a loaded barbell on the ground, near the end of a bench. Kneel with both legs on the bench, and take a medium to narrow grip on the barbell. This will be your starting position.",
    "rationale": "To begin, extend through the hips to slowly roll the bar forward. As you roll out, flex the shoulder to roll the bar above your head. Ensure that your arms remain extended throughout the movement.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rollout_from_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rollout_from_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Rollout_from_Bench/1.jpg"
    ]
  },
  {
    "id": "local-57",
    "name": "Barbell Seated Calf Raise",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a block about 12 inches in front of a flat bench.",
    "rationale": "Sit on the bench and place the ball of your feet on the block.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/1.jpg"
    ]
  },
  {
    "id": "local-58",
    "name": "Barbell Shoulder Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit on a bench with back support in a squat rack. Position a barbell at a height that is just above your head. Grab the barbell with a pronated grip (palms facing forward).",
    "rationale": "Once you pick up the barbell with the correct grip width, lift the bar up over your head by locking your arms. Hold at about shoulder level and slightly in front of your head. This is your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/1.jpg"
    ]
  },
  {
    "id": "local-59",
    "name": "Barbell Shrug",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up straight with your feet at shoulder width as you hold a barbell with both hands in front of you using a pronated grip (palms facing the thighs). Tip: Your hands should be a little wider than shoulder width apart. You can use wrist wraps for this exercise for a better grip. This will be your starting position.",
    "rationale": "Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second. Tip: Refrain from trying to lift the barbell by using your biceps.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/1.jpg"
    ]
  },
  {
    "id": "local-60",
    "name": "Barbell Shrug Behind The Back",
    "muscle_group": "Other",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up straight with your feet at shoulder width as you hold a barbell with both hands behind your back using a pronated grip (palms facing back). Tip: Your hands should be a little wider than shoulder width apart. You can use wrist wraps for this exercise for better grip. This will be your starting position.",
    "rationale": "Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second. Tip: Refrain from trying to lift the barbell by using your biceps. The arms should remain stretched out at all times.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug_Behind_The_Back/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug_Behind_The_Back/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug_Behind_The_Back/1.jpg"
    ]
  },
  {
    "id": "local-61",
    "name": "Barbell Side Bend",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck). Your feet should be shoulder width apart. This will be your starting position.",
    "rationale": "While keeping your back straight and your head up, bend only at the waist to the right as far as possible. Breathe in as you bend to the side. Then hold for a second and come back up to the starting position as you exhale. Tip: Keep the rest of the body stationary.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Bend/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Bend/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Bend/1.jpg"
    ]
  },
  {
    "id": "local-62",
    "name": "Barbell Side Split Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck). Your feet should be placed wide apart with the foot of the lead leg angled out to the side. This will be your starting position.",
    "rationale": "Lower your body towards the side of your angled foot by bending the knee and hip of your lead leg and while keeping the opposite leg only slightly bent. Breathe in as you lower your body.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Split_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Split_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Split_Squat/1.jpg"
    ]
  },
  {
    "id": "local-63",
    "name": "Barbell Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack to just below shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/1.jpg"
    ]
  },
  {
    "id": "local-64",
    "name": "Barbell Squat To A Bench",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first place a flat bench or a box behind you. The flat bench is used to teach you to set your hips back and to hit depth.",
    "rationale": "Targets quadriceps.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat_To_A_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat_To_A_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat_To_A_Bench/1.jpg"
    ]
  },
  {
    "id": "local-65",
    "name": "Barbell Step Ups",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated platform (such as the one used for spotting behind a flat bench). This is your starting position.",
    "rationale": "Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift the rest of your body up and place the foot of the left leg on the platform as well. Breathe out as you execute the force required to come up.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/1.jpg"
    ]
  },
  {
    "id": "local-66",
    "name": "Barbell Walking Lunge",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Begin standing with your feet shoulder width apart and a barbell across your upper back.",
    "rationale": "Step forward with one leg, flexing the knees to drop your hips. Descend until your rear knee nearly touches the ground. Your posture should remain upright, and your front knee should stay above the front foot.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/1.jpg"
    ]
  },
  {
    "id": "local-67",
    "name": "Battling Ropes",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "For this exercise you will need a heavy rope anchored at its center 15-20 feet away. Standing in front of the rope, take an end in each hand with your arms extended at your side. This will be your starting position.",
    "rationale": "Initiate the movement by rapidly raising one arm to shoulder level as quickly as you can.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Battling_Ropes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Battling_Ropes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Battling_Ropes/1.jpg"
    ]
  },
  {
    "id": "local-68",
    "name": "Bear Crawl Sled Drags",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strongman",
    "cue": "Wearing either a harness or a loose weight belt, attach the chain to the back so that you will be facing away from the sled. Bend down so that your hands are on the ground. Your back should be flat and knees bent. This is your starting position.",
    "rationale": "Begin by driving with legs, alternating left and right. Use your hands to maintain balance and to help pull. Try to keep your back flat as you move over a given distance.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bear_Crawl_Sled_Drags/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bear_Crawl_Sled_Drags/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bear_Crawl_Sled_Drags/1.jpg"
    ]
  },
  {
    "id": "local-69",
    "name": "Behind Head Chest Stretch",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Sit upright on the floor with your partner behind you.",
    "rationale": "Place your hands behind your hand, and push your elbows back as far as you can. Your partner should hold your elbows. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Behind_Head_Chest_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-70",
    "name": "Bench Dips",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "For this exercise you will need to place a bench behind your back. With the bench perpendicular to your body, and while looking away from it, hold on to the bench on its edge with the hands fully extended, separated at shoulder width. The legs will be extended forward, bent at the waist and perpendicular to your torso. This will be your starting position.",
    "rationale": "Slowly lower your body as you inhale by bending at the elbows until you lower yourself far enough to where there is an angle slightly smaller than 90 degrees between the upper arm and the forearm. Tip: Keep the elbows as close as possible throughout the movement. Forearms should always be pointing down.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/1.jpg"
    ]
  },
  {
    "id": "local-71",
    "name": "Bench Jump",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Begin with a box or bench 1-2 feet in front of you. Stand with your feet shoulder width apart. This will be your starting position.",
    "rationale": "Perform a short squat in preparation for the jump; swing your arms behind you.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Jump/1.jpg"
    ]
  },
  {
    "id": "local-72",
    "name": "Bench Press - Powerlifting",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Begin by lying on the bench, getting your head beyond the bar if possible. Tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement.",
    "rationale": "However wide your grip, it should cover the ring on the bar. Pull the bar out of the rack without protracting your shoulders. Focus on squeezing the bar and trying to pull it apart.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/1.jpg"
    ]
  },
  {
    "id": "local-73",
    "name": "Bench Press - With Bands",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Using a flat bench secure a band under the leg of the bench that is nearest to your head.",
    "rationale": "Once the band is secure, grab it by both handles and lie down on the bench.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-74",
    "name": "Bench Press with Chains",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Adjust the leader chain, shortening it to the desired length.Place the chains on the sleeves of the bar.",
    "rationale": "Lying on the bench, get your head beyond the bar if possible. Tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement. However wide your grip, it should cover the ring on the bar.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_with_Chains/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_with_Chains/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_with_Chains/1.jpg"
    ]
  },
  {
    "id": "local-75",
    "name": "Bench Sprint",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "Stand on the ground with one foot resting on a bench or box with your heel close to the edge.",
    "rationale": "Push off with your foot on top of the bench, extending through the hip and knee.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Sprint/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Sprint/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Sprint/1.jpg"
    ]
  },
  {
    "id": "local-76",
    "name": "Bent-Arm Barbell Pullover",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on a flat bench with a barbell using a shoulder grip width.",
    "rationale": "Hold the bar straight over your chest with a bend in your arms. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Barbell_Pullover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Barbell_Pullover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Barbell_Pullover/1.jpg"
    ]
  },
  {
    "id": "local-77",
    "name": "Bent-Arm Dumbbell Pullover",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a dumbbell standing up on a flat bench.",
    "rationale": "Ensuring that the dumbbell stays securely placed at the top of the bench, lie perpendicular to the bench (torso across it as in forming a cross) with only your shoulders lying on the surface. Hips should be below the bench and legs bent with feet firmly on the floor. The head will be off the bench as well.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/1.jpg"
    ]
  },
  {
    "id": "local-78",
    "name": "Bent-Knee Hip Raise",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lay flat on the floor with your arms next to your sides.",
    "rationale": "Now bend your knees at around a 75 degree angle and lift your feet off the floor by around 2 inches.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Knee_Hip_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Knee_Hip_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Knee_Hip_Raise/1.jpg"
    ]
  },
  {
    "id": "local-79",
    "name": "Bent Over Barbell Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Holding a barbell with a pronated grip (palms facing down), bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The barbell should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.",
    "rationale": "Now, while keeping the torso stationary, breathe out and lift the barbell to you. Keep the elbows close to the body and only use the forearms to hold the weight. At the top contracted position, squeeze the back muscles and hold for a brief pause.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/1.jpg"
    ]
  },
  {
    "id": "local-80",
    "name": "Bent Over Dumbbell Rear Delt Raise With Head On Bench",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up straight while holding a dumbbell in each hand and with an incline bench in front of you.",
    "rationale": "While keeping your back straight and maintaining the natural arch of your back, lean forward until your forehead touches the bench in front of you. Let the arms hang in front of you perpendicular to the ground. The palms of your hands should be facing each other and your torso should be parallel to the floor. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/1.jpg"
    ]
  },
  {
    "id": "local-81",
    "name": "Bent Over Low-Pulley Side Lateral",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Select a weight and hold the handle of the low pulley with your right hand.",
    "rationale": "Bend at the waist until your torso is nearly parallel to the floor. Your legs should be slightly bent with your left hand placed on your lower left thigh. Your right arm should be hanging from your shoulder in front of you and with a slight bend at the elbow. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Low-Pulley_Side_Lateral/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Low-Pulley_Side_Lateral/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Low-Pulley_Side_Lateral/1.jpg"
    ]
  },
  {
    "id": "local-82",
    "name": "Bent Over One-Arm Long Bar Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Put weight on one of the ends of an Olympic barbell. Make sure that you either place the other end of the barbell in the corner of two walls; or put a heavy object on the ground so the barbell cannot slide backward.",
    "rationale": "Bend forward until your torso is as close to parallel with the floor as you can and keep your knees slightly bent.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_One-Arm_Long_Bar_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_One-Arm_Long_Bar_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_One-Arm_Long_Bar_Row/1.jpg"
    ]
  },
  {
    "id": "local-83",
    "name": "Bent Over Two-Arm Long Bar Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Put weight on one of the ends of an Olympic barbell. Make sure that you either place the other end of the barbell in the corner of two walls; or put a heavy object on the ground so the barbell cannot slide backward.",
    "rationale": "Bend forward until your torso is as close to parallel with the floor as you can and keep your knees slightly bent.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/1.jpg"
    ]
  },
  {
    "id": "local-84",
    "name": "Bent Over Two-Dumbbell Row",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "With a dumbbell in each hand (palms facing your torso), bend your knees slightly and bring your torso forward by bending at the waist; as you bend make sure to keep your back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The weights should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.",
    "rationale": "While keeping the torso stationary, lift the dumbbells to your side (as you breathe out), keeping the elbows close to the body (do not exert any force with the forearm other than holding the weights). On the top contracted position, squeeze the back muscles and hold for a second.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/1.jpg"
    ]
  },
  {
    "id": "local-85",
    "name": "Bent Over Two-Dumbbell Row With Palms In",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "With a dumbbell in each hand (palms facing each other), bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The weights should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.",
    "rationale": "While keeping the torso stationary, lift the dumbbells to your side as you breathe out, squeezing your shoulder blades together. On the top contracted position, squeeze the back muscles and hold for a second.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row_With_Palms_In/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row_With_Palms_In/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row_With_Palms_In/1.jpg"
    ]
  },
  {
    "id": "local-86",
    "name": "Bent Press",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Clean a kettlebell to your shoulder. Clean the kettlebell to your shoulders by extending through the legs and hips as you raise the kettlebell towards your shoulder. The wrist should rotate as you do so. This will be your starting position.",
    "rationale": "Begin my leaning to the side opposite the kettlebell, continuing until you are able to touch the ground with your free hand, keeping your eyes on the kettlebell. As you do so, press the weight vertically be extending through the elbow, keeping your arm perpendicular to the ground.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Press/1.jpg"
    ]
  },
  {
    "id": "local-87",
    "name": "Bicycling",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Cardio",
    "cue": "To begin, seat yourself on the bike and adjust the seat to your height.",
    "rationale": "Targets quadriceps.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling/1.jpg"
    ]
  },
  {
    "id": "local-88",
    "name": "Bicycling, Stationary",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "To begin, seat yourself on the bike and adjust the seat to your height.",
    "rationale": "Select the desired option from the menu. You may have to start pedaling to turn it on. You can use the manual setting, or you can select a program to use. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. The level of resistance can be changed throughout the workout. The handles can be used to monitor your heart rate to help you stay at an appropriate intensity.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling_Stationary/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling_Stationary/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling_Stationary/1.jpg"
    ]
  },
  {
    "id": "local-89",
    "name": "Board Press",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Begin by lying on the bench, getting your head beyond the bar if possible. One to five boards, made out of 2x6's, can be screwed together and held in place by a training partner, bands, or just tucked under your shirt.",
    "rationale": "Tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Board_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Board_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Board_Press/1.jpg"
    ]
  },
  {
    "id": "local-90",
    "name": "Body-Up",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Assume a plank position on the ground. You should be supporting your bodyweight on your toes and forearms, keeping your torso straight. Your forearms should be shoulder-width apart. This will be your starting position.",
    "rationale": "Pressing your palms firmly into the ground, extend through the elbows to raise your body from the ground. Keep your torso rigid as you perform the movement.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Body-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Body-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Body-Up/1.jpg"
    ]
  },
  {
    "id": "local-91",
    "name": "Body Tricep Press",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position a bar in a rack at chest height.",
    "rationale": "Standing, take a shoulder width grip on the bar and step a yard or two back, feet together and arms extended so that you are leaning on the bar. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Body_Tricep_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Body_Tricep_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Body_Tricep_Press/1.jpg"
    ]
  },
  {
    "id": "local-92",
    "name": "Bodyweight Flyes",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position two equally loaded EZ bars on the ground next to each other. Ensure they are able to roll.",
    "rationale": "Assume a push-up position over the bars, supporting your weight on your toes and hands with your arms extended and body straight.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Flyes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Flyes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Flyes/1.jpg"
    ]
  },
  {
    "id": "local-93",
    "name": "Bodyweight Mid Row",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Begin by taking a medium to wide grip on a pull-up apparatus with your palms facing away from you. From a hanging position, tuck your knees to your chest, leaning back and getting your legs over your side of the pull-up apparatus. This will be your starting position.",
    "rationale": "Beginning with your arms straight, flex the elbows and retract the shoulder blades to raise your body up until your legs contact the pull-up apparatus.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Mid_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Mid_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Mid_Row/1.jpg"
    ]
  },
  {
    "id": "local-94",
    "name": "Bodyweight Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand with your feet shoulder width apart. You can place your hands behind your head. This will be your starting position.",
    "rationale": "Begin the movement by flexing your knees and hips, sitting back with your hips.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/1.jpg"
    ]
  },
  {
    "id": "local-95",
    "name": "Bodyweight Walking Lunge",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Begin standing with your feet shoulder width apart and your hands on your hips.",
    "rationale": "Step forward with one leg, flexing the knees to drop your hips. Descend until your rear knee nearly touches the ground. Your posture should remain upright, and your front knee should stay above the front foot.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Walking_Lunge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Walking_Lunge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Walking_Lunge/1.jpg"
    ]
  },
  {
    "id": "local-96",
    "name": "Bosu Ball Cable Crunch With Side Bends",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Connect a standard handle to each arm of a cable machine, and position them in the most downward position.",
    "rationale": "Grab a Bosu Ball and position it in front and center of the cable machine.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bosu_Ball_Cable_Crunch_With_Side_Bends/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bosu_Ball_Cable_Crunch_With_Side_Bends/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bosu_Ball_Cable_Crunch_With_Side_Bends/1.jpg"
    ]
  },
  {
    "id": "local-97",
    "name": "Bottoms-Up Clean From The Hang Position",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Initiate the exercise by standing upright with a kettlebell in one hand.",
    "rationale": "Swing the kettlebell back forcefully and then reverse the motion forcefully. Crush the kettlebell handle as hard as possible and raise the kettlebell to your shoulder.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bottoms-Up_Clean_From_The_Hang_Position/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bottoms-Up_Clean_From_The_Hang_Position/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bottoms-Up_Clean_From_The_Hang_Position/1.jpg"
    ]
  },
  {
    "id": "local-98",
    "name": "Bottoms Up",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin by lying on your back on the ground. Your legs should be straight and your arms at your side. This will be your starting position.",
    "rationale": "To perform the movement, tuck the knees toward your chest by flexing the hips and knees. Following this, extend your legs directly above you so that they are perpendicular to the ground. Rotate and elevate your pelvis to raise your glutes from the floor.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bottoms_Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bottoms_Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bottoms_Up/1.jpg"
    ]
  },
  {
    "id": "local-99",
    "name": "Box Jump (Multiple Response)",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Assume a relaxed stance facing the box or platform approximately an arm's length away. Arms should be down at the sides and legs slightly bent.",
    "rationale": "Using the arms to aid in the initial burst, jump upward and forward, landing with feet simultaneously on top of the box or platform.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Jump_Multiple_Response/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Jump_Multiple_Response/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Jump_Multiple_Response/1.jpg"
    ]
  },
  {
    "id": "local-100",
    "name": "Box Skip",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "You will need several boxes lined up about 8 feet apart.",
    "rationale": "Begin facing the first box with one leg slightly behind the other.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Skip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Skip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Skip/1.jpg"
    ]
  },
  {
    "id": "local-101",
    "name": "Box Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "The box squat allows you to squat to desired depth and develop explosive strength in the squat movement. Begin in a power rack with a box at the appropriate height behind you. Typically, you would aim for a box height that brings you to a parallel squat, but you can train higher or lower if desired.",
    "rationale": "Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders. Remove the bar from the rack, creating a tight arch in your lower back, and step back into position. Place your feet wider for more emphasis on the back, glutes, adductors, and hamstrings, or closer together for more quad development. Keep your head facing forward.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/1.jpg"
    ]
  },
  {
    "id": "local-102",
    "name": "Box Squat with Bands",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Begin in a power rack with a box at the appropriate height behind you. Set up the bands on the sleeves, secured to either band pegs, the rack, or dumbbells so that there is appropriate tension. If dumbbells are used, secure them so that they don't move. Also, ensure that the dumbbells you are using are heavy enough for the bands that you are using. Additional plates can be used to hold the dumbbells down. If more tension is needed, you can either widen the base on the floor or choke the bands. Typically, you would aim for a box height that brings you to a parallel squat, but you can train higher or lower if desired.",
    "rationale": "Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders. Remove the bar from the rack, creating a tight arch in your lower back, and step back into position. Place your feet wider for more emphasis on the back, glutes, adductors, and hamstrings, or closer together for more quad development. Keep your head facing forward.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat_with_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat_with_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat_with_Bands/1.jpg"
    ]
  },
  {
    "id": "local-103",
    "name": "Box Squat with Chains",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin in a power rack with a box at the appropriate height behind you. Typically, you would aim for a box height that brings you to a parallel squat, but you can train higher or lower if desired.",
    "rationale": "To set up the chains, begin by looping the leader chain over the sleeves of the bar. The heavy chain should be attached using a snap hook. Adjust the length of the lead chain so that a few links are still on the floor at the top of the movement.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat_with_Chains/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat_with_Chains/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat_with_Chains/1.jpg"
    ]
  },
  {
    "id": "local-104",
    "name": "Brachialis-SMR",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie on your side, with your upper arm against the foam roller. The upper arm should be more or less aligned with your body, with the outside of the bicep pressed against the foam roller.",
    "rationale": "Raise your hips off of the floor, supporting your weight on your arm and on your feet. Hold for 10-30 seconds, and then switch sides.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Brachialis-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Brachialis-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Brachialis-SMR/1.jpg"
    ]
  },
  {
    "id": "local-105",
    "name": "Bradford/Rocky Presses",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit on a Military Press Bench with a bar at shoulder level with a pronated grip (palms facing forward). Tip: Your grip should be wider than shoulder width and it should create a 90-degree angle between the forearm and the upper arm as the barbell goes down. This is your starting position.",
    "rationale": "Once you pick up the barbell with the correct grip, lift the bar up over your head by locking your arms.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bradford_Rocky_Presses/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bradford_Rocky_Presses/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bradford_Rocky_Presses/1.jpg"
    ]
  },
  {
    "id": "local-106",
    "name": "Butt-Ups",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin a pushup position but with your elbows on the ground and resting on your forearms. Your arms should be bent at a 90 degree angle.",
    "rationale": "Arch your back slightly out rather than keeping your back completely straight.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt-Ups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt-Ups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt-Ups/1.jpg"
    ]
  },
  {
    "id": "local-107",
    "name": "Butt Lift (Bridge)",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on the floor on your back with the hands by your side and your knees bent. Your feet should be placed around shoulder width. This will be your starting position.",
    "rationale": "Pushing mainly with your heels, lift your hips off the floor while keeping your back straight. Breathe out as you perform this part of the motion and hold at the top for a second.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/1.jpg"
    ]
  },
  {
    "id": "local-108",
    "name": "Butterfly",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit on the machine with your back flat on the pad.",
    "rationale": "Take hold of the handles. Tip: Your upper arms should be positioned parallel to the floor; adjust the machine accordingly. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/1.jpg"
    ]
  },
  {
    "id": "local-109",
    "name": "Cable Chest Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your head and chest up. The elbows should be bent to about 90 degrees. This will be your starting position.",
    "rationale": "Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the movement.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Chest_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Chest_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Chest_Press/1.jpg"
    ]
  },
  {
    "id": "local-110",
    "name": "Cable Crossover",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "To get yourself into the starting position, place the pulleys on a high position (above your head), select the resistance to be used and hold the pulleys in each hand.",
    "rationale": "Step forward in front of an imaginary straight line between both pulleys while pulling your arms together in front of you. Your torso should have a small forward bend from the waist. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/1.jpg"
    ]
  },
  {
    "id": "local-111",
    "name": "Cable Crunch",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Kneel below a high pulley that contains a rope attachment.",
    "rationale": "Grasp cable rope attachment and lower the rope until your hands are placed next to your face.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-112",
    "name": "Cable Deadlifts",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Move the cables to the bottom of the towers and select an appropriate weight. Stand directly in between the uprights.",
    "rationale": "To begin, squat down be flexing your hips and knees until you can reach the handles.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Deadlifts/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Deadlifts/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Deadlifts/1.jpg"
    ]
  },
  {
    "id": "local-113",
    "name": "Cable Hammer Curls - Rope Attachment",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach a rope attachment to a low pulley and stand facing the machine about 12 inches away from it.",
    "rationale": "Grasp the rope with a neutral (palms-in) grip and stand straight up keeping the natural arch of the back and your torso stationary.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/1.jpg"
    ]
  },
  {
    "id": "local-114",
    "name": "Cable Hip Adduction",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand in front of a low pulley facing forward with one leg next to the pulley and the other one away.",
    "rationale": "Attach the ankle cuff to the cable and also to the ankle of the leg that is next to the pulley.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hip_Adduction/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hip_Adduction/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hip_Adduction/1.jpg"
    ]
  },
  {
    "id": "local-115",
    "name": "Cable Incline Pushdown",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie on incline an bench facing away from a high pulley machine that has a straight bar attachment on it.",
    "rationale": "Grasp the straight bar attachment overhead with a pronated (overhand; palms down) shoulder width grip and extend your arms in front of you. The bar should be around 2 inches away from your upper thighs. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Incline_Pushdown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Incline_Pushdown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Incline_Pushdown/1.jpg"
    ]
  },
  {
    "id": "local-116",
    "name": "Cable Incline Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on incline an bench facing away from a high pulley machine that has a straight bar attachment on it.",
    "rationale": "Grasp the straight bar attachment overhead with a pronated (overhand; palms down) narrow grip (less than shoulder width) and keep your elbows tucked in to your sides. Your upper arms should create around a 25 degree angle when measured from the floor.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Incline_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Incline_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Incline_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-117",
    "name": "Cable Internal Rotation",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit next to a low pulley sideways (with legs stretched in front of you or crossed) and grasp the single hand cable attachment with the arm nearest to the cable. Tip: If you can adjust the pulley's height, you can use a flat bench to sit on instead.",
    "rationale": "Position the elbow against your side with the elbow bent at 90° and the arm pointing towards the pulley. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Internal_Rotation/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Internal_Rotation/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Internal_Rotation/1.jpg"
    ]
  },
  {
    "id": "local-118",
    "name": "Cable Iron Cross",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin by moving the pulleys to the high position, select the resistance to be used, and take a handle in each hand.",
    "rationale": "Stand directly between both pulleys with your arms extended out to your sides. Your head and chest should be up while your arms form a \"T\". This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Iron_Cross/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Iron_Cross/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Iron_Cross/1.jpg"
    ]
  },
  {
    "id": "local-119",
    "name": "Cable Judo Flip",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Connect a rope attachment to a tower, and move the cable to the lowest pulley position. Stand with your side to the cable with a wide stance, and grab the rope with both hands.",
    "rationale": "Twist your body away from the pulley as you bring the rope over your shoulder like you're performing a judo flip.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Judo_Flip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Judo_Flip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Judo_Flip/1.jpg"
    ]
  },
  {
    "id": "local-120",
    "name": "Cable Lying Triceps Extension",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie on a flat bench and grasp the straight bar attachment of a low pulley with a narrow overhand grip. Tip: The easiest way to do this is to have someone hand you the bar as you lay down.",
    "rationale": "With your arms extended, position the bar over your torso. Your arms and your torso should create a 90-degree angle. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lying_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-121",
    "name": "Cable One Arm Tricep Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "With your right hand, grasp a single handle attached to the high-cable pulley using a supinated (underhand; palms facing up) grip. You should be standing directly in front of the weight stack.",
    "rationale": "Now pull the handle down so that your upper arm and elbow are locked in to the side of your body. Your upper arm and forearm should form an acute angle (less than 90-degrees). You can keep the other arm by the waist and you can have one leg in front of you and the other one back for better balance. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_One_Arm_Tricep_Extension/1.jpg"
    ]
  },
  {
    "id": "local-122",
    "name": "Cable Preacher Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a preacher bench about 2 feet in front of a pulley machine.",
    "rationale": "Attach a straight bar to the low pulley.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Preacher_Curl/1.jpg"
    ]
  },
  {
    "id": "local-123",
    "name": "Cable Rear Delt Fly",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Adjust the pulleys to the appropriate height and adjust the weight. The pulleys should be above your head.",
    "rationale": "Grab the left pulley with your right hand and the right pulley with your left hand, crossing them in front of you. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/1.jpg"
    ]
  },
  {
    "id": "local-124",
    "name": "Cable Reverse Crunch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Connect an ankle strap attachment to a low pulley cable and position a mat on the floor in front of it.",
    "rationale": "Sit down with your feet toward the pulley and attach the cable to your ankles.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Reverse_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Reverse_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Reverse_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-125",
    "name": "Cable Rope Overhead Triceps Extension",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Attach a rope to the bottom pulley of the pulley machine.",
    "rationale": "Grasping the rope with both hands, extend your arms with your hands directly above your head using a neutral grip (palms facing each other). Your elbows should be in close to your head and the arms should be perpendicular to the floor with the knuckles aimed at the ceiling. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-126",
    "name": "Cable Rope Rear-Delt Rows",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit in the same position on a low pulley row station as you would if you were doing seated cable rows for the back.",
    "rationale": "Attach a rope to the pulley and grasp it with an overhand grip. Your arms should be extended and parallel to the floor with the elbows flared out.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Rear-Delt_Rows/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Rear-Delt_Rows/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Rear-Delt_Rows/1.jpg"
    ]
  },
  {
    "id": "local-127",
    "name": "Cable Russian Twists",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Connect a standard handle attachment, and position the cable to a middle pulley position.",
    "rationale": "Lie on a stability ball perpendicular to the cable and grab the handle with one hand. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Russian_Twists/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Russian_Twists/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Russian_Twists/1.jpg"
    ]
  },
  {
    "id": "local-128",
    "name": "Cable Seated Crunch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Seat on a flat bench with your back facing a high pulley.",
    "rationale": "Grasp the cable rope attachment with both hands (with the palms of the hands facing each other) and place your hands securely over both shoulders. Tip: Allow the weight to hyperextend the lower back slightly. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-129",
    "name": "Cable Seated Lateral Raise",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand in the middle of two low pulleys that are opposite to each other and place a flat bench right behind you (in perpendicular fashion to you; the narrow edge of the bench should be the one behind you). Select the weight to be used on each pulley.",
    "rationale": "Now sit at the edge of the flat bench behind you with your feet placed in front of your knees.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/1.jpg"
    ]
  },
  {
    "id": "local-130",
    "name": "Cable Shoulder Press",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Move the cables to the bottom of the towers and select an appropriate weight.",
    "rationale": "Stand directly in between the uprights. Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shoulder_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shoulder_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shoulder_Press/1.jpg"
    ]
  },
  {
    "id": "local-131",
    "name": "Cable Shrugs",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grasp a cable bar attachment that is attached to a low pulley with a shoulder width or slightly wider overhand (palms facing down) grip.",
    "rationale": "Stand erect close to the pulley with your arms extended in front of you holding the bar. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shrugs/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shrugs/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shrugs/1.jpg"
    ]
  },
  {
    "id": "local-132",
    "name": "Cable Wrist Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start out by placing a flat bench in front of a low pulley cable that has a straight bar attachment.",
    "rationale": "Use your arms to grab the cable bar with a narrow to shoulder width supinated grip (palms up) and bring them up so that your forearms are resting against the top of your thighs. Your wrists should be hanging just beyond your knees.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-133",
    "name": "Calf-Machine Shoulder Shrug",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position yourself on the calf machine so that the shoulder pads are above your shoulders. Your torso should be straight with the arms extended normally by your side. This will be your starting position.",
    "rationale": "Raise your shoulders up towards your ears as you exhale and hold the contraction for a full second.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf-Machine_Shoulder_Shrug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf-Machine_Shoulder_Shrug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf-Machine_Shoulder_Shrug/1.jpg"
    ]
  },
  {
    "id": "local-134",
    "name": "Calf Press",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the seat so that your legs are only slightly bent in the start position. The balls of your feet should be firmly on the platform.",
    "rationale": "Select an appropriate weight, and grasp the handles. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press/1.jpg"
    ]
  },
  {
    "id": "local-135",
    "name": "Calf Press On The Leg Press Machine",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a medium (shoulder width) foot stance.",
    "rationale": "Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of you without locking your knees. (Note: In some leg press units you can leave the safety bars on for increased safety. If your leg press unit allows for this, then this is the preferred method of performing the exercise.) Your torso and the legs should make perfect 90-degree angle. Now carefully place your toes and balls of your feet on the lower portion of the platform with the heels extending off. Toes should be facing forward, outwards or inwards as described at the beginning of the chapter. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/1.jpg"
    ]
  },
  {
    "id": "local-136",
    "name": "Calf Raise On A Dumbbell",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hang on to a sturdy object for balance and stand on a dumbbell handle, preferably one with round plates so that it rolls as in this manner you have to work harder to stabilize yourself; thus increasing the effectiveness of the exercise.",
    "rationale": "Now roll your foot slightly forward so that you can get a nice stretch of the calf. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raise_On_A_Dumbbell/1.jpg"
    ]
  },
  {
    "id": "local-137",
    "name": "Calf Raises - With Bands",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab an exercise band and stand on it with your toes making sure that the length of the band between the foot and the arms is the same for both sides.",
    "rationale": "While holding the handles of the band, raise the arms to the side of your head as if you were getting ready to perform a shoulder press. The palms should be facing forward with the elbows bent and to the sides. This movement will create tension on the band. This will be your starting position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Raises_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-138",
    "name": "Calf Stretch Elbows Against Wall",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Stand facing a wall from a couple feet away.",
    "rationale": "Lean against the wall, placing your weight on your forearms.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Stretch_Elbows_Against_Wall/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Stretch_Elbows_Against_Wall/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Stretch_Elbows_Against_Wall/1.jpg"
    ]
  },
  {
    "id": "local-139",
    "name": "Calf Stretch Hands Against Wall",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand facing a wall from several feet away. Stagger your stance, placing one foot forward.",
    "rationale": "Lean forward and rest your hands on the wall, keeping your heel, hip and head in a straight line.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Stretch_Hands_Against_Wall/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Stretch_Hands_Against_Wall/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Stretch_Hands_Against_Wall/1.jpg"
    ]
  },
  {
    "id": "local-140",
    "name": "Calves-SMR",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Begin seated on the floor. Place a foam roller underneath your lower leg. Your other leg can either be crossed over the opposite or be placed on the floor, supporting some of your weight. This will be your starting position.",
    "rationale": "Place your hands to your side or just behind you, and press down to raise your hips off of the floor, placing much of your weight against your calf muscle. Roll from below the knee to above the ankle, pausing at points of tension for 10-30 seconds. Repeat for the other leg.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calves-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calves-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calves-SMR/1.jpg"
    ]
  },
  {
    "id": "local-141",
    "name": "Car Deadlift",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strongman",
    "cue": "This event apparatus typically has neutral grip handles, however some have a straight bar that you can approach like a normal deadlift. The apparatus can be loaded with a vehicle or other heavy objects such as tractor tires or kegs.",
    "rationale": "Center yourself between the handles if you are a strong squatter, or back a couple inches if you are a strong deadlifter. You feet should be about hip width apart. Bend at the hip to grip the handles. With your feet and your grip set, take a big breath and then lower your hips and flex the knees.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-142",
    "name": "Car Drivers",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "While standing upright, hold a barbell plate in both hands at the 3 and 9 o'clock positions. Your palms should be facing each other and your arms should be extended straight out in front of you. This will be your starting position.",
    "rationale": "Initiate the movement by rotating the plate as far to one side as possible. Use the same type of movement you would use to turn a steering wheel to one side.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Drivers/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Drivers/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Car_Drivers/1.jpg"
    ]
  },
  {
    "id": "local-143",
    "name": "Carioca Quick Step",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Begin with your feet a few inches apart and your left arm up in a relaxed, athletic position.",
    "rationale": "With your right foot, quick step behind and pull the knee up.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Carioca_Quick_Step/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Carioca_Quick_Step/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Carioca_Quick_Step/1.jpg"
    ]
  },
  {
    "id": "local-144",
    "name": "Cat Stretch",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Position yourself on the floor on your hands and knees.",
    "rationale": "Pull your belly in and round your spine, lower back, shoulders, and neck, letting your head drop.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cat_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cat_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cat_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-145",
    "name": "Catch and Overhead Throw",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "Begin standing while facing a wall or a partner.",
    "rationale": "Using both hands, position the ball behind your head, stretching as much as possible, and forcefully throw the ball forward.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Catch_and_Overhead_Throw/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Catch_and_Overhead_Throw/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Catch_and_Overhead_Throw/1.jpg"
    ]
  },
  {
    "id": "local-146",
    "name": "Chain Handle Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "You will need two cable handle attachments and a flat bench, as well as chains, for this exercise. Clip the middle of the chains to the handles, and position yourself on the flat bench. Your elbows should be pointing straight up.",
    "rationale": "Begin by extending through the elbow, keeping your upper arm still, with your wrists pronated.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chain_Handle_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chain_Handle_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chain_Handle_Extension/1.jpg"
    ]
  },
  {
    "id": "local-147",
    "name": "Chain Press",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Begin by connecting the chains to the cable handle attachments. Position yourself on the flat bench in the same position as for a dumbbell press. Your wrists should be pronated and arms perpendicular to the floor. This will be your starting position.",
    "rationale": "Lower the chains by flexing the elbows, unloading some of the chain onto the floor.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chain_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chain_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chain_Press/1.jpg"
    ]
  },
  {
    "id": "local-148",
    "name": "Chair Leg Extended Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Sit upright in a chair and grip the seat on the sides.",
    "rationale": "Raise one leg, extending the knee, flexing the ankle as you do so.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Leg_Extended_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Leg_Extended_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Leg_Extended_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-149",
    "name": "Chair Lower Back Stretch",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Sit upright on a chair.",
    "rationale": "Bend to one side with your arm over your head. You can hold onto the chair with your free hand.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Lower_Back_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Lower_Back_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Lower_Back_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-150",
    "name": "Chair Squat",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "To begin, first set the bar to a position that best matches your height. Once the bar is loaded, step under it and position it across the back of your shoulders.",
    "rationale": "Take the bar with your hands facing forward, unlock it and lift it off the rack by extending your legs.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Squat/1.jpg"
    ]
  },
  {
    "id": "local-151",
    "name": "Chair Upper Body Stretch",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Sit on the edge of a chair, gripping the back of it.",
    "rationale": "Straighten your arms, keeping your back straight, and pull your upper body forward so you feel a stretch. Hold for 20-30 seconds.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Upper_Body_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Upper_Body_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chair_Upper_Body_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-152",
    "name": "Chest And Front Of Shoulder Stretch",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Start off by standing with your legs together, holding a bodybar or a broomstick.",
    "rationale": "Take a slightly wider than shoulder width grip on the pole and hold it in front of you with your palms facing down.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_And_Front_Of_Shoulder_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_And_Front_Of_Shoulder_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_And_Front_Of_Shoulder_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-153",
    "name": "Chest Push from 3 point stance",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Begin in a three point stance, squatted down with your back flat and one hand on the ground. Place the medicine ball directly in front of you.",
    "rationale": "To begin, take your first step as you pull the ball to your chest, positioning both hands to prepare for the throw.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_from_3_point_stance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_from_3_point_stance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_from_3_point_stance/1.jpg"
    ]
  },
  {
    "id": "local-154",
    "name": "Chest Push (multiple response)",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Begin in a kneeling position facing a wall or utilize a partner. Hold the ball with both hands tight into the chest.",
    "rationale": "Execute the pass by exploding forward and outward with the hips while pushing the ball as hard as possible.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_multiple_response/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_multiple_response/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_multiple_response/1.jpg"
    ]
  },
  {
    "id": "local-155",
    "name": "Chest Push (single response)",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "Begin in a kneeling position holding the medicine ball with both hands tightly into the chest.",
    "rationale": "Execute the pass by exploding forward and outward with the hips while pushing the ball as far as possible.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_single_response/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_single_response/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_single_response/1.jpg"
    ]
  },
  {
    "id": "local-156",
    "name": "Chest Push with Run Release",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Begin in an athletic stance with the knees bent, hips back, and back flat. Hold the medicine ball near your legs. This will be your starting position.",
    "rationale": "While taking your first step draw the medicine ball into your chest.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_with_Run_Release/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_with_Run_Release/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Push_with_Run_Release/1.jpg"
    ]
  },
  {
    "id": "local-157",
    "name": "Chest Stretch on Stability Ball",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Get on your hands and knees next to an exercise ball.",
    "rationale": "Place your elbows on top of the ball, keeping your arm out to your side. This will be your starting position.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Stretch_on_Stability_Ball/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Stretch_on_Stability_Ball/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Stretch_on_Stability_Ball/1.jpg"
    ]
  },
  {
    "id": "local-158",
    "name": "Child's Pose",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Get on your hands and knees, walk your hands in front of you.",
    "rationale": "Lower your buttocks down to sit on your heels. Let your arms drag along the floor as you sit back to stretch your entire spine.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Childs_Pose/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Childs_Pose/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Childs_Pose/1.jpg"
    ]
  },
  {
    "id": "local-159",
    "name": "Chin-Up",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Grab the pull-up bar with the palms facing your torso and a grip closer than the shoulder width.",
    "rationale": "As you have both arms extended in front of you holding the bar at the chosen grip width, keep your torso as straight as possible while creating a curvature on your lower back and sticking your chest out. This is your starting position. Tip: Keeping the torso as straight as possible maximizes biceps stimulation while minimizing back involvement.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/1.jpg"
    ]
  },
  {
    "id": "local-160",
    "name": "Chin To Chest Stretch",
    "muscle_group": "Neck",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Get into a seated position on the floor.",
    "rationale": "Place both hands at the rear of your head, fingers interlocked, thumbs pointing down and elbows pointing straight ahead. Slowly pull your head down to your chest. Hold for 20-30 seconds.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin_To_Chest_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin_To_Chest_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin_To_Chest_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-161",
    "name": "Circus Bell",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strongman",
    "cue": "The circus bell is an oversized dumbbell with a thick handle. Begin with the dumbbell between your feet, and grip the handle with both hands.",
    "rationale": "Clean the dumbbell by extending through your hips and knees to deliver the implement to the desired shoulder, letting go with the extra hand.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Circus_Bell/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Circus_Bell/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Circus_Bell/1.jpg"
    ]
  },
  {
    "id": "local-162",
    "name": "Clean",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Olympic weightlifting",
    "cue": "With a barbell on the floor close to the shins, take an overhand (or hook) grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.",
    "rationale": "Targets hamstrings.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean/1.jpg"
    ]
  },
  {
    "id": "local-163",
    "name": "Clean Deadlift",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin standing with a barbell close to your shins. Your feet should be directly under your hips with your feet turned out slightly. Grip the bar with a double overhand grip or hook grip, about shoulder width apart. Squat down to the bar. Your spine should be in full extension, with a back angle that places your shoulders in front of the bar and your back as vertical as possible.",
    "rationale": "Begin by driving through the floor through the front of your heels. As the bar travels upward, maintain a constant back angle. Flare your knees out to the side to help keep them out of the bar's path.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-164",
    "name": "Clean Pull",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "With a barbell on the floor close to the shins, take an overhand or hook grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.",
    "rationale": "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight and elbows out. Move the weight with control as you continue to above the knees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Pull/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Pull/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Pull/1.jpg"
    ]
  },
  {
    "id": "local-165",
    "name": "Clean Shrug",
    "muscle_group": "Other",
    "tier": "S",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a shoulder width, double overhand or hook grip, with the bar hanging at the mid thigh position. Your back should be straight and inclined slightly forward.",
    "rationale": "Shrug your shoulders towards your ears. While this exercise can usually by loaded with heavier weight than a clean, avoid overloading to the point that the execution slows down.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_Shrug/1.jpg"
    ]
  },
  {
    "id": "local-166",
    "name": "Clean and Jerk",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "With a barbell on the floor close to the shins, take an overhand or hook grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.",
    "rationale": "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. Move the weight with control as you continue to above the knees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-167",
    "name": "Clean and Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Assume a shoulder-width stance, with knees inside the arms. Now while keeping the back flat, bend at the knees and hips so that you can grab the bar with the arms fully extended and a pronated grip that is slightly wider than shoulder width. Point the elbows out to sides. The bar should be close to the shins. Position the shoulders over or slightly ahead of the bar. Establish a flat back posture. This will be your starting position.",
    "rationale": "Begin to pull the bar by extending the knees. Move your hips forward and raise the shoulders at the same rate while keeping the angle of the back constant; continue to lift the bar straight up while keeping it close to your body.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Press/1.jpg"
    ]
  },
  {
    "id": "local-168",
    "name": "Clean from Blocks",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Olympic weightlifting",
    "cue": "With a barbell on boxes or stands of the desired height, take an overhand or hook grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.",
    "rationale": "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight with the elbows pointed out.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_from_Blocks/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_from_Blocks/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_from_Blocks/1.jpg"
    ]
  },
  {
    "id": "local-169",
    "name": "Clock Push-Up",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Move into a prone position on the floor, supporting your weight on your hands and toes.",
    "rationale": "Your arms should be fully extended with the hands around shoulder width. Keep your body straight throughout the movement. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/1.jpg"
    ]
  },
  {
    "id": "local-170",
    "name": "Close-Grip Barbell Bench Press",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie back on a flat bench. Using a close grip (around shoulder width), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on your middle chest. Tip: Make sure that - as opposed to a regular bench press - you keep the elbows close to the torso at all times in order to maximize triceps involvement.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-171",
    "name": "Close-Grip Dumbbell Press",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a dumbbell standing up on a flat bench.",
    "rationale": "Ensuring that the dumbbell stays securely placed at the top of the bench, lie perpendicular to the bench with only your shoulders lying on the surface. Hips should be below the bench and your legs bent with your feet firmly on the floor.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Dumbbell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Dumbbell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": "local-172",
    "name": "Close-Grip EZ-Bar Curl with Band",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach a band to each end of the bar. Take the bar, placing a foot on the middle of the band. Stand upright with a narrow, supinated grip on the EZ bar. The elbows should be close to the torso. This will be your starting position.",
    "rationale": "While keeping the upper arms in place, flex the elbows to execute the curl. Exhale as the weight is lifted.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ-Bar_Curl_with_Band/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ-Bar_Curl_with_Band/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ-Bar_Curl_with_Band/1.jpg"
    ]
  },
  {
    "id": "local-173",
    "name": "Close-Grip EZ-Bar Press",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on a flat bench with an EZ bar loaded to an appropriate weight.",
    "rationale": "Using a narrow grip lift the bar and hold it straight over your torso with your elbows in. The arms should be perpendicular to the floor. This will be your starting position.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ-Bar_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ-Bar_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ-Bar_Press/1.jpg"
    ]
  },
  {
    "id": "local-174",
    "name": "Close-Grip EZ Bar Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand up with your torso upright while holding an E-Z Curl Bar at the closer inner handle. The palm of your hands should be facing forward and they should be slightly tilted inwards due to the shape of the bar. The elbows should be close to the torso. This will be your starting position.",
    "rationale": "While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Tip: Only the forearms should move.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ_Bar_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ_Bar_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_EZ_Bar_Curl/1.jpg"
    ]
  },
  {
    "id": "local-175",
    "name": "Close-Grip Front Lat Pulldown",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit down on a pull-down machine with a wide bar attached to the top pulley. Make sure that you adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
    "rationale": "Grab the bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than your shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/1.jpg"
    ]
  },
  {
    "id": "local-176",
    "name": "Close-Grip Push-Up off of a Dumbbell",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on the floor and place your hands on an upright dumbbell. Supporting your weight on your toes and hands, keep your torso rigid and your elbows in with your arms straight. This will be your starting position.",
    "rationale": "Lower your body, allowing the elbows to flex while you inhale. Keep your body straight, not allowing your hips to rise or sag.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Push-Up_off_of_a_Dumbbell/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Push-Up_off_of_a_Dumbbell/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Push-Up_off_of_a_Dumbbell/1.jpg"
    ]
  },
  {
    "id": "local-177",
    "name": "Close-Grip Standing Barbell Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hold a barbell with both hands, palms up and a few inches apart.",
    "rationale": "Stand with your torso straight and your head up. Your feet should be about shoulder width and your elbows close to your torso. This will be your starting position. Tip: You will keep your upper arms and elbows stationary throughout the movement.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Standing_Barbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Standing_Barbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Standing_Barbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-178",
    "name": "Cocoons",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin by lying on your back on the ground. Your legs should be straight and your arms extended behind your head. This will be your starting position.",
    "rationale": "To perform the movement, tuck the knees toward your chest, rotating your pelvis to lift your glutes from the floor. As you do so, flex the spine, bringing your arms back over your head to perform a simultaneous crunch motion.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cocoons/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cocoons/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cocoons/1.jpg"
    ]
  },
  {
    "id": "local-179",
    "name": "Conan's Wheel",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strongman",
    "cue": "With the weight loaded, take a zurcher hold on the end of the implement. Place the bar in the crook of the elbow and hold onto your wrist. Try to keep the weight off of the forearms.",
    "rationale": "Begin by lifting the weight from the ground. Keep a tight, upright posture as you being to walk, taking short, fast steps. Look up and away as you turn in a circle. Do not hold your breath during the event. Continue walking until you complete one or more complete turns.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Conans_Wheel/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Conans_Wheel/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Conans_Wheel/1.jpg"
    ]
  },
  {
    "id": "local-180",
    "name": "Concentration Curls",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit down on a flat bench with one dumbbell in front of you between your legs. Your legs should be spread with your knees bent and feet on the floor.",
    "rationale": "Use your right arm to pick the dumbbell up. Place the back of your right upper arm on the top of your inner right thigh. Rotate the palm of your hand until it is facing forward away from your thigh. Tip: Your arm should be extended and the dumbbell should be above the floor. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/1.jpg"
    ]
  },
  {
    "id": "local-181",
    "name": "Cross-Body Crunch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on your back and bend your knees about 60 degrees.",
    "rationale": "Keep your feet flat on the floor and place your hands loosely behind your head. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross-Body_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross-Body_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross-Body_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-182",
    "name": "Cross Body Hammer Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up straight with a dumbbell in each hand. Your hands should be down at your side with your palms facing in.",
    "rationale": "While keeping your palms facing in and without twisting your arm, curl the dumbbell of the right arm up towards your left shoulder as you exhale. Touch the top of the dumbbell to your shoulder and hold the contraction for a second.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Hammer_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Hammer_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Hammer_Curl/1.jpg"
    ]
  },
  {
    "id": "local-183",
    "name": "Cross Over - With Bands",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Secure an exercise band around a stationary post.",
    "rationale": "While facing away from the post, grab the handles on both ends of the band and step forward enough to create tension on the band.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Over_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Over_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Over_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-184",
    "name": "Crossover Reverse Lunge",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand with your feet shoulder width apart. This will be your starting position.",
    "rationale": "Perform a rear lunge by stepping back with one foot and flexing the hips and front knee. As you do so, rotate your torso across the front leg.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crossover_Reverse_Lunge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crossover_Reverse_Lunge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crossover_Reverse_Lunge/1.jpg"
    ]
  },
  {
    "id": "local-185",
    "name": "Crucifix",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strongman",
    "cue": "In the crucifix, you statically hold weights out to the side for time. While the event can be practiced using dumbbells, it is best to practice with one of the various implements used, such as axes and hammers, as it feels different.",
    "rationale": "Begin standing, and raise your arms out to the side holding the implements. Your arms should be parallel to the ground. In competition, judges or sensors are used to let you know when you break parallel. Hold for as long as you can. Typically, the weights should be heavy enough that you fail in 30-60 seconds.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crucifix/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crucifix/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crucifix/1.jpg"
    ]
  },
  {
    "id": "local-186",
    "name": "Crunch - Hands Overhead",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie on the floor with your back flat and knees bent with around a 60-degree angle between the hamstrings and the calves.",
    "rationale": "Keep your feet flat on the floor and stretch your arms overhead with your palms crossed. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Hands_Overhead/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Hands_Overhead/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Hands_Overhead/1.jpg"
    ]
  },
  {
    "id": "local-187",
    "name": "Crunch - Legs On Exercise Ball",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on your back with your feet resting on an exercise ball and your knees bent at a 90 degree angle.",
    "rationale": "Place your feet three to four inches apart and point your toes inward so they touch.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Legs_On_Exercise_Ball/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Legs_On_Exercise_Ball/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch_-_Legs_On_Exercise_Ball/1.jpg"
    ]
  },
  {
    "id": "local-188",
    "name": "Crunches",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on your back with your feet flat on the ground, or resting on a bench with your knees bent at a 90 degree angle. If you are resting your feet on a bench, place them three to four inches apart and point your toes inward so they touch.",
    "rationale": "Now place your hands lightly on either side of your head keeping your elbows in. Tip: Don't lock your fingers behind your head.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/1.jpg"
    ]
  },
  {
    "id": "local-189",
    "name": "Cuban Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Take a dumbbell in each hand with a pronated grip in a standing position. Raise your upper arms so that they are parallel to the floor, allowing your lower arms to hang in the \"scarecrow\" position. This will be your starting position.",
    "rationale": "To initiate the movement, externally rotate the shoulders to move the upper arm 180 degrees. Keep the upper arms in place, rotating the upper arms until the wrists are directly above the elbows, the forearms perpendicular to the floor.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cuban_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cuban_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cuban_Press/1.jpg"
    ]
  },
  {
    "id": "local-190",
    "name": "Dancer's Stretch",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Sit up on the floor.",
    "rationale": "Cross your right leg over your left, keeping the knee bent. Your left leg is straight and down on the floor.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dancers_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dancers_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dancers_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-191",
    "name": "Dead Bug",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin lying on your back with your hands extended above you toward the ceiling.",
    "rationale": "Bring your feet, knees, and hips up to 90 degrees.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dead_Bug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dead_Bug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dead_Bug/1.jpg"
    ]
  },
  {
    "id": "local-192",
    "name": "Deadlift with Bands",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "To deadlift with short bands, simply loop them over the bar before you start, and step into them to set up. For long bands, they will need to be anchored to a secure base, such as heavy dumbbells or a rack.",
    "rationale": "With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar. Look forward with your head, keep your chest up and your back arched, and begin driving through the heels to move the weight upward. After the bar passes the knees, aggressively pull the bar back, pulling your shoulder blades together as you drive your hips forward into the bar.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift_with_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift_with_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift_with_Bands/1.jpg"
    ]
  },
  {
    "id": "local-193",
    "name": "Deadlift with Chains",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "You can attach the chains to the sleeves of the bar, or just drape the middle over the bar so there is a greater weight increase as you lift.",
    "rationale": "Approach the bar so that it is centered over your feet. You feet should be about hip width apart. Bend at the hip to grip the bar at shoulder width, allowing your shoulder blades to protract. Typically, you would use an overhand grip or an over/under grip on heavier sets. With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift_with_Chains/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift_with_Chains/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift_with_Chains/1.jpg"
    ]
  },
  {
    "id": "local-194",
    "name": "Decline Barbell Bench Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Secure your legs at the end of the decline bench and slowly lay down on the bench.",
    "rationale": "Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. The arms should be perpendicular to the floor. This will be your starting position. Tip: In order to protect your rotator cuff, it is best if you have a spotter help you lift the barbell off the rack.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-195",
    "name": "Decline Close-Grip Bench To Skull Crusher",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Secure your legs at the end of the decline bench and slowly lay down on the bench.",
    "rationale": "Using a close grip (a grip that is slightly less than shoulder width), lift the bar from the rack and hold it straight over you with your arms locked and elbows in. The arms should be perpendicular to the floor. This will be your starting position. Tip: In order to protect your rotator cuff, it is best if you have a spotter help you lift the barbell off the rack.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Close-Grip_Bench_To_Skull_Crusher/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Close-Grip_Bench_To_Skull_Crusher/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Close-Grip_Bench_To_Skull_Crusher/1.jpg"
    ]
  },
  {
    "id": "local-196",
    "name": "Decline Crunch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Secure your legs at the end of the decline bench and lie down.",
    "rationale": "Now place your hands lightly on either side of your head keeping your elbows in. Tip: Don't lock your fingers behind your head.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-197",
    "name": "Decline Dumbbell Bench Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Secure your legs at the end of the decline bench and lie down with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.",
    "rationale": "Once you are laying down, move the dumbbells in front of you at shoulder width.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-198",
    "name": "Decline Dumbbell Flyes",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Secure your legs at the end of the decline bench and lie down with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.",
    "rationale": "Once you are laying down, move the dumbbells in front of you at shoulder width. The palms of the hands should be facing each other and the arms should be perpendicular to the floor and fully extended. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Flyes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Flyes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Flyes/1.jpg"
    ]
  },
  {
    "id": "local-199",
    "name": "Decline Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Secure your legs at the end of the decline bench and lie down with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.",
    "rationale": "Once you are laying down, move the dumbbells in front of you at shoulder width. The palms of the hands should be facing each other and the arms should be perpendicular to the floor and fully extended. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-200",
    "name": "Decline EZ Bar Triceps Extension",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Secure your legs at the end of the decline bench and slowly lay down on the bench.",
    "rationale": "Using a close grip (a grip that is slightly less than shoulder width), lift the EZ bar from the rack and hold it straight over you with your arms locked and elbows in. The arms should be perpendicular to the floor. This will be your starting position. Tip: In order to protect your rotator cuff, it is best if you have a spotter help you lift the barbell off the rack.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_EZ_Bar_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_EZ_Bar_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_EZ_Bar_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-201",
    "name": "Decline Oblique Crunch",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Secure your legs at the end of the decline bench and slowly lay down on the bench.",
    "rationale": "Raise your upper body off the bench until your torso is about 35-45 degrees if measured from the floor.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Oblique_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Oblique_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Oblique_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-202",
    "name": "Decline Push-Up",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Move your feet up to a box or bench. This will be your starting position.",
    "rationale": "Next, lower yourself downward until your chest almost touches the floor as you inhale.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"
    ]
  },
  {
    "id": "local-203",
    "name": "Decline Reverse Crunch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on your back on a decline bench and hold on to the top of the bench with both hands. Don't let your body slip down from this position.",
    "rationale": "Hold your legs parallel to the floor using your abs to hold them there while keeping your knees and feet together. Tip: Your legs should be fully extended with a slight bend on the knee. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Reverse_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Reverse_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Reverse_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-204",
    "name": "Decline Smith Press",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a decline bench underneath the Smith machine. Now place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Using a pronated grip that is wider than shoulder width, unlock the bar from the rack and hold it straight over you with your arms extended. This will be your starting position.",
    "rationale": "As you inhale, lower the bar under control by allowing the elbows to flex, lightly contacting the torso.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Smith_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Smith_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Smith_Press/1.jpg"
    ]
  },
  {
    "id": "local-205",
    "name": "Deficit Deadlift",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Powerlifting",
    "cue": "Begin by having a platform or weight plates that you can stand on, usually 1-3 inches in height. Approach the bar so that it is centered over your feet. You feet should be about hip width apart. Bend at the hip to grip the bar at shoulder width, allowing your shoulder blades to protract. Typically, you would use an overhand grip or an over/under grip on heavier sets.",
    "rationale": "With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar. Look forward with your head, keep your chest up and your back arched, and begin driving through the heels to move the weight upward. After the bar passes the knees, aggressively pull the bar back, pulling your shoulder blades together as you drive your hips forward into the bar.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deficit_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deficit_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deficit_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-206",
    "name": "Depth Jump Leap",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "For this drill you will need two boxes or benches, one 12 to 16 inches high and the other 22 to 26 inches high.",
    "rationale": "Stand on one of the two boxes with arms at the sides; feet should be together and slightly off the edge as in the depth jump. Place the other box approximately two or three feet in front of and facing the performer.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Depth_Jump_Leap/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Depth_Jump_Leap/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Depth_Jump_Leap/1.jpg"
    ]
  },
  {
    "id": "local-207",
    "name": "Dip Machine",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit securely in a dip machine, select the weight and firmly grasp the handles.",
    "rationale": "Now keep your elbows in at your sides in order to place emphasis on the triceps. The elbows should be bent at a 90 degree angle.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/1.jpg"
    ]
  },
  {
    "id": "local-208",
    "name": "Dips - Chest Version",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "For this exercise you will need access to parallel bars. To get yourself into the starting position, hold your body at arms length (arms locked) above the bars.",
    "rationale": "While breathing in, lower yourself slowly with your torso leaning forward around 30 degrees or so and your elbows flared out slightly until you feel a slight stretch in the chest.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/1.jpg"
    ]
  },
  {
    "id": "local-209",
    "name": "Dips - Triceps Version",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "To get into the starting position, hold your body at arm's length with your arms nearly locked above the bars.",
    "rationale": "Now, inhale and slowly lower yourself downward. Your torso should remain upright and your elbows should stay close to your body. This helps to better focus on tricep involvement. Lower yourself until there is a 90 degree angle formed between the upper arm and forearm.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/1.jpg"
    ]
  },
  {
    "id": "local-210",
    "name": "Donkey Calf Raises",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "For this exercise you will need access to a donkey calf raise machine. Start by positioning your lower back and hips under the padded lever provided. The tailbone area should be the one making contact with the pad.",
    "rationale": "Place both of your arms on the side handles and place the balls of your feet on the calf block with the heels extending off. Align the toes forward, inward or outward, depending on the area you wish to target, and straighten the knees without locking them. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/1.jpg"
    ]
  },
  {
    "id": "local-211",
    "name": "Double Kettlebell Alternating Hang Clean",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place two kettlebells between your feet. To get in the starting position, push your butt back and look straight ahead.",
    "rationale": "Clean one kettlebell to your shoulder and hold on to the other kettlebell.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Alternating_Hang_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Alternating_Hang_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Alternating_Hang_Clean/1.jpg"
    ]
  },
  {
    "id": "local-212",
    "name": "Double Kettlebell Jerk",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a kettlebell by the handle in each hand.",
    "rationale": "Clean the kettlebells to your shoulders by extending through the legs and hips as you pull the kettlebells towards your shoulders. Rotate your wrists as you do so, so that the palms face forward. This will be your starting position.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-213",
    "name": "Double Kettlebell Push Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Clean two kettlebells to your shoulders.",
    "rationale": "Squat down a few inches and reverse the motion rapidly. Use the momentum from the legs to drive the kettlebells overhead.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Push_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Push_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Push_Press/1.jpg"
    ]
  },
  {
    "id": "local-214",
    "name": "Double Kettlebell Snatch",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place two kettlebells behind your feet. Bend your knees and sit back to pick up the kettlebells.",
    "rationale": "Swing the kettlebells between your legs forcefully and reverse the direction.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Snatch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Snatch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Snatch/1.jpg"
    ]
  },
  {
    "id": "local-215",
    "name": "Double Kettlebell Windmill",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Place a kettlebell in front of your front foot and clean and press a kettlebell overhead with your opposite arm. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulders. Rotate your wrist as you do so, so that the palm faces forward.",
    "rationale": "Keeping the kettlebell locked out at all times, push your butt out in the direction of the locked out kettlebell. Turn your feet out at a forty-five degree angle from the arm with the locked out kettlebell.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Windmill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Windmill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Windmill/1.jpg"
    ]
  },
  {
    "id": "local-216",
    "name": "Double Leg Butt Kick",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Begin standing with your knees slightly bent.",
    "rationale": "Quickly squat a short distance, flexing the hips and knees, and immediately extend to jump for maximum vertical height.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Leg_Butt_Kick/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Leg_Butt_Kick/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Leg_Butt_Kick/1.jpg"
    ]
  },
  {
    "id": "local-217",
    "name": "Downward Facing Balance",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie facedown on top of an exercise ball.",
    "rationale": "While resting on your stomach on the ball, walk your hands forward along the floor and lift your legs, extending your elbows and knees.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Downward_Facing_Balance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Downward_Facing_Balance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Downward_Facing_Balance/1.jpg"
    ]
  },
  {
    "id": "local-218",
    "name": "Drag Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab a barbell with a supinated grip (palms facing forward) and get your elbows close to your torso and back. This will be your starting position.",
    "rationale": "As you exhale, curl the bar up while keeping the elbows to the back as you \"Drag\" the bar up by keeping it in contact with your torso. Tip: As you can see, you will not be keeping the elbows pinned to your sides, but instead you will be bringing them back. Also, do not lift your shoulders.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/1.jpg"
    ]
  },
  {
    "id": "local-219",
    "name": "Drop Push",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Position low boxes or other platforms 2-3 feet apart.",
    "rationale": "Move to a pushup position between them, supporting yourself by placing your hands on the boxes.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drop_Push/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drop_Push/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drop_Push/1.jpg"
    ]
  },
  {
    "id": "local-220",
    "name": "Dumbbell Alternate Bicep Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand (torso upright) with a dumbbell in each hand held at arms length. The elbows should be close to the torso and the palms of your hand should be facing your thighs.",
    "rationale": "While holding the upper arm stationary, curl the right weight as you rotate the palm of the hands until they are facing forward. At this point continue contracting the biceps as you breathe out until your biceps is fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a second as you squeeze the biceps. Tip: Only the forearms should move.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Alternate_Bicep_Curl/1.jpg"
    ]
  },
  {
    "id": "local-221",
    "name": "Dumbbell Bench Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.",
    "rationale": "Then, using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-222",
    "name": "Dumbbell Bench Press with Neutral Grip",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Take a dumbbell in each hand and lay back onto a flat bench. Your feet should be flat on the floor and your shoulder blades retracted.",
    "rationale": "Maintaining a neutral grip, palms facing each other, begin with your arms extended directly above you, perpendicular to the floor. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press_with_Neutral_Grip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press_with_Neutral_Grip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press_with_Neutral_Grip/1.jpg"
    ]
  },
  {
    "id": "local-223",
    "name": "Dumbbell Bicep Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up straight with a dumbbell in each hand at arm's length. Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward. This will be your starting position.",
    "rationale": "Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps. Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a brief pause as you squeeze your biceps.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/1.jpg"
    ]
  },
  {
    "id": "local-224",
    "name": "Dumbbell Clean",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin standing with a dumbbell in each hand with your feet shoulder width apart.",
    "rationale": "Lower the weights to the floor by flexing at the hips and knees, pushing your hips back until the dumbbells reach the floor. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Clean/1.jpg"
    ]
  },
  {
    "id": "local-225",
    "name": "Dumbbell Floor Press",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Powerlifting",
    "cue": "Lay on the floor holding dumbbells in your hands. Your knees can be bent. Begin with the weights fully extended above you.",
    "rationale": "Lower the weights until your upper arm comes in contact with the floor. You can tuck your elbows to emphasize triceps size and strength, or to focus on your chest angle your arms to the side.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Floor_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Floor_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Floor_Press/1.jpg"
    ]
  },
  {
    "id": "local-226",
    "name": "Dumbbell Flyes",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on a flat bench with a dumbbell on each hand resting on top of your thighs. The palms of your hand will be facing each other.",
    "rationale": "Then using your thighs to help raise the dumbbells, lift the dumbbells one at a time so you can hold them in front of you at shoulder width with the palms of your hands facing each other. Raise the dumbbells up like you're pressing them, but stop and hold just before you lock out. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/1.jpg"
    ]
  },
  {
    "id": "local-227",
    "name": "Dumbbell Incline Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Using a neutral grip, lean into an incline bench.",
    "rationale": "Take a dumbbell in each hand with a neutral grip, beginning with the arms straight. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Row/1.jpg"
    ]
  },
  {
    "id": "local-228",
    "name": "Dumbbell Incline Shoulder Raise",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit on an Incline Bench while holding a dumbbell on each hand on top of your thighs.",
    "rationale": "Lift your legs up to kick the weights to your shoulders and lean back. Position the dumbbells above your shoulders with your arms extended. The arms should be perpendicular to the floor with your palms facing forward and knuckles pointing towards the ceiling. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Shoulder_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Shoulder_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Shoulder_Raise/1.jpg"
    ]
  },
  {
    "id": "local-229",
    "name": "Dumbbell Lunges",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand with your torso upright holding two dumbbells in your hands by your sides. This will be your starting position.",
    "rationale": "Step forward with your right leg around 2 feet or so from the foot being left stationary behind and lower your upper body down, while keeping the torso upright and maintaining balance. Inhale as you go down. Note: As in the other exercises, do not allow your knee to go forward beyond your toes as you come down, as this will put undue stress on the knee joint. Make sure that you keep your front shin perpendicular to the ground.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/1.jpg"
    ]
  },
  {
    "id": "local-230",
    "name": "Dumbbell Lying One-Arm Rear Lateral Raise",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "While holding a dumbbell in one hand, lay with your chest down on a slightly inclined (around 15 degrees when measured from the floor) adjustable bench. The other hand can be used to hold to the leg of the bench for stability.",
    "rationale": "Position the palm of the hand that is holding the dumbbell in a neutral manner (palms facing your torso) as you keep the arm extended with the elbow slightly bent. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_One-Arm_Rear_Lateral_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_One-Arm_Rear_Lateral_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_One-Arm_Rear_Lateral_Raise/1.jpg"
    ]
  },
  {
    "id": "local-231",
    "name": "Dumbbell Lying Pronation",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie on a flat bench face down with one arm holding a dumbbell and the other hand on top of the bench folded so that you can rest your head on it.",
    "rationale": "Bend the elbows of the arm holding the dumbbell so that it creates a 90-degree angle between the upper arm and the forearm.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Pronation/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Pronation/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Pronation/1.jpg"
    ]
  },
  {
    "id": "local-232",
    "name": "Dumbbell Lying Rear Lateral Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "While holding a dumbbell in each hand, lay with your chest down on a slightly inclined (around 15 degrees when measured from the floor) adjustable bench.",
    "rationale": "Position the palms of the hands in a neutral manner (palms facing your torso) as you keep the arms extended with the elbows slightly bent. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/1.jpg"
    ]
  },
  {
    "id": "local-233",
    "name": "Dumbbell Lying Supination",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie sideways on a flat bench with one arm holding a dumbbell and the other hand on top of the bench folded so that you can rest your head on it.",
    "rationale": "Bend the elbows of the arm holding the dumbbell so that it creates a 90-degree angle between the upper arm and the forearm.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Supination/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Supination/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lying_Supination/1.jpg"
    ]
  },
  {
    "id": "local-234",
    "name": "Dumbbell One-Arm Shoulder Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Grab a dumbbell and either sit on a military press bench or a utility bench that has a back support on it as you place the dumbbells upright on top of your thighs or stand up straight.",
    "rationale": "Clean the dumbbell up to bring it to shoulder height. The other hand can be kept fully extended to the side, by the waist or grabbing a fixed surface.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Shoulder_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Shoulder_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Shoulder_Press/1.jpg"
    ]
  },
  {
    "id": "local-235",
    "name": "Dumbbell One-Arm Triceps Extension",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Grab a dumbbell and either sit on a military press bench or a utility bench that has a back support on it as you place the dumbbells upright on top of your thighs or stand up straight.",
    "rationale": "Clean the dumbbell up to bring it to shoulder height and then extend the arm over your head so that the whole arm is perpendicular to the floor and next to your head. The dumbbell should be on top of you. The other hand can be kept fully extended to the side, by the waist, supporting the upper arm that has the dumbbell or grabbing a fixed surface.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-236",
    "name": "Dumbbell One-Arm Upright Row",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab a dumbbell and stand up straight with your arm extended in front of you with a slight bend at the elbows and your back straight. This will be your starting position. Tip: The dumbbell should be resting on top of your thigh with the palm of your hands facing your thighs.",
    "rationale": "Keep the other hand can be kept fully extended to the side, by the waist or grabbing a fixed surface. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_One-Arm_Upright_Row/1.jpg"
    ]
  },
  {
    "id": "local-237",
    "name": "Dumbbell Prone Incline Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Grab a dumbbell on each hand and lie face down on an incline bench with your shoulders near top of the incline. Your knees can rest on the seat or your legs can be straddled to the sides (my preferred way).",
    "rationale": "Let your arms extend and hang naturally in front of you so that they are perpendicular to the floor.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Prone_Incline_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Prone_Incline_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Prone_Incline_Curl/1.jpg"
    ]
  },
  {
    "id": "local-238",
    "name": "Dumbbell Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab a dumbbell in each arm and stand up straight with your arms extended by your sides with a slight bend at the elbows and your back straight. This will be your starting position. Tip: The dumbbell should be next to your thighs with the palm of your hands facing back.",
    "rationale": "Use your side shoulders to lift the dumbbells as you exhale. The dumbbells should be to the side of the body as you move them up. Continue to lift it until the dumbbells are nearly in line with your chin. Tip: Your elbows should drive the motion. As you lift the dumbbell, your elbow should always be higher than your forearm. Also, keep your torso stationary and pause for a second at the top of the movement.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Raise/1.jpg"
    ]
  },
  {
    "id": "local-239",
    "name": "Dumbbell Rear Lunge",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand with your torso upright holding two dumbbells in your hands by your sides. This will be your starting position.",
    "rationale": "Step backward with your right leg around two feet or so from the left foot and lower your upper body down, while keeping the torso upright and maintaining balance. Inhale as you go down. Tip: As in the other exercises, do not allow your knee to go forward beyond your toes as you come down, as this will put undue stress on the knee joint. Make sure that you keep your front shin perpendicular to the ground. Keep the torso upright during the lunge; flexible hip flexors are important. A long lunge emphasizes the Gluteus Maximus; a short lunge emphasizes Quadriceps.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Rear_Lunge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Rear_Lunge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Rear_Lunge/1.jpg"
    ]
  },
  {
    "id": "local-240",
    "name": "Dumbbell Scaption",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "This corrective exercise strengthens the muscles that stabilize your shoulder blade. Hold a light weight in each hand, hanging at your sides. Your thumbs should pointing up.",
    "rationale": "Begin the movement raising your arms out in front of you, about 30 degrees off center. Your arms should be fully extended as you perform the movement.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Scaption/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Scaption/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Scaption/1.jpg"
    ]
  },
  {
    "id": "local-241",
    "name": "Dumbbell Seated Box Jump",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Position a box a couple feet to the side of a bench. Hold a dumbbell to your chest with both hands and seat yourself on the bench facing the box. This will be your starting position.",
    "rationale": "Plant your feet firmly on the ground as you lean forward, extending through the hips and knees to jump up and forward.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_Box_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_Box_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_Box_Jump/1.jpg"
    ]
  },
  {
    "id": "local-242",
    "name": "Dumbbell Seated One-Leg Calf Raise",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a block on the floor about 12 inches from a flat bench.",
    "rationale": "Sit on a flat bench and place a dumbbell on your upper left thigh about 3 inches above your knee.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/1.jpg"
    ]
  },
  {
    "id": "local-243",
    "name": "Dumbbell Shoulder Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "While holding a dumbbell in each hand, sit on a military press bench or utility bench that has back support. Place the dumbbells upright on top of your thighs.",
    "rationale": "Now raise the dumbbells to shoulder height one at a time using your thighs to help propel them up into position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/1.jpg"
    ]
  },
  {
    "id": "local-244",
    "name": "Dumbbell Shrug",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand erect with a dumbbell on each hand (palms facing your torso), arms extended on the sides.",
    "rationale": "Lift the dumbbells by elevating the shoulders as high as possible while you exhale. Hold the contraction at the top for a second. Tip: The arms should remain extended at all times. Refrain from using the biceps to help lift the dumbbells. Only the shoulders should be moving up and down.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/1.jpg"
    ]
  },
  {
    "id": "local-245",
    "name": "Dumbbell Side Bend",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up straight while holding a dumbbell on the left hand (palms facing the torso) as you have the right hand holding your waist. Your feet should be placed at shoulder width. This will be your starting position.",
    "rationale": "While keeping your back straight and your head up, bend only at the waist to the right as far as possible. Breathe in as you bend to the side. Then hold for a second and come back up to the starting position as you exhale. Tip: Keep the rest of the body stationary.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Side_Bend/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Side_Bend/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Side_Bend/1.jpg"
    ]
  },
  {
    "id": "local-246",
    "name": "Dumbbell Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand up straight while holding a dumbbell on each hand (palms facing the side of your legs).",
    "rationale": "Position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times as looking down will get you off balance and also maintain a straight back. This will be your starting position. Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances discussed in the foot stances section.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/1.jpg"
    ]
  },
  {
    "id": "local-247",
    "name": "Dumbbell Squat To A Bench",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up straight with a flat bench behind you while holding a dumbbell on each hand (palms facing the side of your legs).",
    "rationale": "Position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times as looking down will get you off balance and also maintain a straight back. This will be your starting position. Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances discussed in the foot stances section.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat_To_A_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat_To_A_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat_To_A_Bench/1.jpg"
    ]
  },
  {
    "id": "local-248",
    "name": "Dumbbell Step Ups",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up straight while holding a dumbbell on each hand (palms facing the side of your legs).",
    "rationale": "Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift the rest of your body up and place the foot of the left leg on the platform as well. Breathe out as you execute the force required to come up.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/1.jpg"
    ]
  },
  {
    "id": "local-249",
    "name": "Dumbbell Tricep Extension -Pronated Grip",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie down on a flat bench holding two dumbbells directly above your shoulders. Your arms should be fully extended and form a 90 degree angle from your torso and the floor.",
    "rationale": "The palms of your hands should be facing forward, and your elbows should be tucked in. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Tricep_Extension_-Pronated_Grip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Tricep_Extension_-Pronated_Grip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Tricep_Extension_-Pronated_Grip/1.jpg"
    ]
  },
  {
    "id": "local-250",
    "name": "Dynamic Back Stretch",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Stand with your feet shoulder width apart. This will be your starting position.",
    "rationale": "Keeping your arms straight, swing them straight up in front of you 5-10 times, increasing the range of motion each time until your arms are above your head.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dynamic_Back_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dynamic_Back_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dynamic_Back_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-251",
    "name": "Dynamic Chest Stretch",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand with your hands together, arms extended directly in front of you. This will be your starting position.",
    "rationale": "Keeping your arms straight, quickly move your arms back as far as possible and back in again, similar to an exaggerated clapping motion. Repeat 5-10 times, increasing speed as you do so.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dynamic_Chest_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dynamic_Chest_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dynamic_Chest_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-252",
    "name": "EZ-Bar Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand up straight while holding an EZ curl bar at the wide outer handle. The palms of your hands should be facing forward and slightly tilted inward due to the shape of the bar. Keep your elbows close to your torso. This will be your starting position.",
    "rationale": "Now, while keeping your upper arms stationary, exhale and curl the weights forward while contracting the biceps. Focus on only moving your forearms.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/1.jpg"
    ]
  },
  {
    "id": "local-253",
    "name": "EZ-Bar Skullcrusher",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Using a close grip, lift the EZ bar and hold it with your elbows in as you lie on the bench. Your arms should be perpendicular to the floor. This will be your starting position.",
    "rationale": "Keeping the upper arms stationary, lower the bar by allowing the elbows to flex. Inhale as you perform this portion of the movement. Pause once the bar is directly above the forehead.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/1.jpg"
    ]
  },
  {
    "id": "local-254",
    "name": "Elbow Circles",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Sit or stand with your feet slightly apart.",
    "rationale": "Place your hands on your shoulders with your elbows at shoulder level and pointing out.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbow_Circles/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbow_Circles/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbow_Circles/1.jpg"
    ]
  },
  {
    "id": "local-255",
    "name": "Elbow to Knee",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie on the floor, crossing your right leg across your bent left knee. Clasp your hands behind your head, beginning with your shoulder blades on the ground. This will be your starting position.",
    "rationale": "Perform the motion by flexing the spine and rotating your torso to bring the left elbow to the right knee.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbow_to_Knee/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbow_to_Knee/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbow_to_Knee/1.jpg"
    ]
  },
  {
    "id": "local-256",
    "name": "Elbows Back",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand up straight.",
    "rationale": "Place both hands on your lower back, fingers pointing downward and elbows out.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbows_Back/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbows_Back/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elbows_Back/1.jpg"
    ]
  },
  {
    "id": "local-257",
    "name": "Elevated Back Lunge",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position a bar onto a rack at shoulder height loaded to an appropriate weight. Place a short, raised platform behind you.",
    "rationale": "Rack the bar onto your upper back, keeping your back arched and tight. Step onto your raised platform with both feet. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Back_Lunge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Back_Lunge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Back_Lunge/1.jpg"
    ]
  },
  {
    "id": "local-258",
    "name": "Elevated Cable Rows",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Get a platform of some sort (it can be an aerobics or calf raise platform) that is around 4-6 inches in height.",
    "rationale": "Place it on the seat of the cable row machine.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Cable_Rows/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Cable_Rows/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Cable_Rows/1.jpg"
    ]
  },
  {
    "id": "local-259",
    "name": "Elliptical Trainer",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "To begin, step onto the elliptical and select the desired option from the menu. Most ellipticals have a manual setting, or you can select a program to run. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. Elevation can be adjusted to change the intensity of the workout.",
    "rationale": "The handles can be used to monitor your heart rate to help you stay at an appropriate intensity.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elliptical_Trainer/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elliptical_Trainer/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elliptical_Trainer/1.jpg"
    ]
  },
  {
    "id": "local-260",
    "name": "Exercise Ball Crunch",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie on an exercise ball with your lower back curvature pressed against the spherical surface of the ball. Your feet should be bent at the knee and pressed firmly against the floor. The upper torso should be hanging off the top of the ball. The arms should either be kept alongside the body or crossed on top of your chest as these positions avoid neck strains (as opposed to the hands behind the back of the head position).",
    "rationale": "Lower your torso into a stretch position keeping the neck stationary at all times. This will be your starting position.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Exercise_Ball_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Exercise_Ball_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Exercise_Ball_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-261",
    "name": "Exercise Ball Pull-In",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place an exercise ball nearby and lay on the floor in front of it with your hands on the floor shoulder width apart in a push-up position.",
    "rationale": "Now place your lower shins on top of an exercise ball. Tip: At this point your legs should be fully extended with the shins on top of the ball and the upper body should be in a push-up type of position being supported by your two extended arms in front of you. This will be your starting position.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Exercise_Ball_Pull-In/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Exercise_Ball_Pull-In/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Exercise_Ball_Pull-In/1.jpg"
    ]
  },
  {
    "id": "local-262",
    "name": "Extended Range One-Arm Kettlebell Floor Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on the floor and position a kettlebell for one arm to press. The kettlebell should be held by the handle. The leg on the same side that you are pressing should be bent, with the knee crossing over the midline of the body.",
    "rationale": "Press the kettlebell by extending the elbow and adducting the arm, pressing it above your body. Return to the starting position.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Extended_Range_One-Arm_Kettlebell_Floor_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Extended_Range_One-Arm_Kettlebell_Floor_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Extended_Range_One-Arm_Kettlebell_Floor_Press/1.jpg"
    ]
  },
  {
    "id": "local-263",
    "name": "External Rotation",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie sideways on a flat bench with one arm holding a dumbbell and the other hand on top of the bench folded so that you can rest your head on it.",
    "rationale": "Bend the elbows of the arm holding the dumbbell so that it creates a 90-degree angle between the upper arm and the forearm. Tip: Keep the arm parallel to your torso.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation/1.jpg"
    ]
  },
  {
    "id": "local-264",
    "name": "External Rotation with Band",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Choke the band around a post. The band should be at the same height as your elbow. Stand with your left side to the band a couple of feet away.",
    "rationale": "Grasp the end of the band with your right hand, and keep your elbow pressed firmly to your side. We recommend you hold a pad or foam roll in place with your elbow to keep it firmly in position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Band/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Band/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Band/1.jpg"
    ]
  },
  {
    "id": "local-265",
    "name": "External Rotation with Cable",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Adjust the cable to the same height as your elbow. Stand with your left side to the band a couple of feet away.",
    "rationale": "Grasp the handle with your right hand, and keep your elbow pressed firmly to your side. We recommend you hold a pad or foam roll in place with your elbow to keep it firmly in position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Cable/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Cable/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/External_Rotation_with_Cable/1.jpg"
    ]
  },
  {
    "id": "local-266",
    "name": "Face Pull",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Facing a high pulley with a rope or dual handles attached, pull the weight directly towards your face, separating your hands as you do so. Keep your upper arms parallel to the ground.",
    "rationale": "Targets shoulders.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/1.jpg"
    ]
  },
  {
    "id": "local-267",
    "name": "Farmer's Walk",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strongman",
    "cue": "There are various implements that can be used for the farmers walk. These can also be performed with heavy dumbbells or short bars if these implements aren't available. Begin by standing between the implements.",
    "rationale": "After gripping the handles, lift them up by driving through your heels, keeping your back straight and your head up.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/1.jpg"
    ]
  },
  {
    "id": "local-268",
    "name": "Fast Skipping",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Start in a relaxed position with one leg slightly forward. This will be your starting position.",
    "rationale": "Skip by executing a step-hop pattern of right-right-step to left-left-step, and so on, alternating back and forth.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Fast_Skipping/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Fast_Skipping/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Fast_Skipping/1.jpg"
    ]
  },
  {
    "id": "local-269",
    "name": "Finger Curls",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a barbell with both hands and your palms facing up; hands spaced about shoulder width.",
    "rationale": "Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Finger_Curls/1.jpg"
    ]
  },
  {
    "id": "local-270",
    "name": "Flat Bench Cable Flyes",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Position a flat bench between two low pulleys so that when you are laying on it, your chest will be lined up with the cable pulleys.",
    "rationale": "Lay flat on the bench and keep your feet on the ground.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Cable_Flyes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Cable_Flyes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Cable_Flyes/1.jpg"
    ]
  },
  {
    "id": "local-271",
    "name": "Flat Bench Leg Pull-In",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on an exercise mat or a flat bench with your legs off the end.",
    "rationale": "Place your hands either under your glutes with your palms down or by the sides holding on to the bench (or with palms down by the side on an exercise mat). Also extend your legs straight out. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Leg_Pull-In/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Leg_Pull-In/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Leg_Pull-In/1.jpg"
    ]
  },
  {
    "id": "local-272",
    "name": "Flat Bench Lying Leg Raise",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie with your back flat on a bench and your legs extended in front of you off the end.",
    "rationale": "Place your hands either under your glutes with your palms down or by the sides holding on to the bench. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/1.jpg"
    ]
  },
  {
    "id": "local-273",
    "name": "Flexor Incline Dumbbell Curls",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hold the dumbbell towards the side farther from you so that you have more weight on the side closest to you. (This can be done for a good effect on all bicep dumbbell exercises). Now do a normal incline dumbbell curl, but keep your wrists as far back as possible so as to neutralize any stress that is placed on them.",
    "rationale": "Sit on an incline bench that is angled at 45-degrees while holding a dumbbell on each hand.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flexor_Incline_Dumbbell_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flexor_Incline_Dumbbell_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flexor_Incline_Dumbbell_Curls/1.jpg"
    ]
  },
  {
    "id": "local-274",
    "name": "Floor Glute-Ham Raise",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "You can use a partner for this exercise or brace your feet under something stable.",
    "rationale": "Begin on your knees with your upper legs and torso upright. If using a partner, they will firmly hold your feet to keep you in position. This will be your starting position.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Glute-Ham_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Glute-Ham_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Glute-Ham_Raise/1.jpg"
    ]
  },
  {
    "id": "local-275",
    "name": "Floor Press",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Powerlifting",
    "cue": "Adjust the j-hooks so they are at the appropriate height to rack the bar. Begin lying on the floor with your head near the end of a power rack. Keeping your shoulder blades pulled together; pull the bar off of the hooks.",
    "rationale": "Lower the bar towards the bottom of your chest or upper stomach, squeezing the bar and attempting to pull it apart as you do so. Ensure that you tuck your elbows throughout the movement. Lower the bar until your upper arm contacts the ground and pause, preventing any slamming or bouncing of the weight.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press/1.jpg"
    ]
  },
  {
    "id": "local-276",
    "name": "Floor Press with Chains",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Adjust the j-hooks so they are at the appropriate height to rack the bar. For this exercise, drape the chains directly over the end of the bar, trying to keep the ends away from the plates.",
    "rationale": "Begin lying on the floor with your head near the end of a power rack. Keeping your shoulder blades pulled together, pull the bar off of the hooks.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press_with_Chains/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press_with_Chains/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press_with_Chains/1.jpg"
    ]
  },
  {
    "id": "local-277",
    "name": "Flutter Kicks",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "On a flat bench lie facedown with the hips on the edge of the bench, the legs straight with toes high off the floor and with the arms on top of the bench holding on to the front edge.",
    "rationale": "Squeeze your glutes and hamstrings and straighten the legs until they are level with the hips. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flutter_Kicks/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flutter_Kicks/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flutter_Kicks/1.jpg"
    ]
  },
  {
    "id": "local-278",
    "name": "Foot-SMR",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "This exercise stretches the fascia of the muscles in the feet. Start off seated with your shoes removed. Using a foot roller or a similar object, such as a small section of pvc pipe, place your foot against the roller across the arch of your foot. This will be your starting position.",
    "rationale": "Press down firmly, rolling across the arch of your foot. Hold for 10-30 seconds, and then switch feet.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Foot-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Foot-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Foot-SMR/1.jpg"
    ]
  },
  {
    "id": "local-279",
    "name": "Forward Drag with Press",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strongman",
    "cue": "Attach a dual handled chain or rope attachment to the sled. You should be facing away from the sled, holding a handle in each hand.",
    "rationale": "Begin the movement by moving forward for one step. Leaning forward, extend through the legs and hips to move, pausing with each step to extend through the elbows, pressing your hands forward. Step forward until you return to the start position prepared to press.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Forward_Drag_with_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Forward_Drag_with_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Forward_Drag_with_Press/1.jpg"
    ]
  },
  {
    "id": "local-280",
    "name": "Frankenstein Squat",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Olympic weightlifting",
    "cue": "This drill teaches you the proper positioning of both the bar and your body during the clean and front squat.",
    "rationale": "Place the barbell on the front of the shoulders, releasing your grip and extending your arms out in front of you. The shoulders should be pushed forward to create a shelf, and the bar should be in contact with the throat. Ensure that you only move your shoulder blades forward; don't round the thoracic spine.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frankenstein_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frankenstein_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frankenstein_Squat/1.jpg"
    ]
  },
  {
    "id": "local-281",
    "name": "Freehand Jump Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Cross your arms over your chest.",
    "rationale": "With your head up and your back straight, position your feet at shoulder width.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Freehand_Jump_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Freehand_Jump_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Freehand_Jump_Squat/1.jpg"
    ]
  },
  {
    "id": "local-282",
    "name": "Frog Hops",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Stand with your hands behind your head, and squat down keeping your torso upright and your head up. This will be your starting position.",
    "rationale": "Jump forward several feet, avoiding jumping unnecessarily high. As your feet contact the ground, absorb the impact through your legs, and jump again. Repeat this action 5-10 times.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frog_Hops/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frog_Hops/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frog_Hops/1.jpg"
    ]
  },
  {
    "id": "local-283",
    "name": "Frog Sit-Ups",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie with your back flat on the floor (or exercise mat) and your legs extended in front of you.",
    "rationale": "Now bend at the knees and place your outer thighs by the floor (or mat) as you make the soles of your feet touch each other.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frog_Sit-Ups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frog_Sit-Ups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Frog_Sit-Ups/1.jpg"
    ]
  },
  {
    "id": "local-284",
    "name": "Front Barbell Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, bring your arms up under the bar while keeping the elbows high and the upper arm slightly above parallel to the floor. Rest the bar on top of the deltoids and cross your arms while grasping the bar for total control.",
    "rationale": "Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/1.jpg"
    ]
  },
  {
    "id": "local-285",
    "name": "Front Barbell Squat To A Bench",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set a flat bench behind you and set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, bring your arms up under the bar while keeping the elbows high and the upper arm slightly above parallel to the floor. Rest the bar on top of the deltoids and cross your arms while grasping the bar for total control.",
    "rationale": "Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat_To_A_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat_To_A_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat_To_A_Bench/1.jpg"
    ]
  },
  {
    "id": "local-286",
    "name": "Front Box Jump",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Begin with a box of an appropriate height 1-2 feet in front of you. Stand with your feet should width apart. This will be your starting position.",
    "rationale": "Perform a short squat in preparation for jumping, swinging your arms behind you.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Box_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Box_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Box_Jump/1.jpg"
    ]
  },
  {
    "id": "local-287",
    "name": "Front Cable Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Select the weight on a low pulley machine and grasp the single hand cable attachment that is attached to the low pulley with your left hand.",
    "rationale": "Face away from the pulley and put your arm straight down with the hand cable attachment in front of your thighs at arms' length with the palms of the hand facing your thighs. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/1.jpg"
    ]
  },
  {
    "id": "local-288",
    "name": "Front Cone Hops (or hurdle hops)",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Set up a row of cones or other small barriers, placing them a few feet apart.",
    "rationale": "Stand in front of the first cone with your feet shoulder width apart. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cone_Hops_or_hurdle_hops/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cone_Hops_or_hurdle_hops/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cone_Hops_or_hurdle_hops/1.jpg"
    ]
  },
  {
    "id": "local-289",
    "name": "Front Dumbbell Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Pick a couple of dumbbells and stand with a straight torso and the dumbbells on front of your thighs at arms length with the palms of the hand facing your thighs. This will be your starting position.",
    "rationale": "While maintaining the torso stationary (no swinging), lift the left dumbbell to the front with a slight bend on the elbow and the palms of the hands always facing down. Continue to go up until you arm is slightly above parallel to the floor. Exhale as you execute this portion of the movement and pause for a second at the top. Inhale after the second pause.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/1.jpg"
    ]
  },
  {
    "id": "local-290",
    "name": "Front Incline Dumbbell Raise",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit down on an incline bench with the incline set anywhere between 30 to 60 degrees while holding a dumbbell on each hand. Tip: You can change the angle to hit the muscle a little differently each time.",
    "rationale": "Extend your arms straight in front of you and have your palms facing down with the dumbbells raised about 1 inch above your thighs. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Incline_Dumbbell_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Incline_Dumbbell_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Incline_Dumbbell_Raise/1.jpg"
    ]
  },
  {
    "id": "local-291",
    "name": "Front Leg Raises",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Stand next to a chair or other support, holding on with one hand.",
    "rationale": "Swing your leg forward, keeping the leg straight. Continue with a downward swing, bringing the leg as far back as your flexibility allows. Repeat 5-10 times, and then switch legs.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Leg_Raises/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Leg_Raises/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Leg_Raises/1.jpg"
    ]
  },
  {
    "id": "local-292",
    "name": "Front Plate Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "While standing straight, hold a barbell plate in both hands at the 3 and 9 o'clock positions. Your palms should be facing each other and your arms should be extended and locked with a slight bend at the elbows and the plate should be down near your waist in front of you as far as you can go. Tip: The arms will remain in this position throughout the exercise. This will be your starting position.",
    "rationale": "Slowly raise the plate as you exhale until it is a little above shoulder level. Hold the contraction for a second. Tip: make sure that you do not swing the weight or bend at the elbows. Your torso should remain stationary throughout the movement as well.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Plate_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Plate_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Plate_Raise/1.jpg"
    ]
  },
  {
    "id": "local-293",
    "name": "Front Raise And Pullover",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on a flat bench while holding a barbell using a palms down grip that is about 15 inches apart.",
    "rationale": "Place the bar on your upper thighs, extend your arms and lock them while keeping a slight bend on the elbows. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/1.jpg"
    ]
  },
  {
    "id": "local-294",
    "name": "Front Squat (Clean Grip)",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, first set the bar in a rack slightly below shoulder level. Rest the bar on top of the deltoids, pushing into the clavicles, and lightly touching the throat. Your hands should be in a clean grip, touching the bar only with your fingers to help keep it in position.",
    "rationale": "Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso. Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head and elbows up at all times. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squat_Clean_Grip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squat_Clean_Grip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squat_Clean_Grip/1.jpg"
    ]
  },
  {
    "id": "local-295",
    "name": "Front Squats With Two Kettlebells",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Clean two kettlebells to your shoulders. Clean the kettlebells to your shoulders by extending through the legs and hips as you pull the kettlebells towards your shoulders. Rotate your wrists as you do so.",
    "rationale": "Looking straight ahead at all times, squat as low as you can and pause at the bottom. As you squat down, push your knees out. You should squat between your legs, keeping an upright torso, with your head and chest up.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squats_With_Two_Kettlebells/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squats_With_Two_Kettlebells/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squats_With_Two_Kettlebells/1.jpg"
    ]
  },
  {
    "id": "local-296",
    "name": "Front Two-Dumbbell Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Pick a couple of dumbbells and stand with a straight torso and the dumbbells on front of your thighs at arms length with the palms of the hand facing your thighs. This will be your starting position.",
    "rationale": "While maintaining the torso stationary (no swinging), lift the dumbbells to the front with a slight bend on the elbow and the palms of the hands always facing down. Continue to go up until you arms are slightly above parallel to the floor. Exhale as you execute this portion of the movement and pause for a second at the top.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Two-Dumbbell_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Two-Dumbbell_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Two-Dumbbell_Raise/1.jpg"
    ]
  },
  {
    "id": "local-297",
    "name": "Full Range-Of-Motion Lat Pulldown",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Either standing or seated on a high bench, grasp two stirrup cables that are attached to the high pulleys. Grab with the opposing hand so your arms are crisscrossed about you and your palms are facing forward.",
    "rationale": "Keeping your chest up and maintaining a slight arch in your lower back, pull the handles down as if you were doing a regular pulldown. The range of motion will be more of an arc. During the movement, rotate your hands so that in the bottom position your palms face each other rather than forward. Return slowly to the starting position and repeat.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Full_Range-Of-Motion_Lat_Pulldown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Full_Range-Of-Motion_Lat_Pulldown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Full_Range-Of-Motion_Lat_Pulldown/1.jpg"
    ]
  },
  {
    "id": "local-298",
    "name": "Gironda Sternum Chins",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grasp the pull-up bar with a shoulder width underhand grip.",
    "rationale": "Now hang with your arms fully extended and stick your chest out and lean back. Tip: You will be leaning back throughout the entire movement. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Gironda_Sternum_Chins/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Gironda_Sternum_Chins/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Gironda_Sternum_Chins/1.jpg"
    ]
  },
  {
    "id": "local-299",
    "name": "Glute Ham Raise",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Begin by adjusting the equipment to fit your body. Place your feet against the footplate in between the rollers as you lie facedown. Your knees should be just behind the pad.",
    "rationale": "Start from the bottom of the movement. Keep your back arched as you begin the movement by flexing the knees. Drive your toes into the foot plate as you do so. Keep your upper body straight, and continue until your body is upright.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Ham_Raise/1.jpg"
    ]
  },
  {
    "id": "local-300",
    "name": "Glute Kickback",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Kneel on the floor or an exercise mat and bend at the waist with your arms extended in front of you (perpendicular to the torso) in order to get into a kneeling push-up position but with the arms spaced at shoulder width. Your head should be looking forward and the bend of the knees should create a 90-degree angle between the hamstrings and the calves. This will be your starting position.",
    "rationale": "As you exhale, lift up your right leg until the hamstrings are in line with the back while maintaining the 90-degree angle bend. Contract the glutes throughout this movement and hold the contraction at the top for a second. Tip: At the end of the movement the upper leg should be parallel to the floor while the calf should be perpendicular to it.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Kickback/1.jpg"
    ]
  },
  {
    "id": "local-301",
    "name": "Goblet Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand holding a light kettlebell by the horns close to your chest. This will be your starting position.",
    "rationale": "Squat down between your legs until your hamstrings are on your calves. Keep your chest and head up and your back straight.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/1.jpg"
    ]
  },
  {
    "id": "local-302",
    "name": "Good Morning",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Begin with a bar on a rack at shoulder height. Rack the bar across the rear of your shoulders as you would a power squat, not on top of your shoulders. Keep your back tight, shoulder blades pinched together, and your knees slightly bent. Step back from the rack.",
    "rationale": "Begin by bending at the hips, moving them back as you bend over to near parallel. Keep your back arched and your cervical spine in proper alignment.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/1.jpg"
    ]
  },
  {
    "id": "local-303",
    "name": "Good Morning off Pins",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Begin with a bar on a rack at about the same height as your stomach. Bend over underneath the bar and rack the bar across the rear of your shoulders as you would a power squat, not on top of your shoulders. At the proper height, you should be near parallel to the floor when bent over. Keep your back tight, shoulder blades pinched together, and your knees slightly bent. Keep your back arched and your cervical spine in proper alignment.",
    "rationale": "Begin the motion by extending through the hips with your glutes and hamstrings, and you are standing with the weight. Slowly lower the weight back to the pins returning to the starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning_off_Pins/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning_off_Pins/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning_off_Pins/1.jpg"
    ]
  },
  {
    "id": "local-304",
    "name": "Gorilla Chin/Crunch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hang from a chin-up bar using an underhand grip (palms facing you) that is slightly wider than shoulder width.",
    "rationale": "Now bend your knees at a 90 degree angle so that the calves are parallel to the floor while the thighs remain perpendicular to it. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Gorilla_Chin_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Gorilla_Chin_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Gorilla_Chin_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-305",
    "name": "Groin and Back Stretch",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Sit on the floor with your knees bent and feet together.",
    "rationale": "Interlock your fingers behind your head. This will be your starting position.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Groin_and_Back_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Groin_and_Back_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Groin_and_Back_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-306",
    "name": "Groiners",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Begin in a pushup position on the floor. This will be your starting position.",
    "rationale": "Using both legs, jump forward landing with your feet next to your hands. Keep your head up as you do so.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Groiners/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Groiners/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Groiners/1.jpg"
    ]
  },
  {
    "id": "local-307",
    "name": "Hack Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place the back of your torso against the back pad of the machine and hook your shoulders under the shoulder pads provided.",
    "rationale": "Position your legs in the platform using a shoulder width medium stance with the toes slightly pointed out. Tip: Keep your head up at all times and also maintain the back on the pad at all times.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/1.jpg"
    ]
  },
  {
    "id": "local-308",
    "name": "Hammer Curls",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up with your torso upright and a dumbbell on each hand being held at arms length. The elbows should be close to the torso.",
    "rationale": "The palms of the hands should be facing your torso. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/1.jpg"
    ]
  },
  {
    "id": "local-309",
    "name": "Hammer Grip Incline DB Bench Press",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie back on an incline bench with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.",
    "rationale": "By using your thighs to help you get the dumbbells up, clean the dumbbells one arm at a time so that you can hold them at shoulder width.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Grip_Incline_DB_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-310",
    "name": "Hamstring-SMR",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "In a seated position, extend your legs over a foam roll so that it is position on the back of the upper legs. Place your hands to the side or behind you to help support your weight. This will be your starting position.",
    "rationale": "Using your hands, lift your hips off of the floor and shift your weight on the foam roll to one leg. Relax the hamstrings of the leg you are stretching.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hamstring-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hamstring-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hamstring-SMR/1.jpg"
    ]
  },
  {
    "id": "local-311",
    "name": "Hamstring Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie on your back with one leg extended above you, with the hip at ninety degrees. Keep the other leg flat on the floor.",
    "rationale": "Loop a belt, band, or rope over the ball of your foot. This will be your starting position.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hamstring_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hamstring_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hamstring_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-312",
    "name": "Handstand Push-Ups",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "With your back to the wall bend at the waist and place both hands on the floor at shoulder width.",
    "rationale": "Kick yourself up against the wall with your arms straight. Your body should be upside down with the arms and legs fully extended. Keep your whole body as straight as possible. Tip: If doing this for the first time, have a spotter help you. Also, make sure that you keep facing the wall with your head, rather than looking down.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Handstand_Push-Ups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Handstand_Push-Ups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Handstand_Push-Ups/1.jpg"
    ]
  },
  {
    "id": "local-313",
    "name": "Hang Clean",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a shoulder width, double overhand or hook grip, with the bar hanging at the mid thigh position. Your back should be straight and inclined slightly forward.",
    "rationale": "Begin by aggressively extending through the hips, knees and ankles, driving the weight upward. As you do so, shrug your shoulders towards your ears.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean/1.jpg"
    ]
  },
  {
    "id": "local-314",
    "name": "Hang Clean - Below the Knees",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a shoulder width, double overhand or hook grip, with the bar hanging just below the knees. Your back should be straight and inclined slightly forward.",
    "rationale": "Begin by aggressively extending through the hips, knees and ankles, driving the weight upward. As you do so, shrug your shoulders towards your ears. As full extension is achieved, transition into the third pull by aggressively shrugging and flexing the arms with the elbows up and out.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean_-_Below_the_Knees/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean_-_Below_the_Knees/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Clean_-_Below_the_Knees/1.jpg"
    ]
  },
  {
    "id": "local-315",
    "name": "Hang Snatch",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a wide grip on the bar, with an overhand or hook grip. The feet should be directly below the hips with the feet turned out. Your knees should be slightly bent, and the torso inclined forward. The spine should be fully extended and the head facing forward. The bar should be at the hips. This will be your starting position.",
    "rationale": "Aggressively extend through the legs and hips. At peak extension, shrug the shoulders and allow the elbows to flex to the side.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch/1.jpg"
    ]
  },
  {
    "id": "local-316",
    "name": "Hang Snatch - Below Knees",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a wide grip on the bar, with an overhand or hook grip. The feet should be directly below the hips with the feet turned out. Your knees should be slightly bent, and the torso inclined forward. The spine should be fully extended and the head facing forward. The bar should be just below the knees. This will be your starting position.",
    "rationale": "Aggressively extend through the legs and hips. At peak extension, shrug the shoulders and allow the elbows to flex to the side.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch_-_Below_Knees/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch_-_Below_Knees/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hang_Snatch_-_Below_Knees/1.jpg"
    ]
  },
  {
    "id": "local-317",
    "name": "Hanging Bar Good Morning",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Begin with a bar on a rack at about the same height as your stomach. Suspend the bar using chains or suspension straps.",
    "rationale": "Bend over underneath the bar and rack the bar across the rear of your shoulders as you would a power squat, not on top of your traps. At the proper height, you should be near parallel to the floor when bent over. Keep your back tight, shoulder blades pinched together, and your knees slightly bent. Keep your back arched and your cervical spine in proper alignment.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Bar_Good_Morning/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Bar_Good_Morning/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Bar_Good_Morning/1.jpg"
    ]
  },
  {
    "id": "local-318",
    "name": "Hanging Leg Raise",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hang from a chin-up bar with both arms extended at arms length in top of you using either a wide grip or a medium grip. The legs should be straight down with the pelvis rolled slightly backwards. This will be your starting position.",
    "rationale": "Raise your legs until the torso makes a 90-degree angle with the legs. Exhale as you perform this movement and hold the contraction for a second or so.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/1.jpg"
    ]
  },
  {
    "id": "local-319",
    "name": "Hanging Pike",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hang from a chin-up bar with your legs and feet together using an overhand grip (palms facing away from you) that is slightly wider than shoulder width. Tip: You may use wrist wraps in order to facilitate holding on to the bar.",
    "rationale": "Now bend your knees at a 90 degree angle and bring the upper legs forward so that the calves are perpendicular to the floor while the thighs remain parallel to it. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Pike/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Pike/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Pike/1.jpg"
    ]
  },
  {
    "id": "local-320",
    "name": "Heaving Snatch Balance",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Olympic weightlifting",
    "cue": "This drill helps you learn the snatch. Begin by holding a light weight across the back of the shoulders. Your feet should be slightly wider than hip width apart with the feet turned out, the same position that you would perform a squat with.",
    "rationale": "Begin by dipping with the knees slightly, and popping back up to briefly unload the bar. Drive yourself underneath the bar, elevating it overhead as you descend into a full squat.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Heaving_Snatch_Balance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Heaving_Snatch_Balance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Heaving_Snatch_Balance/1.jpg"
    ]
  },
  {
    "id": "local-321",
    "name": "Heavy Bag Thrust",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Utilize a heavy bag for this exercise. Assume an upright stance next to the bag, with your feet staggered, fairly wide apart. Place your hand on the bag at about chest height. This will be your starting position.",
    "rationale": "Begin by twisting at the waist, pushing the bag forward as hard as possible. Perform this move quickly, pushing the bag away from your body.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Heavy_Bag_Thrust/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Heavy_Bag_Thrust/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Heavy_Bag_Thrust/1.jpg"
    ]
  },
  {
    "id": "local-322",
    "name": "High Cable Curls",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand between a couple of high pulleys and grab a handle in each arm. Position your upper arms in a way that they are parallel to the floor with the palms of your hands facing you. This will be your starting position.",
    "rationale": "Curl the handles towards you until they are next to your ears. Make sure that as you do so you flex your biceps and exhale. The upper arms should remain stationary and only the forearms should move. Hold for a second in the contracted position as you squeeze the biceps.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Cable_Curls/1.jpg"
    ]
  },
  {
    "id": "local-323",
    "name": "Hip Circles (prone)",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Position yourself on your hands and knees on the ground. Maintaining good posture, raise one bent knee off of the ground. This will be your starting position.",
    "rationale": "Keeping the knee in a bent position, rotate the femur in an arc, attempting to make a big circle with your knee.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Circles_prone/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Circles_prone/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Circles_prone/1.jpg"
    ]
  },
  {
    "id": "local-324",
    "name": "Hip Extension with Bands",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Secure one end of the band to the lower portion of a post and attach the other to one ankle.",
    "rationale": "Facing the attachment point of the band, hold on to the column to stabilize yourself.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Extension_with_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Extension_with_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Extension_with_Bands/1.jpg"
    ]
  },
  {
    "id": "local-325",
    "name": "Hip Flexion with Band",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Secure one end of the band to the lower portion of a post and attach the other to one ankle.",
    "rationale": "Face away from the attachment point of the band.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Flexion_with_Band/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Flexion_with_Band/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Flexion_with_Band/1.jpg"
    ]
  },
  {
    "id": "local-326",
    "name": "Hip Lift with Band",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "After choosing a suitable band, lay down in the middle of the rack, after securing the band on either side of you. If your rack doesn't have pegs, the band can be secured using heavy dumbbells or similar objects, just ensure they won't move.",
    "rationale": "Adjust your position so that the band is directly over your hips. Bend your knees and place your feet flat on the floor. Your hands can be on the floor or holding the band in position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Lift_with_Band/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Lift_with_Band/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Lift_with_Band/1.jpg"
    ]
  },
  {
    "id": "local-327",
    "name": "Hug A Ball",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Seat yourself on the floor.",
    "rationale": "Straddle an exercise ball between both legs and lower your hips down toward the floor.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hug_A_Ball/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hug_A_Ball/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hug_A_Ball/1.jpg"
    ]
  },
  {
    "id": "local-328",
    "name": "Hug Knees To Chest",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie down on your back and pull both knees up to your chest.",
    "rationale": "Hold your arms under the knees, not over (that would put to much pressure on your knee joints).",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hug_Knees_To_Chest/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hug_Knees_To_Chest/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hug_Knees_To_Chest/1.jpg"
    ]
  },
  {
    "id": "local-329",
    "name": "Hurdle Hops",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Set up a row of hurdles or other small barriers, placing them a few feet apart.",
    "rationale": "Stand in front of the first hurdle with your feet shoulder width apart. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hurdle_Hops/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hurdle_Hops/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hurdle_Hops/1.jpg"
    ]
  },
  {
    "id": "local-330",
    "name": "Hyperextensions (Back Extensions)",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie face down on a hyperextension bench, tucking your ankles securely under the footpads.",
    "rationale": "Adjust the upper pad if possible so your upper thighs lie flat across the wide pad, leaving enough room for you to bend at the waist without any restriction.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/1.jpg"
    ]
  },
  {
    "id": "local-331",
    "name": "Hyperextensions With No Hyperextension Bench",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "With someone holding down your legs, slide yourself down to the edge a flat bench until your hips hang off the end of the bench. Tip: Your entire upper body should be hanging down towards the floor. Also, you will be in the same position as if you were on a hyperextension bench but the range of motion will be shorter due to the height of the flat bench vs. that of the hyperextension bench.",
    "rationale": "With your body straight, cross your arms in front of you (my preference) or behind your head. This will be your starting position. Tip: You can also hold a weight plate for extra resistance in front of you under your crossed arms.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_With_No_Hyperextension_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_With_No_Hyperextension_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_With_No_Hyperextension_Bench/1.jpg"
    ]
  },
  {
    "id": "local-332",
    "name": "IT Band and Glute Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Loop a belt, rope, or band around one of your feet, and swing that leg across your body to the opposite side, keeping the leg extended as you lay on the ground. This will be your starting position.",
    "rationale": "Keeping your foot off of the floor, pull on the belt, using the tension to pull the toes up. Hold for 10-20 seconds, and repeat on the other side.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/IT_Band_and_Glute_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/IT_Band_and_Glute_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/IT_Band_and_Glute_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-333",
    "name": "Iliotibial Tract-SMR",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Lay on your side, with the bottom leg placed onto a foam roller between the hip and the knee. The other leg can be crossed in front of you.",
    "rationale": "Place as much of your weight as is tolerable onto your bottom leg; there is no need to keep your bottom leg in contact with the ground. Be sure to relax the muscles of the leg you are stretching.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iliotibial_Tract-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iliotibial_Tract-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iliotibial_Tract-SMR/1.jpg"
    ]
  },
  {
    "id": "local-334",
    "name": "Inchworm",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand with your feet close together. Keeping your legs straight, stretch down and put your hands on the floor directly in front of you. This will be your starting position.",
    "rationale": "Begin by walking your hands forward slowly, alternating your left and your right. As you do so, bend only at the hip, keeping your legs straight.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inchworm/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inchworm/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inchworm/1.jpg"
    ]
  },
  {
    "id": "local-335",
    "name": "Incline Barbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Hold a barbell with an overhand grip (palms down) that is a little closer together than shoulder width.",
    "rationale": "Lie back on an incline bench set at any angle between 45-75-degrees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Barbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Barbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Barbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-336",
    "name": "Incline Bench Pull",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Grab a dumbbell in each hand and lie face down on an incline bench that is set to an incline that is approximately 30 degrees.",
    "rationale": "Let the arms hang to your sides fully extended as they point to the floor.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Bench_Pull/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Bench_Pull/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Bench_Pull/1.jpg"
    ]
  },
  {
    "id": "local-337",
    "name": "Incline Cable Chest Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your head and chest up. The elbows should be bent to about 90 degrees. This will be your starting position.",
    "rationale": "Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the movement.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Chest_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Chest_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Chest_Press/1.jpg"
    ]
  },
  {
    "id": "local-338",
    "name": "Incline Cable Flye",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "To get yourself into the starting position, set the pulleys at the floor level (lowest level possible on the machine that is below your torso).",
    "rationale": "Place an incline bench (set at 45 degrees) in between the pulleys, select a weight on each one and grab a pulley on each hand.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Flye/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Flye/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Cable_Flye/1.jpg"
    ]
  },
  {
    "id": "local-339",
    "name": "Incline Dumbbell Bench With Palms Facing In",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie back on an incline bench with a dumbbell on each hand on top of your thighs. The palms of your hand will be facing each other.",
    "rationale": "By using your thighs to help you get the dumbbells up, clean the dumbbells one arm at a time so that you can hold them at shoulder width.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Bench_With_Palms_Facing_In/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Bench_With_Palms_Facing_In/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Bench_With_Palms_Facing_In/1.jpg"
    ]
  },
  {
    "id": "local-340",
    "name": "Incline Dumbbell Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit back on an incline bench with a dumbbell in each hand held at arms length. Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward. This will be your starting position.",
    "rationale": "While holding the upper arm stationary, curl the weights forward while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a second.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-341",
    "name": "Incline Dumbbell Flyes",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a dumbbell on each hand and lie on an incline bench that is set to an incline angle of no more than 30 degrees.",
    "rationale": "Extend your arms above you with a slight bend at the elbows.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/1.jpg"
    ]
  },
  {
    "id": "local-342",
    "name": "Incline Dumbbell Flyes - With A Twist",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hold a dumbbell in each hand and lie on an incline bench that is set to an incline angle of no more than 30 degrees.",
    "rationale": "Extend your arms above you with a slight bend at the elbows.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes_-_With_A_Twist/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes_-_With_A_Twist/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes_-_With_A_Twist/1.jpg"
    ]
  },
  {
    "id": "local-343",
    "name": "Incline Dumbbell Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie back on an incline bench with a dumbbell in each hand atop your thighs. The palms of your hands will be facing each other.",
    "rationale": "Then, using your thighs to help push the dumbbells up, lift the dumbbells one at a time so that you can hold them at shoulder width.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": "local-344",
    "name": "Incline Hammer Curls",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Seat yourself on an incline bench with a dumbbell in each hand. You should pressed firmly against he back with your feet together. Allow the dumbbells to hang straight down at your side, holding them with a neutral grip. This will be your starting position.",
    "rationale": "Initiate the movement by flexing at the elbow, attempting to keep the upper arm stationary.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Hammer_Curls/1.jpg"
    ]
  },
  {
    "id": "local-345",
    "name": "Incline Inner Biceps Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Hold a dumbbell in each hand and lie back on an incline bench.",
    "rationale": "The dumbbells should be at arm's length hanging at your sides and your palms should be facing out. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Inner_Biceps_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Inner_Biceps_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Inner_Biceps_Curl/1.jpg"
    ]
  },
  {
    "id": "local-346",
    "name": "Incline Push-Up",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand facing bench or sturdy elevated platform. Place hands on edge of bench or platform, slightly wider than shoulder width.",
    "rationale": "Position forefoot back from bench or platform with arms and body straight. Arms should be perpendicular to body. Keeping body straight, lower chest to edge of box or platform by bending arms.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up/1.jpg"
    ]
  },
  {
    "id": "local-347",
    "name": "Incline Push-Up Close-Grip",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand facing a Smith machine bar or sturdy elevated platform at an appropriate height.",
    "rationale": "Place your hands next to one another on the bar.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Close-Grip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Close-Grip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Close-Grip/1.jpg"
    ]
  },
  {
    "id": "local-348",
    "name": "Incline Push-Up Depth Jump",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "For this drill you will need a box about 12 inches high, and two thick mats or aerobics steps.",
    "rationale": "Place the steps just outside of your shoulders, and place your feet on top of the box so that you are in an incline pushup position, your hands just inside the steps. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Depth_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Depth_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Depth_Jump/1.jpg"
    ]
  },
  {
    "id": "local-349",
    "name": "Incline Push-Up Medium",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand facing a Smith machine bar or sturdy elevated platform at an appropriate height.",
    "rationale": "Place your hands on the bar, with your hands about shoulder width apart.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Medium/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Medium/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Medium/1.jpg"
    ]
  },
  {
    "id": "local-350",
    "name": "Incline Push-Up Reverse Grip",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand facing a Smith machine bar or sturdy elevated platform at an appropriate height.",
    "rationale": "Place your hands on the bar palms up, with your hands about shoulder width apart.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Reverse_Grip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Reverse_Grip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Reverse_Grip/1.jpg"
    ]
  },
  {
    "id": "local-351",
    "name": "Incline Push-Up Wide",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand facing a Smith machine bar or sturdy elevated platform at an appropriate height.",
    "rationale": "Place your hands on the bar, with your hands wider than shoulder width.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Wide/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Wide/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Push-Up_Wide/1.jpg"
    ]
  },
  {
    "id": "local-352",
    "name": "Intermediate Groin Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie on your back with your legs extended. Loop a belt, rope, or band around one of your feet, and swing that leg as far to the side as you can. This will be your starting position.",
    "rationale": "Pull gently on the belt to create tension in your groin and hamstring muscles. Hold for 10-20 seconds, and repeat on the other side.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Intermediate_Groin_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Intermediate_Groin_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Intermediate_Groin_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-353",
    "name": "Intermediate Hip Flexor and Quad Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie face down on the floor, with a rope, belt, or band looped around one foot.",
    "rationale": "Flex the knee and extend the hip of the leg to be stretched, using both hands to pull on the belt. Your knee and your hip should come off of the floor, creating tension in the hip flexors and quadriceps. Hold the stretch for 10-20 seconds, and repeat on the other leg.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Intermediate_Hip_Flexor_and_Quad_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Intermediate_Hip_Flexor_and_Quad_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Intermediate_Hip_Flexor_and_Quad_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-354",
    "name": "Internal Rotation with Band",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Choke the band around a post. The band should be at the same height as your elbow. Stand with your right side to the band a couple of feet away.",
    "rationale": "Grasp the end of the band with your right hand, and keep your elbow pressed firmly to your side. We recommend you hold a pad or foam roll in place with your elbow to keep it firmly in position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Internal_Rotation_with_Band/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Internal_Rotation_with_Band/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Internal_Rotation_with_Band/1.jpg"
    ]
  },
  {
    "id": "local-355",
    "name": "Inverted Row",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Position a bar in a rack to about waist height. You can also use a smith machine.",
    "rationale": "Take a wider than shoulder width grip on the bar and position yourself hanging underneath the bar. Your body should be straight with your heels on the ground with your arms fully extended. This will be your starting position.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/1.jpg"
    ]
  },
  {
    "id": "local-356",
    "name": "Inverted Row with Straps",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hang a rope or suspension straps from a rack or other stable object. Grasp the ends and position yourself in a supine position hanging from the ropes. Your body should be straight with your heels on the ground with your arms fully extended. This will be your starting position.",
    "rationale": "Begin by flexing the elbow, pulling your chest to your hands. Retract your shoulder blades as you perform the movement.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row_with_Straps/1.jpg"
    ]
  },
  {
    "id": "local-357",
    "name": "Iron Cross",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Maintain proper form and control.",
    "rationale": "Targets shoulders.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iron_Cross/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iron_Cross/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iron_Cross/1.jpg"
    ]
  },
  {
    "id": "local-358",
    "name": "Iron Crosses (stretch)",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie face down on the floor, with your arms extended out to your side, palms pressed to the floor. This will be your starting position.",
    "rationale": "To begin, flex one knee and bring that leg across the back of your body, attempting to touch it to the ground near the opposite hand.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iron_Crosses_stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iron_Crosses_stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Iron_Crosses_stretch/1.jpg"
    ]
  },
  {
    "id": "local-359",
    "name": "Isometric Chest Squeezes",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "While either seating or standing, bend your arms at a 90-degree angle and place the palms of your hands together in front of your chest. Tip: Your hands should be open with the palms together and fingers facing forward (perpendicular to your torso).",
    "rationale": "Push both hands against each other as you contract your chest. Start with slow tension and increase slowly. Keep breathing normally as you execute this contraction.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Chest_Squeezes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Chest_Squeezes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Chest_Squeezes/1.jpg"
    ]
  },
  {
    "id": "local-360",
    "name": "Isometric Neck Exercise - Front And Back",
    "muscle_group": "Neck",
    "tier": "S",
    "focus": "Strength",
    "cue": "With your head and neck in a neutral position (normal position with head erect facing forward), place both of your hands on the front side of your head.",
    "rationale": "Now gently push forward as you contract the neck muscles but resisting any movement of your head. Start with slow tension and increase slowly. Keep breathing normally as you execute this contraction.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Front_And_Back/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Front_And_Back/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Front_And_Back/1.jpg"
    ]
  },
  {
    "id": "local-361",
    "name": "Isometric Neck Exercise - Sides",
    "muscle_group": "Neck",
    "tier": "B",
    "focus": "Strength",
    "cue": "With your head and neck in a neutral position (normal position with head erect facing forward), place your left hand on the left side of your head.",
    "rationale": "Now gently push towards the left as you contract the left neck muscles but resisting any movement of your head. Start with slow tension and increase slowly. Keep breathing normally as you execute this contraction.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Sides/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Sides/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Neck_Exercise_-_Sides/1.jpg"
    ]
  },
  {
    "id": "local-362",
    "name": "Isometric Wipers",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Assume a push-up position, supporting your weight on your hands and toes while keeping your body straight. Your hands should be just outside of shoulder width. This will be your starting position.",
    "rationale": "Begin by shifting your body weight as far to one side as possible, allowing the elbow on that side to flex as you lower your body.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Wipers/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Wipers/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Isometric_Wipers/1.jpg"
    ]
  },
  {
    "id": "local-363",
    "name": "JM Press",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start the exercise the same way you would a close grip bench press. You will lie on a flat bench while holding a barbell at arms length (fully extended) with the elbows in. However, instead of having the arms perpendicular to the torso, make sure the bar is set in a direct line above the upper chest. This will be your starting position.",
    "rationale": "Now beginning from a fully extended position lower the bar down as if performing a lying triceps extension. Inhale as you perform this movement. When you reach the half way point, let the bar roll back about one inch by moving the upper arms towards your legs until they are perpendicular to the torso. Tip: Keep the bend at the elbows constant as you bring the upper arms forward.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/JM_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/JM_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/JM_Press/1.jpg"
    ]
  },
  {
    "id": "local-364",
    "name": "Jackknife Sit-Up",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on the floor (or exercise mat) on your back with your arms extended straight back behind your head and your legs extended also. This will be your starting position.",
    "rationale": "As you exhale, bend at the waist while simultaneously raising your legs and arms to meet in a jackknife position. Tip: The legs should be extended and lifted at approximately a 35-45 degree angle from the floor and the arms should be extended and parallel to your legs. The upper torso should be off the floor.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jackknife_Sit-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jackknife_Sit-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jackknife_Sit-Up/1.jpg"
    ]
  },
  {
    "id": "local-365",
    "name": "Janda Sit-Up",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Position your body on the floor in the basic sit-up position; knees to a ninety degree angle with feet flat on the floor and arms either crossed over your chest or to the sides. This will be your starting position.",
    "rationale": "As you strongly tighten your glutes and hamstrings, fill your lungs with air and in a slow (three to six second count) ascent, slowly exhale. Tip: It is important to tighten the glutes and hamstrings as this will cause the hip flexors to be inactivated in a process called reciprocal inhibition, which basically means that opposite muscles to the contracted ones will relax.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Janda_Sit-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Janda_Sit-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Janda_Sit-Up/1.jpg"
    ]
  },
  {
    "id": "local-366",
    "name": "Jefferson Squats",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a barbell on the floor.",
    "rationale": "Stand in the middle of the bar length wise.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jefferson_Squats/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jefferson_Squats/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jefferson_Squats/1.jpg"
    ]
  },
  {
    "id": "local-367",
    "name": "Jerk Balance",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "This drill helps you learn to drive yourself low enough during the jerk and corrects those who move backward during the movement. Begin with the bar racked in the jerk position, with the shoulders forward, torso upright, and the feet split slightly apart.",
    "rationale": "Initiate the movement as you would a normal jerk, dipping at the knees while keeping your torso vertical, and driving back up forcefully, using momentum and not your arms to elevate the weight.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Balance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Balance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Balance/1.jpg"
    ]
  },
  {
    "id": "local-368",
    "name": "Jerk Dip Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "This movement strengthens the dip portion of the jerk. Begin with the bar racked in the jerk position, with the shoulders forward to create a shelf and the bar lightly contacting the throat. The feet should be directly under the hips, with the feet turned out as is comfortable.",
    "rationale": "Keeping the torso vertical, dip by flexing the knees, allowing them to travel forward and without moving the hips to the rear. The dip should not be excessive. Return the weight to the starting position by driving forcefully though the feet.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Dip_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Dip_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk_Dip_Squat/1.jpg"
    ]
  },
  {
    "id": "local-369",
    "name": "Jogging, Treadmill",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Cardio",
    "cue": "To begin, step onto the treadmill and select the desired option from the menu. Most treadmills have a manual setting, or you can select a program to run. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. Elevation can be adjusted to change the intensity of the workout.",
    "rationale": "Treadmills offer convenience, cardiovascular benefits, and usually have less impact than jogging outside. A 150 lb person will burn almost 250 calories jogging for 30 minutes, compared to more than 450 calories running. Maintain proper posture as you jog, and only hold onto the handles when necessary, such as when dismounting or checking your heart rate.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jogging_Treadmill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jogging_Treadmill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jogging_Treadmill/1.jpg"
    ]
  },
  {
    "id": "local-370",
    "name": "Keg Load",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strongman",
    "cue": "To load kegs, place the desired number a distance from the loading platform, typically 30-50 feet.",
    "rationale": "Begin by grabbing the close handle of the first keg, tilting it onto its side to grab the opposite edge of the bottom of the keg. Lift the keg up to your chest.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Keg_Load/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Keg_Load/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Keg_Load/1.jpg"
    ]
  },
  {
    "id": "local-371",
    "name": "Kettlebell Arnold Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Clean a kettlebell to your shoulder. Clean the kettlebell to your shoulder by extending through the legs and hips as you raise the kettlebell towards your shoulder. The palm should be facing inward.",
    "rationale": "Looking straight ahead, press the kettlebell out and overhead, rotating your wrist so that your palm faces forward at the top of the motion.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Arnold_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Arnold_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Arnold_Press/1.jpg"
    ]
  },
  {
    "id": "local-372",
    "name": "Kettlebell Dead Clean",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place kettlebell between your feet. To get in the starting position, push your butt back and look straight ahead.",
    "rationale": "Clean the kettlebell to your shoulder. Clean the kettlebell to your shoulders by extending through the legs and hips as you raise the kettlebell towards your shoulder. The wrist should rotate as you do so.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Dead_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Dead_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Dead_Clean/1.jpg"
    ]
  },
  {
    "id": "local-373",
    "name": "Kettlebell Figure 8",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place one kettlebell between your legs and take a wider than shoulder width stance. Bend over by pushing your butt out and keeping your back flat.",
    "rationale": "Pick up a kettlebell and pass it to your other hand between your legs. The receiving hand should reach from behind the legs. Go back and forth for several repetitions.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Figure_8/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Figure_8/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Figure_8/1.jpg"
    ]
  },
  {
    "id": "local-374",
    "name": "Kettlebell Hang Clean",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place kettlebell between your feet. To get in the starting position, push your butt back and look straight ahead.",
    "rationale": "Clean kettlebell to your shoulder. Clean the kettlebell to your shoulders by extending through the legs and hips as you raise the kettlebell towards your shoulder. The wrist should rotate as you do so.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Hang_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Hang_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Hang_Clean/1.jpg"
    ]
  },
  {
    "id": "local-375",
    "name": "Kettlebell One-Legged Deadlift",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Hold a kettlebell by the handle in one hand. Stand on one leg, on the same side that you hold the kettlebell.",
    "rationale": "Keeping that knee slightly bent, perform a stiff legged deadlift by bending at the hip, extending your free leg behind you for balance.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_One-Legged_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_One-Legged_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_One-Legged_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-376",
    "name": "Kettlebell Pass Between The Legs",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place one kettlebell between your legs and take a comfortable stance. Bend over by pushing your butt out and keeping your back flat.",
    "rationale": "Pick up a kettlebell and pass it to your other hand between your legs, in the fashion of a \"W\". Go back and forth for several repetitions.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pass_Between_The_Legs/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pass_Between_The_Legs/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pass_Between_The_Legs/1.jpg"
    ]
  },
  {
    "id": "local-377",
    "name": "Kettlebell Pirate Ships",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "With a wide stance, hold a kettlebell with both hands. Allow it to hang at waist level with your arms extended. This will be your starting position.",
    "rationale": "Initiate the movement by turning to one side, swinging the kettlebell to head height. Briefly pause at the top of the motion.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pirate_Ships/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pirate_Ships/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pirate_Ships/1.jpg"
    ]
  },
  {
    "id": "local-378",
    "name": "Kettlebell Pistol Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Pick up a kettlebell with two hands and hold it by the horns. Hold one leg off of the floor and squat down on the other.",
    "rationale": "Squat down by flexing the knee and sitting back with the hips, holding the kettlebell up in front of you.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pistol_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pistol_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Pistol_Squat/1.jpg"
    ]
  },
  {
    "id": "local-379",
    "name": "Kettlebell Seated Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit on the floor and spread your legs out comfortably.",
    "rationale": "Clean one kettlebell to your shoulder.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Seated_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Seated_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Seated_Press/1.jpg"
    ]
  },
  {
    "id": "local-380",
    "name": "Kettlebell Seesaw Press",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Clean two kettlebells two your shoulders.",
    "rationale": "Press one kettlebell.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Seesaw_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Seesaw_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Seesaw_Press/1.jpg"
    ]
  },
  {
    "id": "local-381",
    "name": "Kettlebell Sumo High Pull",
    "muscle_group": "Other",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a kettlebell on the ground between your feet. Position your feet in a wide stance, and grasp the kettlebell with two hands. Set your hips back as far as possible, with your knees bent. Keep your chest and head up. This will be your starting position.",
    "rationale": "Begin by extending the hips and knees, simultaneously pulling the kettlebell to your shoulders, raising your elbows as you do so. Reverse the motion to return to the starting position.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Sumo_High_Pull/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Sumo_High_Pull/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Sumo_High_Pull/1.jpg"
    ]
  },
  {
    "id": "local-382",
    "name": "Kettlebell Thruster",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Clean two kettlebells to your shoulders. Clean the kettlebells to your shoulders by extending through the legs and hips as you pull the kettlebells towards your shoulders. Rotate your wrists as you do so. This will be your starting position.",
    "rationale": "Begin to squat by flexing your hips and knees, lowering your hips between your legs. Maintain an upright, straight back as you descend as low as you can.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Thruster/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Thruster/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Thruster/1.jpg"
    ]
  },
  {
    "id": "local-383",
    "name": "Kettlebell Turkish Get-Up (Lunge style)",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on your back on the floor and press a kettlebell to the top position by extending the elbow. Bend the knee on the same side as the kettlebell.",
    "rationale": "Keeping the kettlebell locked out at all times, pivot to the opposite side and use your non- working arm to assist you in driving forward to the lunge position. Using your free hand, push yourself to a seated position, then progressing to one knee.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Lunge_style/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Lunge_style/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Lunge_style/1.jpg"
    ]
  },
  {
    "id": "local-384",
    "name": "Kettlebell Turkish Get-Up (Squat style)",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie on your back on the floor and press a kettlebell to the top position by extending the elbow. Bend the knee on the same side as the kettlebell.",
    "rationale": "Keeping the kettlebell locked out at all times, pivot to the opposite side and use your non- working arm to assist you in driving forward to the lunge position.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Squat_style/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Squat_style/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Squat_style/1.jpg"
    ]
  },
  {
    "id": "local-385",
    "name": "Kettlebell Windmill",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Place a kettlebell in front of your lead foot and clean and press it overhead with your opposite arm. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulders. Rotate your wrist as you do so, so that the palm faces forward. Press it overhead by extending the elbow.",
    "rationale": "Keeping the kettlebell locked out at all times, push your butt out in the direction of the locked out kettlebell. Turn your feet out at a forty-five degree angle from the arm with the locked out kettlebell. Bending at the hip to one side, sticking your butt out, slowly lean until you can touch the floor with your free hand. Keep your eyes on the kettlebell that you hold over your head at all times.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Windmill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Windmill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Windmill/1.jpg"
    ]
  },
  {
    "id": "local-386",
    "name": "Kipping Muscle Up",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grip the rings using a false grip, with the base of your palms on top of the rings.",
    "rationale": "Begin with a movement swinging your legs backward slightly.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kipping_Muscle_Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kipping_Muscle_Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kipping_Muscle_Up/1.jpg"
    ]
  },
  {
    "id": "local-387",
    "name": "Knee Across The Body",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Lie down on the floor with your right leg straight. Bend your left leg and lower it across your body, holding the knee down toward the floor with your right hand. (The knee doesn't need to touch the floor if you're tight.)",
    "rationale": "Place your left arm comfortably beside you and turn your head to the left. Imagine you have a weight tied to your tailbone. let your tailbone fall back toward the floor as your chest reaches in the opposite direction to stretch your lower back. Switch sides.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Across_The_Body/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Across_The_Body/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Across_The_Body/1.jpg"
    ]
  },
  {
    "id": "local-388",
    "name": "Knee Circles",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand with your legs together and hands by your waist.",
    "rationale": "Now move your knees in a circular motion as you breathe normally.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Circles/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Circles/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Circles/1.jpg"
    ]
  },
  {
    "id": "local-389",
    "name": "Knee/Hip Raise On Parallel Bars",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position your body on the vertical leg raise bench so that your forearms are resting on the pads next to the torso and holding on to the handles. Your arms will be bent at a 90 degree angle.",
    "rationale": "The torso should be straight with the lower back pressed against the pad of the machine and the legs extended pointing towards the floor. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Hip_Raise_On_Parallel_Bars/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Hip_Raise_On_Parallel_Bars/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Hip_Raise_On_Parallel_Bars/1.jpg"
    ]
  },
  {
    "id": "local-390",
    "name": "Knee Tuck Jump",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "Begin in a comfortable standing position with your knees slightly bent. Hold your hands in front of you, palms down with your fingertips together at chest height. This will be your starting position.",
    "rationale": "Rapidly dip down into a quarter squat and immediately explode upward. Drive the knees towards the chest, attempting to touch them to the palms of the hands.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Tuck_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Tuck_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Knee_Tuck_Jump/1.jpg"
    ]
  },
  {
    "id": "local-391",
    "name": "Kneeling Arm Drill",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "This drill helps increase arm efficiency during the run. Begin kneeling, left foot in front, right knee down. Apply pressure through the front heel to keep your glutes and hamstrings activated.",
    "rationale": "Begin by blocking the arms in long, pendulum like swings. Close the arm angle, blocking with the arms as you would when jogging, progressing to a run and finally a sprint.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Arm_Drill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Arm_Drill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Arm_Drill/1.jpg"
    ]
  },
  {
    "id": "local-392",
    "name": "Kneeling Cable Crunch With Alternating Oblique Twists",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Connect a rope attachment to a high pulley cable and position a mat on the floor in front of it.",
    "rationale": "Grab the rope with both hands and kneel approximately two feet back from the tower.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists/1.jpg"
    ]
  },
  {
    "id": "local-393",
    "name": "Kneeling Cable Triceps Extension",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a bench sideways in front of a high pulley machine.",
    "rationale": "Hold a straight bar attachment above your head with your hands about 6 inches apart with your palms facing down.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Cable_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-394",
    "name": "Kneeling Forearm Stretch",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Start by kneeling on a mat with your palms flat and your fingers pointing back toward your knees.",
    "rationale": "Slowly lean back keeping your palms flat on the floor until you feel a stretch in your wrists and forearms. Hold for 20-30 seconds.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Forearm_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Forearm_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Forearm_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-395",
    "name": "Kneeling High Pulley Row",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Select the appropriate weight using a pulley that is above your head. Attach a rope to the cable and kneel a couple of feet away, holding the rope out in front of you with both arms extended. This will be your starting position.",
    "rationale": "Initiate the movement by flexing the elbows and fully retracting your shoulders, pulling the rope toward your upper chest with your elbows out.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_High_Pulley_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_High_Pulley_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_High_Pulley_Row/1.jpg"
    ]
  },
  {
    "id": "local-396",
    "name": "Kneeling Hip Flexor",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Kneel on a mat and bring your right knee up so the bottom of your foot is on the floor and extend your left leg out behind you so the top of your foot is on the floor.",
    "rationale": "Shift your weight forward until you feel a stretch in your hip. Hold for 15 seconds, then repeat for your other side.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Hip_Flexor/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Hip_Flexor/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Hip_Flexor/1.jpg"
    ]
  },
  {
    "id": "local-397",
    "name": "Kneeling Jump Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin kneeling on the floor with a barbell racked across the back of your shoulders, or you can use your body weight for this exercise. This can be done inside of a power rack to make unracking easier.",
    "rationale": "Sit back with your hips until your glutes touch your feet, keeping your head and chest up.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Jump_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Jump_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Jump_Squat/1.jpg"
    ]
  },
  {
    "id": "local-398",
    "name": "Kneeling Single-Arm High Pulley Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach a single handle to a high pulley and make your weight selection.",
    "rationale": "Kneel in front of the cable tower, taking the cable with one hand with your arm extended. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Single-Arm_High_Pulley_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Single-Arm_High_Pulley_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Single-Arm_High_Pulley_Row/1.jpg"
    ]
  },
  {
    "id": "local-399",
    "name": "Kneeling Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Set the bar to the proper height in a power rack. Kneel behind the bar; it may be beneficial to put a mat down to pad your knees. Slide under the bar, racking it across the back of your shoulders. Your shoulder blades should be retracted and the bar tight across your back. Unrack the weight.",
    "rationale": "With your head looking forward, sit back with your butt until you touch your calves.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kneeling_Squat/1.jpg"
    ]
  },
  {
    "id": "local-400",
    "name": "Landmine 180's",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.",
    "rationale": "Raise the bar from the floor, taking it to shoulder height with both hands with your arms extended in front of you. Adopt a wide stance. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_180s/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_180s/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_180s/1.jpg"
    ]
  },
  {
    "id": "local-401",
    "name": "Landmine Linear Jammer",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position a bar into landmine or, lacking one, securely anchor it in a corner. Load the bar to an appropriate weight and position the handle attachment on the bar.",
    "rationale": "Raise the bar from the floor, taking the handles to your shoulders. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_Linear_Jammer/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_Linear_Jammer/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_Linear_Jammer/1.jpg"
    ]
  },
  {
    "id": "local-402",
    "name": "Lateral Bound",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Assume a half squat position facing 90 degrees from your direction of travel. This will be your starting position.",
    "rationale": "Allow your lead leg to do a countermovement inward as you shift your weight to the outside leg.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Bound/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Bound/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Bound/1.jpg"
    ]
  },
  {
    "id": "local-403",
    "name": "Lateral Box Jump",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Assume a comfortable standing position, with a short box positioned next to you. This will be your starting position.",
    "rationale": "Quickly dip into a quarter squat to initiate the stretch reflex, and immediately reverse direction to jump up and to the side.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Box_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Box_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Box_Jump/1.jpg"
    ]
  },
  {
    "id": "local-404",
    "name": "Lateral Cone Hops",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Position a number of cones in a row several feet apart.",
    "rationale": "Stand next to the end of the cones, facing 90 degrees to the direction of travel. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Cone_Hops/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Cone_Hops/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Cone_Hops/1.jpg"
    ]
  },
  {
    "id": "local-405",
    "name": "Lateral Raise - With Bands",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "To begin, stand on an exercise band so that tension begins at arm's length. Grasp the handles using a pronated (palms facing your thighs) grip that is slightly less than shoulder width. The handles should be resting on the sides of your thighs. Your arms should be extended with a slight bend at the elbows and your back should be straight. This will be your starting position.",
    "rationale": "Use your side shoulders to lift the handles to the sides as you exhale. Continue to lift the handles until they are slightly above parallel. Tip: As you lift the handles, slightly tilt the hand as if you were pouring water and keep your arms extended. Also, keep your torso stationary and pause for a second at the top of the movement.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-406",
    "name": "Latissimus Dorsi-SMR",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "While lying on the floor, place a foam roll under your back and to one side, just behind your arm pit. This will be your starting position.",
    "rationale": "Keep the arm of the side being stretched behind and to the side of you as you shift your weight onto your lats, keeping your upper body off of the ground. Hold for 10-30 seconds, and switch sides.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Latissimus_Dorsi-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Latissimus_Dorsi-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Latissimus_Dorsi-SMR/1.jpg"
    ]
  },
  {
    "id": "local-407",
    "name": "Leg-Over Floor Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on the floor with one kettlebell in place on your chest, holding it by the handle. Extend leg on working side over leg on non-working side.Your free arm can be extended out to your side for support.",
    "rationale": "Press the kettlebll into a locked out position.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Over_Floor_Press/1.jpg"
    ]
  },
  {
    "id": "local-408",
    "name": "Leg-Up Hamstring Stretch",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Lie flat on your back, bend one knee, and put that foot flat on the floor to stabilize your spine.",
    "rationale": "Extend the other leg in the air. If you're tight, you wont be able to straighten it. That's okay. Extend the knee so that the sole of the lifted foot faces the ceiling (or as close as you can get it).",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Up_Hamstring_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Up_Hamstring_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg-Up_Hamstring_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-409",
    "name": "Leg Extensions",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "For this exercise you will need to use a leg extension machine. First choose your weight and sit on the machine with your legs under the pad (feet pointed forward) and the hands holding the side bars. This will be your starting position. Tip: You will need to adjust the pad so that it falls on top of your lower leg (just above your feet). Also, make sure that your legs form a 90-degree angle between the lower and upper leg. If the angle is less than 90-degrees then that means the knee is over the toes which in turn creates undue stress at the knee joint. If the machine is designed that way, either look for another machine or just make sure that when you start executing the exercise you stop going down once you hit the 90-degree angle.",
    "rationale": "Using your quadriceps, extend your legs to the maximum as you exhale. Ensure that the rest of the body remains stationary on the seat. Pause a second on the contracted position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/1.jpg"
    ]
  },
  {
    "id": "local-410",
    "name": "Leg Lift",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "While standing up straight with both feet next to each other at around shoulder width, grab a sturdy surface such as the sides of a squat rack or the top of a chair to brace yourself and keep balance.",
    "rationale": "With or without an ankle weight, lift one leg behind you as if performing a leg curl but standing up while keeping the other leg straight. Breathe out as you perform this movement.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Lift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Lift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Lift/1.jpg"
    ]
  },
  {
    "id": "local-411",
    "name": "Leg Press",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a medium (shoulder width) foot stance. (Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances described in the foot positioning section).",
    "rationale": "Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of you. Tip: Make sure that you do not lock your knees. Your torso and the legs should make a perfect 90-degree angle. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg"
    ]
  },
  {
    "id": "local-412",
    "name": "Leg Pull-In",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on an exercise mat with your legs extended and your hands either palms facing down next to you or under your glutes. Tip: My preference is with the hands next to me. This will be your starting position.",
    "rationale": "Bend your knees and pull your upper thighs into your midsection as you breathe out. Continue the motion until your knees are around chest level. Contract your abs as you execute this movement and hold for a second at the top. Tip: As you perform the motion, the lower legs (calves) should always remain parallel to the floor.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Pull-In/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Pull-In/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Pull-In/1.jpg"
    ]
  },
  {
    "id": "local-413",
    "name": "Leverage Chest Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Load an appropriate weight onto the pins and adjust the seat for your height. The handles should be near the bottom or middle of the pectorals at the beginning of the motion.",
    "rationale": "Your chest and head should be up and your shoulder blades retracted. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Chest_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Chest_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Chest_Press/1.jpg"
    ]
  },
  {
    "id": "local-414",
    "name": "Leverage Deadlift",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Load the pins to an appropriate weight. Position yourself directly between the handles. Grasp the bottom handles with a comfortable grip, and then lower your hips as you take a breath. Look forward with your head and keep your chest up. This will be your starting position.",
    "rationale": "Return the weight to the starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-415",
    "name": "Leverage Decline Chest Press",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Load an appropriate weight onto the pins and adjust the seat for your height. The handles should be near the bottom of the pectorals at the beginning of the motion. Your chest and head should be up and your shoulder blades retracted. This will be your starting position.",
    "rationale": "Press the handles forward by extending through the elbow.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Decline_Chest_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Decline_Chest_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Decline_Chest_Press/1.jpg"
    ]
  },
  {
    "id": "local-416",
    "name": "Leverage High Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Load an appropriate weight onto the pins and adjust the seat height so that you can just reach the handles above you. Adjust the knee pad to help keep you down. Grasp the handles with a pronated grip. This will be your starting position.",
    "rationale": "Pull the handles towards your torso, retracting your shoulder blades as you flex the elbow.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_High_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_High_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_High_Row/1.jpg"
    ]
  },
  {
    "id": "local-417",
    "name": "Leverage Incline Chest Press",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Load an appropriate weight onto the pins and adjust the seat for your height. The handles should be near the top of the pectorals at the beginning of the motion. Your chest and head should be up and your shoulder blades retracted. This will be your starting position.",
    "rationale": "Press the handles forward by extending through the elbow.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/1.jpg"
    ]
  },
  {
    "id": "local-418",
    "name": "Leverage Iso Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Load an appropriate weight onto the pins and adjust the seat height so that the handles are at chest level. Grasp the handles with either a neutral or pronated grip. This will be your starting position.",
    "rationale": "Pull the handles towards your torso, retracting your shoulder blades as you flex the elbow.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/1.jpg"
    ]
  },
  {
    "id": "local-419",
    "name": "Leverage Shoulder Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Load an appropriate weight onto the pins and adjust the seat for your height. The handles should be near the top of the shoulders at the beginning of the motion. Your chest and head should be up and handles held with a pronated grip. This will be your starting position.",
    "rationale": "Press the handles upward by extending through the elbow.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/1.jpg"
    ]
  },
  {
    "id": "local-420",
    "name": "Leverage Shrug",
    "muscle_group": "Other",
    "tier": "S",
    "focus": "Strength",
    "cue": "Load the pins to an appropriate weight. Position yourself directly between the handles.",
    "rationale": "Grasp the top handles with a comfortable grip, and then lower your hips as you take a breath. Look forward with your head and keep your chest up.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shrug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shrug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shrug/1.jpg"
    ]
  },
  {
    "id": "local-421",
    "name": "Linear 3-Part Start Technique",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "This drill helps you accelerate as quickly as possible into a sprint from a dead stop. It helps to use a line to start from. Begin with two feet on the line. Place your left foot with the toe next to your right ankle. Place your right foot 4-6 inches behind the left.",
    "rationale": "Place your right hand onto the line, and thing bring your nose close to your left knee.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_3-Part_Start_Technique/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_3-Part_Start_Technique/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_3-Part_Start_Technique/1.jpg"
    ]
  },
  {
    "id": "local-422",
    "name": "Linear Acceleration Wall Drill",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Lean at around 45 degrees against a wall. Your feet should be together, glutes contracted.",
    "rationale": "Begin by lifting your right knee quickly, pausing, and then driving it straight down into the ground.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_Acceleration_Wall_Drill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_Acceleration_Wall_Drill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_Acceleration_Wall_Drill/1.jpg"
    ]
  },
  {
    "id": "local-423",
    "name": "Linear Depth Jump",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "You will need two boxes or benches spaced a few feet away from each other. Begin by standing on one box facing towards the other platform.",
    "rationale": "To initiate the movement, gently drop down to the ground between your platforms, allowing the knees and hips to flex.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_Depth_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_Depth_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Linear_Depth_Jump/1.jpg"
    ]
  },
  {
    "id": "local-424",
    "name": "Log Lift",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strongman",
    "cue": "Begin standing with the log in front of you. Grasp the handles, and begin to clean the log. As you are bent over to start the clean, attempt to get the log as high as possible, pulling it into your chest. Extend through the hips and knees to bring it up to complete the clean.",
    "rationale": "Push your head back and look up, creating a shelf on your chest to rest the log. Begin the press by dipping, flexing slightly through the knees and reversing the motion. This push press will generate momentum to start the log moving vertically. Continue by extending through the elbows to press the log above your head. There are no strict rules on form, so use whatever techniques you are most efficient with. As the log is pressed, ensure that you push your head through on each repetition, looking forward.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Log_Lift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Log_Lift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Log_Lift/1.jpg"
    ]
  },
  {
    "id": "local-425",
    "name": "London Bridges",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Attach a climbing rope to a high beam or cross member. Below it, ensure that the smith machine bar is locked in place with the safeties and cannot move. Alternatively, a secure box could also be utilized.",
    "rationale": "Stand on the bar, using the rope to balance yourself. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/London_Bridges/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/London_Bridges/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/London_Bridges/1.jpg"
    ]
  },
  {
    "id": "local-426",
    "name": "Looking At Ceiling",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Kneel on the floor, holding your heels with both hands.",
    "rationale": "Lift your buttocks up and forward while bringing your head back to look up at the ceiling, to give an arch in your back.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Looking_At_Ceiling/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Looking_At_Ceiling/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Looking_At_Ceiling/1.jpg"
    ]
  },
  {
    "id": "local-427",
    "name": "Low Cable Crossover",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "To move into the starting position, place the pulleys at the low position, select the resistance to be used and grasp a handle in each hand.",
    "rationale": "Step forward, gaining tension in the pulleys. Your palms should be facing forward, hands below the waist, and your arms straight. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/1.jpg"
    ]
  },
  {
    "id": "local-428",
    "name": "Low Cable Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Select the desired weight and lay down face up on the bench of a seated row machine that has a rope attached to it. Your head should be pointing towards the attachment.",
    "rationale": "Grab the outside of the rope ends with your palms facing each other (neutral grip).",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-429",
    "name": "Low Pulley Row To Neck",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit on a low pulley row machine with a rope attachment.",
    "rationale": "Grab the ends of the rope using a palms-down grip and sit with your back straight and your knees slightly bent. Tip: Keep your back almost completely vertical and your arms fully extended in front of you. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Pulley_Row_To_Neck/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Pulley_Row_To_Neck/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Pulley_Row_To_Neck/1.jpg"
    ]
  },
  {
    "id": "local-430",
    "name": "Lower Back-SMR",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Stretching",
    "cue": "In a seated position, place a foam roll under your lower back. Cross your arms in front of you and protract your shoulders. This will be your starting position.",
    "rationale": "Raise your hips off of the floor and lean back, keeping your weight on your lower back. Now shift your weight slightly to one side, keeping your weight off of the spine and on the muscles to the side of it. Roll over your lower back, holding points of tension for 10-30 seconds. Repeat on the other side.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lower_Back-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lower_Back-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lower_Back-SMR/1.jpg"
    ]
  },
  {
    "id": "local-431",
    "name": "Lower Back Curl",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie on your stomach with your arms out to your sides. This will be your starting position.",
    "rationale": "Using your lower back muscles, extend your spine lifting your chest off of the ground. Do not use your arms to push yourself up. Keep your head up during the movement. Repeat for 10-20 repetitions.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lower_Back_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lower_Back_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lower_Back_Curl/1.jpg"
    ]
  },
  {
    "id": "local-432",
    "name": "Lunge Pass Through",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand with your torso upright holding a kettlebell in your right hand. This will be your starting position.",
    "rationale": "Step forward with your left foot and lower your upper body down by flexing the hip and the knee, keeping the torso upright. Lower your back knee until it nearly touches the ground.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Pass_Through/1.jpg"
    ]
  },
  {
    "id": "local-433",
    "name": "Lunge Sprint",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust a bar in a Smith machine to an appropriate height. Position yourself under the bar, racking it across the back of your shoulders. Unrack the bar, and then split your feet, moving one foot forward and one foot back. This will be your starting position.",
    "rationale": "Lower your back knee nearly to the ground, flexing the knees and lowering your hips as you do so.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge_Sprint/1.jpg"
    ]
  },
  {
    "id": "local-434",
    "name": "Lying Bent Leg Groin",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie on your back with your knees bent and the soles of the feet pressed together. Have your partner hold your knees. This will be your starting position.",
    "rationale": "Attempt to squeeze your knees together, while your partner prevents any movement from occurring.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Bent_Leg_Groin/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Bent_Leg_Groin/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Bent_Leg_Groin/1.jpg"
    ]
  },
  {
    "id": "local-435",
    "name": "Lying Cable Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Grab a straight bar or E-Z bar attachment that is attached to the low pulley with both hands, using an underhand (palms facing up) shoulder-width grip.",
    "rationale": "Lie flat on your back on top of an exercise mat in front of the weight stack with your feet flat against the frame of the pulley machine and your legs straight.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cable_Curl/1.jpg"
    ]
  },
  {
    "id": "local-436",
    "name": "Lying Cambered Barbell Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a cambered bar underneath an exercise bench.",
    "rationale": "Lie face down on the exercise bench and grab the bar using a palms down (pronated grip) that is wider than shoulder width. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cambered_Barbell_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cambered_Barbell_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Cambered_Barbell_Row/1.jpg"
    ]
  },
  {
    "id": "local-437",
    "name": "Lying Close-Grip Bar Curl On High Pulley",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a flat bench in front of a high pulley or lat pulldown machine.",
    "rationale": "Hold the straight bar attachment using an underhand grip (palms up) that is about shoulder width.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Bar_Curl_On_High_Pulley/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Bar_Curl_On_High_Pulley/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Bar_Curl_On_High_Pulley/1.jpg"
    ]
  },
  {
    "id": "local-438",
    "name": "Lying Close-Grip Barbell Triceps Extension Behind The Head",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "While holding a barbell or EZ Curl bar with a pronated grip (palms facing forward), lie on your back on a flat bench with your head close to the end of the bench. Tip: If you are holding a barbell grab it using a shoulder-width grip and if you are using an E-Z Bar grab it on the inner handles.",
    "rationale": "Extend your arms in front of you and slowly bring the bar back in a semi circular motion (while keeping the arms extended) to a position over your head. At the end of this step your arms should be overhead and parallel to the floor. This will be your starting position. Tip: Keep your elbows in at all times.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head/1.jpg"
    ]
  },
  {
    "id": "local-439",
    "name": "Lying Close-Grip Barbell Triceps Press To Chin",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "While holding a barbell or EZ Curl bar with a pronated grip (palms facing forward), lie on your back on a flat bench with your head off the end of the bench. Tip: If you are holding a barbell grab it using a shoulder-width grip and if you are using an E-Z Bar grab it on the inner handles.",
    "rationale": "Extend your arms in front of you as you hold the barbell over your chest. The arms should be perpendicular to your torso (90-degree angle). This will be your starting position.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Press_To_Chin/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Press_To_Chin/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Close-Grip_Barbell_Triceps_Press_To_Chin/1.jpg"
    ]
  },
  {
    "id": "local-440",
    "name": "Lying Crossover",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Lie on your back with your legs extended.",
    "rationale": "Cross one leg over your body with the knee bent, attempting to touch the knee to the ground. Your partner should kneel beside you, holding your shoulder down with one hand and controlling the crossed leg with the other. this will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Crossover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Crossover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Crossover/1.jpg"
    ]
  },
  {
    "id": "local-441",
    "name": "Lying Dumbbell Tricep Extension",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie on a flat bench while holding two dumbbells directly in front of you. Your arms should be fully extended at a 90-degree angle from your torso and the floor. The palms should be facing in and the elbows should be tucked in. This is the starting position.",
    "rationale": "As you breathe in and you keep the upper arms stationary with the elbows in, slowly lower the weight until the dumbbells are near your ears.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Dumbbell_Tricep_Extension/1.jpg"
    ]
  },
  {
    "id": "local-442",
    "name": "Lying Face Down Plate Neck Resistance",
    "muscle_group": "Neck",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie face down with your whole body straight on a flat bench while holding a weight plate behind your head. Tip: You will need to position yourself so that your shoulders are slightly above the end of a flat bench in order for the upper chest, neck and face to be off the bench. This will be your starting position.",
    "rationale": "While keeping the plate secure on the back of your head slowly lower your head (as in saying \"yes\") as you breathe in.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Down_Plate_Neck_Resistance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Down_Plate_Neck_Resistance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Down_Plate_Neck_Resistance/1.jpg"
    ]
  },
  {
    "id": "local-443",
    "name": "Lying Face Up Plate Neck Resistance",
    "muscle_group": "Neck",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie face up with your whole body straight on a flat bench while holding a weight plate on top of your forehead. Tip: You will need to position yourself so that your shoulders are slightly above the end of a flat bench in order for the traps, neck and head to be off the bench. This will be your starting position.",
    "rationale": "While keeping the plate secure on your forehead slowly lower your head back in a semi-circular motion as you breathe in.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Up_Plate_Neck_Resistance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Up_Plate_Neck_Resistance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Face_Up_Plate_Neck_Resistance/1.jpg"
    ]
  },
  {
    "id": "local-444",
    "name": "Lying Glute",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Lie on your back with your partner kneeling beside you.",
    "rationale": "Flex the hip of one leg, raising it off of the floor. Rotate the leg so the foot is over the opposite hip, the lower leg perpendicular to your body. Your partner should hold the knee and ankle in place. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Glute/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Glute/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Glute/1.jpg"
    ]
  },
  {
    "id": "local-445",
    "name": "Lying Hamstring",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Lie on your back with your legs extended. Your partner should be kneeling beside you. Raise one leg up towards the ceiling and have your partner hold the ankle. Your partner can use their shoulder to brace your leg if necessary. This will be your starting position.",
    "rationale": "With your partner holding your leg in place, attempt to flex the knee, contracting the hamstrings for 10-20 seconds.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Hamstring/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Hamstring/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Hamstring/1.jpg"
    ]
  },
  {
    "id": "local-446",
    "name": "Lying High Bench Barbell Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie face forward on a tall flat bench while holding a barbell with a supinated grip (palms facing up). Tip: If you are holding a barbell grab it using a shoulder-width grip and if you are using an E-Z Bar grab it on the inner handles. Your upper body should be positioned in a way that the upper chest is over the end of the bench and the barbell is hanging in front of you with the arms extended and perpendicular to the floor. This will be your starting position.",
    "rationale": "While keeping the elbows in and the upper arms stationary, curl the weight up in a semi-circular motion as you contract the biceps and exhale. Hold at the top of the movement for a second.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_High_Bench_Barbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_High_Bench_Barbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_High_Bench_Barbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-447",
    "name": "Lying Leg Curls",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Adjust the machine lever to fit your height and lie face down on the leg curl machine with the pad of the lever on the back of your legs (just a few inches under the calves). Tip: Preferably use a leg curl machine that is angled as opposed to flat since an angled position is more favorable for hamstrings recruitment.",
    "rationale": "Keeping the torso flat on the bench, ensure your legs are fully stretched and grab the side handles of the machine. Position your toes straight (or you can also use any of the other two stances described on the foot positioning section). This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/1.jpg"
    ]
  },
  {
    "id": "local-448",
    "name": "Lying Machine Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the leg machine to a height that will allow you to get inside it with your knees bent and the thighs slightly below parallel.",
    "rationale": "Once you select the weight, position yourself inside the machine face up with the knees bent and thighs slightly below parallel to the platform. Make sure that the knees do not go past the toes. The angle created between the hamstrings and the calves should be one that is slightly less than 90 degrees (since your starting position requires you to start slightly below parallel). Your back and your head should be resting on the machine while your shoulders are pressed under the shoulder pads.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Machine_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Machine_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Machine_Squat/1.jpg"
    ]
  },
  {
    "id": "local-449",
    "name": "Lying One-Arm Lateral Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "While holding a dumbbell in one hand, lay with your chest down on a flat bench. The other hand can be used to hold to the leg of the bench for stability.",
    "rationale": "Position the palm of the hand that is holding the dumbbell in a neutral manner (palms facing your torso) as you keep the arm extended with the elbow slightly bent. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_One-Arm_Lateral_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_One-Arm_Lateral_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_One-Arm_Lateral_Raise/1.jpg"
    ]
  },
  {
    "id": "local-450",
    "name": "Lying Prone Quadriceps",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Lay face down on the floor with your partner kneeling beside you. Flex one knee and raise that leg off the ground, attempting to touch your glutes with your foot. Your partner should hold the knee and ankle. This will be your starting position.",
    "rationale": "Attempt to extend your knee while your partner prevents any actual movement.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Prone_Quadriceps/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Prone_Quadriceps/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Prone_Quadriceps/1.jpg"
    ]
  },
  {
    "id": "local-451",
    "name": "Lying Rear Delt Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "While holding a dumbbell in each hand, lay with your chest down on a flat bench.",
    "rationale": "Position the palms of the hands in a neutral manner (palms facing your torso) as you keep the arms extended with the elbows slightly bent. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Rear_Delt_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Rear_Delt_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Rear_Delt_Raise/1.jpg"
    ]
  },
  {
    "id": "local-452",
    "name": "Lying Supine Dumbbell Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on a flat bench face up while holding a dumbbell in each arm on top of your thighs.",
    "rationale": "Bring the dumbbells to the sides with the arms extended and the palms of the hands facing your thighs (neutral grip).",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Supine_Dumbbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Supine_Dumbbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Supine_Dumbbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-453",
    "name": "Lying T-Bar Row",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Load up the T-bar Row Machine with the desired weight and adjust the leg height so that your upper chest is at the top of the pad. Tip: In some machines all you can do is stand on the appropriate step that allows you to be at a height that has the upper chest at the top of the pad.",
    "rationale": "Lay face down on the pad and grab the handles. You can either use a palms down, palms up, or palms in position depending on what part of your back you want to emphasize.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/1.jpg"
    ]
  },
  {
    "id": "local-454",
    "name": "Lying Triceps Press",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on a flat bench with either an e-z bar (my preference) or a straight bar placed on the floor behind your head and your feet on the floor.",
    "rationale": "Grab the bar behind you, using a medium overhand (pronated) grip, and raise the bar in front of you at arms length. Tip: The arms should be perpendicular to the torso and the floor. The elbows should be tucked in. This is the starting position.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/1.jpg"
    ]
  },
  {
    "id": "local-455",
    "name": "Machine Bench Press",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit down on the Chest Press Machine and select the weight.",
    "rationale": "Step on the lever provided by the machine since it will help you to bring the handles forward so that you can grab the handles and fully extend the arms.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-456",
    "name": "Machine Bicep Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Adjust the seat to the appropriate height and make your weight selection. Place your upper arms against the pads and grasp the handles. This will be your starting position.",
    "rationale": "Perform the movement by flexing the elbow, pulling your lower arm towards your upper arm.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/1.jpg"
    ]
  },
  {
    "id": "local-457",
    "name": "Machine Preacher Curls",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit down on the Preacher Curl Machine and select the weight.",
    "rationale": "Place the back of your upper arms (your triceps) on the preacher pad provided and grab the handles using an underhand grip (palms facing up). Tip: Make sure that when you place the arms on the pad you keep the elbows in. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Preacher_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Preacher_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Preacher_Curls/1.jpg"
    ]
  },
  {
    "id": "local-458",
    "name": "Machine Shoulder (Military) Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit down on the Shoulder Press Machine and select the weight.",
    "rationale": "Grab the handles to your sides as you keep the elbows bent and in line with your torso. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/1.jpg"
    ]
  },
  {
    "id": "local-459",
    "name": "Machine Triceps Extension",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Adjust the seat to the appropriate height and make your weight selection. Place your upper arms against the pads and grasp the handles. This will be your starting position.",
    "rationale": "Perform the movement by extending the elbow, pulling your lower arm away from your upper arm.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-460",
    "name": "Medicine Ball Chest Pass",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "You will need a partner for this exercise. Lacking one, this movement can be performed against a wall.",
    "rationale": "Begin facing your partner holding the medicine ball at your torso with both hands.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Chest_Pass/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Chest_Pass/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Chest_Pass/1.jpg"
    ]
  },
  {
    "id": "local-461",
    "name": "Medicine Ball Full Twist",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "For this exercise you will need a medicine ball and a partner. Stand back to back with your partner, spaced 2-3 feet apart. This will be your starting position.",
    "rationale": "Hold the ball in front of the trunk. Open the hips and turn the shoulders at the same time as your partner.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Full_Twist/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Full_Twist/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Full_Twist/1.jpg"
    ]
  },
  {
    "id": "local-462",
    "name": "Medicine Ball Scoop Throw",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Assume a semisquat stance with a medicine ball in your hands. Your arms should hang so the ball is near your feet.",
    "rationale": "Begin by thrusting the hips forward as you extend through the legs, jumping up.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Scoop_Throw/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Scoop_Throw/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Scoop_Throw/1.jpg"
    ]
  },
  {
    "id": "local-463",
    "name": "Middle Back Shrug",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie facedown on an incline bench while holding a dumbbell in each hand. Your arms should be fully extended hanging down and pointing towards the floor. The palms of your hands should be facing each other. This will be your starting position.",
    "rationale": "As you exhale, squeeze your shoulder blades together and hold the contraction for a full second. Tip: This movement is just like the reverse action of a hug, or trying to perform rear laterals as if you had no arms.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Shrug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Shrug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Shrug/1.jpg"
    ]
  },
  {
    "id": "local-464",
    "name": "Middle Back Stretch",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand so your feet are shoulder width apart and your hands are on your hips.",
    "rationale": "Twist at your waist until you feel a stretch. Hold for 10 to 15 seconds, then twist to the other side.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Middle_Back_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-465",
    "name": "Mixed Grip Chin",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Using a spacing that is just about 1 inch wider than shoulder width, grab a pull-up bar with the palms of one hand facing forward and the palms of the other hand facing towards you. This will be your starting position.",
    "rationale": "Now start to pull yourself up as you exhale. Tip: With the arm that has the palms facing up concentrate on using the back muscles in order to perform the movement. The elbow of that arm should remain close to the torso. With the other arm that has the palms facing forward, the elbows will be away but in line with the torso. You will concentrate on using the lats to pull your body up.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mixed_Grip_Chin/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mixed_Grip_Chin/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mixed_Grip_Chin/1.jpg"
    ]
  },
  {
    "id": "local-466",
    "name": "Monster Walk",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a band around both ankles and another around both knees. There should be enough tension that they are tight when your feet are shoulder width apart.",
    "rationale": "To begin, take short steps forward alternating your left and right foot.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Monster_Walk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Monster_Walk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Monster_Walk/1.jpg"
    ]
  },
  {
    "id": "local-467",
    "name": "Mountain Climbers",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Begin in a pushup position, with your weight supported by your hands and toes. Flexing the knee and hip, bring one leg until the knee is approximately under the hip. This will be your starting position.",
    "rationale": "Explosively reverse the positions of your legs, extending the bent leg until the leg is straight and supported by the toe, and bringing the other foot up with the hip and knee flexed. Repeat in an alternating fashion for 20-30 seconds.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/1.jpg"
    ]
  },
  {
    "id": "local-468",
    "name": "Moving Claw Series",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "This move helps prepare your running form to help you excel at sprinting. As you run, be sure to flex the knee, aiming to kick your glutes as the hip extends.",
    "rationale": "Reload the quad as the leg moves back forward, attacking the ground on the next step.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Moving_Claw_Series/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Moving_Claw_Series/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Moving_Claw_Series/1.jpg"
    ]
  },
  {
    "id": "local-469",
    "name": "Muscle Snatch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a loaded barbell held at the mid thigh position with a wide grip. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar. This will be the starting position.",
    "rationale": "Begin the pull by driving through the front of the heels, raising the bar. Transition into the second pull by extending through the hips knees and ankles, driving the bar up as quickly as possible. The bar should be close to the body.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Snatch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Snatch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Snatch/1.jpg"
    ]
  },
  {
    "id": "local-470",
    "name": "Muscle Up",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Grip the rings using a false grip, with the base of your palms on top of the rings. Initiate a pull up by pulling the elbows down to your side, flexing the elbows.",
    "rationale": "As you reach the top position of the pull-up, pull the rings to your armpits as you roll your shoulders forward, allowing your elbows to move straight back behind you. This puts you into the proper position to continue into the dip portion of the movement.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Up/1.jpg"
    ]
  },
  {
    "id": "local-471",
    "name": "Narrow Stance Hack Squats",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place the back of your torso against the back pad of the machine and hook your shoulders under the shoulder pads provided.",
    "rationale": "Position your legs in the platform using a less than shoulder width narrow stance with the toes slightly pointed out. Your feet should be around 3 inches or less apart. Tip: Keep your head up at all times and also maintain the back on the pad at all times.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Hack_Squats/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Hack_Squats/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Hack_Squats/1.jpg"
    ]
  },
  {
    "id": "local-472",
    "name": "Narrow Stance Leg Press",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a less-than-shoulder-width narrow stance with the toes slightly pointed out. Your feet should be around 3 inches or less apart. Tip: Keep your head up at all times and also maintain the back on the pad at all times.",
    "rationale": "Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of you. Tip: Make sure that you do not lock your knees. Your torso and the legs should make a perfect 90-degree angle. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Leg_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Leg_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Leg_Press/1.jpg"
    ]
  },
  {
    "id": "local-473",
    "name": "Narrow Stance Squats",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Squats/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Squats/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Narrow_Stance_Squats/1.jpg"
    ]
  },
  {
    "id": "local-474",
    "name": "Natural Glute Ham Raise",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Using the leg pad of a lat pulldown machine or a preacher bench, position yourself so that your ankles are under the pads, knees on the seat, and you are facing away from the machine. You should be upright and maintaining good posture.",
    "rationale": "This will be your starting position. Lower yourself under control until your knees are almost completely straight.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Natural_Glute_Ham_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Natural_Glute_Ham_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Natural_Glute_Ham_Raise/1.jpg"
    ]
  },
  {
    "id": "local-475",
    "name": "Neck-SMR",
    "muscle_group": "Neck",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Using a muscle roller or a rolling pin, place the roller behind your head and against your neck. Make sure that you do not place the roller directly against the spine, but turned slightly so that the roller is pressed against the muscles to either side of the spine. This will be your starting position.",
    "rationale": "Starting at the top of your neck, slowly roll down the muscles of your neck, pausing at points of tension for 10-30 seconds.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck-SMR/1.jpg"
    ]
  },
  {
    "id": "local-476",
    "name": "Neck Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie back on a flat bench. Using a medium-width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over your neck with your arms locked. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on your neck.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Neck_Press/1.jpg"
    ]
  },
  {
    "id": "local-477",
    "name": "Oblique Crunches",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie flat on the floor with your lower back pressed to the ground. For this exercise, you will need to put one hand beside your head and the other to the side against the floor.",
    "rationale": "Make sure your feet are elevated and resting on a flat surface.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches/1.jpg"
    ]
  },
  {
    "id": "local-478",
    "name": "Oblique Crunches - On The Floor",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start out by lying on your right side with your legs lying on top of each other. Make sure your knees are bent a little bit.",
    "rationale": "Place your left hand behind your head.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches_-_On_The_Floor/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches_-_On_The_Floor/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches_-_On_The_Floor/1.jpg"
    ]
  },
  {
    "id": "local-479",
    "name": "Olympic Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a barbell supported on top of the traps. The chest should be up, and the head facing forward. Adopt a hip width stance with the feet turned out as needed.",
    "rationale": "Descend by flexing the knees, refraining from moving the hips back as much as possible. This requires that the knees travel forward; ensure that they stay aligned with the feet. The goal is to keep the torso as upright as possible. Continue all the way down, keeping the weight on the front of the heel.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Olympic_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Olympic_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Olympic_Squat/1.jpg"
    ]
  },
  {
    "id": "local-480",
    "name": "On-Your-Back Quad Stretch",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Lie on a flat bench or step, and hang one leg and arm over the side.",
    "rationale": "Bend the knee and hold the top of the foot. As you do this, be careful not to arch your lower back.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/On-Your-Back_Quad_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/On-Your-Back_Quad_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/On-Your-Back_Quad_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-481",
    "name": "On Your Side Quad Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Start off by lying on your right side, with your right knee bent at a 90-degree angle resting on the floor in front of you (this stabilizes the torso).",
    "rationale": "Bend your left knee behind you and hold your left foot with your left hand. To stretch your hip flexor, press your left hip forward as you push your left foot back into your hand. Switch sides.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/On_Your_Side_Quad_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/On_Your_Side_Quad_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/On_Your_Side_Quad_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-482",
    "name": "One-Arm Dumbbell Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Choose a flat bench and place a dumbbell on each side of it.",
    "rationale": "Place the right leg on top of the end of the bench, bend your torso forward from the waist until your upper body is parallel to the floor, and place your right hand on the other end of the bench for support.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/1.jpg"
    ]
  },
  {
    "id": "local-483",
    "name": "One-Arm Flat Bench Dumbbell Flye",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie down on a flat bench with a dumbbell in one hand resting on top of your thigh. The palm of your hand with the dumbbell in it should be at a neutral grip.",
    "rationale": "By using your thighs to help you get the dumbbell up, clean the dumbbell so that you can hold it in front of you with your lifting arm being fully extended. Remember to maintain a neutral grip with this exercise. Your non lifting hand should be to the side holding the flat bench for better support. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Flat_Bench_Dumbbell_Flye/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Flat_Bench_Dumbbell_Flye/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Flat_Bench_Dumbbell_Flye/1.jpg"
    ]
  },
  {
    "id": "local-484",
    "name": "One-Arm High-Pulley Cable Side Bends",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Connect a standard handle to a tower. Move cable to highest pulley position.",
    "rationale": "Stand with side to cable. With one hand, reach up and grab handle with underhand grip.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_High-Pulley_Cable_Side_Bends/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_High-Pulley_Cable_Side_Bends/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_High-Pulley_Cable_Side_Bends/1.jpg"
    ]
  },
  {
    "id": "local-485",
    "name": "One-Arm Incline Lateral Raise",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie down sideways on an incline bench press with a dumbbell in the hand. Make sure the shoulder is pressing against the incline bench and the arm is lying across your body with the palm around your navel.",
    "rationale": "Hold a dumbbell in your uppermost arm while keeping it extended in front of you parallel to the floor. This is your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Incline_Lateral_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Incline_Lateral_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Incline_Lateral_Raise/1.jpg"
    ]
  },
  {
    "id": "local-486",
    "name": "One-Arm Kettlebell Clean",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a kettlebell between your feet. As you bend down to grab the kettlebell, push your butt back and keep your eyes looking forward.",
    "rationale": "Clean the kettlebell to your shoulders by extending through the legs and hips as you raise the kettlebell towards your shoulder. The wrist should rotate as you do so.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Clean/1.jpg"
    ]
  },
  {
    "id": "local-487",
    "name": "One-Arm Kettlebell Clean and Jerk",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a kettlebell by the handle.",
    "rationale": "Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulder. Rotate your wrist as you do so, so that the palm faces forward.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Clean_and_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Clean_and_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Clean_and_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-488",
    "name": "One-Arm Kettlebell Floor Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on the floor holding a kettlebell with one hand, with your upper arm supported by the floor. The palm should be facing in.",
    "rationale": "Press the kettlebell straight up toward the ceiling, rotating your wrist.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Floor_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Floor_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Floor_Press/1.jpg"
    ]
  },
  {
    "id": "local-489",
    "name": "One-Arm Kettlebell Jerk",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hold a kettlebell by the handle. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulder. Rotate your wrist as you do so, so that the palm faces forward. This will be your starting position.",
    "rationale": "Dip your body by bending the knees, keeping your torso upright.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-490",
    "name": "One-Arm Kettlebell Military Press To The Side",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Clean a kettlebell to your shoulder. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulder. Rotate your wrist as you do so, so that the palm faces inward. This will be your starting position.",
    "rationale": "Look at the kettlebell and press it up and out until it is locked out overhead.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Military_Press_To_The_Side/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Military_Press_To_The_Side/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Military_Press_To_The_Side/1.jpg"
    ]
  },
  {
    "id": "local-491",
    "name": "One-Arm Kettlebell Para Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Clean a kettlebell to your shoulder. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulder. Rotate your wrist as you do so, so that the palm faces forward. This will be your starting position.",
    "rationale": "Hold the kettlebell with the elbow out to the side, and press it up and out until it is locked out overhead.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Para_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Para_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Para_Press/1.jpg"
    ]
  },
  {
    "id": "local-492",
    "name": "One-Arm Kettlebell Push Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hold a kettlebell by the handle. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulder. Rotate your wrist as you do so, so that the palm faces forward. This will be your starting position.",
    "rationale": "Dip your body by bending the knees, keeping your torso upright.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Push_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Push_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Push_Press/1.jpg"
    ]
  },
  {
    "id": "local-493",
    "name": "One-Arm Kettlebell Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a kettlebell in front of your feet. Bend your knees slightly and then push your butt out as much as possible as you bend over to get in the starting position. Grab the kettlebell and pull it to your stomach, retracting your shoulder blade and flexing the elbow. Keep your back straight. Lower and repeat.",
    "rationale": "Targets middle back.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Row/1.jpg"
    ]
  },
  {
    "id": "local-494",
    "name": "One-Arm Kettlebell Snatch",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a kettlebell between your feet. Bend your knees and push your butt back to get in the proper starting position.",
    "rationale": "Look straight ahead and swing the kettlebell back between your legs.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Snatch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Snatch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Snatch/1.jpg"
    ]
  },
  {
    "id": "local-495",
    "name": "One-Arm Kettlebell Split Jerk",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Hold a kettlebell by the handle. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulder. Rotate your wrist as you do so, so that the palm faces forward. This will be your starting position.",
    "rationale": "Dip your body by bending the knees, keeping your torso upright.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Split_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Split_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Split_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-496",
    "name": "One-Arm Kettlebell Split Snatch",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a kettlebell in one hand by the handle.",
    "rationale": "Squat towards the floor, and then reverse the motion, extending the hips, knees, and finally the ankles, to raise the kettlebell overhead.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Split_Snatch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Split_Snatch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Split_Snatch/1.jpg"
    ]
  },
  {
    "id": "local-497",
    "name": "One-Arm Kettlebell Swings",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Maintain proper form and control.",
    "rationale": "Targets hamstrings.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Swings/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Swings/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Swings/1.jpg"
    ]
  },
  {
    "id": "local-498",
    "name": "One-Arm Long Bar Row",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Position a bar into a landmine or in a corner to keep it from moving. Load an appropriate weight onto your end.",
    "rationale": "Stand next to the bar, and take a grip with one hand close to the collar. Using your hips and legs, rise to a standing position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Long_Bar_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Long_Bar_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Long_Bar_Row/1.jpg"
    ]
  },
  {
    "id": "local-499",
    "name": "One-Arm Medicine Ball Slam",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start in a standing position with a staggered, athletic stance. Hold a medicine ball in one hand, on the same side as your back leg. This will be your starting position.",
    "rationale": "Begin by winding the arm, raising the medicine ball above your head. As you do so, extend through the hips, knees, and ankles to load up for the slam.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Medicine_Ball_Slam/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Medicine_Ball_Slam/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Medicine_Ball_Slam/1.jpg"
    ]
  },
  {
    "id": "local-500",
    "name": "One-Arm Open Palm Kettlebell Clean",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Place one kettlebell between your feet.",
    "rationale": "Grab the handle with one hand and raise the kettlebell rapidly, let it flip so that the ball of the kettlebell lands in the palm of your hand.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Open_Palm_Kettlebell_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Open_Palm_Kettlebell_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Open_Palm_Kettlebell_Clean/1.jpg"
    ]
  },
  {
    "id": "local-501",
    "name": "One-Arm Overhead Kettlebell Squats",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Clean and press a kettlebell with one arm. Clean the kettlebell to your shoulder by extending through the legs and hips as you pull the kettlebell towards your shoulder. Rotate your wrist as you do so. Press the weight overhead by extending through the elbow.This will be your starting position.",
    "rationale": "Looking straight ahead and keeping a kettlebell locked out above you, flex the knees and hips and lower your torso between your legs, keeping your head and chest up.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Overhead_Kettlebell_Squats/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Overhead_Kettlebell_Squats/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Overhead_Kettlebell_Squats/1.jpg"
    ]
  },
  {
    "id": "local-502",
    "name": "One-Arm Side Deadlift",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand to the side of a barbell next to its center. Bend your knees and lower your body until you are able to reach the barbell.",
    "rationale": "Grasp the bar as if you were grabbing a briefcase (palms facing you since the bar is sideways). You may need a wrist wrap if you are using a significant amount of weight. This is your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Side_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Side_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Side_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-503",
    "name": "One-Arm Side Laterals",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Pick a dumbbell and place it in one of your hands. Your non lifting hand should be used to grab something steady such as an incline bench press. Lean towards your lifting arm and away from the hand that is gripping the incline bench as this will allow you to keep your balance.",
    "rationale": "Stand with a straight torso and have the dumbbell by your side at arm's length with the palm of the hand facing you. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Side_Laterals/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Side_Laterals/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Side_Laterals/1.jpg"
    ]
  },
  {
    "id": "local-504",
    "name": "One-Legged Cable Kickback",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hook a leather ankle cuff to a low cable pulley and then attach the cuff to your ankle.",
    "rationale": "Face the weight stack from a distance of about two feet, grasping the steel frame for support.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/1.jpg"
    ]
  },
  {
    "id": "local-505",
    "name": "One Arm Against Wall",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Stretching",
    "cue": "From a standing position, place a bent arm against a wall or doorway.",
    "rationale": "Slowly lean toward your arm until you feel a stretch in your lats.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Against_Wall/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Against_Wall/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Against_Wall/1.jpg"
    ]
  },
  {
    "id": "local-506",
    "name": "One Arm Chin-Up",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "For this exercise, start out by placing a towel around a chin up bar.",
    "rationale": "Grab the chin-up bar with your palm facing you. One hand will be grabbing the chin-up bar and the other will be grabbing the towel.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Chin-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Chin-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Chin-Up/1.jpg"
    ]
  },
  {
    "id": "local-507",
    "name": "One Arm Dumbbell Bench Press",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie down on a flat bench with a dumbbell in one hand on top of your thigh.",
    "rationale": "By using your thigh to help you get the dumbbell up, clean the dumbbell up so that you can hold it in front of you at shoulder width. Use the hand you are not lifting with to help position the dumbbell over you properly.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-508",
    "name": "One Arm Dumbbell Preacher Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab a dumbbell with the right arm and place the upper arm on top of the preacher bench or the incline bench. The dumbbell should be held at shoulder length. This will be your starting position.",
    "rationale": "As you breathe in, slowly lower the dumbbell until your upper arm is extended and the biceps is fully stretched.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Dumbbell_Preacher_Curl/1.jpg"
    ]
  },
  {
    "id": "local-509",
    "name": "One Arm Floor Press",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on a flat surface with your back pressing against the floor or an exercise mat. Make sure your knees are bent.",
    "rationale": "Have a partner hand you the bar on one hand. When starting, your arm should be just about fully extended, similar to the starting position of a barbell bench press. However, this time your grip will be neutral (palms facing your torso).",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Floor_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Floor_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Floor_Press/1.jpg"
    ]
  },
  {
    "id": "local-510",
    "name": "One Arm Lat Pulldown",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Select an appropriate weight and adjust the knee pad to help keep you down. Grasp the handle with a pronated grip. This will be your starting position.",
    "rationale": "Pull the handle down, squeezing your elbow to your side as you flex the elbow.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Lat_Pulldown/1.jpg"
    ]
  },
  {
    "id": "local-511",
    "name": "One Arm Pronated Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on a bench while holding a dumbbell at arms length. Your arm should be perpendicular to your body. The palm of your hand should be facing towards your feet as a pronated grip is required to perform this exercise.",
    "rationale": "Place your non lifting hand on your bicep for support.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Pronated_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Pronated_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Pronated_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-512",
    "name": "One Arm Supinated Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on a bench while holding a dumbbell at arms length. Your arm should be perpendicular to your body. The palm of your hand should be facing towards your face as a supinated grip is required to perform this exercise.",
    "rationale": "Place your non lifting hand on your bicep for support.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Supinated_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Supinated_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Arm_Supinated_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-513",
    "name": "One Half Locust",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Lie facedown on the floor.",
    "rationale": "Put your left hand under your left hipbone to pad your hip and pubic bone.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Half_Locust/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Half_Locust/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Half_Locust/1.jpg"
    ]
  },
  {
    "id": "local-514",
    "name": "One Handed Hang",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Grab onto a chinup bar with one hand, using a pronated grip. Keep your feet on the floor or a step. Allow the majority of your weight to hang from that hand, while keeping your feet on the ground. Hold for 10-20 seconds and switch sides.",
    "rationale": "Targets lats.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Handed_Hang/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Handed_Hang/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Handed_Hang/1.jpg"
    ]
  },
  {
    "id": "local-515",
    "name": "One Knee To Chest",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Start off by lying on the floor.",
    "rationale": "Extend one leg straight and pull the other knee to your chest. Hold under the knee joint to protect the kneecap.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Knee_To_Chest/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Knee_To_Chest/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Knee_To_Chest/1.jpg"
    ]
  },
  {
    "id": "local-516",
    "name": "One Leg Barbell Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start by standing about 2 to 3 feet in front of a flat bench with your back facing the bench. Have a barbell in front of you on the floor. Tip: Your feet should be shoulder width apart from each other.",
    "rationale": "Bend the knees and use a pronated grip with your hands being wider than shoulder width apart from each other to lift the barbell up until you can rest it on your chest.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Leg_Barbell_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Leg_Barbell_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One_Leg_Barbell_Squat/1.jpg"
    ]
  },
  {
    "id": "local-517",
    "name": "Open Palm Kettlebell Clean",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place one kettlebell between your feet. Clean the kettlebell by extending through the legs and hips as you raise the kettlebell towards your shoulders.",
    "rationale": "Release the kettlebell as it comes up, and let it flip so that the ball of the kettlebell lands in the palms of your hands.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Open_Palm_Kettlebell_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Open_Palm_Kettlebell_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Open_Palm_Kettlebell_Clean/1.jpg"
    ]
  },
  {
    "id": "local-518",
    "name": "Otis-Up",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Secure your feet and lay back on the floor. Your knees should be bent. Hold a weight with both hands to your chest. This will be your starting position.",
    "rationale": "Initiate the movement by flexing the hips and spine to raise your torso up from the ground.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Otis-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Otis-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Otis-Up/1.jpg"
    ]
  },
  {
    "id": "local-519",
    "name": "Overhead Cable Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, set a weight that is comfortable on each side of the pulley machine. Note: Make sure that the amount of weight selected is the same on each side.",
    "rationale": "Now adjust the height of the pulleys on each side and make sure that they are positioned at a height higher than that of your shoulders.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Cable_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Cable_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Cable_Curl/1.jpg"
    ]
  },
  {
    "id": "local-520",
    "name": "Overhead Lat",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Sit upright on the floor with your partner behind you. Raise one arm straight up, and flex the elbow, attempting to touch your hand to your back. Your parner should hold your tricep and wrist. This will be your starting position.",
    "rationale": "Attempt to pull your upper arm to your side as your partner prevents you from doing actually doing so.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Lat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Lat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Lat/1.jpg"
    ]
  },
  {
    "id": "local-521",
    "name": "Overhead Slam",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Hold a medine ball with both hands and stand with your feet at shoulder width. This will be your starting position.",
    "rationale": "Initiate the countermovement by raising the ball above your head and fully extending your body.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Slam/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Slam/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Slam/1.jpg"
    ]
  },
  {
    "id": "local-522",
    "name": "Overhead Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Olympic weightlifting",
    "cue": "Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.",
    "rationale": "Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each other before lifting. Once you are positioned, lift the barbell up until you can rest it on your chest.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Squat/1.jpg"
    ]
  },
  {
    "id": "local-523",
    "name": "Overhead Stretch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Standing straight up, lace your fingers together and open your palms to the ceiling. Keep your shoulders down as you extend your arms up.",
    "rationale": "To create a full torso stretch, pull your tailbone down and stabilize your torso as you do this. Stretch the muscles on both the front and the back of the torso.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-524",
    "name": "Overhead Triceps",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Sit upright on the floor with your partner behind you. Raise one arm straight up, and flex the elbow, attempting to touch your hand to your back. Your parner should hold your elbow and wrist. This will be your starting position.",
    "rationale": "Attempt to extend the arm straight into the air as your partner prevents you from doing actually doing so.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps/1.jpg"
    ]
  },
  {
    "id": "local-525",
    "name": "Pallof Press",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Connect a standard handle to a tower, and—if possible—position the cable to shoulder height. If not, a low pulley will suffice.",
    "rationale": "With your side to the cable, grab the handle with both hands and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press/1.jpg"
    ]
  },
  {
    "id": "local-526",
    "name": "Pallof Press With Rotation",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Connect a standard handle to a tower, and position the cable to shoulder height.",
    "rationale": "With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable. Align outstretched arm with cable.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press_With_Rotation/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press_With_Rotation/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press_With_Rotation/1.jpg"
    ]
  },
  {
    "id": "local-527",
    "name": "Palms-Down Dumbbell Wrist Curl Over A Bench",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start out by placing two dumbbells on one side of a flat bench.",
    "rationale": "Kneel down on both of your knees so that your body is facing the flat bench.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/1.jpg"
    ]
  },
  {
    "id": "local-528",
    "name": "Palms-Down Wrist Curl Over A Bench",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start out by placing a barbell on one side of a flat bench.",
    "rationale": "Kneel down on both of your knees so that your body is facing the flat bench.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/1.jpg"
    ]
  },
  {
    "id": "local-529",
    "name": "Palms-Up Barbell Wrist Curl Over A Bench",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start out by placing a barbell on one side of a flat bench.",
    "rationale": "Kneel down on both of your knees so that your body is facing the flat bench.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/1.jpg"
    ]
  },
  {
    "id": "local-530",
    "name": "Palms-Up Dumbbell Wrist Curl Over A Bench",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Start out by placing two dumbbells on one side of a flat bench.",
    "rationale": "Kneel down on both of your knees so that your body is facing the flat bench.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench/1.jpg"
    ]
  },
  {
    "id": "local-531",
    "name": "Parallel Bar Dip",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand between a set of parallel bars. Place a hand on each bar, and then take a small jump to help you get into the starting position with your arms locked out.",
    "rationale": "Begin by flexing the elbow, lowering your body until your arms break 90 degrees. Avoid swinging, and maintain good posture throughout the descent.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Parallel_Bar_Dip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Parallel_Bar_Dip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Parallel_Bar_Dip/1.jpg"
    ]
  },
  {
    "id": "local-532",
    "name": "Pelvic Tilt Into Bridge",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lie down with your feet on the floor, heels directly under your knees.",
    "rationale": "Lift only your tailbone to the ceiling to stretch your lower back. (Don't lift the entire spine yet.) Pull in your stomach.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pelvic_Tilt_Into_Bridge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pelvic_Tilt_Into_Bridge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pelvic_Tilt_Into_Bridge/1.jpg"
    ]
  },
  {
    "id": "local-533",
    "name": "Peroneals-SMR",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lay on your side, supporting your weight on your forearm and on a foam roller placed on the outside of your lower leg. Your upper leg can either be on top of your lower leg, or you can cross it in front of you. This will be your starting position.",
    "rationale": "Raise your hips off of the ground and begin to roll from below the knee to above the ankle on the side of your leg, pausing at points of tension for 10-30 seconds. Repeat on the other leg.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Peroneals-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Peroneals-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Peroneals-SMR/1.jpg"
    ]
  },
  {
    "id": "local-534",
    "name": "Peroneals Stretch",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "In a seated position, loop a belt, rope, or band around one foot. This will be your starting position.",
    "rationale": "With the leg extended and the heel off of the ground, pull on the belt so that the foot is inverted, with the inside of the foot being pulled towards you. Hold for 10-20 seconds, and then switch sides.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Peroneals_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Peroneals_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Peroneals_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-535",
    "name": "Physioball Hip Bridge",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lay on a ball so that your upper back is on the ball with your hips unsupported. Both feet should be flat on the floor, hip width apart or wider. This will be your starting position.",
    "rationale": "Begin by extending the hips using your glutes and hamstrings, raising your hips upward as you bridge.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Physioball_Hip_Bridge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Physioball_Hip_Bridge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Physioball_Hip_Bridge/1.jpg"
    ]
  },
  {
    "id": "local-536",
    "name": "Pin Presses",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Pin presses remove the eccentric phase of the bench press, developing starting strength. They also allow you to train a desired range of motion.",
    "rationale": "The bench should be set up in a power rack. Set the pins to the desired point in your range of motion, whether it just be lockout or an inch off of your chest. The bar should be moved to the pins and prepared for lifting.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pin_Presses/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pin_Presses/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pin_Presses/1.jpg"
    ]
  },
  {
    "id": "local-537",
    "name": "Piriformis-SMR",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Sit with your buttocks on top of a foam roll. Bend your knees, and then cross one leg so that the ankle is over the knee. This will be your starting position.",
    "rationale": "Shift your weight to the side of the crossed leg, rolling over the buttocks until you feel tension in your upper glute. You may assist the stretch by using one hand to pull the bent knee towards your chest. Hold this position for 10-30 seconds, and then switch sides.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Piriformis-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Piriformis-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Piriformis-SMR/1.jpg"
    ]
  },
  {
    "id": "local-538",
    "name": "Plank",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.",
    "rationale": "Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
    ]
  },
  {
    "id": "local-539",
    "name": "Plate Pinch",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab two wide-rimmed plates and put them together with the smooth sides facing outward",
    "rationale": "Use your fingers to grip the outside part of the plate and your thumb for the other side thus holding both plates together. This is the starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Pinch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Pinch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Pinch/1.jpg"
    ]
  },
  {
    "id": "local-540",
    "name": "Plate Twist",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie down on the floor or an exercise mat with your legs fully extended and your upper body upright. Grab the plate by its sides with both hands out in front of your abdominals with your arms slightly bent.",
    "rationale": "Slowly cross your legs near your ankles and lift them up off the ground. Your knees should also be bent slightly. Note: Move your upper body back slightly to help keep you balanced turning this exercise. This is the starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Twist/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Twist/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Twist/1.jpg"
    ]
  },
  {
    "id": "local-541",
    "name": "Platform Hamstring Slides",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "For this movement a wooden floor or similar is needed. Lay on your back with your legs extended. Place a gym towel or a light weight underneath your heel. This will be your starting position.",
    "rationale": "Begin the movement by flexing the knee, keeping your other leg straight.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Platform_Hamstring_Slides/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Platform_Hamstring_Slides/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Platform_Hamstring_Slides/1.jpg"
    ]
  },
  {
    "id": "local-542",
    "name": "Plie Dumbbell Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a dumbbell at the base with both hands and stand straight up. Move your legs so that they are wider than shoulder width apart from each other with your knees slightly bent.",
    "rationale": "Your toes should be facing out. Note: Your arms should be stationary while performing the exercise. This is the starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plie_Dumbbell_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plie_Dumbbell_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plie_Dumbbell_Squat/1.jpg"
    ]
  },
  {
    "id": "local-543",
    "name": "Plyo Kettlebell Pushups",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a kettlebell on the floor. Place yourself in a pushup position, on your toes with one hand on the ground and one hand holding the kettlebell, with your elbows extended. This will be your starting position.",
    "rationale": "Begin by lowering yourself as low as you can, keeping your back straight.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Kettlebell_Pushups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Kettlebell_Pushups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Kettlebell_Pushups/1.jpg"
    ]
  },
  {
    "id": "local-544",
    "name": "Plyo Push-up",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Move into a prone position on the floor, supporting your weight on your hands and toes.",
    "rationale": "Your arms should be fully extended with the hands around shoulder width. Keep your body straight throughout the movement. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plyo_Push-up/1.jpg"
    ]
  },
  {
    "id": "local-545",
    "name": "Posterior Tibialis Stretch",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "In a seated position, loop a belt, rope, or band around one foot. This will be your starting position.",
    "rationale": "With the leg extended and the heel off of the ground, pull on the belt so that the foot is everted, with the outside of the foot being pulled towards you. Hold for 10-20 seconds, and then switch sides.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Posterior_Tibialis_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Posterior_Tibialis_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Posterior_Tibialis_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-546",
    "name": "Power Clean",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand with your feet slightly wider than shoulder width apart and toes pointing out slightly.",
    "rationale": "Squat down and grasp bar with a closed, pronated grip. Your hands should be slightly wider than shoulder width apart outside knees with elbows fully extended.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean/1.jpg"
    ]
  },
  {
    "id": "local-547",
    "name": "Power Clean from Blocks",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "With a barbell on boxes of the desired height, take a grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.",
    "rationale": "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. As the bar approaches the mid-thigh position, begin extending through the hips.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean_from_Blocks/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean_from_Blocks/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean_from_Blocks/1.jpg"
    ]
  },
  {
    "id": "local-548",
    "name": "Power Jerk",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Standing with the weight racked on the front of the shoulders, begin with the dip. With your feet directly under your hips, flex the knees without moving the hips backward. Go down only slightly, and reverse direction as powerfully as possible.",
    "rationale": "Drive through the heels create as much speed and force as possible, and be sure to move your head out of the way as the bar leaves the shoulders.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-549",
    "name": "Power Partials",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand up with your torso upright and a dumbbell on each hand being held at arms length. The elbows should be close to the torso.",
    "rationale": "The palms of the hands should be facing your torso. Your feet should be about shoulder width apart. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Partials/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Partials/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Partials/1.jpg"
    ]
  },
  {
    "id": "local-550",
    "name": "Power Snatch",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a loaded barbell on the floor. The bar should be close to or touching the shins, and a wide grip should be taken on the bar. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar. This will be the starting position.",
    "rationale": "Begin the first pull by driving through the front of the heels, raising the bar from the ground. The back angle should stay the same until the bar passes the knees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Snatch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Snatch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Snatch/1.jpg"
    ]
  },
  {
    "id": "local-551",
    "name": "Power Snatch from Blocks",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a loaded barbell on boxes or stands of the desired height. A wide grip should be taken on the bar. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar, with the elbows pointed out. This will be the starting position.",
    "rationale": "Begin the first pull by driving through the front of the heels, raising the bar from the boxes.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Snatch_from_Blocks/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Snatch_from_Blocks/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Snatch_from_Blocks/1.jpg"
    ]
  },
  {
    "id": "local-552",
    "name": "Power Stairs",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strongman",
    "cue": "In the power stairs, implements are moved up a staircase. For training purposes, these can be performed with a tire or box.",
    "rationale": "Begin by taking the implement with both hands. Set your feet wide, with your head and chest up. Drive through the ground with your heels, extending your knees and hips to raise the weight from the ground.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Stairs/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Stairs/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Stairs/1.jpg"
    ]
  },
  {
    "id": "local-553",
    "name": "Preacher Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "To perform this movement you will need a preacher bench and an E-Z bar. Grab the E-Z curl bar at the close inner handle (either have someone hand you the bar which is preferable or grab the bar from the front bar rest provided by most preacher benches). The palm of your hands should be facing forward and they should be slightly tilted inwards due to the shape of the bar.",
    "rationale": "With the upper arms positioned against the preacher bench pad and the chest against it, hold the E-Z Curl Bar at shoulder length. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/1.jpg"
    ]
  },
  {
    "id": "local-554",
    "name": "Preacher Hammer Dumbbell Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place the upper part of both arms on top of the preacher bench as you hold a dumbbell in each hand with the palms facing each other (neutral grip).",
    "rationale": "As you breathe in, slowly lower the dumbbells until your upper arm is extended and the biceps is fully stretched.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Hammer_Dumbbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Hammer_Dumbbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Hammer_Dumbbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-555",
    "name": "Press Sit-Up",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "To begin, lie down on a bench with a barbell resting on your chest. Position your legs so they are secure on the extension of the abdominal bench. This is the starting position.",
    "rationale": "While inhaling, tighten your abdominals and glutes. Simultaneously curl your torso as you do when performing a sit-up and press the barbell to an overhead position while exhaling. Tip: Use your arms to push the barbell out as you perform this exercise while still focusing on the abdominal muscles.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Press_Sit-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Press_Sit-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Press_Sit-Up/1.jpg"
    ]
  },
  {
    "id": "local-556",
    "name": "Prone Manual Hamstring",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "You will need a partner for this exercise. Lay face down with your legs straight. Your assistant will place their hand on your heel.",
    "rationale": "To begin, flex the knee to curl your leg up. Your partner should provide resistance, starting light and increasing the pressure as the movement is completed. Communicate with your partner to monitor appropriate resistance levels.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Prone_Manual_Hamstring/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Prone_Manual_Hamstring/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Prone_Manual_Hamstring/1.jpg"
    ]
  },
  {
    "id": "local-557",
    "name": "Prowler Sprint",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "Place your sled on an appropriate surface, loaded to a suitable weight. The sled should provide enough resistance to require effort, but not so heavy that you are significantly slowed down.",
    "rationale": "You may use the upright or the low handles for this exercise. Place your hands on the handles with your arms extended, leaning into the implement.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Prowler_Sprint/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Prowler_Sprint/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Prowler_Sprint/1.jpg"
    ]
  },
  {
    "id": "local-558",
    "name": "Pull Through",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Begin standing a few feet in front of a low pulley with a rope or handle attached. Face away from the machine, straddling the cable, with your feet set wide apart.",
    "rationale": "Begin the movement by reaching through your legs as far as possible, bending at the hips. Keep your knees slightly bent. Keeping your arms straight, extend through the hip to stand straight up. Avoid pulling upward through the shoulders; all of the motion should originate through the hips.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/1.jpg"
    ]
  },
  {
    "id": "local-559",
    "name": "Pullups",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab the pull-up bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than your shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.",
    "rationale": "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/1.jpg"
    ]
  },
  {
    "id": "local-560",
    "name": "Push-Up Wide",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "With your hands wide apart, support your body on your toes and hands in a plank position. Your elbows should be extended and your body straight. Do not allow your hips to sag. This will be your starting position.",
    "rationale": "To begin, allow the elbows to flex, lowering your chest to the floor as you inhale.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/1.jpg"
    ]
  },
  {
    "id": "local-561",
    "name": "Push-Ups - Close Triceps Position",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie on the floor face down and place your hands closer than shoulder width for a close hand position. Make sure that you are holding your torso up at arms' length.",
    "rationale": "Lower yourself until your chest almost touches the floor as you inhale.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_-_Close_Triceps_Position/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_-_Close_Triceps_Position/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_-_Close_Triceps_Position/1.jpg"
    ]
  },
  {
    "id": "local-562",
    "name": "Push-Ups With Feet Elevated",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on the floor face down and place your hands about 36 inches apart from each other holding your torso up at arms length.",
    "rationale": "Place your toes on top of a flat bench. This will allow your body to be elevated. Note: The higher the elevation of the flat bench, the higher the resistance of the exercise is.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_Elevated/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_Elevated/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_Elevated/1.jpg"
    ]
  },
  {
    "id": "local-563",
    "name": "Push-Ups With Feet On An Exercise Ball",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on the floor face down and place your hands about 36 inches apart from each other holding your torso up at arms length.",
    "rationale": "Place your toes on top of an exercise ball. This will allow your body to be elevated.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_On_An_Exercise_Ball/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_On_An_Exercise_Ball/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Ups_With_Feet_On_An_Exercise_Ball/1.jpg"
    ]
  },
  {
    "id": "local-564",
    "name": "Push Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Olympic weightlifting",
    "cue": "Maintain proper form and control.",
    "rationale": "Targets shoulders.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press/1.jpg"
    ]
  },
  {
    "id": "local-565",
    "name": "Push Press - Behind the Neck",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Olympic weightlifting",
    "cue": "Standing with the weight racked on the back of the shoulders, begin with the dip. With your feet directly under your hips, flex the knees without moving the hips backward. Go down only slightly, and reverse direction as powerfully as possible. Drive through the heels create as much speed and force as possible, moving the bar in a vertical path.",
    "rationale": "Using the momentum generated, finish pressing the weight overhead be extending through the arms.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press_-_Behind_the_Neck/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press_-_Behind_the_Neck/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press_-_Behind_the_Neck/1.jpg"
    ]
  },
  {
    "id": "local-566",
    "name": "Push Up to Side Plank",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Get into pushup position on the toes with your hands just outside of shoulder width.",
    "rationale": "Perform a pushup by allowing the elbows to flex. As you descend, keep your body straight.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/1.jpg"
    ]
  },
  {
    "id": "local-567",
    "name": "Pushups",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length.",
    "rationale": "Next, lower yourself downward until your chest almost touches the floor as you inhale.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/1.jpg"
    ]
  },
  {
    "id": "local-568",
    "name": "Pushups (Close and Wide Hand Positions)",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie on the floor face down and body straight with your toes on the floor and the hands wider than shoulder width for a wide hand position and closer than shoulder width for a close hand position. Make sure you are holding your torso up at arms length.",
    "rationale": "Lower yourself until your chest almost touches the floor as you inhale.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups_Close_and_Wide_Hand_Positions/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups_Close_and_Wide_Hand_Positions/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups_Close_and_Wide_Hand_Positions/1.jpg"
    ]
  },
  {
    "id": "local-569",
    "name": "Pyramid",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Start off by rolling your torso forward onto the ball so your hips rest on top of the ball and become the highest point of your body.",
    "rationale": "Rest your hands and feet on the floor. Your arms and legs can be slightly bent or straight, depending on the size of the ball, your flexibility, and the length of your limbs. This also helps develop stabilizing strength in your torso and shoulders.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pyramid/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pyramid/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pyramid/1.jpg"
    ]
  },
  {
    "id": "local-570",
    "name": "Quad Stretch",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Lay on your side. Loop a belt, rope, or band around your top foot. Flex the knee and extend your hip, attempting to touch your glutes with your foot, and holding the belt with your hands. This will be your starting position.",
    "rationale": "With the belt being held over the shoulder or overhead, gently pull to increase the stretch in the quadriceps. Hold for 10-20 seconds, and then switch sides.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quad_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quad_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quad_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-571",
    "name": "Quadriceps-SMR",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lay facedown on the floor with your weight supported by your hands or forearms. Place a foam roll underneath one leg on the quadriceps, and keep the foot off of the ground. Make sure to relax the leg as much as possible. This will be your starting position.",
    "rationale": "Shifting as much weight onto the leg to be stretched as is tolerable, roll over the foam from above the knee to below the hip, holding points of tension for 10-30 seconds. Switch sides.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quadriceps-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quadriceps-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quadriceps-SMR/1.jpg"
    ]
  },
  {
    "id": "local-572",
    "name": "Quick Leap",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "You will need a box for this exerise.",
    "rationale": "Begin facing the box standing 1-2 feet from its edge.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quick_Leap/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quick_Leap/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Quick_Leap/1.jpg"
    ]
  },
  {
    "id": "local-573",
    "name": "Rack Delivery",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Olympic weightlifting",
    "cue": "This drill teaches the delivery of the barbell to the rack position on the shoulders. Begin holding a bar in the scarecrow position, with the upper arms parallel to the floor, and the forearms hanging down. Use a hook grip, with your fingers wrapped over your thumbs.",
    "rationale": "Begin by rotating the elbows around the bar, delivering the bar to the shoulders. As your elbows come forward, relax your grip. The shoulders should be protracted, providing a shelf for the bar, which should lightly contact the throat.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Delivery/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Delivery/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Delivery/1.jpg"
    ]
  },
  {
    "id": "local-574",
    "name": "Rack Pull with Bands",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Set up in a power rack with the bar on the pins. The pins should be set to the desired point; just below the knees, just above, or in the mid thigh position. Attach bands to the base of the rack, or secure them with dumbbells. Attach the other end to the bar. You may need to choke the bands to provide tension.",
    "rationale": "Position yourself against the bar in proper deadlifting position. Your feet should be under your hips, your grip shoulder width, back arched, and hips back to engage the hamstrings. Since the weight is typically heavy, you may use a mixed grip, a hook grip, or use straps to aid in holding the weight.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pull_with_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pull_with_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pull_with_Bands/1.jpg"
    ]
  },
  {
    "id": "local-575",
    "name": "Rack Pulls",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Powerlifting",
    "cue": "Set up in a power rack with the bar on the pins. The pins should be set to the desired point; just below the knees, just above, or in the mid thigh position. Position yourself against the bar in proper deadlifting position. Your feet should be under your hips, your grip shoulder width, back arched, and hips back to engage the hamstrings. Since the weight is typically heavy, you may use a mixed grip, a hook grip, or use straps to aid in holding the weight.",
    "rationale": "With your head looking forward, extend through the hips and knees, pulling the weight up and back until lockout. Be sure to pull your shoulders back as you complete the movement.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pulls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pulls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pulls/1.jpg"
    ]
  },
  {
    "id": "local-576",
    "name": "Rear Leg Raises",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Place yourself on your hands knees on an exercise mat. Your head should be looking forward and the bend of the knees should create a 90-degree angle between the hamstrings and the calves. This will be your starting position.",
    "rationale": "Extend one leg up and behind you. The knee and hip should both extend. Repeat for 5-10 repetitions, and then switch sides.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Leg_Raises/1.jpg"
    ]
  },
  {
    "id": "local-577",
    "name": "Recumbent Bike",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "To begin, seat yourself on the bike and adjust the seat to your height.",
    "rationale": "Select the desired option from the menu. You may have to start pedaling to turn it on. You can use the manual setting, or you can select a program to use. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. The level of resistance can be changed throughout the workout. The handles can be used to monitor your heart rate to help you stay at an appropriate intensity.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Recumbent_Bike/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Recumbent_Bike/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Recumbent_Bike/1.jpg"
    ]
  },
  {
    "id": "local-578",
    "name": "Return Push from Stance",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "You will need a partner for this drill.",
    "rationale": "Begin in an athletic 2 or 3 point stance.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Return_Push_from_Stance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Return_Push_from_Stance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Return_Push_from_Stance/1.jpg"
    ]
  },
  {
    "id": "local-579",
    "name": "Reverse Band Bench Press",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Position a bench inside a power rack, with the bar set to the correct height. Begin by anchoring bands either to band pegs or to the top of the rack. Ensure that you will be position properly under the bands. Attach the other end to the barbell.",
    "rationale": "Lie on the bench, tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and retract them, squeezing the shoulder blades together. Use your feet to drive your traps into the bench. Maintain this tight body position throughout the movement. However wide your grip, it should cover the ring on the bar.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-580",
    "name": "Reverse Band Box Squat",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Powerlifting",
    "cue": "Begin in a power rack with a box at the appropriate height behind you. Set up the bands either on band pegs or attached to the top of the rack, ensuring they will be directly above the bar during the squat. Attach the other end to the bar.",
    "rationale": "Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders. Remove the bar from the rack, creating a tight arch in your lower back, and step back into position. Place your feet wider for more emphasis on the back, glutes, adductors, and hamstrings, or closer together for more quad development. Keep your head facing forward.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Box_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Box_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Box_Squat/1.jpg"
    ]
  },
  {
    "id": "local-581",
    "name": "Reverse Band Deadlift",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Set the bar up in a power rack. Attach bands to the top of the rack, using either bands pegs or the frame itself. Attach the other end of the bands to the bar.",
    "rationale": "Approach the bar so that it is centered over your feet. You feet should be about hip width apart. Bend at the hip to grip the bar at shoulder width, allowing your shoulder blades to protract. Typically, you would use an overhand grip or an over/under grip on heavier sets.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-582",
    "name": "Reverse Band Power Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Begin in a power rack with the pins and bar set at the appropriate height. After loading the bar, attach bands to the top of the rack, using either pegs or the frame itself. Attach the other end of the bands to the bar.",
    "rationale": "Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders. Remove the bar from the rack, creating a tight arch in your lower back, and step back into position. Place your feet wide for more emphasis on the back, glutes, adductors, and hamstrings.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Power_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Power_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Power_Squat/1.jpg"
    ]
  },
  {
    "id": "local-583",
    "name": "Reverse Band Sumo Deadlift",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Begin with a bar loaded on the floor inside of a power rack. Attach bands to the top of the rack, using either pegs or the frame itself. Attach the other end to the barbell.",
    "rationale": "Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip. Relax the shoulders, which in effect lengthens your arms.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Sumo_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Sumo_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Band_Sumo_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-584",
    "name": "Reverse Barbell Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up with your torso upright while holding a barbell at shoulder width with the elbows close to the torso. The palm of your hands should be facing down (pronated grip). This will be your starting position.",
    "rationale": "While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second as you squeeze the muscle.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-585",
    "name": "Reverse Barbell Preacher Curls",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Grab an EZ-bar using a shoulder width and palms down (pronated) grip.",
    "rationale": "Now place the upper part of both arms on top of the preacher bench and have your arms extended. This will be your starting position.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Preacher_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Preacher_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Preacher_Curls/1.jpg"
    ]
  },
  {
    "id": "local-586",
    "name": "Reverse Cable Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up with your torso upright while holding a bar attachment that is attached to a low pulley using a pronated (palms down) and shoulder width grip. Make sure also that you keep the elbows close to the torso. This will be your starting position.",
    "rationale": "While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second as you squeeze the muscle.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Cable_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Cable_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Cable_Curl/1.jpg"
    ]
  },
  {
    "id": "local-587",
    "name": "Reverse Crunch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on the floor with your legs fully extended and arms to the side of your torso with the palms on the floor. Your arms should be stationary for the entire exercise.",
    "rationale": "Move your legs up so that your thighs are perpendicular to the floor and feet are together and parallel to the floor. This is the starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-588",
    "name": "Reverse Flyes",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, lie down on an incline bench with the chest and stomach pressing against the incline. Have the dumbbells in each hand with the palms facing each other (neutral grip).",
    "rationale": "Extend the arms in front of you so that they are perpendicular to the angle of the bench. The legs should be stationary while applying pressure with the ball of your toes. This is the starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/1.jpg"
    ]
  },
  {
    "id": "local-589",
    "name": "Reverse Flyes With External Rotation",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, lie down on an incline bench set at a 30-degree angle with the chest and stomach pressing against the incline.",
    "rationale": "Have the dumbbells in each hand with the palms facing down to the floor. Your arms should be in front of you so that they are perpendicular to the angle of the bench. Tip: Your elbows should have a slight bend. The legs should be stationary while applying pressure with the ball of your toes (your heels should not be touching the floor). This is the starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes_With_External_Rotation/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes_With_External_Rotation/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes_With_External_Rotation/1.jpg"
    ]
  },
  {
    "id": "local-590",
    "name": "Reverse Grip Bent-Over Rows",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand erect while holding a barbell with a supinated grip (palms facing up).",
    "rationale": "Bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The barbell should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Bent-Over_Rows/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Bent-Over_Rows/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Bent-Over_Rows/1.jpg"
    ]
  },
  {
    "id": "local-591",
    "name": "Reverse Grip Triceps Pushdown",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start by setting a bar attachment (straight or e-z) on a high pulley machine.",
    "rationale": "Facing the bar attachment, grab it with the palms facing up (supinated grip) at shoulder width. Lower the bar by using your lats until your arms are fully extended by your sides. Tip: Elbows should be in by your sides and your feet should be shoulder width apart from each other. This is the starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/1.jpg"
    ]
  },
  {
    "id": "local-592",
    "name": "Reverse Hyperextension",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place your feet between the pads after loading an appropriate weight. Lay on the top pad, allowing your hips to hang off the back, while grasping the handles to hold your position.",
    "rationale": "To begin the movement, flex the hips, pulling the legs forward.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Hyperextension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Hyperextension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Hyperextension/1.jpg"
    ]
  },
  {
    "id": "local-593",
    "name": "Reverse Machine Flyes",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the handles so that they are fully to the rear. Make an appropriate weight selection and adjust the seat height so the handles are at shoulder level. Grasp the handles with your hands facing inwards. This will be your starting position.",
    "rationale": "In a semicircular motion, pull your hands out to your side and back, contracting your rear delts.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/1.jpg"
    ]
  },
  {
    "id": "local-594",
    "name": "Reverse Plate Curls",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start by standing straight with a weighted plate held by both hands and arms fully extended. Use a pronated grip (palms facing down) and make sure your fingers grab the rough side of the plate while your thumb grabs the smooth side. Note: For the best results, grab the weighted plate at an 11:00 and 1:00 o'clock position.",
    "rationale": "Your feet should be shoulder width apart from each other and the weighted plate should be near the groin area. This is the starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Plate_Curls/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Plate_Curls/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Plate_Curls/1.jpg"
    ]
  },
  {
    "id": "local-595",
    "name": "Reverse Triceps Bench Press",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie back on a flat bench. Using a close, supinated grip (around shoulder width), lift the bar from the rack and hold it straight over you with your arms locked extended in front of you and perpendicular to the floor. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on your middle chest. Tip: Make sure that as opposed to a regular bench press, you keep the elbows close to the torso at all times in order to maximize triceps involvement.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Triceps_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Triceps_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Triceps_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-596",
    "name": "Rhomboids-SMR",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Lay down with your back on the floor. Place a foam roll underneath your upper back, and cross your arms in front of you, protracting your shoulders. This will be your starting position.",
    "rationale": "Raise your hips off of the ground, placing your weight onto the foam roll. Shift your weight to one side at a time, rolling over your middle and upper back. Pause at points of tension for 10-30 seconds.",
    "equipment": "Foam roll",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rhomboids-SMR/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rhomboids-SMR/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rhomboids-SMR/1.jpg"
    ]
  },
  {
    "id": "local-597",
    "name": "Rickshaw Carry",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strongman",
    "cue": "Position the frame at the starting point, and load with the appropriate weight. Standing in the center of the frame, begin by gripping the handles and driving through your heels to lift the frame. Ensure your chest and head are up and your back is straight.",
    "rationale": "Immediately begin walking briskly with quick, controlled steps. Keep your chest up and head forward, and make sure you continue breathing. Bring the frame to the ground after you have reached the end point.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rickshaw_Carry/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rickshaw_Carry/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rickshaw_Carry/1.jpg"
    ]
  },
  {
    "id": "local-598",
    "name": "Rickshaw Deadlift",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strongman",
    "cue": "Load the frame with the desired weight. Center yourself between the handles. You feet should be about hip width apart. Bend at the hips to grip the handles, allowing your shoulder blades to protract.",
    "rationale": "With your feet and your grip set, take a big breath and then lower your hips and flex the knees. Look forward with your head, keep your chest up and your back arched, and begin driving through the heels to move the weight upward. As the weight comes up, pull your shoulder blades together as you drive your hips forward.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rickshaw_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rickshaw_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rickshaw_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-599",
    "name": "Ring Dips",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grip a ring in each hand, and then take a small jump to help you get into the starting position with your arms locked out.",
    "rationale": "Begin by flexing the elbow, lowering your body until your arms break 90 degrees. Avoid swinging, and maintain good posture throughout the descent.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ring_Dips/1.jpg"
    ]
  },
  {
    "id": "local-600",
    "name": "Rocket Jump",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "Begin in a relaxed stance with your feet shoulder width apart and hold your arms close to the body.",
    "rationale": "To initiate the move, squat down halfway and explode back up as high as possible.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocket_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocket_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocket_Jump/1.jpg"
    ]
  },
  {
    "id": "local-601",
    "name": "Rocking Standing Calf Raise",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place it on the back of your shoulders (slightly below the neck).",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/1.jpg"
    ]
  },
  {
    "id": "local-602",
    "name": "Rocky Pull-Ups/Pulldowns",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab the pull-up bar with the palms facing forward using a wide grip.",
    "rationale": "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocky_Pull-Ups_Pulldowns/1.jpg"
    ]
  },
  {
    "id": "local-603",
    "name": "Romanian Deadlift",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width. Tip: Depending on the weight used, you may need wrist wraps to perform the exercise and also a raised platform in order to allow for better range of motion.",
    "rationale": "Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-604",
    "name": "Romanian Deadlift from Deficit",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin standing while holding a bar at arm's length in front of you. You can stand on a raised platform to increase the range of motion.",
    "rationale": "Begin by flexing the knees slightly, and then flex at the hip, moving your butt back as far as possible, lowering the torso as far as flexibility allows. The back should remain in absolute extension at all times, and the bar should remain in contact with the legs. If done properly, there should be heavy tension felt in the hamstrings.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/1.jpg"
    ]
  },
  {
    "id": "local-605",
    "name": "Rope Climb",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Grab the rope with both hands above your head. Pull down on the rope as you take a small jump.",
    "rationale": "Wrap the rope around one leg, using your feet to pinch the rope. Reach up as high as possible with your arms, gripping the rope tightly.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Climb/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Climb/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Climb/1.jpg"
    ]
  },
  {
    "id": "local-606",
    "name": "Rope Crunch",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Kneel 1-2 feet in front of a cable system with a rope attached.",
    "rationale": "After selecting an appropriate weight, grasp the rope with both hands reaching overhead. Your torso should be upright in the starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-607",
    "name": "Rope Jumping",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "Hold an end of the rope in each hand. Position the rope behind you on the ground. Raise your arms up and turn the rope over your head bringing it down in front of you. When it reaches the ground, jump over it. Find a good turning pace that can be maintained. Different speeds and techniques can be used to introduce variation.",
    "rationale": "Rope jumping is exciting, challenges your coordination, and requires a lot of energy. A 150 lb person will burn about 350 calories jumping rope for 30 minutes, compared to over 450 calories running.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Jumping/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Jumping/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Jumping/1.jpg"
    ]
  },
  {
    "id": "local-608",
    "name": "Rope Straight-Arm Pulldown",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach a rope to a high pulley and make your weight selection. Stand a couple feet back from the pulley with your feet staggered and take the rope with both hands. Lean forward from the hip, keeping your back straight, with your arms extended up in front of you. This will be your starting position.",
    "rationale": "Keeping your arms straight, extend the shoulder to pull the rope down to your thighs.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Straight-Arm_Pulldown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Straight-Arm_Pulldown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Straight-Arm_Pulldown/1.jpg"
    ]
  },
  {
    "id": "local-609",
    "name": "Round The World Shoulder Stretch",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Stand up straight with your legs together, holding a bodybar or broomstick.",
    "rationale": "Hold the pole behind your hips with a wider than shoulder width grip. Your palms should be down and your thumbs facing out.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Round_The_World_Shoulder_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Round_The_World_Shoulder_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Round_The_World_Shoulder_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-610",
    "name": "Rowing, Stationary",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Cardio",
    "cue": "To begin, seat yourself on the rower. Make sure that your heels are resting comfortably against the base of the foot pedals and that the straps are secured. Select the program that you wish to use, if applicable. Sit up straight and bend forward at the hips.",
    "rationale": "There are three phases of movement when using a rower. The first phase is when you come forward on the rower. Your knees are bent and against your chest. Your upper body is leaning slightly forward while still maintaining good posture. Next, push against the foot pedals and extend your legs while bringing your hands to your upper abdominal area, squeezing your shoulders back as you do so. To avoid straining your back, use primarily your leg and hip muscles.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rowing_Stationary/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rowing_Stationary/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rowing_Stationary/1.jpg"
    ]
  },
  {
    "id": "local-611",
    "name": "Runner's Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "It's easiest to get into this stretch if you start standing up, put one leg behind you, and slowly lower your torso down to the floor.",
    "rationale": "Keep the front heel on the floor (if it lifts up, scoot your other leg further back).",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Runners_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Runners_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Runners_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-612",
    "name": "Running, Treadmill",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Cardio",
    "cue": "To begin, step onto the treadmill and select the desired option from the menu. Most treadmills have a manual setting, or you can select a program to run. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. Elevation can be adjusted to change the intensity of the workout.",
    "rationale": "Treadmills offer convenience, cardiovascular benefits, and usually have less impact than running outside. A 150 lb person will burn over 450 calories running 8 miles per hour for 30 minutes. Maintain proper posture as you run, and only hold onto the handles when necessary, such as when dismounting or checking your heart rate.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Running_Treadmill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Running_Treadmill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Running_Treadmill/1.jpg"
    ]
  },
  {
    "id": "local-613",
    "name": "Russian Twist",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the knees.",
    "rationale": "Elevate your upper body so that it creates an imaginary V-shape with your thighs. Your arms should be fully extended in front of you perpendicular to your torso and with the hands clasped. This is the starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/1.jpg"
    ]
  },
  {
    "id": "local-614",
    "name": "Sandbag Load",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strongman",
    "cue": "To load sandbags or other objects, begin with the implements placed a distance from the loading platform, typically 50 feet.",
    "rationale": "Begin by lifting the sandbag. Sandbags are extremely awkward, and the manner of lifting them can vary depending on the particular sandbag used. Reach as far around it as possible, extending through the hips and knees to pull it up high. Shouldering is usually not allowed.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sandbag_Load/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sandbag_Load/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sandbag_Load/1.jpg"
    ]
  },
  {
    "id": "local-615",
    "name": "Scapular Pull-Up",
    "muscle_group": "Other",
    "tier": "S",
    "focus": "Strength",
    "cue": "Take a pronated grip on a pull-up bar.",
    "rationale": "From a hanging position, raise yourself a few inches without using your arms. Do this by depressing your shoulder girdle in a reverse shrugging motion.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scapular_Pull-Up/1.jpg"
    ]
  },
  {
    "id": "local-616",
    "name": "Scissor Kick",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Stretching",
    "cue": "To begin, lie down with your back pressed against the floor or on an exercise mat (optional). Your arms should be fully extended to the sides with your palms facing down. Note: The arms should be stationary the entire time.",
    "rationale": "With a slight bend at the knees, lift your legs up so that your heels are about 6 inches off the ground. This is the starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scissor_Kick/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scissor_Kick/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scissor_Kick/1.jpg"
    ]
  },
  {
    "id": "local-617",
    "name": "Scissors Jump",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Assume a lunge stance position with one foot forward with the knee bent, and the rear knee nearly touching the ground.",
    "rationale": "Ensure that the front knee is over the midline of the foot. Extending through both legs, jump as high as possible, swinging your arms to gain lift.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scissors_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scissors_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Scissors_Jump/1.jpg"
    ]
  },
  {
    "id": "local-618",
    "name": "Seated Band Hamstring Curl",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Secure a band close to the ground and place a bench a couple feet away from it.",
    "rationale": "Seat yourself on the bench and secure the band behind your ankles, beginning with your legs straight. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Band_Hamstring_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Band_Hamstring_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Band_Hamstring_Curl/1.jpg"
    ]
  },
  {
    "id": "local-619",
    "name": "Seated Barbell Military Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit on a Military Press Bench with a bar behind your head and either have a spotter give you the bar (better on the rotator cuff this way) or pick it up yourself carefully with a pronated grip (palms facing forward). Tip: Your grip should be wider than shoulder width and it should create a 90-degree angle between the forearm and the upper arm as the barbell goes down.",
    "rationale": "Once you pick up the barbell with the correct grip length, lift the bar up over your head by locking your arms. Hold at about shoulder level and slightly in front of your head. This is your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Military_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Military_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Military_Press/1.jpg"
    ]
  },
  {
    "id": "local-620",
    "name": "Seated Barbell Twist",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Start out by sitting at the end of a flat bench with a barbell placed on top of your thighs. Your feet should be shoulder width apart from each other.",
    "rationale": "Grip the bar with your palms facing down and make sure your hands are wider than shoulder width apart from each other. Begin to lift the barbell up over your head until your arms are fully extended.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Twist/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Twist/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Twist/1.jpg"
    ]
  },
  {
    "id": "local-621",
    "name": "Seated Bent-Over One-Arm Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit down at the end of a flat bench with a dumbbell in one arm using a neutral grip (palms of the hand facing you).",
    "rationale": "Bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Make sure that you keep the head up.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_One-Arm_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_One-Arm_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_One-Arm_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-622",
    "name": "Seated Bent-Over Rear Delt Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a couple of dumbbells looking forward in front of a flat bench.",
    "rationale": "Sit on the end of the bench with your legs together and the dumbbells behind your calves.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/1.jpg"
    ]
  },
  {
    "id": "local-623",
    "name": "Seated Bent-Over Two-Arm Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit down at the end of a flat bench with a dumbbell in both arms using a neutral grip (palms of the hand facing you).",
    "rationale": "Bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Make sure that you keep the head up.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Two-Arm_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Two-Arm_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Two-Arm_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-624",
    "name": "Seated Biceps",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Sit on the floor with your knees bent and your partner standing behind you. Extend your arms straight behind you with your palms facing each other. Your partner will hold your wrists for you. This will be the starting position.",
    "rationale": "Attempt to flex your elbows, while your partner prevents any actual movement.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Biceps/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Biceps/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Biceps/1.jpg"
    ]
  },
  {
    "id": "local-625",
    "name": "Seated Cable Rows",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "For this exercise you will need access to a low pulley row machine with a V-bar. Note: The V-bar will enable you to have a neutral grip where the palms of your hands face each other. To get into the starting position, first sit down on the machine and place your feet on the front platform or crossbar provided making sure that your knees are slightly bent and not locked.",
    "rationale": "Lean over as you keep the natural alignment of your back and grab the V-bar handles.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/1.jpg"
    ]
  },
  {
    "id": "local-626",
    "name": "Seated Cable Shoulder Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 90 degrees to the body, with your head and chest up. The elbows should also be bent to about 90 degrees. This will be your starting position.",
    "rationale": "Begin by extending through the elbow, pressing the handles together above your head.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Shoulder_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Shoulder_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Shoulder_Press/1.jpg"
    ]
  },
  {
    "id": "local-627",
    "name": "Seated Calf Raise",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit on the machine and place your toes on the lower portion of the platform provided with the heels extending off. Choose the toe positioning of your choice (forward, in, or out) as per the beginning of this chapter.",
    "rationale": "Place your lower thighs under the lever pad, which will need to be adjusted according to the height of your thighs. Now place your hands on top of the lever pad in order to prevent it from slipping forward.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/1.jpg"
    ]
  },
  {
    "id": "local-628",
    "name": "Seated Calf Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Sit up straight on an exercise mat.",
    "rationale": "Bend one knee and put that foot on the floor to stabilize the torso.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-629",
    "name": "Seated Close-Grip Concentration Barbell Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit down on a flat bench with a barbell or E-Z Bar in front of you in between your legs. Your legs should be spread with the knees bent and the feet on the floor.",
    "rationale": "Use your arms to pick the barbell up and place the back of your upper arms on top of your inner thighs (around three and a half inches away from the front of the knee). A supinated grip closer than shoulder width is needed to perform this exercise. Tip: Your arm should be extended at arms length and the barbell should be above the floor. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Close-Grip_Concentration_Barbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Close-Grip_Concentration_Barbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Close-Grip_Concentration_Barbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-630",
    "name": "Seated Dumbbell Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit on a flat bench with a dumbbell on each hand being held at arms length. The elbows should be close to the torso.",
    "rationale": "Rotate the palms of the hands so that they are facing your torso. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-631",
    "name": "Seated Dumbbell Inner Biceps Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit on the end of a flat bench with a dumbbell in each hand being held at arms length. The elbows should be close to the torso.",
    "rationale": "Rotate the palms of the hands so that they are facing inward in a neutral position. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Inner_Biceps_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Inner_Biceps_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Inner_Biceps_Curl/1.jpg"
    ]
  },
  {
    "id": "local-632",
    "name": "Seated Dumbbell Palms-Down Wrist Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start out by placing two dumbbells on the floor in front of a flat bench.",
    "rationale": "Sit down on the edge of the flat bench with your legs at about shoulder width apart. Make sure to keep your feet on the floor.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Down_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Down_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Down_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-633",
    "name": "Seated Dumbbell Palms-Up Wrist Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start out by placing two dumbbells on the floor in front of a flat bench.",
    "rationale": "Sit down on the edge of the flat bench with your legs at about shoulder width apart. Make sure to keep your feet on the floor.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-634",
    "name": "Seated Dumbbell Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab a couple of dumbbells and sit on a military press bench or a utility bench that has a back support on it as you place the dumbbells upright on top of your thighs.",
    "rationale": "Clean the dumbbells up one at a time by using your thighs to bring the dumbbells up to shoulder height at each side.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": "local-635",
    "name": "Seated Flat Bench Leg Pull-In",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit on a bench with the legs stretched out in front of you slightly below parallel and your arms holding on to the sides of the bench. Your torso should be leaning backwards around a 45-degree angle from the bench. This will be your starting position.",
    "rationale": "Bring the knees in toward you as you move your torso closer to them at the same time. Breathe out as you perform this movement.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Flat_Bench_Leg_Pull-In/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Flat_Bench_Leg_Pull-In/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Flat_Bench_Leg_Pull-In/1.jpg"
    ]
  },
  {
    "id": "local-636",
    "name": "Seated Floor Hamstring Stretch",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Sit on a mat with your right leg extended in front of you and your left leg bent with your foot against your right inner thigh.",
    "rationale": "Lean forward from your hips and reach for your ankle until you feel a stretch in your hamstring. Hold for 15 seconds, then repeat for your other side.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Floor_Hamstring_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Floor_Hamstring_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Floor_Hamstring_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-637",
    "name": "Seated Front Deltoid",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Sit upright on the floor with your legs bent, your partner standing behind you. Stick your arms straight out to your sides, with your palms facing the ground. Attempt to move them as far behind you as possible, as your assistant holds your wrists. This will be your starting position.",
    "rationale": "Keeping your elbows straight, attempt to move your arms to the front, with your partner gently restraining you to prevent any actual movement for 10-20 seconds.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Front_Deltoid/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Front_Deltoid/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Front_Deltoid/1.jpg"
    ]
  },
  {
    "id": "local-638",
    "name": "Seated Glute",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "In a seated position with your knees bent, cross one ankle over the opposite knee. Your partner will stand behind you. Now, lean forward as your partner braces your shoulders with their hands. This will be your starting position.",
    "rationale": "Attempt to push your torso back for 10-20 seconds, as your partner prevents any actual movement of your torso.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Glute/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Glute/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Glute/1.jpg"
    ]
  },
  {
    "id": "local-639",
    "name": "Seated Good Mornings",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Set up a box in a power rack. The pins should be set at an appropriate height. Begin by stepping under the bar and placing it across the back of the shoulders, not on top of your traps. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders.",
    "rationale": "Remove the bar from the rack, creating a tight arch in your lower back. Keep your head facing forward. With your back, shoulders, and core tight, push your knees and butt out and you begin your descent. Sit back with your hips until you are seated on the box. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Good_Mornings/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Good_Mornings/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Good_Mornings/1.jpg"
    ]
  },
  {
    "id": "local-640",
    "name": "Seated Hamstring",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "In a seated position with your legs extended, have your partner stand behind you. Now, lean forward as your partner braces your shoulders with their hands. This will be your starting position.",
    "rationale": "Attempt to push your torso back for 10-20 seconds, as your partner prevents any actual movement of your torso.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Hamstring/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Hamstring/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Hamstring/1.jpg"
    ]
  },
  {
    "id": "local-641",
    "name": "Seated Hamstring and Calf Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Loop a belt, rope, or band around one foot. Sit down with both legs extended . This will be your starting position.",
    "rationale": "Leaning forward slightly, pull on the belt to draw the toes of your foot back. Hold this position for 10-20 seconds and then repeat with the other leg.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Hamstring_and_Calf_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Hamstring_and_Calf_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Hamstring_and_Calf_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-642",
    "name": "Seated Head Harness Neck Resistance",
    "muscle_group": "Neck",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a neck strap on the floor at the end of a flat bench. Once you have selected the weights, sit at the end of the flat bench with your feet wider than shoulder width apart from each other. Your toes should be pointed out.",
    "rationale": "Slowly move your torso forward until it is almost parallel with the floor. Using both hands, securely position the neck strap around your head. Tip: Make sure the weights are still lying on the floor to prevent any strain on the neck. Now grab the weight with both hands while elevating your torso back until it is almost perpendicular to the floor. Note: Your head and torso needs to be slightly tilted forward to perform this exercise.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Head_Harness_Neck_Resistance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Head_Harness_Neck_Resistance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Head_Harness_Neck_Resistance/1.jpg"
    ]
  },
  {
    "id": "local-643",
    "name": "Seated Leg Curl",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the machine lever to fit your height and sit on the machine with your back against the back support pad.",
    "rationale": "Place the back of lower leg on top of padded lever (just a few inches under the calves) and secure the lap pad against your thighs, just above the knees. Then grasp the side handles on the machine as you point your toes straight (or you can also use any of the other two stances) and ensure that the legs are fully straight right in front of you. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/1.jpg"
    ]
  },
  {
    "id": "local-644",
    "name": "Seated Leg Tucks",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit on a bench with the legs stretched out in front of you slightly below parallel and your arms holding on to the sides of the bench. Your torso should be leaning backwards around a 45-degree angle from the bench. This will be your starting position.",
    "rationale": "Bring the knees in toward you as you move your torso closer to them at the same time. Breathe out as you perform this movement.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Tucks/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Tucks/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Tucks/1.jpg"
    ]
  },
  {
    "id": "local-645",
    "name": "Seated One-Arm Dumbbell Palms-Down Wrist Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Sit on a flat bench with a dumbbell in your right hand.",
    "rationale": "Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-Arm_Dumbbell_Palms-Down_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-Arm_Dumbbell_Palms-Down_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-Arm_Dumbbell_Palms-Down_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-646",
    "name": "Seated One-Arm Dumbbell Palms-Up Wrist Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit on a flat bench with a dumbbell in your right hand.",
    "rationale": "Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-Arm_Dumbbell_Palms-Up_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-Arm_Dumbbell_Palms-Up_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-Arm_Dumbbell_Palms-Up_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-647",
    "name": "Seated One-arm Cable Pulley Rows",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "To get into the starting position, first sit down on the machine and place your feet on the front platform or crossbar provided making sure that your knees are slightly bent and not locked.",
    "rationale": "Lean over as you keep the natural alignment of your back and grab the single handle attachment with your left arm using a palms-down grip.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/1.jpg"
    ]
  },
  {
    "id": "local-648",
    "name": "Seated Overhead Stretch",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Sit up straight on an exercise mat.",
    "rationale": "Touch the soles of your feet together with your feet six to eight inches in front of your hips.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Overhead_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Overhead_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Overhead_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-649",
    "name": "Seated Palm-Up Barbell Wrist Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a barbell with both hands and your palms facing up; hands spaced about shoulder width.",
    "rationale": "Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-650",
    "name": "Seated Palms-Down Barbell Wrist Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Hold a barbell with both hands and your palms facing down; hands spaced about shoulder width.",
    "rationale": "Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palms-Down_Barbell_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palms-Down_Barbell_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palms-Down_Barbell_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-651",
    "name": "Seated Side Lateral Raise",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Pick a couple of dumbbells and sit at the end of a flat bench with your feet firmly on the floor. Hold the dumbbells with your palms facing in and your arms straight down at your sides at arms' length. This will be your starting position.",
    "rationale": "While maintaining the torso stationary (no swinging), lift the dumbbells to your side with a slight bend on the elbow and the hands slightly tilted forward as if pouring water in a glass. Continue to go up until you arms are parallel to the floor. Exhale as you execute this movement and pause for a second at the top.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Side_Lateral_Raise/1.jpg"
    ]
  },
  {
    "id": "local-652",
    "name": "Seated Triceps Press",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit down on a bench with back support and grasp a dumbbell with both hands and hold it overhead at arm's length. Tip: a better way is to have somebody hand it to you especially if it is very heavy. The resistance should be resting in the palms of your hands with your thumbs around it. The palm of the hand should be facing inward. This will be your starting position.",
    "rationale": "Keeping your upper arms close to your head (elbows in) and perpendicular to the floor, lower the resistance in a semi-circular motion behind your head until your forearms touch your biceps. Tip: The upper arms should remain stationary and only the forearms should move. Breathe in as you perform this step.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Triceps_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Triceps_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Triceps_Press/1.jpg"
    ]
  },
  {
    "id": "local-653",
    "name": "Seated Two-Arm Palms-Up Low-Pulley Wrist Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Put a bench in front of a low pulley machine that has a barbell or EZ Curl attachment on it.",
    "rationale": "Move the bench far enough away so that when you bring the handle to the top of your thighs tension is created on the cable due to the weight stack being moved up.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Two-Arm_Palms-Up_Low-Pulley_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Two-Arm_Palms-Up_Low-Pulley_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Two-Arm_Palms-Up_Low-Pulley_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-654",
    "name": "See-Saw Press (Alternating Side Press)",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Grab a dumbbell with each hand and stand up erect.",
    "rationale": "Clean (lift) the dumbbells to the chest/shoulder level and then rotate your wrists so that your palms are facing towards you as if you were getting ready to perform an Arnold Press. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/See-Saw_Press_Alternating_Side_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/See-Saw_Press_Alternating_Side_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/See-Saw_Press_Alternating_Side_Press/1.jpg"
    ]
  },
  {
    "id": "local-655",
    "name": "Shotgun Row",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Attach a single handle to a low cable.",
    "rationale": "After selecting the correct weight, stand a couple feet back with a wide-split stance. Your arm should be extended and your shoulder forward. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shotgun_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shotgun_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shotgun_Row/1.jpg"
    ]
  },
  {
    "id": "local-656",
    "name": "Shoulder Circles",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Stretching",
    "cue": "With shoulders relaxed and arms resting loosely at your sides (or in your lap if you're seated), gently roll your shoulders forward, up, back, and down.",
    "rationale": "Reverse direction. You can do this exercise alternating shoulders or both at the same time.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Circles/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Circles/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Circles/1.jpg"
    ]
  },
  {
    "id": "local-657",
    "name": "Shoulder Press - With Bands",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, stand on an exercise band so that tension begins at arm's length. Grasp the handles and lift them so that the hands are at shoulder height at each side.",
    "rationale": "Rotate the wrists so that the palms of your hands are facing forward. Your elbows should be bent, with the upper arms and forearms in line to the torso. This is your starting position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Press_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Press_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Press_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-658",
    "name": "Shoulder Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Relax your arms to your sides and raise your shoulders up toward your ears, then back down.",
    "rationale": "Targets shoulders.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Raise/1.jpg"
    ]
  },
  {
    "id": "local-659",
    "name": "Shoulder Stretch",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Reach your left arm across your body and hold it straight.",
    "rationale": "Targets shoulders.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Shoulder_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-660",
    "name": "Side-Lying Floor Stretch",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Stretching",
    "cue": "First lie on your left side, bending your left knee in front of you to stabilize your torso (use your abdominal muscles as well to hold you upright).",
    "rationale": "Straighten your right leg and rest the right foot on the floor behind your left. Straighten your right arm over your head and gently pull on your right wrist to stretch the entire right side of the body. Switch sides.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side-Lying_Floor_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side-Lying_Floor_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side-Lying_Floor_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-661",
    "name": "Side Bridge",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Maintain proper form and control.",
    "rationale": "Targets abdominals.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/1.jpg"
    ]
  },
  {
    "id": "local-662",
    "name": "Side Hop-Sprint",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Stand to the side of a cone or hurdle.",
    "rationale": "Begin this drill by hopping sideways over the obstacle, rebounding out of your landing to hop back to where you started.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Hop-Sprint/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Hop-Sprint/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Hop-Sprint/1.jpg"
    ]
  },
  {
    "id": "local-663",
    "name": "Side Jackknife",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Maintain proper form and control.",
    "rationale": "Targets abdominals.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Jackknife/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Jackknife/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Jackknife/1.jpg"
    ]
  },
  {
    "id": "local-664",
    "name": "Side Lateral Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Pick a couple of dumbbells and stand with a straight torso and the dumbbells by your side at arms length with the palms of the hand facing you. This will be your starting position.",
    "rationale": "While maintaining the torso in a stationary position (no swinging), lift the dumbbells to your side with a slight bend on the elbow and the hands slightly tilted forward as if pouring water in a glass. Continue to go up until you arms are parallel to the floor. Exhale as you execute this movement and pause for a second at the top.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg"
    ]
  },
  {
    "id": "local-665",
    "name": "Side Laterals to Front Raise",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "In a standing position, hold a pair of dumbbells at your side. This will be your starting position.",
    "rationale": "Keeping your elbows slightly bent, raise the weights directly in front of you to shoulder height, avoiding any swinging or cheating.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Laterals_to_Front_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Laterals_to_Front_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Laterals_to_Front_Raise/1.jpg"
    ]
  },
  {
    "id": "local-666",
    "name": "Side Leg Raises",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Stand next to a chair, which you may hold onto as a support. Stand on one leg. This will be your starting position.",
    "rationale": "Keeping your leg straight, raise it as far out to the side as possible, and swing it back down, allowing it to cross the opposite leg.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Leg_Raises/1.jpg"
    ]
  },
  {
    "id": "local-667",
    "name": "Side Lying Groin Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Start off by lying on your right side and bend your right knee in front of you to stabilize the torso.",
    "rationale": "Rest your head on your right hand or shoulder. Lift your left leg upward and hold it by the back of the knee (easier) or the foot (harder).",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lying_Groin_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lying_Groin_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lying_Groin_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-668",
    "name": "Side Neck Stretch",
    "muscle_group": "Neck",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Start with your shoulders relaxed, gently tilt your head towards your shoulder.",
    "rationale": "Assist stretch with a gentle pull on the side of the head.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Neck_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Neck_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Neck_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-669",
    "name": "Side Standing Long Jump",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Begin standing with your feet hip width apart in an athletic stance. Your head and chest should be up, knees and hips slightly bent. This will be your starting position.",
    "rationale": "Leaning to your right, extend through your hips, knees, and ankles to jump into the air. Block with the arms to lead the movement, jumping as far to your right as you can.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Standing_Long_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Standing_Long_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Standing_Long_Jump/1.jpg"
    ]
  },
  {
    "id": "local-670",
    "name": "Side To Side Chins",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Grab the pull-up bar with the palms facing forward using a wide grip.",
    "rationale": "As you have both arms extended in front of you holding the bar at a wide grip, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_To_Side_Chins/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_To_Side_Chins/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_To_Side_Chins/1.jpg"
    ]
  },
  {
    "id": "local-671",
    "name": "Side Wrist Pull",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Stretching",
    "cue": "This stretch works best standing. Cross your left arm over the midline of your body and hold the left wrist in your right hand down at the level of your hips. Start the stretch with a bent left arm.",
    "rationale": "Slowly straighten, pull, and lift it up to shoulder height, as pictured. Feel this stretch originate in your back, not your shoulders, and don't pull too hard on the shoulders joint. Switch sides.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Wrist_Pull/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Wrist_Pull/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Wrist_Pull/1.jpg"
    ]
  },
  {
    "id": "local-672",
    "name": "Side to Side Box Shuffle",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Stand to one side of the box with your left foot resting on the middle of it.",
    "rationale": "To begin, jump up and over to the other side of the box, landing with your right foot on top of the box and your left foot on the floor. Swing your arms to aid your movement.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_to_Side_Box_Shuffle/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_to_Side_Box_Shuffle/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_to_Side_Box_Shuffle/1.jpg"
    ]
  },
  {
    "id": "local-673",
    "name": "Single-Arm Cable Crossover",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Begin by moving the pulleys to the high position, select the resistance to be used, and take a handle in each hand.",
    "rationale": "Step forward in front of both pulleys with your arms extended in front of you, bringing your hands together. Your head and chest should be up as you lean forward, while your feet should be staggered. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Cable_Crossover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Cable_Crossover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Cable_Crossover/1.jpg"
    ]
  },
  {
    "id": "local-674",
    "name": "Single-Arm Linear Jammer",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.",
    "rationale": "Raise the bar from the floor, taking it to your shoulders with one or both hands. Adopt a wide stance. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Linear_Jammer/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Linear_Jammer/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Linear_Jammer/1.jpg"
    ]
  },
  {
    "id": "local-675",
    "name": "Single-Arm Push-Up",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Begin laying prone on the ground. Move yourself into a position supporting your weight on your toes and one arm. Your working arm should be placed directly under the shoulder, fully extended. Your legs should be extended, and for this movement you may need a wider base, placing your feet further apart than in a normal push-up.",
    "rationale": "Maintain good posture, and place your free hand behind your back. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Push-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Push-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Arm_Push-Up/1.jpg"
    ]
  },
  {
    "id": "local-676",
    "name": "Single-Cone Sprint Drill",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "This drill teaches quick foot action. You need a single cone. Begin standing next to the cone with one arm back and one arm forward.",
    "rationale": "Chop the feet as quickly as possible, blocking with the arms. Circle the cone, keep your knees up, with violent foot action.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Cone_Sprint_Drill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Cone_Sprint_Drill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Cone_Sprint_Drill/1.jpg"
    ]
  },
  {
    "id": "local-677",
    "name": "Single-Leg High Box Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position a box in a rack. Secure a band or rope in place above the box.",
    "rationale": "Standing in front of it, step onto the box to a full standing position, letting your other leg remain unsupported. Hold onto the band for balance",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_High_Box_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_High_Box_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_High_Box_Squat/1.jpg"
    ]
  },
  {
    "id": "local-678",
    "name": "Single-Leg Hop Progression",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Arrange a line of cones in front of you. Assume a relaxed standing position, balanced on one leg. Raise the knee of your opposite leg. This will be your starting position.",
    "rationale": "Hop forward, jumping and landing with the same leg over the cone.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Hop_Progression/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Hop_Progression/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Hop_Progression/1.jpg"
    ]
  },
  {
    "id": "local-679",
    "name": "Single-Leg Lateral Hop",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Stand to the side of a cone or hurdle. To get into the start position, stand on one leg with your knee slightly bent.",
    "rationale": "To begin, execute a counterjump to hop sideways over the cone.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Lateral_Hop/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Lateral_Hop/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Lateral_Hop/1.jpg"
    ]
  },
  {
    "id": "local-680",
    "name": "Single-Leg Leg Extension",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Seat yourself in the machine and adjust it so that you are positioned properly. The pad should be against the lower part of the shin but not in contact with the ankle. Adjust the seat so that the pivot point is in line with your knee. Select a weight appropriate for your abilities.",
    "rationale": "Maintaining good posture, fully extend one leg, pausing at the top of the motion.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Leg_Extension/1.jpg"
    ]
  },
  {
    "id": "local-681",
    "name": "Single-Leg Stride Jump",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Stand to the side of a box with your inside foot on top of it, close to the edge.",
    "rationale": "Begin by swinging the arms upward as you push through the top leg, jumping upward as high as possible. Attempt to drive the opposite knee upward.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Stride_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Stride_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single-Leg_Stride_Jump/1.jpg"
    ]
  },
  {
    "id": "local-682",
    "name": "Single Dumbbell Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "With a wide stance, hold a dumbell with both hands, grasping the head of the dumbbell instead of the handle. Your arms should be extended and hanging at the waist. This will be your starting position.",
    "rationale": "Raise the weight until it is above shoulder level, keeping your arms extended. Your torso and hips should remain stationary throughout the movement.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Dumbbell_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Dumbbell_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Dumbbell_Raise/1.jpg"
    ]
  },
  {
    "id": "local-683",
    "name": "Single Leg Butt Kick",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Begin by standing on one leg, with the bent knee raised. This will be your start position.",
    "rationale": "Using a countermovement jump, take off upward by extending the hip, knee, and ankle of the grounded leg.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Butt_Kick/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Butt_Kick/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Butt_Kick/1.jpg"
    ]
  },
  {
    "id": "local-684",
    "name": "Single Leg Glute Bridge",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Lay on the floor with your feet flat and knees bent.",
    "rationale": "Raise one leg off of the ground, pulling the knee to your chest. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Glute_Bridge/1.jpg"
    ]
  },
  {
    "id": "local-685",
    "name": "Single Leg Push-off",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "Stand on the ground with one foot resting on the box, heel close to the edge.",
    "rationale": "Push off with your foot on top of the box, trying to gain as much height as possible by extending through the hip and knee.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Push-off/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Push-off/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Push-off/1.jpg"
    ]
  },
  {
    "id": "local-686",
    "name": "Sit-Up",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the knees.",
    "rationale": "Place your hands behind your head and lock them together by clasping your fingers. This is the starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit-Up/1.jpg"
    ]
  },
  {
    "id": "local-687",
    "name": "Sit Squats",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Stand with your feet shoulder width apart. This will be your starting position.",
    "rationale": "Begin the movement by flexing your knees and hips, sitting back with your hips.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit_Squats/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit_Squats/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit_Squats/1.jpg"
    ]
  },
  {
    "id": "local-688",
    "name": "Skating",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "Roller skating is a fun activity which can be effective in improving cardiorespiratory fitness and muscular endurance. It requires relatively good balance and coordination. It is necessary to learn the basics of skating including turning and stopping and to wear protective gear to avoid possible injury.",
    "rationale": "You can skate at a comfortable pace for 30 minutes straight. If you want a cardio challenge, do interval skating — speed skate two minutes of every five minutes, using the remaining three minutes to recover. A 150 lb person will typically burn about 175 calories in 30 minutes skating at a comfortable pace, similar to brisk walking.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Skating/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Skating/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Skating/1.jpg"
    ]
  },
  {
    "id": "local-689",
    "name": "Sled Drag - Harness",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strongman",
    "cue": "To begin, load the sled with the desired weight and attach the pulling strap. You can pull with handles, use a harness, or attach the pulling strap to a weight belt.",
    "rationale": "Whether pulling forwards or backwards, lean in the direction of travel and progress by extending through the hips and knees.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Drag_-_Harness/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Drag_-_Harness/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Drag_-_Harness/1.jpg"
    ]
  },
  {
    "id": "local-690",
    "name": "Sled Overhead Backward Walk",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Attach dual handles to a sled connected by a rope or chain. Load the sled to a light weight.",
    "rationale": "Face the sled, backing up until there is some tension in the line. Hold your hands directly above your head with your elbows extended. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Backward_Walk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Backward_Walk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Backward_Walk/1.jpg"
    ]
  },
  {
    "id": "local-691",
    "name": "Sled Overhead Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach dual handles to a sled using a chain or rope. Load the sled to an appropriate load.",
    "rationale": "Facing away from the sled, step away until there is tension in the line. Raise your hands above your head, keeping them together, palms facing each other. Your elbows should be pointed upward with the elbows flexed. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Overhead_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-692",
    "name": "Sled Push",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strongman",
    "cue": "Load your pushing sled with the desired weight.",
    "rationale": "Take an athletic posture, leaning into the sled with your arms fully extended, grasping the handles. Push the sled as fast as possible, focusing on extending your hips and knees to strengthen your posterior chain.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Push/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Push/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Push/1.jpg"
    ]
  },
  {
    "id": "local-693",
    "name": "Sled Reverse Flye",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Attach dual handles to a sled connected by a rope or chain. Load the sled to a light weight.",
    "rationale": "Face the sled, backing up until there is some tension in the line. Take both handles at arms length at about waist level. Bend the knees slightly and keep your chest and head up. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Reverse_Flye/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Reverse_Flye/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Reverse_Flye/1.jpg"
    ]
  },
  {
    "id": "local-694",
    "name": "Sled Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach dual handles to a sled connected by a rope or chain. Load the sled to an appropriate weight. Face the sled, backing up until there is some tension in the line.",
    "rationale": "With a handle in each hand, bend the knees slightly, keep your head and chest up, and begin with your arms extended.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Row/1.jpg"
    ]
  },
  {
    "id": "local-695",
    "name": "Sledgehammer Swings",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "You will need a tire and a sledgehammer for this exercise. Stand in front of the tire about two feet away from it with a staggered stance. Grip the sledgehammer.",
    "rationale": "If you are right handed, your left hand should be at the bottom of the handle, and your right hand should be choking up closer to the head.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sledgehammer_Swings/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sledgehammer_Swings/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sledgehammer_Swings/1.jpg"
    ]
  },
  {
    "id": "local-696",
    "name": "Smith Incline Shoulder Raise",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place an incline bench underneath the smith machine. Place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Once the weight you need is selected, lie down on the incline bench and make sure your shoulders are aligned right under the barbell.",
    "rationale": "Using a shoulder width pronated (palms forward) grip, lift the bar from the rack and hold it straight over you with a slight bend at the elbows. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Incline_Shoulder_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Incline_Shoulder_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Incline_Shoulder_Raise/1.jpg"
    ]
  },
  {
    "id": "local-697",
    "name": "Smith Machine Behind the Back Shrug",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "With the bar at thigh level, load an appropriate weight.",
    "rationale": "Stand with the bar behind you, taking a shoulder-width, pronated grip on the bar and unhook the weight. You should be standing up straight with your head and chest up and your arms extended. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Behind_the_Back_Shrug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Behind_the_Back_Shrug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Behind_the_Back_Shrug/1.jpg"
    ]
  },
  {
    "id": "local-698",
    "name": "Smith Machine Bench Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a flat bench underneath the smith machine. Now place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Once the weight you need is selected, lie down on the flat bench. Using a pronated grip that is wider than shoulder width, unlock the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on your middle chest.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-699",
    "name": "Smith Machine Bent Over Row",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Set the barbell attached to the smith machine to a height that is about 2 inches below your knees.",
    "rationale": "Bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bent_Over_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bent_Over_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bent_Over_Row/1.jpg"
    ]
  },
  {
    "id": "local-700",
    "name": "Smith Machine Calf Raise",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Place a block or weight plate below the bar on the Smith machine. Set the bar to a position that best matches your height. Once the correct height is chosen and the bar is loaded, step onto the plates with the balls of your feet and place the bar on the back of your shoulders.",
    "rationale": "Take the bar with both hands facing forward. Rotate the bar to unrack it. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Calf_Raise/1.jpg"
    ]
  },
  {
    "id": "local-701",
    "name": "Smith Machine Close-Grip Bench Press",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a flat bench underneath the smith machine. Place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Once the weight you need is selected, lie down on the flat bench. Using a close and pronated grip (palms facing forward) that is around shoulder width, unlock the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on your middle chest. Tip: Make sure that as opposed to a regular bench press, you keep the elbows close to the torso at all times in order to maximize triceps involvement.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Close-Grip_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Close-Grip_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Close-Grip_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-702",
    "name": "Smith Machine Decline Press",
    "muscle_group": "Chest",
    "tier": "A",
    "focus": "Strength",
    "cue": "Position a decline bench in the rack so that the bar will be above your chest. Load an appropriate weight and take your place on the bench.",
    "rationale": "Rotate the bar to unhook it from the rack and fully extend your arms. Your back should be slightly arched and your shoulder blades retracted. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Decline_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Decline_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Decline_Press/1.jpg"
    ]
  },
  {
    "id": "local-703",
    "name": "Smith Machine Hang Power Clean",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position the bar at knee height and load it to an appropriate weight.",
    "rationale": "Take a pronated grip on the bar outside of shoulder width and unhook the bar from the machine. Your arms should be fully extended with your head and chest up. Your elbows should be pointed out with your shoulders back and down. Your hips should be back, loading the tension into the hamstrings. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Hang_Power_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Hang_Power_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Hang_Power_Clean/1.jpg"
    ]
  },
  {
    "id": "local-704",
    "name": "Smith Machine Hip Raise",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position a bench in the rack and load the bar to an appropriate weight. Lie down on the bench, placing the bottom of your feet against the bar. Unlock the bar and extend your legs. You may need to use your hands to assist you. For added stability grasp the sides of the Smith Machine. This will be your starting position.",
    "rationale": "Initiate the movement by rotating your pelvis, flexing your spine to raise your hips off of the bench. Maintain a slight bend in the knees throughout the motion.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Hip_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Hip_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Hip_Raise/1.jpg"
    ]
  },
  {
    "id": "local-705",
    "name": "Smith Machine Incline Bench Press",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Place an incline bench underneath the smith machine. Place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Once the weight you need is selected, lie down on the incline bench and make sure your upper chest is aligned with the barbell. Using a pronated grip (palms facing forward) that is wider than shoulder width, unlock the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on your upper chest.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Incline_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-706",
    "name": "Smith Machine Leg Press",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position a Smith machine bar a couple feet off of the ground. Ensure that it is resting on the safeties. After loading the bar to an appropriate weight, lie underneath the bar. Place the middle of your feet on the bar, tucking your knees to your chest. This will be your starting position.",
    "rationale": "Begin the movement by driving through your feet to move the bar upward, extending the hips and knees. Do not lock out your knees.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Leg_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Leg_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Leg_Press/1.jpg"
    ]
  },
  {
    "id": "local-707",
    "name": "Smith Machine One-Arm Upright Row",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "With the bar at thigh level, load an appropriate weight.",
    "rationale": "Take a wide grip on the bar and unhook the weight, removing your off hand from the bar. Your arm should be extended as you stand up straight with your head and chest up. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_One-Arm_Upright_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_One-Arm_Upright_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_One-Arm_Upright_Row/1.jpg"
    ]
  },
  {
    "id": "local-708",
    "name": "Smith Machine Overhead Shoulder Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, place a flat bench (or preferably one with back support) underneath a smith machine. Position the barbell at a height so that when seated on the flat bench, the arms must be almost fully extended to reach the barbell.",
    "rationale": "Once you have the correct height, sit slightly in behind the barbell so that there is an imaginary straight line from the tip of your nose to the barbell. Your feet should be stationary. Grab the barbell with the palms facing forward, unlock it and lift it up so that your arms are fully extended. This is the starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Overhead_Shoulder_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Overhead_Shoulder_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Overhead_Shoulder_Press/1.jpg"
    ]
  },
  {
    "id": "local-709",
    "name": "Smith Machine Pistol Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, first set the bar to a position that best matches your height. Step under it and position the bar across the back of your shoulders.",
    "rationale": "Take the bar with your hands facing forward, unlock it and lift it off the rack by extending your legs. 3",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Pistol_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Pistol_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Pistol_Squat/1.jpg"
    ]
  },
  {
    "id": "local-710",
    "name": "Smith Machine Reverse Calf Raises",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Adjust the barbell on the smith machine to fit your height and align a raised platform right under the bar.",
    "rationale": "Stand on the platform with the heels of your feet secured on top of it with the balls of your feet extending off it. Position your toes facing forward with a shoulder width stance.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Reverse_Calf_Raises/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Reverse_Calf_Raises/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Reverse_Calf_Raises/1.jpg"
    ]
  },
  {
    "id": "local-711",
    "name": "Smith Machine Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, first set the bar on the height that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side (palms facing forward), unlock it and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/1.jpg"
    ]
  },
  {
    "id": "local-712",
    "name": "Smith Machine Stiff-Legged Deadlift",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, set the bar on the smith machine to a height that is around the middle of your thighs. Once the correct height is chosen and the bar is loaded, grasp the bar using a pronated (palms forward) grip that is shoulder width apart. You may need some wrist wraps if using a significant amount of weight.",
    "rationale": "Lift the bar up by fully extending your arms while keeping your back straight. Stand with your torso straight and your legs spaced using a shoulder width or narrower stance. The knees should be slightly bent. This is your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Stiff-Legged_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Stiff-Legged_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Stiff-Legged_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-713",
    "name": "Smith Machine Upright Row",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, set the bar on the smith machine to a height that is around the middle of your thighs. Once the correct height is chosen and the bar is loaded, grasp the bar using a pronated (palms forward) grip that is shoulder width apart. You may need some wrist wraps if using a significant amount of weight.",
    "rationale": "Lift the barbell up and fully extend your arms with your back straight. There should be a slight bend at the elbows. This is the starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Upright_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Upright_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Upright_Row/1.jpg"
    ]
  },
  {
    "id": "local-714",
    "name": "Smith Single-Leg Split Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, place a flat bench 2-3 feet behind the smith machine. Then, set the bar on the height that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side (palms facing forward), unlock it and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Single-Leg_Split_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Single-Leg_Split_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Single-Leg_Split_Squat/1.jpg"
    ]
  },
  {
    "id": "local-715",
    "name": "Snatch",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Olympic weightlifting",
    "cue": "Place your feet at a shoulder width stance with the barbell resting right above the connection between the toes and the rest of the foot.",
    "rationale": "With a palms facing down grip, bend at the knees and keeping the back flat grab the bar using a wider than shoulder width grip. Bring the hips down and make sure that your body drops as if you were going to sit on a chair. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch/1.jpg"
    ]
  },
  {
    "id": "local-716",
    "name": "Snatch Balance",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with the feet in the pulling position, the bar racked across the back of the shoulders, and the hands placed in a wide snatch grip.",
    "rationale": "Pop the bar with an abrupt dip and drive of the knees, and aggressively drive under the bar, transitioning the feet into the receiving position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Balance/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Balance/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Balance/1.jpg"
    ]
  },
  {
    "id": "local-717",
    "name": "Snatch Deadlift",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Olympic weightlifting",
    "cue": "The snatch deadlift strengthens the first pull of the snatch. Begin with a wide snatch grip with the barbell placed on the platform. The feet should be directly under the hips, with the feet turned out. Squat down to the bar, keeping the back in absolute extension with the head facing forward.",
    "rationale": "Initiate the movement by driving through the heels, raising the hips. The back angle should remain the same until the bar passes the knees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-718",
    "name": "Snatch Pull",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "With a barbell on the floor close to the shins, take a wide snatch grip. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.",
    "rationale": "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. Move the weight with control as you continue to above the knees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Pull/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Pull/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Pull/1.jpg"
    ]
  },
  {
    "id": "local-719",
    "name": "Snatch Shrug",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a wide grip, with the bar hanging at the mid thigh position. You can use a hook or overhand grip. Your back should be straight and inclined slightly forward.",
    "rationale": "Shrug your shoulders towards your ears. While this exercise can usually by loaded with heavier weight than a snatch, avoid overloading to the point that the execution slows down.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Shrug/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Shrug/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_Shrug/1.jpg"
    ]
  },
  {
    "id": "local-720",
    "name": "Snatch from Blocks",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a loaded barbell on boxes or stands of the desired height. A wide grip should be taken on the bar. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar, with the elbows pointed out. This will be the starting position.",
    "rationale": "Begin the first pull by driving through the front of the heels, raising the bar from the boxes.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_from_Blocks/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_from_Blocks/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch_from_Blocks/1.jpg"
    ]
  },
  {
    "id": "local-721",
    "name": "Speed Band Overhead Triceps",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "For this exercise anchor a band to the ground. We used an incline bench and anchored the band to the base, standing over the bench. Alternatively, this could be performed standing on the band.",
    "rationale": "To begin, pull the band behind your head, holding it with a pronated grip and your elbows up. This will be your starting position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Band_Overhead_Triceps/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Band_Overhead_Triceps/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Band_Overhead_Triceps/1.jpg"
    ]
  },
  {
    "id": "local-722",
    "name": "Speed Box Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "Attach bands to the bar that are securely anchored near the ground. You may need to choke the bands to get adequate tension.",
    "rationale": "Use a box of an appropriate height for this exercise. Load the bar to a weight that still requires effort, but isn't so heavy that speed is compromised. Typically, that will be between 50-70% of your one rep max.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Box_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Box_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Box_Squat/1.jpg"
    ]
  },
  {
    "id": "local-723",
    "name": "Speed Squats",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Squats/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Squats/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Speed_Squats/1.jpg"
    ]
  },
  {
    "id": "local-724",
    "name": "Spell Caster",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a dumbbell in each hand with a pronated grip. Your feet should be wide with your hips and knees extended. This will be your starting position.",
    "rationale": "Begin the movement by pulling both of the dumbbells to one side next to your hip, rotating your torso.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spell_Caster/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spell_Caster/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spell_Caster/1.jpg"
    ]
  },
  {
    "id": "local-725",
    "name": "Spider Crawl",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Begin in a prone position on the floor. Support your weight on your hands and toes, with your feet together and your body straight. Your arms should be bent to 90 degrees. This will be your starting position.",
    "rationale": "Initiate the movement by raising one foot off of the ground. Externally rotate the leg and bring the knee toward your elbow, as far forward as possible.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Crawl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Crawl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Crawl/1.jpg"
    ]
  },
  {
    "id": "local-726",
    "name": "Spider Curl",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start out by setting the bar on the part of the preacher bench that you would normally sit on. Make sure to align the barbell properly so that it is balanced and will not fall off.",
    "rationale": "Move to the front side of the preacher bench (the part where the arms usually lay) and position yourself to lay at a 45 degree slant with your torso and stomach pressed against the front side of the preacher bench.",
    "equipment": "E-z curl bar",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/1.jpg"
    ]
  },
  {
    "id": "local-727",
    "name": "Spinal Stretch",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Sit in a chair so your back is straight and your feet planted on the floor.",
    "rationale": "Interlace your fingers behind your head, elbows out and your chin down.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spinal_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spinal_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spinal_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-728",
    "name": "Split Clean",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "With a barbell on the floor close to the shins, take an overhand grip just outside the legs. Lower your hips with the weight focused on the heels, back straight, head facing forward, chest up, with your shoulders just in front of the bar. This will be your starting position.",
    "rationale": "Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight. Move the weight with control as you continue to above the knees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Clean/1.jpg"
    ]
  },
  {
    "id": "local-729",
    "name": "Split Jerk",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Olympic weightlifting",
    "cue": "Standing with the weight racked on the front of the shoulders, begin with the dip. With your feet directly under your hips, flex the knees without moving the hips backward.",
    "rationale": "Go down only slightly, and reverse direction as powerfully as possible. Drive through the heels create as much speed and force as possible, and be sure to move your head out of the way as the bar leaves the shoulders. At this moment as the feet leave the floor, the feet must be placed into the receiving position as quickly as possible.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-730",
    "name": "Split Jump",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "Assume a lunge stance position with one foot forward with the knee bent, and the rear knee nearly touching the ground.",
    "rationale": "Ensure that the front knee is over the midline of the foot.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Jump/1.jpg"
    ]
  },
  {
    "id": "local-731",
    "name": "Split Snatch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a loaded barbell on the floor. The bar should be close to or touching the shins, and a wide grip should be taken on the bar. The feet should be directly below the hips, with the feet turned out as needed. Lower the hips, with the chest up and the head looking forward. The shoulders should be just in front of the bar. This will be the starting position.",
    "rationale": "Begin the first pull by driving through the front of the heels, raising the bar from the ground. The back angle should stay the same until the bar passes the knees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Snatch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Snatch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Snatch/1.jpg"
    ]
  },
  {
    "id": "local-732",
    "name": "Split Squat with Dumbbells",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Position yourself into a staggered stance with the rear foot elevated and front foot forward.",
    "rationale": "Hold a dumbbell in each hand, letting them hang at the sides. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/1.jpg"
    ]
  },
  {
    "id": "local-733",
    "name": "Split Squats",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Being in a standing position. Jump into a split leg position, with one leg forward and one leg back, flexing the knees and lowering your hips slightly as you do so.",
    "rationale": "As you descend, immediately reverse direction, standing back up and jumping, reversing the position of your legs. Repeat 5-10 times on each leg.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/1.jpg"
    ]
  },
  {
    "id": "local-734",
    "name": "Squat Jerk",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Standing with the weight racked on the front of the shoulders, begin with the dip. With your feet directly under your hips, flex the knees without moving the hips backward. Go down only slightly, and reverse direction as powerfully as possible. Drive through the heels create as much speed and force as possible, and be sure to move your head out of the way as the bar leaves the shoulders.",
    "rationale": "At this moment as the feet leave the floor, the feet must be placed into the receiving position as quickly as possible. In the brief moment the feet are not actively driving against the platform, the athlete's effort to push the bar up will drive them down. The feet should move forcefully to just outside the hips, turned out as necessary. Receive the bar with your body in a full squat and the arms fully extended overhead.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-735",
    "name": "Squat with Bands",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Powerlifting",
    "cue": "Set up the bands on the sleeves, secured to either band pegs, the rack, or dumbbells so that there is appropriate tension.",
    "rationale": "Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders. Remove the bar from the rack, creating a tight arch in your lower back, and step back into position. Place your feet wide for more emphasis on the back, glutes, adductors, and hamstrings. Keep your head facing forward.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Bands/1.jpg"
    ]
  },
  {
    "id": "local-736",
    "name": "Squat with Chains",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "To set up the chains, begin by looping the leader chain over the sleeves of the bar. The heavy chain should be attached using a snap hook. Adjust the length of the lead chain so that a few links are still on the floor at the top of the movement.",
    "rationale": "Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows forward, attempting to bend the bar across your shoulders. Remove the bar from the rack, creating a tight arch in your lower back, and step back into position. Place your feet wide for more emphasis on the back, glutes, adductors, and hamstrings. Keep your head facing forward.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Chains/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Chains/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Chains/1.jpg"
    ]
  },
  {
    "id": "local-737",
    "name": "Squat with Plate Movers",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, first set the bar on a rack to just below shoulder level. Position a weight plate on the ground a couple feet back from the rack. Once the bar is loaded, step under it and place the back of your shoulders across it.",
    "rationale": "Hold on to the bar with both hands and lift it off the rack by first pushing with your legs and at the same time straighten your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Plate_Movers/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Plate_Movers/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squat_with_Plate_Movers/1.jpg"
    ]
  },
  {
    "id": "local-738",
    "name": "Squats - With Bands",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "To start out, make sure that the exercise band is at an even split between both the left and right side of the body. To do this, use your hands to grab both sides of the band and place both feet in the middle of the band. Your feet should be shoulder width apart from each other.",
    "rationale": "When holding the bands, they should be the same height on each side. You should be using a pronated grip (palms facing forward) and have the handles of the bands next to your face for this exercise. This is the starting position.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squats_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squats_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Squats_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-739",
    "name": "Stairmaster",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "To begin, step onto the stairmaster and select the desired option from the menu. You can choose a manual setting, or you can select a program to run. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise.",
    "rationale": "Pump your legs up and down in an established rhythm, driving the pedals down but not all the way to the floor. It is recommended that you maintain your grip on the handles so that you don't fall. The handles can be used to monitor your heart rate to help you stay at an appropriate intensity.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stairmaster/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stairmaster/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stairmaster/1.jpg"
    ]
  },
  {
    "id": "local-740",
    "name": "Standing Alternating Dumbbell Press",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand with a dumbbell in each hand. Raise the dumbbells to your shoulders with your palms facing forward and your elbows pointed out. This will be your starting position.",
    "rationale": "Extend one arm to press the dumbbell straight up, keeping your off hand in place. Do not lean or jerk the weight during the movement.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Alternating_Dumbbell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Alternating_Dumbbell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Alternating_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": "local-741",
    "name": "Standing Barbell Calf Raise",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the bar on the back of your shoulders (slightly below the neck).",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/1.jpg"
    ]
  },
  {
    "id": "local-742",
    "name": "Standing Barbell Press Behind Neck",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for easier pick up of the bar. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Press_Behind_Neck/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Press_Behind_Neck/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Press_Behind_Neck/1.jpg"
    ]
  },
  {
    "id": "local-743",
    "name": "Standing Bent-Over One-Arm Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "With a dumbbell in one hand and the palm facing your torso, bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Make sure that you keep the head up.",
    "rationale": "The upper arm should be close to the torso and parallel to the floor while the forearm is pointing towards the floor as the hand holds the weight. Tip: There should be a 90-degree angle between the forearm and the upper arm. This is your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bent-Over_One-Arm_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bent-Over_One-Arm_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bent-Over_One-Arm_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-744",
    "name": "Standing Bent-Over Two-Arm Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "With a dumbbell in each hand and the palms facing your torso, bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Make sure that you keep the head up. The upper arms should be close to the torso and parallel to the floor while the forearms are pointing towards the floor as the hands hold the weights. Tip: There should be a 90-degree angle between the forearms and the upper arm. This is your starting position.",
    "rationale": "Keeping the upper arms stationary, use the triceps to lift the weights as you exhale until the forearms are parallel to the floor and the whole arms are extended. Like many other arm exercises, only the forearm moves.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bent-Over_Two-Arm_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bent-Over_Two-Arm_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bent-Over_Two-Arm_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-745",
    "name": "Standing Biceps Cable Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up with your torso upright while holding a cable curl bar that is attached to a low pulley. Grab the cable bar at shoulder width and keep the elbows close to the torso. The palm of your hands should be facing up (supinated grip). This will be your starting position.",
    "rationale": "While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second as you squeeze the muscle.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Cable_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Cable_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Cable_Curl/1.jpg"
    ]
  },
  {
    "id": "local-746",
    "name": "Standing Biceps Stretch",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Clasp your hands behind your back with your palms together, straighten arms and then rotate them so your palms face downward.",
    "rationale": "Raise your arms up and hold until you feel a stretch in your biceps.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-747",
    "name": "Standing Bradford Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Place a loaded bar at shoulder level in a rack. With a pronated grip at shoulder width, begin with the bar racked across the front of your shoulders. This is your starting position.",
    "rationale": "Initiate the lift by extending the elbows to press the bar overhead. Avoid locking out the elbow as you move the weight behind your head.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bradford_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bradford_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Bradford_Press/1.jpg"
    ]
  },
  {
    "id": "local-748",
    "name": "Standing Cable Chest Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position dual pulleys to chest height and select an appropriate weight. Stand a foot or two in front of the cables, holding one in each hand. You can stagger your stance for better stability.",
    "rationale": "Position the upper arm at a 90 degree angle with the shoulder blades together. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Chest_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Chest_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Chest_Press/1.jpg"
    ]
  },
  {
    "id": "local-749",
    "name": "Standing Cable Lift",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Connect a standard handle on a tower, and move the cable to the lowest pulley position.",
    "rationale": "With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable. Your outstretched arm should be aligned with the cable.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Lift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Lift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Lift/1.jpg"
    ]
  },
  {
    "id": "local-750",
    "name": "Standing Cable Wood Chop",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Connect a standard handle to a tower, and move the cable to the highest pulley position.",
    "rationale": "With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable. Your outstretched arm should be aligned with the cable.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/1.jpg"
    ]
  },
  {
    "id": "local-751",
    "name": "Standing Calf Raises",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the padded lever of the calf raise machine to fit your height.",
    "rationale": "Place your shoulders under the pads provided and position your toes facing forward (or using any of the two other positions described at the beginning of the chapter). The balls of your feet should be secured on top of the calf block with the heels extending off it. Push the lever up by extending your hips and knees until your torso is standing erect. The knees should be kept with a slight bend; never locked. Toes should be facing forward, outwards or inwards as described at the beginning of the chapter. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/1.jpg"
    ]
  },
  {
    "id": "local-752",
    "name": "Standing Concentration Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Taking a dumbbell in your working hand, lean forward. Allow your working arm to hang perpendicular to the ground with the elbow pointing out. This will be your starting position.",
    "rationale": "Flex the elbow to curl the weight, keeping the upper arm stationary. At the top of the repetition, flex the biceps and pause.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Concentration_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Concentration_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Concentration_Curl/1.jpg"
    ]
  },
  {
    "id": "local-753",
    "name": "Standing Dumbbell Calf Raise",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand with your torso upright holding two dumbbells in your hands by your sides. Place the ball of the foot on a sturdy and stable wooden board (that is around 2-3 inches tall) while your heels extend off and touch the floor. This will be your starting position.",
    "rationale": "With the toes pointing either straight (to hit all parts equally), inwards (for emphasis on the outer head) or outwards (for emphasis on the inner head), raise the heels off the floor as you exhale by contracting the calves. Hold the top contraction for a second.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/1.jpg"
    ]
  },
  {
    "id": "local-754",
    "name": "Standing Dumbbell Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Standing with your feet shoulder width apart, take a dumbbell in each hand. Raise the dumbbells to head height, the elbows out and about 90 degrees. This will be your starting position.",
    "rationale": "Maintaining strict technique with no leg drive or leaning back, extend through the elbow to raise the weights together directly above your head.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": "local-755",
    "name": "Standing Dumbbell Reverse Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "To begin, stand straight with a dumbbell in each hand using a pronated grip (palms facing down). Your arms should be fully extended while your feet are shoulder width apart from each other. This is the starting position.",
    "rationale": "While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a second as you squeeze the muscle.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Reverse_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Reverse_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Reverse_Curl/1.jpg"
    ]
  },
  {
    "id": "local-756",
    "name": "Standing Dumbbell Straight-Arm Front Delt Raise Above Head",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Hold the dumbbells in front of your thighs, palms facing your thighs.",
    "rationale": "Keep your arms straight with a slight bend at the elbows but keep them locked. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Straight-Arm_Front_Delt_Raise_Above_Head/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Straight-Arm_Front_Delt_Raise_Above_Head/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Straight-Arm_Front_Delt_Raise_Above_Head/1.jpg"
    ]
  },
  {
    "id": "local-757",
    "name": "Standing Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, stand up with a dumbbell held by both hands. Your feet should be about shoulder width apart from each other. Slowly use both hands to grab the dumbbell and lift it over your head until both arms are fully extended.",
    "rationale": "The resistance should be resting in the palms of your hands with your thumbs around it. The palm of the hands should be facing up towards the ceiling. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-758",
    "name": "Standing Dumbbell Upright Row",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grasp a dumbbell in each hand with a pronated (palms forward) grip that is slightly less than shoulder width. The dumbbells should be resting on top of your thighs. Your arms should be extended with a slight bend at the elbows and your back should be straight. This will be your starting position.",
    "rationale": "Use your side shoulders to lift the dumbbells as you exhale. The dumbbells should be close to the body as you move it up and the elbows should drive the motion. Continue to lift them until they nearly touch your chin. Tip: Your elbows should drive the motion. As you lift the dumbbells, your elbows should always be higher than your forearms. Also, keep your torso stationary and pause for a second at the top of the movement.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/1.jpg"
    ]
  },
  {
    "id": "local-759",
    "name": "Standing Elevated Quad Stretch",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Start by standing with your back about two to three feet away from a bench or step.",
    "rationale": "Lift one leg behind you and rest your foot on the step,either on your instep or the ball of your foot, whichever you find most comfortable.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Elevated_Quad_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Elevated_Quad_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Elevated_Quad_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-760",
    "name": "Standing Front Barbell Raise Over Head",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "To begin, stand straight with a barbell in your hands. You should grip the bar with palms facing down and a closer than shoulder width grip apart from each other.",
    "rationale": "Your feet should be shoulder width apart from each other. Your elbows should be slightly bent. This is the starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Front_Barbell_Raise_Over_Head/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Front_Barbell_Raise_Over_Head/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Front_Barbell_Raise_Over_Head/1.jpg"
    ]
  },
  {
    "id": "local-761",
    "name": "Standing Gastrocnemius Calf Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Place your right heel on a step with your knee extended and lean forward to grab your right toe with your right hand. Your left knee should be slightly bent and your back should be straight.",
    "rationale": "Support your weight on your left leg and place your left hand on your left thigh.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Gastrocnemius_Calf_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-762",
    "name": "Standing Hamstring and Calf Stretch",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Being by looping a belt, band, or rope around one foot. While standing, place that foot forward.",
    "rationale": "Bend your back leg, while keeping the front one straight. Now raise the toes of your front foot off of the ground and lean forward.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hamstring_and_Calf_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hamstring_and_Calf_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hamstring_and_Calf_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-763",
    "name": "Standing Hip Circles",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Begin standing on one leg, holding to a vertical support.",
    "rationale": "Raise the unsupported knee to 90 degrees. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hip_Circles/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hip_Circles/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hip_Circles/1.jpg"
    ]
  },
  {
    "id": "local-764",
    "name": "Standing Hip Flexors",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand up straight with the spine vertical, the left foot slightly in front of the right.",
    "rationale": "Bend both knees and lift the back heel off the floor as you press the right hip forward. You can't get a thorough, deep stretch in this position, however, because it's hard to relax the hip flexor and stand on it at the same time. Switch sides.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hip_Flexors/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hip_Flexors/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Hip_Flexors/1.jpg"
    ]
  },
  {
    "id": "local-765",
    "name": "Standing Inner-Biceps Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up with a dumbbell in each hand being held at arms length. The elbows should be close to the torso. Your legs should be at about shoulder's width apart from each other.",
    "rationale": "Rotate the palms of the hands so that they are facing inward in a neutral position. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Inner-Biceps_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Inner-Biceps_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Inner-Biceps_Curl/1.jpg"
    ]
  },
  {
    "id": "local-766",
    "name": "Standing Lateral Stretch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Take a slightly wider than hip distance stance with your knees slightly bent.",
    "rationale": "Place your right hand on your right hip to support the spine.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Lateral_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Lateral_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Lateral_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-767",
    "name": "Standing Leg Curl",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Adjust the machine lever to fit your height and lie with your torso bent at the waist facing forward around 30-45 degrees (since an angled position is more favorable for hamstrings recruitment) with the pad of the lever on the back of your right leg (just a few inches under the calves) and the front of the right leg on top of the machine pad.",
    "rationale": "Keeping the torso bent forward, ensure your leg is fully stretched and grab the side handles of the machine. Position your toes straight. This will be your starting position.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Leg_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Leg_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Leg_Curl/1.jpg"
    ]
  },
  {
    "id": "local-768",
    "name": "Standing Long Jump",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "This drill is best done in sand or other soft landing surface. Ensure that you are able to measure distance. Stand in a partial squat stance with feet shoulder width apart.",
    "rationale": "Utilizing a big arm swing and a countermovement of the legs, jump forward as far as you can.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Long_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Long_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Long_Jump/1.jpg"
    ]
  },
  {
    "id": "local-769",
    "name": "Standing Low-Pulley Deltoid Raise",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start by standing to the right side of a low pulley row. Use your left hand to come across the body and grab a single handle attached to the low pulley with a pronated grip (palms facing down). Rest your arm in front of you. Your right hand should grab the machine for better support and balance.",
    "rationale": "Make sure that your back is erect and your feet are shoulder width apart from each other. This is the starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_Deltoid_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_Deltoid_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_Deltoid_Raise/1.jpg"
    ]
  },
  {
    "id": "local-770",
    "name": "Standing Low-Pulley One-Arm Triceps Extension",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Grab a single handle with your left arm next to the low pulley machine. Turn away from the machine keeping the handle to the side of your body with your arm fully extended. Now use both hands to elevate the single handle directly above the head with the palm facing forward. Keep your upper arm completely vertical (perpendicular to the floor) and put your right hand on your left elbow to help keep it steady. This is the starting position.",
    "rationale": "Keeping your upper arms close to your head (elbows in) and perpendicular to the floor, lower the resistance in a semicircular motion behind your head until your forearms touch your biceps. Tip: The upper arms should remain stationary and only the forearms should move. Breathe in as you perform this step.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_One-Arm_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_One-Arm_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_One-Arm_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-771",
    "name": "Standing Military Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start by placing a barbell that is about chest high on a squat rack. Once you have selected the weights, grab the barbell using a pronated (palms facing forward) grip. Make sure to grip the bar wider than shoulder width apart from each other.",
    "rationale": "Slightly bend the knees and place the barbell on your collar bone. Lift the barbell up keeping it lying on your chest. Take a step back and position your feet shoulder width apart from each other.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/1.jpg"
    ]
  },
  {
    "id": "local-772",
    "name": "Standing Olympic Plate Hand Squeeze",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, stand straight while holding a weight plate by the ridge at arm's length in each hand using a neutral grip (palms facing in). You feet should be shoulder width apart from each other. This will be your starting position.",
    "rationale": "Lower the plates until the fingers are nearly extended but can still hold weights. Inhale as you lower the plates.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Olympic_Plate_Hand_Squeeze/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Olympic_Plate_Hand_Squeeze/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Olympic_Plate_Hand_Squeeze/1.jpg"
    ]
  },
  {
    "id": "local-773",
    "name": "Standing One-Arm Cable Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start out by grabbing single handle next to the low pulley machine. Make sure you are far enough from the machine so that your arm is supporting the weight.",
    "rationale": "Make sure that your upper arm is stationary, perpendicular to the floor with elbows in and palms facing forward. Your non lifting arm should be grabbing your waist. This will allow you to keep your balance.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Cable_Curl/1.jpg"
    ]
  },
  {
    "id": "local-774",
    "name": "Standing One-Arm Dumbbell Curl Over Incline Bench",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "Stand on the back side of an incline bench as if you were going to be a spotter for someone. Have a dumbbell in one hand and rest it across the incline bench with a supinated (palms up) grip.",
    "rationale": "Position your non lifting hand at the corner or side of the incline bench. The chest should be pressed against the top part of the incline and your feet should be pressed against the floor at a wide stance. This is the starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Curl_Over_Incline_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Curl_Over_Incline_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Curl_Over_Incline_Bench/1.jpg"
    ]
  },
  {
    "id": "local-775",
    "name": "Standing One-Arm Dumbbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "To begin, stand up with a dumbbell held in one hand. Your feet should be about shoulder width apart from each other. Now fully extend the arm with the dumbbell over your head. Tip: The small finger of your hand should be facing the ceiling and the palm of your hand should be facing forward. The dumbbell should be above your head.",
    "rationale": "This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_One-Arm_Dumbbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-776",
    "name": "Standing Overhead Barbell Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, stand up holding a barbell or e-z bar using a pronated grip (palms facing forward) with your hands closer than shoulder width apart from each other. Your feet should be about shoulder width apart.",
    "rationale": "Now elevate the barbell above your head until your arms are fully extended. Keep your elbows in. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Overhead_Barbell_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Overhead_Barbell_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Overhead_Barbell_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-777",
    "name": "Standing Palm-In One-Arm Dumbbell Press",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start by having a dumbbell in one hand with your arm fully extended to the side using a neutral grip. Use your other arm to hold on to an incline bench to keep your balance.",
    "rationale": "Your feet should be shoulder width apart from each other. Now slowly lift the dumbbell up until you create a 90 degree angle with your arm. Note: Your forearm should be perpendicular to the floor. Continue to maintain a neutral grip throughout the entire exercise.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palm-In_One-Arm_Dumbbell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palm-In_One-Arm_Dumbbell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palm-In_One-Arm_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": "local-778",
    "name": "Standing Palms-In Dumbbell Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start by having a dumbbell in each hand with your arm fully extended to the side using a neutral grip. Your feet should be shoulder width apart from each other. Now slowly lift the dumbbells up until you create a 90 degree angle with your arms. Note: Your forearms should be perpendicular to the floor. This the starting position.",
    "rationale": "Continue to maintain a neutral grip throughout the entire exercise. Slowly lift the dumbbells up until your arms are fully extended.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palms-In_Dumbbell_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palms-In_Dumbbell_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palms-In_Dumbbell_Press/1.jpg"
    ]
  },
  {
    "id": "local-779",
    "name": "Standing Palms-Up Barbell Behind The Back Wrist Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start by standing straight and holding a barbell behind your glutes at arm's length while using a pronated grip (palms will be facing back away from the glutes) and having your hands shoulder width apart from each other.",
    "rationale": "You should be looking straight forward while your feet are shoulder width apart from each other. This is the starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palms-Up_Barbell_Behind_The_Back_Wrist_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palms-Up_Barbell_Behind_The_Back_Wrist_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Palms-Up_Barbell_Behind_The_Back_Wrist_Curl/1.jpg"
    ]
  },
  {
    "id": "local-780",
    "name": "Standing Pelvic Tilt",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Start off with your feet hip-distance apart.",
    "rationale": "Bend your knees slightly to keep them soft and springy.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Pelvic_Tilt/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Pelvic_Tilt/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Pelvic_Tilt/1.jpg"
    ]
  },
  {
    "id": "local-781",
    "name": "Standing Rope Crunch",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach a rope to a high pulley and select an appropriate weight.",
    "rationale": "Stand with your back to the cable tower. Take the rope with both hands over your shoulders, holding it to your upper chest. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Rope_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Rope_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Rope_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-782",
    "name": "Standing Soleus And Achilles Stretch",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand with your feet hip-distance apart, one foot slightly in front of the other.",
    "rationale": "Bend both knees, keeping your back heel on the floor. Switch sides.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Soleus_And_Achilles_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Soleus_And_Achilles_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Soleus_And_Achilles_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-783",
    "name": "Standing Toe Touches",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Stand with some space in front and behind you.",
    "rationale": "Bend at the waist, keeping your legs straight, until you can relax and let your upper body hang down in front of you. Let your arms and hands hang down naturally. Hold for 10 to 20 seconds.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Toe_Touches/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Toe_Touches/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Toe_Touches/1.jpg"
    ]
  },
  {
    "id": "local-784",
    "name": "Standing Towel Triceps Extension",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, stand up with both arms fully extended above the head holding one end of a towel with both hands. Your elbows should be in and the arms perpendicular to the floor with the palms facing each other while your feet should be shoulder width apart from each other. This is the starting position.",
    "rationale": "Now communicate with your partner so that he/she can grip the other side of the towel to apply resistance. Keeping your upper arms close to your head (elbows in) and perpendicular to the floor, lower the resistance in a semicircular motion behind your head until your forearms touch your biceps. Tip: The upper arms should remain stationary and only the forearms should move. Breathe in as you perform this step.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Towel_Triceps_Extension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Towel_Triceps_Extension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Towel_Triceps_Extension/1.jpg"
    ]
  },
  {
    "id": "local-785",
    "name": "Standing Two-Arm Overhead Throw",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Plyometrics",
    "cue": "Stand with your feet shoulder width apart holding a medicine ball in both hands. To begin, reach the medicine ball deep behind your head as you bend the knees slightly and lean back.",
    "rationale": "Violently throw the ball forward, flexing at the hip and using your whole body to complete the movement.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Two-Arm_Overhead_Throw/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Two-Arm_Overhead_Throw/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Two-Arm_Overhead_Throw/1.jpg"
    ]
  },
  {
    "id": "local-786",
    "name": "Star Jump",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Begin in a relaxed stance with your feet shoulder width apart and hold your arms close to the body.",
    "rationale": "To initiate the move, squat down halfway and explode back up as high as possible. Fully extend your entire body, spreading your legs and arms away from the body.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Star_Jump/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Star_Jump/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Star_Jump/1.jpg"
    ]
  },
  {
    "id": "local-787",
    "name": "Step-up with Knee Raise",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand facing a box or bench of an appropriate height with your feet together. This will be your starting position.",
    "rationale": "Begin the movement by stepping up, putting your left foot on the top of the bench. Extend through the hip and knee of your front leg to stand up on the box. As you stand on the box with your left leg, flex your right knee and hip, bringing your knee as high as you can.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step-up_with_Knee_Raise/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step-up_with_Knee_Raise/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step-up_with_Knee_Raise/1.jpg"
    ]
  },
  {
    "id": "local-788",
    "name": "Step Mill",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "To begin, step onto the stepmill and select the desired option from the menu. You can choose a manual setting, or you can select a program to run. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. Use caution so that you don't trip as you climb the stairs. It is recommended that you maintain your grip on the handles so that you don't fall.",
    "rationale": "Stepmills offer convenience, cardiovascular benefits, and usually have less impact than running outside while offering a similar rate of calories burned. They are typically much harder than other cardio equipment. A 150 lb person will typically burn over 300 calories in 30 minutes, compared to about 175 calories walking.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step_Mill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step_Mill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step_Mill/1.jpg"
    ]
  },
  {
    "id": "local-789",
    "name": "Stiff-Legged Barbell Deadlift",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Grasp a bar using an overhand grip (palms facing down). You may need some wrist wraps if using a significant amount of weight.",
    "rationale": "Stand with your torso straight and your legs spaced using a shoulder width or narrower stance. The knees should be slightly bent. This is your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-790",
    "name": "Stiff-Legged Dumbbell Deadlift",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "Grasp a couple of dumbbells holding them by your side at arm's length.",
    "rationale": "Stand with your torso straight and your legs spaced using a shoulder width or narrower stance. The knees should be slightly bent. This is your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-791",
    "name": "Stiff Leg Barbell Good Morning",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff_Leg_Barbell_Good_Morning/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff_Leg_Barbell_Good_Morning/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff_Leg_Barbell_Good_Morning/1.jpg"
    ]
  },
  {
    "id": "local-792",
    "name": "Stomach Vacuum",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Stretching",
    "cue": "To begin, stand straight with your feet shoulder width apart from each other. Place your hands on your hips. This is the starting position.",
    "rationale": "Now slowly inhale as much air as possible and then start to exhale as much as possible while bringing your stomach in as much as possible and hold this position. Try to visualize your navel touching your backbone.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stomach_Vacuum/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stomach_Vacuum/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stomach_Vacuum/1.jpg"
    ]
  },
  {
    "id": "local-793",
    "name": "Straight-Arm Dumbbell Pullover",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a dumbbell standing up on a flat bench.",
    "rationale": "Ensuring that the dumbbell stays securely placed at the top of the bench, lie perpendicular to the bench (torso across it as in forming a cross) with only your shoulders lying on the surface. Hips should be below the bench and legs bent with feet firmly on the floor. The head will be off the bench as well.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Dumbbell_Pullover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Dumbbell_Pullover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Dumbbell_Pullover/1.jpg"
    ]
  },
  {
    "id": "local-794",
    "name": "Straight-Arm Pulldown",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "You will start by grabbing the wide bar from the top pulley of a pulldown machine and using a wider than shoulder-width pronated (palms down) grip. Step backwards two feet or so.",
    "rationale": "Bend your torso forward at the waist by around 30-degrees with your arms fully extended in front of you and a slight bend at the elbows. If your arms are not fully extended then you need to step a bit more backwards until they are. Once your arms are fully extended and your torso is slightly bent at the waist, tighten the lats and then you are ready to begin.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/1.jpg"
    ]
  },
  {
    "id": "local-795",
    "name": "Straight Bar Bench Mid Rows",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Place a loaded barbell on the end of a bench. Standing on the bench behind the bar, take a medium, pronated grip. Stand with your hips back and chest up, maintaining a neutral spine. This will be your starting position.",
    "rationale": "Row the bar to your torso by retracting the shoulder blades and flexing the elbows. Use a controlled movement with no jerking.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Bar_Bench_Mid_Rows/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Bar_Bench_Mid_Rows/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Bar_Bench_Mid_Rows/1.jpg"
    ]
  },
  {
    "id": "local-796",
    "name": "Straight Raises on Incline Bench",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place a bar on the ground behind the head of an incline bench.",
    "rationale": "Lay on the bench face down. With a pronated grip, pick the barbell up from the floor, keeping your arms straight. Allow the bar to hang straight down. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Raises_on_Incline_Bench/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Raises_on_Incline_Bench/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Raises_on_Incline_Bench/1.jpg"
    ]
  },
  {
    "id": "local-797",
    "name": "Stride Jump Crossover",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Stand to the side of a box with your inside foot on top of it, close to the edge.",
    "rationale": "Begin by swinging the arms upward as you push through the top leg, jumping upward as high as possible. Attempt to drive the opposite knee upward.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stride_Jump_Crossover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stride_Jump_Crossover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stride_Jump_Crossover/1.jpg"
    ]
  },
  {
    "id": "local-798",
    "name": "Sumo Deadlift",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Powerlifting",
    "cue": "Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip. Relax the shoulders, which in effect lengthens your arms.",
    "rationale": "Take a breath, and then lower your hips, looking forward with your head with your chest up. Drive through the floor, spreading your feet apart, with your weight on the back half of your feet. Extend through the hips and knees.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-799",
    "name": "Sumo Deadlift with Bands",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Powerlifting",
    "cue": "To deadlift with short bands, simply loop them over the bar before you start, and step into them to set up. Ensure that they under the back half of your foot, directly where you are driving into the floor.",
    "rationale": "Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Bands/1.jpg"
    ]
  },
  {
    "id": "local-800",
    "name": "Sumo Deadlift with Chains",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Powerlifting",
    "cue": "You can attach the chains to the sleeves of the bar, or just drape the middle over the bar so there is a greater weight increase as you lift. Attempt to keep the ends of the chains away from the plates so you don't hit them when you lower the weight.",
    "rationale": "Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip. Relax the shoulders, which in effect lengthens your arms.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Chains/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Chains/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift_with_Chains/1.jpg"
    ]
  },
  {
    "id": "local-801",
    "name": "Superman",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Stretching",
    "cue": "To begin, lie straight and face down on the floor or exercise mat. Your arms should be fully extended in front of you. This is the starting position.",
    "rationale": "Simultaneously raise your arms, legs, and chest off of the floor and hold this contraction for 2 seconds. Tip: Squeeze your lower back to get the best results from this exercise. Remember to exhale during this movement. Note: When holding the contracted position, you should look like superman when he is flying.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/1.jpg"
    ]
  },
  {
    "id": "local-802",
    "name": "Supine Chest Throw",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "This drill is great for chest passes when you lack a partner or a wall of sufficient strength. Lay on the ground on your back with your knees bent.",
    "rationale": "Begin with the ball on your chest, held with both hands on the bottom.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_Chest_Throw/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_Chest_Throw/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_Chest_Throw/1.jpg"
    ]
  },
  {
    "id": "local-803",
    "name": "Supine One-Arm Overhead Throw",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Plyometrics",
    "cue": "Lay on the ground on your back with your knees bent. Hold the ball with one hand, extending the arm fully behind your head. This will be your starting position.",
    "rationale": "Initiate the movement at the shoulder, throwing the ball directly forward of you as you sit up, attempting to go for maximum distance.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_One-Arm_Overhead_Throw/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_One-Arm_Overhead_Throw/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_One-Arm_Overhead_Throw/1.jpg"
    ]
  },
  {
    "id": "local-804",
    "name": "Supine Two-Arm Overhead Throw",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Lay on the ground on your back with your knees bent.",
    "rationale": "Hold the ball with both hands, extending the arms fully behind your head. This will be your starting position.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_Two-Arm_Overhead_Throw/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_Two-Arm_Overhead_Throw/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Supine_Two-Arm_Overhead_Throw/1.jpg"
    ]
  },
  {
    "id": "local-805",
    "name": "Suspended Fallout",
    "muscle_group": "Core",
    "tier": "S",
    "focus": "Strength",
    "cue": "Adjust the straps so the handles are at an appropriate height, below waist level.",
    "rationale": "Begin standing and grasping the handles. Lean into the straps, moving to an incline push-up position. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Fallout/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Fallout/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Fallout/1.jpg"
    ]
  },
  {
    "id": "local-806",
    "name": "Suspended Push-Up",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Anchor your suspension straps securely to the top of a rack or other object.",
    "rationale": "Leaning into the straps, take a handle in each hand and move into a push-up plank position. You should be as close to parallel to the ground as you can manage with your arms fully extended, maintaining good posture.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Push-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Push-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Push-Up/1.jpg"
    ]
  },
  {
    "id": "local-807",
    "name": "Suspended Reverse Crunch",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Secure a set of suspension straps with the handles hanging about a foot off of the ground. Move yourself into a pushup plank position facing away from the rack.",
    "rationale": "Place your feet into the handles. You should maintain a straight posture, not allowing the hips to sag. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Reverse_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Reverse_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Reverse_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-808",
    "name": "Suspended Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Suspend your straps at around chest height. Take a handle in each hand and lean back. Keep your body erect and your head and chest up. Your arms should be fully extended. This will be your starting position.",
    "rationale": "Begin by flexing the elbow to initiate the movement. Protract your shoulder blades as you do so.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Row/1.jpg"
    ]
  },
  {
    "id": "local-809",
    "name": "Suspended Split Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Suspend your straps so the handles are 18-30 inches from the floor.",
    "rationale": "Facing away from the setup, place your rear foot into the handle behind you. Keep your head looking forward and your chest up, with your knee slightly bent. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Split_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Split_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Suspended_Split_Squat/1.jpg"
    ]
  },
  {
    "id": "local-810",
    "name": "Svend Press",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Begin in a standing position.",
    "rationale": "Press two lightweight plates together with your hands. Hold the plates together close to your chest to create an isometric contraction in your chest muscles. Your fingers should be pointed forward. This is your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Svend_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Svend_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Svend_Press/1.jpg"
    ]
  },
  {
    "id": "local-811",
    "name": "T-Bar Row with Handle",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Position a bar into a landmine or in a corner to keep it from moving. Load an appropriate weight onto your end.",
    "rationale": "Stand over the bar, and position a Double D row handle around the bar next to the collar. Using your hips and legs, rise to a standing position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/1.jpg"
    ]
  },
  {
    "id": "local-812",
    "name": "Tate Press",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on a flat bench with a dumbbell in each hand on top of your thighs. The palms of your hand will be facing each other.",
    "rationale": "By using your thighs to help you get the dumbbells up, clean the dumbbells one arm at a time so that you can hold them in front of you at shoulder width. Note: when holding the dumbbells in front of you, make sure your arms are wider than shoulder width apart from each other using a pronated (palms forward) grip. Allow your elbows to point out. This is your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tate_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tate_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tate_Press/1.jpg"
    ]
  },
  {
    "id": "local-813",
    "name": "The Straddle",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Begin in a seated, upright position. Start by extending your legs in front of you in a V.",
    "rationale": "With your hands on the floor, lean forward as far as possible. Hold for 10 to 20 seconds.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/The_Straddle/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/The_Straddle/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/The_Straddle/1.jpg"
    ]
  },
  {
    "id": "local-814",
    "name": "Thigh Abductor",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, sit down on the abductor machine and select a weight you are comfortable with. When your legs are positioned properly, grip the handles on each side. Your entire upper body (from the waist up) should be stationary. This is the starting position.",
    "rationale": "Slowly press against the machine with your legs to move them away from each other while exhaling.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/1.jpg"
    ]
  },
  {
    "id": "local-815",
    "name": "Thigh Adductor",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "To begin, sit down on the adductor machine and select a weight you are comfortable with. When your legs are positioned properly on the leg pads of the machine, grip the handles on each side. Your entire upper body (from the waist up) should be stationary. This is the starting position.",
    "rationale": "Slowly press against the machine with your legs to move them towards each other while exhaling.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Adductor/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Adductor/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Adductor/1.jpg"
    ]
  },
  {
    "id": "local-816",
    "name": "Tire Flip",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strongman",
    "cue": "Begin by gripping the bottom of the tire on the tread, and position your feet back a bit. Your chest should be driving into the tire.",
    "rationale": "To lift the tire, extend through the hips, knees, and ankles, driving into the tire and up.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tire_Flip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tire_Flip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tire_Flip/1.jpg"
    ]
  },
  {
    "id": "local-817",
    "name": "Toe Touchers",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Stretching",
    "cue": "To begin, lie down on the floor or an exercise mat with your back pressed against the floor. Your arms should be lying across your sides with the palms facing down.",
    "rationale": "Your legs should be touching each other. Slowly elevate your legs up in the air until they are almost perpendicular to the floor with a slight bend at the knees. Your feet should be parallel to the floor.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Toe_Touchers/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Toe_Touchers/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Toe_Touchers/1.jpg"
    ]
  },
  {
    "id": "local-818",
    "name": "Torso Rotation",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Stand upright holding an exercise ball with both hands. Extend your arms so the ball is straight out in front of you. This will be your starting position.",
    "rationale": "Rotate your torso to one side, keeping your eyes on the ball as you move. Now, rotate back to the opposite direction. Repeat for 10-20 repetitions.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Torso_Rotation/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Torso_Rotation/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Torso_Rotation/1.jpg"
    ]
  },
  {
    "id": "local-819",
    "name": "Trail Running/Walking",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Cardio",
    "cue": "Running or hiking on trails will get the blood pumping and heart beating almost immediately. Make sure you have good shoes. While you use the muscles in your calves and buttocks to pull yourself up a hill, the knees, joints and ankles absorb the bulk of the pounding coming back down. Take smaller steps as you walk downhill, keep your knees bent to reduce the impact and slow down to avoid falling.",
    "rationale": "A 150 lb person can burn over 200 calories for 30 minutes walking uphill, compared to 175 on a flat surface. If running the trail, a 150 lb person can burn well over 500 calories in 30 minutes.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trail_Running_Walking/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trail_Running_Walking/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trail_Running_Walking/1.jpg"
    ]
  },
  {
    "id": "local-820",
    "name": "Trap Bar Deadlift",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "For this exercise load a trap bar, also known as a hex bar, to an appropriate weight resting on the ground. Stand in the center of the apparatus and grasp both handles.",
    "rationale": "Lower your hips, look forward with your head and keep your chest up.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Bar_Deadlift/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Bar_Deadlift/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Bar_Deadlift/1.jpg"
    ]
  },
  {
    "id": "local-821",
    "name": "Tricep Dumbbell Kickback",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start with a dumbbell in each hand and your palms facing your torso. Keep your back straight with a slight bend in the knees and bend forward at the waist. Your torso should be almost parallel to the floor. Make sure to keep your head up. Your upper arms should be close to your torso and parallel to the floor. Your forearms should be pointed towards the floor as you hold the weights. There should be a 90-degree angle formed between your forearm and upper arm. This is your starting position.",
    "rationale": "Now, while keeping your upper arms stationary, exhale and use your triceps to lift the weights until the arm is fully extended. Focus on moving the forearm.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/1.jpg"
    ]
  },
  {
    "id": "local-822",
    "name": "Tricep Side Stretch",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Bring right arm across your body and over your left shoulder, holding your elbow with your left hand, until you feel a stretch in your tricep. Then repeat for your other arm.",
    "rationale": "Targets triceps.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Side_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Side_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Side_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-823",
    "name": "Triceps Overhead Extension with Rope",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach a rope to a low pulley. After selecting an appropriate weight, grasp the rope with both hands and face away from the cable.",
    "rationale": "Position your hands behind your head with your elbows point straight up. Your elbows should start out flexed, and you can stagger your stance and lean gently away from the machine to create greater stability. This will be your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Overhead_Extension_with_Rope/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Overhead_Extension_with_Rope/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Overhead_Extension_with_Rope/1.jpg"
    ]
  },
  {
    "id": "local-824",
    "name": "Triceps Pushdown",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach a straight or angled bar to a high pulley and grab with an overhand grip (palms facing down) at shoulder width.",
    "rationale": "Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the floor. The forearms should be pointing up towards the pulley as they hold the bar. This is your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg"
    ]
  },
  {
    "id": "local-825",
    "name": "Triceps Pushdown - Rope Attachment",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Attach a rope attachment to a high pulley and grab with a neutral grip (palms facing each other).",
    "rationale": "Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the floor. The forearms should be pointing up towards the pulley as they hold the rope with the palms facing each other. This is your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/1.jpg"
    ]
  },
  {
    "id": "local-826",
    "name": "Triceps Pushdown - V-Bar Attachment",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Attach a V-Bar to a high pulley and grab with an overhand grip (palms facing down) at shoulder width.",
    "rationale": "Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the floor. The forearms should be pointing up towards the pulley as they hold the bar. The thumbs should be higher than the small finger. This is your starting position.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/1.jpg"
    ]
  },
  {
    "id": "local-827",
    "name": "Triceps Stretch",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Reach your hand behind your head, grasp your elbow and gently pull. Hold for 10 to 20 seconds, then switch sides.",
    "rationale": "Targets triceps.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-828",
    "name": "Tuck Crunch",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, lie down on the floor or an exercise mat with your back pressed against the floor. Your arms should be lying across your sides with the palms facing down.",
    "rationale": "Your legs should be crossed by wrapping one ankle around the other. Slowly elevate your legs up in the air until your thighs are perpendicular to the floor with a slight bend at the knees. Note: Your knees and toes should be parallel to the floor as opposed to the thighs.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tuck_Crunch/1.jpg"
    ]
  },
  {
    "id": "local-829",
    "name": "Two-Arm Dumbbell Preacher Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab a dumbbell with each arm and place the upper arms on top of the preacher bench or the incline bench. The dumbbell should be held at shoulder length. This will be your starting position.",
    "rationale": "As you breathe in, slowly lower the dumbbells until your upper arm is extended and the biceps is fully stretched.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Dumbbell_Preacher_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Dumbbell_Preacher_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Dumbbell_Preacher_Curl/1.jpg"
    ]
  },
  {
    "id": "local-830",
    "name": "Two-Arm Kettlebell Clean",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Strength",
    "cue": "Place two kettlebells between your feet. To get in the starting position, push your butt back and look straight ahead.",
    "rationale": "Clean the kettlebells to your shoulders by extending through the legs and hips as you raise the kettlebells towards your shoulders. Rotate your wrists as you do so.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Clean/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Clean/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Clean/1.jpg"
    ]
  },
  {
    "id": "local-831",
    "name": "Two-Arm Kettlebell Jerk",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Clean two kettlebells to your shoulders. Clean the kettlebells to your shoulders by extending through the legs and hips as you swing the kettlebells towards your shoulders. Rotate your wrists as you do so, so that the palms face forward. Squat down a few inches and reverse the motion rapidly driving both kettlebells overhead. Immediately after the initial push, squat down again and get under the kettlebells. Once the kettlebells are locked out, stand upright to complete the exercise.",
    "rationale": "Targets shoulders.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Jerk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Jerk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Jerk/1.jpg"
    ]
  },
  {
    "id": "local-832",
    "name": "Two-Arm Kettlebell Military Press",
    "muscle_group": "Shoulders",
    "tier": "B",
    "focus": "Strength",
    "cue": "Clean two kettlebells to your shoulders. Clean the kettlebells to your shoulders by extending through the legs and hips as you swing the kettlebells towards your shoulders. Rotate your wrists as you do so, so that the palms face forward.",
    "rationale": "Press the kettlebells up and out. As the kettlebells pass your head, lean into the weights so that the kettlebells are racked behind your head. Make sure to contract your lats, butt, and stomach for added stability.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Military_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Military_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Military_Press/1.jpg"
    ]
  },
  {
    "id": "local-833",
    "name": "Two-Arm Kettlebell Row",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Place two kettlebells in front of your feet. Bend your knees slightly and then push your butt out as much as possible as you bend over to get in the starting position.",
    "rationale": "Grab both kettlebells and pull them to your stomach, retracting your shoulder blades and flexing the elbows. Keep your back straight. Lower and repeat.",
    "equipment": "Kettlebells",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Two-Arm_Kettlebell_Row/1.jpg"
    ]
  },
  {
    "id": "local-834",
    "name": "Underhand Cable Pulldowns",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit down on a pull-down machine with a wide bar attached to the top pulley. Adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
    "rationale": "Grab the pull-down bar with the palms facing your torso (a supinated grip). Make sure that the hands are placed closer than the shoulder width.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Underhand_Cable_Pulldowns/1.jpg"
    ]
  },
  {
    "id": "local-835",
    "name": "Upper Back-Leg Grab",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "While seated, bend forward to hug your thighs from underneath with both arms.",
    "rationale": "Keep your knees together and your legs extended out as you bring your chest down to your knees. You can also stretch your middle back by pulling your back away from your knees as your hugging them.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back-Leg_Grab/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back-Leg_Grab/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back-Leg_Grab/1.jpg"
    ]
  },
  {
    "id": "local-836",
    "name": "Upper Back Stretch",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Clasp fingers together with your thumbs pointing down, round your shoulders as you reach your hands forward.",
    "rationale": "Targets middle back.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-837",
    "name": "Upright Barbell Row",
    "muscle_group": "Shoulders",
    "tier": "A",
    "focus": "Strength",
    "cue": "Grasp a barbell with an overhand grip that is slightly less than shoulder width. The bar should be resting on the top of your thighs with your arms extended and a slight bend in your elbows. Your back should also be straight. This will be your starting position.",
    "rationale": "Now exhale and use the sides of your shoulders to lift the bar, raising your elbows up and to the side. Keep the bar close to your body as you raise it. Continue to lift the bar until it nearly touches your chin. Tip: Your elbows should drive the motion, and should always be higher than your forearms. Remember to keep your torso stationary and pause for a second at the top of the movement.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/1.jpg"
    ]
  },
  {
    "id": "local-838",
    "name": "Upright Cable Row",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grasp a straight bar cable attachment that is attached to a low pulley with a pronated (palms facing your thighs) grip that is slightly less than shoulder width. The bar should be resting on top of your thighs. Your arms should be extended with a slight bend at the elbows and your back should be straight. This will be your starting position.",
    "rationale": "Use your side shoulders to lift the cable bar as you exhale. The bar should be close to the body as you move it up. Continue to lift it until it nearly touches your chin. Tip: Your elbows should drive the motion. As you lift the bar, your elbows should always be higher than your forearms. Also, keep your torso stationary and pause for a second at the top of the movement.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/1.jpg"
    ]
  },
  {
    "id": "local-839",
    "name": "Upright Row - With Bands",
    "muscle_group": "Other",
    "tier": "B",
    "focus": "Strength",
    "cue": "To begin, stand on an exercise band so that tension begins at arm's length. Grasp the handles using a pronated (palms facing your thighs) grip that is slightly less than shoulder width. The handles should be resting on top of your thighs. Your arms should be extended with a slight bend at the elbows and your back should be straight. This will be your starting position.",
    "rationale": "Use your side shoulders to lift the handles as you exhale. The handles should be close to the body as you move them up. Continue to lift the handles until they nearly touches your chin. Tip: Your elbows should drive the motion. As you lift the handles, your elbows should always be higher than your forearms. Also, keep your torso stationary and pause for a second at the top of the movement.",
    "equipment": "Bands",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Row_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Row_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Row_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-840",
    "name": "Upward Stretch",
    "muscle_group": "Shoulders",
    "tier": "S",
    "focus": "Stretching",
    "cue": "Extend both hands straight above your head, palms touching.",
    "rationale": "Slowly push your hands up and back, keeping your back straight.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upward_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upward_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upward_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-841",
    "name": "V-Bar Pulldown",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit down on a pull-down machine with a V-Bar attached to the top pulley.",
    "rationale": "Adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pulldown/1.jpg"
    ]
  },
  {
    "id": "local-842",
    "name": "V-Bar Pullup",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start by placing the middle of the V-bar in the middle of the pull-up bar (assuming that the pull-up station you are using does not have neutral grip handles). The V-Bar handles will be facing down so that you can hang from the pull-up bar through the use of the handles.",
    "rationale": "Once you securely place the V-bar, take a hold of the bar from each side and hang from it. Stick your chest out and lean yourself back slightly in order to better engage the lats. This will be your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pullup/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pullup/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Bar_Pullup/1.jpg"
    ]
  },
  {
    "id": "local-843",
    "name": "Vertical Swing",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Plyometrics",
    "cue": "Allow the dumbbell to hang at arms length between your legs, holding it with both hands. Keep your back straight and your head up.",
    "rationale": "Swing the dumbbell between your legs, flexing at the hips and bending the knees slightly.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Vertical_Swing/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Vertical_Swing/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Vertical_Swing/1.jpg"
    ]
  },
  {
    "id": "local-844",
    "name": "Walking, Treadmill",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Cardio",
    "cue": "To begin, step onto the treadmill and select the desired option from the menu. Most treadmills have a manual setting, or you can select a program to run. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. Elevation can be adjusted to change the intensity of the workout.",
    "rationale": "Treadmills offer convenience, cardiovascular benefits, and usually have less impact than walking outside. When walking, you should move at a moderate to fast pace, not a leisurely one. Being an activity of lower intensity, walking doesn't burn as many calories as some other activities, but still provides great benefit. A 150 lb person will burn about 175 calories walking 4 miles per hour for 30 minutes, compared to 450 calories running twice as fast. Maintain proper posture as you walk, and only hold onto the handles when necessary, such as when dismounting or checking your heart rate.",
    "equipment": "Machine",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking_Treadmill/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking_Treadmill/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking_Treadmill/1.jpg"
    ]
  },
  {
    "id": "local-845",
    "name": "Weighted Ball Hyperextension",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "To begin, lie down on an exercise ball with your torso pressing against the ball and parallel to the floor. The ball of your feet should be pressed against the floor to help keep you balanced. Place a weighted plate under your chin or behind your neck. This is the starting position.",
    "rationale": "Slowly raise your torso up by bending at the waist and lower back. Remember to exhale during this movement.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Ball_Hyperextension/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Ball_Hyperextension/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Ball_Hyperextension/1.jpg"
    ]
  },
  {
    "id": "local-846",
    "name": "Weighted Ball Side Bend",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, lie down on an exercise ball with your left side of the torso (waist, hips and shoulder) pressed against the ball.",
    "rationale": "Your feet should be on the floor while your legs are crossed and hanging from the ball. Hold a weighted plate with your right hand directly to the right side of your head. Tip: Make sure the smooth side of the plate is resting against your head.",
    "equipment": "Exercise ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Ball_Side_Bend/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Ball_Side_Bend/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Ball_Side_Bend/1.jpg"
    ]
  },
  {
    "id": "local-847",
    "name": "Weighted Bench Dip",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "For this exercise you will need to place a bench behind your back and another one in front of you. With the benches perpendicular to your body, hold on to one bench on its edge with the hands close to your body, separated at shoulder width. Your arms should be fully extended.",
    "rationale": "The legs will be extended forward on top of the other bench. Your legs should be parallel to the floor while your torso is to be perpendicular to the floor. Have your partner place the dumbbell on your lap. Note: This exercise is best performed with a partner as placing the weight on your lap can be challenging and cause injury without assistance. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Bench_Dip/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Bench_Dip/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Bench_Dip/1.jpg"
    ]
  },
  {
    "id": "local-848",
    "name": "Weighted Crunches",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie flat on your back with your feet flat on the ground or resting on a bench with your knees bent at a 90 degree angle.",
    "rationale": "Hold a weight to your chest, or you may hold it extended above your torso. This will be your starting position.",
    "equipment": "Medicine ball",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Crunches/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Crunches/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Crunches/1.jpg"
    ]
  },
  {
    "id": "local-849",
    "name": "Weighted Jump Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "Position a lightly loaded barbell across the back of your shoulders. You could also use a weighted vest, sandbag, or other type of resistance for this exercise.",
    "rationale": "The weight should be light enough that it doesn't slow you down significantly. Your feet should be just outside of shoulder width with your head and chest up. This will be your starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Jump_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Jump_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Jump_Squat/1.jpg"
    ]
  },
  {
    "id": "local-850",
    "name": "Weighted Pull Ups",
    "muscle_group": "Back",
    "tier": "S",
    "focus": "Strength",
    "cue": "Attach a weight to a dip belt and secure it around your waist. Grab the pull-up bar with the palms of your hands facing forward. For a medium grip, your hands should be spaced at shoulder width. Both arms should be extended in front of you holding the bar at the chosen grip.",
    "rationale": "You'll want to bring your torso back about 30 degrees while creating a curvature in your lower back and sticking your chest out. This will be your starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/1.jpg"
    ]
  },
  {
    "id": "local-851",
    "name": "Weighted Sissy Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Standing upright, with feet at shoulder width and toes raised, use one hand to hold onto the beams of a squat rack and the opposite arm to hold a plate on top of your chest. This is your starting position.",
    "rationale": "As you use one arm to hold yourself, bend at the knees and slowly lower your torso toward the ground by bringing your pelvis and knees forward. Inhale as you go down and stop when your upper and lower legs almost create a 90-degree angle. Hold the stretch position for a second.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Sissy_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Sissy_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Sissy_Squat/1.jpg"
    ]
  },
  {
    "id": "local-852",
    "name": "Weighted Sit-Ups - With Bands",
    "muscle_group": "Core",
    "tier": "A",
    "focus": "Strength",
    "cue": "Start out by strapping the bands around the base of the decline bench. Place the handles towards the inside of the decline bench so that when lying down, you can reach for both of them.",
    "rationale": "Position your legs through the decline machine until they are secured. Now reach for the exercise bands with both hands. Use a pronated (palms forward) grip to grasp the handles. Position them near your collar bone and rotate your wrist to a neutral grip (palms facing the torso). Note: Your arms should remain stationary throughout the exercise. This is the starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Sit-Ups_-_With_Bands/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Sit-Ups_-_With_Bands/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Sit-Ups_-_With_Bands/1.jpg"
    ]
  },
  {
    "id": "local-853",
    "name": "Weighted Squat",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strength",
    "cue": "Start by positioning two flat benches shoulder width apart from each other. Stand on top of them and wrap the weighted belt around your waist with the amount of weight you feel comfortable with. Make sure your toes are facing out.",
    "rationale": "Once you are standing straight up with the weight hanging in between your legs, position your arms so that they are fully extended to the side of your body. This is the starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Squat/1.jpg"
    ]
  },
  {
    "id": "local-854",
    "name": "Wide-Grip Barbell Bench Press",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie back on a flat bench with feet firm on the floor. Using a wide, pronated (palms forward) grip that is around 3 inches away from shoulder width (for each hand), lift the bar from the rack and hold it straight over you with your arms locked. The bar will be perpendicular to the torso and the floor. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on your middle chest.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-855",
    "name": "Wide-Grip Decline Barbell Bench Press",
    "muscle_group": "Chest",
    "tier": "S",
    "focus": "Strength",
    "cue": "Lie back on a decline bench with the feet securely locked at the front of the bench. Using a wide, pronated (palms forward) grip that is around 3 inches away from shoulder width (for each hand), lift the bar from the rack and hold it straight over you with your arms locked. The bar will be perpendicular to the torso and the floor. This will be your starting position.",
    "rationale": "As you breathe in, come down slowly until you feel the bar on your lower chest.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Bench_Press/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Bench_Press/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Bench_Press/1.jpg"
    ]
  },
  {
    "id": "local-856",
    "name": "Wide-Grip Decline Barbell Pullover",
    "muscle_group": "Chest",
    "tier": "B",
    "focus": "Strength",
    "cue": "Lie down on a decline bench with both legs securely locked in position. Reach for the barbell behind the head using a pronated grip (palms facing out). Make sure to grab the barbell wider than shoulder width apart for this exercise. Slowly lift the barbell up from the floor by using your arms.",
    "rationale": "When positioned properly, your arms should be fully extended and perpendicular to the floor. This is the starting position.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Pullover/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Pullover/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Decline_Barbell_Pullover/1.jpg"
    ]
  },
  {
    "id": "local-857",
    "name": "Wide-Grip Lat Pulldown",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Sit down on a pull-down machine with a wide bar attached to the top pulley. Make sure that you adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
    "rationale": "Grab the bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg"
    ]
  },
  {
    "id": "local-858",
    "name": "Wide-Grip Pulldown Behind The Neck",
    "muscle_group": "Back",
    "tier": "A",
    "focus": "Strength",
    "cue": "Sit down on a pull-down machine with a wide bar attached to the top pulley. Make sure that you adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
    "rationale": "Grab the bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than your shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.",
    "equipment": "Cable",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Pulldown_Behind_The_Neck/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Pulldown_Behind_The_Neck/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Pulldown_Behind_The_Neck/1.jpg"
    ]
  },
  {
    "id": "local-859",
    "name": "Wide-Grip Rear Pull-Up",
    "muscle_group": "Back",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab the pull-up bar with the palms facing forward using a wide grip.",
    "rationale": "As you have both arms extended in front of you holding the bar, bring your torso forward and head so that there is an imaginary line from the pull-up bar to the back of your neck. This is your starting position.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Rear_Pull-Up/1.jpg"
    ]
  },
  {
    "id": "local-860",
    "name": "Wide-Grip Standing Barbell Curl",
    "muscle_group": "Arms",
    "tier": "S",
    "focus": "Strength",
    "cue": "Stand up with your torso upright while holding a barbell at the wide outer handle. The palm of your hands should be facing forward. The elbows should be close to the torso. This will be your starting position.",
    "rationale": "While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Tip: Only the forearms should move.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Standing_Barbell_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Standing_Barbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Standing_Barbell_Curl/1.jpg"
    ]
  },
  {
    "id": "local-861",
    "name": "Wide Stance Barbell Squat",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
    "rationale": "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide_Stance_Barbell_Squat/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide_Stance_Barbell_Squat/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide_Stance_Barbell_Squat/1.jpg"
    ]
  },
  {
    "id": "local-862",
    "name": "Wide Stance Stiff Legs",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Olympic weightlifting",
    "cue": "Begin with a barbell loaded on the floor. Adopt a wide stance, and then bend at the hips to grab the bar. Your hips should be as far back as possible, and your legs nearly straight. Keep your back straight, and your head and chest up. This will be your starting position.",
    "rationale": "Begin the movement be engaging the hips, driving them forward as you allow the arms to hang straight. Continue until you are standing straight up, and then slowly return the weight to the starting position. For successive reps, the weight need not touch the floor.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide_Stance_Stiff_Legs/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide_Stance_Stiff_Legs/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide_Stance_Stiff_Legs/1.jpg"
    ]
  },
  {
    "id": "local-863",
    "name": "Wind Sprints",
    "muscle_group": "Core",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hang from a pull-up bar using a pronated grip. Your arms and legs should be extended. This will be your starting position.",
    "rationale": "Begin by quickly raising one knee as high as you can. Do not swing your body or your legs. 3",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wind_Sprints/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wind_Sprints/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wind_Sprints/1.jpg"
    ]
  },
  {
    "id": "local-864",
    "name": "Windmills",
    "muscle_group": "Legs",
    "tier": "A",
    "focus": "Stretching",
    "cue": "Lie on your back with your arms extended out to the sides and your legs straight. This will be your starting position.",
    "rationale": "Lift one leg and quickly cross it over your body, attempting to touch the ground near the opposite hand.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Windmills/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Windmills/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Windmills/1.jpg"
    ]
  },
  {
    "id": "local-865",
    "name": "World's Greatest Stretch",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Stretching",
    "cue": "This is a three-part stretch. Begin by lunging forward, with your front foot flat on the ground and on the toes of your back foot. With your knees bent, squat down until your knee is almost touching the ground. Keep your torso erect, and hold this position for 10-20 seconds.",
    "rationale": "Now, place the arm on the same side as your front leg on the ground, with the elbow next to the foot. Your other hand should be placed on the ground, parallel to your lead leg, to help support you during this portion of the stretch.",
    "equipment": "Bodyweight",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Worlds_Greatest_Stretch/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Worlds_Greatest_Stretch/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Worlds_Greatest_Stretch/1.jpg"
    ]
  },
  {
    "id": "local-866",
    "name": "Wrist Circles",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Stretching",
    "cue": "Start by standing straight with your feet being shoulder width apart from each other. Elevate your arms to the side of you until they are fully extended and parallel to the floor at a height that is evenly aligned with your shoulders. Tip: Your torso and arms should form the letter \"T: Your palms should be facing down. This is the starting position.",
    "rationale": "Keeping your entire body stationary except for the wrists, begin to rotate both wrists forward in a circular motion. Tip: Pretend that you are trying to draw circles by using your hands as the brush. Breathe normally as you perform this exercise.",
    "equipment": "Body only",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Circles/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Circles/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Circles/1.jpg"
    ]
  },
  {
    "id": "local-867",
    "name": "Wrist Roller",
    "muscle_group": "Arms",
    "tier": "A",
    "focus": "Strength",
    "cue": "To begin, stand straight up grabbing a wrist roller using a pronated grip (palms facing down). Your feet should be shoulder width apart.",
    "rationale": "Slowly lift both arms until they are fully extended and parallel to the floor in front of you. Note: Make sure the rope is not wrapped around the roller. Your entire body should be stationary except for the forearms. This is the starting position.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Roller/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Roller/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Roller/1.jpg"
    ]
  },
  {
    "id": "local-868",
    "name": "Wrist Rotations with Straight Bar",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Hold a barbell with both hands and your palms facing down; hands spaced about shoulder width. This will be your starting position.",
    "rationale": "Alternating between each of your hands, perform the movement by extending the wrist as though you were rolling up a newspaper. Continue alternating back and forth until failure.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Rotations_with_Straight_Bar/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Rotations_with_Straight_Bar/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Rotations_with_Straight_Bar/1.jpg"
    ]
  },
  {
    "id": "local-869",
    "name": "Yoke Walk",
    "muscle_group": "Legs",
    "tier": "B",
    "focus": "Strongman",
    "cue": "The yoke is usually done with a yoke apparatus, but is sometimes seen with refrigerators or other heavy objects.",
    "rationale": "Begin by racking the apparatus across the back of the shoulders. With your head looking forward and back arched, lift the yoke by driving through the heels.",
    "equipment": "Other",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Yoke_Walk/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Yoke_Walk/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Yoke_Walk/1.jpg"
    ]
  },
  {
    "id": "local-870",
    "name": "Zercher Squats",
    "muscle_group": "Legs",
    "tier": "S",
    "focus": "Strength",
    "cue": "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. The correct height should be anywhere above the waist but below the chest. Once the correct height is chosen and the bar is loaded, lock your hands together and place the bar on top of your arms in between the forearm and upper arm.",
    "rationale": "Lift the bar up so that it is resting on top of your forearms. If you are holding the bar properly, it should look as if you have your arms crossed but with a bar running across them.",
    "equipment": "Barbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zercher_Squats/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zercher_Squats/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zercher_Squats/1.jpg"
    ]
  },
  {
    "id": "local-871",
    "name": "Zottman Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Stand up with your torso upright and a dumbbell in each hand being held at arms length. The elbows should be close to the torso.",
    "rationale": "Make sure the palms of the hands are facing each other. This will be your starting position.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Curl/1.jpg"
    ]
  },
  {
    "id": "local-872",
    "name": "Zottman Preacher Curl",
    "muscle_group": "Arms",
    "tier": "B",
    "focus": "Strength",
    "cue": "Grab a dumbbell in each hand and place your upper arms on top of the preacher bench or the incline bench. The dumbbells should be held at shoulder height and the elbows should be flexed. Hold the dumbbells with the palms of your hands facing down. This will be your starting position.",
    "rationale": "As you breathe in, slowly lower the dumbbells keeping the palms down until your upper arm is extended and your biceps are fully stretched.",
    "equipment": "Dumbbell",
    "image": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Preacher_Curl/0.jpg",
    "images": [
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Preacher_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Preacher_Curl/1.jpg"
    ]
  }
];
