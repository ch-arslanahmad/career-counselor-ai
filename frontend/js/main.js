// main.js - Handles form submission and dynamic content generation

// Dummy Data for Testing

// class for holding option lists from the API
class CareerFormOptions {
  constructor({
    interests = [],
    skills = [],
    industries = [],
    locations = [],
  } = {}) {
    this.interests = interests;
    this.skills = skills;
    this.industries = industries;
    this.locations = locations;
  }
}

// ---

// Login System
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userDisplay = document.getElementById("user-display");
const loginModal = document.getElementById("login-modal");
const loginForm = document.getElementById("login-form");
const loginTitle = document.getElementById("login-title");
const loginSwitchBtn = document.getElementById("login-switch-btn");
const loginSwitchText = document.getElementById("login-switch-text");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");

// Hamburger Menu
const hamburgerBtn = document.getElementById("hamburger-btn");
const navContent = document.getElementById("nav-content");
if (hamburgerBtn && navContent) {
  hamburgerBtn.addEventListener("click", () => {
    navContent.classList.toggle("active");
    hamburgerBtn.classList.toggle("active");
  });
}

let isRegisterMode = false;

// Header Auth Buttons
const headerLoginBtn = document.getElementById("header-login-btn");
const headerLogoutBtn = document.getElementById("header-logout-btn");
const headerUserDisplay = document.getElementById("header-user-display");

function updateAuthUI() {
  const user = localStorage.getItem("career-counselor-user");
  const historyTab = document.getElementById("tab-history");
  if (user) {
    const userObj = JSON.parse(user);
    if (userDisplay) {
      userDisplay.textContent = `Hi, ${userObj.username}`;
      userDisplay.classList.remove("hidden");
    }
    if (headerUserDisplay) {
      headerUserDisplay.textContent = `Hi, ${userObj.username}`;
      headerUserDisplay.classList.remove("hidden");
    }
    if (loginBtn) loginBtn.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    if (headerLoginBtn) headerLoginBtn.classList.add("hidden");
    if (headerLogoutBtn) headerLogoutBtn.classList.remove("hidden");
    if (historyTab) historyTab.classList.remove("hidden");
  } else {
    if (userDisplay) userDisplay.classList.add("hidden");
    if (headerUserDisplay) headerUserDisplay.classList.add("hidden");
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (headerLoginBtn) headerLoginBtn.classList.remove("hidden");
    if (headerLogoutBtn) headerLogoutBtn.classList.add("hidden");
    if (historyTab) historyTab.classList.add("hidden");
    const activeTab = document.querySelector(".tab.active");
    if (activeTab && activeTab.id === "tab-history") {
      document.getElementById("tab-career").classList.add("active");
      document.getElementById("career").classList.add("active");
      document.getElementById("history").classList.remove("active");
    }
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    isRegisterMode = false;
    loginTitle.textContent = "Login";
    const submitBtn = loginForm.querySelector(".login-submit");
    if (submitBtn) submitBtn.textContent = "Login";
    loginSwitchText.textContent = "Don't have an account?";
    loginSwitchBtn.textContent = "Register";
    loginModal.hidden = false;
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("career-counselor-user");
    updateAuthUI();
  });
}

if (loginSwitchBtn) {
  loginSwitchBtn.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;
    const submitBtn = loginForm.querySelector(".login-submit");
    if (isRegisterMode) {
      loginTitle.textContent = "Register";
      submitBtn.textContent = "Register";
      loginSwitchText.textContent = "Already have an account?";
      loginSwitchBtn.textContent = "Login";
    } else {
      loginTitle.textContent = "Login";
      submitBtn.textContent = "Login";
      loginSwitchText.textContent = "Don't have an account?";
      loginSwitchBtn.textContent = "Register";
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    try {
      const res = await fetch(`http://localhost:8001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.value,
          password: loginPassword.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Authentication failed");
        return;
      }
      localStorage.setItem("career-counselor-user", JSON.stringify({
        user_id: data.user_id,
        username: data.username,
      }));
      loginModal.hidden = true;
      loginForm.reset();
      updateAuthUI();
    } catch (err) {
      alert("Connection error. Make sure backend is running.");
    }
  });
}

const demoLoginBtn = document.getElementById("demo-login-btn");
if (demoLoginBtn) {
  demoLoginBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:8001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "demo", password: "demo123" }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("career-counselor-user", JSON.stringify({
          user_id: data.user_id,
          username: data.username,
        }));
        loginModal.hidden = true;
        updateAuthUI();
      } else {
        alert("Demo user not found. Register first or use different credentials.");
      }
    } catch (err) {
      alert("Connection error. Make sure backend is running.");
    }
  });
}

// Close modal on backdrop click
if (loginModal) {
  loginModal.querySelector(".modal-backdrop").addEventListener("click", () => {
    loginModal.hidden = true;
  });
  loginModal.querySelector(".modal-close").addEventListener("click", () => {
    loginModal.hidden = true;
  });
}

// History tab functionality
const historyLoginBtn = document.getElementById("history-login-btn");
const historyLoginRequired = document.getElementById("history-login-required");
const historyAssessments = document.getElementById("history-assessments");
const historyProgress = document.getElementById("history-progress");
const assessmentList = document.getElementById("assessment-list");
const progressList = document.getElementById("progress-list");
const historySourceNote = document.getElementById("history-source-note");

if (historyLoginBtn) {
  historyLoginBtn.addEventListener("click", () => {
    loginModal.hidden = false;
  });
}

async function loadHistory() {
  const userId = getCurrentUserId();
  let data = readLocalHistory();

  try {
    if (userId) {
      const res = await fetch(`http://localhost:8001/api/history?user_id=${userId}`);
      if (res.ok) {
        data = await res.json();
        writeLocalHistory(data);
      }
    }
  } catch (err) {
    console.error("Failed to load history:", err);
  }

  const sessionId = currentSessionId || localStorage.getItem("career-counselor-session-id");
  if (sessionId) {
    try {
      const progressRes = await fetch(`http://localhost:8001/api/tasks/${sessionId}`);
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        data.progress = progressData.steps || data.progress || [];
        if (!userId) {
          writeLocalHistory(data);
        }
      }
    } catch (err) {
      console.error("Failed to load session progress:", err);
    }
  }

  if (historyLoginRequired) historyLoginRequired.classList.add("hidden");
  if (historySourceNote) {
    historySourceNote.textContent = userId
      ? "Signed-in history is synced with the database."
      : "This device-only history is stored in your browser until you sign in.";
  }

  if (historyAssessments) {
    if (data.assessments && data.assessments.length > 0) {
      historyAssessments.classList.remove("hidden");
      if (assessmentList) {
        assessmentList.innerHTML = data.assessments.map(a => `
          <div class="history-card">
            <h4>${a.name || "Assessment"} - ${a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}</h4>
            <p>Top careers: ${(a.top_careers || []).join(", ")}</p>
            <p class="history-skills">Skills: ${(a.skills || []).join(", ")}</p>
          </div>
        `).join("");
      }
    } else {
      historyAssessments.classList.add("hidden");
    }
  }

  if (historyProgress) {
    if (data.progress && data.progress.length > 0) {
      historyProgress.classList.remove("hidden");
      if (progressList) {
        progressList.innerHTML = data.progress.map(p => `
          <div class="history-card">
            <h4>${p.career_topic || "Learning Progress"}</h4>
            <p>Completed step: ${p.step_title || "Step"}</p>
            <p class="history-date">${p.completed_at ? new Date(p.completed_at).toLocaleDateString() : ""}</p>
          </div>
        `).join("");
      }
    } else {
      historyProgress.classList.add("hidden");
    }
  }
}

