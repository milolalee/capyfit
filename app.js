// Global State
let state = {
  currentWorkout: null,
  workouts: [],
  lastPerformance: {},
  expandedExerciseId: null,
  quickCardioOpen: false,
  currentView: "dashboard",
  templates: [],
  templateBuilder: {
    isOpen: false,
    editingTemplateId: null,
    name: "",
    description: "",
    exercises: []
  },
  templateSelectorOpen: false
};

// Predefined Exercise List
const EXERCISES = [
  "Dumbbell Bench Press",
  "Dumbbell Incline Press",
  "Dumbbell Decline Press",
  "Dumbbell Fly",
  "Dumbbell Incline Fly",
  "Dumbbell Pullover",
  "Cable Chest Press",
  "Cable Fly",
  "Cable Incline Fly",
  "Cable Decline Fly",
  "Single Arm Cable Press",
  "Cable Crossover",
  "Machine Chest Press",
  "Dumbbell Shoulder Press",
  "Dumbbell Arnold Press",
  "Dumbbell Lateral Raise",
  "Dumbbell Side Lateral Raise",
  "Dumbbell Front Raise",
  "Dumbbell Rear Delt Fly",
  "Dumbbell Upright Row",
  "Cable Lateral Raise",
  "Cable Front Raise",
  "Cable Rear Delt Fly",
  "Cable Face Pull",
  "Cable Upright Row",
  "Single Arm Cable Lateral Raise",
  "Dumbbell Squat",
  "Dumbbell Goblet Squat",
  "Dumbbell Lunges",
  "Dumbbell Walking Lunges",
  "Dumbbell Romanian Deadlift",
  "Dumbbell Step Up",
  "Dumbbell Bulgarian Split Squat",
  "Dumbbell Calf Raise",
  "Cable Squat",
  "Cable Pull Through",
  "Cable Kickback",
  "Cable Leg Curl",
  "Cable Leg Extension",
  "Machine Leg Press",
  "Machine Leg Extension",
  "Dumbbell Bicep Curl",
  "Dumbbell Hammer Curl",
  "Dumbbell Concentration Curl",
  "Dumbbell Incline Curl",
  "Cable Bicep Curl",
  "Cable Hammer Curl",
  "Cable Preacher Curl",
  "Single Arm Cable Curl",
  "Dumbbell Tricep Extension",
  "Dumbbell Overhead Extension",
  "Dumbbell Kickback",
  "Dumbbell Skullcrusher",
  "Cable Tricep Pushdown",
  "Cable Overhead Tricep Extension",
  "Cable Rope Pushdown",
  "Single Arm Cable Pushdown",
  "Push Up",
  "Incline Push Up",
  "Decline Push Up",
  "Diamond Push Up",
  "Wide Push Up",
  "Pull Up",
  "Chin Up",
  "Neutral Grip Pull Up",
  "Dips",
  "Bench Dips",
  "Plank",
  "Side Plank",
  "Dead Bug",
  "Hollow Hold",
  "Leg Raise",
  "Hanging Leg Raise",
  "Mountain Climbers",
  "Bodyweight Squat",
  "Jump Squat",
  "Lunges",
  "Reverse Lunges",
  "Walking Lunges",
  "Step Back Lunges",
  "Bulgarian Split Squat (BW)",
  "Glute Bridge",
  "Hip Thrust (BW)",
  "Single Leg Glute Bridge",
  "Calf Raise (BW)",
  "Burpees",
  "High Knees",
  "Jumping Jacks",
  "Bear Crawl",
  "Skater Jumps",
  "Walking",
  "Jogging",
  "Running",
  "Cycling",
  "Rowing",
  "Elliptical",
  "Stair Climber",
  "Jump Rope",
  "Swimming",
  "Hiking"
];

const BODYWEIGHT_EXERCISES = new Set([
  "Push Up",
  "Incline Push Up",
  "Decline Push Up",
  "Diamond Push Up",
  "Wide Push Up",
  "Pull Up",
  "Chin Up",
  "Neutral Grip Pull Up",
  "Dips",
  "Bench Dips",
  "Plank",
  "Side Plank",
  "Dead Bug",
  "Hollow Hold",
  "Leg Raise",
  "Hanging Leg Raise",
  "Mountain Climbers",
  "Bodyweight Squat",
  "Jump Squat",
  "Lunges",
  "Reverse Lunges",
  "Walking Lunges",
  "Step Back Lunges",
  "Bulgarian Split Squat (BW)",
  "Glute Bridge",
  "Hip Thrust (BW)",
  "Single Leg Glute Bridge",
  "Calf Raise (BW)",
  "Burpees",
  "High Knees",
  "Jumping Jacks",
  "Bear Crawl",
  "Skater Jumps"
]);

const CARDIO_EXERCISES = new Set([
  "Walking",
  "Jogging",
  "Running",
  "Cycling",
  "Rowing",
  "Elliptical",
  "Stair Climber",
  "Jump Rope",
  "Swimming",
  "Hiking"
]);

const QUICK_CARDIO_EXERCISES = [
  "Walking",
  "Running",
  "Cycling",
  "Jump Rope",
  "Swimming"
];

function saveToStorage() {
  localStorage.setItem("workouts", JSON.stringify(state.workouts));
  localStorage.setItem("lastPerformance", JSON.stringify(state.lastPerformance));
}

function loadFromStorage() {
  state.workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  state.lastPerformance = JSON.parse(localStorage.getItem("lastPerformance")) || {};
  
  // Load templates safely
  try {
    state.templates = templates.getAllTemplates();
    console.log("[App] Loaded", state.templates.length, "templates");
  } catch (error) {
    console.error("[App] Error loading templates:", error);
    state.templates = [];
  }

  state.workouts = state.workouts
    .filter(Boolean)
    .filter((workout, index, workouts) => {
      return index === workouts.findIndex(item => item.id === workout.id);
    })
    .map(workout => ({
      ...workout,
      exercises: (workout.exercises || []).map(exercise => ({
        ...exercise,
        trackingMode: getExerciseTrackingMode(exercise),
        sets: exercise.sets || []
      }))
    }));
}

function getExercise(exerciseId) {
  if (!state.currentWorkout) {
    return null;
  }

  return state.currentWorkout.exercises.find(exercise => exercise.id === exerciseId) || null;
}

