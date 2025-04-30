import prisma from "../../lib/prisma.js";
import { GraphQLError } from "graphql";
import { logger } from "../../utils/logger.js";
import { ProductIdArgs } from "../../interfaces/args.js";

export const productResolvers = {
  Query: {
    getAllProducts: async () => {
      try {
        const products = await prisma.product.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
          },
        });

        return products.map((product) => ({
          data: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
          },
        }));
      } catch (error) {
        logger.error("Error while getting all products: ", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    getProductById: async (_: any, args: ProductIdArgs) => {
      try {
        const product = await prisma.product.findUnique({
          where: { id: args.productId },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
          },
        });

        if (!product) {
          throw new GraphQLError("Product not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return { data: product };
      } catch (error) {
        logger.error("Error while getting product: ", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  Mutation: {},
};
