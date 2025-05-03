import { AuthResolvers } from "./auth.resolvers.js";
import { UserResolver } from "./user.resolvers.js";
import { CartResolver } from "./cart.resolvers.js";
import { ProductResolvers } from "./product.resolvers.js";

export const resolvers = {
  Query: {
    ...UserResolver.Query,
    ...ProductResolvers.Query,
    ...CartResolver.Query,
  },
  Mutation: {
    ...AuthResolvers.Mutation,
    ...UserResolver.Mutation,
    ...ProductResolvers.Mutation,
    ...CartResolver.Mutation,
  },
};
