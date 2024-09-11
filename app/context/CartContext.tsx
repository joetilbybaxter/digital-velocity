import React, { createContext, useContext, useState, ReactNode } from "react";

interface CartItem {
  id: string;
  title: string;
  price: string;
  imageSrc: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (newCartItem: CartItem) => void;
  decrementCartItem: (id: string) => void;
  removeFromCart: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Add item to cart or update quantity if the item already exists
  const addToCart = (newCartItem: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newCartItem.id);
      if (existingItem) {
        // If item exists, increment quantity
        return prevItems.map((item) =>
          item.id === newCartItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // If item doesn't exist, add it to cart with initial quantity
      return [...prevItems, newCartItem];
    });
  };

  // Decrement item quantity or remove if quantity reaches 0
  const decrementCartItem = (id: string) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0) 
    );
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, decrementCartItem, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