// Listen for tab changes to load history
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    if (tab.getAttribute("href") === "#history") {
      loadHistory();
    }
  });
});

updateAuthUI();

function getCurrentUserId() {
  const user = localStorage.getItem("career-counselor-user");
  return user ? JSON.parse(user).user_id : null;
}

const LOCAL_HISTORY_KEY = "career-counselor-local-history";

function readLocalHistory() {
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

function writeLocalHistory(history) {
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
}

function upsertLocalAssessment(entry) {
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

function updateLocalAssessmentSession(sessionId, updater) {
  if (!sessionId) return;
  const history = readLocalHistory();
  const idx = history.assessments.findIndex((item) => item.session_id === sessionId);
  if (idx < 0) return;
  history.assessments[idx] = updater(history.assessments[idx]);
  writeLocalHistory(history);
}

function updateLocalProgress(sessionId, progressData) {
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

// ---

// Loading text animation
const careerLoadingTexts = [
  "Analyzing your profile...",
  "Reading your skills...",
  "Matching your interests...",
  "Finding best careers...",
  "Almost done...",
];
const roadmapLoadingTexts = [
  "Generating your roadmap...",
  "Building learning path...",
  "Calculating timeline...",
  "Finding best resources...",
  "Almost done...",
];

let careerSpinnerInterval = null;
let roadmapSpinnerInterval = null;

function startLoadingText(elementId, texts) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let i = 0;
  el.textContent = texts[0];
  return setInterval(() => {
    i = (i + 1) % texts.length;
    el.textContent = texts[i];
  }, 1500);
}

function stopLoadingText(interval) {
  if (interval) clearInterval(interval);
  return null;
}

// ---

// an async IIFE method
// ? an async IIFE (Immediately Invoked Function Expression) is an async method that runs immediately after it is defined.
// This allows us to use await inside the function without having to define a separate async function and then call it, as await requires an async function.

// --- Utility Functions ---

const API_BASE_URL = "http://localhost:8001";

function buildApiUrl(endpoint) {
  return `${API_BASE_URL}/${endpoint.replace(/^\/+/, "")}`;
}

async function getEndpointData(endpoint) {
  const res = await fetch(buildApiUrl(endpoint));
  return await res.json();
}

const getDataFromEndpoint = async (endpoint) => {
  const data = await getEndpointData(endpoint);
  return data;
};

async function postEndpointData(endpoint, payload) {
  const res = await fetch(buildApiUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return await res.json();
}

// create new chips based on the array of options
function loadChips(array, container) {
  if (!container) return;
  array.forEach((item) => {
    const chip = document.createElement("button");
    chip.type = "button"; // prevent implicit form submit when inside a form
    chip.className = "chip";
    chip.value = item.toLowerCase();
    chip.innerText = item;
    container.appendChild(chip);
  });
}

// load options for select dropdowns
function loadOptions(items, select) {
  if (!select) return;
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.toLowerCase();
    opt.textContent = item;
    select.appendChild(opt);
  });
}

// this is used only for the main form, where fields are to be populated
async function populateForm() {
  // creating a new CareerFormOptions object with data from the endpoints
  const [interestsData, skillsData, industriesData, locationsData] =
    await Promise.all([
      getDataFromEndpoint("options/interests"),
      getDataFromEndpoint("options/skills"),
      getDataFromEndpoint("options/industries"),
      getDataFromEndpoint("options/locations"),
    ]);

  const formData = new CareerFormOptions({
    interests: interestsData.interests,
    skills: skillsData.skills,
    industries: industriesData.industries,
    locations: locationsData.locations,
  });

  // -- FETCH main form chips containers
  const interestsContainer = document.querySelector("#interests-chips");
  const skillsContainer = document.querySelector("#skills-chips");
  const industriesContainer = document.querySelector("#industries-chips");

  // a dropdown container for locatiosn
  const locationsContainer = document.querySelector("#location");

  loadChips(formData.interests, interestsContainer);
  loadChips(formData.skills, skillsContainer);
  loadChips(formData.industries, industriesContainer);
  loadOptions(formData.locations, locationsContainer);
}

populateForm(); // call the function to populate the form on page load

// ... make the chip buttons clickable.

function isOtherChip(chip) {
  const value = (chip.value || chip.textContent || "").trim();
  return value === "other" || value === "others";
}

// () => means an arrow function, called an anonymous function, used with event handler
document.querySelectorAll(".chips").forEach((container) => {
  container.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");

    if (!chip) return;

    chip.classList.toggle("selected");

    if (isOtherChip(chip)) {
      const wrapper = chip
        .closest(".field")
        .querySelector(".chip-input-wrapper"); // find the input wrapper within the same field
      if (wrapper) {
        const isVisible = wrapper.classList.toggle("visible");
        const input = wrapper.querySelector("input");
        if (input) {
          input.required = isVisible;
          if (!isVisible) input.value = "";
        }
      }
    }
  });
});

// first form data
class CareerRecommendationFormData {
  constructor(
    name = "",
    education_level = "",
    career_goals = "",
    country = "",
    additional_info = "",
    interests = [],
    skills = [],
    industries = [],
    locations = [],
  ) {
    this.name = name;
    this.education_level = education_level;
    this.career_goals = career_goals;
    this.country = country;
    this.additional_info = additional_info;
    this.interests = interests;
    this.skills = skills;
    this.industries = industries;
    this.locations = locations;
  }
}

class RoadmapFormData {
  constructor(
    career_topic = "",
    timeline = "",
    current_status = "",
    additional_info = "",
  ) {
    this.career_topic = career_topic;
    this.timeline = timeline;
    this.current_status = current_status;
    this.additional_info = additional_info;
  }
}

