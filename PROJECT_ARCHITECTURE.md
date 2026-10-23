# Project Architecture & Viva Guide
## Smart Integrated Healthcare Response & Emergency System

**Course:** Full Stack Development (F0002) · Symbiosis International (Deemed University)  
**Project Base:** EmergencyDispatchApp (Java, MySQL, MongoDB, Express, React, Tomcat)

---

## 1. System Architecture Diagram

```text
               ┌─────────────────────────────────────────────────────────────┐
               │                 USER OPERATIONAL INTERFACES                 │
               ├──────────────────────────────┬──────────────────────────────┤
               │   React SPA (client/)        │   Tomcat Monitor (JSP)       │
               │   • Apple Design System      │   • Apache Tomcat 10         │
               │   • Direct Manipulation UI   │   • Java Servlet (/status)   │
               │   • Live Operations Console  │   • Port 8080                │
               └──────────────┬───────────────┴──────────────┬───────────────┘
                              │ REST (JSON)                  │ JDBC
                              ▼                              ▼
               ┌──────────────────────────────┐              │
               │   Unified Node.js / Express  │              │
               │   API Server (server/)       │              │
               │   • Port 5000                │              │
               │   • JWT Auth & Bcrypt        │              │
               │   • RegExp & XSS Sanitizer   │              │
               │   • Multer File Uploads      │              │
               │   • Nodemailer Email Alerts  │              │
               └──────┬────────────────┬──────┘              │
                      │                │                     │
          MySQL (mysql2)│                │ Mongoose            │
                      ▼                ▼                     │
       ┌─────────────────────┐  ┌─────────────────────┐      │
       │   MySQL Database    │  │  MongoDB Database   │      │
       │ (emergency_dispatch)│  │ (emergency_dispatch_│      │
       │                     │  │     supplementary)  │      │
       │ • Incidents         │  │ • Incident Notes    │      │
       │ • Dispatch Log      │  │ • 1:1 Summaries     │      │
       │ • Ambulances Fleet  │  │ • Dynamic Tags(M:N) │      │
       │ • Responders        │  │ • File Attachments  │      │
       │ • Hospitals & Zones │  │ • User Credentials  │      │
       │ • SQL Triggers      │  │ • Compound Indexes  │      │
       │ • Stored Vitals     │  │ • Aggregation Pipe  │      │
       └──────────▲──────────┘  └─────────────────────┘      │
                  │                                          │
                  └───────────────────┬──────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               │         ORIGINAL DBMS CORE (Preserved)      │
               │  • EmergencyDispatchApp.java (Interactive)  │
               │  • ApiServer.java (JDK Http built-in)       │
               │  • JDBC Connection Pool                     │
               └─────────────────────────────────────────────┘
```

---

## 2. Technology Responsibilities

| Technology | Role & Clear Single Responsibility | Why It Was Chosen |
| :--- | :--- | :--- |
| **React (Vite)** | Operational front-end dashboard and reusable reactive components. | Instant state synchronization, component reuse, fast feedback. |
| **Apple Design Skill** | Visual design system, tactile response, optical typography, translucency. | Eliminates latency, gives operational clarity to high-stress emergency workflows. |
| **Node.js & Express** | Unified REST API server, authentication, security sanitization, and routing. | Non-blocking I/O, native JSON manipulation, fits FSD syllabus Units 3 & 6. |
| **MySQL 8.0** | **Authoritative Relational Records**: Incidents, Dispatches, Ambulances, Hospitals. | ACID guarantees, foreign key integrity, automated audit triggers. |
| **MongoDB 8.0** | **Supplementary Unstructured Data**: Clinical notes, tags, attachments metadata. | Flexible schema, embedded 1:1 subdocuments, M:N tags, fast aggregation pipelines. |
| **Java & JDBC** | Preserved original DBMS core application and command-line operations. | Demonstrates strong object-oriented design and raw JDBC relational access. |
| **Apache Tomcat 10** | Java Web Module (Servlet + JSP) for real-time bed and fleet monitoring. | Demonstrates enterprise Java EE / Jakarta EE deployment in local container. |
| **Git & Jenkins** | Version control with branching and Declarative CI/CD pipeline. | Automated testing, linting, frontend building, and deployment verification. |
| **Render** | Cloud hosting blueprint configuration (`render.yaml`). | Automated cloud deployment for Node.js backend and React SPA. |

---

## 3. Data Flow & Database Ownership

A strict boundary prevents data duplication:

