# Cronify - Plan de Arquitectura y Mejoras

## Propuesta de Valor (Tagline)

**"Cronify - Hábitos con testigo. Accountability que funciona."**

Alternativas:
- "Tus hábitos, tu testigo, tu éxito"
- "Accountability social para hábitos personales"
- "No cambies solo. Cambia con testigos."

---

## Concepto Core

Una app de **seguimiento de hábitos con accountability social**. La diferencia clave: no estás solo en tu proceso de cambio. Tienes un "testigo" (partner) que ve tu progreso en tiempo real.

### Casos de Uso Principales

1. **Dejar vicios**: Dejar de fumar, reducir alcohol, menos pantallas
2. **Construir rutinas**: Dormir temprano, ejercicio diario, meditación
3. **Metas personales**: Estudiar idiomas, leer más, comer saludable
4. **Accountability profesional**: Freelancers con deadlines, estudiantes

---

## Arquitectura Propuesta

### Estructura de Carpetas (Mejorada)

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/              # Rutas públicas
│   │   │   ├── page.tsx           # Landing
│   │   │   └── login/page.tsx     # Auth
│   │   │
│   │   └── (dashboard)/           # Rutas protegidas
│   │       ├── layout.tsx         # Auth guard + sidebar
│   │       ├── page.tsx           # Dashboard principal
│   │       ├── habits/
│   │       │   ├── page.tsx       # Lista de hábitos
│   │       │   ├── [id]/page.tsx  # Detalle de hábito + calendario
│   │       │   └── new/page.tsx   # Crear hábito
│   │       ├── partners/
│   │       │   ├── page.tsx       # Mis partners
│   │       │   └── [id]/page.tsx  # Vista de partner específico
│   │       ├── shared/
│   │       │   └── page.tsx       # Hábitos compartidos conmigo
│   │       ├── stats/
│   │       │   └── page.tsx       # Estadísticas globales
│   │       └── settings/
│   │           └── page.tsx       # Configuración de cuenta
│   │
│   └── api/                       # API Routes (si necesario)
│
├── components/
│   ├── ui/                        # Componentes base (actual)
│   ├── habits/                    # Componentes de hábitos
│   │   ├── habit-card.tsx
│   │   ├── habit-calendar.tsx     # Calendario mensual
│   │   ├── habit-streak.tsx       # Indicador de racha
│   │   ├── habit-form.tsx
│   │   └── habit-log-modal.tsx    # Modal para registrar + razón
│   ├── partners/                  # Componentes de partners
│   │   ├── partner-card.tsx
│   │   ├── partner-invite.tsx
│   │   └── partner-habits-view.tsx
│   ├── stats/                     # Componentes de estadísticas
│   │   ├── completion-chart.tsx
│   │   ├── streak-indicator.tsx
│   │   └── monthly-summary.tsx
│   └── layout/                    # Componentes de layout
│       ├── sidebar.tsx
│       ├── navbar.tsx
│       └── mobile-nav.tsx
│
├── lib/
│   ├── supabase/                  # (actual)
│   ├── utils.ts                   # (actual)
│   └── constants.ts               # Constantes de la app
│
├── hooks/                         # Custom hooks
│   ├── use-habits.ts
│   ├── use-habit-logs.ts
│   ├── use-partners.ts
│   └── use-stats.ts
│
├── types/                         # Tipos TypeScript
│   ├── habit.ts
│   ├── partner.ts
│   ├── log.ts
│   └── database.ts                # Tipos de Supabase
│
└── services/                      # Lógica de negocio
    ├── habits.ts
    ├── partners.ts
    └── stats.ts
```

---

## Modelo de Datos (Mejorado)

### Tabla: habits
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Configuración del hábito
  habit_type TEXT CHECK (habit_type IN ('build', 'break')) DEFAULT 'build',
  -- 'build' = construir hábito (ejercicio, dormir temprano)
  -- 'break' = romper hábito (fumar, redes sociales)

  frequency JSONB DEFAULT '{"type": "daily"}'::jsonb,
  -- Ejemplos:
  -- {"type": "daily"}
  -- {"type": "weekly", "days": [1,3,5]} (lun, mie, vie)
  -- {"type": "times_per_week", "times": 3}

  target_value INTEGER, -- Para hábitos medibles (ej: dormir antes de las 23:00 = 2300)
  target_unit TEXT,     -- 'time', 'count', 'minutes', etc.

  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,        -- NULL = indefinido

  is_public BOOLEAN DEFAULT false, -- Visible para partners

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: habit_logs (Mejorada)
```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  status TEXT CHECK (status IN ('completed', 'failed', 'skipped', 'partial')) NOT NULL,

  -- Detalles del log
  value INTEGER,           -- Valor logrado (ej: hora real de dormir)
  reason TEXT,             -- Razón de fallo/skip
  notes TEXT,              -- Notas adicionales
  mood INTEGER CHECK (mood BETWEEN 1 AND 5), -- Estado de ánimo

  logged_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_id, date)
);
```

### Tabla: partnerships (Mejorada)
```sql
CREATE TABLE partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuario que comparte (owner)
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Partner (invitado)
  partner_email TEXT NOT NULL,
  partner_user_id UUID REFERENCES auth.users(id), -- Se llena cuando acepta

  -- Configuración
  status TEXT CHECK (status IN ('pending', 'active', 'paused', 'ended')) DEFAULT 'pending',
  role TEXT CHECK (role IN ('viewer', 'supporter')) DEFAULT 'viewer',
  -- 'viewer' = solo ve
  -- 'supporter' = puede enviar mensajes de apoyo

  -- Permisos granulares
  can_see_reasons BOOLEAN DEFAULT true,
  can_see_notes BOOLEAN DEFAULT false,
  can_send_encouragement BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);
