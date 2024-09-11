import type { MetaFunction } from "@remix-run/node";
import { Footer } from "~/components/footer/Footer";
import { Header } from "~/components/header/Header";
import { ProductList } from "~/components/ProductList/ProductList";
import { CartProvider } from "~/context/CartContext";


export const meta: MetaFunction = () => {
  return [
    { title: "Digital Velocity" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>
      <CartProvider>
      <Header />
      <ProductList />
      <Footer />
      </CartProvider>
    </div>
  );
}