1. **MySQL owns authoritative emergency lifecycle data**:
   - `incidents`: Every call intake, location, severity, caller data, and resolution timestamp.
   - `dispatch_log`: Formal records of ambulance assignments, departure/arrival timestamps, and auto-calculated response time.
   - `ambulances`: Fleet inventory, status (`Available`, `Dispatched`, `En Route`, `At Scene`), GPS telemetry.
   - `responders`: Paramedics, EMTs, and Doctors on duty.
   - `audit_log`: Automatic change tracking fired by MySQL triggers (`trg_incidents_insert`, etc.).

2. **MongoDB owns supplementary, variable, and high-frequency data**:
   - `IncidentNote`: Free-form clinical observations, field triage notes, paramedic updates.
   - `1:1 Embedded Subdocument`: `dispatchSummary` inside `IncidentNote`.
   - `Tag` (Many-to-Many): Dynamic tags (`#Cardiac`, `#Trauma`, `#MCI`) aggregated across multiple incidents.
   - `IncidentAttachment`: File metadata for uploaded scene photographs and ECG printouts.
   - `User`: Operator authentication credentials and roles with bcrypt hashes.

---

## 4. Complete End-to-End Emergency Workflow

```text
Step 1: Emergency Call Intake
  └─ Dispatcher enters incident details in React Modal / Form
  └─ Frontend runs native HTML5 + RegExp validation & XSS sanitization
  └─ Node.js Express server inserts record into MySQL `incidents` table
  └─ MySQL Trigger `trg_incidents_insert` automatically writes to `audit_log`

Step 2: Fleet Assignment & Dispatch
  └─ Dispatcher reviews available ambulances in the zone
  └─ Dispatches unit via POST /api/dispatch (or Quick Dispatch)
  └─ MySQL transaction:
       • Inserts into `dispatch_log`
       • Updates ambulance status to 'Dispatched'
       • Updates responder status to 'On Duty'
       • Updates incident status to 'Dispatched'

Step 3: Real-Time Lifecycle Progression
  └─ Paramedic unit advances status: Dispatched → En Route → At Scene → Completed
  └─ MySQL calculates `response_time_min` automatically via GENERATED ALWAYS column

Step 4: Supplementary Field Documentation (MongoDB)
  └─ Paramedic adds clinical notes and tags (`#Cardiac`, `#Shock-Delivered`)
  └─ Optional: Scene photograph uploaded via Multer to /api/upload
  └─ MongoDB stores note with embedded 1:1 dispatch summary and updates M:N tags

Step 5: Automated Hospital Notification
  └─ System triggers Nodemailer alert to receiving hospital trauma command
  └─ Hospital bed monitor on Apache Tomcat (JSP) updates in real time
