import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import Directory from './components/pages/Directory';


function App() {
  return (
    <MantineProvider>
      <Directory />
    </MantineProvider>
  );
}

export default App
