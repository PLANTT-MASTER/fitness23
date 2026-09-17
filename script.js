const body = document.body;
const themeButton = document.createElement('button');
themeButton.className = 'ghost-btn';
themeButton.textContent = '🌙 Modo oscuro';

document.querySelector('.topbar-actions').appendChild(themeButton);

themeButton.addEventListener('click', () => {
  body.classList.toggle('dark');
  const dark = body.classList.contains('dark');
  themeButton.textContent = dark ? '☀️ Modo claro' : '🌙 Modo oscuro';
});

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
  });
});

const segments = document.querySelectorAll('.segment');
segments.forEach((segment) => {
  segment.addEventListener('click', () => {
    segments.forEach((item) => item.classList.remove('active'));
    segment.classList.add('active');
  });
});

// Rutina: lista de GIFs disponibles (archivos locales)
const gifList = [
  "Archer-Pull-up.gif",
  "Archer-Push-Up.gif",
  "Barbell-Bent-Over-Row.gif",
  "Bear-Crawl.gif",
  "body-saw-plank.gif",
  "Burpee-with-Push-Up.gif",
  "burpees.gif",
  "Dumbbell-Jump-Squat.gif",
  "dumbbell-lunges.gif",
  "dumbbell-renegade-row-1.gif",
  "handstand-holds.gif",
  "handstand-walk.gif",
  "Kettlebell-Swings.gif",
  "Modified-Hindu-Push-up.gif",
  "Navy-Seal-Burpee.gif",
  "Push-Up-toe-Touch.gif",
  "Push-Up-toe-Touch.gif",
  "Push-Up-toe-Touch.gif",
  "Push-Up-toe-Touch.gif",
  "Push-Up-toe-Touch.gif",
  "SNAP-JUMPS.gif",
  "thruster.gif",
  "wall-ball.gif",
  "zercher-carry.gif"
];

// Rutina state
let rutina = [];

function populateGifSelect() {
  const sel = document.getElementById('gifSelect');
  if (!sel) return;
  gifList.forEach((f) => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f.replace(/[-_]/g, ' ').replace(/\.gif$/i, '');
    sel.appendChild(opt);
  });
}

function saveRutina() {
  localStorage.setItem('rutina', JSON.stringify(rutina));
}

function loadRutina() {
  const data = localStorage.getItem('rutina');
  if (data) rutina = JSON.parse(data);
}

function renderRutina() {
  const list = document.getElementById('routineList');
  if (!list) return;
  list.innerHTML = '';
  rutina.forEach((ex, i) => {
    const item = document.createElement('div');
    item.className = 'exercise-item';

    const img = document.createElement('img');
    img.src = ex.gif || '';
    img.alt = ex.name;

    const meta = document.createElement('div');
    meta.className = 'exercise-meta';
    meta.innerHTML = `<strong>${ex.name}</strong><div>${ex.sets} × ${ex.reps} • Descanso ${ex.rest || '60s'}</div>`;

    const controls = document.createElement('div');
    controls.className = 'exercise-controls';

    const up = document.createElement('button');
    up.className = 'small-btn';
    up.textContent = '↑';
    up.title = 'Subir';
    up.addEventListener('click', () => { if (i>0) { [rutina[i-1], rutina[i]] = [rutina[i], rutina[i-1]]; saveRutina(); renderRutina(); } });

    const down = document.createElement('button');
    down.className = 'small-btn';
    down.textContent = '↓';
    down.title = 'Bajar';
    down.addEventListener('click', () => { if (i<rutina.length-1) { [rutina[i+1], rutina[i]] = [rutina[i], rutina[i+1]]; saveRutina(); renderRutina(); } });

    const del = document.createElement('button');
    del.className = 'small-btn';
    del.textContent = 'Eliminar';
    del.addEventListener('click', () => { rutina.splice(i,1); saveRutina(); renderRutina(); });

    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(del);

    item.appendChild(img);
    item.appendChild(meta);
    item.appendChild(controls);

    list.appendChild(item);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateGifSelect();
  loadRutina();
  renderRutina();

  const form = document.getElementById('exerciseForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('exerciseName').value.trim();
      const sets = document.getElementById('sets').value || '3';
      const reps = document.getElementById('reps').value || '';
      const gif = document.getElementById('gifSelect').value || '';
      if (!name) return;
      rutina.push({ name, sets, reps, rest: '60s', gif });
      saveRutina();
      renderRutina();
      form.reset();
    });
  }

  const exportBtn = document.getElementById('exportRoutineBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const out = rutina.map((r,i) => `${i+1}. ${r.name} — ${r.sets}×${r.reps} — ${r.rest}`).join('\n');
      const w = window.open('', '_blank');
      w.document.write(`<pre style="font-family: Inter, Arial; white-space: pre-wrap;">${out}</pre>`);
      w.document.title = 'Rutina exportada';
    });
  }
});
