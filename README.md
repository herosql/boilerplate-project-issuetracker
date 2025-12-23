# Issue Tracker API (RESTful Task Management)

### 🎯 Objective
A professional-grade Issue Tracking API designed to manage project tasks and bug reports. This project focuses on complex database filtering, multi-project data isolation, and rigorous functional testing.

### 🛠 Tech Stack
- **Backend:** Node.js & Express
- **Database:** MongoDB & Mongoose
- **Testing:** Chai & Mocha (Comprehensive Functional Testing)

### 🚀 Key Features
- **Dynamic Multi-Project Support:** Allows users to create and manage separate issue lists for different projects via dynamic URL parameters (e.g., `/api/issues/{project}`).
- **Advanced Filtering:** Implements a versatile GET endpoint that supports filtering issues by any combination of fields (e.g., status, creator, open/closed, etc.).
- **Full CRUD Operations:**
    - **POST:** Create issues with required and optional metadata.
    - **PUT:** Support for partial updates (updating one or multiple fields simultaneously).
    - **DELETE:** Secure removal of issues using unique object IDs.
- **Robust Error Handling:** Returns specific error messages for missing IDs, invalid update fields, or failed deletions to ensure a smooth frontend integration.
- **Automated QA:** Includes 14+ functional tests covering all API routes and edge cases (such as updating an issue with no fields provided).

### 🧪 Technical Highlight
The project showcases proficiency in **Mongoose dynamic queries**, enabling the backend to build search objects on the fly based on variable URL query parameters, ensuring high flexibility for client-side data filtering.
