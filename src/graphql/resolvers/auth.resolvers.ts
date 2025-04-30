import { GraphQLError } from "graphql";
import prisma from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";
import { Context } from "../../types/context.js";
import { GenerateToken } from "../../utils/token.js";
import { SignupArgs, SigninArgs } from "../../interfaces/args.js";
import { HashPassword, ComparePassword } from "../../utils/password.js";
import { signinValidation, signupValidation } from "../../validations/auth.js";

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
    signin: async (_: any, args: SigninArgs, context: Context) => {
      try {
        const { res } = context;
        const { email, password } = args;

        const data = signinValidation.safeParse({ email, password });

        if (!data.success) {
          logger.error("Validation failed for data: ", data);
          throw new GraphQLError("Validation failed", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const { email: validatedEmail, password: validatedPassword } =
          data.data;

        const existingUser = await prisma.user.findUnique({
          where: { email: validatedEmail },
        });

        if (!existingUser) {
          throw new GraphQLError("User not found", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const isPasswordValid = await ComparePassword(
          validatedPassword,
          existingUser.password
        );

        if (!isPasswordValid) {
          throw new GraphQLError("Password is not valid", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const token = GenerateToken(existingUser.id, existingUser.email, existingUser.role);

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 72 * 60 * 60 * 1000,
        });

        return {
          token,
          data: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
          },
        };
      } catch (error) {
        logger.error("Error during signin: ", error);
        throw new GraphQLError("Internal server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
