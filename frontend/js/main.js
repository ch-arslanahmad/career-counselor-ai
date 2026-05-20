// main.js - Handles form submission and dynamic content generation

import {
  getCurrentUserId,
  readLocalHistory,
  writeLocalHistory,
  upsertLocalAssessment,
  updateLocalAssessmentSession,
  updateLocalProgress,
} from "./modules/storage.js";
import {
  getEndpointData,
  getDataFromEndpoint,
  postEndpointData,
} from "./modules/api.js";

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
const historyDemoSection = document.getElementById("history-demo-section");

function updateAuthUI() {
  const user = sessionStorage.getItem("career-counselor-user");
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
    if (historyDemoSection) historyDemoSection.classList.add("hidden");
  } else {
    if (userDisplay) userDisplay.classList.add("hidden");
    if (headerUserDisplay) headerUserDisplay.classList.add("hidden");
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (headerLoginBtn) headerLoginBtn.classList.remove("hidden");
    if (headerLogoutBtn) headerLogoutBtn.classList.add("hidden");
    if (historyDemoSection) historyDemoSection.classList.remove("hidden");
  }
  if (historyTab) historyTab.classList.remove("hidden");
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
    sessionStorage.removeItem("career-counselor-user");
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
      sessionStorage.setItem(
        "career-counselor-user",
        JSON.stringify({
          user_id: data.user_id,
          username: data.username,
        }),
      );
      loginModal.hidden = true;
      loginForm.reset();
      updateAuthUI();
      loadHistory();
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
        sessionStorage.setItem(
          "career-counselor-user",
          JSON.stringify({
            user_id: data.user_id,
            username: data.username,
          }),
        );
        loginModal.hidden = true;
        updateAuthUI();
        loadHistory();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Demo user not found. Run seed_demo.py first.");
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
const historyPersistLoginBtn = document.getElementById("history-persist-login-btn");
const historyLoginRequired = document.getElementById("history-login-required");
const historyAssessments = document.getElementById("history-assessments");
const historyProgress = document.getElementById("history-progress");
const historySavedProgress = document.getElementById("history-saved-progress");
const assessmentList = document.getElementById("assessment-list");
const progressList = document.getElementById("progress-list");
const savedProgressList = document.getElementById("saved-progress-list");
const historySourceNote = document.getElementById("history-source-note");

if (historyLoginBtn) {
  historyLoginBtn.addEventListener("click", () => {
    loginModal.hidden = false;
  });
}

if (historyPersistLoginBtn) {
  historyPersistLoginBtn.addEventListener("click", () => {
    loginModal.hidden = false;
  });
}

