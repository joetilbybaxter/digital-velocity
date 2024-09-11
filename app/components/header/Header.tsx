import "./Header.css";
import account from "build/client/assets/Vector (8).png";
import cartIcon from "build/client/assets/Vector (9).png";
import logo from "build/client/assets/home-slide-1-mobile-a2161694517b4264c8960f0979553f16.png";
import React, { useState } from "react";
import { ShoppingCart } from "../shoppingCart/ShoppingCart";
import { useCart } from "../../context/CartContext"; 

export function Header() {
  const { cartItems, removeFromCart } = useCart(); // Get cart data from context
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Calculate the total number of items in the cart
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="header-wrapper">
      <div className="header-left">
        <img className="logo" src={logo} alt="logo" />
      </div>
      <div className="header-right">
        <div className="account-wrapper">
          <img src={account} alt="account-icon" />
        </div>
        <div className="cart-wrapper">
          <div style={{ position: "relative" }}>
            <button onClick={() => setIsCartOpen(true)} style={{ border: "none", background: "none" }}>
              <img src={cartIcon} alt="cart-icon" />
              {cartItemCount > 0 && (
                <span className="cart-count-badge">{cartItemCount}</span>
              )}
            </button>

            <ShoppingCart
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems} // Cart items from global state
              onRemoveItem={removeFromCart} // Remove item function
            />
          </div>
        </div>
      </div>
    </div>
  );
}