function getSelectedChipValues(container) {
  if (!container) return [];

  return Array.from(container.querySelectorAll(".chip.selected")).map(
    (chip) => {
      return chip.value;
    },
  );
}

// get the value from the custom input field if the "Other" chip is selected
function getCustomChipValue(field) {
  if (!field) return "";
  const wrapper = field.querySelector(".chip-input-wrapper");
  const input = wrapper.querySelector("input");
  if (!wrapper || !wrapper.classList.contains("visible") || !input) return "";
  return input.value.trim();
}

//
function setChipSelections(container, selectedValues = [], otherText = "") {
  if (!container) return;

  const selectedSet = new Set(selectedValues);

  const field = container.closest(".field");
  const wrapper = field.querySelector(".chip-input-wrapper");
  const input = wrapper.querySelector("input");

  container.querySelectorAll(".chip").forEach((chip) => {
    const chipValue = (chip.value || chip.textContent || "").trim();
    chip.classList.toggle("selected", selectedSet.has(chipValue));
  });

  const otherChip = Array.from(container.querySelectorAll(".chip")).find(
    (chip) => isOtherChip(chip),
  );
  const isOtherSelected = Boolean(
    otherChip && otherChip.classList.contains("selected"),
  );

  if (wrapper && input) {
    wrapper.classList.toggle("visible", isOtherSelected);
    input.required = isOtherSelected;
    input.value = isOtherSelected ? otherText : "";
  }
}

//
function buildCareerFormData(form) {
  const interests = getSelectedChipValues(
    form.querySelector("#interests-chips"),
  );
  const skills = getSelectedChipValues(form.querySelector("#skills-chips"));
  const industries = getSelectedChipValues(
    form.querySelector("#industries-chips"),
  );
  const locations = [form.querySelector("#location").value].filter(Boolean);
  const interestField = form
    .querySelector("#interests-chips")
    .closest(".field");
  const skillField = form.querySelector("#skills-chips").closest(".field");
  const industryField = form
    .querySelector("#industries-chips")
    .closest(".field");
  const customInterest = getCustomChipValue(interestField);
  const customSkill = getCustomChipValue(skillField);
  const customIndustry = getCustomChipValue(industryField);

  return new CareerRecommendationFormData(
    form.querySelector("#name").value.trim(),
    form.querySelector("#education_level").value,
    form.querySelector("#goals").value,
    form.querySelector("#location").value,
    form.querySelector("#notes").value.trim(),
    [...interests, ...(customInterest ? [customInterest] : [])],
    [...skills, ...(customSkill ? [customSkill] : [])],
    [...industries, ...(customIndustry ? [customIndustry] : [])],
    locations,
  );
}

function buildRoadmapFormData(form) {
  return new RoadmapFormData(
    form.querySelector("#career_topic").value.trim(),
    form.querySelector("#timeline").value,
    form.querySelector("#current_status").value,
    form.querySelector("#notes").value.trim(),
  );
}

const careerForm = document.getElementById("career-form");
const roadmapForm = document.getElementById("roadmap-form");
const roadmapCustomTaskInput = document.getElementById("roadmap-custom-task-input");
const roadmapAddTaskBtn = document.getElementById("roadmap-add-task-btn");
const roadmapCustomTaskList = document.getElementById("roadmap-custom-task-list");
const careerOutput = document.getElementById("career-output");
const roadmapOutput = document.getElementById("roadmap-output");
const enableTrackingCheckbox = document.getElementById("enable-tracking");
const careerRecommendationPanel = document.getElementById("career-recommendation-panel");
const skillGapsCard = document.getElementById("skill-gaps");
const skillGapsContent = document.getElementById("skill-gaps-content");
const hideRecommendationBtn = document.getElementById("hide-recommendation");
const skillsModal = document.getElementById("skills-modal");
const skillsModalTitle = document.getElementById("skills-modal-title");
const skillsModalCopy = document.getElementById("skills-modal-copy");
const skillsModalGapList = document.getElementById("skills-modal-gap-list");
const skillsModalStepList = document.getElementById("skills-modal-step-list");
const openSkillsModalBtn = document.getElementById("open-skills-modal");
const modalReanalyzeBtn = document.getElementById("modal-reanalyze");
const errorBanner = document.getElementById("error-banner");
const errorBannerText = document.getElementById("error-banner-text");
const errorBannerClose = document.getElementById("error-banner-close");
const careerSpinner = document.getElementById("career-spinner");
const careerError = document.getElementById("career-error");
const careerErrorText = document.getElementById("career-error-text");
const careerRetryBtn = document.getElementById("career-retry-btn");
const roadmapSpinner = document.getElementById("roadmap-spinner");
const roadmapError = document.getElementById("roadmap-error");
const roadmapErrorText = document.getElementById("roadmap-error-text");
const roadmapRetryBtn = document.getElementById("roadmap-retry-btn");
let latestCareerAssessment = null;
let latestCareerSubmission = null;
let latestSkillGapAnalysis = null;
let latestRoadmapSteps = [];
let latestRoadmapCareer = null;
let currentSessionId = localStorage.getItem("career-counselor-session-id") || null;

const viewProgressBtn = document.getElementById("view-progress-btn");
const progressPanel = document.getElementById("progress-panel");
const progressStats = document.getElementById("progress-stats");
const progressStepList = document.getElementById("progress-step-list");

