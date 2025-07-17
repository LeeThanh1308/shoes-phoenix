import Footer from "./Footer";
import Header from "./Header";

function MainLayout({ children }) {
  return (
    <>
      <Header />
      <div className=" min-h-screen pb-64 relative">{children}</div>
      <Footer />
    </>
  );
}

export default MainLayout;
