
# MicroHub Architecture & Data Connectivity

This document outlines the current data flow architecture using Google Sheets as a database, and proposes an ideal, scalable architecture for future iterations or professional applications.

---

## 1. Current Architecture: The Google Sheets "Backend"

MicroHub currently operates on a **Serverless-frontend** model where Google Sheets acts as the Headless CMS and Database. The bridge between the React frontend and the raw spreadsheet data is **Google Apps Script (GAS)** deployed as a Web App.

### The Connection Flow

1.  **Frontend (`services/sheet.ts`)**:
    *   The app sends HTTP requests (`fetch`) to the Google Apps Script URL.
    *   **GET Requests**: Used to pull all data at once on app load.
    *   **POST Requests**: Used to perform actions (`sync_sheet`, `setup_new_user`, `login`).
    *   **Security**: A 6-digit `authKey` is sent with requests. The backend hashes this key and compares it to a stored hash in the `App_Config` sheet.

2.  **The Bridge (`backend/Code.gs`)**:
    *   Acts as the API Gateway.
    *   **`doPost(e)`**: Parses JSON payloads, acquires a `Lock` (to prevent race conditions), and routes to specific handlers.
    *   **`doGet(e)`**: Verifies credentials and returns the entire state of the database.

3.  **The Database (Google Sheets)**:
    *   Data is stored in specific tabs (Sub-sheets).

### App-Specific Data Mapping

#### A. Task Manager (`Task_Tracker` Sheet)
*   **Sync Strategy**: Full Replace. The app sends the current state of tasks, and the sheet clears existing data (preserving headers) and rewrites it.
*   **Columns**:
    1.  `ID`: Unique Timestamp string.
    2.  `Title`: Task name.
    3.  `Description`: Details.
    4.  `Priority`: 'High' | 'Medium' | 'Low'.
    5.  `Status`: 'Backlog' | 'Active' | 'Archive'.
    6.  `Created At`: ISO Date string.
    7.  `Completed At`: ISO Date string (if archived).

#### B. Journal App (`Journal_Notes` Sheet)
*   **Sync Strategy**: Append/Update (Batch).
*   **Columns**:
    1.  `ID`: Unique Timestamp string.
    2.  `Date`: Display date (e.g., "28 Feb").
    3.  `Title`: Entry title.
    4.  `Content`: Markdown string.
    5.  `Tags`: Comma-separated string (e.g., "Mindset,Idea").

#### C. Movie App (`Cinema_Log` Sheet)
*   **Sync Strategy**: Full Replace.
*   **Columns**:
    1.  `ID`: Unique Timestamp string.
    2.  `Title`: Movie name.
    3.  `Year`: Release year.
    4.  `Director`: Director name.
    5.  `Genre`: Comma-separated string.
    6.  `Status`: 'watchlist' | 'watched'.
    7.  `Poster URL`: Link to image resource.

#### D. System Config (`App_Config` Sheet)
*   **Purpose**: Stores authentication and user metadata.
*   **Structure**: Key-Value pairs (User Name, Auth Hash, Created At).

---

## 2. The Ideal Architecture: Professional Scale

While Google Sheets is excellent for personal micro-apps (free, visual, easy), a production-grade application requires a robust database to handle concurrency, complex relationships, and security.

### Proposed Stack
*   **Database**: PostgreSQL (via Supabase or Neon).
*   **Backend**: Serverless Edge Functions or Node.js API.
*   **Auth**: OAuth 2.0 / JWT (JSON Web Tokens).

### How the "Ideal" Connection Works

#### 1. Real-Time Synchronization (WebSockets)
Instead of the "Fetch -> Wipe -> Rewrite" model used in MicroHub, an ideal app uses **subscriptions**.
*   **Behavior**: When a user adds a task, the frontend optimistically adds it to the UI.
*   **Background**: A WebSocket connection pushes *only the new row* to the database.
*   **Update**: Other devices logged into the same account receive a "Push" event instantly, updating their UI without a page reload or manual sync.

#### 2. Row Level Security (RLS)
*   **Current (Sheets)**: The script has full access to the sheet. Security relies on a simple hash check.
*   **Ideal**: The database enforces security. A query like `SELECT * FROM tasks` automatically adds `WHERE user_id = current_user`. This ensures that even if the frontend code is hacked, a user cannot read another user's data.

#### 3. Data Structure (Relational)
Instead of storing comma-separated tags or genres (string parsing is slow), an ideal setup uses relational tables:
*   `users` table (id, email, password_hash)
*   `tasks` table (id, user_id, content...)
*   `tags` table (id, name)
*   `task_tags` junction table (task_id, tag_id)

#### 4. Offline-First (CRDTs)
*   **Current**: If the network fails, the sync fails.
*   **Ideal**: Use a local database (like IndexedDB) on the device.
    1.  App reads/writes to Local DB (instant).
    2.  A background worker (Sync Engine) watches the network.
    3.  When online, it pushes local changes to the cloud and pulls remote changes, handling conflicts automatically (using CRDTs or Last-Write-Wins logic).

### Summary Comparison

| Feature | Current (MicroHub) | Ideal (Professional App) |
| :--- | :--- | :--- |
| **Protocol** | HTTP REST (Polling) | WebSockets (Real-time) |
| **Data Format** | JSON Array of Arrays | Typed JSON / Binary |
| **Security** | Shared Secret (Key) | JWT / OAuth + RLS |
| **Speed** | 1-2 Seconds (Script Lock) | < 100ms |
| **Storage** | Spreadsheet Cells | SQL Tables / NoSQL Documents |
| **Concurrency** | Low (One writer at a time) | High (Thousands of concurrent users) |
