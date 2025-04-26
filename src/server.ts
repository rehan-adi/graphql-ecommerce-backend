import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import gql from "graphql-tag";

async function Main() {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());

  const typeDefs = gql`
    type Query {
      hello: String
    }
  `;

  const resolvers = {
    Query: {
      hello: () => "Hello, world!",
    },
  };

  // Apollo GraphQL server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );

  app.listen(4000, () => {
    console.log("Server running on http://localhost:4000/graphql");
  });
}

Main();
