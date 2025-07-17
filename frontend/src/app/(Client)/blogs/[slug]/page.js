import DetailBlog from "@/components/pages/blogs/DetailBlog";
import GuestRequest from "@/services/axios/GuestRequest";

async function getPost(slug) {
  const response = await GuestRequest.get(`blogs/list-blogs/${slug}`);
  return response.data;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params?.slug);
  return {
    title: post?.title,
    description: post.description,
  };
}

export default async function Page() {
  return <DetailBlog />;
}
