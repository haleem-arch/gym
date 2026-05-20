-- STRIDE RITE | Tactical Schema Updates

-- Ensure client_profiles has required columns
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS workouts_per_week INTEGER DEFAULT 3;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS generated_passcode VARCHAR(255);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'beginner';

-- New table for client workout days if it doesn't exist
CREATE TABLE IF NOT EXISTS client_workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_name VARCHAR(100),
  exercises JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure progress_notes exists
CREATE TABLE IF NOT EXISTS progress_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id),
  date DATE DEFAULT CURRENT_DATE,
  note TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_workout_days ON client_workout_days(user_id);
