# Forma AI: AI-Augmented Dynamic Form Engine

## 📖 Overview
Forma AI tackles the challenge of managing massive, branching forms in large organizations like Insurance and Healthcare[cite: 1]. Building these dynamically in React and managing the complex validation state in MongoDB is notoriously difficult, and adding AI to interpret unstructured user input makes it exponentially harder[cite: 1]. This project modernizes legacy data entry by creating a seamless, AI-augmented user experience[cite: 1]. 

## 🚀 Use Case
Instead of filling out dozens of strict dropdowns, users can file complex insurance claims using natural language, such as typing a paragraph about an incident[cite: 1]. The system's backend LLM parses this unstructured text and automatically pre-fills the structured React form fields[cite: 1]. Based on a complex JSON schema stored in MongoDB, the React UI dynamically reveals only the remaining, necessary questions, drastically reducing form friction[cite: 1].

## 💻 Tech Stack & Key Modules
This application utilizes a highly scalable architecture for managing unstructured data and complex business rules[cite: 1]:

*   **Frontend (React & React Hook Form):** A Dynamic Form Renderer capable of generating complex, nested UIs dynamically entirely from a backend JSON schema[cite: 1].
*   **State Management (Redux / Zustand):** Manages the complex, deeply nested state of the form as the user interacts with it[cite: 1].
*   **Backend & AI Pipeline (Node.js & LangChain):** An LLM Extraction API uses an LLM (like GPT-4o or a local model) to parse unstructured user text and map it to the strict JSON schema required by the form[cite: 1].
*   **Database (MongoDB):** A Schema Store stores the rules, validation logic, and branching paths for hundreds of different form types[cite: 1].

## ⚙️ Technical Highlights
*   **Advanced React Patterns:** Heavy use of custom hooks, complex state management, and Dynamic UI generation[cite: 1].
*   **Beyond CRUD:** Utilizes AI pipelines for unstructured data parsing[cite: 1].
*   **Scalable Node.js:** Structures Express APIs using enterprise patterns rather than monolithic, tightly coupled routes[cite: 1].
*   **Complex Data Modeling:** Designs MongoDB schemas that handle deeply nested JSON trees, proving NoSQL mastery[cite: 1].

## Setup

### 1. Navigate to the project root
Wherever you cloned the repo — it should contain `server.js`, `models/`, `routes/`, and `client/` directly.

### 2. Backend setup (first time only, or after adding new dependencies)
*  ** npm install
*  ** Create a `.env` file (see `.env.example`) with real values — MongoDB connection string, `JWT_SECRET`, `GOOGLE_API_KEY`, Gmail SMTP credentials for OTP emails, etc.
*  ** If you're pointing at a local MongoDB instead of Atlas, make sure it's running (Compass, the Windows service, or `mongod` — whichever you set up).

### 3. Seed the demo form (only needed once, or after you change the schema)
*  ** npm run seed:demo
*  ** Should print `Seeded form: claim-demo`.

### 4. Start the backend
*  ** npm run dev
*  ** Watch for `MongoDB connected` and `Forma AI server listening on port 5000`.

### 5. In a second terminal, start the frontend
*  ** cd client
*  ** npm install
*  ** npm run dev
*  ** It'll print a local URL — normally http://localhost:5173.

### 6. Open it
*  ** http://localhost:5173/login → sign up or log in (set `ALLOW_DEV_LOGIN=true` in `.env` for a one-click dev account, skipping OTP verification)
*  ** http://localhost:5173/ → the hub
*  ** http://localhost:5173/forms → all forms, with submissions
*  ** http://localhost:5173/forms/new → build a new form schema
*  ** http://localhost:5173/forms/claim-demo → the seeded demo form, with the Magic Input box and weather/flood branching

## Thank You
