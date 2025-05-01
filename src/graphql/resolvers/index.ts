import { AuthResolvers } from "./auth.resolvers.js";
import { UserResolver } from "./user.resolvers.js";
import { productResolvers } from "./product.resolvers.js";

export const resolvers = {
  Query: {
    ...UserResolver.Query,
    ...productResolvers.Query
  },
  Mutation: {
    ...AuthResolvers.Mutation,
    ...UserResolver.Mutation,
    ...productResolvers.Mutation
  },
};