function isSameDay(ts1, ts2) {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getSuggestion(lastPerformance, currentSet) {
  if (!lastPerformance || !currentSet || !Number.isFinite(lastPerformance.weight)) {
    return null;
  }

  if (currentSet.reps >= lastPerformance.reps) {
    return lastPerformance.weight + 2.5;
  }

  return lastPerformance.weight;
}

function getSuggestions(query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  if ("cardio".includes(normalized)) {
    return QUICK_CARDIO_EXERCISES;
  }

  return EXERCISES
    .filter(exercise => exercise.toLowerCase().includes(normalized))
    .slice(0, 5);
}

function renderQuickAddSection() {
  return `
    <div class="quick-add-section">
      <div class="quick-add-group">
        <button class="quick-add-toggle" data-action="toggle-quick-cardio" aria-expanded="${state.quickCardioOpen}">
          <span class="quick-add-label">Quick cardio</span>
          <span class="quick-add-toggle-text">${state.quickCardioOpen ? "Hide" : "Show"}</span>
        </button>
        <div
          class="quick-add-chips ${state.quickCardioOpen ? "is-open" : "is-collapsed"}"
          style="${state.quickCardioOpen ? "display:flex;" : "display:none;"}"
          aria-hidden="${state.quickCardioOpen ? "false" : "true"}"
        >
          ${QUICK_CARDIO_EXERCISES.map(name => `
            <button class="quick-chip cardio-chip" data-action="quick-add-exercise" data-name="${name}">
              ${name}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function isBodyweightExerciseName(name) {
  const normalized = name.trim().toLowerCase();

  if (BODYWEIGHT_EXERCISES.has(name)) {
    return true;
  }

  if (normalized.includes("bodyweight") || normalized.includes("(bw)")) {
    return true;
  }

  if (/(dumbbell|barbell|cable|kettlebell|machine|smith|landmine|weighted|plate)/.test(normalized)) {
    return false;
  }

  return /(push up|pull up|chin up|dip|plank|dead bug|hollow hold|leg raise|mountain climbers|squat|lunge|glute bridge|hip thrust|calf raise|burpee|high knees|jumping jacks|bear crawl|skater jumps)/.test(normalized);
}

function isCardioExerciseName(name) {
  const normalized = name.trim().toLowerCase();

  if (CARDIO_EXERCISES.has(name)) {
    return true;
  }

  return /(walk|jog|run|cycl|row|elliptical|stair|jump rope|swim|hike|cardio)/.test(normalized);
}

function getExerciseTrackingMode(exerciseOrName) {
  if (!exerciseOrName) {
    return "weighted";
  }

  if (typeof exerciseOrName === "string") {
    if (isCardioExerciseName(exerciseOrName)) {
      return "cardio";
    }

    return isBodyweightExerciseName(exerciseOrName) ? "bodyweight" : "weighted";
  }

  if (exerciseOrName.trackingMode) {
    return exerciseOrName.trackingMode;
  }

  if (isCardioExerciseName(exerciseOrName.name)) {
    return "cardio";
  }

  return isBodyweightExerciseName(exerciseOrName.name) ? "bodyweight" : "weighted";
}

function normalizeSetWeight(weight) {
  return Number.isFinite(weight) && weight > 0 ? weight : 0;
}

function formatSetMetric(set, trackingMode) {
  const weight = normalizeSetWeight(set.weight);

  if (trackingMode === "cardio") {
    const duration = Number.isFinite(set.duration) ? `${set.duration} min` : "0 min";
    const distance = Number.isFinite(set.distance) && set.distance > 0 ? ` / ${set.distance} km` : "";
    return `${duration}${distance}`;
  }

  if (trackingMode === "bodyweight" && weight === 0) {
    return `${set.reps} reps`;
  }

  return `${weight} kg x ${set.reps} reps`;
}

function getExerciseInputConfig(trackingMode) {
  if (trackingMode === "cardio") {
    return {
      primaryClass: "duration-input",
      primaryType: "number",
      primaryMin: "1",
      primaryStep: "1",
      primaryPlaceholder: "minutes",
      primaryValueKey: "duration",
      secondaryClass: "distance-input optional-input",
      secondaryType: "number",
      secondaryMin: "0",
      secondaryStep: "0.1",
      secondaryPlaceholder: "distance km (optional)",
      secondaryValueKey: "distance"
    };
  }

  return {
    primaryClass: trackingMode === "bodyweight" ? "weight-input optional-input" : "weight-input",
    primaryType: "number",
    primaryMin: "0",
    primaryStep: "0.5",
    primaryPlaceholder: trackingMode === "bodyweight" ? "added weight (optional)" : "kg",
    primaryValueKey: "weight",
    secondaryClass: "reps-input",
    secondaryType: "number",
    secondaryMin: "1",
    secondaryStep: "1",
    secondaryPlaceholder: "reps",
    secondaryValueKey: "reps"
  };
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatWeekLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function formatTrendDelta(change, suffix = "") {
  if (change.direction === "flat") {
    return `No change${suffix ? ` ${suffix}` : ""}`;
  }

  const prefix = change.direction === "up" ? "+" : "";
  return `${prefix}${change.delta}${suffix ? ` ${suffix}` : ""} vs last week`;
}

function getTrendBarsHtml(weeklyData, metric, formatter) {
  if (!weeklyData.length) {
    return '<div class="trend-empty">Not enough weekly data yet.</div>';
  }

  const maxValue = Math.max(...weeklyData.map(week => week[metric]), 1);

  return `
    <div class="mini-trend-chart">
      ${weeklyData.map(week => {
        const value = week[metric];
        const height = Math.max((value / maxValue) * 100, value > 0 ? 12 : 6);

        return `
          <div class="mini-trend-item">
            <div class="mini-trend-bar-wrap">
              <div class="mini-trend-bar" style="height:${height}%"></div>
            </div>
            <div class="mini-trend-value">${formatter(value)}</div>
            <div class="mini-trend-label">${formatWeekLabel(week.weekStart)}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getActiveDaysThisWeek() {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1) - day;

  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() + diff);

  const activeDays = new Set();

  state.workouts.forEach(workout => {
    const workoutDate = new Date(workout.date);

    if (workoutDate >= startOfWeek) {
      activeDays.add(workoutDate.toDateString());
    }
  });

  return activeDays.size;
}

function getWeeklyTrackerHtml() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1) - day;

  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() + diff);

  return days.map((label, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);

    const hasWorkout = state.workouts.some(workout => isSameDay(workout.date, date.getTime()));

    return `
      <div class="day">
        <div>${label}</div>
        <div class="${hasWorkout ? "dot active" : "dot"}"></div>
      </div>
    `;
  }).join("");
}

function getExerciseSummary(exercise) {
  if (!exercise.sets.length) {
    return "No sets yet";
  }

  const lastSet = exercise.sets[exercise.sets.length - 1];
  const trackingMode = getExerciseTrackingMode(exercise);

  if (trackingMode === "cardio") {
    return `${formatSetMetric(lastSet, trackingMode)} x ${exercise.sets.length} entries`;
  }

  if (trackingMode === "bodyweight" && normalizeSetWeight(lastSet.weight) === 0) {
    return `${lastSet.reps} reps x ${exercise.sets.length} sets`;
  }

  return `${normalizeSetWeight(lastSet.weight)} kg x ${lastSet.reps} reps x ${exercise.sets.length} sets`;
}

function getTodayWorkout() {
  const now = Date.now();
  return state.workouts.find(workout => isSameDay(workout.date, now)) || null;
}

