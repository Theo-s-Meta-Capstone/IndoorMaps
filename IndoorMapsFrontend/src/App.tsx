import './App.css'
import { graphql, useLazyLoadQuery } from 'react-relay';

const getAllUsers = graphql`
  query AppQuery {
    allUsers {
      email
    }
  }
`;


function App() {
  const data = useLazyLoadQuery(
    getAllUsers,
    {fetchPolicy: 'store-or-network'},
  );

 return (
  <h1>
      {JSON.stringify(data)}
    </h1>
 );
}

export default App
