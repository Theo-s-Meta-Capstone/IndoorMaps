import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';

// we'll use supertest to test our server
import request from 'supertest';
import { httpServer } from '../server';

const port = 4500;

const date = new Date();
const testDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
const testUserName = "testUser" + testDate;

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

    // this is the query for our test
    const allUsersQueryData = {
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

    it('Gell all users', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').send(allUsersQueryData);
        expect(response.error).toEqual(false);
        expect(response.body.data?.allUsers).toBeInstanceOf(Array);
    });

    const createUserQueryData = {
        query: `
        mutation Mutation($data: UserCreateInput!) {
            signupUser(data: $data) {
              id
              email
              name
              isEmailVerified
            }
          }
        `,
        variables: {
            "data": {
                "password": "pass",
                "name": testUserName,
                "email": testUserName + "@test.com"
            }
        },
    }

    it('Create new user', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').send(createUserQueryData);
        expect(response.error).toEqual(false);
        expect(response.body.data?.signupUser.id).toBeDefined();
        expect(response.body.data?.signupUser.name).toEqual(testUserName);
        expect(response.body.data?.signupUser.isEmailVerified).toEqual(false);
    });

    const loginUserQueryData = {
        query: `
        mutation Mutation($data: UserLoginInput!) {
            signinUser(data: $data) {
              id
              email
              name
            }
          }
        `,
        variables: {
            "data": {
                "password": "pass",
                "email": testUserName + "@test.com"
            }
        },
    }

    let cookie = "";

    it('Log in the new user', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').send(loginUserQueryData);
        expect(response.error).toEqual(false);
        expect(response.body.data?.signinUser.id).toBeDefined();
        expect(response.body.data?.signinUser.name).toEqual(testUserName);
        cookie = response.headers['set-cookie'][0]; //.split(/[=;]/)[1]
    });

    const getUserQuery = {
        query: `
    query Query {
        getUserFromCookie {
            id
            isLogedIn
            user {
                id
                email
                name
                isEmailVerified
            }
        }
    }
        `
    }

    it('Use a cookie to get user data', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [
            cookie
          ]).send(getUserQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getUserFromCookie.id).toEqual("LogedInUser");
        expect(response.body.data?.getUserFromCookie.isLogedIn).toEqual(true);
        expect(response.body.data?.getUserFromCookie.user.name).toEqual(testUserName);
    });

    const signOutMutation = {
        query: `
        mutation Mutation {
            signOut {
              success
            }
          }
        `
    }

    it('Sign out with cookie (should Invalidate the cookie)', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [
            cookie
          ]).send(signOutMutation);
        expect(response.error).toEqual(false);
        expect(response.body.data?.signOut.success).toEqual(true);
    });


    it('Use a cookie to get user data after sign out (checks that cookie is invalidated', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [
            cookie
          ]).send(getUserQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getUserFromCookie.id).toEqual("LogedInUser");
        expect(response.body.data?.getUserFromCookie.isLogedIn).toEqual(false);
    });
});