async function fetchAndShowProgress() {
  if (!currentSessionId) {
    currentSessionId = localStorage.getItem("career-counselor-session-id");
  }
  if (!currentSessionId) {
    alert("No session found. Submit a career form first.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8001/api/tasks/${currentSessionId}`);
    const data = await res.json();

    if (progressPanel) progressPanel.classList.remove("hidden");
    if (progressStats) {
      const pct = data.completion_percentage || 0;
      progressStats.textContent = `${data.completed_count}/${data.total_steps} completed (${Math.round(pct)}%)`;
    }
    if (progressStepList) {
      progressStepList.innerHTML = "";
      if (data.steps && data.steps.length > 0) {
        data.steps.forEach(step => {
          const li = document.createElement("li");
          li.className = "progress-step-item completed";
          li.innerHTML = `<span class="step-title">${step.step_title || "Step " + step.step_id}</span>`;
          progressStepList.appendChild(li);
        });
      } else {
        progressStepList.innerHTML = "<li class='progress-step-item'>No completed steps yet.</li>";
      }
    }
  } catch (err) {
    console.error("Failed to fetch progress:", err);
  }
}

if (viewProgressBtn) {
  viewProgressBtn.addEventListener("click", fetchAndShowProgress);
}

function showErrorBanner(message) {
  if (!errorBanner || !errorBannerText) return;
  errorBannerText.textContent = message;
  errorBanner.hidden = false;
}

function hideErrorBanner() {
  if (!errorBanner) return;
  errorBanner.hidden = true;
}

if (errorBannerClose) {
  errorBannerClose.addEventListener("click", hideErrorBanner);
}

function showInlineError(container, textEl, retryBtn, message) {
  if (!container || !textEl) return;
  textEl.textContent = message;
  container.hidden = false;
}

function hideInlineError(container) {
  if (!container) return;
  container.hidden = true;
}

let pendingCareerSubmit = null;
let pendingRoadmapSubmit = null;

if (careerRetryBtn) {
  careerRetryBtn.addEventListener("click", () => {
    if (pendingCareerSubmit) pendingCareerSubmit();
  });
}

if (roadmapRetryBtn) {
  roadmapRetryBtn.addEventListener("click", () => {
    if (pendingRoadmapSubmit) pendingRoadmapSubmit();
  });
}

if (roadmapOutput) {
  roadmapOutput.classList.add("hidden");
}

const careerDummyData = {
  name: "Arslan Ahmad",
  education_level: "bachelors",
  goals: "job",
  location: "pakistan",
  notes: "I enjoy problem solving and building web apps.",
  interests: ["technology", "others"],
  skills: ["javascript", "python", "others"],
  industries: ["information technology", "others"],
  custom_interest: "AI automation",
  custom_skill: "Prompt engineering",
  custom_industry: "EdTech",
};

const roadmapDummyData = {
  career_topic: "Backend Developer",
  timeline: "1year",
  current_status: "some_knowledge",
  notes: "Focus on FastAPI, SQL, and deployment.",
};

const demoCareerOutput = {
  session_id: "demo-session",
  top_3_careers: [
    { career_name: "Backend Developer", fit_score: 92, type: "tech", reasoning: "Design and build server-side applications using Python, Node.js, or Go.", matched_skills: ["Python", "SQL", "API Design"], missing_skills: ["Docker", "Kubernetes"], salary_range: "PKR 80,000 - 200,000", growth: "High" },
    { career_name: "Full Stack Developer", fit_score: 88, type: "tech", reasoning: "Combine frontend and backend skills to build complete web applications.", matched_skills: ["JavaScript", "React"], missing_skills: ["PostgreSQL", "DevOps"], salary_range: "PKR 100,000 - 250,000", growth: "Very High" },
    { career_name: "DevOps Engineer", fit_score: 85, type: "tech", reasoning: "Automate deployment pipelines and manage cloud infrastructure.", matched_skills: ["Linux", "Git"], missing_skills: ["Docker", "Kubernetes", "AWS"], salary_range: "PKR 120,000 - 300,000", growth: "Very High" },
    { career_name: "Data Engineer", fit_score: 78, type: "tech", reasoning: "Build data pipelines and manage large-scale data systems.", matched_skills: ["Python", "SQL"], missing_skills: ["Apache Spark", "Airflow"], salary_range: "PKR 90,000 - 220,000", growth: "High" },
    { career_name: "AI/ML Engineer", fit_score: 75, type: "tech", reasoning: "Develop machine learning models and AI solutions.", matched_skills: ["Python"], missing_skills: ["TensorFlow", "PyTorch", "MLOps"], salary_range: "PKR 100,000 - 280,000", growth: "Very High" }
  ],
  career_fits: []
};
demoCareerOutput.career_fits = demoCareerOutput.top_3_careers;

const demoRoadmapOutput = {
  career_name: "Backend Developer",
  total_duration: "8 months",
  current_level: "intermediate",
  skill_gap_summary: "You have strong Python and API basics. Missing skills: Docker (DevOps), advanced PostgreSQL optimization, and CI/CD pipeline configuration. These are critical for senior backend roles and deployment readiness.",
  what_to_do_right_now: [
    { title: "Complete FastAPI Tutorial", duration: "1 week", description: "Build a REST API with authentication and database integration." },
    { title: "Learn Docker Basics", duration: "2 weeks", description: "Containerize your FastAPI app - this is the #1 missing skill for your career goals." }
  ],
  steps: [
    { step_id: 1, title: "Deepen Language Fundamentals", duration: "4 weeks", description: "Master core Python concepts, data structures, error handling, and OOP principles.", resources: ["https://docs.python.org/3/tutorial/", "https://realpython.com/"], targets_missing_skill: false },
    { step_id: 2, title: "Learn API Development", duration: "6 weeks", description: "Build REST APIs using FastAPI/Flask. Understand authentication, validation, and best practices.", resources: ["https://fastapi.tiangolo.com/", "https://www.restapitutorial.com/"], targets_missing_skill: false },
    { step_id: 3, title: "Database Mastery", duration: "4 weeks", description: "Learn PostgreSQL, ORM concepts, migrations, and database design patterns.", resources: ["https://www.postgresql.org/docs/", "https://www.sqlite.org/index.html"], targets_missing_skill: false },
    { step_id: 4, title: "Docker & Containerization", duration: "3 weeks", description: "Learn Docker concepts, build images, push to registry. This fills a critical skill gap.", resources: ["Docker: https://docker.com/", "Docker Hub: https://hub.docker.com/"], targets_missing_skill: true },
    { step_id: 5, title: "CI/CD Pipelines", duration: "3 weeks", description: "Automate testing and deployment using GitHub Actions or similar tools.", resources: ["GitHub Actions: https://github.com/features/actions", "CI/CD best practices: https://martinfowler.com/articles/continuousIntegration.html"], targets_missing_skill: true },
    { step_id: 6, title: "Build Portfolio Projects", duration: "6 weeks", description: "Create 2-3 full projects with Docker + CI/CD: e-commerce API, task manager, or blog backend.", resources: ["Project Ideas: https://github.com/florinpop17/app-ideas"], targets_missing_skill: false }
  ]
};

function updateRoadmapPhaseState(phase) {
  const checkboxes = Array.from(phase.querySelectorAll(".roadmap-task-checkbox"));
  const allChecked = checkboxes.length > 0 && checkboxes.every((checkbox) => checkbox.checked);

  phase.classList.toggle("complete", allChecked);

  if (allChecked) {
    phase.classList.remove("current");
  } else if (phase.dataset.defaultStatus === "current") {
    phase.classList.add("current");
  }

  checkboxes.forEach((checkbox) => {
    const label = checkbox.closest(".roadmap-task-label");
    if (label) label.classList.toggle("is-checked", checkbox.checked);
  });
}

function setupRoadmapTaskInteractions() {
  document.querySelectorAll(".roadmap-phase").forEach((phase) => {
    if (phase.classList.contains("current")) {
      phase.dataset.defaultStatus = "current";
    }

    const checkboxes = phase.querySelectorAll(".roadmap-task-checkbox");
    if (!checkboxes.length) return;

    updateRoadmapPhaseState(phase);

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateRoadmapPhaseState(phase);
      });
    });
  });
}

