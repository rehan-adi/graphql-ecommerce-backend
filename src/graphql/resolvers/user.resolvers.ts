import { GraphQLError } from "graphql";
import { logger } from "../../utils/logger";
import { Context } from "../../types/context";

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
  Mutation: {},
};
