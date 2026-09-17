import { exerciseLibrary, categoryMeta } from './exercises.js';

const STORAGE_KEY = 'fittrack-state-v1';
const navItems = [
  { id: 'home', label: 'Inicio', icon: '⌂' },
  { id: 'exercises', label: 'Ejercicios', icon: '🏋️' },
  { id: 'categories', label: 'Categorías', icon: '📚' },
  { id: 'routine', label: 'Crear rutina', icon: '✍️' },
  { id: 'workouts', label: 'Mis entrenamientos', icon: '📈' },
  { id: 'summary', label: 'Resumen', icon: '📊' },
  { id: 'calendar', label: 'Calendario', icon: '🗓️' },
  { id: 'suggested', label: 'Rutinas sugeridas', icon: '💡' },
  { id: 'challenges', label: 'Desafíos', icon: '🏆' },
  { id: 'notes', label: 'Notas', icon: '📝' },
  
];

const defaultState = {
  theme: 'light',
  section: 'home',
  globalSearch: '',
  exerciseFilters: { category: 'Todos', level: 'Todos', equipment: 'Todos', type: 'Todos', gender: 'Todos' },
  profile: { name: 'Salomon', objective: 'Hipertrofia', level: 'Intermedio' },
  profileStats: { points: 850, streak: 6 },
  routines: [
    { id: 'routine-pecho', name: 'Pecho + Tríceps', objective: 'Fuerza', exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: 10, rest: 90, weight: 60 },
      { exerciseId: 'incline-press', sets: 3, reps: 12, rest: 60, weight: 50 },
      { exerciseId: 'triceps-pushdown', sets: 3, reps: 12, rest: 60, weight: 20 }
    ] },
    { id: 'routine-legs', name: 'Power Legs', objective: 'Resistencia', exercises: [
      { exerciseId: 'squat', sets: 4, reps: 8, rest: 90, weight: 70 },
      { exerciseId: 'lunge', sets: 3, reps: 12, rest: 60, weight: 15 },
      { exerciseId: 'plank', sets: 3, reps: 1, rest: 45, weight: 0 }
    ] }
  ],
  draftedRoutine: { name: 'Mi rutina', objective: 'Fuerza', exercises: [
    { exerciseId: 'bench-press', sets: 4, reps: 10, rest: 90, weight: 60 },
    { exerciseId: 'lunge', sets: 3, reps: 12, rest: 60, weight: 15 }
  ] },
  workouts: [
    { id: 'w-1', date: dateString(-4), name: 'Pecho + Tríceps', duration: 42, calories: 320, exercises: 6, sets: 18, reps: 135, muscles: ['Pecho', 'Tríceps'], points: 50 },
    { id: 'w-2', date: dateString(-1), name: 'Espalda + Bíceps', duration: 50, calories: 360, exercises: 5, sets: 14, reps: 110, muscles: ['Espalda', 'Bíceps'], points: 55 }
  ],
  notes: [
    { id: 'n-1', title: 'Buena sensación', body: 'Hoy pude mantener mejor la postura en el press.', date: '2026-08-12', exerciseId: 'bench-press' },
    { id: 'n-2', title: 'Objetivo', body: 'Mantener la intensidad en piernas y glúteos.', date: '2026-08-14', exerciseId: 'squat' }
  ],
  challenges: [
    { id: '5-days', name: 'Desafío 5 días', description: 'Completa 5 entrenamientos.', progress: 4, target: 5, points: 100, reward: '+100 pts', status: 'En curso' },
    { id: 'chest', name: 'Desafío Pecho', description: 'Completa 3 entrenamientos de pecho.', progress: 2, target: 3, points: 150, reward: '+150 pts', status: 'En curso' },
    { id: '7-days', name: 'Desafío 7 días', description: 'Entrena durante 7 días.', progress: 5, target: 7, points: 250, reward: '+250 pts', status: 'Pendiente' }
  ],
  activeWorkout: null
};

let state = loadState();

const pageTitle = document.querySelector('#pageTitle');
const pageEyebrow = document.querySelector('#pageEyebrow');
const appContent = document.querySelector('#appContent');
const mainNav = document.querySelector('#mainNav');
const currentRange = document.querySelector('#currentRange');
const rangeXP = document.querySelector('#rangeXP');
const rangeProgress = document.querySelector('#rangeProgress');
const themeToggle = document.querySelector('#themeToggle');
const quickStartBtn = document.querySelector('#quickStartBtn');

init();

function init() {
  loadStateIntoMemory();
  bindControls();
  renderPage();
}

function bindControls() {
  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark', state.theme === 'dark');
    themeToggle.textContent = state.theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    saveState();
  });
  quickStartBtn.addEventListener('click', () => { state.section = 'workouts'; renderPage(); });
  document.addEventListener('click', handleClick);
  document.addEventListener('input', handleInput);
  document.addEventListener('change', handleChange);
  document.addEventListener('submit', handleSubmit);
  applyTheme();
}

function handleClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  const target = button.dataset.targetSection;
  const exerciseId = button.dataset.exerciseId;
  const routineId = button.dataset.routineId;

  switch (action) {
    case 'section':
      state.section = target;
      renderPage();
      break;
    case 'open-exercise':
      openExercise(exerciseId);
      break;
    case 'toggle-routine-exercise':
      toggleDraftExercise(exerciseId);
      renderPage();
      break;
    case 'start-routine':
      startRoutineById(routineId || 'routine-pecho');
      break;
    case 'save-routine':
      saveDraftRoutine();
      break;
    case 'start-workout':
      startRoutineById(state.draftedRoutine.id || 'routine-pecho');
      break;
    case 'complete-set':
      completeSet();
      break;
    case 'finish-workout':
      finalizeWorkout();
      break;
    case 'next-workout':
      advanceWorkout();
      break;
    case 'delete-note':
      state.notes = state.notes.filter((note) => note.id !== id);
      saveState();
      renderPage();
      break;
    case 'toggle-challenge':
      const challenge = state.challenges.find((item) => item.id === id);
      if (challenge) {
        challenge.progress = Math.min(challenge.target, challenge.progress + 1);
        challenge.status = challenge.progress >= challenge.target ? 'Completado' : 'En curso';
        saveState();
        renderPage();
      }
      break;
    default:
      break;
  }
}

function handleInput(event) {
  const field = event.target.closest('[data-field]');
  if (!field) return;
  const key = field.dataset.field;
  if (key === 'globalSearch') {
    state.globalSearch = event.target.value.trim();
    if (state.section === 'exercises') renderPage();
    return;
  }
  if (key === 'routineName') state.draftedRoutine.name = event.target.value;
  if (key === 'routineObjective') state.draftedRoutine.objective = event.target.value;
  if (key === 'sets' || key === 'reps' || key === 'restTime') {
    const exerciseId = field.dataset.exerciseId;
    const routineItem = state.draftedRoutine.exercises.find((entry) => entry.exerciseId === exerciseId);
    if (!routineItem) return;
    if (key === 'sets') routineItem.sets = Number(event.target.value) || 0;
    if (key === 'reps') routineItem.reps = Number(event.target.value) || 0;
    if (key === 'restTime') routineItem.rest = Number(event.target.value) || 0;
  }
  saveState();
}

function handleChange(event) {
  const filterEl = event.target.closest('[data-filter]');
  if (filterEl) {
    const key = filterEl.dataset.filter;
    state.exerciseFilters[key] = event.target.value;
    renderPage();
  }
  const fieldEl = event.target.closest('[data-field]');
  if (fieldEl && fieldEl.dataset.field === 'routineObjective') {
    state.draftedRoutine.objective = event.target.value;
    saveState();
  }
}

function handleSubmit(event) {
  const form = event.target.closest('[data-form="note-form"]');
  if (!form) return;
  event.preventDefault();
  const title = form.querySelector('#noteTitle')?.value?.trim() || 'Nota';
  const body = form.querySelector('#noteBody')?.value?.trim();
  if (!body) return;
  state.notes.unshift({ id: `note-${Date.now()}`, title, body, date: new Date().toISOString().slice(0,10), exerciseId: null });
  saveState();
  renderPage();
}

function renderPage() {
  renderSidebar();
  renderHeader();
  appContent.innerHTML = renderSection();
  applyTheme();
}

function renderSidebar() {
  mainNav.innerHTML = navItems.map((item) => `
    <button type="button" class="nav-item ${state.section === item.id ? 'active' : ''}" data-action="section" data-target-section="${item.id}">
      <span>${item.icon}</span><span>${item.label}</span>
    </button>
  `).join('');
  const points = state.profileStats.points || 850;
  const range = getRange(points);
  currentRange.textContent = range.label;
  rangeXP.textContent = `${points} / ${range.max} XP`;
  rangeProgress.style.width = `${Math.min(100, (points / range.max) * 100)}%`;
}

function renderHeader() {
  const sectionLabel = navItems.find((item) => item.id === state.section)?.label || 'Inicio';
  pageEyebrow.textContent = sectionLabel;
  pageTitle.textContent = sectionLabel === 'Inicio' ? 'Entrena. Progresa. Supérate.' : sectionLabel;
}

function renderSection() {
  switch (state.section) {
    case 'home': return renderHome();
    case 'exercises': return renderExercises();
    case 'categories': return renderCategories();
    case 'routine': return renderRoutine();
    case 'workouts': return renderWorkout();
    case 'summary': return renderSummary();
    case 'calendar': return renderCalendar();
    case 'suggested': return renderSuggested();
    case 'challenges': return renderChallenges();
    case 'notes': return renderNotes();
    case 'profile': return renderProfile();
    default: return renderHome();
  }
}

function applyTheme() {
  document.body.classList.toggle('dark', state.theme === 'dark');
  themeToggle.textContent = state.theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
}

