-- ============================================================
-- CRONIFY - MIGRACIONES DE BASE DE DATOS
-- ============================================================
-- Ejecuta estas migraciones en orden según lo que necesites.
-- Cada sección está numerada y comentada.
-- ============================================================


-- ============================================================
-- MIGRACIÓN 1: Agregar campos para cronómetro (hábitos tipo "break")
-- ============================================================
-- Ejecutar si: Ya tienes la tabla habits y quieres agregar la funcionalidad de cronómetro
-- Referencia: Funcionalidad original de Cronify (timer de abstinencia)

ALTER TABLE habits ADD COLUMN IF NOT EXISTS habit_type text default 'build';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS start_date timestamp with time zone default timezone('utc'::text, now());
ALTER TABLE habits ADD COLUMN IF NOT EXISTS last_reset timestamp with time zone default timezone('utc'::text, now());
ALTER TABLE habits ADD COLUMN IF NOT EXISTS max_streak_seconds bigint default 0;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS current_goal_seconds bigint default 86400;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());

-- Agregar constraint para habit_type (opcional, si quieres validación estricta)
-- ALTER TABLE habits ADD CONSTRAINT habit_type_check CHECK (habit_type IN ('build', 'break'));


-- ============================================================
-- MIGRACIÓN 2: Tabla de encouragements (mensajes de apoyo entre partners)
-- ============================================================
-- Ejecutar si: Quieres que los partners puedan enviarse mensajes de apoyo
-- Referencia: Sistema de accountability social

CREATE TABLE IF NOT EXISTS encouragements (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  from_email text not null,
  message text not null,
  emoji text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;

-- Policy: Partners pueden enviar encouragements a hábitos que pueden ver
CREATE POLICY "Partners can send encouragements" ON encouragements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      JOIN partnerships ON partnerships.user_id = habits.user_id
      WHERE habits.id = encouragements.habit_id
      AND partnerships.partner_email = (auth.jwt() ->> 'email')
      AND partnerships.status = 'active'
    )
    AND from_email = (auth.jwt() ->> 'email')
  );

-- Policy: Dueño del hábito puede ver encouragements
CREATE POLICY "Users can view encouragements on their habits" ON encouragements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = encouragements.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Policy: Partner que envió puede ver sus encouragements
CREATE POLICY "Partners can view their sent encouragements" ON encouragements
  FOR SELECT USING (
    from_email = (auth.jwt() ->> 'email')
  );


-- ============================================================
-- MIGRACIÓN 3: Actualizar hábitos existentes con valores default
-- ============================================================
-- Ejecutar si: Ya tenías hábitos antes de agregar los nuevos campos
-- Esto asegura que los hábitos existentes tengan valores válidos

UPDATE habits
SET
  habit_type = COALESCE(habit_type, 'build'),
  last_reset = COALESCE(last_reset, created_at),
  max_streak_seconds = COALESCE(max_streak_seconds, 0),
  current_goal_seconds = COALESCE(current_goal_seconds, 86400),
  start_date = COALESCE(start_date, created_at),
  updated_at = COALESCE(updated_at, created_at)
WHERE habit_type IS NULL
   OR last_reset IS NULL
   OR max_streak_seconds IS NULL;


-- ============================================================
-- MIGRACIÓN 4: Tabla de relapses (historial de recaídas)
-- ============================================================
-- Ejecutar si: Quieres guardar historial de recaídas para hábitos tipo "break"
-- EJECUTAR AHORA

CREATE TABLE IF NOT EXISTS relapses (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  duration_seconds bigint not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE relapses ENABLE ROW LEVEL SECURITY;

-- Policy: Dueño del hábito puede ver sus relapses
CREATE POLICY "Users can view their relapses" ON relapses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = relapses.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Policy: Dueño del hábito puede crear relapses
CREATE POLICY "Users can create relapses" ON relapses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = relapses.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Policy: Partners pueden ver relapses de hábitos que les comparten
CREATE POLICY "Partners can view relapses" ON relapses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM habits
      JOIN partnerships ON partnerships.user_id = habits.user_id
      WHERE habits.id = relapses.habit_id
      AND partnerships.partner_email = (auth.jwt() ->> 'email')
      AND partnerships.status = 'active'
    )
  );


-- ============================================================
-- VERIFICACIÓN: Comprobar que todo está correcto
-- ============================================================
-- Ejecuta esto para verificar la estructura de la tabla habits

-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'habits'
-- ORDER BY ordinal_position;
