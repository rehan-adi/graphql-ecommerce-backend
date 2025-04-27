import { AuthResolvers } from "./auth.resolvers.js";

export const resolvers = {
  Query: {
    getUserProfile: () => null,
  },
  ...AuthResolvers,
};