function createRoadmapTaskItem(taskText, checked = false) {
  const item = document.createElement("li");
  item.className = "roadmap-task-item";

  const label = document.createElement("label");
  label.className = "roadmap-task-label";
  if (checked) label.classList.add("is-checked");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "roadmap-task-checkbox";
  checkbox.checked = checked;

  const text = document.createElement("span");
  text.className = "roadmap-task-text";
  text.textContent = taskText;

  label.appendChild(checkbox);
  label.appendChild(text);
  item.appendChild(label);

  return item;
}

function setupCustomChecklist() {
  if (!roadmapCustomTaskInput || !roadmapAddTaskBtn || !roadmapCustomTaskList) return;

  const addItem = () => {
    const taskText = roadmapCustomTaskInput.value.trim();
    if (!taskText) return;
    roadmapCustomTaskList.appendChild(createRoadmapTaskItem(taskText));
    roadmapCustomTaskInput.value = "";
    roadmapCustomTaskInput.focus();
  };

  roadmapAddTaskBtn.addEventListener("click", addItem);
  roadmapCustomTaskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  });

  roadmapCustomTaskList.addEventListener("change", (e) => {
    const checkbox = e.target.closest(".roadmap-task-checkbox");
    if (!checkbox) return;
    const label = checkbox.closest(".roadmap-task-label");
    if (label) label.classList.toggle("is-checked", checkbox.checked);
  });
}

function formatTitle(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function clearNode(node) {
  if (!node) return;
  node.innerHTML = "";
}

function createChipList(items = []) {
  const list = document.createElement("ul");
  list.className = "chips-list";
  items.forEach((item) => {
    const chip = document.createElement("li");
    chip.className = "chip resource-chip";

    const urlMatch = item.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      const link = document.createElement("a");
      link.href = urlMatch[1];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.replace(urlMatch[1], "").trim() || urlMatch[1];
      chip.appendChild(link);
    } else {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "resource-found-checkbox";
      checkbox.title = "Mark as found";

      const label = document.createElement("span");
      label.textContent = item;

      chip.appendChild(checkbox);
      chip.appendChild(label);
    }
    list.appendChild(chip);
  });
  return list;
}

function renderListInto(container, items = [], emptyLabel = "No items available") {
  if (!container) return;
  clearNode(container);

  const values = items.filter(Boolean);
  if (!values.length) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = emptyLabel;
    container.appendChild(emptyItem);
    return;
  }

  values.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderSkillGapModal(payload) {
  if (!payload || !skillsModalTitle || !skillsModalCopy) return;

  const gapAnalysis = payload.gap_analysis || {};
  const title = payload.career_name
    ? `Skills you still need: ${payload.career_name}`
    : "Skills you still need";
  skillsModalTitle.textContent = title;
  skillsModalCopy.textContent = gapAnalysis.summary || "The app will show missing skills and next steps here.";

  renderListInto(
    skillsModalGapList,
    gapAnalysis.missing_skills || [],
    "No obvious skill gaps detected yet.",
  );
  renderListInto(
    skillsModalStepList,
    payload.immediate_next_steps || [],
    "No next steps returned yet.",
  );
}

function renderCareerRecommendations(payload) {
  const topCareers = payload.top_3_careers || payload.career_fits || [];
  latestCareerAssessment = payload;

  if (careerOutput) {
    careerOutput.hidden = false;
  }
  const careerContent = document.getElementById("career-content");
  if (careerContent) {
    careerContent.hidden = false;
  }

  // Add user's name to heading if logged in or entered in form
  const user = localStorage.getItem("career-counselor-user");
  const userObj = user ? JSON.parse(user) : null;
  const submittedName = latestCareerSubmission?.name;
  const displayName = userObj?.username || submittedName;

  // Update the heading to include name
  const headingEl = careerOutput.querySelector(".response-heading");
  if (headingEl && displayName) {
    headingEl.textContent = `Your Career Matches, ${displayName}`;
  }

  if (!topCareers.length) {
    showInlineError(careerError, careerErrorText, careerRetryBtn, "No careers found. Please add your skills and interests in the form, then submit again.");
    return;
  }

  if (careerRecommendationPanel) {
    clearNode(careerRecommendationPanel);

    topCareers.forEach((career, index) => {
      const card = document.createElement("div");
      card.className = "card";

      const match = document.createElement("div");
      match.className = "match chip";
      match.textContent = `${career.fit_score ?? 0}% Match`;

      const title = document.createElement("h3");
      title.className = "career-path";
      title.textContent = career.career_name;

      const type = document.createElement("div");
      type.className = "chip job-type";
      type.textContent = formatTitle(career.type || "open");

      if (payload.ai_used === false) {
        const aiChip = document.createElement("span");
        aiChip.className = "chip fallback-chip";
        aiChip.textContent = "AI analysis unavailable";
        type.after(aiChip);
      }

      const description = document.createElement("p");
      description.className = "career-description";
      description.textContent = career.reasoning || "Fill in your skills and interests to get personalized career recommendations.";

      const skillsBlock = document.createElement("div");
      skillsBlock.className = "required-skills";

      const matchedHeading = document.createElement("h5");
      matchedHeading.className = "skill-heading matched";
      matchedHeading.textContent = "Your Skills";

      const matchedSkills = (career.matched_skills || []).filter(Boolean);
      const gapsHeading = document.createElement("h5");
      gapsHeading.className = "skill-heading gaps";
      gapsHeading.textContent = "Skills to Learn";

      const missingSkills = (career.missing_skills || []).filter(Boolean);

      const roadmapBtn = document.createElement("button");
      roadmapBtn.type = "button";
      roadmapBtn.className = "create-roadmap-btn";
      roadmapBtn.dataset.careerTitle = career.career_name;
      roadmapBtn.textContent = "Create Roadmap";

      skillsBlock.appendChild(matchedHeading);
      if (matchedSkills.length > 0) {
        const matchedList = createChipList(matchedSkills);
        skillsBlock.appendChild(matchedList);
      } else {
        const emptyMsg = document.createElement("p");
        emptyMsg.textContent = "No skills matched yet. Add more skills to your profile.";
        skillsBlock.appendChild(emptyMsg);
      }

      skillsBlock.appendChild(gapsHeading);
      if (missingSkills.length > 0) {
        const gapsList = createChipList(missingSkills);
        skillsBlock.appendChild(gapsList);
      } else {
        const emptyMsg = document.createElement("p");
        emptyMsg.textContent = "No required skills identified.";
        skillsBlock.appendChild(emptyMsg);
      }

      card.appendChild(match);
      card.appendChild(title);
      card.appendChild(type);
      card.appendChild(description);
      card.appendChild(skillsBlock);
      card.appendChild(roadmapBtn);
      careerRecommendationPanel.appendChild(card);
    });
  }

  if (careerRecommendationPanel) {
    careerRecommendationPanel.hidden = false;
  }

  if (skillGapsCard) {
    skillGapsCard.hidden = true;
  }
}

