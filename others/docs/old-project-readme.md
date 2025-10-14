## Docker Compose

The project uses Docker Compose to manage the development environment. The `docker-compose.yml` file is located in the root directory of the repository.

### Backend Project

### Backend API Configuration

Copy the following into your `.env` file:

```env
BACKEND_API_PORT=3500
BACKEND_HOSTNAME=http://localhost
FRONTEND_BASE_URL=http://localhost:5000
```

### Frontend Project

Copy the following into your `.env` file for the frontend project. You may provide your own GitHub Personal Access Token (PAT) to enable higher API rate limits. If you do not provide a PAT, the application will still work, but with significantly lower rate limits.

```env
VITE_GITHUB_PAT=your_github_pat_here
```

## New Features Overview

All currently implemented features. Refactoring bound to happen!

### Setup Page

-   List all projects available on the server

### App Navigation Bar

-   Server sychronization status
-   Comments Export Button
    -   Export to JSON or JSON-LD

### Code Review Page

#### Toolbar

-   Hide/Show File Explorer
-   Keyboard Mode - enables keyboard navigation and keyboard shortcuts inside the code editor
-   Save Workspace Button - saves open tabs into local storage, saved for each open project, if checked

#### File Explorer

-   Comment Indication - if a file/folder contains a comment, a yellow dot with a chat bubble appears on the right side
-   Add file comment button - each file/folder has a plus icon ehich is used to add a comment to it as a whole
-   Add project comment button - adds a comment to the project as a whole

#### Code Editor (Codemirror + PDF/Image Viewer)

-   Adding singleline/multiline comments
-   Viewing images, PDF files - if a file cannot be showed, a view link is provided
-   File tabs are used to manage open files under the toolbar
-   Multifile view - you can open more files at once next to each other
    -   Dropzones - you can drop the file tabs into a left/right dropzone which will open a new panel for this file (just like in a code editor!)

### Overview Page

-   Summary Cards providing an overview about the given comments
-   Comments Browser used to see the commented along with the related code and categories
    -   You can directly navigate to the commented code using the 'Inspect' button
-   Filtering - you can filter by comment types and both the cards and browser will change accordingly
