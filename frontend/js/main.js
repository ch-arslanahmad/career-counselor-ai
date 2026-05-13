// main.js - Handles form submission and dynamic content generation

// Dummy Data for Testing

// class for holding form data
class CareerFormData {
  constructor(interests, skills, industries, locations) {
    this.interests = interests;
    this.skills = skills;
    this.industries = industries;
    this.locations = locations;
  }

  skills = [];
  interests = [];
  industries = [];
  locations = [];
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
  // creating a new CareerFormData object with data from the endpoints
  let form_data = new CareerFormData(
    (await getDataFromEndpoint("options/interests")).interests,
    (await getDataFromEndpoint("options/skills")).skills,
    (await getDataFromEndpoint("options/industries")).industries,
    (await getDataFromEndpoint("options/locations")).locations,
  );

  // -- FETCH main form chips containers
  const interestsContainer = document.querySelector("#interests-chips");
  const skillsContainer = document.querySelector("#skills-chips");
  const industriesContainer = document.querySelector("#industries-chips");

  // a dropdown container for locatiosn
  const locationsContainer = document.querySelector("#location");

  loadChips(form_data.interests, interestsContainer);
  loadChips(form_data.skills, skillsContainer);
  loadChips(form_data.industries, industriesContainer);
  loadOptions(form_data.locations, locationsContainer);
}

populateForm(); // call the function to populate the form on page load

// ... make the form input required after i press submit button
// added the form.submitted option, so when button cliked, then adds class to form, which checks for the invalid or not filled fields, and shows the error message if any field is not filled, otherwise submits the form.

// ? only for first form
document
  .querySelector("button[type='submit']")
  .addEventListener("click", () => {
    const form = document.getElementById("career-form");
    form.classList.add("submitted");
  });

// all forms
document.querySelectorAll("button[type='submit']").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest("form");
    form.classList.add("submitted");
  });
});

// ... make the chip buttons clickable.

// () => means an arrow function, called an anonymous function, used with event handler
document.querySelectorAll(".chips").forEach((container) => {
  container.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");

    if (!chip) return;

    chip.classList.toggle("selected");

    // if its others add text input
    if (chip.value == "others") {
      const wrapper = chip
        .closest(".field")
        .querySelector(".chip-input-wrapper");
      if (wrapper) {
        const isVisible = wrapper.classList.toggle("visible");

        wrapper.querySelector("input").required = isVisible; // make the input required if visible, otherwise not required
      }
    }
  });
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

testEndpoint("options/skills");