function renderHome() {
  const workoutsThisWeek = state.workouts.filter((w) => Math.abs(daysSince(w.date)) <= 7).length;
  const totalMinutes = state.workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = state.workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const completedExercises = state.workouts.reduce((sum, w) => sum + (w.exercises || 0), 0);
  const stint = state.profileStats.streak || 6;
  const lastRoutine = state.routines[0];
  return `
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="label-badge">Planificación inteligente</span>
        <h2>Entrena. Progresa. Supérate.</h2>
        <p>Organiza tus entrenamientos, registra tu progreso y construye rutinas adaptadas a tus objetivos.</p>
        <div class="cta-row">
          <button class="primary-btn" data-action="section" data-target-section="workouts" type="button">Comenzar entrenamiento</button>
          <button class="ghost-btn" data-action="section" data-target-section="exercises" type="button">Explorar ejercicios</button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="mini-metric"><span>Racha</span><strong>${stint} días</strong></div>
        <div class="ring-visual">+${state.profileStats.points || 850}</div>
      </div>
    </section>
    <section class="stats-grid">
      ${renderStat('Entrenamientos esta semana', workoutsThisWeek, 'semanales')}
      ${renderStat('Minutos entrenados', `${totalMinutes} min`, 'acumulado')}
      ${renderStat('Calorías estimadas', `${totalCalories} kcal`, 'estimado')}
      ${renderStat('Ejercicios completados', completedExercises, 'totales')}
      ${renderStat('Racha actual', `${stint} días`, 'consistencia')}
    </section>
    <section class="content-panel">
      <div class="panel-head"><h3>Continúa tu entrenamiento</h3><button class="text-btn" type="button" data-action="start-routine" data-routine-id="${lastRoutine?.id || 'routine-pecho'}">Continuar</button></div>
      <div class="routine-highlight">
        <div>
          <span class="label-badge">Última rutina</span>
          <h4>${lastRoutine?.name || 'Pecho + Tríceps'}</h4>
          <div class="routine-meta"><span>${lastRoutine?.exercises.length || 6} ejercicios</span><span>0 minutos</span><span>0 kcal estimadas</span></div>
        </div>
        <button class="primary-btn small" type="button" data-action="start-routine" data-routine-id="${lastRoutine?.id || 'routine-pecho'}">Continuar</button>
      </div>
    </section>
    <section class="content-panel">
      <div class="panel-head"><h3>Ejercicios populares</h3><button class="text-btn" type="button" data-action="section" data-target-section="exercises">Ver catálogo</button></div>
      <div class="card-grid">${exerciseLibrary.slice(0, 7).map(renderMiniCard).join('')}</div>
    </section>
  `;
}

function renderStat(label, value, small) {
  return `
    <article class="stat-card">
      <span class="stat-label">${label}</span>
      <strong>${value}</strong>
      <small>${small}</small>
    </article>
  `;
}

function renderMiniCard(exercise) {
  return `
    <article class="mini-exercise-card">
      <img src="${exercise.image}" alt="${exercise.name}" />
      <div class="mini-copy">
        <span class="category-pill" style="background:${categoryMeta[exercise.category]?.accent || '#dbeafe'}; color:#0b1220;">${exercise.category}</span>
        <h4>${exercise.name}</h4>
        <p>${exercise.difficulty} · ${exercise.equipment}</p>
      </div>
      <div class="mini-actions">
        <button class="ghost-btn small" type="button" data-action="open-exercise" data-exercise-id="${exercise.id}">Detalles</button>
        <button class="primary-btn small" type="button" data-action="toggle-routine-exercise" data-exercise-id="${exercise.id}">+ Agregar</button>
      </div>
    </article>
  `;
}

