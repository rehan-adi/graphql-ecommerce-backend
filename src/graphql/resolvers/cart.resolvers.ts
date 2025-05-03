import prisma from "../../lib/prisma";
import { GraphQLError } from "graphql";
import { logger } from "../../utils/logger";
import { Context } from "../../types/context";

export const CartResolver = {
  Query: {
    getCart: async (_: any, args: any, context: Context) => {
      try {
        const userId = context.user?.id;

        if (!userId) {
          logger.error("Unauthorized: id is missing in token");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          logger.error("User not found");
          throw new GraphQLError("User not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const cart = await prisma.cart.findFirst({
          where: { userId },
          include: {
            items: {
              include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        imageUrl: true
                    }
                },
              },
            },
          },
        });

        if (!cart) {
          logger.error("Cart not found for user", { userId });
          throw new GraphQLError("Cart not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return { data: cart };
      } catch (error) {
        logger.error("Error while getting cart", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  Mutation: {
   
  },
};
