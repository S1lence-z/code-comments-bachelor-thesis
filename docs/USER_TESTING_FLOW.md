# User Testing Guide

This guide walks you through everything needed to participate in user testing of the platform - from setup to completing the scenarios and submitting feedback. Follow it top to bottom.

## 1. Overview

The testing was conducted with potential users - mainly students with some technical background for whom the platform could be usable.

During the test you will:

1. Set up access to the application (one-time, see section 3).
2. Play the role of a **reviewer**: configure a project and leave several kinds of comments on a public repository.
3. Play the role of a **reviewee**: open the shared review link and reply to the comments.
4. Fill in a short SUS (System Usability Scale) questionnaire.

The full session takes roughly 10–20 minutes.

## 2. Choose a Testing Environment

Two setups are offered. Pick **one** and follow the matching subsection in section 3.

- **Option A - Staging Deployment.** Nothing to install. You use the publicly hosted frontend and backend.
- **Option B - Local Setup with Docker.** You run the whole stack on your machine. Requires Git and Docker; useful if you want to test the self-hosted scenario.

> ⚠️ **Note:** The staging deployment (Option A) is intended for testing purposes and does not represent a fully production-grade service.

## 3. Setup

### Option A - Staging Deployment

1. Open the manager app in your browser: <https://codecomments.jirizelenka.me/setup>
2. Contact the author (Jiří Zelenka, [j3.zelenka@gmail.com](mailto:j3.zelenka@gmail.com)) to obtain:
    - the **staging backend URL** - paste it into the _backend URL_ field of the setup form, and
    - the **project password** - required when creating the project.
3. Note your **frontend URL** for the scenarios below: `https://codecomments.jirizelenka.me`

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
5. Note the values you will use in the scenarios:
    - **Frontend URL:** `http://localhost`
    - **Backend URL** (paste into the setup form's _backend URL_ field): `http://localhost/server`
    - **Project password** (default from `.env.example`): `testing123`

## 4. User Scenarios

Both scenarios are identical for Option A and Option B - only the URL differs. Wherever you see `<FRONTEND_URL>` below, substitute the frontend URL from your setup section:

- Option A: [`https://codecomments.jirizelenka.me`](https://codecomments.jirizelenka.me)
- Option B: [`http://localhost`](http://localhost)

### Scenario 1: Reviewer

1. Open the setup page: `<FRONTEND_URL>/setup`
2. In the setup form, enter the **backend URL** noted in section 3.
3. Paste the URL of any public repository into the form.
4. Enter the **project password** and create a new project.
5. Open a file in the repository and add a single-line comment.
6. Add a multi-line comment spanning several lines.
7. Add a file-level comment.
8. Add a project-level comment.
9. Edit one of the previously added comments.
10. Delete one of the previously added comments.
11. Copy the generated review link and send it to the reviewee.

### Scenario 2: Reviewee

1. Open the shared review link in a browser.
2. Locate the files in which comments were added.
3. Open each commented file.
4. Reply to every comment.
5. Visit the overview page and verify that all comments are listed correctly.

## 5. Post-Scenario Feedback

After completing both scenarios, please fill out the SUS (System Usability Scale) questionnaire via [Google Forms](https://forms.gle/WPa8LhqYCPfKGticA).

Thank you for participating!
