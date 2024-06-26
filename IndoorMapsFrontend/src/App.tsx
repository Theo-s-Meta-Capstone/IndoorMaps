import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Directory from './components/routes/Directory';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from './components/routes/Root';
import BuildingViewer from './components/routes/BuildingViewer';
import BuildingEditor from './components/routes/BuildingEditor';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "directory",
    element: <Directory />,
  },
  {
    path: "building/:buildingId/viewer",
    element: <BuildingViewer />,
  },
  {
    path: "building/:buildingId/editor",
    element: <BuildingEditor />,
  },
]);

function App() {
  return (
    <MantineProvider>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App
