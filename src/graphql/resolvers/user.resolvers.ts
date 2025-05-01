import { GraphQLError } from "graphql";
import { logger } from "../../utils/logger.js";
import { Context } from "../../types/context.js";
import { UserArgs } from "../../interfaces/args.js";
import { userValidation } from "../../validations/user.js";

export const UserResolver = {
  Query: {
    getAllUsers: async () => {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        });

        return users.map((user) => ({
          data: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        }));
      } catch (error) {
        logger.error("Error while getting all user's", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    getUserProfile: async (_: any, args: any, context: Context) => {
      try {
        const userId = context?.user?.id;

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
          throw new GraphQLError("user not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return {
          data: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        };
      } catch (error) {
        logger.error("Error while getting user's profile", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  Mutation: {
    updateUserProfile: async (_: any, args: UserArgs, context: Context) => {
      try {
        const userId = context.user?.id;

        if (!userId) {
          logger.error("Unauthorized: id is missing in token");
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const data = userValidation.safeParse(args);

        if (!data.success) {
          const formattedErrors = data.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          logger.warn(
            "Validation failed during profile update",
            formattedErrors
          );
          throw new GraphQLError("Invalid input", {
            extensions: {
              code: "BAD_USER_INPUT",
              fieldErrors: formattedErrors,
            },
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const updatedData = await prisma.user.update({
          where: { id: userId },
          data: { username: data.data.username },
        });

        return {
          data: {
            id: updatedData.id,
            email: updatedData.email,
            username: updatedData.username,
            role: updatedData.role,
          },
        };
      } catch (error) {
        logger.error("Error while updating user profile", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
