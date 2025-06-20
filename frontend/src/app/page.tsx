import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Features } from "@/sections/Features";
import { Customer } from "@/sections/Customer";
import { Contact } from "@/sections/Contact";
import { Footer } from "@/sections/Footer";

export default function Home() {
  return (
    <div className="bg-[#FCE7F3] min-h-screen">
      <Header />
      <main className="flex-grow">
        <section id="hero"><Hero /></section>
        <section id="about"><About /></section>
        <section id="features"><Features /></section>
        <section id="customer"><Customer /></section>
        <section id="contact"><Contact /></section>
      </main>
      <Footer />
    </div>
  );
}