```

---

## 5. Full Stack Development Syllabus Coverage Matrix

| Unit | Syllabus Requirement | Exact File Implementation | Verification / Test |
| :--- | :--- | :--- | :--- |
| **Unit 1** | HTML5 document structure, semantic tags (`<header>`, `<section>`, `<article>`, `<footer>`) | `client/src/App.jsx`<br>`demos/unit1-semantic-form.html` | Open `demos/unit1-semantic-form.html` in browser |
| **Unit 1** | Native form validation (`required`, `pattern`, `minlength`, `type="tel"`) | `client/src/App.jsx` (New Incident Form)<br>`demos/unit1-semantic-form.html` | Tested in `tests/api.test.js` |
| **Unit 2** | CSS Selectors, Box Model (margin, padding, border) | `client/src/index.css`<br>`demos/unit2-styles.css` | Open `demos/unit2-responsive-layout.html` |
| **Unit 2** | Flexbox and CSS Grid layout | `client/src/App.jsx` (KPI grid, operations layout)<br>`demos/unit2-responsive-layout.html` | Rendered layout inspection |
| **Unit 2** | Responsive design & media queries (mobile-first) | `client/src/index.css` (`@media (max-width: 768px)`)<br>`demos/unit2-styles.css` | DevTools mobile viewport test |
| **Unit 3** | Advanced JS, RegExp validation, DOM Security (preventing script injection) | `server/server.js` (`sanitize()`)<br>`demos/unit3-js-security.html`<br>`demos/unit3-sanitizer.js` | Test #7 in `npm test` (`tests/api.test.js`) |
| **Unit 3** | Node.js core modules & HTTP module | `demos/unit3-node-http.js` | `node demos/unit3-node-http.js` |
| **Unit 3** | Node.js File System, URL module & Events (`EventEmitter`) | `demos/unit3-node-fs-events.js` | `node demos/unit3-node-fs-events.js` |
| **Unit 3** | File Uploads (Multer) | `server/server.js` (`POST /api/upload`)<br>`demos/unit3-file-upload.js` | `node demos/unit3-file-upload.js` |
| **Unit 3** | Automated Email Sending (Nodemailer) | `server/server.js` (`POST /api/alerts/email`)<br>`demos/unit3-email-automation.js` | `node demos/unit3-email-automation.js` (Ethereal preview) |
| **Unit 3** | Node.js Debugger | `demos/unit3-debugger-demo.js` | `node inspect demos/unit3-debugger-demo.js` |
| **Unit 4** | MongoDB Setup, CRUD Operations (Create, Read, Update, Delete) | `server/db/mongo.js`<br>`demos/unit4-mongo-crud.js` | `node demos/unit4-mongo-crud.js` |
| **Unit 4** | Advanced Modeling: One-to-One and Many-to-Many in NoSQL | `server/server.js` (`/api/relationships/demo`)<br>`demos/unit4-mongo-relationships.js` | `node demos/unit4-mongo-relationships.js` |
| **Unit 4** | MongoDB Aggregation Pipeline (`$match`, `$group`, `$sort`, `$project`) & Indexes | `server/server.js` (`/api/tags/summary`)<br>`demos/unit4-mongo-aggregation.js` | Test #8 in `npm test` |
| **Unit 4** | MongoDB Atlas, Storage & Replication Concepts | `demos/unit4-mongo-atlas-setup.md` | Theoretical and configuration guide |
| **Unit 5** | Git Version Control (Master branch & feature branching) | Git repository initialized in project root | `git status`, `git branch` |
| **Unit 5** | Jenkins Automated Declarative Pipeline | `Jenkinsfile` (6 stages: Checkout, Install, Test, Build, Package, Smoke) | Declarative CI/CD pipeline file |
| **Unit 5** | Apache Tomcat 10 Deployment (Java Servlet & JSP) | `tomcat-module/src/EmergencyStatusServlet.java`<br>`tomcat-module/web/index.jsp`<br>`tomcat-module/build.sh` | Deployed live: `http://localhost:8080/assignment30/emergency-status.jsp` |
| **Unit 6** | Basic Authentication: Login/Registration Flow, Password Hashing | `server/server.js` (`/api/auth/*` with bcryptjs & JWT)<br>`client/src/App.jsx` (Auth modal) | Test #6 in `npm test` |
| **Unit 6** | Environment Variables & Secrets Management | `.env.example`, `server/db/mysql.js`, `server/db/mongo.js` | Checked via `.env.example` |
| **Unit 6** | Deployment Preparation for Render | `render.yaml` (Build & Start commands, env vars) | Validated `render.yaml` specification |
| **Testing** | Postman API Collection | `tests/emergency-dispatch.postman_collection.json` | Ready for import into Postman |
| **Testing** | Automated Integration Test Suite | `tests/api.test.js` (Native `node:test`) | `npm test` (All 8 tests passing) |

---

## 6. How to Run Every Component

### 1. Run the Unified Full-Stack Application (Recommended)
```bash
# In project root: /home/sarthakbitbybit/Downloads/PROJECT/DBMS/dbms
npm install
npm run build      # Builds Apple-designed React SPA into client/dist/
npm start          # Starts Node.js Express server on http://localhost:5000
```
Open your browser to: **`http://localhost:5000`**

### 2. Run React Frontend in Vite Development Mode
```bash
cd client
npm install
npm run dev        # Starts Vite dev server on http://localhost:5173
```

### 3. Run Automated Tests
```bash
npm test           # Executes all 8 automated tests in tests/api.test.js
```

### 4. Run Apache Tomcat Web Module
```bash
# Build WAR and deploy to local running Tomcat 10:
./tomcat-module/build.sh
```
Open your browser to: **`http://localhost:8080/assignment30/emergency-status.jsp`**

### 5. Run Original Java Applications (Preserved)
```bash
# Interactive Console Application:
java -cp ".:lib/mysql-connector-j-9.6.0.jar" EmergencyDispatchApp

# Original JDK API Server:
java -cp ".:lib/mysql-connector-j-9.6.0.jar" ApiServer
```

### 6. Run Syllabus Demos Individually
```bash
node demos/unit3-node-http.js
node demos/unit3-node-fs-events.js
node demos/unit3-email-automation.js
node demos/unit4-mongo-crud.js
node demos/unit4-mongo-relationships.js
node demos/unit4-mongo-aggregation.js
```

---

## 7. University Viva Voce Preparation Guide (High-Yield Q&A)

