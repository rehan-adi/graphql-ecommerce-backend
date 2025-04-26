import "dotenv/config";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import express, { Application } from "express";
import { typeDefs } from "./graphql/typeDefs/index.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { expressMiddleware } from "@apollo/server/express4";

async function Main() {
  const app: Application = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());

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

  app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
  });
}

Main();