function getLatestWorkout() {
  if (!state.workouts.length) {
    return null;
  }

  return [...state.workouts].sort((a, b) => b.date - a.date)[0];
}

function setCurrentView(view) {
  state.currentView = view;
}

// Template Management Functions
function openTemplateBuilder(templateId = null) {
  if (templateId) {
    const template = templates.getTemplate(templateId);
    if (template) {
      state.templateBuilder = {
        isOpen: true,
        editingTemplateId: templateId,
        name: template.name,
        description: template.description,
        exercises: [...template.exercises]
      };
    }
  } else {
    state.templateBuilder = {
      isOpen: true,
      editingTemplateId: null,
      name: "",
      description: "",
      exercises: []
    };
  }
  renderApp();
}

function closeTemplateBuilder() {
  console.log("[Template] Closing template builder, current view:", state.currentView);
  state.templateBuilder = {
    isOpen: false,
    editingTemplateId: null,
    name: "",
    description: "",
    exercises: []
  };
  console.log("[Template] Calling renderApp after close");
  renderApp();
}

function addExerciseToTemplateBuilder(exerciseName) {
  const trimmedName = exerciseName.trim();
  if (!trimmedName) {
    return;
  }

  state.templateBuilder.exercises.push({
    name: trimmedName,
    trackingMode: getExerciseTrackingMode(trimmedName),
    defaultSets: 3
  });
  renderApp();
}

function removeExerciseFromTemplateBuilder(index) {
  state.templateBuilder.exercises.splice(index, 1);
  renderApp();
}

function reorderTemplateExercises(fromIndex, toIndex) {
  const exercises = state.templateBuilder.exercises;
  const [removed] = exercises.splice(fromIndex, 1);
  exercises.splice(toIndex, 0, removed);
  renderApp();
}

function saveTemplateFromBuilder() {
  const { name, description, exercises, editingTemplateId } = state.templateBuilder;

  if (!name.trim() || exercises.length === 0) {
    alert("Please enter a template name and add at least one exercise.");
    return;
  }

  console.log("[Template] Saving template:", { name, exercises: exercises.length });

  const result = editingTemplateId
    ? templates.updateTemplate({ name, description, exercises })
    : templates.createTemplate({ name, description, exercises });

  if (!result) {
    console.error("Failed to save template. Validation or save error occurred.");
    alert("Failed to save template. Please check your input.");
    return;
  }

  // Proceed with UI updates only if save is successful
  state.templates = templates.getAllTemplates();
  console.log("[Template] Updated state.templates, count:", state.templates.length);
  
  // Switch to templates view to show the newly created template
  state.currentView = "templates";
  
  closeTemplateBuilder();
}

function deleteTemplateHandler(templateId) {
  const shouldDelete = confirm("Delete this template?");
  if (!shouldDelete) {
    return;
  }

  templates.deleteTemplate(templateId);
  state.templates = templates.getAllTemplates();
  renderApp();
}

function useTemplateHandler(templateId) {
  const template = templates.useTemplate(templateId);
  if (!template) {
    return;
  }

  state.templates = templates.getAllTemplates();

  // Always create a new workout with template exercises
  const now = Date.now();
  const workout = {
    id: `wo_${now}`,
    date: now,
    exercises: template.exercises.map(ex => ({
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: ex.name,
      trackingMode: ex.trackingMode,
      sets: [],
      collapsed: false
    }))
  };

  state.workouts.push(workout);
  state.currentWorkout = workout;

  state.expandedExerciseId = state.currentWorkout.exercises[0]?.id || null;
  state.currentView = "workout";
  state.templateSelectorOpen = false;
  saveToStorage();
  renderApp();

  const input = document.getElementById("exercise-input");
  if (input) {
    input.focus();
  }
}

function openTemplateSelector() {
  state.templateSelectorOpen = true;
  renderApp();
}

function closeTemplateSelector() {
  state.templateSelectorOpen = false;
  renderApp();
}

function renderAppNav() {
  const container = document.getElementById("app-nav");
  if (!container) {
    return;
  }

  const dashboardActive = state.currentView === "dashboard";
  const workoutActive = state.currentView === "workout";
  const templatesActive = state.currentView === "templates";
  const currentWorkoutLabel = state.currentWorkout ? "Resume Workout" : "Workout";
  const workoutMeta = state.currentWorkout
    ? `${state.currentWorkout.exercises.length} exercises`
    : "Start logging";
  const templatesCount = state.templates.length;

  container.innerHTML = `
    <div class="card nav-card">
      <div class="nav-copy">
        <div class="eyebrow">Fitness Tracker</div>
        <h1>Train with less clutter</h1>
      </div>
      <div class="view-switcher" role="tablist" aria-label="App views">
        <button class="view-tab ${dashboardActive ? "is-active" : ""}" data-action="switch-view" data-view="dashboard" role="tab" aria-selected="${dashboardActive}">
          <span>Dashboard</span>
          <small>Overview</small>
        </button>
        <button class="view-tab ${workoutActive ? "is-active" : ""}" data-action="switch-view" data-view="workout" role="tab" aria-selected="${workoutActive}">
          <span>${currentWorkoutLabel}</span>
          <small>${workoutMeta}</small>
        </button>
        <button class="view-tab ${templatesActive ? "is-active" : ""}" data-action="switch-view" data-view="templates" role="tab" aria-selected="${templatesActive}">
          <span>Templates</span>
          <small>${templatesCount} saved</small>
        </button>
      </div>
    </div>
  `;
}

function renderViews() {
  const dashboardView = document.getElementById("dashboard-view");
  const workoutView = document.getElementById("workout-view");
  const templatesView = document.getElementById("templates-view");

  if (dashboardView) {
    dashboardView.hidden = state.currentView !== "dashboard";
  }

  if (workoutView) {
    workoutView.hidden = state.currentView !== "workout";
  }

  if (templatesView) {
    templatesView.hidden = state.currentView !== "templates";
  }
}

function startWorkout() {
  const now = Date.now();
  const existingWorkout = state.workouts.find(workout => isSameDay(workout.date, now));

  if (existingWorkout) {
    state.currentWorkout = existingWorkout;
    state.expandedExerciseId = existingWorkout.exercises[0]?.id || null;
  } else {
    const workout = {
      id: `wo_${now}`,
      date: now,
      exercises: []
    };

    state.workouts.push(workout);
    state.currentWorkout = workout;
    state.expandedExerciseId = null;
  }

  state.currentView = "workout";
  saveToStorage();
  renderApp();

  const input = document.getElementById("exercise-input");
  if (input) {
    input.focus();
  }
}

