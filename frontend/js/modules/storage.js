const LOCAL_HISTORY_KEY = "career-counselor-local-history";

export function getCurrentUserId() {
  const user = localStorage.getItem("career-counselor-user");
  return user ? JSON.parse(user).user_id : null;
}

export function readLocalHistory() {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (!raw) return { assessments: [], progress: [] };
    const parsed = JSON.parse(raw);
    return {
      assessments: Array.isArray(parsed.assessments) ? parsed.assessments : [],
      progress: Array.isArray(parsed.progress) ? parsed.progress : [],
    };
  } catch (err) {
    return { assessments: [], progress: [] };
  }
}

export function writeLocalHistory(history) {
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
}

export function upsertLocalAssessment(entry) {
  const history = readLocalHistory();
  const nextEntry = {
    created_at: new Date().toISOString(),
    interests: [],
    skills: [],
    top_careers: [],
    career_fits: [],
    roadmap: null,
    skill_gap_analysis: null,
    ...entry,
  };
  const idx = history.assessments.findIndex((item) => item.session_id === nextEntry.session_id);
  if (idx >= 0) {
    history.assessments[idx] = { ...history.assessments[idx], ...nextEntry };
  } else {
    history.assessments.unshift(nextEntry);
  }
  writeLocalHistory(history);
}

export function updateLocalAssessmentSession(sessionId, updater) {
  if (!sessionId) return;
  const history = readLocalHistory();
  const idx = history.assessments.findIndex((item) => item.session_id === sessionId);
  if (idx < 0) return;
  history.assessments[idx] = updater(history.assessments[idx]);
  writeLocalHistory(history);
}

export function updateLocalProgress(sessionId, progressData) {
  if (!sessionId) return;
  const history = readLocalHistory();
  const progressItem = {
    session_id: sessionId,
    ...progressData,
  };
  const idx = history.progress.findIndex(
    (item) => item.session_id === sessionId && item.step_id === progressItem.step_id,
  );
  if (idx >= 0) {
    history.progress[idx] = { ...history.progress[idx], ...progressItem };
  } else {
    history.progress.push(progressItem);
  }
  writeLocalHistory(history);
}
