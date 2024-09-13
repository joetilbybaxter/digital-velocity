import type { MetaFunction } from "@remix-run/node";
import { Footer } from "~/components/footer/Footer";
import { Header } from "~/components/header/Header";
import { ProductList } from "~/components/ProductList/ProductList";
import { CartProvider } from "~/context/CartContext";
import { json, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";

export function loader() {
  return json({
    SHOPIFY_STORE_URL: process.env.SHOPIFY_STORE_URL,
    SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Digital Velocity" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN } = useLoaderData();
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
