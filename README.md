<!-- Using Readme Template from https://github.com/othneildrew/Best-README-Template -->
<a id="readme-top"></a>
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://indoormaps.onrender.com/">
    <img src="https://indoormaps.onrender.com/logoWithBg.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Indoor Maps</h3>

  <p align="center">
    The easiest free way to create searchable and shareable maps of any building | School | University | Convention Center | Airport | Office
    <br />
    <a href="https://indoormaps.onrender.com/">View Live</a>
    ·
    <a href="https://github.com/Theo-s-Meta-Capstone/IndoorMaps/issues">Report Bug</a>
    ·
    <a href="https://github.com/Theo-s-Meta-Capstone/IndoorMaps/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#built-with">Built With</a></li>
 <!--   <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li> -->
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

IndoorMaps is the easy way to create useful and accurate maps of any building.

#### Explainer Video:

[![Video Explaining Indoor Maps](https://img.youtube.com/vi/wRfgbXuqUws/0.jpg)](https://www.youtube.com/watch?v=wRfgbXuqUws)
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```
* Node 18 (or newer - the deployment is Node 20 running on Bun)
  * Using nvm
  ```sh
  nvm install 18
  run nvm use 18
  ```
* A Postgres Server
  * The link to your postgres server will go into your backend .env file

#### Optional

* A Here API Key
  * Get An API Key at [HERE](https://developer.here.com/)
* REDIS server
  * Spin up a local dev server easily with `docker run -p 6379:6379 -it redis/redis-stack-server:latest`
* AWS account with SES set up
  * Not an easy process to aquire, not required for any other functionality
  * If using a new AWS account
    * Need to upload the email template [IndoorMapsBackend/src/email/verificationTemplate.json](https://github.com/Theo-s-Meta-Capstone/IndoorMaps/blob/main/IndoorMapsBackend/src/email/verificationTemplate.json) to your aws account as VerifyIndoorMapsEmail.
    * Need to change the source email and aws region to proper values for your account in [IndoorMapsBackend/src/email/setup.ts](https://github.com/Theo-s-Meta-Capstone/IndoorMaps/blob/main/IndoorMapsBackend/src/email/setup.ts)
### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Theo-s-Meta-Capstone/IndoorMaps.git
   cd IndoorMaps/
   ```
2. Enter your backend env variables in `IndoorMapsBackend/.env`
   ```sh
   touch IndoorMapsBackend/.env
   ```
   `Then use your favorite editor to add these values`
   ```.env
   DATABASE_URL="<A POSTGRES DB>"
   FRONTEND_URL="http://localhost:5173"

   ####################################
   # Everything below this is optional#
   ####################################

   # HERE API Key
   HERE_API_KEY="<Get An API Key at https://developer.here.com/>"

   # REDIS cache
   REDIS_URI="redis://localhost:6379"
   # you can also connect with a password using (either use REDIS_URI or REDIS_PASSWORD & REDIS_PORT & REDIS_HOST)
   REDIS_PASSWORD='******'
   REDIS_PORT='6379'
   REDIS_HOST='localhost'

   # To send verification emails with AWS:
   AWS_ACCESS_KEY_ID="******"
   AWS_SECRET_ACCESS_KEY="***********"
   ```
4. Enter your frontend env variables in `IndoorMapsFrontend/.env`
   ```sh
   touch IndoorMapsFrontend/.env
   ```
   `Then use your favorite editor to add these values`
   ```.env
   VITE_BACKEND_GRAPHQL_URL="http://localhost:4000/graphql"
   VITE_BACKEND_WEBSOCKET_URL="ws://localhost:4000/ws"
   ```
6. Set up backend
   ```sh
   cd IndoorMapsBackend/
   // --force is needed due to an issue with ESLint (--force is the recommended solution)
   npm ci --force
   npx prisma migrate dev
   npm run dev
   ```
7. Set up frontend
   ```sh
   cd IndoorMapsFrontend/
   npm ic
   npm run relay
   ```
   In another process
   ```sh
   cd IndoorMapsFrontend/
   npm run dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

#### Backend

* [Prisma ORM](https://www.prisma.io/)
* [Type GraphQL](https://typegraphql.com/)
* [Apollo Server + Express](https://www.apollographql.com/docs/apollo-server/)
#### Frontend

* [Vite](https://vitejs.dev/)
* [React + Typescript](https://react.dev/)
* [React Relay (ts)](https://relay.dev/)
* [GraphQL-WS](https://the-guild.dev/graphql/ws)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
### Acknowledgments

* [Mantine UI](https://mantine.dev/)
* [Tabler Icons](https://tabler.io/admin-template)
* [Geoman io](https://www.geoman.io/)
* [leafletjs](https://leafletjs.com/)
* [Javascript-Voronoi](https://github.com/gorhill/Javascript-Voronoi)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
