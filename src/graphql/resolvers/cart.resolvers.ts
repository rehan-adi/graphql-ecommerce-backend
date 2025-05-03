import { GraphQLError } from "graphql";
import prisma from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";
import { Context } from "../../types/context.js";

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
                    imageUrl: true,
                  },
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
    addToCart: async (
      _: any,
      args: { productId: number; quantity: number },
      context: Context
    ) => {
      try {
        const userId = context.user?.id;

        if (!userId) {
          logger.error("Unauthorized: Missing user id");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const { productId, quantity } = args;

        const product = await prisma.product.findUnique({
          where: { id: Number(productId) },
        });

        if (!product) {
          logger.error(`Product not found: ${productId}`);
          throw new GraphQLError("Product not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        let cart = await prisma.cart.findFirst({
          where: { userId },
        });

        if (!cart) {
          cart = await prisma.cart.create({
            data: {
              userId,
            },
          });
        }

        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId: Number(productId),
          },
        });

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + quantity,
            },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: Number(productId),
              quantity,
            },
          });
        }

        const updatedCart = await prisma.cart.findUnique({
          where: { id: cart.id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        });

        return {
          message: "Product added to cart successfully",
          cart: updatedCart,
        };
      } catch (error) {
        logger.error("Error in addToCart mutation", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    updateCartItem: async (
      _: any,
      args: { itemId: number; quantity: number },
      context: Context
    ) => {
      try {
        const userId = context.user?.id;

        if (!userId) {
          logger.error("Unauthorized: Missing user id");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const { itemId, quantity } = args;

        const cart = await prisma.cart.findFirst({
          where: { userId },
          include: {
            items: true,
          },
        });

        if (!cart) {
          logger.error("Cart not found");
          throw new GraphQLError("Cart not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const item = cart.items.find((item) => item.id === Number(itemId));

        if (!item) {
          logger.error("Cart item not found or does not belong to user");
          throw new GraphQLError("Cart item not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        await prisma.cartItem.update({
          where: { id: Number(itemId) },
          data: { quantity },
        });

        const updatedCart = await prisma.cart.findUnique({
          where: { id: cart.id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        });

        return {
          data: updatedCart,
        };
      } catch (error) {
        logger.error("Error in updateCartItem mutation", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    removeCartItem: async (
      _: any,
      args: { itemId: number },
      context: Context
    ) => {
      try {
        const userId = context.user?.id;

        if (!userId) {
          logger.error("Unauthorized: Missing user id");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const { itemId } = args;

        const cartItem = await prisma.cartItem.findUnique({
          where: { id: Number(itemId) },
          include: {
            cart: true,
          },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
          logger.error("Cart item not found or does not belong to user");
          throw new GraphQLError("Cart item not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        await prisma.cartItem.delete({
          where: { id: Number(itemId) },
        });

        return {
          message: "Item removed from cart successfully",
        };
      } catch (error) {
        logger.error("Error in removeCartItem mutation", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    clearCart: async (_: any, __: any, context: Context) => {
      try {
        const userId = context.user?.id;

        if (!userId) {
          logger.error("Unauthorized: Missing user id");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const cart = await prisma.cart.findFirst({
          where: { userId }, 
        });

        if (!cart) {
          logger.error("Cart not found for user", { userId });
          throw new GraphQLError("Cart not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return {
          message: "Cart cleared successfully",
        };
      } catch (error) {
        logger.error("Error in clearCart mutation", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