function handleAddExercise(name) {
  if (!state.currentWorkout) {
    startWorkout();
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return;
  }

  state.currentWorkout.exercises.forEach(exercise => {
    if (exercise.sets.length > 0) {
      exercise.collapsed = true;
    }
  });

  const exerciseId = `ex_${Date.now()}`;

  state.currentWorkout.exercises.push({
    id: exerciseId,
    name: trimmedName,
    trackingMode: getExerciseTrackingMode(trimmedName),
    sets: [],
    collapsed: false
  });

  state.expandedExerciseId = exerciseId;
  state.currentView = "workout";
  saveToStorage();
  renderApp();

  const input = document.getElementById("exercise-input");
  if (input) {
    input.value = "";
    input.focus();
  }
}

function addSetToExercise(exerciseId, metrics) {
  const exercise = getExercise(exerciseId);
  if (!exercise) {
    return;
  }

  const trackingMode = getExerciseTrackingMode(exercise);
  let set;

  if (trackingMode === "cardio") {
    set = {
      duration: metrics.duration,
      distance: Number.isFinite(metrics.distance) && metrics.distance > 0 ? metrics.distance : 0,
      isPR: {
        isWeightPR: false,
        isRepPR: false,
        isVolumePR: false
      }
    };

    state.lastPerformance[exercise.name] = {
      duration: set.duration,
      distance: set.distance
    };
  } else {
    const normalizedWeight = normalizeSetWeight(metrics.weight);
    const isPR = analytics.checkPR(state.workouts, exercise.name, normalizedWeight, metrics.reps);

    set = {
      weight: normalizedWeight,
      reps: metrics.reps,
      isPR
    };

    state.lastPerformance[exercise.name] = {
      weight: normalizedWeight,
      reps: metrics.reps
    };
  }

  exercise.sets.push(set);
  saveToStorage();
}

function handleAddSet(exerciseId) {
  const card = document.querySelector(`[data-ex-id="${exerciseId}"]`);
  const exercise = getExercise(exerciseId);
  if (!card) {
    return;
  }

  const trackingMode = getExerciseTrackingMode(exercise);
  const primaryValue = parseFloat(card.querySelector(".primary-input")?.value || "");
  const secondaryValue = parseFloat(card.querySelector(".secondary-input")?.value || "");

  if (trackingMode === "cardio") {
    if (!Number.isFinite(primaryValue) || primaryValue <= 0) {
      return;
    }

    state.expandedExerciseId = exerciseId;
    addSetToExercise(exerciseId, {
      duration: primaryValue,
      distance: secondaryValue
    });
    renderApp();
    return;
  }

  const reps = parseInt(card.querySelector(".secondary-input")?.value || "", 10);

  if (!Number.isFinite(reps) || reps <= 0) {
    return;
  }

  if (trackingMode === "weighted" && (!Number.isFinite(primaryValue) || primaryValue <= 0)) {
    return;
  }

  state.expandedExerciseId = exerciseId;
  addSetToExercise(exerciseId, {
    weight: primaryValue,
    reps
  });
  renderApp();
}

function handleRepeatSet(exerciseId) {
  const exercise = getExercise(exerciseId);
  const lastSet = exercise?.sets[exercise.sets.length - 1];

  if (!exercise || !lastSet) {
    return;
  }

  state.expandedExerciseId = exerciseId;
  if (getExerciseTrackingMode(exercise) === "cardio") {
    addSetToExercise(exerciseId, {
      duration: lastSet.duration,
      distance: lastSet.distance
    });
  } else {
    addSetToExercise(exerciseId, {
      weight: lastSet.weight,
      reps: lastSet.reps
    });
  }
  renderApp();
}

function handleFinishWorkout() {
  if (!state.currentWorkout) {
    return;
  }

  if (state.currentWorkout.exercises.length === 0) {
    state.workouts = state.workouts.filter(workout => workout.id !== state.currentWorkout.id);
  }

  state.currentWorkout = null;
  state.expandedExerciseId = null;
  state.currentView = "dashboard";

  saveToStorage();
  renderApp();
}

function handleDeleteExercise(exerciseId) {
  if (!state.currentWorkout) {
    return;
  }

  state.currentWorkout.exercises = state.currentWorkout.exercises.filter(exercise => exercise.id !== exerciseId);

  if (state.expandedExerciseId === exerciseId) {
    state.expandedExerciseId = state.currentWorkout.exercises[0]?.id || null;
  }

  saveToStorage();
  renderApp();
}

function toggleExercise(exerciseId) {
  state.expandedExerciseId = state.expandedExerciseId === exerciseId ? null : exerciseId;
  renderApp();
}

function handleDeleteWorkout(workoutId) {
  state.workouts = state.workouts.filter(workout => workout.id !== workoutId);

  if (state.currentWorkout?.id === workoutId) {
    state.currentWorkout = null;
    state.expandedExerciseId = null;
  }

  saveToStorage();
  renderApp();
}

function handleClearAllHistory() {
  const shouldDelete = confirm("Delete all workout history?");
  if (!shouldDelete) {
    return;
  }

  state.workouts = [];
  state.currentWorkout = null;
  state.lastPerformance = {};
  state.expandedExerciseId = null;

  saveToStorage();
  renderApp();
}

function renderKPI() {
  const container = document.getElementById("kpi-section");
  if (!container) {
    return;
  }

  const totalWorkouts = state.workouts.length;
  const totalVolume = state.workouts.reduce((sum, workout) => {
    return sum + analytics.getWorkoutSummary(workout).totalVolume;
  }, 0);
  const totalCardioMinutes = state.workouts.reduce((sum, workout) => {
    return sum + analytics.getWorkoutSummary(workout).totalCardioMinutes;
  }, 0);
  const activeDays = getActiveDaysThisWeek();
  const consistency = Math.round((activeDays / 7) * 100);
  const totalExercises = state.workouts.reduce((sum, workout) => {
    return sum + workout.exercises.length;
  }, 0);

  container.innerHTML = `
    <div class="card kpi-card">
      <div class="kpi-item">
        <div class="kpi-label">Total Workouts</div>
        <div class="kpi-value">${totalWorkouts}</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Total Volume</div>
        <div class="kpi-value">${totalVolume} kg</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Active Days</div>
        <div class="kpi-value">${activeDays}/7</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Consistency</div>
        <div class="kpi-value">${consistency}%</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Exercises Logged</div>
        <div class="kpi-value">${totalExercises}</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Cardio Minutes</div>
        <div class="kpi-value">${totalCardioMinutes}</div>
      </div>
    </div>
  `;
}

