// Analytics Engine - Pure functions for workout analytics
// All functions are pure - they accept inputs and return outputs only
// No DOM access, no localStorage, no global state modification

/**
 * Get exercise history from all workouts
 * @param {Array} workouts - Array of workout objects
 * @param {string} exerciseName - Name of the exercise to get history for
 * @returns {Array} Array of sets for the exercise across all workouts
 */
function getExerciseHistory(workouts, exerciseName) {
  const history = [];
  
  for (const workout of workouts) {
    const exercise = workout.exercises.find(e => e.name === exerciseName);
    if (exercise && exercise.sets) {
      history.push(...exercise.sets.map(set => ({
        ...set,
        weight: Number.isFinite(set.weight) ? set.weight : 0
      })));
    }
  }
  
  return history;
}

/**
 * Check if a set is a Personal Record (PR)
 * @param {Array} workouts - Array of workout objects
 * @param {string} exerciseName - Name of the exercise
 * @param {number} weight - Weight of the set
 * @param {number} reps - Number of reps in the set
 * @returns {Object} Object with isWeightPR, isRepPR, and isVolumePR flags
 */
function checkPR(workouts, exerciseName, weight, reps) {
  const history = getExerciseHistory(workouts, exerciseName);
  const normalizedWeight = Number.isFinite(weight) ? weight : 0;

  const maxWeight = Math.max(...history.map(s => s.weight), 0);
  const maxReps = Math.max(...history.map(s => s.reps), 0);
  const maxVolume = Math.max(...history.map(s => s.weight * s.reps), 0);

  const volume = normalizedWeight * reps;

  return {
    isWeightPR: normalizedWeight > maxWeight,
    isRepPR: reps > maxReps,
    isVolumePR: volume > maxVolume
  };
}

/**
 * Get workout summary with total sets and volume
 * @param {Object} workout - Workout object
 * @returns {Object} Object with totalSets and totalVolume
 */
function getWorkoutSummary(workout) {
  let totalSets = 0;
  let totalVolume = 0;
  let totalCardioMinutes = 0;
  let totalDistanceKm = 0;

  workout.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      totalSets++;

      if (ex.trackingMode === "cardio") {
        totalCardioMinutes += Number.isFinite(set.duration) ? set.duration : 0;
        totalDistanceKm += Number.isFinite(set.distance) ? set.distance : 0;
      } else {
        totalVolume += (Number.isFinite(set.weight) ? set.weight : 0) * set.reps;
      }
    });
  });

  return {
    totalSets,
    totalVolume,
    totalCardioMinutes,
    totalDistanceKm
  };
}

function getStartOfWeek(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);

  return date;
}

function formatWeekKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function aggregateWorkoutsByWeek(workouts, options = {}) {
  const weeks = new Map();
  const limit = Number.isFinite(options.limit) ? options.limit : 8;

  workouts.forEach(workout => {
    const weekStart = getStartOfWeek(workout.date);
    const key = formatWeekKey(weekStart);
    const summary = getWorkoutSummary(workout);

    if (!weeks.has(key)) {
      weeks.set(key, {
        key,
        weekStart: weekStart.getTime(),
        totalWorkouts: 0,
        totalExercises: 0,
        totalSets: 0,
        totalVolume: 0,
        totalCardioMinutes: 0,
        totalDistanceKm: 0,
        activeDays: new Set()
      });
    }

    const entry = weeks.get(key);
    entry.totalWorkouts += 1;
    entry.totalExercises += workout.exercises.length;
    entry.totalSets += summary.totalSets;
    entry.totalVolume += summary.totalVolume;
    entry.totalCardioMinutes += summary.totalCardioMinutes;
    entry.totalDistanceKm += summary.totalDistanceKm;
    entry.activeDays.add(new Date(workout.date).toDateString());
  });

  return [...weeks.values()]
    .sort((a, b) => a.weekStart - b.weekStart)
    .slice(-limit)
    .map(entry => ({
      ...entry,
      activeDays: entry.activeDays.size
    }));
}

function getWeekOverWeekChange(weeklyData, metric) {
  if (!weeklyData.length) {
    return { current: 0, previous: 0, delta: 0, direction: "flat" };
  }

  const current = weeklyData[weeklyData.length - 1]?.[metric] || 0;
  const previous = weeklyData[weeklyData.length - 2]?.[metric] || 0;
  const delta = current - previous;

  return {
    current,
    previous,
    delta,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat"
  };
}

/**
 * Count the number of PRs in a workout
 * @param {Object} workout - Workout object
 * @returns {number} Number of PRs in the workout
 */
function countPRs(workout) {
  let prCount = 0;
  workout.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.isPR && (set.isPR.isWeightPR || set.isPR.isRepPR || set.isPR.isVolumePR)) {
        prCount++;
      }
    });
  });
  return prCount;
}

/**
 * Check if an exercise has any PRs
 * @param {Object} exercise - Exercise object
 * @returns {boolean} True if exercise has at least one PR
 */
function exerciseHasPR(exercise) {
  return exercise.sets.some(set =>
    set.isPR && (set.isPR.isWeightPR || set.isPR.isRepPR || set.isPR.isVolumePR)
  );
}

// Export for use in app.js
window.analytics = {
  getExerciseHistory,
  checkPR,
  getWorkoutSummary,
  aggregateWorkoutsByWeek,
  getWeekOverWeekChange,
  countPRs,
  exerciseHasPR
};
