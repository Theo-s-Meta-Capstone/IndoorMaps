import {describe, expect, beforeAll, afterAll, it} from '@jest/globals';

// we'll use supertest to test our server
import request from 'supertest';
import { httpServer } from '../server';

const port = 4500;

// this is the query for our test
const queryData = {
  query: `
  query Query {
    allUsers {
      id
      email
      name
      isEmailVerified
    }
  }
  `,
  variables: {},
};

describe('Testing the GraphQL server by running a HttpServer', () => {
    let url = "";

  // before the tests we spin up a new Apollo Server
  beforeAll(async () => {
    // Note we must wrap our object destructuring in parentheses because we already declared these variables
    // We pass in the port as 0 to let the server pick its own ephemeral port for testing
    httpServer.listen({ port: port });
    url = `http://localhost:${port}/graphql`
  });

  // after the tests we'll stop the server
  afterAll(async () => {
    httpServer.close();
  });

  it('Gell all users', async () => {
    // send our request to the url of the test server
    const response = await request(url).post('/').send(queryData);
    expect(response.error).toEqual(false);
    expect(response.body.data?.allUsers).toBeInstanceOf(Array);
  });
});
