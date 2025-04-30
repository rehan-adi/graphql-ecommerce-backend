import gql from "graphql-tag";

export const productTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    imageUrl: String
  }

  type ProductResponse {
    data: Product!
  }

  type DeleteProductResponse {
    message: String!
  }

  type Query {
    getAllProducts: [ProductResponse!]!
    getProductById(productId: ID!): ProductResponse!
  }

  type Mutation {
    createProduct(
      name: String!
      description: String!
      price: Float!
      imageUrl: String!
    ): ProductResponse!

    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      imageUrl: String
    ): ProductResponse!

    deleteProduct(id: ID!): DeleteProductResponse!
  }
`;
