import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { IoIosAdd } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { fetchCategories, createPost, getPostById, updatePostById } from "@/services/Posts";
import { showErrorToast, showSuccessToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import HomeHeader from "./Home";
import { useParams } from "react-router-dom";
import "./home.css"
import PresignedVideoUploader from "@/components/PresignedVideoUploader";
const CreatePosts = () => {
  const [videoUploading, setVideoUploading] = useState(false);

  const { id } = useParams()
  const [post, setPost] = useState({
    title: "",
    body: "",
    tags: [],
    categories: [],
    featuredImageFile: null, // uploaded file
    featuredImageUrl: "",     // existing image URL
    featured_video: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
  console.log("post data", post)
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  // Fetch post data if updating
  useEffect(() => {
    if (id) {
      setLoading(true);
      getPostById(id)
        .then((data) => {
          let videoKey = "";
          if (data.featured_video) {

            videoKey = data.featured_video.split(".com/")[1].split("?")[0].trim();
          }

          setPost({
            title: data?.title || "",
            body: data?.body || "",
            tags: data?.tags || [],
            categories: data?.categories?.map((c) => c.id) || [],
            featuredImageFile: null,
            featuredImageUrl: data?.featured_image || "",
            featured_video: videoKey,
          });
          setFormKey((prev) => prev + 1);
        })
        .catch(() => showErrorToast("Failed to fetch post data"))
        .finally(() => setLoading(false));
    }
  }, [id]);




  // Fetch categories
  useEffect(() => {
    fetchCategories()
      .then((data) => data && setAllCategories(data))
      .catch((error) =>
        showErrorToast(
          error.response?.data?.message || error.message || "Something went wrong!"
        )
      );
  }, []);

  // Tags functions
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !post.tags.includes(trimmed)) {
      setPost((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput("");
    }
  };
  const handleRemoveTag = (tag) => {
    setPost((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  // Categories functions
  const handleToggleCategory = (categoryId) => {
    setPost((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleRemoveCategory = (categoryId) => {
    setAllCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setPost((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
    }));
  };

  // Publish function
  const handlePublish = async () => {
    if (!post.title || !post.body || post.categories.length === 0) {
      return showErrorToast("Title, content and at least one category are required!");
    }

    try {
      setLoading(true);
      let res;

      if (id) {
        // Update existing post
        res = await updatePostById(id, post);
        showSuccessToast("Post updated successfully!");
      } else {
        // Create new post

        console.log("postdsscs", post)
        res = await createPost(post);
        showSuccessToast("Post created successfully!");
      }

      console.log("Response:", res);

      // Reset form only if creating new post
      if (!id) {
        setResetKey(prev => prev + 1);
        setTagInput("");
        setPost({
          title: "",
          body: "",
          tags: [],
          categories: [],
          featuredImageFile: null,
          featuredImageUrl: "",
          featured_video: ""
        });
      }

    } catch (error) {
      showErrorToast(
        error.response?.data?.message || error.message || "Failed to save post"
      );
    } finally {
      setLoading(false);
    }
  };




  return (

    <div className="p-4">
      <HomeHeader />
      <h3 className="text-xl font-medium mb-6">Add Post</h3>
      {loading ? <Spinner size={8} /> :

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6" key={formKey}>
          {/* Left side */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title */}
            <Input
              placeholder="Add title"
              value={post?.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="w-full h-12"
            />

            {/* Rich Text Editor */}
            <div className="border bg-white rounded-md min-h-[16rem]">
              <ReactQuill
                key={resetKey}
                theme="snow"
                value={post?.body}
                onChange={(body) => setPost({ ...post, body })}
                modules={modules}
                formats={[
                  "header",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "blockquote",
                  "list",
                  "bullet",
                  "link",
                  "image",
                  "video",
                ]}
                placeholder="Write your post here..."
              />
            </div>

            {/* Featured Image */}
            <div className="border bg-white rounded-md p-4 relative w-full min-h-[48px] flex items-center justify-start">
              {post?.featuredImageFile || post?.featuredImageUrl ? (
                <img
                  src={post.featuredImageFile ? URL.createObjectURL(post.featuredImageFile) : post.featuredImageUrl}
                  alt="Featured"
                  className="mt-2 w-full max-h-48 object-cover rounded-md"
                />
              ) : (
                <label
                  htmlFor="featured-upload"
                  className="cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg border border-indigo-400 text-indigo-600 bg-white hover:bg-indigo-50 transition-all text-sm font-medium shadow-sm"
                >
                  Set Featured Image
                  <input
                    id="featured-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      file && setPost((prev) => ({
                        ...prev,
                        featuredImageFile: file,
                        featuredImageUrl: "",
                      }));
                    }}
                  />
                </label>
              )}

              {(post.featuredImageFile || post.featuredImageUrl) && (
                <button
                  type="button"
                  onClick={() => setPost(prev => ({ ...prev, featuredImageFile: null, featuredImageUrl: "" }))}
                  className="absolute w-[36px] h-[36px] top-2 right-2 bg-[#1A2C40] bg-opacity-50 text-white rounded-full"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Featured Video */}

            <PresignedVideoUploader
              videoUrl={post.featured_video}
              onUploadStart={() => setVideoUploading(true)}
              onUploadComplete={(url) => {
                setPost(prev => ({
                  ...prev,
                  featured_video: url ? url.split(".com/")[1] : "",
                }));
                setVideoUploading(false);
              }}
              onUploadError={() => setVideoUploading(false)}
            />



          </div>

          {/* Right side */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border bg-white rounded-md p-4">
              <h4 className="font-medium mb-2 py-5">Publish</h4>
              <button
                className={`w-full bg-[#ff6f3c] text-white py-2 rounded-lg hover:bg-[#e85d2e] ${loading || videoUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handlePublish}
                disabled={loading || videoUploading}
              >
                {loading ? <Spinner size={8} /> : id ? "Update Post" : "Publish"}
              </button>



            </div>

            {/* Tags */}
            <div className="border rounded-md p-4 bg-white">
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex items-center mb-4 bg-white">
                <Input
                  className="mr-2"
                  value={tagInput}
                  placeholder="Enter tag"
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button className="flex items-center gap-2 py-5 bg-[#ff6f3c] hover:bg-orange-600 cursor-pointer" onClick={handleAddTag}>
                  <IoIosAdd style={{ color: "white", fontSize: "20px" }} /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <div key={index} className="flex items-center justify-center bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                    <span className="mr-1 text-sm">{tag}</span>
                    <IoClose className="cursor-pointer text-sm" onClick={() => handleRemoveTag(tag)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="border rounded-md p-4 bg-white">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-1">
                {allCategories && allCategories?.map((category) => (
                  <label key={category?.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={post?.categories.includes(category?.id)}
                        onChange={() => handleToggleCategory(category?.id)}
                      />
                      {category?.name}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    </div>

  );
};

export default CreatePosts;
