import gql from "graphql-tag";

export const userTypeDefs = gql`
  type User {
    id: Int!
    email: String!
    username: String!
    role: Role
  }

  type UserResponse {
    data: User!
  }

  enum Role {
    Admin
    User
  }

  type Query {
    getAllUsers: [UserResponse!]!
    getUserProfile: UserResponse!
  }

  type Mutation {
    updateUserProfile(username: String!): UserResponse!
  }
`;
