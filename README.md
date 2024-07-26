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
    The easiest free way to map out any building | Schools | Universities | Convention Centers | AirPorts | 
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

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```
* Node 18 (or newer)
  * Using nvm
  ```sh
  nvm install 18
  run nvm use 18
  ```
* A Postgres Server
  The link to your postgres server will go into your backend .env file

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Theo-s-Meta-Capstone/IndoorMaps.git
   ```
2. Enter your backend env variables in `IndoorMapsBackend/.env`
   ```.env
   DATABASE_URL="<A POSTGRES DB>"
   FRONTEND_URL="http://localhost:5173"
   HERE_API_KEY="<Get An API Key at [HERE](https://developer.here.com/)"
   ```
3. Enter your frontend env variables in `IndoorMapsFrontend/.env`
   ```.env
   VITE_BACKEND_GRAPHQL_URL="http://localhost:4000/graphql"
   VITE_BACKEND_WEBSOCKET_URL="ws://localhost:4000/ws"
   ```
4. Set up backend
   ```sh
   cd IndoorMapsBackend/
   // --force is needed due to an issue with ESLint (--force is the recommended solution)
   npm ci --force
   npx prisma migrate dev
   npm run dev
   ```
5. Set up frontend
   ```sh
   cd IndoorMapsFrontend/
   npm ic
   npm run dev
   ```
   In another process
   ```sh
   cd IndoorMapsFrontend/
   npm run relay
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
