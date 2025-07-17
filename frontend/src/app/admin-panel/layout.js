import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = {
  title: "Admin Panel",
  description: "Trang quản trị cho admin.",
};

function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default Layout;
