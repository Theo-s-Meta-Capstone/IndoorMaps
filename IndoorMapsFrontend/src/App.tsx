import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Directory from './components/pages/Directory';
import UserButtons from './components/pageSections/UserButtons';
import AuthButtons from './components/pageSections/AuthButtons';
import { PreloadedQuery, graphql, loadQuery, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { useEffect } from 'react';
import React from 'react';
import { AppMainQuery } from './__generated__/AppMainQuery.graphql';

const GetCurrentUser = graphql`
    query AppMainQuery {
    getUserFromCookie {
        isLogedIn
        user {
            name
            email
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

type UserButtonsProps = {
  queryReference: PreloadedQuery<AppMainQuery>,
  loadQuery: any,
}

function ButtonsContainer({ queryReference, loadQuery }: UserButtonsProps) {
  const data = usePreloadedQuery(GetCurrentUser, queryReference);
  const refreshUserData = () => {
    loadQuery(
      {},
      {fetchPolicy: 'network-only'},
    );
  }
  if (data.getUserFromCookie.isLogedIn) {
    return (<UserButtons />)
  }
  return (<AuthButtons refreshUserData={refreshUserData} />)
}

export default App