```

### Tabla: encouragements (Nueva)
```sql
CREATE TABLE encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  habit_log_id UUID REFERENCES habit_logs(id) ON DELETE CASCADE,

  from_user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT, -- Reacción rápida

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Funcionalidades por Fase

### FASE 1: Core Mejorado (MVP+)
- [ ] Refactorizar estructura de carpetas
- [ ] Crear tipos TypeScript centralizados
- [ ] Implementar hooks personalizados
- [ ] Vista de calendario mensual por hábito
- [ ] Registrar razón al fallar un hábito
- [ ] Eliminar hábitos (completar funcionalidad)
- [ ] Estadísticas básicas (% completado, racha actual)

### FASE 2: Accountability Social
- [ ] Mejorar flujo de invitación de partners
- [ ] Vista detallada de hábitos compartidos
- [ ] Calendario visible para partners
- [ ] Sistema de permisos (qué puede ver cada partner)
- [ ] Notificaciones cuando el partner falla

### FASE 3: Engagement
- [ ] Sistema de encouragements/reacciones
- [ ] Rachas y logros (achievements)
- [ ] Estadísticas avanzadas con gráficos
- [ ] Resumen semanal/mensual
- [ ] Exportar datos

### FASE 4: Polish
- [ ] Notificaciones push/email
- [ ] Recordatorios configurables
- [ ] Modo oscuro/claro refinado
- [ ] PWA (installable)
- [ ] Onboarding para nuevos usuarios

---

## Componente Clave: Calendario de Hábito

```
┌─────────────────────────────────────────────┐
│  Dormir antes de las 11pm                   │
│  Noviembre 2025                    ← Hoy →  │
├─────────────────────────────────────────────┤
│  Lu   Ma   Mi   Ju   Vi   Sa   Do          │
│                           1    2            │
│                          ✓    ✓            │
│  3    4    5    6    7    8    9            │
│  ✓    ✓    ✗    ✓    ✓    ✓    ✓           │
│  10   11   12   13   14   15   16           │
│  ✓    ✗    ✓    ✓    ✓    ✗    ✓           │
│  17   18   19   20   21   22   23           │
│  ✓    ✓    ✓    ✓    ✓    ✓    ✓           │
│  24   25   26   27   28   29   30           │
│  ✓    ✓    ✓    ○    ○    ○    ○           │
├─────────────────────────────────────────────┤
│  ✓ Completado: 22  ✗ Fallado: 3  ○ Pendiente│
│  Racha actual: 8 días 🔥                    │
│  Mejor racha: 11 días                       │
│  Cumplimiento: 88%                          │
└─────────────────────────────────────────────┘
```

Al hacer clic en un día con ✗:
- Muestra razón del fallo
- Partner puede enviar mensaje de apoyo

---

## Vista del Partner (Shared View)

```
┌─────────────────────────────────────────────┐
│  👤 Juan está siguiendo:                    │
├─────────────────────────────────────────────┤
│                                             │
│  🛏️ Dormir antes de las 11pm               │
│  ████████████░░ 88% este mes                │
│  Racha: 8 días 🔥                           │
│  [Ver calendario]                           │
│                                             │
│  🚭 No fumar                                │
│  ██████████████ 100% este mes               │
│  Racha: 30 días 🔥🔥                        │
│  [Ver calendario]                           │
│                                             │
│  📚 Leer 30 min                             │
│  ██████░░░░░░░░ 45% este mes                │
│  Racha: 2 días                              │
│  [Ver calendario] [💪 Enviar ánimo]         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Próximos Pasos Inmediatos

1. **Aprobar este plan** - ¿Estás de acuerdo con la dirección?
2. **Actualizar schema de Supabase** - Agregar nuevos campos
3. **Refactorizar estructura** - Mover a nueva arquitectura
4. **Implementar calendario** - Componente visual principal
5. **Mejorar flujo de logs** - Agregar razones y notas

---

## Preguntas para Definir

1. ¿El partner debe poder ver las razones de fallo por defecto, o debe ser opt-in?
2. ¿Quieres notificaciones por email cuando tu partner falla un hábito?
3. ¿Prefieres mantener el diseño glassmorphism actual o explorar algo más minimalista?
4. ¿La app será solo web o planeas móvil nativo en el futuro?
