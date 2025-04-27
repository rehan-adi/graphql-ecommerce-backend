import { AuthResolvers } from "./auth.resolvers.js";

export const resolvers = {
    Query: {
        me: () => null,
      },
    ...AuthResolvers,
};
