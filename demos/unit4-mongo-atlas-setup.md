# MongoDB Atlas, Replication, & Storage Concepts (Unit 4)

This document satisfies the theoretical and administrative requirements of **Unit 4: Database Intro & MongoDB** in the Full Stack Development syllabus.

---

## 1. SQL vs NoSQL: Domain Mapping in Emergency Response

In our **Smart Integrated Healthcare Response & Emergency System**, both database paradigms are utilized for their distinct strengths:

| Architectural Trait | MySQL (Relational / SQL) | MongoDB (Document / NoSQL) |
| :--- | :--- | :--- |
| **Data Role** | **Authoritative Core Records** | **Dynamic Operational Notes & Attachments** |
| **Entities Stored** | Incidents, Dispatch Logs, Ambulances, Hospitals, Responders, Patients | Incident Notes, Clinical Tags, Metadata of Scene Attachments, Dispatch Summaries |
| **Schema Strictness** | Strict relational schema with foreign keys (`FOREIGN KEY (incident_id)`) | Flexible, polymorphic schema (`IncidentNoteSchema`) |
| **Transaction Guarantee** | Full ACID (Atomicity, Consistency, Isolation, Durability) | Document-level atomicity, multi-document transactions |
| **Integrity Checks** | Automatic database triggers (`audit_log` on insert/update) | Application-level validation via Mongoose |
| **Primary Query Style** | SQL joins (`JOIN ambulances ON ...`) | Aggregation pipelines (`$match`, `$group`, `$unwind`) |

---

## 2. MongoDB Storage Engine & WiredTiger

MongoDB 8+ uses the **WiredTiger** storage engine:
1. **Document-Level Concurrency:** Allows multiple concurrent clients to write to different documents within the same collection simultaneously without table/collection locking.
2. **Compression:** WiredTiger supports snappy compression by default for collections and prefix compression for all indexes, drastically reducing disk footprint.
3. **Checkpoints & Journaling:** Writes are written to an on-disk journal before being committed to data files every 60 seconds (or 2GB of journal data), ensuring crash recovery and durability.

---

## 3. MongoDB Replication & High Availability

In a healthcare emergency system, zero downtime is non-negotiable. MongoDB achieves this via **Replica Sets**:
- **Primary Node:** Receives all write operations and records all changes in its operations log (`oplog`).
- **Secondary Nodes (e.g., 2 or more replicas):** Continuously replicate the Primary's oplog and apply operations asynchronously.
- **Automatic Failover:** If the Primary node fails or becomes unreachable for >10 seconds, the secondaries hold an automated election using the Raft consensus algorithm and elect a new Primary seamlessly.
- **Read Preference:** Can be set to `secondaryPreferred` for analytical reporting queries (like monthly dispatch metrics), leaving the primary dedicated to urgent emergency dispatch writes.

---

## 4. Setting Up MongoDB Atlas (Cloud Database)

To connect this application to a cloud-hosted MongoDB Atlas cluster:

1. **Create Atlas Account:** Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Deploy Free Tier (M0) Cluster:** Choose AWS or Google Cloud region closest to your deployment (e.g., Mumbai `ap-south-1`).
3. **Database Access User:** Create a database user with username and secure password (e.g., `ems_user`).
4. **Network Access (IP Whitelist):**
   - For local development: Add current IP address.
   - For Render / Cloud hosting: Add `0.0.0.0/0` (allow access from anywhere with credentials).
5. **Get Connection String:**
   Under **Database** → **Connect** → **Drivers (Node.js)**:
   ```text
   mongodb+srv://ems_user:<password>@cluster0.abcde.mongodb.net/emergency_dispatch_supplementary?retryWrites=true&w=majority
   ```
6. **Set Environment Variable:**
   In your `.env` file or Render Environment configuration:
   ```bash
   MONGODB_URI=mongodb+srv://ems_user:YourSecurePass@cluster0.abcde.mongodb.net/emergency_dispatch_supplementary?retryWrites=true&w=majority
   ```
   The backend in `server/db/mongo.js` automatically reads `process.env.MONGODB_URI` and connects without requiring code changes!
