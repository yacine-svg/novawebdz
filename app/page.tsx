import Loader from "@/components/home/Loader";
import Street from "@/components/home/Street";
import About from "@/components/home/About";
import Lab from "@/components/home/Lab";
import Process from "@/components/home/Process";
import Contact from "@/components/home/Contact";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Loader />
      <main id="main">
        <Street />
        <About />
        <Lab />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
