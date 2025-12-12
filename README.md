# CodeComments (Bachelor Thesis)

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D) ![Nuxt.js](https://img.shields.io/badge/Nuxt.js-00C58E.svg?style=for-the-badge&logo=nuxt&logoColor=white) ![ASP.NET](https://img.shields.io/badge/ASP.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

CodeComments helps teams and students annotate and discuss source code directly in the browser — supporting project reviews, inline comments, and educational workflows.

## Live Demo Available

You can try the live demo of CodeComments without any setup [here](https://codecomments.jirizelenka.me).

## Running Locally

To run the project locally, you will need [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/).

First, clone the repository:

```bash
git clone https://github.com/S1lence-z/code-comments-bachelor-thesis.git
cd code-comments-bachelor-thesis
```

Next, create a `.env` file in the root of the project with the following content (or just rename the file `.env.example` to `.env`):

```env
# Port configuration
SERVER_PORT=5000
CLIENT_PORT=3000
MANAGER_PORT=3001
DB_PORT=5432
ADMINER_PORT=8081

# URLs (for reverse proxy setup)
VITE_SERVER_URL=http://localhost/server
VITE_MANAGER_URL=http://localhost
VITE_CLIENT_URL=http://localhost/client
VITE_CLIENT_BASE_PATHNAME=/client

# JWT Settings (for auth)
JWT_SECRET=aslkdjfaljeliqtlijflisjdfliaj774343kjljFFLKFJSLKFJSLKDf
JWT_ISSUER=http://localhost/server
JWT_EXPIRATION_MINUTES=60
JWT_PROJECT_PASSWORD=testing123

# PostgreSQL Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=verysecure123
DB_NAME=code_comments
```

Finally, run the following commands to build and start the application:

```powershell
docker compose build --no-cache
docker compose up
```

The applications will be available at the following URLs by default:

-   Manager: `http://localhost/`
-   Client: `http://localhost/client/`
-   Server (Swagger UI): `http://localhost/server/swagger/index.html`

## Bachelor Thesis

### Overleaf

The [thesis](https://www.overleaf.com/project/679d4155c4e6d540df8ca774) is written in LaTeX and managed on Overleaf.

### Wiki

> ⚠️ **Warning:** The wiki is not finished yet and may contain incomplete or outdated information.

The project wiki contains additional documentation about the architecture, design decisions, and implementation details. You can find it [here](https://github.com/S1lence-z/code-comments-bachelor-thesis/wiki).
