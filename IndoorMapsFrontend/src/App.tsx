import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Directory from './components/pages/Directory';
import { graphql, useQueryLoader } from 'react-relay';
import { useEffect } from 'react';
import React from 'react';
import { AppMainQuery } from './__generated__/AppMainQuery.graphql';
import ButtonsContainer from './components/pageSections/ButtonsContainer';

export const GetCurrentUser = graphql`
    query AppMainQuery {
    getUserFromCookie {
        isLogedIn
        user {
            name
            email
            id
        }
    }
  }
`

function App() {

  const [
    queryReference,
    loadQuery,
  ] = useQueryLoader<AppMainQuery>(
    GetCurrentUser,
  );

  useEffect(() => {
    loadQuery({});
  }, []);

  return (
    <MantineProvider>
      {queryReference ?
        <React.Suspense fallback="Loading">
          <ButtonsContainer loadQuery={loadQuery} queryReference={queryReference} />
        </React.Suspense>
        : null}
      <Directory />
    </MantineProvider>
  );
}

export default App
