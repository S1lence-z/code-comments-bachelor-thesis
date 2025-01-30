### New Specification

## 1. Code Commenting Platform (CodeComments)

### New Specification

This application should be a client-side only tool designed for code commenting and collaboration, focusing on education use cases. It should work as a standalone tool but could potentially be integrated into other systems as means to provide the said functionality.

The application will not be bound to any backend functionality.
I think that the backend could provide very simple user management, so that the comments could be authored by users so people would not pretend to be someone else. This functionality could of course be achieved solely on the client-side (with the URL "username" param).

### Features

#### Core Features

1. **Configuration via URL**

    - URL parameters specify:
        - Repository location (may be in the comment/data source)
        - Comment source - from external source (http endpoint), includes tags and available tags
        - Security tokens - is included either in the header or in the body of the req, think about more possibilities of input
    - Enables quick setup without backend configuration
    - Hosted on github pages
    - to the data source templates may be added which describe common issues so they can be quickly added as quick suggestions - quick fill (text + tags)
    - suggestion:
        - through api or (linter service) finished comments (tags and text included) could be added so the teacher would only do like a review of a review (the first review was done by the api or linter) - SUGGESTION
        - tags would indicate if it is a suggestion or not
    - tags' visibility could be set in the data source

2. **Inline Commenting**

    - Users can comment on specific lines of code
    - Comments are tied to:
        - Code line
        - Version/commit
        - User
        - Timestamp
    - Supports threaded discussions for clarification
    - Give the reviewer an option to link comments about similar problems (using var)
        - Option to add comments or to link comment to an existing problem (= existing comment), highlight the linked place
    - the comment source should include a set of features which work on a enable/disable basis

3. **Client-Side Operations**

    - Code and comments are fetched to the client
    - Enables offline review once data is loaded
        - give th user an option to download the comments source for offline use (to the fs)
    - Check if the is available if it is not then show loading screen and ask again after timeout
        - using 503, service unavailable, retry after (specified in seconds) in the http req header
        - error 401 unauthorized access (wrong security token, check again)

4. **Security**

    - Secure token integration for authentication
    - No sensitive data stored locally on the client

5. **Lightweight Git Integration**
    - Integrates with Git repositories via configuration (clone/pull/push managed externally)
    - Users handle repository management independently

#### Optional Backend Features

1. **User Management**

    - Saving users names and comments so they can be found in the future

2. **Code Quality Review**

    - Based on the comments and their tags you could see what areas of coding you should improve (logic, code quality, ...) and see the improvemetns over time as well as see the most problematic areas.
    - Not necessarily on the backend, may be shown as a window using hte data from the loaded comments source

3. **Enhanced Comment Management**

    - Advanced comment storage and retrieval
    - Analytics for teacher feedback and comment patterns

#### Additional Features

1. **Tags for Comments**

    - Logical tagging (e.g., "Logic", "Optimization", "Code Quality")
    - Searchable comment tags for efficient review

2. **Feedback Highlighting**

    - included in the code quality review

3. **Project Overview**

    - included in the code quality review

4. **Feedback Summary**
    - Export resolved/unresolved comment lists.
    - Generate detailed performance reports for students.

---

### Workflow Example

#### 1. **Configuration and Setup**

-   The teacher provides a URL containing repository and comment configuration (a repo containing the source code to be commented)

#### 2. **Code Review**

-   Code is loaded into the client from the specified repository
-   Users can leave comments directly on code lines
-   Comments include:
    -   Tags
    -   Attachments
    -   Timestamps

#### 3. **Collaboration**

-   Users reply to comments and mark them as resolved (by adding tags)
-   Using commit messages and their respective #number, they could be closed and updated using webhooks

#### 4. **Feedback and Project Closure**

-   Teachers review and consolidate feedback
-   Students receive a summary of feedback and performance metrics
    -   should be manged by the backend if needed

---

## Tech Stack

    - Vite + Vue + Tailwind CSS
    - Backend: ASP.NET, Flask (as it should be simple, otherwise Django)
    - Code editor: ACE, CodeMirror, highligh.js (static rather not)
