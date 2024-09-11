import React from "react";
import bin from "build/client/assets/Vector (7).png";
import "./shoppingCart.css";
import { useCart } from "../../context/CartContext"; // Import the cart context hook

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  total,
}) => {
  const { cartItems, removeFromCart } = useCart(); 

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose}></div>}

      <div className={`shopping-cart ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="shopping-cart-header">
          <h2>Your Cart</h2>
        </div>

        <div className="shopping-cart-body">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <div className="cart-item-details-top">
                    <h4>{item.title}</h4>
                    <button
                      className="delete-btn"
                      onClick={() => removeFromCart(item.id)} // Remove the item when clicked
                    >
                      <img src={bin} alt="bin-logo" />
                    </button>
                  </div>

                  <p>
                    Quantity: {item.quantity} | Price: £{item.price}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>

        <div className="shopping-cart-footer">
          <h3 className="cart-total">Total: £{total}</h3>
          <button className="checkout-btn">Checkout</button>
        </div>
      </div>
    </>
  );
};
