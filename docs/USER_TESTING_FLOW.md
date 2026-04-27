# Testing Process

The testing was conducted with potential users, mainly students with some technical background for whom the platform could be usable.

## Testing Environment

In all scenarios, participants accessed the deployed production frontend at [https://codecomments.jirizelenka.me/setup](https://codecomments.jirizelenka.me/setup). The only difference between the two setups is which backend stores the review data:

1. **Production backend** — participants used the publicly hosted backend directly through the production frontend. No installation or local setup was required.
2. **Local backend via Docker** — participants who preferred to test the self-hosted scenario ran the backend services locally using Docker Compose and pointed the production frontend at their local backend through the setup form.

Note: The production deployment is intended for testing purposes and does not represent a fully production-grade service.

## User Scenarios

The main user scenarios were defined in accordance with the system requirements.

### Scenario: Reviewer

1. Open [https://codecomments.jirizelenka.me/setup](https://codecomments.jirizelenka.me/setup) in a browser.
2. _(Local backend only)_ Clone the repository, configure the `.env` file, and run `docker compose up pgsql adminer server nginx` to start the backend locally.
3. _(Local backend only)_ In the setup form, enter the local backend URL (`http://localhost/server`) into the backend URL field.
4. Paste the URL of any public repository into the setup form.
5. Create a new project.
6. Open a file in the repository and add a single-line comment.
7. Add a multi-line comment spanning several lines.
8. Add a file-level comment.
9. Add a project-level comment.
10. Edit one of the previously added comments.
11. Delete one of the previously added comments.
12. Copy the generated review link and send it to the reviewee.

### Scenario: Reviewee

1. Open the shared review link in a browser.
2. Locate the files in which comments were added.
3. Open each commented file.
4. Reply to every comment.
5. Visit the overview page and verify that all comments are listed correctly.

## Post-Scenario Feedback

After completing the scenarios, participants filled out the SUS (System Usability Scale) questionnaire via [Google Forms](https://forms.gle/WPa8LhqYCPfKGticA).
