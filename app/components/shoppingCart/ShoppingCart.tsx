import React, { useEffect, useState } from "react";
import bin from "/Vector (7).png";
import "./shoppingCart.css";
import { useCart } from "../../context/CartContext";
import { useLoaderData } from "@remix-run/react";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

interface CartItem {
  id: string; // This is the cart line ID
  title: string;
  quantity: number;
  price: string;
  imageSrc: string;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  total,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { removeFromCart } = useCart();

  // Get environment variables from loader
  const { SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN } = useLoaderData();

  // Function to create a new cart
  const createCart = async () => {
    try {
      const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2023-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation {
              cartCreate {
                cart {
                  id
                }
              }
            }
          `,
        }),
      });

      const result = await response.json();

      if (!result.data || !result.data.cartCreate || !result.data.cartCreate.cart) {
        throw new Error("Failed to create cart.");
      }

      const newCartId = result.data.cartCreate.cart.id;
      localStorage.setItem("shopify_cart_id", newCartId); // Store cart ID in local storage
      return newCartId;
    } catch (error) {
      console.error("Error creating cart:", error);
      throw error;
    }
  };

  // Fetch the cart data from Shopify API
  const fetchCartData = async () => {
    let cartId = localStorage.getItem("shopify_cart_id");

    // If no cartId is found, create a new cart
    if (!cartId) {
      console.log("No cart ID found. Creating a new cart.");
      cartId = await createCart();
    }

    try {
      const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2023-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: `
            {
              cart(id: "${cartId}") {
                id
                lines(first: 10) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          priceV2 {
                            amount
                          }
                          image {
                            src
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      });

      const data = await response.json();


      if (!data || !data.data || !data.data.cart) {
        throw new Error("Cart data is missing or undefined.");
      }

      const fetchedCartItems = data.data.cart.lines.edges.map((edge: any) => ({
        id: edge.node.id, // Cart line ID
        title: edge.node.merchandise.title,
        quantity: edge.node.quantity,
        price: edge.node.merchandise.priceV2.amount,
        imageSrc: edge.node.merchandise.image?.src || "https://via.placeholder.com/150",
      }));

      setCartItems(fetchedCartItems);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  // Function to remove a product from the cart
  const removeFromCartHandler = async (cartLineId: string) => {
    let cartId = localStorage.getItem("shopify_cart_id");

    if (!cartId) {
      console.error("No cart ID found.");
      return;
    }

    try {
      const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2023-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation {
              cartLinesRemove(cartId: "${cartId}", lineIds: ["${cartLineId}"]) {
                cart {
                  id
                  lines(first: 10) {
                    edges {
                      node {
                        id
                        quantity
                        merchandise {
                          ... on ProductVariant {
                            id
                            title
                            priceV2 {
                              amount
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      });

      const result = await response.json();
      console.log("Remove from cart result:", result);

      // After removing, fetch the updated cart
      fetchCartData();
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCartData();
    }
  }, [isOpen]); // Fetch data when cart is opened

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
                      onClick={() => removeFromCartHandler(item.id)} // Pass the cart line ID
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
