import "dotenv/config";
import cors from "cors";
import cookie from "cookie";
import morgan from "morgan";
import { logger } from "./utils/logger.js";
import { Context } from "./types/context.js";
import { ApolloServer } from "@apollo/server";
import express, { Application } from "express";
import { typeDefs } from "./graphql/typeDefs/index.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { expressMiddleware } from "@apollo/server/express4";
import { VerifyToken } from "./utils/token.js";

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
      context: async ({ req, res }): Promise<Context> => {
        let token: string | undefined = undefined;

        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        }

        if (!token && req.headers.cookie) {
          const cookies = cookie.parse(req.headers.cookie);
          token = cookies.token;
        }

        const user = token ? VerifyToken(token) : null;

        return { token, user, req, res };
      },
    })
  );

  app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
  });
}

Main();
