import DetailProductPage from "./DetailProduct";
import GuestRequest from "@/services/axios/GuestRequest";

async function getProduct(slug) {
  const response = await GuestRequest.get("products", {
    params: { slug },
  });
  return response.data;
}

export async function generateMetadata({ params }) {
  const slug = await params?.slug;
  const post = await getProduct(slug);
  return {
    title: post?.name,
    description: post?.slug,
  };
}

export default async function Page() {
  return <DetailProductPage />;
}
