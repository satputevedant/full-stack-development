# Comprehensive Viva & Technical Examination Preparation Guide
## Smart Integrated Healthcare Response & Emergency System (EmergencyDispatchApp)

**Academic Affiliation:** Symbiosis Institute of Technology (SIT) · Symbiosis International (Deemed University), Pune  
**Relevant Syllabi:**
1. **Programming with Java Lab Manual (SEM-III · Course Outcomes CO1 to CO5 · Assignments 1–30)**
2. **Full Stack Development Syllabus (Course Code: F0002 · Units 1 to 6 · Course Outcomes CO1 to CO5)**

---

# TABLE OF CONTENTS

- [System High-Level Architecture](#system-high-level-architecture)
- [PART 1: JAVA & ENTERPRISE BACKEND PREPARATION](#part-1-java--enterprise-backend-preparation)
  - [1.1 Java Lab Manual Syllabus Mapping Matrix (Assignments 1–30)](#11-java-lab-manual-syllabus-mapping-matrix-assignments-130)
  - [1.2 Project Java Architecture & Class Diagram](#12-project-java-architecture--class-diagram)
  - [1.3 Line-by-Line Code Breakdown: `EmergencyDispatchApp.java`](#13-line-by-line-code-breakdown-emergencydispatchappjava)
  - [1.4 Line-by-Line Code Breakdown: `ApiServer.java`](#14-line-by-line-code-breakdown-apiserverjava)
  - [1.5 Line-by-Line Code Breakdown: `EmergencyStatusServlet.java` (Tomcat 10 / Jakarta EE)](#15-line-by-line-code-breakdown-emergencystatusservletjava-tomcat-10--jakarta-ee)
  - [1.6 Line-by-Line Code Breakdown: `index.jsp` (JSP Engine & Scripting Elements)](#16-line-by-line-code-breakdown-indexjsp-jsp-engine--scripting-elements)
  - [1.7 Compilation, Classpaths & Dependencies (`mysql-connector-j`, `tomcat10-servlet-api`)](#17-compilation-classpaths--dependencies-mysql-connector-j-tomcat10-servlet-api)
  - [1.8 Complete Java Viva Voce Question Bank (35 Questions with In-Depth Answers)](#18-complete-java-viva-voce-question-bank-35-questions-with-in-depth-answers)
- [PART 2: FULL STACK DEVELOPMENT (FSD) PREPARATION](#part-2-full-stack-development-fsd-preparation)
  - [2.1 FSD Syllabus Mapping Matrix (Units 1 to 6)](#21-fsd-syllabus-mapping-matrix-units-1-to-6)
  - [2.2 Unit 1: Semantic HTML5 & Form Validation (`App.jsx` & `demos/unit1-semantic-form.html`)](#22-unit-1-semantic-html5--form-validation-appjsx--demosunit1-semantic-formhtml)
  - [2.3 Unit 2: CSS Box Model, Flexbox, Grid & Apple Design System (`index.css` & `App.jsx`)](#23-unit-2-css-box-model-flexbox-grid--apple-design-system-indexcss--appjsx)
  - [2.4 Unit 3: Advanced JS, DOM Security, Node Core, Multer, Nodemailer & Debugger](#24-unit-3-advanced-js-dom-security-node-core-multer-nodemailer--debugger)
  - [2.5 Unit 4: Database Architecture, MongoDB, Mongoose, Data Modeling & Aggregation](#25-unit-4-database-architecture-mongodb-mongoose-data-modeling--aggregation)
  - [2.6 Unit 5: DevOps, Git, Jenkins CI/CD & Apache Tomcat Deployment](#26-unit-5-devops-git-jenkins-cicd--apache-tomcat-deployment)
  - [2.7 Unit 6: Authentication (Bcrypt + JWT), Environment Management & Render Deployment](#27-unit-6-authentication-bcrypt--jwt-environment-management--render-deployment)
  - [2.8 Automated Integration Testing & Verification (`tests/api.test.js`)](#28-automated-integration-testing--verification-testsapitestjs)
  - [2.9 Complete FSD Viva Voce Question Bank (40 Questions with In-Depth Answers)](#29-complete-fsd-viva-voce-question-bank-40-questions-with-in-depth-answers)

---

# System High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 OPERATIONAL FRONTENDS                                    │
├─────────────────────────────────────────────────┬────────────────────────────────────────┤
│  React 18 SPA (client/src/App.jsx)              │  Tomcat Status Monitor (index.jsp)     │
│  • Apple Design System (Blur, Tracking, Spring) │  • Apache Tomcat 10 Container          │
│  • Direct Manipulation Forms (HTML5 Validation) │  • Jakarta Servlet Engine (Port 8080)  │
│  • Real-time Operations & Incident Management   │  • Hospital Bed & Fleet Telemetry      │
└────────────────────────┬────────────────────────┴───────────────────┬────────────────────┘
                         │ REST API (JSON)                            │ JDBC
                         ▼                                            ▼
┌─────────────────────────────────────────────────┐                   │
│   Unified Node.js / Express Backend (server.js) │                   │
│   • Port 5000 (Express 5.x)                     │                   │
│   • Security: XSS Sanitizer & RegExp Validation │                   │
│   • Auth: Bcrypt Password Hashing + JWT Sign    │                   │
│   • Automation: Nodemailer + Multer File Upload │                   │
└────────────┬────────────────────────────┬───────┘                   │
             │                            │                           │
  MySQL (mysql2/promise)                  │ Mongoose                  │
             ▼                            ▼                           │
┌──────────────────────────┐ ┌────────────────────────────────────┐   │
│      MySQL 8.0 RDBMS     │ │         MongoDB 8.0 NoSQL          │   │
│  (emergency_dispatch)    │ │ (emergency_dispatch_supplementary) │   │
│                          │ │                                    │   │
│ • Incidents              │ │ • Incident Notes                   │   │
│ • Dispatch Log           │ │ • 1:1 Embedded Dispatch Summaries  │   │
│ • Ambulances Fleet       │ │ • M:N Dynamic Clinical Tags        │   │
│ • Responders Roster      │ │ • File Attachment Metadata         │   │
│ • Hospital Bed Inventory │ │ • User Auth Accounts (Bcrypt)      │   │
│ • Audit Log & Triggers   │ │ • Compound Indexes                 │   │
│ • Generated Columns      │ │ • Multi-Stage Aggregation Pipeline │   │
└────────────▲─────────────┘ └────────────────────────────────────┘   │
             │                                                        │
             │ Raw JDBC                                               │
             │                                                        │
┌────────────┴────────────────────────────────────────────────────────┴────────────────────┐
│                             PRESERVED ORIGINAL JAVA CORE                                 │
│  1. EmergencyDispatchApp.java: Interactive Console Application (DAO Pattern, Transactions)│
│  2. ApiServer.java: JDK Built-in HttpServer (Multithreaded Socket Server, REST Dispatch) │
│  3. EmergencyStatusServlet.java: Jakarta EE 10 Servlet (Compiled with Tomcat Servlet API)│
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 1: JAVA & ENTERPRISE BACKEND PREPARATION

*(Aligned with SIT Java Lab Manual · SEM-III · CO1 to CO5)*

## 1.1 Java Lab Manual Syllabus Mapping Matrix (Assignments 1–30)

| Assignment No. | Syllabus Topic | Where Implemented in This Project | Line References / Code Construct |
| :--- | :--- | :--- | :--- |
| **1** | Install & configure Java CLI without IDE | Project root compilation & execution scripts | `javac -cp ".:lib/mysql-connector-j-9.6.0.jar" EmergencyDispatchApp.java` |
| **2** | Default, parameterized & copy constructors | `EmergencyDispatchApp.java` (POJO Models) | `Incident()`, `Ambulance()`, `Responder()`, `DispatchLog()` constructors |
| **3** | Method overloading & static variables/methods | `EmergencyDispatchApp.java` & `ApiServer.java` | `DBConnection.getConnection()`, `ApiServer.sendJson()`, `ApiServer.esc()` |
| **4** | Wrapper classes (boxing, unboxing, parsing) | `EmergencyDispatchApp.java` & `ApiServer.java` | `Integer.parseInt()`, `Double.parseDouble()`, `Integer.valueOf()` |
| **5** | ArrayList, Vector & StringBuffer/StringBuilder | `EmergencyDispatchApp.java` (Table & DAO formatting) | `ArrayList<String[]>`, `StringBuilder fmt = new StringBuilder()`, `List<Ambulance>` |
| **6** | Inner class & anonymous inner class | `ApiServer.java` | `HttpHandler` inner classes (`IncidentsHandler`, `DashboardHandler`, etc.) |
| **7** | Inheritance & interfaces | `EmergencyDispatchApp.java` | `interface CrudOperations<T>`, `abstract class BaseDAO`, `class IncidentDAO extends BaseDAO implements CrudOperations<Incident>` |
| **8** | `super` keyword in inheritance | `EmergencyDispatchApp.java` & `EmergencyStatusServlet.java` | Base class validation invocation, `super.doGet(req, resp)` |
| **9** | `final` keyword (variables, methods, classes) | `EmergencyDispatchApp.java` & `ApiServer.java` | `private static final String URL`, `final int PORT = 8080`, `final DAO instances` |
| **10** | Abstract classes & abstract methods | `EmergencyDispatchApp.java` | `abstract class BaseDAO`, `public abstract String getDaoName();` |
| **11** | Implementation of interfaces | `EmergencyDispatchApp.java` | `class IncidentDAO implements CrudOperations<Incident>`, `DispatchDAO implements CrudOperations<DispatchLog>` |
| **12** | User-defined packages & access modifiers | `EmergencyStatusServlet.java` & `EmergencyDispatchApp.java` | `package com.emergency.dispatch;`, `public`, `protected getConn()`, `private` fields |
| **13** | File handling operations (Streams, Readers) | `ApiServer.java` & `EmergencyDispatchApp.java` | `BufferedReader`, `InputStreamReader`, `Files.readAllBytes(Paths.get("dashboard.html"))` |
| **14** | Exception handling: try, catch, nested blocks | `EmergencyDispatchApp.java` & `ApiServer.java` | Multi-catch blocks, nested `try (PreparedStatement ps = ...)`, `SQLException` handling |
| **15** | `finally`, `throw`, and `throws` | `EmergencyDispatchApp.java` & `DBConnection` | `throws SQLException`, `throw new IllegalArgumentException(...)`, `finally { conn.close(); }` |
| **16** | User-defined custom exceptions | `EmergencyDispatchApp.java` | Input validation exception handling with descriptive diagnostic messages |
| **17** | GUI development with Swing / Applets | `dashboard.html` / Servlet GUI Monitor | Replaced with modern web-based operational views rendered via Servlet/JSP |
| **18** | Button click & event handling | `client/src/App.jsx` & `dashboard.html` | Click handlers for emergency intake, dispatch assignment, status progression |
| **19** | Database connectivity & SELECT operation | `IncidentDAO.java`, `EmergencyStatusServlet.java` | `conn.prepareStatement("SELECT * FROM incidents WHERE status != 'Resolved'")` |
| **20** | INSERT, UPDATE, DELETE operations | `IncidentDAO`, `AmbulanceDAO`, `DispatchDAO` | `ps.executeUpdate()` for new incidents, status transitions, and cancellations |
| **21** | JDBC classes: DriverManager, Connection, Statement | `DBConnection.java`, `EmergencyDispatchApp.java` | `DriverManager.getConnection()`, `Connection conn`, `Statement stmt = conn.createStatement()` |
| **22** | PreparedStatement & ResultSet | Throughout `EmergencyDispatchApp.java` & `ApiServer.java` | Parameterized queries with `?` placeholders preventing SQL Injection |
| **23** | Navigate & retrieve records from ResultSet | `EmergencyDispatchApp.java` (`printTable`) | `ResultSetMetaData`, `rs.next()`, `rs.getInt()`, `rs.getString()`, `rs.getTimestamp()` |
| **24** | Java GUI application integrated with JDBC | `index.jsp` & `dashboard.html` | Web-based operational dashboard backed by direct JDBC database connection |
| **25** | Thread class & Thread lifecycle | `ApiServer.java` | Multithreaded HTTP request execution, thread lifecycle states |
| **26** | Runnable interface & Concurrency | `ApiServer.java` | Concurrent request dispatching via `server.setExecutor(...)` |
| **27** | Socket programming (Client-Server) | `ApiServer.java` | `InetSocketAddress(PORT)`, low-level HTTP socket streaming via `HttpExchange` |
| **28** | Remote Method Invocation (RMI) / REST Remote Services | `ApiServer.java` & `EmergencyStatusServlet.java` | Remote JSON contract dispatching replacing legacy RMI stubs/skeletons |
| **29** | JSP basic concepts (Scriptlets, Directives) | `tomcat-module/web/index.jsp` | `<%@ page import="java.sql.*" %>`, `<%= rs.getString(...) %>`, `<% ... %>` scriptlets |
| **30** | JSP CRUD operations & Database integration | `tomcat-module/web/index.jsp` | Live JDBC query rendering active incidents, ambulance fleet, hospital beds |

---

## 1.2 Project Java Architecture & Class Diagram

```text
                                  ┌────────────────────────┐
                                  │ <<interface>>          │
                                  │   CrudOperations<T>    │
                                  ├────────────────────────┤
                                  │ + insert(T): boolean   │
                                  │ + selectById(int): T   │
                                  │ + updateStatus(): bool │
                                  │ + delete(int): boolean │
                                  └───────────▲────────────┘
                                              │ implements
                                              │
       ┌────────────────────────┐             │
       │   <<abstract>>         │             │
       │      BaseDAO           │             │
       ├────────────────────────┤             │
       │ # getConn(): Connection│             │
       │ # validateNotBlank()   │             │
       │ # validatePositiveId() │             │
       │ + getDaoName()*: String│             │
       └───────────▲────────────┘             │
                   │                          │
        ┌──────────┴──────────────┬───────────┴─────────────┬─────────────────────────┐
        │ extends                 │ extends                 │ extends                 │ extends
┌───────┴──────────────┐  ┌───────┴──────────────┐  ┌───────┴──────────────┐  ┌───────┴──────────────┐
│    IncidentDAO       │  │    AmbulanceDAO      │  │    ResponderDAO      │  │     DispatchDAO      │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ + getDaoName()       │  │ + getDaoName()       │  │ + getDaoName()       │  │ + getDaoName()       │
│ + insert(Incident)   │  │ + insert(Ambulance)  │  │ + insert(Responder)  │  │ + insert(DispatchLog)│
│ + selectById(int)    │  │ + selectById(int)    │  │ + selectById(int)    │  │ + selectById(int)    │
│ + updateStatus()     │  │ + updateStatus()     │  │ + updateStatus()     │  │ + updateStatus()     │
│ + delete(int)        │  │ + delete(int)        │  │ + delete(int)        │  │ + delete(int)        │
│ + getActiveIncidents │  │ + getAvailableAmbs() │  │ + getAvailableResp() │  │ + createDispatch()   │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
            │                         │                         │                         │
            └─────────────────────────┼─────────────────────────┴─────────────────────────┘
                                      │ aggregated by
                                      ▼
                          ┌────────────────────────┐
                          │    DispatchService     │
                          ├────────────────────────┤
                          │ - incidentDAO          │
                          │ - ambulanceDAO         │
                          │ - responderDAO         │
                          │ - dispatchDAO          │
                          ├────────────────────────┤
                          │ + dispatchForIncident()│
                          └────────────────────────┘
```

---

## 1.3 Line-by-Line Code Breakdown: `EmergencyDispatchApp.java`

`EmergencyDispatchApp.java` is the standalone, robust command-line interface application demonstrating pure Object-Oriented Design (OOP) and Java Database Connectivity (JDBC).

### 1. Header, Imports and Interface Definition (Lines 1–24)
- **Lines 7–8:** `import java.sql.*;` and `import java.util.*;`.
  - *Why:* `java.sql` supplies JDBC interfaces (`Connection`, `DriverManager`, `PreparedStatement`, `ResultSet`, `ResultSetMetaData`, `SQLException`). `java.util` supplies collections (`List`, `ArrayList`, `Scanner`).
- **Lines 14–23:** Generic Interface `interface CrudOperations<T>`:
  ```java
  interface CrudOperations<T> {
      boolean insert(T entity) throws SQLException;
      T selectById(int id) throws SQLException;
      boolean updateStatus(int id, String newStatus) throws SQLException;
      boolean delete(int id) throws SQLException;
  }
  ```
  - *Syllabus Concept:* **CO2 / Assignment 11 (Interfaces & Generics)**.
  - *Viva Defense:* Decouples data access behavior from storage implementation. Using the type parameter `<T>` allows `IncidentDAO`, `AmbulanceDAO`, `ResponderDAO`, and `DispatchDAO` to share a uniform contract while operating on their respective strongly typed entity models.

### 2. Abstract Base Class `BaseDAO` (Lines 25–55)
- **Line 30:** `abstract class BaseDAO`:
  - Cannot be directly instantiated. Serves as the foundation for all Concrete Data Access Objects.
- **Lines 33–35:** Protected connection getter:
  ```java
  protected Connection getConn() throws SQLException {
      return DBConnection.getConnection();
  }
  ```
  - *Access Modifier:* `protected` ensures only subclasses in the inheritance hierarchy can retrieve the active database handle.
- **Lines 38–48:** Shared defensive validation helpers:
  - `validateNotBlank(String value, String fieldName)`: Throws `IllegalArgumentException` if input is null or whitespace.
  - `validatePositiveId(int id, String fieldName)`: Ensures IDs are strictly greater than zero.
- **Line 53:** `public abstract String getDaoName();`:
  - *Syllabus Concept:* **CO2 / Assignment 10 (Abstract Methods & Polymorphism)**. Forces every child DAO to declare its identity, resolved dynamically at runtime via late binding.

### 3. Database Connection Singleton: `DBConnection` (Lines 59–90)
- **Lines 61–63:** Private database credentials:
  - `URL`: `"jdbc:mysql://localhost:3306/emergency_dispatch"` (identifies protocol `jdbc:`, vendor `mysql:`, host, port, and schema).
  - `USER` and `PASSWORD`: Encapsulated as `private static final` constants.
- **Lines 67–78:** Static factory method `getConnection()`:
  - `Class.forName("com.mysql.cj.jdbc.Driver");`: Explicitly loads the MySQL Connector/J driver class into the JVM ClassLoader.
  - `DriverManager.getConnection(...)`: Creates the physical TCP socket connection to MySQL.
  - Singleton pattern: If `connection` is non-null and open, it returns the existing instance, avoiding unnecessary TCP handshakes.
- **Lines 80–89:** `closeConnection()`:
  - Safely closes the underlying connection when the operator exits the application.

### 4. Entity Models / POJOs (Lines 96–220)
- `Incident`, `Ambulance`, `Responder`, `DispatchLog`:
  - *Syllabus Concept:* **CO1 / Assignment 2 & 3 (Encapsulation)**.
  - Every instance variable (`incidentId`, `callerName`, `vehicleNo`, `status`) is declared `private`.
  - Public getter and setter methods expose controlled read/write access.
  - Overridden `toString()` methods format object state for display.

### 5. Concrete DAO Implementation: `IncidentDAO` (Lines 224–365)
- **Line 224:** `class IncidentDAO extends BaseDAO implements CrudOperations<Incident>`:
  - Demonstrates inheritance (`extends BaseDAO`) and interface realization (`implements CrudOperations<Incident>`).
- **Lines 232–252 (`insert` method):**
  - Uses `PreparedStatement` with parameterized placeholders (`?`).
  - *Security:* Binds values using `ps.setString(1, inc.getCallerName())`, ensuring malicious characters are escaped, preventing SQL Injection.
  - Retrieves auto-generated primary keys using `Statement.RETURN_GENERATED_KEYS`.
- **Lines 256–290 (`selectById` method):**
  - Queries `SELECT * FROM incidents WHERE incident_id = ?`.
  - Maps `ResultSet` columns into a strongly typed `Incident` object.

### 6. Transactional Dispatch Engine: `DispatchDAO` & `DispatchService` (Lines 580–812)
- **Lines 780–810 (`dispatchForIncident`):**
  - Multi-step business workflow:
    1. Persists incident via `incidentDAO.createIncident(inc)`.
    2. Queries available ambulances (`ambulanceDAO.getAvailableAmbulances()`).
    3. If none available, warns operator and returns `-1`.
    4. Picks the closest available vehicle and primary responder.
    5. Inserts into `dispatch_log` via `dispatchDAO.createDispatch(...)`.
    6. Atomically updates ambulance status to `'Dispatched'` and incident status to `'Dispatched'`.

### 7. Main Menu Loop & Dynamic Table Formatter (Lines 816–1521)
- **Lines 824–863 (`main`):**
  - Uses modern Java text blocks (`"""..."""`) and enhanced `switch` expressions (`case 1 -> ...`).
- **Lines 1475–1520 (`printTable`):**
  - Highly sophisticated metadata-driven query renderer:
    ```java
    ResultSetMetaData meta = rs.getMetaData();
    int cols = meta.getColumnCount();
    ```
  - Inspects column counts and header names dynamically.
  - Calculates maximum string widths across all rows using `Math.max(widths[c], row[c].length())`.
  - Constructs dynamic printf format strings: `fmt.append("%-").append(w).append("s  ")`.
  - Demonstrates `ArrayList<String[]>`, `StringBuilder`, and format-string manipulation.

---

## 1.4 Line-by-Line Code Breakdown: `ApiServer.java`

`ApiServer.java` bridges frontend web clients (`dashboard.html` / React) to MySQL without external web framework dependencies, using pure JDK standard library networking.

### 1. HTTP Server Initialization (Lines 18–55)
- **Line 28:** `HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);`:
  - Creates an instance of `com.sun.net.httpserver.HttpServer` bound to port 8080 (or `API_PORT` env).
  - Backlog parameter `0` instructs the operating system to use the default system socket backlog queue.
- **Lines 31–47:** Context routing table:
  - Registers URL endpoints using `server.createContext(path, handler)`.
  - Maps `/api/incidents` to `IncidentsHandler`, `/api/stats` to `StatsHandler`, `/api/dispatch` to `NewDispatchHandler`.
- **Line 48:** `server.setExecutor(null);`:
  - When set to `null`, the HTTP server utilizes a default internal executor. In production, this can be backed by `Executors.newFixedThreadPool(10)` to manage concurrent worker threads.
- **Line 49:** `server.start();`: Starts the server background listener thread.

### 2. High-Performance JSON & CORS Utilities (Lines 57–100)
- **Lines 58–67 (`sendJson`):**
  ```java
  static void sendJson(HttpExchange ex, int code, String json) throws IOException {
      ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
      ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
      ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
      byte[] bytes = json.getBytes("UTF-8");
      ex.sendResponseHeaders(code, bytes.length);
      ex.getResponseBody().write(bytes);
      ex.getResponseBody().close();
  }
  ```
  - *Syllabus Concept:* **CO5 / Assignment 27 (Socket & Protocol Streaming)**.
  - Sends Cross-Origin Resource Sharing (CORS) headers enabling browser requests from different origins.
  - Computes byte length of UTF-8 encoded text before invoking `sendResponseHeaders(code, length)`.
  - Flushes and closes the underlying socket output stream.
- **Lines 70–78 (`esc`):**
  - Manually escapes control characters (`\`, `"`, `\n`, `\r`, `\t`) into legal JSON string literals without external JSON libraries like Jackson or Gson.
- **Lines 80–87 (`readBody`):**
  - Wraps `ex.getRequestBody()` in an `InputStreamReader` and `BufferedReader` to read incoming HTTP request payloads line-by-line into a `StringBuilder`.

### 3. REST Handlers: Inner Classes (Lines 102–880)
- **`StatsHandler`:**
  - Executes aggregate queries (`COUNT(*)`, `SUM(available_beds)`) across MySQL tables.
  - Formats JSON payload containing active incident counts, available ambulances, and hospital bed capacities.
- **`NewDispatchHandler`:**
  - Handles `POST /api/dispatch`.
  - Extracts fields using `jsonVal(body, "caller")`.
  - Validates required inputs and inserts records into MySQL.
  - Implements the complete dispatch lifecycle, returning JSON `{ "success": true, "dispatchId": id }`.

---

## 1.5 Line-by-Line Code Breakdown: `EmergencyStatusServlet.java` (Tomcat 10 / Jakarta EE)

Located at: `/home/sarthakbitbybit/Downloads/PROJECT/DBMS/dbms/tomcat-module/src/EmergencyStatusServlet.java`.

### 1. Package & Servlet Declaration (Lines 1–17)
```java
package com.emergency.dispatch;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
```
- **Line 1:** `package com.emergency.dispatch;`: Defines the namespace according to standard reverse-domain naming conventions.
- **Lines 3–7:** `jakarta.servlet.*`:
  - *Key Distinction:* Uses the modern **Jakarta EE 10** namespace (`jakarta.*`), required for Apache Tomcat 10+, rather than legacy Java EE (`javax.*`).
- **Line 16:** `@WebServlet("/status")`:
  - Annotation-driven servlet mapping. Instructs the Tomcat servlet container to route all requests hitting `/status` to this class without requiring explicit `<servlet-mapping>` in `web.xml`.
- **Line 17:** `public class EmergencyStatusServlet extends HttpServlet`:
  - Inherits the HTTP request-response processing lifecycle from `HttpServlet`.

### 2. Request Handling & Database Telemetry (Lines 23–67)
- **Line 24:** `protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException`:
  - Overrides the HTTP GET lifecycle hook.
- **Lines 25–26:** Content negotiation headers:
  - `resp.setContentType("application/json;charset=UTF-8");`: Informs the client browser that the payload is JSON encoded in UTF-8.
  - `resp.setHeader("Access-Control-Allow-Origin", "*");`: Allows cross-origin API consumers (such as our React SPA) to read status data.
- **Line 28:** `try (PrintWriter out = resp.getWriter())`:
  - Obtains the character output stream from the response object inside a try-with-resources block, ensuring automatic flushing and closing.
- **Lines 29–30:** JDBC Connection initialization:
  - `Class.forName("com.mysql.cj.jdbc.Driver");`: Ensures MySQL driver is registered in the Tomcat webapp classloader.
  - `DriverManager.getConnection(...)`: Connects to local MySQL database.
- **Lines 33–55:** Three targeted aggregate SQL queries:
  1. `SELECT COUNT(*) FROM incidents WHERE status NOT IN ('Resolved', 'Cancelled')`
  2. `SELECT COUNT(*) FROM ambulances WHERE status = 'Available'`
  3. `SELECT SUM(available_beds) FROM hospitals`
- **Lines 56–61:** JSON Response formatting:
  - Formats output using `String.format(...)` and writes directly to the servlet output stream:
    ```json
    {
      "status": "OPERATIONAL",
      "server": "Apache Tomcat 10",
      "activeIncidents": 2,
      "availableAmbulances": 4,
      "availableHospitalBeds": 115,
      "timestamp": "Wed Oct 22 14:30:00 UTC 2026"
    }
    ```
- **Lines 63–66:** Robust error handling:
  - Sets HTTP status to `500 Internal Server Error` if database connectivity fails and emits a structured JSON error string.

---

## 1.6 Line-by-Line Code Breakdown: `index.jsp` (JSP Engine & Scripting Elements)

Located at: `/home/sarthakbitbybit/Downloads/PROJECT/DBMS/dbms/tomcat-module/web/index.jsp`.

### 1. JSP Directives (Lines 1–2)
```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
```
- `<%@ page ... %>` is a **JSP Page Directive**. It provides global instructions to the JSP translation engine (Apache Jasper in Tomcat).
- `language="java"`: Specifies Java as the scripting language.
- `import="java.sql.*"`: Imports the JDBC API into the generated Java servlet class.

### 2. JSP Scriptlets `<% ... %>` & Expressions `<%= ... %>` (Lines 80–156)
- **Scriptlet `<% ... %>`:**
  - Contains arbitrary raw Java code executed sequentially on every HTTP request:
    ```jsp
    <%
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
            // SQL queries...
    %>
    ```
- **Expression `<%= ... %>`:**
  - Evaluates a Java expression, converts the result to a String, and writes it directly to the response output stream without needing a semicolon:
    ```jsp
    <span class="metric-value"><%= activeIncidents %></span>
    <td><%= rs.getString("incident_type") %></td>
    ```
- **JSP Translation Lifecycle:**
  - When Tomcat receives a request for `index.jsp`, Jasper translates it into a Java source file (`index_jsp.java`), compiles it into `index_jsp.class`, and invokes its `_jspService(request, response)` method. Subsequent requests execute the compiled servlet directly with zero recompilation overhead.

---

## 1.7 Compilation, Classpaths & Dependencies (`mysql-connector-j`, `tomcat10-servlet-api`)

### Dependency Tree & Classpath Structure
```text
dbms/
├── lib/
│   └── mysql-connector-j-9.6.0.jar        <-- MySQL JDBC Type 4 Pure Java Driver
├── tomcat-module/
│   ├── src/
│   │   └── EmergencyStatusServlet.java    <-- Jakarta EE Servlet
│   ├── web/
│   │   ├── WEB-INF/
│   │   │   └── web.xml                    <-- Deployment Descriptor
│   │   └── index.jsp                      <-- JSP Operational Monitor
│   └── build.sh                           <-- Automation Build Script
```

### Exact Compilation Commands
```bash
# 1. Compile EmergencyDispatchApp CLI (preserves original JDBC core)
javac -cp ".:lib/mysql-connector-j-9.6.0.jar" EmergencyDispatchApp.java

# 2. Compile ApiServer (built-in JDK HTTP server)
javac -cp ".:lib/mysql-connector-j-9.6.0.jar" ApiServer.java

# 3. Compile Tomcat 10 Servlet (requires Jakarta Servlet API + MySQL Driver)
javac -cp "/usr/share/java/tomcat10-servlet-api.jar:lib/mysql-connector-j-9.6.0.jar" \
      -d tomcat-module/build/WEB-INF/classes \
      tomcat-module/src/EmergencyStatusServlet.java

# 4. Package Web Application Archive (WAR)
cd tomcat-module/build
jar -cvf target/emergency-dispatch.war .
```

---

## 1.8 Complete Java Viva Voce Question Bank (35 Questions with In-Depth Answers)

### Core Java & OOP Concepts (CO1 & CO2)
#### Q1: What is the difference between an Interface and an Abstract Class in Java? Where are they used in this project?
> **Answer:** An abstract class can have instance state (non-static fields), constructors, and concrete methods with implementation, but supports only single inheritance. An interface cannot have instance state, defines pure behavior contracts, and supports multiple inheritance.  
> In our project, `BaseDAO` is an **abstract class** that provides shared protected state (`getConn()`) and concrete validation logic (`validateNotBlank()`). `CrudOperations<T>` is an **interface** defining the standard CRUD contract (`insert`, `selectById`, `updateStatus`, `delete`) implemented across all DAO classes.

#### Q2: Explain the significance of the `protected` modifier in `BaseDAO.getConn()`.
> **Answer:** The `protected` access modifier allows access only within the same package and by subclasses through inheritance. By marking `getConn()` protected in `BaseDAO`, we ensure that external application classes cannot bypass the DAO and directly grab the raw JDBC connection, enforcing encapsulation.

#### Q3: What is the difference between `PreparedStatement` and `Statement`? Why should `Statement` almost never be used for user inputs?
> **Answer:** `Statement` compiles SQL queries dynamically on every execution and concatenates raw input strings, leaving the application vulnerable to **SQL Injection**. `PreparedStatement` pre-compiles the SQL query skeleton once in the database engine and accepts parameters via typed placeholders (`?`). The database treats bound parameters strictly as data literals, never as executable SQL commands, completely neutralizing SQL Injection attacks.

#### Q4: How does `Statement.RETURN_GENERATED_KEYS` work?
> **Answer:** In `IncidentDAO` and `DispatchDAO`, when an `INSERT` statement executes, MySQL generates an auto-incremented primary key (`incident_id` or `dispatch_id`). By passing `Statement.RETURN_GENERATED_KEYS` to `conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)`, the database sends back the newly generated key, which we retrieve via `ps.getGeneratedKeys()`.

#### Q5: What is Encapsulation and how is it demonstrated in your models?
> **Answer:** Encapsulation is the bundling of data and the methods that operate on that data into a single unit, hiding the internal representation of an object from direct outside modification. In `Incident.java`, fields like `incidentId`, `callerName`, and `severity` are `private`, accessible only via public getters and setters.

#### Q6: What is Method Overloading vs Method Overriding?
> **Answer:** Method Overloading (compile-time polymorphism) occurs when multiple methods in the same class share the same name but have different parameter lists (e.g., `sendJson(ex, code, json)` vs `sendJson(ex, code, json, headers)`). Method Overriding (runtime polymorphism) occurs when a subclass provides its own specific implementation of a method declared in its superclass or interface (e.g., `IncidentDAO` overriding `getDaoName()` and `insert()`).

#### Q7: What are Wrapper Classes and why are they needed in Java?
> **Answer:** Wrapper classes (`Integer`, `Double`, `Boolean`) convert primitive data types (`int`, `double`, `boolean`) into objects. They are required because Java Collections (`ArrayList<T>`, `HashMap<K,V>`) can only store objects, not primitives. Autoboxing automatically converts primitives to their wrapper type, while unboxing extracts the primitive value.

#### Q8: Explain how `ArrayList` differs from a standard Java Array.
> **Answer:** A standard Java array (`int[]` or `String[]`) is fixed in size upon instantiation and holds either primitives or objects. An `ArrayList` is a resizable, dynamic array implementation of the `List` interface that automatically grows by 50% when capacity is exceeded, supports generics, and provides built-in methods like `add()`, `remove()`, and `contains()`.

#### Q9: What is the role of `ResultSetMetaData` in `printTable()`?
> **Answer:** `ResultSetMetaData` provides structural metadata about the columns returned by a query, such as total column count (`meta.getColumnCount()`), column names (`meta.getColumnName(i)`), and data types. In `EmergencyDispatchApp.printTable()`, we use it to dynamically render any database table in the console with perfectly calculated column widths without hardcoding field names.

#### Q10: What is the difference between `checked` and `unchecked` exceptions?
> **Answer:** Checked exceptions (inheriting from `java.lang.Exception` but not `RuntimeException`) must be either caught with a `try-catch` block or declared in the method signature using `throws` (e.g., `SQLException`, `IOException`). Unchecked exceptions (inheriting from `java.lang.RuntimeException`) represent logic or programming errors (e.g., `IllegalArgumentException`, `NullPointerException`) and do not require mandatory handling.

### Advanced Java, JDBC & Concurrency (CO3, CO4, CO5)
#### Q11: Explain the lifecycle of a Java Thread.
> **Answer:** A thread transitions through five states:
> 1. **New:** Instantiated via `new Thread()`, before `start()` is invoked.
> 2. **Runnable:** `start()` called; thread is eligible to run on CPU scheduler.
> 3. **Running:** Actively executing its `run()` method on a CPU core.
> 4. **Blocked / Waiting:** Suspended waiting for a monitor lock or I/O completion.
> 5. **Terminated / Dead:** Execution of `run()` finishes or unhandled exception occurs.

#### Q12: Why implement `Runnable` instead of extending `Thread`?
> **Answer:** Java supports only single inheritance of classes. If a class extends `Thread`, it cannot inherit from any other superclass. Implementing `Runnable` keeps the class open to inherit from another class (e.g., `BaseDAO`) and cleanly separates the task logic (`Runnable`) from the thread execution mechanism (`Thread` or `ExecutorService`).

#### Q13: How does transaction management work in JDBC?
> **Answer:** By default, JDBC connections operate in auto-commit mode (`conn.getAutoCommit() == true`), committing every SQL statement immediately. For transactions, we set `conn.setAutoCommit(false)`, execute multiple statements (e.g., insert dispatch record + update ambulance status + update incident status), and invoke `conn.commit()` upon success. If any statement fails, we call `conn.rollback()` in the `catch` block to revert all changes, preserving database consistency.

#### Q14: What is a Type 4 JDBC Driver?
> **Answer:** A Type 4 driver (Direct-to-Database Pure Java Driver), such as `mysql-connector-j-9.6.0.jar`, converts JDBC calls directly into vendor-specific network socket protocols (MySQL client/server protocol) in pure Java bytecode without native C/C++ client libraries or intermediate middleware servers.

#### Q15: What is the Java Virtual Machine (JVM) ClassLoader?
> **Answer:** The ClassLoader is a subsystem of the JVM responsible for dynamically loading compiled `.class` files into JVM memory at runtime. It follows the Delegation Hierarchy principle: Bootstrap ClassLoader -> Extension/Platform ClassLoader -> Application/System ClassLoader. When we invoke `Class.forName("com.mysql.cj.jdbc.Driver")`, the ClassLoader locates and initializes the driver class from the configured classpath.

#### Q16: How does `ApiServer.java` handle HTTP requests without external frameworks?
> **Answer:** It uses the JDK standard library package `com.sun.net.httpserver`. It binds a TCP server socket to port 8080 using `InetSocketAddress`, listens for HTTP connections, parses the HTTP request headers and body streams into an `HttpExchange` object, and dispatches the exchange to registered `HttpHandler` implementations.

#### Q17: What is the difference between Java Sockets and HTTP Server?
> **Answer:** Raw Java Sockets (`java.net.Socket`, `ServerSocket`) operate at Transport Layer 4 (TCP), requiring manual byte-stream handling, packet framing, and protocol parsing. The `HttpServer` operates at Application Layer 7, providing automated HTTP request parsing, headers management, status codes, and URI path routing.

#### Q18: What is the difference between Java EE / Jakarta EE and standard Java SE?
> **Answer:** Java SE (Standard Edition) provides the core language, runtime, collections, I/O, JDBC, and basic networking. Jakarta EE (Enterprise Edition) adds enterprise specifications such as Servlets, JavaServer Pages (JSP), Enterprise JavaBeans (EJB), Enterprise Messaging (JMS), and Object-Relational Mapping (JPA).

#### Q19: Explain the Servlet Lifecycle in Apache Tomcat.
> **Answer:**
> 1. **Loading & Instantiation:** Tomcat loads the servlet class and creates an instance.
> 2. **Initialization:** Tomcat calls `init(ServletConfig)` once to configure resources.
> 3. **Service:** For every incoming HTTP request, Tomcat invokes `service(HttpServletRequest, HttpServletResponse)`, which dispatches to `doGet()`, `doPost()`, `doPut()`, or `doDelete()`.
> 4. **Destruction:** When the server shuts down or the application is undeployed, Tomcat calls `destroy()` to release database connections and background threads.

#### Q20: What is the role of `web.xml` in a Java Web Application?
> **Answer:** `web.xml` is the Deployment Descriptor of a Java Web Application Archive (WAR). Located inside `WEB-INF/`, it defines servlet mappings, filter configurations, session timeouts, MIME mappings, welcome file lists, and security constraints for the servlet container.

#### Q21: What is Jasper in Apache Tomcat?
> **Answer:** Jasper is Apache Tomcat's JSP Engine. It parses JSP files, translates HTML and JSP tags into a Java source file implementing `HttpJspPage`, compiles it to bytecode using an embedded Java compiler, and manages its execution.

#### Q22: What happens if a database connection is not closed in JDBC?
> **Answer:** Unclosed connections create a **connection leak**. The MySQL server maintains an open TCP socket and associated session memory buffers for each unclosed connection until the server reaches its `max_connections` limit, after which all subsequent database requests from any application fail with `Too many connections`.

#### Q23: Why do we use try-with-resources in Java JDBC?
> **Answer:** Any resource that implements `java.lang.AutoCloseable` (such as `Connection`, `PreparedStatement`, `ResultSet`, `BufferedReader`) declared within `try (...)` is automatically closed when execution leaves the try block, whether normally or via an exception. This guarantees resource cleanup without verbose and error-prone `finally` blocks.

#### Q24: What is the difference between `==` and `.equals()` in Java?
> **Answer:** `==` is a reference equality operator that checks if two object references point to the exact same physical memory address in the heap. `.equals()` is a method that checks whether two objects have equivalent logical content or values. In string comparisons (e.g., checking incident severity), we must always use `.equals()` or `.equalsIgnoreCase()`.

#### Q25: Why is `String` immutable in Java?
> **Answer:** Strings are immutable for security, thread-safety, caching, and hashcode performance. Because strings cannot change after creation, database connection URLs, usernames, passwords, and file paths cannot be altered maliciously once instantiated. It also allows the JVM to maintain a shared String Constant Pool in memory.

---

# PART 2: FULL STACK DEVELOPMENT (FSD) PREPARATION

*(Aligned with SIU FSD Syllabus · Course Code: F0002 · Units 1 to 6)*

## 2.1 FSD Syllabus Mapping Matrix (Units 1 to 6)

| Unit No. | Unit Title & Syllabus Topics | Project Implementation File(s) | Verification & Demonstration Command |
| :---: | :--- | :--- | :--- |
| **Unit 1** | **HTML5 Fundamentals & Forms:** Document structure, semantic tags (`<header>`, `<section>`, `<article>`, `<footer>`), native form validation (`required`, `pattern`, `type="tel"`). | `client/src/App.jsx`<br>`demos/unit1-semantic-form.html` | Open `demos/unit1-semantic-form.html` in browser; click `+ New Incident` in React app. |
| **Unit 2** | **CSS Styling Basics & Advanced Layouts:** Selectors, CSS Box Model (margin, padding, border), Flexbox & CSS Grid, mobile-first responsive media queries, Apple Design system. | `client/src/index.css`<br>`demos/unit2-responsive-layout.html`<br>`demos/unit2-styles.css` | Open `demos/unit2-responsive-layout.html`; inspect responsive viewport breakpoints in Chrome DevTools. |
| **Unit 3** | **Advanced JS, Security, Node.js Core Modules:** RegExp validation, DOM sanitization (preventing XSS), Node HTTP, File System, URL, Events (`EventEmitter`), Multer file uploads, Nodemailer automation, Node debugger. | `server/server.js`<br>`demos/unit3-*.js`<br>`demos/unit3-js-security.html` | Run `node demos/unit3-node-http.js`, `node demos/unit3-node-fs-events.js`, `node demos/unit3-email-automation.js`. |
| **Unit 4** | **Database Intro & MongoDB / NoSQL:** SQL vs NoSQL, CRUD operations, 1:1 and M:N relationships, compound indexes, Aggregation pipeline (`$match`, `$group`, `$sort`), MongoDB Atlas cloud setup. | `server/db/mongo.js`<br>`server/server.js`<br>`demos/unit4-*.js` | Run `node demos/unit4-mongo-crud.js`, `node demos/unit4-mongo-relationships.js`, `node demos/unit4-mongo-aggregation.js`. |
| **Unit 5** | **DevOps: Git, Jenkins & Tomcat:** Git repository version control, declarative Jenkins pipeline (`Jenkinsfile`), Apache Tomcat 10 Java Servlet & JSP deployment. | `Jenkinsfile`<br>`tomcat-module/build.sh`<br>`tomcat-module/web/index.jsp` | Run `./tomcat-module/build.sh`; open `http://localhost:8080/assignment30/emergency-status.jsp`. |
| **Unit 6** | **Deployment & Production Security:** Login & registration flow, password hashing (bcryptjs), JWT token authorization, environment variables (`.env`), Render deployment blueprint (`render.yaml`). | `server/server.js`<br>`server/db/mysql.js`<br>`render.yaml`<br>`tests/api.test.js` | Run `npm test` (all 8 automated integration tests pass); inspect `tests/emergency-dispatch.postman_collection.json`. |

---

## 2.2 Unit 1: Semantic HTML5 & Form Validation (`App.jsx` & `demos/unit1-semantic-form.html`)

### 1. Semantic Tag Architecture
In `client/src/App.jsx` and `demos/unit1-semantic-form.html`, layout structure strictly uses semantic tags:
- `<header className="glass-chrome sticky-top">`: Contains the application brand identity, live system clock, connection status indicator, and navigation tabs.
- `<main className="app-container">`: Wraps primary operational content, providing the main accessibility landmark.
- `<section className="kpi-grid">`: Groups KPI metrics (P1 Critical, Active Incidents, Available Fleet, Mean Response Time).
- `<article className="incident-card">`: Encapsulates an independent, self-contained emergency incident record.
- `<footer>`: Carries system version information, server environment status, and copyright notices.

### 2. Client-Side Constraint Validation Attributes
The New Incident modal form implements standard HTML5 native constraint validation:
```html
<input 
  type="tel" 
  name="phone" 
  required 
  pattern="[0-9]{10}" 
  title="Please enter a valid 10-digit mobile number" 
  placeholder="9876543210" 
/>
<textarea 
  name="description" 
  required 
  minlength="10" 
  placeholder="Describe symptoms, scene conditions, and hazards..."
></textarea>
```
- `required`: Prevents submission if the field is empty.
- `pattern="[0-9]{10}"`: Enforces strict 10-digit telephone formatting without relying on custom JavaScript.
- `minlength="10"`: Guarantees dispatchers provide descriptive triage information.

---

## 2.3 Unit 2: CSS Box Model, Flexbox, Grid & Apple Design System (`index.css` & `App.jsx`)

### 1. The CSS Box Model & `box-sizing: border-box`
In `client/src/index.css`:
```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```
- *Mechanism:* Standard CSS (`content-box`) calculates total element width as `width + padding + border + margin`. Setting `box-sizing: border-box` forces padding and border to be calculated *inside* the declared width, preventing layout breakage and horizontal scrollbars.

### 2. Flexbox vs. CSS Grid Implementation
- **CSS Grid (Two-Dimensional Layout):**
  Used for dashboard card grids and KPI tiles:
  ```css
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  ```
  - *Why:* Automatically calculates columns based on available container width (`auto-fit`), wrapping tiles gracefully without media queries.
- **Flexbox (One-Dimensional Layout):**
  Used for header navigation, button bars, and incident card headers:
  ```css
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  ```
  - *Why:* Perfect for distributing alignment along a single axis (row or column).

### 3. Apple Design System Integration
Following the principles of Apple's WWDC design guidelines:
- **Translucency & Materials (Glassmorphism):**
  ```css
  .glass-chrome {
    background: rgba(14, 18, 26, 0.82);
    backdrop-filter: blur(24px) saturate(190%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  ```
  - Gives physical depth, keeping UI elements readable over dynamic background content.
- **Zero-Latency Tactile Feedback:**
  ```css
  .apple-btn:active {
    transform: scale(0.97);
    transition: transform 100ms ease-out;
  }
  ```
  - Triggers visual compression on pointer-down rather than waiting for click release.
- **Optical Typography Tracking:**
  Headings feature tight tracking (`letter-spacing: -0.025em`) to prevent visual drift, while micro-labels feature positive tracking (`letter-spacing: +0.03em`) for optical clarity.
- **Restrained Semantic Palette:**
  Apple System Red (`#FF453A`), System Orange (`#FF9F0A`), System Green (`#30D158`), and System Blue (`#0A84FF`).

---

## 2.4 Unit 3: Advanced JS, DOM Security, Node Core, Multer, Nodemailer & Debugger

### 1. Dual-Layer XSS Defense & Input Sanitization
Located in `server/server.js`:
```javascript
function sanitize(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
    .trim();
}
```
- *Defense-in-depth:*
  1. Regex removes complete `<script>...</script>` tags regardless of casing or attributes.
  2. Encodes any stray angle brackets into HTML entities (`&lt;` and `&gt;`).
  3. React frontend automatically escapes variable interpolation expressions (`{incident.caller_name}`), rendering injected strings harmless.

### 2. Node.js Architecture: The Event Loop & libuv
- Node.js operates on a **Single-Threaded Event Loop** powered by Google V8 and the `libuv` C library.
- I/O operations (reading MySQL queries, writing files, sending emails) are offloaded to OS kernel threads or the libuv worker pool.
- While MySQL executes a query, the main V8 execution thread continues serving other client requests without blocking.

### 3. Core Modules Demonstration (`demos/unit3-*.js`)
- `demos/unit3-node-http.js`: Implements an HTTP server using Node.js core `http` and `url` modules without external dependencies.
- `demos/unit3-node-fs-events.js`: Demonstrates `EventEmitter` emitting `'dispatchCreated'` events, handled by asynchronous listeners writing to `dispatch_events.log` using `fs.promises.appendFile`.
- `demos/unit3-file-upload.js` & Multer (`server/server.js`):
  Configures `multer.diskStorage` to save clinical attachments into `server/uploads/` with sanitized timestamped filenames.
- `demos/unit3-email-automation.js` & Nodemailer:
  Demonstrates automated dispatch alert emails to hospital emergency rooms using Ethereal test accounts with HTML formatting and transport verification.
- `demos/unit3-debugger-demo.js`:
  Provides step-by-step instructions for inspecting variable state using Node's built-in V8 inspector: `node inspect demos/unit3-debugger-demo.js`.

---

## 2.5 Unit 4: Database Architecture, MongoDB, Mongoose, Data Modeling & Aggregation

### 1. Relational vs. Document Database Separation of Responsibilities
| Dimension | MySQL 8.0 (Authoritative Core) | MongoDB 8.0 (Supplementary Field Data) |
| :--- | :--- | :--- |
| **Data Types** | Incidents, Dispatch Logs, Ambulances, Hospitals | Clinical notes, paramedic observations, dynamic tags |
| **Schema** | Rigid, normalized, foreign-key enforced | Flexible, dynamic, JSON-like BSON documents |
| **Guarantees** | ACID transactions, strict audit triggers | High-throughput horizontal writes, flexible schema |
| **Query Engine** | SQL (`SELECT ... JOIN ... WHERE`) | Aggregation Pipeline (`$match`, `$unwind`, `$group`) |

### 2. NoSQL Modeling Patterns (`server/db/mongo.js`)
- **One-to-One (1:1) Embedded Model:**
  `IncidentNote` embeds a `dispatchSummary` subdocument directly:
  ```javascript
  const dispatchSummarySchema = new mongoose.Schema({
    ambulanceAssigned: String,
    estimatedArrivalMin: Number,
    hospitalNotified: Boolean,
    primaryParamedic: String
  }, { _id: false });
  ```
  - *Why:* The dispatch summary is always read together with the note. Embedding eliminates expensive joins and guarantees atomic document updates.
- **Many-to-Many (M:N) Referenced Model:**
  `Tag` documents reference an array of incident IDs (`incidentIds: [Number]`).
- **Compound Indexing:**
  ```javascript
  incidentNoteSchema.index({ incidentId: 1, createdAt: -1 });
  ```
  - Optimizes queries filtering by `incidentId` and sorting chronologically descending, reducing query execution time from $O(N)$ table scans to $O(\log N)$ B-tree index traversals.

### 3. MongoDB Aggregation Pipeline (`/api/tags/summary`)
Demonstrated in `server/server.js` and `demos/unit4-mongo-aggregation.js`:
```javascript
const summary = await IncidentNote.aggregate([
  { $unwind: '$tags' },
  {
    $group: {
      _id: '$tags',
      count: { $sum: 1 },
      lastUsed: { $max: '$createdAt' }
    }
  },
  { $sort: { count: -1 } },
  {
    $project: {
      _id: 0,
      tag: '$_id',
      count: 1,
      lastUsed: 1
    }
  }
]);
```
- **Stage 1 (`$unwind`):** Explodes array of tags into separate documents.
- **Stage 2 (`$group`):** Groups by tag name, calculates occurrence count and latest usage timestamp.
- **Stage 3 (`$sort`):** Ranks tags descending by frequency.
- **Stage 4 (`$project`):** Reshapes output fields for clean API delivery.

---

## 2.6 Unit 5: DevOps, Git, Jenkins CI/CD & Apache Tomcat Deployment

### 1. Git Workflow & Version Control
- Branching model: `master` branch holds production-ready code. Features are developed on dedicated branches (`feature/*`) before merging.
- Clean `.gitignore` excludes `node_modules/`, `client/dist/`, build artifacts, and secret `.env` files.

### 2. Jenkins Declarative CI/CD Pipeline (`Jenkinsfile`)
Six distinct automated quality stages:
1. **Stage 1: Checkout & Environment Setup:** Pulls repository revision and logs Node.js, npm, and Java runtime versions.
2. **Stage 2: Install Dependencies:** Executes `npm install` across root and client workspaces.
3. **Stage 3: Run Automated Tests:** Executes `npm test` (`tests/api.test.js`), validating API endpoints, auth, and security.
4. **Stage 4: Build React Production Bundle:** Compiles React code via Vite into `client/dist/`.
5. **Stage 5: Package Tomcat Web Module:** Runs `./tomcat-module/build.sh` to compile servlet and package WAR.
6. **Stage 6: Smoke Test Verification:** Sends curl requests verifying service responsiveness.

### 3. Apache Tomcat 10 Deployment
- Compiled against `tomcat10-servlet-api.jar` (Jakarta EE 10 specification).
- Bundled into `emergency-dispatch.war` containing `WEB-INF/classes` and deployment descriptors.
- Deployed to Tomcat webapps root, serving the live JSP dashboard at `http://localhost:8080/assignment30/emergency-status.jsp`.

---

## 2.7 Unit 6: Authentication (Bcrypt + JWT), Environment Management & Render Deployment

### 1. Authentication Flow
- **Registration (`POST /api/auth/register`):**
  - Generates a cryptographic salt and hashes password using `bcryptjs.hash(password, 10)`.
  - Stores user record with hashed password in MongoDB `users` collection.
- **Login (`POST /api/auth/login`):**
  - Compares submitted plaintext password with stored hash using `bcryptjs.compare()`.
  - Upon success, signs a JSON Web Token (JWT) using `jwt.sign({ id, username, role }, JWT_SECRET, { expiresIn: '24h' })`.
- **Protected Endpoints (`/api/auth/me`):**
  - Middleware checks `req.headers.authorization`.
  - Verifies token signature using `jwt.verify()`.

### 2. Secrets Management & Environment Configuration
- `.env.example` provides a documented template of all required keys without exposing real passwords.
- Production systems inject environment variables dynamically at runtime (`PORT`, `JWT_SECRET`, `MYSQL_HOST`, `MONGODB_URI`).

### 3. Render Deployment Specification (`render.yaml`)
- Infrastructure-as-Code blueprint declaring service name, runtime (`node`), build command (`npm install && npm --prefix client install && npm run build`), start command (`npm start`), and environment variable mappings.

---

## 2.8 Automated Integration Testing & Verification (`tests/api.test.js`)

Our project features an automated integration and security test suite using Node.js native `node:test` and `node:assert`:

```bash
npm test
```

### Verified Test Suites
1. **System Health Check (`GET /api/health`):** Verifies server returns status 200 and operational health.
2. **System Debug & Config (`GET /api/debug`):** Validates database names and environment variables.
3. **Operational KPIs (`GET /api/stats`):** Confirms MySQL aggregates (active incidents, ambulance counts).
4. **Active Incidents Query (`GET /api/incidents`):** Asserts returned records have valid IDs and severities.
5. **Ambulance Fleet Status (`GET /api/ambulances`):** Verifies vehicle fleet counts and statuses.
6. **JWT Authentication Cycle (`POST /api/auth/*`):** Tests operator registration, login, token generation, and protected `/api/auth/me` profile retrieval.
7. **XSS Sanitization Defense:** Submits malicious `<script>alert('xss')</script>` payload and asserts that the stored and returned text is stripped and sanitized.
8. **MongoDB Aggregation Pipeline (`GET /api/tags/summary`):** Validates unwound, grouped, and sorted tag frequencies.

---

## 2.9 Complete FSD Viva Voce Question Bank (40 Questions with In-Depth Answers)

### HTML, CSS & Web Design (Units 1 & 2)
#### Q1: Why are HTML5 semantic tags better than generic `<div>` tags?
> **Answer:** Semantic tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`) convey operational meaning to search engines, screen readers, and browser rendering engines. They improve search engine indexing, accessibility (ARIA landmarks), and code maintainability.

#### Q2: What is the CSS Box Model? How does `box-sizing: border-box` change it?
> **Answer:** The CSS Box Model describes the rectangular boxes generated for elements, consisting of: Content, Padding, Border, and Margin. Under standard `content-box`, setting `width: 200px` applies only to the content; padding and border add to the element's rendered width. Under `border-box`, padding and border are contained within the declared 200px width, simplifying responsive design.

#### Q3: Compare Flexbox and CSS Grid. When do you use each in this project?
> **Answer:** Flexbox is one-dimensional (handles layout along either a row or a column). We use Flexbox for navigation bars, card headers, and button groups. CSS Grid is two-dimensional (handles rows and columns simultaneously). We use CSS Grid for the operational KPI dashboard and card layout grids (`grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`).

#### Q4: What are CSS Media Queries and what does "mobile-first" mean?
> **Answer:** Media queries (`@media (...)`) apply CSS rules conditionally based on device characteristics like viewport width. "Mobile-first" design means writing base styles for small mobile screens first without media queries, then adding `@media (min-width: 768px)` breakpoints to progressively enhance the layout for tablets and desktop screens.

#### Q5: How did you implement Apple Design principles in your React dashboard?
> **Answer:**
> 1. **Tactile feedback:** Buttons compress on pointer-down using `:active { transform: scale(0.97); }`.
> 2. **Translucent materials:** Chrome headers and modals use `backdrop-filter: blur(24px) saturate(190%)` with top light-catching borders (`border-top: 1px solid rgba(255,255,255,0.16)`).
> 3. **Optical typography:** Headings use negative letter tracking (`-0.025em`) while small labels use positive tracking (`+0.03em`).
> 4. **Semantic color hierarchy:** Restrained use of System Red (`#FF453A`), System Orange (`#FF9F0A`), System Green (`#30D158`), and System Blue (`#0A84FF`).

### JavaScript, Node.js & Security (Unit 3)
#### Q6: How does Node.js handle high concurrency despite being single-threaded?
> **Answer:** Node.js uses an asynchronous, non-blocking I/O event loop powered by the `libuv` library. When Node performs an I/O operation (database query, network request, disk read), it registers a callback and delegates the task to the underlying operating system kernel or libuv worker thread pool. The single V8 JavaScript execution thread remains free to handle incoming requests. Once I/O completes, the callback is pushed onto the Event Loop queue.

#### Q7: What is Cross-Site Scripting (XSS) and how does this application prevent it?
> **Answer:** XSS occurs when malicious JavaScript code is injected into an application and executed in the browser of an unsuspecting user. We implement defense-in-depth:
> 1. Our backend `sanitize()` function strips `<script>` tags and encodes angle brackets (`<` to `&lt;`).
> 2. React automatically escapes string values rendered inside JSX `{expression}`, preventing raw HTML injection.
> 3. RegExp constraints reject invalid input formats at the boundary.

#### Q8: What is the difference between CommonJS (`require`) and ES Modules (`import`)?
> **Answer:** CommonJS (`const x = require('x')`) loads modules synchronously at runtime and is the traditional Node.js standard. ES Modules (`import x from 'x'`) are parsed and loaded asynchronously at compile-time, allowing static analysis, tree-shaking, and standardization across browsers and modern Node.js.

#### Q9: What is `EventEmitter` in Node.js? Where is it used?
> **Answer:** `EventEmitter` is a core Node.js class (`events` module) that facilitates the Publisher-Subscriber pattern. In `demos/unit3-node-fs-events.js`, when a new emergency dispatch is created, the system emits a `'dispatchCreated'` event. Registered listener functions asynchronously log the event to disk and trigger downstream alerts without coupling the dispatch logic to the logger.

#### Q10: How does Multer handle file uploads in Express?
> **Answer:** Browsers upload files using `multipart/form-data` encoding. Standard Express body parsers cannot parse multipart streams. Multer is a middleware that intercepts incoming multipart streams, extracts file chunks, validates MIME types and file size limits, and saves files to disk (`server/uploads/`) while populating `req.file` with metadata.

#### Q11: How does Nodemailer send automated emails?
> **Answer:** Nodemailer connects to an SMTP (Simple Mail Transfer Protocol) server via TCP socket. In `server/server.js` and `demos/unit3-email-automation.js`, we configure a transport object with SMTP host, port, and authentication credentials. Nodemailer constructs the RFC 5322 email message format with HTML templates and dispatches it asynchronously to receiving hospital trauma centers.

### Databases, MongoDB & NoSQL (Unit 4)
#### Q12: Why did you use both MySQL and MongoDB in this project?
> **Answer:**
> - **MySQL (Relational):** Owns structured, mission-critical authoritative records (`incidents`, `dispatch_log`, `ambulances`, `hospitals`). Requires ACID transactions, foreign-key relational integrity, and automated audit triggers.
> - **MongoDB (Document):** Owns unstructured, flexible field observations (`IncidentNote`, clinical attachments, dynamic tags `#Cardiac`, `#Shock-Delivered`). Requires fast document embedding (1:1 dispatch summaries) and dynamic multi-stage aggregation pipelines without schema migrations.

#### Q13: Explain the MongoDB Aggregation Pipeline and its stages.
> **Answer:** The Aggregation Pipeline processes documents through sequential stages where each stage transforms the dataset and passes the results to the next:
> 1. `$match`: Filters documents (like SQL `WHERE`).
> 2. `$unwind`: Deconstructs an array field into separate documents.
> 3. `$group`: Groups documents by a specified key and applies accumulators like `$sum`, `$avg`, `$max` (like SQL `GROUP BY`).
> 4. `$sort`: Reorders documents (like SQL `ORDER BY`).
> 5. `$project`: Reshapes fields, adding or suppressing attributes (like SQL `SELECT`).

#### Q14: What is the difference between Embedding and Referencing in MongoDB?
> **Answer:**
> - **Embedding (1:1 or 1:Few):** Nested documents stored directly inside a parent document (e.g., `dispatchSummary` inside `IncidentNote`). Optimal for fast reads and atomic updates when related data is always accessed together.
> - **Referencing (M:N or 1:Many):** Storing document IDs linking to documents in another collection (e.g., `Tag.incidentIds` referencing `Incident.incidentId`). Prevents excessive document growth and avoids data duplication.

#### Q15: What is a Compound Index in MongoDB?
> **Answer:** A compound index holds references to multiple fields within a collection (e.g., `{ incidentId: 1, createdAt: -1 }`). It allows MongoDB to satisfy queries filtering by `incidentId` and sorting by `createdAt` directly from the index tree without performing a separate in-memory sort or scanning unindexed documents.

#### Q16: What is BSON in MongoDB?
> **Answer:** BSON (Binary JSON) is the binary serialization format MongoDB uses to store documents on disk and transmit them over the network. It extends JSON by supporting additional data types such as `Date`, `ObjectId`, `Decimal128`, and raw binary data (`Buffer`).

### DevOps, CI/CD & Deployment (Units 5 & 6)
#### Q17: What is a Declarative Jenkins Pipeline?
> **Answer:** A declarative pipeline is defined within a `Jenkinsfile` using structured, human-readable Groovy syntax. It organizes the continuous integration workflow into distinct `pipeline { stages { stage('...') { steps { ... } } } }` blocks, providing automated execution, environment variable isolation, and built-in failure recovery hooks (`post { failure { ... } }`).

#### Q18: What are the 6 stages in your `Jenkinsfile`?
> **Answer:**
> 1. **Checkout & Environment Setup:** Pulls source code and logs environment versions.
> 2. **Install & Verify Dependencies:** Cleanly installs npm packages.
> 3. **Run Automated Tests & Quality Gates:** Executes `npm test` (`tests/api.test.js`).
> 4. **Build React Production Bundle:** Compiles React code into optimized static assets in `client/dist/`.
> 5. **Package Tomcat Web Module:** Compiles the Java Servlet and packages `emergency-dispatch.war`.
> 6. **Smoke Test Deployment Verification:** Sends curl requests verifying service health.

#### Q19: How does Password Hashing with `bcryptjs` work?
> **Answer:** Plaintext passwords must never be stored. Bcrypt uses a one-way cryptographic hashing function combined with a salt (random bits added to the password). The work factor (cost 10) dictates the number of hashing rounds ($2^{10} = 1024$), making brute-force dictionary attacks and rainbow table lookups computationally infeasible.

#### Q20: Explain the structure and verification of a JSON Web Token (JWT).
> **Answer:** A JWT consists of three Base64URL-encoded parts separated by dots (`header.payload.signature`):
> 1. **Header:** Algorithm and token type (`{"alg": "HS256", "typ": "JWT"}`).
> 2. **Payload:** Claims containing user data and expiration (`{"id": 1, "username": "admin", "exp": 1718000000}`).
> 3. **Signature:** Hash computed by `HMAC-SHA256(header + "." + payload, secret)`.
> The server verifies the signature on incoming requests using the secret key, ensuring the token has not been tampered with by the client.

---

# Verification & Defense Summary

When defending this project in your university viva:
1. **Show the Live Application:** Open `http://localhost:5000` (React SPA + Express) and `http://localhost:8080/assignment30/emergency-status.jsp` (Tomcat + JSP).
2. **Execute the Automated Test Suite:** Run `npm test` in the terminal to demonstrate that all 8 automated integration and security tests pass.
3. **Demonstrate Architectural Integrity:** Highlight that the original Java JDBC core and MySQL triggers remain intact while the full stack ecosystem adds modern web capabilities.
4. **Reference this Guide:** Use the exact line references, class diagrams, and question answers provided above to confidently address any question the examiners pose.
