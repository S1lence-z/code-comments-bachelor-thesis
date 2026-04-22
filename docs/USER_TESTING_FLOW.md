# Testing Process

The testing was conducted with potential users, mainly students with some technical background for whom the platform could be usable.

## Testing Environment

Two distinct testing setups were offered to participants, allowing them to choose based on their technical comfort:

1. **Production deployment** — participants accessed the publicly hosted instance of the application. No installation or local setup was required; they used only the shareable project link in their browser.
2. **Local deployment via Docker** — participants who preferred to test the self-hosted scenario ran the server application locally using Docker Compose, following the deployment documentation.

Note: The production deployment is intended for testing purposes and does not represent a fully production-grade service.

## User Scenarios

The main user scenarios were defined in accordance with the system requirements.

### Scenario: Reviewer

1. Access the application — either open the production URL in a browser or run the server application locally using Docker Compose.
2. Choose any public repository and create a new project.
3. Add all types of comments — single-line, multi-line, file-level, and project-level.
4. Revise the comments that were added (edit or delete).
5. Share the generated review link with the reviewee.

### Scenario: Reviewee

1. Open the shared link to load the commented project.
2. Navigate through the files where comments were added.
3. Reply to all comments.

## Post-Scenario Feedback

After completing the scenarios, participants filled out the SUS (System Usability Scale) questionnaire via [Google Forms](https://forms.gle/WPa8LhqYCPfKGticA).
