📌 Task: Implement a real-time, searchable SSH Event Log API with complimentary UI
Overview
You will be working with a full-stack logging system that captures SSH events in real-time,
stores them in a searchable SQLite database, and exposes an API for querying and streaming logs. The goal is to enhance the system by:

Implementing an efficient full-text search (FTS) API using SQLite’s FTS5.
Creating a frontend table to display, filter, and search SSH events.
Ensuring real-time log updates by integrating streaming capabilities.
🚀 Project Setup
🔹 Technologies
We use the latest tech across the stack:

Backend: Node.js (Express, SQLite, Drizzle ORM, EventEmitter + SSE for real-time updates).
Frontend: Remix (React Router v7), Material UI, Phosphor Icons.
Log Processing: Vector for dynamic log ingestion & normalization.
Containerization: Docker Compose for node + vector, and a separate Dockerfile for Remix.
🔹 Development Workflow
The backend is not compiled; instead, tsc is used for type checking only.
Execution uses --experimental-strip-types to run the TypeScript code directly in Node.js.
The Vector service dynamically determines the log source based on the existence of mounted files.
🎯 Your Task
1️⃣ Implement a Full-Text Search API for SSH Events
🔹 Modify the Express API to support searching SSH event logs using SQLite’s FTS5.
🔹 Ensure efficient querying, removing duplicate results.
🔹 Use content_rowid='id' for proper correlation between logs and search results.
🔹 Optimize the query to return only the most relevant matches.

✅ Key API Endpoints

Method	Endpoint	Description
POST	/api/log-events	Ingests SSH logs into the database
GET	/api/log-events/search?q=<query>	Searches logs with FTS5
GET	/api/log-events	Fetches paginated logs
GET	/api/log-events/stats	Returns aggregated SSH event statistics
GET /api/log-events/stream Return the raw events, coing from vector (real-time, component)
2️⃣ Implement a UI for Viewing SSH Events
🔹 Create a data table in Remix to display SSH logs.
🔹 Include columns for:

Timestamp (formatted for readability)
Username
IP Address
Hostname
Status (Success/Failed with icons)
Auth Method
Matched Field (Shows what field was matched in search) 🔹 Implement sorting, pagination, and search filtering.
✅ Key UI Features

Feature	Description
Dynamic Data Table	Renders logs with user-friendly formatting.
Search Input	Queries the backend /api/log-events/search endpoint.
Status Icons	Uses Phosphor Icons to indicate login success/failure.
Pagination	Supports limit & offset for loading large datasets.
3️⃣ Enable Real-Time Log Updates (Bonus)
🔹 Extend the Express server to support WebSockets or Server-Sent Events (SSE).
🔹 When a new SSH event is logged, push updates to connected clients.
🔹 Modify the UI to automatically update when new logs arrive.

✅ Key Enhancements

Feature	Description
WebSocket/SSE API	Streams real-time log updates to the UI.
Live Updates	New logs appear instantly without page refresh.
🔧 How to Run the Project
🔹 Using Docker Compose
1️⃣ Clone the repo:

sh
Copy
Edit
git clone https://github.com/your-repo.git && cd your-repo
2️⃣ Start services:

sh
Copy
Edit
docker-compose up -d
3️⃣ Access the Remix UI at:
👉 http://localhost:8080
