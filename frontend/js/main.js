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

// class for holding User Input for Career Form, CareerFormInput

const interests = [
  "Technology",
  "Business",
  "Arts",
  "Science",
  "Health",
  "Education",
];
const skills = [
  "Programming",
  "Data Analysis",
  "Project Management",
  "Design",
  "Writing",
  "Research",
];
const industries = [
  "Tech",
  "Finance",
  "Healthcare",
  "Education",
  "Entertainment",
];
const locations = [
  "USA",
  "Canada",
  "UK",
  "Germany",
  "Australia",
  "Pakistan",
  "India",
  "China",
];

let form_data = new CareerFormData(interests, skills, industries, locations);

const interestsContainer = document.getElementById("interests-chips");
const skillsContainer = document.getElementById("skills-chips");
const industriesContainer = document.getElementById("industries-chips");
const locationsContainer = document.getElementById("locations-chips");

loadChips(form_data.interests, interestsContainer);
loadChips(form_data.skills, skillsContainer);
loadChips(form_data.industries, industriesContainer);
loadChips(form_data.locations, locationsContainer);

function loadChips(array, container) {
  // create new chips based on the array of options

  array.forEach((item) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.value = item;
    chip.innerText = item;
    container.appendChild(chip);
  });

  let html = `<label for="${container.id}">${container.previousElementSibling.innerText} <span class="required">*</span></label><div class="chips">`;

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
}
