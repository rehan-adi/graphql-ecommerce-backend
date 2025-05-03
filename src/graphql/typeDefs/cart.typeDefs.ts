import gql from "graphql-tag";

export const cartTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    imageUrl: String
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Cart {
    id: ID!
    userId: Int!
    items: [CartItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type CartResponse {
    data: Cart!
  }

  type AddToCartResponse {
    message: String!
    cart: Cart!
  }

  type RemoveCartItemResponse {
    message: String!
  }

  type ClearCartResponse {
    message: String!
  }

  type Query {
    getCart: CartResponse!
  }

  type Mutation {
    addToCart(productId: ID!, quantity: Int!): AddToCartResponse!
    updateCartItem(itemId: ID!, quantity: Int!): CartResponse!
    removeCartItem(itemId: ID!): RemoveCartItemResponse!
    clearCart: ClearCartResponse!
  }
`;
