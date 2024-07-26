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

[![https://example.com](https://private-user-images.githubusercontent.com/26506274/350169766-6812e40b-a3a0-4595-9ecb-51507c6c6206.gif?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjE0NDY2NjEsIm5iZiI6MTcyMTQ0NjM2MSwicGF0aCI6Ii8yNjUwNjI3NC8zNTAxNjk3NjYtNjgxMmU0MGItYTNhMC00NTk1LTllY2ItNTE1MDdjNmM2MjA2LmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA3MjAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNzIwVDAzMzI0MVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTY4MzRhODJiYTcxYTBkYjg0Mjc5NTMyMjc3MGEwOTkzMTNhOWFjYmExMzI5OWFjMzdkOWQ1NmIwMWE2ZWY1MzQmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.K25SWy6ATMl4xLGXtzv4ohEkkBDa3x6aOnR7kfsjbhs)

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