async function loadHistory() {
  const userId = getCurrentUserId();
  let data = { assessments: [], progress: [] };

  const historyContent = document.getElementById("history-content");
  if (historyContent) {
    const oldEmpty = historyContent.querySelector(".history-empty-state");
    if (oldEmpty) oldEmpty.remove();
  }

  // Hide all sections first
  if (historyLoginRequired) historyLoginRequired.classList.add("hidden");

  if (userId) {
    // Logged in: fetch from DB
    try {
      const res = await fetch(
        `http://localhost:8001/api/history?user_id=${userId}`,
      );
      if (res.ok) {
        data = await res.json();
      }
    } catch (err) {
      console.error("Failed to load history from DB:", err);
    }

    // Fetch saved progress for each assessment session
    const savedProgress = [];
    for (const assessment of data.assessments) {
      if (assessment.session_id) {
        try {
          const progressRes = await fetch(
            `http://localhost:8001/api/tasks/${assessment.session_id}`,
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            if (progressData.steps && progressData.steps.length > 0) {
              savedProgress.push({
                session_id: assessment.session_id,
                career: assessment.top_careers?.[0] || assessment.name || "Unknown",
                steps: progressData.steps,
                completed_count: progressData.completed_count || 0,
                total_steps: progressData.total_steps || 0,
                percentage: progressData.completion_percentage || 0,
              });
            }
          }
        } catch (err) {
          console.warn("Failed to load progress for session:", assessment.session_id, err);
        }
      }
    }
    data.saved_progress = savedProgress;

    // Also load current session progress
    const sessionId =
      currentSessionId || localStorage.getItem("career-counselor-session-id");
    if (sessionId) {
      try {
        const progressRes = await fetch(
          `http://localhost:8001/api/tasks/${sessionId}`,
        );
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          if (progressData.steps && progressData.steps.length > 0) {
            data.progress = progressData.steps;
          }
        }
      } catch (err) {
        console.error("Failed to load session progress:", err);
      }
    }
  } else {
    // Not logged in: use localStorage
    data = readLocalHistory();
    data.saved_progress = [];
  }

  // Update source note
  if (historySourceNote) {
    historySourceNote.textContent = userId
      ? "Signed-in history is synced with the database."
      : "This device-only history is stored in your browser until you sign in.";
  }

  // Show/hide demo button
  if (historyDemoSection) {
    if (userId) {
      historyDemoSection.classList.add("hidden");
    } else {
      historyDemoSection.classList.remove("hidden");
    }
  }

  // Render assessments
  if (historyAssessments && assessmentList) {
    if (data.assessments && data.assessments.length > 0) {
      historyAssessments.classList.remove("hidden");
      assessmentList.innerHTML = data.assessments
        .map(
          (a) => `
        <div class="history-card">
          <h4>${a.name || "Assessment"} - ${a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}</h4>
          <p>Top careers: ${(a.top_careers || []).map(c => typeof c === 'string' ? c : (c.career_name || c.title || 'Unknown')).join(", ")}</p>
          <p class="history-skills">Skills: ${(a.skills || []).join(", ")}</p>
          ${a.roadmap && a.roadmap.career_name ? `<p>Saved roadmap: ${a.roadmap.career_name}</p>` : ""}
          ${a.skill_gap_analysis && a.skill_gap_analysis.career_name ? `<p>Skill gap analysis: ${a.skill_gap_analysis.career_name}</p>` : ""}
        </div>`,
        )
        .join("");
    } else {
      historyAssessments.classList.add("hidden");
    }
  }

  // Render completed steps
  if (historyProgress && progressList) {
    if (data.progress && data.progress.length > 0) {
      historyProgress.classList.remove("hidden");
      progressList.innerHTML = data.progress
        .map(
          (p) => `
        <div class="history-card">
          <h4>${p.career_topic || "Learning Progress"}</h4>
          <p>Completed step: ${p.step_title || "Step"}</p>
          <p class="history-date">${p.completed_at ? new Date(p.completed_at).toLocaleDateString() : ""}</p>
        </div>`,
        )
        .join("");
    } else {
      historyProgress.classList.add("hidden");
    }
  }

  // Render saved progress per assessment
  if (historySavedProgress && savedProgressList) {
    const allSaved = data.saved_progress || [];
    if (allSaved.length > 0) {
      historySavedProgress.classList.remove("hidden");
      savedProgressList.innerHTML = allSaved
        .map(
          (sp) => `
        <div class="saved-progress-item">
          <div>
            <span class="step-title">${sp.career}</span>
            <span class="step-meta">${sp.completed_count}/${sp.total_steps} steps (${Math.round(sp.percentage)}%)</span>
          </div>
          <span class="step-badge ${sp.percentage === 100 ? 'completed' : 'pending'}">${sp.percentage === 100 ? 'Complete' : 'In Progress'}</span>
        </div>
        ${sp.steps.map(s => `
        <div class="saved-progress-item" style="margin-left: 20px;">
          <div>
            <span class="step-title">${s.step_title || 'Step ' + s.step_id}</span>
          </div>
          <span class="step-badge ${s.completed ? 'completed' : 'pending'}">${s.completed ? 'Done' : 'Pending'}</span>
        </div>`).join('')}`,
        )
        .join("");
    } else {
      historySavedProgress.classList.add("hidden");
    }
  }

  // Show empty state if no data
  const hasAnyData = (data.assessments && data.assessments.length > 0) || (data.progress && data.progress.length > 0) || (data.saved_progress && data.saved_progress.length > 0);
  if (!hasAnyData && historyContent && !historyContent.querySelector(".history-empty-state")) {
    const emptyState = document.createElement("div");
    emptyState.className = "history-empty-state";
    emptyState.style.cssText = "text-align: center; padding: 2rem; color: var(--color-muted);";
    emptyState.innerHTML = userId
      ? "<p>No history yet. Submit a career assessment to start building your history.</p>"
      : "<p>No history yet. Submit a career assessment or click 'Load Demo History' to see sample data.</p>";
    historyContent.appendChild(emptyState);
  }
}