function renderDashboardOverview() {
  const container = document.getElementById("dashboard-overview");
  if (!container) {
    return;
  }

  const currentWorkout = state.currentWorkout || getTodayWorkout();
  const latestWorkout = getLatestWorkout();
  const currentSummary = currentWorkout ? analytics.getWorkoutSummary(currentWorkout) : null;
  const latestSummary = latestWorkout ? analytics.getWorkoutSummary(latestWorkout) : null;
  const weeklyData = analytics.aggregateWorkoutsByWeek(state.workouts, { limit: 6 });
  const volumeTrend = analytics.getWeekOverWeekChange(weeklyData, "totalVolume");
  const cardioTrend = analytics.getWeekOverWeekChange(weeklyData, "totalCardioMinutes");

  container.innerHTML = `
    <div class="card dashboard-hero">
      <div class="dashboard-hero-copy">
        <div class="eyebrow">Dashboard</div>
        <h2>Everything important, one glance away</h2>
        <p class="section-copy">Review consistency, check the latest session, and jump back into workout entry when you're ready to log.</p>
      </div>
      <button class="btn-primary dashboard-cta" data-action="switch-view" data-view="workout">
        ${state.currentWorkout ? "Open Workout" : "Go To Workout"}
      </button>
    </div>
    <div class="dashboard-feature-grid">
      <div class="card dashboard-panel">
        <div class="section-heading">
          <div>
            <h3>Current Session</h3>
            <p class="section-copy">${currentWorkout ? "Live status of today's workout." : "Start a workout to see live progress here."}</p>
          </div>
        </div>
        ${currentWorkout ? `
          <div class="dashboard-session-date">${formatDate(currentWorkout.date)}</div>
          <div class="dashboard-stat-row">
            <span>${currentWorkout.exercises.length} exercises</span>
            <span>${currentSummary.totalSets} sets</span>
            ${currentSummary.totalVolume > 0 ? `<span>${currentSummary.totalVolume} kg</span>` : ""}
            ${currentSummary.totalCardioMinutes > 0 ? `<span>${currentSummary.totalCardioMinutes} min cardio</span>` : ""}
          </div>
          <button class="btn-secondary dashboard-panel-action" data-action="switch-view" data-view="workout">Continue Workout</button>
        ` : `
          <div class="dashboard-empty-copy">No active workout right now.</div>
          <button class="btn-secondary dashboard-panel-action" data-action="start-workout">Start Session</button>
        `}
      </div>
      <div class="card dashboard-panel">
        <div class="section-heading">
          <div>
            <h3>Weekly Trends</h3>
            <p class="section-copy">Six-week snapshot for volume and cardio momentum.</p>
          </div>
        </div>
        ${weeklyData.length ? `
          <div class="dashboard-trend-grid">
            <div class="trend-card">
              <div class="trend-card-header">
                <strong>Volume</strong>
                <span>${volumeTrend.current} kg</span>
              </div>
              <div class="trend-delta ${volumeTrend.direction}">${formatTrendDelta(volumeTrend, "kg")}</div>
              ${getTrendBarsHtml(weeklyData, "totalVolume", value => `${value}`)}
            </div>
            <div class="trend-card">
              <div class="trend-card-header">
                <strong>Cardio</strong>
                <span>${cardioTrend.current} min</span>
              </div>
              <div class="trend-delta ${cardioTrend.direction}">${formatTrendDelta(cardioTrend, "min")}</div>
              ${getTrendBarsHtml(weeklyData, "totalCardioMinutes", value => `${value}`)}
            </div>
          </div>
        ` : `
          <div class="dashboard-empty-copy">Log workouts across multiple weeks to unlock trend cards.</div>
        `}
      </div>
    </div>
  `;
}

function renderAnalytics() {
  const container = document.getElementById("analytics-section");
  if (!container) {
    return;
  }

  const latestWorkout = getLatestWorkout();
  const latestSummary = latestWorkout ? analytics.getWorkoutSummary(latestWorkout) : null;
  const weeklyData = analytics.aggregateWorkoutsByWeek(state.workouts, { limit: 6 });
  const activeDaysTrend = analytics.getWeekOverWeekChange(weeklyData, "activeDays");

  container.innerHTML = `
    <div class="card analytics-card">
      <div class="section-heading">
        <div>
          <h3>Weekly Rhythm</h3>
          <p class="section-copy">A quick view of training consistency this week.</p>
        </div>
      </div>
      <div id="weekly-tracker">${getWeeklyTrackerHtml()}</div>
      <div class="analytics-trend-card">
        <div class="trend-card-header">
          <strong>Active Days</strong>
          <span>${activeDaysTrend.current}/7</span>
        </div>
        <div class="trend-delta ${activeDaysTrend.direction}">${formatTrendDelta(activeDaysTrend, "days")}</div>
        ${getTrendBarsHtml(weeklyData, "activeDays", value => `${value}`)}
      </div>
    </div>
    <div class="card analytics-card">
      <div class="section-heading">
        <div>
          <h3>Latest Snapshot</h3>
          <p class="section-copy">Compact recap from the last logged session.</p>
        </div>
      </div>
      <div class="chart-placeholder">
        ${latestWorkout ? `
          <div class="snapshot">
            <div class="snapshot-date">${formatDate(latestWorkout.date)}</div>
            <div class="snapshot-stats">
              <span>${latestWorkout.exercises.length} exercises</span>
              <span>${latestSummary.totalSets} sets</span>
              ${latestSummary.totalVolume > 0 ? `<span>${latestSummary.totalVolume} kg volume</span>` : ""}
              ${latestSummary.totalCardioMinutes > 0 ? `<span>${latestSummary.totalCardioMinutes} cardio min</span>` : ""}
              ${latestSummary.totalDistanceKm > 0 ? `<span>${latestSummary.totalDistanceKm} km</span>` : ""}
            </div>
          </div>
        ` : `
          <div class="placeholder-text">Start a workout to build your first session snapshot.</div>
        `}
      </div>
    </div>
  `;
}

