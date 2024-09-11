import "./ProductCard.css";
import minus from "build/client/assets/Vector (3).png";
import plus from "build/client/assets/plus.png";
import wishlist from "build/client/assets/Vector (4).png";
import trophy from "build/client/assets/Vector (5).png";
import tag from "build/client/assets/Vector (6).png";
import { useState, useEffect } from "react";
import { useCart } from "~/context/CartContext";

interface Product {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  price: {
    amount: string;
    currencyCode: string;
  };
}

export const ProductCard: React.FC<Product> = ({
  id,
  title,
  description,
  imageSrc,
  price,
}) => {
  const { addToCart, decrementCartItem } = useCart();
  const [quantity, setQuantity] = useState(0); // Quantity of the product
  const [cartItem, setCartItem] = useState<{ id: string; title: string; price: string; imageSrc: string; } | null>(null); // New cart item object

  // Increment quantity
  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
    addToCart({
      id: id,
      title: title,
      price: price.amount,
      imageSrc: imageSrc,
      quantity: 1, // Add with initial quantity 1
    });
  };
  
  // Decrement quantity
  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity((prevQuantity) => prevQuantity - 1);
      decrementCartItem(id); // Decrement the item quantity in the global cart
    }
  };

  // Update the cart item object when the quantity goes above 0
  useEffect(() => {
    if (quantity > 0) {
      const newCartItem = {
        id,
        title,
        price: price.amount,
        imageSrc: imageSrc ? imageSrc : "https://via.placeholder.com/150", 
      };
      setCartItem(newCartItem);
    } else {
      setCartItem(null); // If quantity is 0, remove the cart item
    }
  }, [quantity, id, title, price.amount, imageSrc]);

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