function loadDemoHistory() {
  const demoAssessments = [
    {
      name: "Arslan Ahmad",
      created_at: "2026-05-19T10:30:00Z",
      top_careers: ["Backend Developer", "Full Stack Developer", "DevOps Engineer"],
      skills: ["JavaScript", "Python", "SQL"],
      roadmap: { career_name: "Backend Developer" },
      skill_gap_analysis: { career_name: "Backend Developer" },
    },
    {
      name: "Arslan Ahmad",
      created_at: "2026-05-15T08:00:00Z",
      top_careers: ["Data Engineer", "AI/ML Engineer"],
      skills: ["Python", "SQL", "Statistics"],
    },
  ];

  const demoProgress = [
    { career_topic: "Backend Developer", step_title: "Python and SQL Refresh", completed_at: "2026-05-19T12:00:00Z" },
    { career_topic: "Backend Developer", step_title: "FastAPI and REST Basics", completed_at: "2026-05-18T14:30:00Z" },
  ];

  const demoSavedProgress = [
    {
      career: "Backend Developer",
      completed_count: 3,
      total_steps: 6,
      percentage: 50,
      steps: [
        { step_id: 1, step_title: "Deepen Language Fundamentals", completed: true },
        { step_id: 2, step_title: "Learn API Development", completed: true },
        { step_id: 3, step_title: "Database Mastery", completed: true },
        { step_id: 4, step_title: "Version Control & Collaboration", completed: false },
        { step_id: 5, step_title: "Build Portfolio Projects", completed: false },
        { step_id: 6, step_title: "DevOps Basics", completed: false },
      ],
    },
  ];

  localStorage.setItem(
    "career-counselor-local-history",
    JSON.stringify({ assessments: demoAssessments, progress: demoProgress, saved_progress: demoSavedProgress }),
  );

  if (historyAssessments) {
    historyAssessments.classList.remove("hidden");
    if (assessmentList) {
      assessmentList.innerHTML = demoAssessments
        .map(
          (a) => `
        <div class="history-card">
          <h4>${a.name} - ${new Date(a.created_at).toLocaleDateString()}</h4>
          <p>Top careers: ${(a.top_careers || []).join(", ")}</p>
          <p class="history-skills">Skills: ${(a.skills || []).join(", ")}</p>
          ${a.roadmap ? `<p>Saved roadmap: ${a.roadmap.career_name}</p>` : ""}
          ${a.skill_gap_analysis ? `<p>Skill gap analysis: ${a.skill_gap_analysis.career_name}</p>` : ""}
        </div>
      `,
        )
        .join("");
    }
  }

  if (historyProgress) {
    historyProgress.classList.remove("hidden");
    if (progressList) {
      progressList.innerHTML = demoProgress
        .map(
          (p) => `
        <div class="history-card">
          <h4>${p.career_topic}</h4>
          <p>Completed step: ${p.step_title}</p>
          <p class="history-date">${new Date(p.completed_at).toLocaleDateString()}</p>
        </div>
      `,
        )
        .join("");
    }
  }

  if (historySavedProgress && savedProgressList) {
    historySavedProgress.classList.remove("hidden");
    savedProgressList.innerHTML = demoSavedProgress
      .map(
        (sp) => `
      <div class="saved-progress-item">
        <div>
          <span class="step-title">${sp.career}</span>
          <span class="step-meta">${sp.completed_count}/${sp.total_steps} steps (${sp.percentage}%)</span>
        </div>
        <span class="step-badge pending">In Progress</span>
      </div>
      ${sp.steps.map(s => `
      <div class="saved-progress-item" style="margin-left: 20px;">
        <div>
          <span class="step-title">${s.step_title}</span>
        </div>
        <span class="step-badge ${s.completed ? 'completed' : 'pending'}">${s.completed ? 'Done' : 'Pending'}</span>
      </div>`).join('')}`,
      )
      .join("");
  }

  if (historySourceNote) {
    historySourceNote.textContent = "Demo history loaded from sample data.";
  }

  if (historyDemoSection) {
    historyDemoSection.classList.add("hidden");
  }

  const demoBtn = document.getElementById("history-demo-btn");
  if (demoBtn) demoBtn.textContent = "Demo History Loaded";
}

// Listen for tab changes to load history
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", (e) => {
    if (tab.getAttribute("href") === "#history") {
      loadHistory();
    }
  });
});

// History demo button
const historyDemoBtn = document.getElementById("history-demo-btn");
if (historyDemoBtn) {
  historyDemoBtn.addEventListener("click", () => {
    const user = sessionStorage.getItem("career-counselor-user");
    if (user) {
      loadHistory();
    } else {
      loadDemoHistory();
    }
  });
}

updateAuthUI();

function saveDemoCareerHistory() {
  localStorage.setItem(
    "career-counselor-session-id",
    demoCareerOutput.session_id,
  );
  upsertLocalAssessment({
    session_id: demoCareerOutput.session_id,
    name: careerDummyData.name,
    interests: careerDummyData.interests,
    skills: careerDummyData.skills,
    education_level: careerDummyData.education_level,
    career_goals: [careerDummyData.goals],
    location: careerDummyData.location,
    notes: careerDummyData.notes,
    career_fits: demoCareerOutput.career_fits,
    top_careers: demoCareerOutput.top_3_careers,
  });
}

function saveDemoRoadmapHistory() {
  const sessionId =
    localStorage.getItem("career-counselor-session-id") ||
    demoCareerOutput.session_id;
  localStorage.setItem("career-counselor-session-id", sessionId);
  upsertLocalAssessment({
    session_id: sessionId,
    name: careerDummyData.name,
    interests: careerDummyData.interests,
    skills: careerDummyData.skills,
    education_level: careerDummyData.education_level,
    career_goals: [careerDummyData.goals],
    location: careerDummyData.location,
    notes: roadmapDummyData.notes,
    career_fits: demoCareerOutput.career_fits,
    top_careers: demoCareerOutput.top_3_careers,
    roadmap: demoRoadmapOutput,
  });
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
  try {
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

    const interestsContainer = document.querySelector("#interests-chips");
    const skillsContainer = document.querySelector("#skills-chips");
    const industriesContainer = document.querySelector("#industries-chips");
    const locationsContainer = document.querySelector("#location");

    loadChips(formData.interests, interestsContainer);
    loadChips(formData.skills, skillsContainer);
    loadChips(formData.industries, industriesContainer);
    loadOptions(formData.locations, locationsContainer);
  } catch (err) {
    console.error("Failed to load form options:", err);
  }
}

populateForm(); // call the function to populate the form on page load

// ... make the chip buttons clickable.

function isOtherChip(chip) {
  const value = (chip.value || chip.textContent || "").trim();
  return value === "other" || value === "others";
}

// Constraint limits for chip selections
const CHIP_CONSTRAINTS = {
  "interests-chips": { min: 2, max: 5 },
  "skills-chips": { min: 2, max: 5 },
  "industries-chips": { min: 1, max: 2 },
};

