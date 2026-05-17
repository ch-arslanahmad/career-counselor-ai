# React Learning Guide - 2 Week Plan

**Goal:** Learn enough React to build the Career Counselor AI MVP forms and integrate with backend API.

**Your Background:** HTML, Basic CSS, Basic JS/DOM, Java/C++/Python

---

## Week 1: React Fundamentals

### Day 1-2: Setup + JSX
**Concepts:**
- Node.js/NPM installation
- Create React app (Vite - faster than CRA)
- JSX = HTML in JS (looks like HTML, but written in JS functions)

**What to do:**
```bash
npm create vite@latest career-counselor-frontend -- --template react
cd career-counselor-frontend
npm install
npm run dev
```

**Key Learning:** JSX is just JS that looks like HTML:
```jsx
// This is JSX (in a React component)
function App() {
  return <h1>Hello World</h1>;  // Looks like HTML, but it's JS
}
```

**Resources:**
- [React Official Tutorial - Intro](https://react.dev/learn)
- Vite Guide: https://vitejs.dev/guide/

---

### Day 3-4: Components + Props
**Concepts:**
- Components = reusable UI pieces (like functions in Java/Python)
- Props = data passed to components (like function arguments)

**Example:**
```jsx
// Component (like a function)
function Button(props) {
  return <button>{props.label}</button>;  // props.label is like props['label']
}

// Usage
<Button label="Submit" />
```

**Your Java analogy:**
- Component ≈ Java method
- Props ≈ method parameters

**Resources:**
- [React Docs - Components](https://react.dev/learn/your-first-component)
- [React Docs - Props](https://react.dev/learn/passing-props-to-a-component)

---

### Day 5-7: State (useState) + Event Handling
**Concepts:**
- `useState` = variable that re-renders UI when changed (like a reactive variable)
- Events = onClick, onChange (similar to HTML event handlers, but camelCase)

**Example:**
```jsx
import { useState } from 'react';

function Form() {
  const [interests, setInterests] = useState('');  // Initialize with empty string

  return (
    <input 
      value={interests}
      onChange={(e) => setInterests(e.target.value)}  // Update state on change
    />
  );
}
```

**Your Python analogy:**
```python
# Python
interests = ""
def on_change(value):
    global interests
    interests = value

# React (JSX)
const [interests, setInterests] = useState("")
onChange={(e) => setInterests(e.target.value)}
```

**Resources:**
- [React Docs - State](https://react.dev/learn/state-a-components-memory)
- [React Docs - Events](https://react.dev/learn/responding-to-events)

---

## Week 2: Build MVP Forms + API Integration

### Day 8-9: Forms in React
**Concepts:**
- Controlled components (form inputs tied to state)
- Form submission (prevent default HTML behavior)
- Multiple form fields

**Build:** Career Recommendation Form (from your HTML file, but in React)
```jsx
function CareerForm() {
  const [formData, setFormData] = useState({
    interests: '',
    background: '',
    educationLevel: '',
    goals: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);  // Send to backend later
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Interests"
        value={formData.interests}
        onChange={(e) => setFormData({...formData, interests: e.target.value})}
      />
      {/* Add other fields similarly */}
      <button type="submit">Get Recommendations</button>
    </form>
  );
}
```

**Resources:**
- [React Docs - Forms](https://react.dev/learn/managing-state)
- Your existing `career-recommendation.html` as reference

---

### Day 10-11: CSS Modules (Styling)
**Concepts:**
- CSS Modules = regular CSS, but scoped to component (no conflicts)
- File naming: `Component.module.css`

**Example:**
```css
/* Button.module.css */
.btn {
  background: blue;
  color: white;
}
```

```jsx
import styles from './Button.module.css';

function Button() {
  return <button className={styles.btn}>Click</button>;
}
```

**Why CSS Modules:** Keeps your CSS knowledge, adds scoping (`.btn` in one file won't conflict with `.btn` in another).

**Resources:**
- [CSS Modules Guide](https://github.com/css-modules/css-modules)
- Vite CSS Modules: https://vitejs.dev/guide/features.html#css-modules

---

### Day 12-13: API Calls (fetch/axios)
**Concepts:**
- `fetch` API (built-in JS, no library needed)
- `useEffect` (run code on component mount/update)
- Async/await (like in Python)

**Example:**
```jsx
import { useState, useEffect } from 'react';

function App() {
  const [recommendations, setRecommendations] = useState(null);

  const submitForm = async (formData) => {
    const response = await fetch('http://localhost:8000/api/recommendations/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    setRecommendations(data);
  };
}
```

**Your Python analogy:**
```python
# Python
import requests
response = requests.post(url, json=formData)
data = response.json()

# React (JS)
const response = await fetch(url, { method: 'POST', body: JSON.stringify(formData) });
const data = await response.json();
```

**Resources:**
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Docs - Effects](https://react.dev/learn/synchronizing-with-effects)

---

### Day 14: Integration + Review
**Tasks:**
1. Build all 3 MVP forms in React (Career Recommendation, Interest Finding, Roadmap Generation)
2. Style with CSS Modules
3. Connect to dummy backend API (from `backend/dummy_data.py`)
4. Test form submissions

**Deliverable:** Working React frontend with forms that call backend API.

---

## Why React? (From project analysis)

1. **ARCHITECTURE.md specifies React** - Your own tech stack document lists React. Following your own docs keeps team aligned.

2. **Forms need state management** - Career recommendation has multiple inputs with dynamic interactions. React's `useState` handles this cleanly vs vanilla JS DOM manipulation.

3. **Future chat UI** - VISION.md specifies "Chat-style UI (PoC onwards)". React scales from forms → chat. Static HTML would need complete rewrite.

4. **Team collaboration** - Multiple devs can work on separate React components without conflicts. HTML/JS files become messy with multiple contributors.

5. **Industry standard** - For interactive web apps with this complexity, React is the norm. Learning it adds to your skillset.

6. **Component reusability** - Response cards (recommendation, roadmap, subject list) can be reused across different views.

---

## Quick Reference: Your Skills → React

| What you know | React equivalent |
|--------------|-----------------|
| HTML element | JSX element (same syntax, in JS) |
| HTML attribute | JSX prop (camelCase: `onClick` vs `onclick`) |
| DOM manipulation (`document.getElementById`) | State + props (declarative) |
| Event listener (`element.addEventListener`) | JSX event (`onClick={handler}`) |
| CSS file | CSS Module file (same CSS, different import) |
| Python/Java function | React component (function that returns UI) |
| Python dict/JS object | React state object |

---

## If You Get Stuck

1. **React DevTools** - Browser extension to inspect React components
2. **MDN Web Docs** - For JS/HTML/CSS references
3. **React Docs** - https://react.dev/learn (best resource)
4. **Your existing HTML** - Use `career-recommendation.html` as reference for what to build

---

## MVP Success Criteria (End of Week 2)

- [ ] 3 React forms built (Career, Interest, Roadmap)
- [ ] Forms styled with CSS Modules
- [ ] Form data submitted to backend API (dummy)
- [ ] Response displayed in UI (basic)
- [ ] Code pushed to team repo

**You can do this in 2 weeks.** Your programming background (Java/Python/C++) transfers directly to React concepts.
