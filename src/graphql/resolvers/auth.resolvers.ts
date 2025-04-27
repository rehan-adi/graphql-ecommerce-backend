import { GraphQLError } from "graphql";
import prisma from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";
import { SignupArgs } from "../../interfaces/args.js";
import { signupValidation } from "../../validations/auth.js";
import { HashPassword, CompirePassword } from "../../utils/password.js";

export const AuthResolvers = {
  Mutation: {
    signup: async (_: any, args: SignupArgs) => {
      try {
        const { email, username, password } = args;

        const data = signupValidation.safeParse({ email, username, password });

        if (!data.success) {
          logger.error("Validation failed for data: ", data);
          throw new GraphQLError("Validation failed", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const {
          email: validatedEmail,
          username: validatedUsername,
          password: validatedPassword,
        } = data.data;

        const existingUser = await prisma.user.findUnique({
          where: { email: validatedEmail },
        });

        if (existingUser) {
          throw new GraphQLError("Email is already in use.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const hashPassword = await HashPassword(validatedPassword);

        const user = await prisma.user.create({
          data: {
            username: validatedUsername,
            email: validatedEmail,
            password: hashPassword,
          },
        });

        return {
          data: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        };
      } catch (error) {
        logger.error("Error during user signup: ", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    signin: async (_: any, { email, password }: any) => {},
  },
};
