import { graphql } from 'react-relay';

export const getAllUsers = graphql`
  query AppQuery {
    allUsers {
      email
    }
  }
`;