### Q1: Why did you use both MySQL and MongoDB in the same project?
> **Answer:** "In an emergency response system, data has two distinct operational profiles:
> 1. **Structured, mission-critical transactions (MySQL):** Incidents, ambulance dispatches, and hospital beds require strict relational schemas, ACID transactions, foreign keys, and database triggers for legal audit compliance.
> 2. **Flexible, semi-structured field telemetry (MongoDB):** Paramedic observations, dynamic clinical tags (`#Cardiac`, `#MCI`), file attachment metadata, and dispatch summaries change format in the field. MongoDB's document model allows embedded 1:1 subdocuments, fast M:N tag referencing, and multi-stage aggregation pipelines without schema migrations."

### Q2: How does your frontend adhere to Apple Design principles?
> **Answer:** "We implemented key principles from Apple WWDC design talks:
> - **Response & Zero Latency:** Instant feedback on press using `:active { transform: scale(0.97); }` without waiting for click release.
> - **Translucency & Materials:** Chrome headers and cards use `backdrop-filter: blur(24px) saturate(190%)` with top light-catching borders (`border-top: 1px solid rgba(255,255,255,0.16)`) to convey physical hierarchy.
> - **Optical Typography:** Heading letter-spacing is tightened (`-0.025em`) to prevent letters drifting apart, while micro-labels have positive tracking (`+0.03em`) for legibility.
> - **Restrained Semantic Palette:** Apple System Red (`#FF453A`) for P1 Critical, System Orange (`#FF9F0A`) for High/En Route, System Green (`#30D158`) for Available/Resolved, and System Blue (`#0A84FF`) for actions."

### Q3: How do you defend against Cross-Site Scripting (XSS)?
> **Answer:** "We implement defense-in-depth:
> 1. **Backend Sanitization (`server/server.js`):** A custom sanitizer strips `<script>` tags and HTML-encodes angle brackets (`<` to `&lt;`) before values reach the database.
> 2. **React Secure Rendering:** React automatically escapes string values embedded in JSX `{expression}`, preventing raw script execution.
> 3. **Validation (`RegExp`):** Strict regular expressions ensure telephone numbers, emails, and usernames only contain safe characters."

### Q4: Explain the difference between Apache Tomcat and Node.js in this project.
> **Answer:** "Node.js uses a single-threaded, asynchronous event loop powered by libuv, making it optimal for lightweight, high-concurrency JSON REST APIs, WebSocket streaming, and file uploads.
> Apache Tomcat is a multithreaded Java Servlet container implementing the Jakarta EE specification. In our project, Tomcat runs `EmergencyStatusServlet.java` and `index.jsp` to serve emergency status reports directly to enterprise hospital workstations over port 8080."

### Q5: How is response time calculated in the database?
> **Answer:** "MySQL uses a **Stored Generated Column**:
> `response_time_min DECIMAL(6,2) GENERATED ALWAYS AS (TIMESTAMPDIFF(SECOND, dispatched_at, arrived_scene_at) / 60.0) STORED`
> Whenever arrival timestamp is updated, MySQL calculates the response time in seconds and converts it to minutes automatically at the storage engine level."

### Q6: What does your MongoDB Aggregation Pipeline do?
> **Answer:** "In `/api/tags/summary` and `demos/unit4-mongo-aggregation.js`, we demonstrate four stages:
> 1. `$unwind`: Deconstructs the array of tags in each note into separate documents.
> 2. `$group`: Groups by tag name, calculates `$sum: 1` occurrences, and finds `$max: createdAt`.
> 3. `$sort`: Ranks tags from highest to lowest frequency.
> 4. `$project`: Reshapes the output into clean JSON for the frontend dashboard."

### Q7: How does authentication and protected routing work?
> **Answer:** "When an operator registers or logs in, their password is salted and hashed using `bcryptjs` (cost factor 10). Upon successful login, the server signs a JSON Web Token (JWT) containing the user's ID, username, and role, expiring in 24 hours. The React client stores this token and sends it in the `Authorization: Bearer <token>` header, which Express validates before allowing access to protected endpoints like `/api/auth/me`."

### Q8: What stages are in your Jenkinsfile?
> **Answer:** "Our declarative pipeline contains 6 stages:
> 1. **Checkout:** Checks out Git repository and logs environment versions.
> 2. **Install Dependencies:** Installs npm packages cleanly.
> 3. **Run Automated Tests:** Executes `npm test` verifying API endpoints, auth, and XSS sanitization.
> 4. **Build React Frontend:** Runs Vite production bundle compilation to `client/dist/`.
> 5. **Package Tomcat Module:** Compiles the Java Servlet and packages `emergency-dispatch.war`.
> 6. **Smoke Test:** Sends curl request to verify local running services are healthy."
