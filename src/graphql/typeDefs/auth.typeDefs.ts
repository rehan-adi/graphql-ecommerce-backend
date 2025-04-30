import { gql } from "graphql-tag";

export const authTypeDefs = gql`
  type User {
    id: Int!
    email: String!
    username: String!
    role: Role
  }

  type SignupResponse {
    data: User!
  }

  type SigninResponse {
    token: String!
    data: User!
  }

  enum Role {
    Admin
    User
  }

  type Mutation {
    signup(
      email: String!
      password: String!
      username: String!
    ): SignupResponse!
    signin(email: String!, password: String!): SigninResponse!
  }
`;
