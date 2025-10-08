# CodeComments (Bachelor Thesis)

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![ASP.NET](https://img.shields.io/badge/ASP.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white)

## Running Project Locally

To run the project locally, you will need [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/).

First, clone the repository:

```bash
git clone https://github.com/S1lence-z/code-comments-bachelor-thesis.git
cd code-comments-bachelor-thesis
```

Next, create a `.env` file in the root of the project with the following content (or just rename the file `.env.example` to `.env`):

```env
# Port configuration
CLIENT_PORT=3000
SERVER_PORT=5000

# Client/Server configuration
VITE_GITHUB_PAT=
VITE_API_BASE_URL=http://localhost/server
VITE_CLIENT_BASE_PATHNAME=/client
```

> **⚠️ Warning:** Not providing the `VITE_GITHUB_PAT` variable gives you a very limited rate of requests to the GitHub API (50 requests per hour). To increase this limit to 5000 requests per hour, you can create a [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and set it as the value of the `VITE_GITHUB_PAT` variable. If you do not want to create a token, you must leave the variable empty.

Finally, run the following commands to build and start the application:

```bash
docker compose build --no-cache
docker compose up
```

The applications will be available at the following URLs:

-   Client: [http://localhost/](http://localhost/)
-   Server (Swagger UI): [http://localhost/server/swagger/index.html](http://localhost/server/swagger/index.html)

---

## Bachelor Thesis Specification

The full [specification](./docs/Specification.md) for the thesis is available in the following document.

## Overleaf

The [thesis](https://www.overleaf.com/project/679d4155c4e6d540df8ca774) is written in LaTeX and managed on Overleaf.
