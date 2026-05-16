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

async function getEndpointData(endpoint) {
  const res = await fetch(`http://localhost:8001/${endpoint}`);
  return await res.json();
}

const getDataFromEndpoint = async (endpoint) => {
  const data = await getEndpointData(endpoint);
  return data;
};

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

careerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  careerForm.classList.add("submitted");

  const userData = buildCareerFormData(careerForm);
  console.log("Career form input:", userData);
});

roadmapForm.addEventListener("submit", (e) => {
  e.preventDefault();
  roadmapForm.classList.add("submitted");

  const roadmapData = buildRoadmapFormData(roadmapForm);
  console.log("Roadmap form input:", roadmapData);
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

// Create Recommendation Card HTML
function createRecommendationCard(rec) {
  return `
    <div class="card">
      <h4>${rec.title}</h4>
      <p>${rec.description}</p>
      <p><strong>Why this fits you:</strong> ${rec.reasoning}</p>
      <span class="match-score">${rec.matchScore} Match</span>
    </div>
  `;
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
