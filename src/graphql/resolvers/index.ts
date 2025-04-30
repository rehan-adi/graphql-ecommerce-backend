import { AuthResolvers } from "./auth.resolvers.js";
import { UserResolver } from "./user.resolvers.js";

export const resolvers = {
  Query: {
    ...UserResolver.Query,
  },
  Mutation: {
    ...AuthResolvers.Mutation,
    ...UserResolver.Mutation,
  },
};
