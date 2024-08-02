import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Directory, { DirectoryPageQuery } from './routes/Directory';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root, { RootPageQuery } from './routes/Root';
import BuildingViewer, { BuildingViewerPageQuery } from './routes/BuildingViewer';
import BuildingEditor, { BuildingEditorPageQuery } from './routes/BuildingEditor';
import { generateColors } from '@mantine/colors-generator';
import { Suspense } from 'react';
import LoadingPage from './components/pageSections/LoadingPage';
import { loadQuery } from 'react-relay';
import { RelayEnvironment } from './RelayEnvironment';
import VerifyEmail, { VerifyEmailPageQuery } from './routes/VerifyEmail';

const router = createBrowserRouter([
  {
    path: "/",
    element:
      <Suspense fallback={<LoadingPage />}><Root /></Suspense>,
    loader: async () => loadQuery(
      RelayEnvironment,
      RootPageQuery,
      {},
    ),
  },
  {
    path: "directory",
    element: <Suspense fallback={<LoadingPage />}><Directory /></Suspense>,
    loader: async () => loadQuery(
      RelayEnvironment,
      DirectoryPageQuery,
      {
        autocompleteInput: {
          p: null,
        },
        buildingSearchInput: {
          searchQuery: "",
        }
      },
    ),
  },
  {
    path: "building/:buildingId/viewer",
    element:
      <div className="mainVerticalFlexContainer">
        <Suspense fallback={<LoadingPage />}>
          <BuildingViewer  />
        </Suspense>
      </div>,
    loader: async ({ params }) => {
      return loadQuery(
        RelayEnvironment,
        BuildingViewerPageQuery,
        {
          data: {
            id: parseInt(params.buildingId!),
          }
        },
      )
    },
  },
  {
    path: "building/:buildingId/editor",
    element:
      <div className="mainVerticalFlexContainer">
        <Suspense fallback={<LoadingPage />}>
          <BuildingEditor />
        </Suspense>
      </div>,
    loader: async ({ params }) => {
      return loadQuery(
        RelayEnvironment,
        BuildingEditorPageQuery,
        {
          autocompleteInput: {
            p: null,
          },
          data: {
            id: parseInt(params.buildingId!),
          }
        },
      )
    },
  },
  {
    path: "/verify/:token",
    element:
      <Suspense fallback={<LoadingPage />}><VerifyEmail /></Suspense>,
    loader: async () => loadQuery(
      RelayEnvironment,
      VerifyEmailPageQuery,
      {},
    ),
  },
  {
    path: "/verify/",
    element:
      <Suspense fallback={<LoadingPage />}><VerifyEmail /></Suspense>,
    loader: async () => loadQuery(
      RelayEnvironment,
      VerifyEmailPageQuery,
      {},
    ),
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
