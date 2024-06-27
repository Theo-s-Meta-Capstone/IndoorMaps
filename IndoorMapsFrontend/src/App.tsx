import './App.css'
import '@mantine/core/styles.css';
import { Button, MantineProvider } from '@mantine/core';
import Directory from './components/pages/Directory';
import UserButtons from './components/pageSections/UserButtons';
import AuthButtons from './components/pageSections/AuthButtons';
import { useState } from 'react';


function App() {
  const [user, setUser] = useState<null>(null);

  return (
    <MantineProvider>
      {user != null ?
            <UserButtons />
            :
            <AuthButtons />
          }
      <Directory />
    </MantineProvider>
  );
}

export default App
