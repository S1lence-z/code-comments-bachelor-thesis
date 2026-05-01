# User Testing Guide

This guide walks you through everything needed to participate in user testing of the platform - from setup to completing the scenarios and submitting feedback. Follow it top to bottom.

## 1. Overview

This is just an overview of the user testing process. During the test you will:

1. Set up access to the application.
2. Play the role of a **reviewer**.
3. Play the role of a **reviewee**.
4. Fill in a short SUS (System Usability Scale) questionnaire.

The full session takes roughly 20 minutes.

## 2. Setup

Before the testing process itself, you have to choose how you want to access the application. There are two options:

- **Option A - Deployed Version.** Nothing to install. You use the publicly hosted frontend and backend.
- **Option B - Local Setup with Docker.** You run the whole stack on your machine. Requires Git and Docker.

### Option A - Deployed Version

1. Open the manager app in your browser: <https://codecomments.jirizelenka.me/setup>
2. Contact the author (Jiří Zelenka, [j3.zelenka@gmail.com](mailto:j3.zelenka@gmail.com)) to obtain the credentials for the testing project. You will need these in the scenarios.

### Option B - Local Setup with Docker

**Prerequisites**

- Git
- Docker Desktop with Docker Compose

**Steps**

1. Clone the repository:
    ```bash
    git clone https://github.com/S1lence-z/code-comments.git
    cd code-comments
    ```
2. Create the env file by copying the example (defaults are sufficient for testing - no edits required):
    ```bash
    cp .env.example .env
    ```
3. Start the stack:
    ```bash
    docker compose up -d
    ```
4. Wait until all containers are healthy, then open <http://localhost/> and confirm the manager app loads.

## 3. User Scenarios

Both scenarios are identical for Option A and Option B — only the server URL and password differ.

**Reference - use the row that matches your setup:**

| Option           | Server URL                            | Project password                               |
| ---------------- | ------------------------------------- | ---------------------------------------------- |
| A (Deployed)     | `https://codecomments.jirizelenka.me` | provided by the author                         |
| B (Local Docker) | `http://localhost`                    | see `JWT_PROJECT_PASSWORD` in your `.env` file |

### Scenario 1: Reviewer

1. Open the setup page from section 2.
2. In the setup form, enter the **server URL** for your option (see the reference table above). You may click the **Use this URL** button next to the field to auto-fill the server URL of the manager app you are currently on.
3. Paste the URL of any public repository into the form.
4. Enter the **project password** and create a new project.
5. Open a file in the repository and add a single-line comment.
6. Add a multi-line comment spanning several lines to a different file.
7. Add a file-level comment.
8. Add a project-level comment.
9. Edit one of the previously added comments.
10. Delete one of the previously added comments.
11. Copy the URL and send it to the reviewee (open it in a new tab to verify it works).

### Scenario 2: Reviewee

1. Open the shared review link in a browser.
2. Open the **overview page** to see all comments and which files they belong to.
3. Open each commented file from the overview.
4. Reply to every singleline and multiline comment.
5. Return to the overview page and verify all your replies are listed correctly.

## 4. Post-Scenario Feedback

After completing both scenarios, please fill out the SUS (System Usability Scale) questionnaire via [Google Forms](https://forms.gle/WPa8LhqYCPfKGticA).

Thank you for participating!