function renderExerciseCard(exercise) {
  const isExpanded = state.expandedExerciseId === exercise.id;
  const trackingMode = getExerciseTrackingMode(exercise);
  const inputConfig = getExerciseInputConfig(trackingMode);

  if (!isExpanded) {
    return `
      <div class="card exercise-collapsed" data-action="toggle-exercise" data-ex-id="${exercise.id}">
        <div class="exercise-collapsed-header">
          <strong>${exercise.name}</strong>
          <span class="text-dim">${getExerciseSummary(exercise)}</span>
        </div>
      </div>
    `;
  }

  const lastPerformance = state.lastPerformance[exercise.name];
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const suggestedWeight = getSuggestion(lastPerformance, lastSet);
  const shouldShowSuggestion = Boolean(
    lastSet &&
    lastPerformance &&
    trackingMode === "weighted" &&
    suggestedWeight !== null &&
    suggestedWeight > lastPerformance.weight
  );

  const setsHtml = exercise.sets.map((set, index) => {
    const hasPR = set.isPR && (set.isPR.isWeightPR || set.isPR.isRepPR || set.isPR.isVolumePR);

    return `
      <div class="set-row">
        <span class="set-number">${index + 1}</span>
        <div class="set-info">
          <span><strong>${formatSetMetric(set, trackingMode)}</strong></span>
          ${hasPR ? '<span class="pr-badge">PR</span>' : ""}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="card exercise-active" data-ex-id="${exercise.id}">
      <h3>${exercise.name}</h3>
      <div class="exercise-meta">
        ${trackingMode === "cardio"
          ? "Cardio activity"
          : trackingMode === "bodyweight"
            ? "Bodyweight exercise"
            : "Weighted exercise"}
      </div>
      ${shouldShowSuggestion ? `<div class="suggestion">Suggested: ${suggestedWeight} kg</div>` : ""}
      <div class="set-input-row">
        <input
          class="${inputConfig.primaryClass} primary-input"
          type="${inputConfig.primaryType}"
          min="${inputConfig.primaryMin}"
          step="${inputConfig.primaryStep}"
          placeholder="${inputConfig.primaryPlaceholder}"
          value="${lastSet?.[inputConfig.primaryValueKey] ?? ""}"
        />
        <input
          class="${inputConfig.secondaryClass} secondary-input"
          type="${inputConfig.secondaryType}"
          min="${inputConfig.secondaryMin}"
          step="${inputConfig.secondaryStep}"
          placeholder="${inputConfig.secondaryPlaceholder}"
          value="${lastSet?.[inputConfig.secondaryValueKey] ?? ""}"
        />
      </div>
      <button class="add-set-btn" data-action="add-set" data-ex-id="${exercise.id}">
        <i data-lucide="plus"></i>
        <span>${trackingMode === "cardio" ? "Add Entry" : "Add Set"}</span>
      </button>
      <div class="exercise-buttons">
        <button class="repeat-btn" data-action="repeat-set" data-ex-id="${exercise.id}">Repeat</button>
        <button class="btn-danger" data-action="delete-exercise" data-ex-id="${exercise.id}">
          <i data-lucide="trash"></i>
          Delete
        </button>
        <button class="btn-secondary collapse-btn" data-action="toggle-exercise" data-ex-id="${exercise.id}">
          <i data-lucide="chevron-down"></i>
          Collapse
        </button>
      </div>
      <div class="sets">${setsHtml}</div>
    </div>
  `;
}

function renderWorkoutSection() {
  const container = document.getElementById("workout-section");
  if (!container) {
    return;
  }

  const todayWorkout = getTodayWorkout();

  if (!state.currentWorkout) {
    const hasTemplates = state.templates.length > 0;
    container.innerHTML = `
      <div class="card hero-card">
        <div class="hero-copy">
          <div class="eyebrow">Strength Dashboard</div>
          <h1>Workout Tracker</h1>
          <div class="text-dim">Log sets fast, keep today's session moving, and spot PR momentum at a glance.</div>
          <div class="hero-meta">
            <span class="hero-chip">${state.workouts.length} sessions saved</span>
            <span class="hero-chip">${getActiveDaysThisWeek()} active days this week</span>
            ${todayWorkout ? '<span class="hero-chip">Today already started</span>' : ""}
          </div>
        </div>
        <div class="hero-buttons">
          ${hasTemplates ? `
            <button class="btn-secondary hero-button-secondary" data-action="open-template-selector">
              <i data-lucide="layout-template"></i>
              <span>Use Template</span>
            </button>
          ` : ""}
          <button class="btn-primary hero-button" data-action="start-workout">${todayWorkout ? "Resume Today" : "Start Workout"}</button>
        </div>
      </div>
    `;
    return;
  }

  const exerciseCount = state.currentWorkout.exercises.length;
  const totalSets = state.currentWorkout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const summary = analytics.getWorkoutSummary(state.currentWorkout);
  const exercises = [...state.currentWorkout.exercises];
  const expandedIndex = exercises.findIndex(exercise => exercise.id === state.expandedExerciseId);
  const startedAt = formatDate(state.currentWorkout.date);

  if (expandedIndex > 0) {
    const [expandedExercise] = exercises.splice(expandedIndex, 1);
    exercises.unshift(expandedExercise);
  }

  container.innerHTML = `
    <div class="workout-shell">
      <div class="workout-hero-row">
        <div class="workout-title-block">
          <div class="eyebrow">Today's Session</div>
          <h2>Current Workout</h2>
          <p class="section-copy">Started ${startedAt}. Add movements quickly, then finish when the session feels complete.</p>
        </div>
        <div class="workout-status-pill">${exerciseCount} exercises / ${totalSets} sets</div>
      </div>
      <div class="workout-overview-grid">
        <div class="add-exercise-section">
          <div class="card composer-card">
            <label class="input-label" for="exercise-input">Add an exercise or cardio</label>
            <input id="exercise-input" placeholder="Type exercise, running, walking..." autocomplete="off" />
            <div id="suggestions"></div>
            ${renderQuickAddSection()}
          </div>
        </div>
      </div>
      <div class="exercise-stack">
        ${exercises.map(renderExerciseCard).join("")}
      </div>
      <div class="workout-footer-actions">
        <div class="workout-footer-meta">
          <span>${summary.totalSets} sets</span>
          ${summary.totalVolume > 0 ? `<span>${summary.totalVolume} kg</span>` : ""}
          ${summary.totalCardioMinutes > 0 ? `<span>${summary.totalCardioMinutes} min cardio</span>` : ""}
        </div>
        <button class="finish-workout" data-action="finish-workout">Finish Workout</button>
      </div>
    </div>
  `;
}

function renderWorkoutDetails(workout) {
  return workout.exercises.map(exercise => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const hasPR = analytics.exerciseHasPR(exercise);
    const trackingMode = getExerciseTrackingMode(exercise);

    if (!lastSet) {
      return `
        <div class="history-row">
          ${exercise.name} <span class="text-dim">No sets logged</span>
        </div>
      `;
    }

      return `
        <div class="history-row">
          ${exercise.name} - ${formatSetMetric(lastSet, trackingMode)} x ${exercise.sets.length} ${trackingMode === "cardio" ? "entries" : "sets"}
          ${hasPR ? '<span class="pr-badge">PR</span>' : ""}
        </div>
      `;
  }).join("");
}

function renderHistorySection() {
  const container = document.getElementById("history-section");
  if (!container) {
    return;
  }

  if (!state.workouts.length) {
    container.innerHTML = `
      <div class="card empty-state">
        <div class="empty-title">No workouts yet</div>
        <div>Start your first session and your history will show up here.</div>
      </div>
    `;
    return;
  }

  const workouts = [...state.workouts].sort((a, b) => b.date - a.date);

  container.innerHTML = `
    <div class="section-bar">
      <div>
        <div class="eyebrow">Archive</div>
        <h2>History</h2>
      </div>
      <button class="clear-all-btn" data-action="clear-history">Clear All</button>
    </div>
    ${workouts.map(workout => {
      const summary = analytics.getWorkoutSummary(workout);
      const prCount = analytics.countPRs(workout);

      return `
        <div class="card history-card" data-workout-id="${workout.id}">
          <div class="history-header">
            <div class="history-main">
              <strong>${formatDate(workout.date)}</strong>
              <span class="history-metrics">
                ${summary.totalSets} sets
                ${summary.totalVolume > 0 ? ` / ${summary.totalVolume} kg` : ""}
                ${summary.totalCardioMinutes > 0 ? ` / ${summary.totalCardioMinutes} min cardio` : ""}
              </span>
            </div>
            ${prCount > 0 ? `<span class="pr-summary">${prCount} PR</span>` : '<span class="history-metrics">No PR</span>'}
            <div class="actions">
              <button class="icon-btn" aria-label="Toggle workout details" data-action="toggle-history" data-workout-id="${workout.id}">
                <i data-lucide="chevron-down"></i>
              </button>
              <button class="icon-btn delete-btn" aria-label="Delete workout" data-action="delete-workout" data-workout-id="${workout.id}">
                <i data-lucide="trash"></i>
              </button>
            </div>
          </div>
          <div class="history-details" hidden>${renderWorkoutDetails(workout)}</div>
        </div>
      `;
    }).join("")}
  `;
}

function renderApp() {
  renderAppNav();
  renderViews();
  renderDashboardOverview();
  renderKPI();
  renderAnalytics();
  renderWorkoutSection();
  renderHistorySection();
  renderTemplatesSection();
  renderTemplateBuilder();
  renderTemplateSelector();
  lucide.createIcons();
}

function toggleHistoryCard(workoutId) {
  const card = document.querySelector(`[data-workout-id="${workoutId}"]`);
  const detail = card?.querySelector(".history-details");

  if (!detail) {
    return;
  }

  detail.hidden = !detail.hidden;
}

// Template Rendering Functions
function renderTemplatesSection() {
  const container = document.getElementById("templates-section");
  if (!container) {
    console.error("[Templates] templates-section container not found");
    return;
  }

  if (state.currentView !== "templates") {
    return;
  }

  const sortedTemplates = templates.sortTemplates(state.templates, "created");
  console.log("[Templates] Rendering", sortedTemplates.length, "templates");

  if (!sortedTemplates.length) {
    container.innerHTML = `
      <div class="card hero-card">
        <div class="hero-copy">
          <div class="eyebrow">Templates</div>
          <h1>Workout Templates</h1>
          <div class="text-dim">Create reusable workout templates to save time and stay consistent with your training.</div>
        </div>
        <button class="btn-primary hero-button" data-action="open-template-builder">Create First Template</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="section-bar">
      <div>
        <div class="eyebrow">Templates</div>
        <h2>Your Templates</h2>
      </div>
      <button class="btn-primary" data-action="open-template-builder">Create New</button>
    </div>
    <div class="templates-grid">
      ${sortedTemplates.map(template => {
        const stats = templates.getTemplateUsageStats(template.id);
        return `
          <div class="card template-card" data-template-id="${template.id}">
            <div class="template-header">
              <strong class="template-name">${template.name}</strong>
              <span class="template-badge">${template.exercises.length} exercises</span>
            </div>
            ${template.description ? `<p class="template-description">${template.description}</p>` : ""}
            <div class="template-meta">
              <span>Used ${stats.useCount}x</span>
              ${stats.lastUsed ? `<span>Last used ${stats.daysSinceLastUsed} days ago</span>` : "<span>Never used</span>"}
            </div>
            <div class="template-actions">
              <button class="btn-secondary" data-action="use-template" data-template-id="${template.id}">Use</button>
              <button class="btn-secondary" data-action="edit-template" data-template-id="${template.id}">Edit</button>
              <button class="btn-danger" data-action="delete-template" data-template-id="${template.id}">Delete</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderTemplateBuilder() {
  const container = document.getElementById("template-builder");
  if (!container) {
    return;
  }

  if (!state.templateBuilder.isOpen) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  const { name, description, exercises, editingTemplateId } = state.templateBuilder;
  const isEditing = editingTemplateId !== null;

  container.innerHTML = `
    <div class="modal">
      <div class="modal-content template-builder-modal">
        <div class="modal-header">
          <h2>${isEditing ? "Edit Template" : "Create Template"}</h2>
          <button class="icon-btn" data-action="close-template-builder" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="template-builder-form">
          <div class="form-group">
            <label class="input-label" for="template-name">Template Name *</label>
            <input
              id="template-name"
              type="text"
              class="form-input"
              placeholder="e.g., Push Day, Leg Day"
              value="${name}"
            />
          </div>
          <div class="form-group">
            <label class="input-label" for="template-description">Description</label>
            <input
              id="template-description"
              type="text"
              class="form-input"
              placeholder="e.g., Chest, Shoulders, Triceps"
              value="${description}"
            />
          </div>
          <div class="form-group">
            <label class="input-label">Exercises</label>
            <div class="template-exercise-list">
              ${exercises.length === 0 ? `
                <div class="template-empty">No exercises added yet</div>
              ` : exercises.map((exercise, index) => `
                <div class="template-exercise-item">
                  <div class="exercise-drag-handle">
                    <i data-lucide="grip-vertical"></i>
                  </div>
                  <span class="template-exercise-name">${exercise.name}</span>
                  <span class="template-exercise-mode">${exercise.trackingMode}</span>
                  <button class="icon-btn remove-btn" data-action="remove-template-exercise" data-index="${index}" aria-label="Remove">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="form-group">
            <label class="input-label" for="template-exercise-input">Add Exercise</label>
            <input
              id="template-exercise-input"
              type="text"
              class="form-input"
              placeholder="Type exercise name..."
              autocomplete="off"
            />
            <div id="template-suggestions"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" data-action="close-template-builder">Cancel</button>
          <button class="btn-primary" data-action="save-template">${isEditing ? "Update Template" : "Create Template"}</button>
        </div>
      </div>
    </div>
  `;
}

function renderTemplateSelector() {
  const container = document.getElementById("template-selector");
  if (!container) {
    return;
  }

  if (!state.templateSelectorOpen) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  const sortedTemplates = templates.sortTemplates(state.templates, "used");

  container.innerHTML = `
    <div class="modal">
      <div class="modal-content template-selector-modal">
        <div class="modal-header">
          <h2>Select a Template</h2>
          <button class="icon-btn" data-action="close-template-selector" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="template-selector-list">
          <button class="template-option" data-action="start-empty-workout">
            <div class="template-option-icon">
              <i data-lucide="plus"></i>
            </div>
            <div class="template-option-content">
              <strong>Quick Start</strong>
              <small>Start with an empty workout</small>
            </div>
          </button>
          ${sortedTemplates.length === 0 ? `
            <div class="template-empty">No templates yet. Create one first!</div>
          ` : sortedTemplates.map(template => `
            <button class="template-option" data-action="select-template" data-template-id="${template.id}">
              <div class="template-option-icon">
                <i data-lucide="layout-template"></i>
              </div>
              <div class="template-option-content">
                <strong>${template.name}</strong>
                <small>${template.exercises.length} exercises</small>
              </div>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function handleAutocomplete(event) {
  const container = document.getElementById("suggestions");
  if (!container) {
    return;
  }

  const suggestions = getSuggestions(event.target.value);

  if (!suggestions.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = suggestions.map(name => `
    <div class="suggestion-item" data-action="select-suggestion" data-name="${name}">
      ${name}
    </div>
  `).join("");
}

function bindEvents() {
  document.addEventListener("click", event => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    const { action, exId, workoutId, name } = actionElement.dataset;

    if (action === "start-workout") {
      startWorkout();
      return;
    }

    if (action === "switch-view") {
      setCurrentView(actionElement.dataset.view);
      renderApp();
      return;
    }

    if (action === "add-set") {
      handleAddSet(exId);
      return;
    }

    if (action === "repeat-set") {
      handleRepeatSet(exId);
      return;
    }

    if (action === "delete-exercise") {
      handleDeleteExercise(exId);
      return;
    }

    if (action === "toggle-exercise") {
      toggleExercise(exId);
      return;
    }

    if (action === "finish-workout") {
      handleFinishWorkout();
      return;
    }

    if (action === "delete-workout") {
      const shouldDelete = confirm("Delete this workout?");
      if (shouldDelete) {
        handleDeleteWorkout(workoutId);
      }
      return;
    }

    if (action === "toggle-history") {
      toggleHistoryCard(workoutId);
      return;
    }

    if (action === "clear-history") {
      handleClearAllHistory();
      return;
    }

    if (action === "select-suggestion") {
      handleAddExercise(name);
      const container = document.getElementById("suggestions");
      if (container) {
        container.innerHTML = "";
      }
      return;
    }

    if (action === "quick-add-exercise") {
      handleAddExercise(name);
      state.quickCardioOpen = false;
      return;
    }

    if (action === "toggle-quick-cardio") {
      state.quickCardioOpen = !state.quickCardioOpen;
      renderApp();
    }

    if (action === "add-template-exercise") {
      const input = document.getElementById("template-exercise-input");
      if (input) {
        input.value = "";
      }
      const container = document.getElementById("template-suggestions");
      if (container) {
        container.innerHTML = "";
      }
      addExerciseToTemplateBuilder(actionElement.dataset.name);
      if (input) {
        input.focus();
      }
      return;
    }

    // Template Actions
    if (action === "open-template-builder") {
      console.log("[Template] Opening template builder");
      openTemplateBuilder();
      return;
    }

    if (action === "close-template-builder") {
      console.log("[Template] Closing template builder");
      closeTemplateBuilder();
      return;
    }

    if (action === "save-template") {
      console.log("[Template] Saving template");
      const name = document.getElementById("template-name")?.value?.trim();
      const description = document.getElementById("template-description")?.value?.trim();
      state.templateBuilder.name = name || "";
      state.templateBuilder.description = description || "";
      saveTemplateFromBuilder();
      return;
    }

    if (action === "remove-template-exercise") {
      const index = parseInt(actionElement.dataset.index, 10);
      console.log("[Template] Removing exercise at index:", index);
      removeExerciseFromTemplateBuilder(index);
      return;
    }

    if (action === "use-template") {
      const templateId = actionElement.dataset.templateId;
      console.log("[Template] Using template:", templateId);
      useTemplateHandler(templateId);
      return;
    }

    if (action === "edit-template") {
      const templateId = actionElement.dataset.templateId;
      console.log("[Template] Editing template:", templateId);
      openTemplateBuilder(templateId);
      return;
    }

    if (action === "delete-template") {
      const templateId = actionElement.dataset.templateId;
      console.log("[Template] Deleting template:", templateId);
      deleteTemplateHandler(templateId);
      return;
    }

    if (action === "open-template-selector") {
      console.log("[Template] Opening template selector");
      openTemplateSelector();
      return;
    }

    if (action === "close-template-selector") {
      console.log("[Template] Closing template selector");
      closeTemplateSelector();
      return;
    }

    if (action === "select-template") {
      const templateId = actionElement.dataset.templateId;
      console.log("[Template] Selected template:", templateId);
      useTemplateHandler(templateId);
      return;
    }

    if (action === "start-empty-workout") {
      console.log("[Template] Starting empty workout");
      closeTemplateSelector();
      startWorkout();
      return;
    }
  });

  // Template exercise input autocomplete
  document.addEventListener("input", event => {
    if (event.target.id === "exercise-input") {
      handleAutocomplete(event);
    }

    if (event.target.id === "template-exercise-input") {
      handleTemplateAutocomplete(event);
    }
  });

  // Template exercise input Enter key
  document.addEventListener("keydown", event => {
    if (event.target.id !== "exercise-input" || event.key !== "Enter") {
      return;
    }

    const name = event.target.value.trim();
    if (!name) {
      return;
    }

    handleAddExercise(name);
  });

  // Template exercise input Enter key
  document.addEventListener("keydown", event => {
    if (event.target.id !== "template-exercise-input" || event.key !== "Enter") {
      return;
    }

    const name = event.target.value.trim();
    if (!name) {
      return;
    }

    event.target.value = "";
    const container = document.getElementById("template-suggestions");
    if (container) {
      container.innerHTML = "";
    }
    addExerciseToTemplateBuilder(name);
    const input = document.getElementById("template-exercise-input");
    if (input) {
      input.focus();
    }
  });

  // Template name and description input sync
  document.addEventListener("input", event => {
    if (event.target.id === "template-name") {
      state.templateBuilder.name = event.target.value;
    }

    if (event.target.id === "template-description") {
      state.templateBuilder.description = event.target.value;
    }
  });
}

function handleTemplateAutocomplete(event) {
  const container = document.getElementById("template-suggestions");
  if (!container) {
    return;
  }

  const suggestions = getSuggestions(event.target.value);

  if (!suggestions.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = suggestions.map(name => `
    <div class="suggestion-item" data-action="add-template-exercise" data-name="${name}">
      ${name}
    </div>
  `).join("");
}

function initApp() {
  loadFromStorage();
  bindEvents();
  renderApp();
}

function checkTemplatesModule() {
  if (typeof window.templates === 'undefined') {
    console.error("[App] Templates module not loaded!");
    return false;
  }
  console.log("[App] Templates module loaded successfully");
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  if (checkTemplatesModule()) {
    initApp();
  } else {
    console.error("[App] Cannot initialize app - templates module missing");
  }
});

// Add event binding for drag handle
function setupDragAndDrop() {
  const dragHandles = document.querySelectorAll(".drag-handle");

  dragHandles.forEach(handle => {
    handle.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", event.target.dataset.exerciseId);
    });

    handle.addEventListener("drop", event => {
      event.preventDefault();
      const draggedId = event.dataTransfer.getData("text/plain");
      const targetId = event.target.dataset.exerciseId;

      reorderTemplateExercises(draggedId, targetId);
    });

    handle.addEventListener("dragover", event => {
      event.preventDefault();
    });
  });
}

// Call setupDragAndDrop when initializing the builder
setupDragAndDrop();
