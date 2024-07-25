import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Directory from './routes/Directory';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from './routes/Root';
import BuildingViewer from './routes/BuildingViewer';
import BuildingEditor from './routes/BuildingEditor';
import { generateColors } from '@mantine/colors-generator';

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
    <MantineProvider theme={{
      colors: {
        'dark-blue': generateColors('#0e316e'),
      },
    }}>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App
