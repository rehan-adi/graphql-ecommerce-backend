import { AuthResolvers } from "./auth.resolvers.js";
import { UserResolver } from "./user.resolvers.js";

export const resolvers = {
  ...AuthResolvers,
  ...UserResolver,
};