function renderExercises() {
  const results = getFilteredExercises();
  return `
    <section class="content-panel">
      <div class="toolbar">
        <div class="search-wrap"><input type="search" value="${escapeHtml(state.globalSearch)}" data-field="globalSearch" placeholder="Buscar ejercicio..." /></div>
        <div class="filters-row">
          <select data-filter="category">
            <option value="Todos">Todos los grupos</option>
            ${Object.keys(categoryMeta).map((option) => `<option value="${option}" ${state.exerciseFilters.category === option ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
          <select data-filter="level">
            <option value="Todos">Nivel</option>
            <option value="Principiante" ${state.exerciseFilters.level === 'Principiante' ? 'selected' : ''}>Principiante</option>
            <option value="Intermedio" ${state.exerciseFilters.level === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
            <option value="Avanzado" ${state.exerciseFilters.level === 'Avanzado' ? 'selected' : ''}>Avanzado</option>
          </select>
          <select data-filter="equipment">
            <option value="Todos">Equipo</option>
            ${['Peso corporal','Mancuernas','Barra','Máquina','Polea','Bandas','Kettlebell','Banco','Sin equipamiento'].map((option) => `<option value="${option}" ${state.exerciseFilters.equipment === option ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
          <select data-filter="type">
            <option value="Todos">Tipo</option>
            <option value="Fuerza" ${state.exerciseFilters.type === 'Fuerza' ? 'selected' : ''}>Fuerza</option>
            <option value="Hipertrofia" ${state.exerciseFilters.type === 'Hipertrofia' ? 'selected' : ''}>Hipertrofia</option>
            <option value="Resistencia" ${state.exerciseFilters.type === 'Resistencia' ? 'selected' : ''}>Resistencia</option>
            <option value="Cardio" ${state.exerciseFilters.type === 'Cardio' ? 'selected' : ''}>Cardio</option>
            <option value="Core" ${state.exerciseFilters.type === 'Core' ? 'selected' : ''}>Core</option>
            <option value="Movilidad" ${state.exerciseFilters.type === 'Movilidad' ? 'selected' : ''}>Movilidad</option>
          </select>
          <select data-filter="gender">
            <option value="Todos">Objetivo</option>
            <option value="Hombres" ${state.exerciseFilters.gender === 'Hombres' ? 'selected' : ''}>Hombres</option>
            <option value="Mujeres" ${state.exerciseFilters.gender === 'Mujeres' ? 'selected' : ''}>Mujeres</option>
            <option value="Unisex" ${state.exerciseFilters.gender === 'Unisex' ? 'selected' : ''}>Unisex</option>
          </select>
        </div>
      </div>
      <div class="card-grid">${results.map(renderExerciseCard).join('')}</div>
    </section>
  `;
}

function renderExerciseCard(exercise) {
  return `
    <article class="exercise-card">
      <div class="exercise-image-wrap"><img class="exercise-image" src="${exercise.image}" alt="${exercise.name}" /></div>
      <div class="exercise-meta-block">
        <div class="badge-row">
          <span class="badge badge-soft" style="background:${categoryMeta[exercise.category]?.accent || '#dbeafe'}; color:#0b1220;">${exercise.category}</span>
          <span class="badge badge-tone">${exercise.gender}</span>
        </div>
        <h3>${exercise.name}</h3>
        <div class="exercise-detail-row"><span class="label">Grupo</span><span>${exercise.category}</span></div>
        <div class="exercise-detail-row"><span class="label">Nivel</span><span>${exercise.difficulty}</span></div>
        <div class="exercise-detail-row"><span class="label">Equipo</span><span>${exercise.equipment}</span></div>
        <div class="exercise-detail-row"><span class="label">Calorías</span><span>≈ ${exercise.caloriesPerMinute} kcal/min</span></div>
        <div class="meta-stars">★★★★☆</div>
        <div class="exercise-actions">
          <button class="ghost-btn small" type="button" data-action="open-exercise" data-exercise-id="${exercise.id}">Ver detalles</button>
          <button class="primary-btn small" type="button" data-action="toggle-routine-exercise" data-exercise-id="${exercise.id}">+ Agregar</button>
        </div>
      </div>
    </article>
  `;
}

function renderCategories() {
  const categories = Object.keys(categoryMeta);
  return `
    <section class="content-panel">
      <div class="panel-head"><h3>Explorar categorías</h3></div>
      <div class="category-grid">
        ${categories.map((name) => `
          <button type="button" class="category-tile" data-action="section" data-target-section="exercises" style="border-top: 4px solid ${categoryMeta[name].accent};">
            <span class="category-name">${name}</span>
            <span class="category-count">${exerciseLibrary.filter((ex) => ex.category === name).length} ejercicios</span>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderRoutine() {
  const routine = state.draftedRoutine;
  const estimated = routine.exercises.reduce((sum, entry) => sum + (Number(entry.sets || 0) * 2), 0);
  return `
    <section class="content-panel">
      <div class="panel-head">
        <h3>Crear mi rutina</h3>
      </div>
      <div class="routine-builder-layout">
        <div class="builder-box">
          <div class="builder-header"><h4>Ejercicios seleccionados</h4><span>${routine.exercises.length} items</span></div>
          ${routine.exercises.length ? routine.exercises.map((entry) => {
            const ex = getExercise(entry.exerciseId);
            if (!ex) return '';
            return `
              <div class="routine-entry">
                <div class="routine-entry-main">
                  <img src="${ex.image}" alt="${ex.name}" />
                  <div><strong>${ex.name}</strong><small>${ex.category}</small></div>
                </div>
                <div class="routine-entry-controls">
                  <label>Sets<input data-field="sets" data-exercise-id="${ex.id}" type="number" min="1" value="${entry.sets}" /></label>
                  <label>Reps<input data-field="reps" data-exercise-id="${ex.id}" type="number" min="1" value="${entry.reps}" /></label>
                  <label>Desc.<input data-field="restTime" data-exercise-id="${ex.id}" type="number" min="0" value="${entry.rest}" /></label>
                  <button class="ghost-btn small danger" type="button" data-action="toggle-routine-exercise" data-exercise-id="${ex.id}">Eliminar</button>
                </div>
              </div>
            `;
          }).join('') : '<p class="empty-state">Todavía no has agregado ejercicios a la rutina.</p>'}
        </div>
        <div class="builder-box">
          <div class="inline-fields" style="margin-bottom:12px;">
            <input type="text" value="${escapeHtml(routine.name)}" data-field="routineName" placeholder="Nombre de la rutina" />
            <select data-field="routineObjective">
              <option value="Fuerza" ${routine.objective === 'Fuerza' ? 'selected' : ''}>Fuerza</option>
              <option value="Resistencia" ${routine.objective === 'Resistencia' ? 'selected' : ''}>Resistencia</option>
              <option value="Movilidad" ${routine.objective === 'Movilidad' ? 'selected' : ''}>Movilidad</option>
              <option value="Core" ${routine.objective === 'Core' ? 'selected' : ''}>Core</option>
              <option value="Cardio" ${routine.objective === 'Cardio' ? 'selected' : ''}>Cardio</option>
            </select>
          </div>
          <div class="catalog-mini">
            ${exerciseLibrary.slice(0, 8).map((ex) => `
              <button type="button" class="mini-add-btn ${isDrafted(ex.id) ? 'active' : ''}" data-action="toggle-routine-exercise" data-exercise-id="${ex.id}">
                <span>${ex.name}</span><strong>${isDrafted(ex.id) ? '✓' : '+'}</strong>
              </button>
            `).join('')}
          </div>
          <div class="summary-box">
            <div><span>Duración estimada</span><strong>${estimated} min</strong></div>
            <div><span>Objetivo</span><strong>${routine.objective}</strong></div>
          </div>
          <div class="cta-row" style="margin-top:16px; flex-direction:column; align-items:stretch;">
            <button class="primary-btn" type="button" data-action="save-routine">Guardar rutina</button>
            <button class="ghost-btn" type="button" data-action="start-workout">Comenzar</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderWorkout() {
  if (!state.activeWorkout) {
    return `
      <section class="content-panel">
        <div class="panel-head"><h3>Mis entrenamientos</h3></div>
        <div class="routine-list">
          ${state.routines.map((routine) => `
            <div class="routine-card">
              <div>
                <span class="label-badge">${routine.objective}</span>
                <h4>${routine.name}</h4>
                <p>${routine.exercises.length} ejercicios · ${estimateRoutineMinutes(routine)} min</p>
              </div>
              <div class="space-right">
                <button class="ghost-btn small" type="button" data-action="start-routine" data-routine-id="${routine.id}">Iniciar</button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }
  const currentExercise = getExercise(state.activeWorkout.currentExerciseId);
  const currentPlan = state.activeWorkout.currentPlan || state.activeWorkout.plan[0];
  const totalSets = state.activeWorkout.plan.reduce((sum, item) => sum + Number(item.sets || 0), 0);
  return `
    <section class="exercise-session">
      <div class="session-top">
        <div><span class="label-badge">Ejercicio actual</span><h3>${currentExercise?.name || 'Entrenamiento'}</h3></div>
        <div class="timer-box"><span>Descanso</span><strong>${formatSeconds(state.activeWorkout.timer || 90)}</strong></div>
      </div>
      <div class="session-grid">
        <div class="session-card">
          <div class="meta-grid">
            <div><span>Serie</span><strong>${state.activeWorkout.seriesCurrent + 1} de ${currentPlan?.sets || 4}</strong></div>
            <div><span>Repeticiones</span><strong>${currentPlan?.reps || 10}</strong></div>
            <div><span>Peso</span><strong>${currentPlan?.weight || 0} kg</strong></div>
            <div><span>Descanso</span><strong>${formatSeconds(currentPlan?.rest || 60)}</strong></div>
          </div>
          <div class="cta-row" style="flex-direction:column; align-items:stretch; margin-top:16px;">
            <button class="primary-btn" type="button" data-action="complete-set">Serie completada</button>
            <button class="ghost-btn" type="button" data-action="next-workout">Saltar</button>
            <button class="ghost-btn" type="button" data-action="section" data-target-section="workouts">Pausar</button>
            <button class="primary-btn danger" type="button" data-action="finish-workout">Finalizar entrenamiento</button>
          </div>
        </div>
        <div class="session-side">
          <h4>Progreso</h4>
          <div class="progress-track"><span style="width:${(state.activeWorkout.completed / Math.max(totalSets,1))*100}%"></span></div>
          <ul class="session-list">${state.activeWorkout.plan.map((entry, index) => `<li class="${index === state.activeWorkout.currentIndex ? 'active' : ''}">${index + 1}. ${getExercise(entry.exerciseId)?.name || entry.exerciseId}</li>`).join('')}</ul>
        </div>
      </div>
    </section>
  `;
}

function renderSummary() {
  const totalWorkouts = state.workouts.length;
  const totalMinutes = state.workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = state.workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalExercises = state.workouts.reduce((sum, w) => sum + (w.exercises || 0), 0);
  const totalSets = state.workouts.reduce((sum, w) => sum + (w.sets || 0), 0);
  const totalReps = state.workouts.reduce((sum, w) => sum + (w.reps || 0), 0);
  const weeks = [1,2,3,4,5,6,7].map((n) => ({ name: `D${n}`, workouts: state.workouts.filter((w) => Math.abs(daysSince(w.date)) === n).length }));
  return `
    <section class="stats-grid">
      ${renderStat('Entrenamientos totales', totalWorkouts, 'todos los registros')}
      ${renderStat('Tiempo total entrenado', `${totalMinutes} min`, 'acumulado')}
      ${renderStat('Calorías estimadas', `${totalCalories} kcal`, 'totales')}
      ${renderStat('Ejercicios completados', totalExercises, 'totales')}
      ${renderStat('Series realizadas', totalSets, 'cantidad')}
      ${renderStat('Repeticiones realizadas', totalReps, 'volumen')}
    </section>
    <section class="content-panel">
      <div class="panel-head"><h3>Gráficas</h3></div>
      <div class="chart-wrap">${renderBarChart(weeks)}</div>
    </section>
  `;
}

function renderBarChart(data) {
  const max = Math.max(...data.map((entry) => entry.workouts || 1), 1);
  return `
    <div class="bar-chart">
      ${data.map((entry) => `
        <div class="bar-group">
          <div class="bar-track"><span class="bar-fill" style="height:${Math.max((entry.workouts / max) * 100, 15)}%"></span></div>
          <small>${entry.name}</small>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCalendar() {
  const days = Array.from({length: 30}, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (29 - index));
    const label = date.toISOString().slice(0, 10);
    const workout = state.workouts.find((w) => w.date === label);
    return { date: label, workout };
  });
  const timeline = [
    { day: 'Hoy', label: 'Pecho + Tríceps', detail: '45 min · 280 kcal · 6 ejercicios' },
    { day: 'Ayer', label: 'Descanso', detail: 'Recuperación activa' },
    { day: 'Lunes', label: 'Espalda + Bíceps', detail: '50 min · 360 kcal' },
    { day: 'Domingo', label: 'Full Body', detail: '40 min · 300 kcal' }
  ];
  return `
    <section class="content-panel">
      <div class="panel-head"><h3>Mi actividad</h3></div>
      <div class="calendar-grid">
        ${days.map(({date, workout}) => `
          <div class="calendar-day ${workout ? 'active' : ''}"><span>${new Date(date).getDate()}</span>${workout ? '<small>✓</small>' : ''}</div>
        `).join('')}
      </div>
      <div class="timeline-box">
        ${timeline.map((item) => `
          <div class="timeline-item">
            <span class="timeline-dot"></span>
            <div>
              <strong>${item.day}</strong>
              <p>${item.label}</p>
              <small>${item.detail}</small>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderSuggested() {
  const durations = [5, 10, 15, 20, 30, 45, 60];
  return `
    <section class="content-panel">
      <div class="panel-head"><h3>Rutinas sugeridas</h3></div>
      <div class="suggest-grid">
        ${durations.map((d) => `
          <article class="suggest-card">
            <span class="label-badge">${d} minutos</span>
            <h4>${d >= 30 ? 'Fuerza general' : 'Rutina rápida'}</h4>
            <p>Principiante · Intermedio · Avanzado</p>
            <ul><li>Fuerza</li><li>Resistencia</li><li>Cardio</li></ul>
            <button class="primary-btn small" type="button" data-action="section" data-target-section="routine">Usar</button>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderChallenges() {
  return `
    <section class="content-panel">
      <div class="panel-head"><h3>Desafíos</h3></div>
      <div class="challenge-grid">
        ${state.challenges.map((challenge) => {
          const percent = (challenge.progress / challenge.target) * 100;
          return `
            <article class="challenge-card">
              <div class="challenge-top">
                <div><span class="label-badge">${challenge.reward}</span><h4>${challenge.name}</h4></div>
                <span class="status-pill">${challenge.status}</span>
              </div>
              <p>${challenge.description}</p>
              <div class="progress-track"><span style="width:${Math.min(100, percent)}%"></span></div>
              <strong>${challenge.progress} / ${challenge.target}</strong>
              <button class="ghost-btn small" type="button" data-action="toggle-challenge" data-id="${challenge.id}">Actualizar progreso</button>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderNotes() {
  return `
    <section class="content-panel">
      <div class="panel-head"><h3>Mis notas</h3></div>
      <form class="note-form" data-form="note-form">
        <input id="noteTitle" type="text" placeholder="Título" />
        <textarea id="noteBody" placeholder="Escribe una nota personal..." rows="4"></textarea>
        <button class="primary-btn" type="submit">Guardar nota</button>
      </form>
      <div class="notes-grid">
        ${state.notes.map((note) => `
          <article class="note-card">
            <div class="note-head"><strong>${note.title}</strong><button class="ghost-btn small danger" type="button" data-action="delete-note" data-id="${note.id}">Eliminar</button></div>
            <p>${note.body}</p>
            <small>${note.date}</small>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderProfile() {
  const points = state.profileStats.points || 850;
  const range = getRange(points);
  return `
    <section class="profile-wrap content-panel">
      <div class="profile-header">
        <div class="avatar">A</div>
        <div>
          <h3>${state.profile.name}</h3>
          <p>${state.profile.objective} · ${state.profile.level}</p>
        </div>
      </div>
      <div class="stats-grid narrow">
        ${renderStat('Rango', range.label, 'actual')}
        ${renderStat('Puntos', `${points}`, 'XP')}
        ${renderStat('Racha', `${state.profileStats.streak} días`, 'actual')}
        ${renderStat('Entrenamientos', state.workouts.length, 'totales')}
      </div>
      <div class="settings-card">
        <h4>Configuración</h4>
        <div class="settings-list">
          <label>Unidad <select><option>Kilogramos</option><option>Libras</option></select></label>
          <label>Tema <select><option>Claro</option><option>Oscuro</option></select></label>
          <label>Objetivo <select><option>Hipertrofia</option><option>Fuerza</option><option>Resistencia</option></select></label>
        </div>
      </div>
    </section>
  `;
}

function openExercise(exerciseId) {
  const exercise = getExercise(exerciseId);
  if (!exercise) return;
  appContent.innerHTML = `
    <section class="content-panel detail-panel">
      <div class="detail-hero">
        <img src="${exercise.image}" alt="${exercise.name}" />
        <div>
          <span class="label-badge">${exercise.category}</span>
          <h3>${exercise.name}</h3>
          <div class="detail-stack">
            <div><strong>Dificultad:</strong> ${exercise.difficulty}</div>
            <div><strong>Equipamiento:</strong> ${exercise.equipment}</div>
            <div><strong>Tipo:</strong> ${exercise.type}</div>
            <div><strong>Calorías:</strong> ≈ ${exercise.caloriesPerMinute} kcal/min</div>
            <div><strong>Series:</strong> ${exercise.setsDefault}</div>
            <div><strong>Reps:</strong> ${exercise.repsDefault}</div>
            <div><strong>Tiempo:</strong> ${exercise.durationDefault} s</div>
          </div>
          <div class="cta-row" style="margin-top:18px;">
            <button class="primary-btn" type="button" data-action="toggle-routine-exercise" data-exercise-id="${exercise.id}">+ Agregar a mi rutina</button>
            <button class="ghost-btn" type="button" data-action="section" data-target-section="routine">Crear rutina</button>
          </div>
        </div>
      </div>
      <div class="detail-grid">
        <div><h4>Instrucciones</h4><ul>${exercise.instructions.map((i) => `<li>${i}</li>`).join('')}</ul></div>
        <div><h4>Consejos técnicos</h4><ul>${exercise.tips.map((i) => `<li>${i}</li>`).join('')}</ul></div>
        <div><h4>Advertencias</h4><ul>${exercise.warnings.map((i) => `<li>${i}</li>`).join('')}</ul></div>
      </div>
    </section>
  `;
}

function startRoutineById(routineId) {
  const routine = state.routines.find((item) => item.id === routineId) || state.draftedRoutine;
  const plan = routine.exercises.map((entry) => ({ ...entry }));
  state.activeWorkout = {
    routineId: routine.id || 'draft',
    routineName: routine.name,
    plan,
    currentIndex: 0,
    currentExerciseId: plan[0]?.exerciseId || null,
    currentPlan: plan[0] || null,
    completed: 0,
    seriesCurrent: 0,
    timer: 90
  };
  state.section = 'workouts';
  saveState();
  renderPage();
}

function toggleDraftExercise(exerciseId) {
  const existing = state.draftedRoutine.exercises.findIndex((entry) => entry.exerciseId === exerciseId);
  if (existing >= 0) state.draftedRoutine.exercises.splice(existing, 1);
  else {
    const exercise = getExercise(exerciseId);
    state.draftedRoutine.exercises.push({ exerciseId, sets: exercise?.setsDefault || 3, reps: exercise?.repsDefault || 10, rest: 60, weight: 25 });
  }
  saveState();
}

function saveDraftRoutine() {
  const routine = {
    id: `routine-${Date.now()}`,
    name: state.draftedRoutine.name || 'Mi rutina',
    objective: state.draftedRoutine.objective || 'Fuerza',
    exercises: state.draftedRoutine.exercises.map((entry) => ({ ...entry }))
  };
  state.routines.unshift(routine);
  state.section = 'workouts';
  saveState();
  renderPage();
}

function completeSet() {
  if (!state.activeWorkout) return;
  const workout = state.activeWorkout;
  workout.completed += 1;
  workout.seriesCurrent += 1;
  if (workout.seriesCurrent >= (workout.currentPlan?.sets || 1)) {
    advanceWorkout();
    return;
  }
  workout.timer = workout.currentPlan?.rest || 60;
  saveState();
  renderPage();
}

function advanceWorkout() {
  if (!state.activeWorkout) return;
  const workout = state.activeWorkout;
  workout.currentIndex += 1;
  if (workout.currentIndex >= workout.plan.length) {
    finalizeWorkout();
    return;
  }
  workout.currentExerciseId = workout.plan[workout.currentIndex].exerciseId;
  workout.currentPlan = workout.plan[workout.currentIndex];
  workout.seriesCurrent = 0;
  workout.timer = workout.currentPlan.rest || 60;
  saveState();
  renderPage();
}

function finalizeWorkout() {
  if (!state.activeWorkout) return;
  const workout = state.activeWorkout;
  const duration = Math.max(30, workout.plan.length * 7 + 10);
  const calories = Math.round(workout.plan.reduce((sum, item) => {
    const ex = getExercise(item.exerciseId);
    return sum + (ex?.caloriesPerMinute || 5) * (duration / 60);
  }, 0));
  state.workouts.unshift({
    id: `w-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    name: workout.routineName || 'Entrenamiento',
    duration,
    calories,
    exercises: workout.plan.length,
    sets: workout.plan.reduce((sum, item) => sum + Number(item.sets || 0), 0),
    reps: workout.plan.reduce((sum, item) => sum + Number(item.reps || 0), 0),
    muscles: workout.plan.map((item) => getExercise(item.exerciseId)?.category || 'General'),
    points: 50
  });
  state.profileStats.points = (state.profileStats.points || 850) + 50;
  state.profileStats.streak = (state.profileStats.streak || 5) + 1;
  state.activeWorkout = null;
  state.section = 'summary';
  saveState();
  renderPage();
}

function getFilteredExercises() {
  return exerciseLibrary.filter((exercise) => {
    const search = state.globalSearch.toLowerCase();
    const matchSearch = !search || exercise.name.toLowerCase().includes(search) || exercise.category.toLowerCase().includes(search) || exercise.secondaryMuscles.join(' ').toLowerCase().includes(search);
    const matchCategory = state.exerciseFilters.category === 'Todos' || exercise.category === state.exerciseFilters.category;
    const matchLevel = state.exerciseFilters.level === 'Todos' || exercise.difficulty === state.exerciseFilters.level;
    const matchEquipment = state.exerciseFilters.equipment === 'Todos' || exercise.equipment === state.exerciseFilters.equipment;
    const matchType = state.exerciseFilters.type === 'Todos' || exercise.type === state.exerciseFilters.type;
    const matchGender = state.exerciseFilters.gender === 'Todos' || exercise.gender === 'unisex';
    return matchSearch && matchCategory && matchLevel && matchEquipment && matchType && matchGender;
  });
}

function getRange(points) {
  if (points < 100) return { label: 'Principiante', max: 99 };
  if (points < 300) return { label: 'Activo', max: 299 };
  if (points < 600) return { label: 'Constante', max: 599 };
  if (points < 1000) return { label: 'Atleta', max: 999 };
  if (points < 2000) return { label: 'Avanzado', max: 1999 };
  return { label: 'Élite', max: 10000 };
}

function estimateRoutineMinutes(routine) {
  return routine.exercises.reduce((sum, ex) => sum + Number(ex.sets || 0) * 2, 0);
}

function formatSeconds(value) {
  const num = Number(value) || 0;
  const minutes = Math.floor(num / 60);
  const seconds = num % 60;
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function daysSince(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.floor(diff / 86400000);
}

function dateString(daysAgo) {
  const date = new Date(); date.setDate(date.getDate() + daysAgo); return date.toISOString().slice(0,10);
}

function getExercise(id) {
  return exerciseLibrary.find((ex) => ex.id === id);
}

function isDrafted(exerciseId) {
  return state.draftedRoutine.exercises.some((entry) => entry.exerciseId === exerciseId);
}

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch {
    return defaultState;
  }
}

function loadStateIntoMemory() {
  const saved = loadState();
  state = { ...defaultState, ...saved, profile: { ...defaultState.profile, ...(saved.profile || {}) }, profileStats: { ...defaultState.profileStats, ...(saved.profileStats || {}) }, exerciseFilters: { ...defaultState.exerciseFilters, ...(saved.exerciseFilters || {}) }, draftedRoutine: { ...defaultState.draftedRoutine, ...(saved.draftedRoutine || {}) }, routines: saved.routines || defaultState.routines, workouts: saved.workouts || defaultState.workouts, notes: saved.notes || defaultState.notes, challenges: saved.challenges || defaultState.challenges, activeWorkout: saved.activeWorkout || null };
  saveState();
}

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.toggle('dark', state.theme === 'dark');
});
