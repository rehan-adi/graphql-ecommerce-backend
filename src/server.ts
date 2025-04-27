import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import { logger } from "./utils/logger.js";
import { Context } from "./types/context.js";
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
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );

  // Apollo GraphQL server
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<Context> => ({
        token: req.headers.token,
        req,
        res,
      }),
    })
  );

  app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
  });
}

Main();
