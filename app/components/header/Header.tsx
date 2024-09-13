import "./Header.css";
import account from "/Vector (8).png";
import cartIcon from "/Vector (9).png";
import logo from "/home-slide-1-mobile-a2161694517b4264c8960f0979553f16.png";
import React, { useState, useEffect } from "react";
import { ShoppingCart } from "../shoppingCart/ShoppingCart";
import { useCart } from "../../context/CartContext";
import { useLoaderData } from "@remix-run/react";

export function Header() {
  const { removeFromCart } = useCart(); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]); // Store cart items from API
  const [cartItemCount, setCartItemCount] = useState(0); // Store cart item count

  const { SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN } = useLoaderData();

  // Function to fetch cart data from Shopify API
  const fetchCartData = async () => {
    const cartId = localStorage.getItem("shopify_cart_id");

    if (!cartId) {
      console.log("No cart ID found.");
      return;
    }

    try {
      const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2023-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN!,
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
      const fetchedCartItems = data.data.cart.lines.edges.map((edge: any) => ({
        id: edge.node.id,
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

  const calculateCartItemCount = () => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartItemCount(itemCount); 
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  useEffect(() => {
    calculateCartItemCount();
  }, [cartItems]);

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
            <button
              onClick={() => setIsCartOpen(true)}
              style={{ border: "none", background: "none" }}
            >
              <img src={cartIcon} alt="cart-icon" />
              {cartItemCount > 0 && (
                <span className="cart-count-badge">{cartItemCount}</span>
              )}
            </button>

            <ShoppingCart
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems} 
              onRemoveItem={(itemId) => {
                removeFromCart(itemId);
                fetchCartData(); 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
