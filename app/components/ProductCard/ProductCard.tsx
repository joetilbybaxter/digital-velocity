import React, { useState, useEffect } from "react";
import "./ProductCard.css";
import minus from "/Vector (3).png";
import plus from "/plus.png";
import wishlist from "/Vector (4).png";
import trophy from "/Vector (5).png";
import tag from "/Vector (6).png";
import { useLoaderData } from "@remix-run/react";

interface Product {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  variantId: string; 
}

export const ProductCard: React.FC<Product> = ({
  id,
  title,
  description,
  imageSrc,
  price,
  variantId, 
}) => {
  const [quantity, setQuantity] = useState(0);
  const [cartId, setCartId] = useState<string | null>(null);
  const [cartLineId, setCartLineId] = useState<string | null>(null); 

  // Get environment variables from the loader
  const { SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN } = useLoaderData();

  // Function to create a new cart if no cartId exists
  const createCart = async () => {
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
    const newCartId = result.data.cartCreate.cart.id;
    localStorage.setItem("shopify_cart_id", newCartId); 
    setCartId(newCartId); 
    return newCartId;
  };

  const getCartId = async () => {
    let cartId = localStorage.getItem("shopify_cart_id");
    if (!cartId) {
      cartId = await createCart();
    }
    return cartId;
  };

  const fetchCartQuantity = async () => {
    const currentCartId = await getCartId(); 

    const query = `
      {
        cart(id: "${currentCartId}") {
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2023-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      const cartLine = result.data.cart.lines.edges.find(
        (edge: any) => edge.node.merchandise.id === variantId
      );

      if (cartLine) {
        setQuantity(cartLine.node.quantity); 
        setCartLineId(cartLine.node.id); 
      }
    } catch (error) {
      console.error("Error fetching cart quantity:", error);
    }
  };

  useEffect(() => {
    fetchCartQuantity();
  }, [variantId]);

  const updateCart = async (newQuantity: number) => {
    const currentCartId = await getCartId(); 

    let query;

    if (!cartLineId) {
      // If no cart line ID, add the product to the cart
      query = `
        mutation {
          cartLinesAdd(cartId: "${currentCartId}", lines: [{ quantity: ${newQuantity}, merchandiseId: "${variantId}" }]) {
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
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;
    } else if (newQuantity > 0) {
      // If cart line ID exists, update the quantity
      query = `
        mutation {
          cartLinesUpdate(cartId: "${currentCartId}", lines: [{ id: "${cartLineId}", quantity: ${newQuantity} }]) {
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
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;
    } else {
      // If quantity is 0, remove the product from the cart
      query = `
        mutation {
          cartLinesRemove(cartId: "${currentCartId}", lineIds: ["${cartLineId}"]) {
            cart {
              id
            }
          }
        }
      `;
    }

    try {
      const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2023-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      console.log("Cart update result:", result);

      if (!cartLineId && result.data.cartLinesAdd) {
        const addedLine = result.data.cartLinesAdd.cart.lines.edges.find(
          (edge: any) => edge.node.merchandise.id === variantId
        );
        if (addedLine) {
          setCartLineId(addedLine.node.id);
        }
      }
    } catch (error) {
      console.error("Error updating the cart:", error);
    }
  };

  // Increment product quantity
  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateCart(newQuantity); 
  };

  // Decrement product quantity and remove from cart if quantity hits 0
  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateCart(newQuantity); 
    }
  };

  return (
    <div key={id} className="product-card">
      <form>
        <div className="productbadges-wrapper">
          <div className="new-badge">
            <img src={trophy} alt="trophy-icon" />
            New
          </div>
          <div className="discount-badge">
            <img src={tag} alt="tag-icon" />
            Get X for Y
          </div>
          <div className="wishlist">
            <img className="wishlist-icon" src={wishlist} alt="wishlist-icon" />
          </div>
        </div>

        {imageSrc ? (
          <img src={imageSrc.toString()} alt={title} className="product-image" />
        ) : (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019"
            alt={title}
            className="product-image"
          />
        )}

        <div className="top-information">
          <h2 className="product-title">{title}</h2>
          <p className="product-description">{description}</p>
        </div>
        <div className='variant-style-2'>
        <div className='one-top'>
                Choose Variant:
            </div>
            <select className='variant-select'
            
            >
               <option value="" disabled selected>Select</option>
              <option>Variant 1</option>
              <option>Variant 2</option>
              <option>Variant 3</option>
            </select>
        </div>

        <div className="price-quantity-wrapper">
          <div className="quantity-wrapper">
            <button type="button" onClick={handleDecrement} className="quantity-buttons">
              <img src={minus} alt="minus-icon" />
            </button>
            <div className="quantity-amount">{quantity}</div>
            <button type="button" onClick={handleIncrement} className="quantity-buttons">
              <img alt="plus-icon" src={plus} />
            </button>
          </div>
          <div className="product-price">£{price.amount}</div>
        </div>
      </form>
    </div>
  );
};
