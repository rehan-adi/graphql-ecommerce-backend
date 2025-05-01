export interface SignupArgs {
  email: string;
  username: string;
  password: string;
}

export interface SigninArgs {
  email: string;
  password: string;
}

export interface UserArgs {
  username: string;
}

export interface ProductIdArgs {
  productId: number;
}

export interface CreateProductArgs {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface UpdateProductArgs {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}
