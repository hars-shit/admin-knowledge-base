import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { deletePost } from "@/services/Posts";
import { showSuccessToast, showErrorToast } from "@/components/Toast";
import { useNavigate } from "react-router-dom";

import PlaceholderImage from "@/assets/images.png";

const CustomCardUi = ({ posts = [], onDelete }) => {
  const navigate = useNavigate();

  if (!posts.length) {
    return <p className="text-center mt-10 text-gray-500">No posts found.</p>;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 mt-12">
      {posts?.map((post) => {
        const categories = Array.isArray(post.categories) ? post.categories : [];
        const tags = Array.isArray(post.tags) ? post.tags : [];

        return (
          <Card
            key={post.id}
            style={{ maxWidth: "400px" }}
            className="pt-0 shadow-lg  rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Featured Image or Video */}
            {post.featured_image ? (
              <img
                src={post.featured_image}
                alt={post.title || "Post Image"}
                className="w-full h-64 object-cover"
              />
            ) : post.featured_video ? (
              <video
                src={post.featured_video}
                alt={post.title || "Post Video"}
                className="w-full h-64 object-cover"
                controls
              />
            ) : (
              <img
                src={PlaceholderImage} // local dummy image
                alt="No Featured Assets"
                className="w-full h-64 object-cover"
              />
            )}

            {/* Card Content */}
            <CardContent className="p-4">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 items-center">
                {categories.slice(0, 1).map((cat) => (
                  <span
                    key={cat.id}
                    className="text-sm text-gray-500 uppercase px-3 py-1 border border-[#ff6f3c] rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
                {categories.length > 1 && (
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-[#ff6f3c] rounded-full">
                    +{categories.length - 1}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="mt-4 text-lg font-semibold line-clamp-2">
                {post.title || "Untitled Post"}
              </h3>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 text-xs rounded-full ${
                      i % 2 === 0
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            </CardContent>

            {/* Card Footer Actions */}
            <CardFooter className="flex justify-end gap-3">
              <button
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => navigate(`/posts/update/${post?.id}`)}
              >
                <FiEdit size={20} />
              </button>
              <button
                className="text-red-600 hover:text-red-800 cursor-pointer"
                onClick={async () => {
                  try {
                    await deletePost(post?.id);
                    onDelete(post.id);
                    showSuccessToast("Post deleted successfully!");
                  } catch (err) {
                    console.error(err);
                    showErrorToast("Failed to delete post");
                  }
                }}
              >
                <FiTrash2 size={20} />
              </button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default CustomCardUi;
