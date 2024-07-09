import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
  RequestParameters,
  Variables,
  Observable,
} from "relay-runtime";
import { createClient } from 'graphql-ws';

const HTTP_ENDPOINT = import.meta.env.VITE_BACKEND_GRAPHQL_URL;

// Subscription from https://the-guild.dev/graphql/ws/recipes#client-usage-with-relay
const WS_ENDPOINT = 'ws://localhost:4000/graphql';

const subscriptionsClient = createClient({
  url: WS_ENDPOINT,
});

const fetchFn: FetchFunction = async (request, variables) => {
  const resp = await fetch(HTTP_ENDPOINT, {
    method: "POST",
    headers: {
      Accept:
        "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
      "Content-Type": "application/json",
      // <-- Additional headers like 'Authorization' would go here
    },
    body: JSON.stringify({
      query: request.text, // <-- The GraphQL document composed by Relay
      variables,
    }),
    credentials: "include",
  });

  return await resp.json();
};

// supposedly both fetch and subscribe can be handled through one implementation
// but fetdhing doesn not work on this website with this function
// leaving this note here for TODO further invistagation
// to understand why we return Observable<any>, please see: https://github.com/enisdenjo/graphql-ws/issues/316#issuecomment-1047605774
function fetchOrSubscribe(
  operation: RequestParameters,
  variables: Variables,
): Observable<any> {
  return Observable.create((sink) => {
    if (!operation.text) {
      return sink.error(new Error('Operation text cannot be empty'));
    }
    return subscriptionsClient.subscribe(
      {
        operationName: operation.name,
        query: operation.text,
        variables,
      },
      sink,
    );
  });
}


function createRelayEnvironment() {
  return new Environment({
    // supposedly this could be Network.create(fetchOrSubscribe, fetchOrSubscribe), see above comments
    // but it doesn't work
    network: Network.create(fetchFn, fetchOrSubscribe),
    store: new Store(new RecordSource()),
  });
}

export const RelayEnvironment = createRelayEnvironment();