// Helper function to validate chip selection constraints
function validateChipConstraint(container) {
  const containerId = container.id;
  const constraint = CHIP_CONSTRAINTS[containerId];
  if (!constraint) return true;

  const selectedCount = container.querySelectorAll(".chip.selected").length;
  return selectedCount >= constraint.min && selectedCount <= constraint.max;
}

// Helper to get constraint message
function getChipConstraintMessage(containerId) {
  const constraint = CHIP_CONSTRAINTS[containerId];
  if (!constraint) return "";
  return `Select between ${constraint.min} and ${constraint.max} options`;
}

// () => means an arrow function, called an anonymous function, used with event handler
document.querySelectorAll(".chips").forEach((container) => {
  container.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");

    if (!chip) return;

    const containerId = container.id;
    const constraint = CHIP_CONSTRAINTS[containerId];
    const isCurrentlySelected = chip.classList.contains("selected");
    const selectedCount = container.querySelectorAll(".chip.selected").length;

    // Check if deselecting (always allow)
    if (isCurrentlySelected) {
      chip.classList.remove("selected");
    } else if (constraint && selectedCount >= constraint.max) {
      // Check max constraint before selecting
      const field = container.closest(".field");
      if (field) {
        const legend = field.querySelector("legend");
        if (legend) {
          const existingError = field.querySelector(".chip-error-msg");
          if (existingError) existingError.remove();

          const errorMsg = document.createElement("div");
          errorMsg.className = "chip-error-msg";
          errorMsg.textContent = `Maximum ${constraint.max} selection${constraint.max > 1 ? "s" : ""} allowed`;
          field.appendChild(errorMsg);

          setTimeout(() => errorMsg.remove(), 3000);
        }
      }
      return; // Don't select the chip
    } else {
      chip.classList.add("selected");
    }

    if (isOtherChip(chip)) {
      const wrapper = chip
        .closest(".field")
        .querySelector(".chip-input-wrapper"); // find the input wrapper within the same field
      if (wrapper) {
        const isVisible = chip.classList.contains("selected");
        wrapper.classList.toggle("visible", isVisible);
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
const roadmapCustomTaskInput = document.getElementById(
  "roadmap-custom-task-input",
);
const roadmapAddTaskBtn = document.getElementById("roadmap-add-task-btn");
const roadmapCustomTaskList = document.getElementById(
  "roadmap-custom-task-list",
);
const careerOutput = document.getElementById("career-output");
const roadmapOutput = document.getElementById("roadmap-output");
const enableTrackingCheckbox = document.getElementById("enable-tracking");
const careerRecommendationPanel = document.getElementById(
  "career-recommendation-panel",
);
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
let latestRoadmapSubmission = null;
let latestSkillGapAnalysis = null;
let latestRoadmapSteps = [];
let latestRoadmapCareer = null;
let currentSessionId =
  localStorage.getItem("career-counselor-session-id") || null;

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

  // Re-fetch latest roadmap steps if not in memory
  if (!latestRoadmapSteps || latestRoadmapSteps.length === 0) {
    const userId = getCurrentUserId();

    // Try backend history first (logged-in users)
    if (userId) {
      try {
        const res = await fetch(`http://localhost:8001/api/history?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          // Find the assessment matching current session_id
          const match = (data.assessments || []).find(a => a.session_id === currentSessionId);
          if (match && match.roadmap && Array.isArray(match.roadmap.steps)) {
            latestRoadmapSteps = match.roadmap.steps;
            latestRoadmapCareer = match.roadmap.career_name || null;
          }
        }
      } catch (err) {
        console.warn("Backend history fetch failed:", err);
      }
    }

    // Fallback: check localStorage for saved roadmap
    if (!latestRoadmapSteps || latestRoadmapSteps.length === 0) {
      const localHistory = readLocalHistory();
      const match = (localHistory.assessments || []).find(a => a.session_id === currentSessionId);
      if (match && match.roadmap && Array.isArray(match.roadmap.steps)) {
        latestRoadmapSteps = match.roadmap.steps;
        latestRoadmapCareer = match.roadmap.career_name || null;
      }
    }
  }

  // Collect completed step IDs from three sources (API > localStorage > DOM)
  const apiCompletedSteps = new Set();
  const localCompletedSteps = new Set();
  const domCompletedSteps = new Set();

  // 1. Try API first
  try {
    const res = await fetch(
      `http://localhost:8001/api/tasks/${currentSessionId}`,
    );
    if (res.ok) {
      const data = await res.json();
      (data.steps || []).forEach((step) => apiCompletedSteps.add(String(step.step_id)));
    }
  } catch (err) {
    console.warn("API progress unavailable, falling back to local data:", err);
  }

  // 2. Read from localStorage
  const localHistory = readLocalHistory();
  (localHistory.progress || [])
    .filter((p) => p.session_id === currentSessionId && p.completed)
    .forEach((p) => localCompletedSteps.add(String(p.step_id)));

  // 3. Read actual DOM checkbox states
  document.querySelectorAll(".roadmap-task-checkbox").forEach((cb) => {
    if (cb.checked && cb.dataset.stepId) {
      domCompletedSteps.add(String(cb.dataset.stepId));
    }
  });

  // Merge: API wins, then localStorage, then DOM
  const allStepIds = new Set([
    ...apiCompletedSteps,
    ...localCompletedSteps,
    ...domCompletedSteps,
  ]);

  const roadmapSteps = Array.isArray(latestRoadmapSteps)
    ? latestRoadmapSteps
    : [];
  const normalizedSteps = roadmapSteps.length
    ? roadmapSteps.map((step, index) => {
        const stepId = String(step.step_id || step.order || index + 1);
        return {
          step_id: stepId,
          step_title: step.title || `Step ${index + 1}`,
          completed: allStepIds.has(stepId),
        };
      })
    : Array.from(allStepIds).map((id) => ({
        step_id: id,
        step_title: `Step ${id}`,
        completed: true,
      }));

  const completedCount = normalizedSteps.filter(
    (step) => step.completed,
  ).length;
  const totalSteps = normalizedSteps.length || 0;
  const percentage =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  if (progressPanel) progressPanel.classList.remove("hidden");
  if (progressStats) {
    progressStats.textContent = `${completedCount}/${totalSteps} completed (${percentage}%)`;
  }
  if (progressStepList) {
    progressStepList.innerHTML = "";
    if (normalizedSteps.length > 0) {
      normalizedSteps.forEach((step) => {
        const li = document.createElement("li");
        li.className = `progress-step-item ${step.completed ? "completed" : "pending"}`;
        li.innerHTML = `<span class="step-title">${step.step_title}</span><span class="step-state">${step.completed ? "Done" : "Pending"}</span>`;
        progressStepList.appendChild(li);
      });
    } else {
      progressStepList.innerHTML =
        "<li class='progress-step-item'>No roadmap saved yet.</li>";
    }
  }
}

// Update progress panel in real-time when checkboxes change
function refreshProgressPanel() {
  if (!progressPanel || progressPanel.classList.contains("hidden")) return;

  const domCompletedSteps = new Set();
  document.querySelectorAll(".roadmap-task-checkbox").forEach((cb) => {
    if (cb.checked && cb.dataset.stepId) {
      domCompletedSteps.add(String(cb.dataset.stepId));
    }
  });

  const roadmapSteps = Array.isArray(latestRoadmapSteps)
    ? latestRoadmapSteps
    : [];
  const normalizedSteps = roadmapSteps.map((step, index) => {
    const stepId = String(step.step_id || step.order || index + 1);
    return {
      step_id: stepId,
      step_title: step.title || `Step ${index + 1}`,
      completed: domCompletedSteps.has(stepId),
    };
  });

  const completedCount = normalizedSteps.filter(
    (step) => step.completed,
  ).length;
  const totalSteps = normalizedSteps.length || 0;
  const percentage =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  if (progressStats) {
    progressStats.textContent = `${completedCount}/${totalSteps} completed (${percentage}%)`;
  }
  if (progressStepList) {
    progressStepList.innerHTML = "";
    normalizedSteps.forEach((step) => {
      const li = document.createElement("li");
      li.className = `progress-step-item ${step.completed ? "completed" : "pending"}`;
      li.innerHTML = `<span class="step-title">${step.step_title}</span><span class="step-state">${step.completed ? "Done" : "Pending"}</span>`;
      progressStepList.appendChild(li);
    });
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
    {
      career_name: "Backend Developer",
      fit_score: 92,
      type: "tech",
      reasoning:
        "Design and build server-side applications using Python, Node.js, or Go.",
      matched_skills: ["Python", "SQL", "API Design"],
      missing_skills: ["Docker", "Kubernetes"],
      salary_range: "PKR 80,000 - 200,000",
      growth: "High",
    },
    {
      career_name: "Full Stack Developer",
      fit_score: 88,
      type: "tech",
      reasoning:
        "Combine frontend and backend skills to build complete web applications.",
      matched_skills: ["JavaScript", "React"],
      missing_skills: ["PostgreSQL", "DevOps"],
      salary_range: "PKR 100,000 - 250,000",
      growth: "Very High",
    },
    {
      career_name: "DevOps Engineer",
      fit_score: 85,
      type: "tech",
      reasoning:
        "Automate deployment pipelines and manage cloud infrastructure.",
      matched_skills: ["Linux", "Git"],
      missing_skills: ["Docker", "Kubernetes", "AWS"],
      salary_range: "PKR 120,000 - 300,000",
      growth: "Very High",
    },
    {
      career_name: "Data Engineer",
      fit_score: 78,
      type: "tech",
      reasoning: "Build data pipelines and manage large-scale data systems.",
      matched_skills: ["Python", "SQL"],
      missing_skills: ["Apache Spark", "Airflow"],
      salary_range: "PKR 90,000 - 220,000",
      growth: "High",
    },
    {
      career_name: "AI/ML Engineer",
      fit_score: 75,
      type: "tech",
      reasoning: "Develop machine learning models and AI solutions.",
      matched_skills: ["Python"],
      missing_skills: ["TensorFlow", "PyTorch", "MLOps"],
      salary_range: "PKR 100,000 - 280,000",
      growth: "Very High",
    },
  ],
  career_fits: [],
};
demoCareerOutput.career_fits = demoCareerOutput.top_3_careers;

const demoRoadmapOutput = {
  career_name: "Backend Developer",
  total_duration: "1 year",
  current_level: "intermediate",
  skill_gap_summary:
    "You have strong Python and API basics. Missing skills: Docker (DevOps), advanced PostgreSQL optimization, and CI/CD pipeline configuration. These are critical for senior backend roles and deployment readiness.",
  what_to_do_right_now: [
    {
      title: "Complete FastAPI Tutorial",
      duration: "2 weeks",
      description:
        "Build a REST API with authentication and database integration.",
    },
    {
      title: "Learn Docker Basics",
      duration: "3 weeks",
      description:
        "Containerize your FastAPI app - this is the #1 missing skill for your career goals.",
    },
  ],
  steps: [
    {
      step_id: 1,
      title: "Python and SQL Refresh",
      duration: "3 weeks",
      description:
        "Review core Python concepts, data structures, and practical SQL for backend work.",
      resources: [
        "https://docs.python.org/3/tutorial/",
        "https://www.postgresql.org/docs/",
      ],
      targets_missing_skill: false,
    },
    {
      step_id: 2,
      title: "FastAPI and REST Basics",
      duration: "4 weeks",
      description:
        "Build REST APIs using FastAPI, validation, routing, and clean request/response handling.",
      resources: [
        "https://fastapi.tiangolo.com/",
        "https://www.restapitutorial.com/",
      ],
      targets_missing_skill: false,
    },
    {
      step_id: 3,
      title: "Database Design",
      duration: "4 weeks",
      description:
        "Learn PostgreSQL schema design, ORM usage, migrations, and query optimization.",
      resources: [
        "https://www.postgresql.org/docs/",
        "https://www.sqlite.org/index.html",
      ],
      targets_missing_skill: false,
    },
    {
      step_id: 4,
      title: "Docker and Deployment",
      duration: "3 weeks",
      description:
        "Containerize the app, understand images, and deploy a small backend project.",
      resources: ["https://docs.docker.com/", "https://hub.docker.com/"],
      targets_missing_skill: true,
    },
    {
      step_id: 5,
      title: "CI/CD Pipelines",
      duration: "3 weeks",
      description:
        "Automate testing and deployment using GitHub Actions or similar tools.",
      resources: [
        "https://github.com/features/actions",
        "https://martinfowler.com/articles/continuousIntegration.html",
      ],
      targets_missing_skill: true,
    },
    {
      step_id: 6,
      title: "Portfolio Project Build",
      duration: "5 weeks",
      description:
        "Create one strong backend project and one small API project to show practical delivery.",
      resources: ["https://github.com/florinpop17/app-ideas"],
      targets_missing_skill: false,
    },
  ],
};

function updateRoadmapPhaseState(phase) {
  const checkboxes = Array.from(
    phase.querySelectorAll(".roadmap-task-checkbox"),
  );
  const allChecked =
    checkboxes.length > 0 && checkboxes.every((checkbox) => checkbox.checked);
  const statusChip = phase.querySelector(".roadmap-status-chip");
  const defaultStatus = phase.dataset.defaultStatus || "planned";

  phase.classList.toggle("complete", allChecked);

  if (allChecked) {
    phase.classList.remove("current");
  } else if (defaultStatus === "current") {
    phase.classList.add("current");
  } else {
    phase.classList.remove("current");
  }

  checkboxes.forEach((checkbox) => {
    const label = checkbox.closest(".roadmap-task-label");
    if (label) label.classList.toggle("is-checked", checkbox.checked);
  });

  if (statusChip) {
    if (allChecked) {
      statusChip.textContent = "Done";
    } else if (defaultStatus === "current") {
      statusChip.textContent = "In progress";
    } else {
      statusChip.textContent = "Upcoming";
    }
  }
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
  if (!roadmapCustomTaskInput || !roadmapAddTaskBtn || !roadmapCustomTaskList)
    return;

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
    const urlMatch = item.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      const link = document.createElement("a");
      link.className = "chip";
      link.href = urlMatch[1];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.replace(urlMatch[1], "").trim() || urlMatch[1];
      chip.appendChild(link);
    } else {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = item;
      chip.appendChild(button);
    }
    list.appendChild(chip);
  });
  return list;
}

function renderListInto(
  container,
  items = [],
  emptyLabel = "No items available",
) {
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
  skillsModalCopy.textContent =
    gapAnalysis.summary ||
    "The app will show missing skills and next steps here.";

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
  const topCareers = payload.career_fits || payload.top_3_careers || [];
  latestCareerAssessment = payload;

  if (careerOutput) {
    careerOutput.hidden = false;
  }
  const careerContent = document.getElementById("career-content");
  if (careerContent) {
    careerContent.hidden = false;
  }

  // Add user's name to heading if logged in or entered in form
  const user = sessionStorage.getItem("career-counselor-user");
  const userObj = user ? JSON.parse(user) : null;
  const submittedName = latestCareerSubmission?.name;
  const displayName = userObj?.username || submittedName;

  // Update the heading to include name
  const headingEl = careerOutput.querySelector(".response-heading");
  if (headingEl && displayName) {
    headingEl.textContent = `Your Career Matches, ${displayName}`;
  }

  if (!topCareers.length) {
    showInlineError(
      careerError,
      careerErrorText,
      careerRetryBtn,
      "No careers found. Please add your skills and interests in the form, then submit again.",
    );
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
      description.textContent =
        career.reasoning ||
        "Fill in your skills and interests to get personalized career recommendations.";

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
        emptyMsg.textContent =
          "No skills matched yet. Add more skills to your profile.";
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

  // Populate and show skill gaps section from top career match
  if (skillGapsCard && skillGapsContent) {
    const topCareer = topCareers[0];
    const missingSkills = (topCareer.missing_skills || []).filter(Boolean);
    const matchedSkills = (topCareer.matched_skills || []).filter(Boolean);

    if (missingSkills.length > 0) {
      clearNode(skillGapsContent);

      const heading = document.createElement("h4");
      heading.textContent = `Skills gap for: ${topCareer.career_name}`;
      skillGapsContent.appendChild(heading);

      const matchedBlock = document.createElement("div");
      matchedBlock.className = "skill-gap-block";
      const matchedLabel = document.createElement("p");
      matchedLabel.className = "skill-heading matched";
      matchedLabel.textContent = `Skills you have (${matchedSkills.length})`;
      matchedBlock.appendChild(matchedLabel);
      if (matchedSkills.length > 0) {
        matchedBlock.appendChild(createChipList(matchedSkills));
      }
      skillGapsContent.appendChild(matchedBlock);

      const gapsBlock = document.createElement("div");
      gapsBlock.className = "skill-gap-block";
      const gapsLabel = document.createElement("p");
      gapsLabel.className = "skill-heading gaps";
      gapsLabel.textContent = `Skills to learn (${missingSkills.length})`;
      gapsBlock.appendChild(gapsLabel);
      gapsBlock.appendChild(createChipList(missingSkills));
      skillGapsContent.appendChild(gapsBlock);

      skillGapsCard.hidden = false;
    } else {
      skillGapsCard.hidden = true;
    }
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
  article.dataset.defaultStatus = index === 0 ? "current" : "planned";
  if (index === 0) {
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
  statusChip.className = "chip job-type roadmap-status-chip";
  statusChip.textContent = index === 0 ? "In progress" : "Upcoming";

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

  checkbox.addEventListener("change", async function () {
    const stepId = this.dataset.stepId;
    const stepTitle = this.dataset.stepTitle;
    checkboxLabel.classList.toggle("is-checked", this.checked);

    if (!currentSessionId) {
      currentSessionId = localStorage.getItem("career-counselor-session-id");
      if (!currentSessionId) {
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0,
              v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          },
        );
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
      console.log(
        `Step ${stepId} marked ${this.checked ? "complete" : "incomplete"}`,
      );
    } catch (err) {
      console.error("Failed to save progress:", err);
    }

    // Update progress panel in real-time if it's open
    refreshProgressPanel();
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
  latestRoadmapSteps = Array.isArray(payload.steps) ? payload.steps : [];
  const roadmapRequest = latestRoadmapSubmission || {};
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

  if (targetRole)
    targetRole.textContent = payload.career_name || "Backend Developer";
  if (timelineChip) {
    const selectedTimeline = roadmapRequest.timeline
      ? formatTitle(roadmapRequest.timeline)
      : "No timeline selected";
    const weeklyHours = roadmapRequest.timeline
      ? {
          "3months": 20,
          "6months": 12,
          "1year": 8,
          "2years": 5,
          "5years": 3,
        }[roadmapRequest.timeline] || 10
      : null;
    const durationText =
      payload.total_duration || "Roadmap duration not returned";
    timelineChip.textContent = weeklyHours
      ? `${selectedTimeline} · ${weeklyHours} hrs/week · ${durationText}`
      : `${selectedTimeline} · ${durationText}`;
  }
  if (levelChip) {
    levelChip.textContent = `Current: ${formatTitle(payload.current_level || "beginner")}`;
  }

  // Display skill gap summary if available
  if (payload.skill_gap_summary) {
    if (skillGapInsight) skillGapInsight.hidden = false;
    if (skillGapSummaryText)
      skillGapSummaryText.textContent = payload.skill_gap_summary;
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
  if (!skillsModal || !latestCareerAssessment || !latestCareerSubmission)
    return;

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

  const targetCareer = (latestCareerAssessment.top_3_careers ||
    latestCareerAssessment.career_fits ||
    [])[0];
  const analysisPayload = {
    session_id: latestCareerAssessment.session_id || null,
    user_id: getCurrentUserId(),
    target_role:
      targetCareer?.career_name || latestCareerSubmission.career_topic || "",
    skills_data: latestCareerSubmission.skills || [],
    experience: latestCareerSubmission.additional_info || "",
    education: latestCareerSubmission.education_level || "",
  };

  if (!analysisPayload.skills_data.length) {
    if (skillsModalCopy) {
      skillsModalCopy.textContent =
        "Add your current skills in the assessment form first.";
    }
    renderListInto(skillsModalGapList, [], "No analysis available.");
    renderListInto(skillsModalStepList, [], "No recommendations available.");
    return;
  }

  try {
    latestSkillGapAnalysis = await postEndpointData(
      "api/skill-gap-analysis",
      analysisPayload,
    );
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

  // Validate chip constraints before submission
  const interestsContainer = careerForm.querySelector("#interests-chips");
  const skillsContainer = careerForm.querySelector("#skills-chips");
  const industriesContainer = careerForm.querySelector("#industries-chips");

  const interestsValid = validateChipConstraint(interestsContainer);
  const skillsValid = validateChipConstraint(skillsContainer);
  const industriesValid = validateChipConstraint(industriesContainer);

  const invalidFields = [];
  if (!interestsValid) invalidFields.push({ container: interestsContainer, label: "Interests", min: 2, max: 5 });
  if (!skillsValid) invalidFields.push({ container: skillsContainer, label: "Skills", min: 2, max: 5 });
  if (!industriesValid) invalidFields.push({ container: industriesContainer, label: "Industries", min: 1, max: 2 });

  if (invalidFields.length > 0) {
    const first = invalidFields[0];
    const field = first.container.closest(".field");
    const legend = field?.querySelector("legend");

    const existingError = field?.querySelector(".chip-error-msg");
    if (existingError) existingError.remove();

    if (field && legend) {
      const errorMsg = document.createElement("div");
      errorMsg.className = "chip-error-msg";
      errorMsg.textContent = `${first.label}: Select between ${first.min} and ${first.max} options`;
      field.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 5000);
    }

    if (first.container) first.container.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const userData = buildCareerFormData(careerForm);
  latestCareerSubmission = userData;

  const submitFn = async () => {
    if (careerOutput) careerOutput.hidden = false;
    if (careerSpinner) careerSpinner.hidden = false;
    if (careerRecommendationPanel) careerRecommendationPanel.hidden = true;
    if (careerError) careerError.hidden = true;
    if (skillGapsCard) skillGapsCard.hidden = true;
    if (skillGapsContent) skillGapsContent.innerHTML = "";
    const careerContent = document.getElementById("career-content");
    if (careerContent) careerContent.hidden = true;

    // Start loading animation
    if (careerSpinnerInterval) clearInterval(careerSpinnerInterval);
    careerSpinnerInterval = startLoadingText(
      "career-spinner-text",
      careerLoadingTexts,
    );

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
      if (getCurrentUserId()) loadHistory();
    } catch (error) {
      console.error("Career recommendation request failed:", error);
      if (careerSpinner) careerSpinner.hidden = true;
      careerSpinnerInterval = stopLoadingText(careerSpinnerInterval);
      if (careerContent) careerContent.hidden = true;
      let msg =
        "Failed to get recommendations. Make sure the backend is running (localhost:8001) and try again.";
      if (error.message && error.message.includes("503")) {
        msg =
          "AI service temporarily unavailable (rate limited). Try again in a few minutes.";
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
  latestRoadmapSubmission = roadmapData;
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
    roadmapSpinnerInterval = startLoadingText(
      "roadmap-spinner-text",
      roadmapLoadingTexts,
    );

    try {
      // Extract skill gaps from latest career assessment
      let missingSkills = [];
      let currentSkills = [];
      if (
        latestCareerAssessment &&
        latestCareerAssessment.career_fits &&
        latestCareerAssessment.career_fits.length > 0
      ) {
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
      updateLocalAssessmentSession(
        response.session_id || sessionId,
        (entry) => ({
          ...entry,
          roadmap: response,
        }),
      );
      renderRoadmapResponse(response);
      if (getCurrentUserId()) loadHistory();
    } catch (error) {
      console.error("Roadmap request failed:", error);
      if (roadmapSpinner) roadmapSpinner.hidden = true;
      roadmapSpinnerInterval = stopLoadingText(roadmapSpinnerInterval);
      if (roadmapContent) roadmapContent.hidden = true;
      let msg =
        "Failed to generate roadmap. Make sure the backend is running (localhost:8001) and try again.";
      if (error.message && error.message.includes("503")) {
        msg =
          "AI service temporarily unavailable (rate limited). Try again in a few minutes.";
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
    careerForm.querySelector("#education_level").value =
      careerDummyData.education_level;
    careerForm.querySelector("#goals").value = careerDummyData.goals;
    careerForm.querySelector("#location").value = careerDummyData.location;
    careerForm.querySelector("#notes").value = careerDummyData.notes;
    setChipSelections(
      careerForm.querySelector("#interests-chips"),
      careerDummyData.interests,
      careerDummyData.custom_interest,
    );
    setChipSelections(
      careerForm.querySelector("#skills-chips"),
      careerDummyData.skills,
      careerDummyData.custom_skill,
    );
    setChipSelections(
      careerForm.querySelector("#industries-chips"),
      careerDummyData.industries,
      careerDummyData.custom_industry,
    );
    latestCareerSubmission = buildCareerFormData(careerForm);
    currentSessionId = demoCareerOutput.session_id;
    saveDemoCareerHistory();
    if (careerOutput) {
      careerOutput.hidden = false;
      renderCareerRecommendations(demoCareerOutput);
    }
    document.getElementById("career").scrollIntoView({ behavior: "smooth" });
  });
}

const roadmapDemoBtn = document.getElementById("roadmap-demo-btn");
if (roadmapDemoBtn) {
  roadmapDemoBtn.addEventListener("click", () => {
    if (!roadmapForm) return;
    roadmapForm.querySelector("#career_topic").value =
      roadmapDummyData.career_topic;
    roadmapForm.querySelector("#timeline").value = roadmapDummyData.timeline;
    roadmapForm.querySelector("#current_status").value =
      roadmapDummyData.current_status;
    roadmapForm.querySelector("#notes").value = roadmapDummyData.notes;
    latestRoadmapSubmission = buildRoadmapFormData(roadmapForm);
    saveDemoRoadmapHistory();
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
    roadmapForm.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
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
