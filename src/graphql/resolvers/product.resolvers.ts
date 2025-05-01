import { GraphQLError } from "graphql";
import prisma from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";
import { Context } from "../../types/context.js";
import {
  CreateProductValidation,
  UpdateProductValidation,
} from "../../validations/product.js";
import {
  CreateProductArgs,
  ProductIdArgs,
  UpdateProductArgs,
} from "../../interfaces/args.js";

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
  Mutation: {
    createProduct: async (
      _: any,
      args: CreateProductArgs,
      context: Context
    ) => {
      try {
        const creator = context.user?.role;

        if (creator !== "Admin") {
          logger.error("Unauthorized: Must be admin to create products");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const parsed = CreateProductValidation.safeParse(args);

        if (!parsed.success) {
          logger.error("Validation failed:", parsed.error.format());
          throw new GraphQLError("Invalid input", {
            extensions: {
              code: "BAD_USER_INPUT",
              details: parsed.error.flatten(),
            },
          });
        }

        const { name, description, price, imageUrl } = parsed.data;

        const existingProduct = await prisma.product.findFirst({
          where: { name: parsed.data.name },
        });

        if (existingProduct) {
          logger.error(
            `Product with name '${parsed.data.name}' already exists`
          );
          throw new GraphQLError("Product already exists", {
            extensions: { code: "CONFLICT" },
          });
        }

        const product = await prisma.product.create({
          data: {
            name,
            description,
            price,
            imageUrl,
          },
        });

        return {
          data: product,
        };
      } catch (error) {
        logger.error("Error while adding product: ", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    updateProduct: async (
      _: any,
      args: UpdateProductArgs,
      context: Context
    ) => {
      try {
        const creator = context.user?.role;

        if (creator !== "Admin") {
          logger.error("Unauthorized: Must be admin to update products");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const parsed = UpdateProductValidation.safeParse(args);

        if (!parsed.success) {
          logger.error("Validation failed:", parsed.error.format());
          throw new GraphQLError("Invalid input", {
            extensions: {
              code: "BAD_USER_INPUT",
              details: parsed.error.flatten(),
            },
          });
        }

        const existingProduct = await prisma.product.findUnique({
          where: { id: args.id },
        });

        if (!existingProduct) {
          logger.error(`Product with id ${args.id} not found`);
          throw new GraphQLError("Product not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        const updateData: any = {};

        if (parsed.data.name) updateData.name = parsed.data.name;
        if (parsed.data.description)
          updateData.description = parsed.data.description;
        if (parsed.data.price) updateData.price = parsed.data.price;
        if (parsed.data.imageUrl) updateData.imageUrl = parsed.data.imageUrl;

        const updatedProduct = await prisma.product.update({
          where: { id: args.id },
          data: updateData,
        });

        return {
          data: updatedProduct,
        };
      } catch (error) {
        logger.error("Error while updating product: ", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    deleteProduct: async (_: any, args: { id: string }, context: Context) => {
      try {
        const creator = context.user?.role;

        if (creator !== "Admin") {
          logger.error("Unauthorized: Must be admin to delete products");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const productId = parseInt(args.id, 10);

        const existingProduct = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!existingProduct) {
          logger.error(`Product with id ${args.id} not found`);
          throw new GraphQLError("Product not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        await prisma.product.delete({
          where: { id: productId },
        });

        return {
          message: "Product successfully deleted",
        };
      } catch (error) {
        logger.error("Error while deleting product: ", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
