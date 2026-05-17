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
const careerAutofillBtn = document.getElementById("career-autofill-btn");
const roadmapAutofillBtn = document.getElementById("roadmap-autofill-btn");
const roadmapCustomTaskInput = document.getElementById("roadmap-custom-task-input");
const roadmapAddTaskBtn = document.getElementById("roadmap-add-task-btn");
const roadmapCustomTaskList = document.getElementById("roadmap-custom-task-list");
const careerOutput = document.getElementById("career-output");
const roadmapOutput = document.getElementById("roadmap-output");
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
    chip.className = "chip";
    chip.textContent = item;
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
    ? `Skill Gap Overview: ${payload.career_name}`
    : "Skill Gap Overview";
  skillsModalTitle.textContent = title;
  skillsModalCopy.textContent = gapAnalysis.summary || "Skill-gap details will appear here.";

  renderListInto(
    skillsModalGapList,
    gapAnalysis.missing_skills || [],
    "No obvious skill gaps detected.",
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

  if (!topCareers.length) {
    showInlineError(careerError, careerErrorText, careerRetryBtn, "No career matches found. Try different interests or skills.");
    return;
  }

  if (careerRecommendationPanel) {
    clearNode(careerRecommendationPanel);

    topCareers.forEach((career, index) => {
      const card = document.createElement("div");
      card.className = "card";

      const match = document.createElement("div");
      match.className = "match chip";
      match.textContent = `${career.fit_score}% Match`;

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
      description.textContent = career.reasoning;

      const skillsBlock = document.createElement("div");
      skillsBlock.className = "required-skills";

      const skillsHeading = document.createElement("h5");
      skillsHeading.textContent = "Skill gaps";

      const skillsList = createChipList([
        ...(career.missing_skills || []),
      ].filter(Boolean));

      const roadmapBtn = document.createElement("button");
      roadmapBtn.type = "button";
      roadmapBtn.className = "create-roadmap-btn";
      roadmapBtn.dataset.careerTitle = career.career_name;
      roadmapBtn.textContent = "Create Roadmap";

      skillsBlock.appendChild(skillsHeading);
      skillsBlock.appendChild(skillsList);

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
    const topCareer = topCareers[0];
    skillGapsCard.hidden = false;
    if (skillGapsContent) {
      skillGapsContent.innerHTML = "";

      if (topCareer) {
        const heading = document.createElement("h3");
        heading.textContent = `Precision Match: ${topCareer.career_name}`;

        const paragraph = document.createElement("p");
        paragraph.textContent = topCareer.reasoning;

        const chipList = createChipList(topCareer.missing_skills || []);

        skillGapsContent.appendChild(heading);
        skillGapsContent.appendChild(paragraph);
        skillGapsContent.appendChild(chipList);
      }
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

  const resourcesBlock = document.createElement("div");
  resourcesBlock.className = "required-skills";

  const resourcesHeading = document.createElement("h5");
  resourcesHeading.textContent = "Resources";

  const resources = createChipList(step.resources || []);
  resourcesBlock.appendChild(resourcesHeading);
  resourcesBlock.appendChild(resources);

  content.appendChild(head);
  content.appendChild(description);
  content.appendChild(resourcesBlock);

  article.appendChild(marker);
  article.appendChild(content);
  return article;
}

function renderRoadmapResponse(payload) {
  const targetRole = document.getElementById("roadmap-target-role");
  const timelineChip = document.getElementById("roadmap-timeline-chip");
  const levelChip = document.getElementById("roadmap-level-chip");
  const immediateSteps = document.getElementById("roadmap-immediate-steps");
  const roadmapSteps = document.getElementById("roadmap-steps");
  const roadmapOutput = document.getElementById("roadmap-output");

  if (roadmapOutput) {
    roadmapOutput.classList.remove("hidden");
  }

  if (targetRole) targetRole.textContent = payload.career_name || "Backend Developer";
  if (timelineChip) timelineChip.textContent = payload.total_duration || "12 months";
  if (levelChip) {
    levelChip.textContent = `Current: ${formatTitle(payload.current_level || "beginner")}`;
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
    skillsModalCopy.textContent = "Loading skill-gap analysis...";
  }
  renderListInto(skillsModalGapList, [], "Loading...");
  renderListInto(skillsModalStepList, [], "Loading...");

  const targetCareer = (latestCareerAssessment.top_3_careers || latestCareerAssessment.career_fits || [])[0];
  const analysisPayload = {
    session_id: latestCareerAssessment.session_id || null,
    target_role: targetCareer?.career_name || latestCareerSubmission.career_topic || "",
    skills_data: latestCareerSubmission.skills || [],
    experience: latestCareerSubmission.additional_info || "",
    education: latestCareerSubmission.education_level || "",
  };

  try {
    latestSkillGapAnalysis = await postEndpointData("api/skill-gap-analysis", analysisPayload);
    renderSkillGapModal(latestSkillGapAnalysis);
  } catch (error) {
    console.error("Skill gap analysis request failed:", error);
    if (skillsModalCopy) {
      skillsModalCopy.textContent = "Skill-gap analysis failed to load.";
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

    try {
      const response = await postEndpointData("api/assess", {
        interests: userData.interests,
        skills: userData.skills,
        education_level: userData.education_level,
        career_goals: userData.career_goals ? [userData.career_goals] : [],
        location: userData.country,
        notes: userData.additional_info,
      });

      localStorage.setItem("career-counselor-session-id", response.session_id);
      if (careerSpinner) careerSpinner.hidden = true;
      renderCareerRecommendations(response);
    } catch (error) {
      console.error("Career recommendation request failed:", error);
      if (careerSpinner) careerSpinner.hidden = true;
      showInlineError(careerError, careerErrorText, careerRetryBtn, "Failed to get recommendations. Make sure the backend is running (localhost:8001) and try again.");
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

    try {
      const response = await postEndpointData("api/roadmap", {
        session_id: sessionId,
        career_topic: roadmapData.career_topic,
        timeline_hours_per_week: timelineHoursMap[roadmapData.timeline] || 10,
        current_level: roadmapData.current_status,
      });

      if (roadmapSpinner) roadmapSpinner.hidden = true;
      renderRoadmapResponse(response);
    } catch (error) {
      console.error("Roadmap request failed:", error);
      if (roadmapSpinner) roadmapSpinner.hidden = true;
      showInlineError(roadmapError, roadmapErrorText, roadmapRetryBtn, "Failed to generate roadmap. Make sure the backend is running (localhost:8001) and try again.");
    }
  };

  pendingRoadmapSubmit = submitFn;
  await submitFn();
});

careerAutofillBtn.addEventListener("click", () => {
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
});

roadmapAutofillBtn.addEventListener("click", () => {
  if (!roadmapForm) return;

  roadmapForm.querySelector("#career_topic").value =
    roadmapDummyData.career_topic;
  roadmapForm.querySelector("#timeline").value = roadmapDummyData.timeline;
  roadmapForm.querySelector("#current_status").value =
    roadmapDummyData.current_status;
  roadmapForm.querySelector("#notes").value = roadmapDummyData.notes;
});

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