function buildImmediateStepCard(step, index) {
  const card = document.createElement("article");
  card.className = "roadmap-now-item";

  const badge = document.createElement("div");
  badge.className = "roadmap-now-index";
  badge.textContent = String(index + 1);

  const title = document.createElement("h4");
  title.textContent = step.title;

  const description = document.createElement("p");
  description.textContent = step.description;

  card.appendChild(badge);
  card.appendChild(title);
  card.appendChild(description);
  return card;
}

function buildRoadmapPhase(step, index) {
  const article = document.createElement("article");
  article.className = "roadmap-phase";
  if (index === 0) {
    article.classList.add("complete");
  } else if (index === 1) {
    article.classList.add("current");
  }

  const marker = document.createElement("div");
  marker.className = "roadmap-phase-marker";
  marker.textContent = index === 0 ? "✓" : String(index + 1);

  const content = document.createElement("div");
  content.className = "roadmap-phase-content";

  const head = document.createElement("div");
  head.className = "roadmap-phase-head";

  const title = document.createElement("h4");
  title.textContent = step.title;

  const chips = document.createElement("div");
  chips.className = "roadmap-phase-chips";

  const statusChip = document.createElement("span");
  statusChip.className = "chip job-type";
  statusChip.textContent = index === 0 ? "Completed" : index === 1 ? "In Progress" : "Planned";

  const durationChip = document.createElement("span");
  durationChip.className = "chip";
  durationChip.textContent = step.duration;

  chips.appendChild(statusChip);
  chips.appendChild(durationChip);
  head.appendChild(title);
  head.appendChild(chips);

  const description = document.createElement("p");
  description.textContent = step.description;

  const checkboxLabel = document.createElement("label");
  checkboxLabel.className = "roadmap-task-label";

  const stepNum = document.createElement("span");
  stepNum.className = "step-number";
  stepNum.textContent = index + 1;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "roadmap-task-checkbox";
  checkbox.dataset.stepId = step.step_id || step.order || index + 1;
  checkbox.dataset.stepTitle = step.title;

  checkbox.addEventListener("change", async function() {
    const stepId = this.dataset.stepId;
    const stepTitle = this.dataset.stepTitle;
    checkboxLabel.classList.toggle("is-checked", this.checked);

    if (!currentSessionId) {
      currentSessionId = localStorage.getItem("career-counselor-session-id");
      if (!currentSessionId) {
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        currentSessionId = uuid;
        localStorage.setItem("career-counselor-session-id", currentSessionId);
      }
    }

    try {
      const progressResponse = await postEndpointData("api/tasks", {
        user_id: getCurrentUserId(),
        session_id: currentSessionId,
        career_topic: latestRoadmapCareer || roadmapData.career_topic,
        step_id: parseInt(stepId),
        step_title: stepTitle,
        mark_complete: this.checked,
      });
      updateLocalProgress(currentSessionId, {
        career_topic: latestRoadmapCareer || roadmapData.career_topic,
        step_id: parseInt(stepId),
        step_title: stepTitle,
        completed: this.checked,
        completed_at: this.checked ? new Date().toISOString() : null,
        progress_percentage: progressResponse.progress_percentage,
      });
      console.log(`Step ${stepId} marked ${this.checked ? "complete" : "incomplete"}`);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  });

  checkboxLabel.appendChild(stepNum);
  checkboxLabel.appendChild(checkbox);
  const taskText = document.createElement("span");
  taskText.className = "roadmap-task-text";
  taskText.textContent = "Mark complete";
  checkboxLabel.appendChild(taskText);

  const resourcesBlock = document.createElement("div");
  resourcesBlock.className = "required-skills";

  const resourcesHeading = document.createElement("h5");
  resourcesHeading.textContent = "Resources";

  const resources = createChipList(step.resources || []);
  resourcesBlock.appendChild(resourcesHeading);
  resourcesBlock.appendChild(resources);

  content.appendChild(head);
  content.appendChild(description);
  content.appendChild(checkboxLabel);
  content.appendChild(resourcesBlock);

  article.appendChild(marker);
  article.appendChild(content);
  return article;
}

function renderRoadmapResponse(payload) {
  latestRoadmapCareer = payload.career_name || "Unknown";
  const targetRole = document.getElementById("roadmap-target-role");
  const timelineChip = document.getElementById("roadmap-timeline-chip");
  const levelChip = document.getElementById("roadmap-level-chip");
  const immediateSteps = document.getElementById("roadmap-immediate-steps");
  const roadmapSteps = document.getElementById("roadmap-steps");
  const roadmapOutput = document.getElementById("roadmap-output");
  const skillGapInsight = document.getElementById("skill-gap-insight");
  const skillGapSummaryText = document.getElementById("skill-gap-summary-text");

  if (roadmapOutput) {
    roadmapOutput.classList.remove("hidden");
  }
  const roadmapContent = document.getElementById("roadmap-content");
  if (roadmapContent) {
    roadmapContent.hidden = false;
  }

  if (targetRole) targetRole.textContent = payload.career_name || "Backend Developer";
  if (timelineChip) timelineChip.textContent = payload.total_duration || "12 months";
  if (levelChip) {
    levelChip.textContent = `Current: ${formatTitle(payload.current_level || "beginner")}`;
  }

  // Display skill gap summary if available
  if (payload.skill_gap_summary) {
    if (skillGapInsight) skillGapInsight.hidden = false;
    if (skillGapSummaryText) skillGapSummaryText.textContent = payload.skill_gap_summary;
  } else {
    if (skillGapInsight) skillGapInsight.hidden = true;
    if (skillGapSummaryText) skillGapSummaryText.textContent = "";
  }

  if (immediateSteps) {
    clearNode(immediateSteps);
    (payload.what_to_do_right_now || []).forEach((step, index) => {
      immediateSteps.appendChild(buildImmediateStepCard(step, index));
    });
  }

  if (roadmapSteps) {
    clearNode(roadmapSteps);
    (payload.steps || []).forEach((step, index) => {
      roadmapSteps.appendChild(buildRoadmapPhase(step, index));
    });
  }
}

async function openSkillsModal() {
  if (!skillsModal || !latestCareerAssessment || !latestCareerSubmission) return;

  skillsModal.hidden = false;
  skillsModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  if (latestSkillGapAnalysis) {
    renderSkillGapModal(latestSkillGapAnalysis);
    return;
  }

  if (skillsModalCopy) {
      skillsModalCopy.textContent = "Loading skills you still need...";
  }
  renderListInto(skillsModalGapList, [], "Loading...");
  renderListInto(skillsModalStepList, [], "Loading...");

  const targetCareer = (latestCareerAssessment.top_3_careers || latestCareerAssessment.career_fits || [])[0];
  const analysisPayload = {
    session_id: latestCareerAssessment.session_id || null,
    user_id: getCurrentUserId(),
    target_role: targetCareer?.career_name || latestCareerSubmission.career_topic || "",
    skills_data: latestCareerSubmission.skills || [],
    experience: latestCareerSubmission.additional_info || "",
    education: latestCareerSubmission.education_level || "",
  };

  if (!analysisPayload.skills_data.length) {
    if (skillsModalCopy) {
      skillsModalCopy.textContent = "Add your current skills in the assessment form first.";
    }
    renderListInto(skillsModalGapList, [], "No analysis available.");
    renderListInto(skillsModalStepList, [], "No recommendations available.");
    return;
  }

  try {
    latestSkillGapAnalysis = await postEndpointData("api/skill-gap-analysis", analysisPayload);
    updateLocalAssessmentSession(analysisPayload.session_id, (entry) => ({
      ...entry,
      skill_gap_analysis: latestSkillGapAnalysis,
    }));
    renderSkillGapModal(latestSkillGapAnalysis);
  } catch (error) {
    console.error("Skill gap analysis request failed:", error);
    if (skillsModalCopy) {
      skillsModalCopy.textContent = "Skills analysis failed to load.";
    }
    renderListInto(skillsModalGapList, [], "No analysis available.");
    renderListInto(skillsModalStepList, [], "No recommendations available.");
  }
}

function closeSkillsModal() {
  if (!skillsModal) return;
  skillsModal.hidden = true;
  skillsModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

if (hideRecommendationBtn) {
  hideRecommendationBtn.addEventListener("click", () => {
    if (careerRecommendationPanel) {
      careerRecommendationPanel.hidden = true;
    }
    if (skillGapsContent) {
      skillGapsContent.innerHTML = "";
    }
    closeSkillsModal();
  });
}

if (openSkillsModalBtn) {
  openSkillsModalBtn.addEventListener("click", openSkillsModal);
}

if (modalReanalyzeBtn) {
  modalReanalyzeBtn.addEventListener("click", openSkillsModal);
}

if (skillsModal) {
  skillsModal.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) {
      closeSkillsModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && skillsModal && !skillsModal.hidden) {
    closeSkillsModal();
  }
});

careerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  careerForm.classList.add("submitted");
  hideErrorBanner();
  hideInlineError(careerError);

  const userData = buildCareerFormData(careerForm);
  latestCareerSubmission = userData;

  const submitFn = async () => {
    if (careerOutput) careerOutput.hidden = false;
    if (careerSpinner) careerSpinner.hidden = false;
    if (careerRecommendationPanel) careerRecommendationPanel.hidden = true;
    if (careerError) careerError.hidden = true;
    if (skillGapsCard) skillGapsCard.hidden = true;
    const careerContent = document.getElementById("career-content");
    if (careerContent) careerContent.hidden = true;

    // Start loading animation
    if (careerSpinnerInterval) clearInterval(careerSpinnerInterval);
    careerSpinnerInterval = startLoadingText("career-spinner-text", careerLoadingTexts);

    try {
      const response = await postEndpointData("api/assess", {
        user_id: getCurrentUserId(),
        name: userData.name,
        interests: userData.interests,
        skills: userData.skills,
        education_level: userData.education_level,
        career_goals: userData.career_goals ? [userData.career_goals] : [],
        location: userData.country,
        notes: userData.additional_info,
      });

      localStorage.setItem("career-counselor-session-id", response.session_id);
      upsertLocalAssessment({
        session_id: response.session_id,
        name: userData.name,
        interests: userData.interests,
        skills: userData.skills,
        education_level: userData.education_level,
        career_goals: userData.career_goals ? [userData.career_goals] : [],
        location: userData.country,
        notes: userData.additional_info,
        career_fits: response.career_fits || [],
        top_careers: response.top_3_careers || [],
      });
      if (careerSpinner) careerSpinner.hidden = true;
      careerSpinnerInterval = stopLoadingText(careerSpinnerInterval);
      if (careerContent) careerContent.hidden = false;
      renderCareerRecommendations(response);
    } catch (error) {
      console.error("Career recommendation request failed:", error);
      if (careerSpinner) careerSpinner.hidden = true;
      careerSpinnerInterval = stopLoadingText(careerSpinnerInterval);
      if (careerContent) careerContent.hidden = true;
      let msg = "Failed to get recommendations. Make sure the backend is running (localhost:8001) and try again.";
      if (error.message && error.message.includes("503")) {
        msg = "AI service temporarily unavailable (rate limited). Try again in a few minutes.";
      }
      showInlineError(careerError, careerErrorText, careerRetryBtn, msg);
    }
  };

  pendingCareerSubmit = submitFn;
  await submitFn();
});

roadmapForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  roadmapForm.classList.add("submitted");
  hideErrorBanner();
  hideInlineError(roadmapError);

  const roadmapData = buildRoadmapFormData(roadmapForm);
  const sessionId = localStorage.getItem("career-counselor-session-id") || null;
  const timelineHoursMap = {
    "3months": 20,
    "6months": 12,
    "1year": 8,
    "2years": 5,
    "5years": 3,
  };

  const submitFn = async () => {
    if (roadmapOutput) roadmapOutput.classList.remove("hidden");
    if (roadmapSpinner) roadmapSpinner.hidden = false;
    if (roadmapError) roadmapError.hidden = true;
    const roadmapContent = document.getElementById("roadmap-content");
    if (roadmapContent) roadmapContent.hidden = true;

    // Start loading animation
    if (roadmapSpinnerInterval) clearInterval(roadmapSpinnerInterval);
    roadmapSpinnerInterval = startLoadingText("roadmap-spinner-text", roadmapLoadingTexts);

    try {
      // Extract skill gaps from latest career assessment
      let missingSkills = [];
      let currentSkills = [];
      if (latestCareerAssessment && latestCareerAssessment.career_fits && latestCareerAssessment.career_fits.length > 0) {
        const targetCareer = latestCareerAssessment.career_fits[0];
        missingSkills = targetCareer.missing_skills || [];
        currentSkills = targetCareer.matched_skills || [];
      }

      const response = await postEndpointData("api/roadmap", {
        user_id: getCurrentUserId(),
        session_id: sessionId,
        career_topic: roadmapData.career_topic,
        timeline_hours_per_week: timelineHoursMap[roadmapData.timeline] || 10,
        current_level: roadmapData.current_status,
        missing_skills: missingSkills,
        current_skills: currentSkills,
      });

      if (roadmapSpinner) roadmapSpinner.hidden = true;
      roadmapSpinnerInterval = stopLoadingText(roadmapSpinnerInterval);
      if (roadmapContent) roadmapContent.hidden = false;
      updateLocalAssessmentSession(response.session_id || sessionId, (entry) => ({
        ...entry,
        roadmap: response,
      }));
      renderRoadmapResponse(response);
    } catch (error) {
      console.error("Roadmap request failed:", error);
      if (roadmapSpinner) roadmapSpinner.hidden = true;
      roadmapSpinnerInterval = stopLoadingText(roadmapSpinnerInterval);
      if (roadmapContent) roadmapContent.hidden = true;
      let msg = "Failed to generate roadmap. Make sure the backend is running (localhost:8001) and try again.";
      if (error.message && error.message.includes("503")) {
        msg = "AI service temporarily unavailable (rate limited). Try again in a few minutes.";
      }
      showInlineError(roadmapError, roadmapErrorText, roadmapRetryBtn, msg);
    }
  };

  pendingRoadmapSubmit = submitFn;
  await submitFn();
});

const careerDemoBtn = document.getElementById("career-demo-btn");
if (careerDemoBtn) {
  careerDemoBtn.addEventListener("click", () => {
    if (!careerForm) return;
    careerForm.querySelector("#name").value = careerDummyData.name;
    careerForm.querySelector("#education_level").value = careerDummyData.education_level;
    careerForm.querySelector("#goals").value = careerDummyData.goals;
    careerForm.querySelector("#location").value = careerDummyData.location;
    careerForm.querySelector("#notes").value = careerDummyData.notes;
    setChipSelections(careerForm.querySelector("#interests-chips"), careerDummyData.interests, careerDummyData.custom_interest);
    setChipSelections(careerForm.querySelector("#skills-chips"), careerDummyData.skills, careerDummyData.custom_skill);
    setChipSelections(careerForm.querySelector("#industries-chips"), careerDummyData.industries, careerDummyData.custom_industry);
    latestCareerSubmission = buildCareerFormData(careerForm);
    currentSessionId = demoCareerOutput.session_id;
    localStorage.setItem("career-counselor-session-id", currentSessionId);
    if (careerOutput) {
      renderCareerRecommendations(demoCareerOutput);
    }
    document.getElementById("career").scrollIntoView({ behavior: "smooth" });
  });
}

const roadmapDemoBtn = document.getElementById("roadmap-demo-btn");
if (roadmapDemoBtn) {
  roadmapDemoBtn.addEventListener("click", () => {
    if (!roadmapForm) return;
    roadmapForm.querySelector("#career_topic").value = roadmapDummyData.career_topic;
    roadmapForm.querySelector("#timeline").value = roadmapDummyData.timeline;
    roadmapForm.querySelector("#current_status").value = roadmapDummyData.current_status;
    roadmapForm.querySelector("#notes").value = roadmapDummyData.notes;
    if (roadmapOutput) roadmapOutput.classList.remove("hidden");
    renderRoadmapResponse(demoRoadmapOutput);
    document.getElementById("roadmap").scrollIntoView({ behavior: "smooth" });
  });
}

if (enableTrackingCheckbox) {
  if (enableTrackingCheckbox.checked) {
    const checklistHeader = document.getElementById("checklist-header");
    if (roadmapOutput) roadmapOutput.classList.add("tracking-enabled");
    if (checklistHeader) checklistHeader.classList.remove("hidden");
  }
  enableTrackingCheckbox.addEventListener("change", (e) => {
    const checklistHeader = document.getElementById("checklist-header");
    if (roadmapOutput) {
      if (e.target.checked) {
        roadmapOutput.classList.add("tracking-enabled");
        if (checklistHeader) checklistHeader.classList.remove("hidden");
      } else {
        roadmapOutput.classList.remove("tracking-enabled");
        if (checklistHeader) checklistHeader.classList.add("hidden");
      }
    }
  });
}

setupRoadmapTaskInteractions();
setupCustomChecklist();

document.addEventListener("click", (e) => {
  const button = e.target.closest(".create-roadmap-btn");
  if (!button) return;

  const careerTitle = button.dataset.careerTitle || "";
  const roadmapTab = document.querySelector(".tab[href='#roadmap']");
  if (careerTitle) {
    roadmapForm.querySelector("#career_topic").value = careerTitle;
  }
  if (roadmapTab) roadmapTab.click();
  if (roadmapForm && typeof roadmapForm.requestSubmit === "function") {
    roadmapForm.requestSubmit();
  } else if (roadmapForm) {
    roadmapForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  }
});

// Generate Mock Recommendations
function generateMockRecommendations(data) {
  const mockRecommendations = [
    {
      title: "Software Developer",
      description:
        "Design, develop, and maintain software applications. Strong fit for tech interests and your educational background.",
      matchScore: "92%",
      reasoning:
        "Your background in " +
        data.education_level +
        " combined with interest in " +
        (data.interests || "technology") +
        " makes this a strong match.",
    },
    {
      title: "Data Analyst",
      description:
        "Analyze data and provide insights to support business decisions. Growing demand across all industries.",
      matchScore: "85%",
      reasoning:
        "Good alignment with your goals and the analytical skills from your background.",
    },
    {
      title: "Product Manager",
      description:
        "Lead product development from concept to launch. Combine tech skills with business acumen.",
      matchScore: "78%",
      reasoning:
        "Matches your interest in " +
        (data.interests || "technology") +
        " and career goals.",
    },
  ];

  return mockRecommendations;
}

// -- TESTING

// ? function to test endpoints
const testEndpoint = async (endpoint) => {
  const data = await getEndpointData(endpoint);
  console.log(data);
  console.log(`Endpoint ${endpoint} is working!`);
};

// testEndpoint("options/skills");

// -- TAB SWITCHING

const tabs = document.querySelectorAll(".tab");

tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();

    // remove the `active` tab
    tabs.forEach((t) => t.classList.remove("active"));
    // make the clicked tab active
    tab.classList.add("active");

    // select all tab-contents & remove active class
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

    // find the clicked button target form
    const target = document.querySelector(tab.getAttribute("href"));
    // if found make the target form active
    if (target) target.classList.add("active");
  });
});
