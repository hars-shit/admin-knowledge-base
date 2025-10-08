import { showErrorToast, showSuccessToast } from "@/components/Toast";
import axios from "axios";


const api= axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL,
    headers:{
        "Content-Type": "application/json"
    }
})

export const fetchCategories = async() =>{
    try{
        const response = await api.get(`/categories`);
        return response?.data;
    }
    catch(error){
        console.error("Error fetching categories:", error);
        throw error;
    }
} 

// // Create Post API
export const createPost = async (postData) => {
  try {
    const formData = new FormData();

    // Append normal fields
    formData.append("title", postData.title);
    formData.append("body", postData.body); // ✅ API expects "body" not "content"

    // Append tags array (tags[])
    postData.tags.forEach((tag) => {
      formData.append("tags", tag); // ✅ should be tags[] not tags[index]
    });

    // Append categories array (category_ids[])
    postData.categories.forEach((catId) => {
      formData.append("category_ids", catId); // ✅ API expects category_ids[]
    });

    // Append files if they exist
    if (postData.featuredImageFile) {
      formData.append("featured_image", postData.featuredImageFile); // ✅ match API key
    }

    if (postData.featured_video) {
      formData.append("featured_video", postData.featured_video); // ✅ match API key
    }

    const response = await api.post("/posts/", formData, {
      headers: { "Content-Type": "multipart/form-data" , "API-Key": import.meta.env.VITE_API_KEY_URL},
    });
    console.log("form data", formData);

    return response?.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// fetch all posts 
export const fetchPostPreview = async (page = 1, page_size = 10) => {
  try {
    const response = await api.get(`posts/preview`, {
      params: { page, page_size },
    });
    return {
      results: response?.data?.results || [],
      count: response?.data?.count || 0, 
    };
  } catch (error) {
    console.error("Error fetching post preview:", error);
    throw error;
  }
};


// delete post 
export const deletePost = async (postId) => {
  if (!postId) throw new Error("Post ID is required");

  try {
    const response = await api.delete(`posts/${postId}/`,{
      headers: { "API-Key": import.meta.env.VITE_API_KEY_URL }
    });
      if (response.status === 200 || response.status === 204) {
      showSuccessToast("Post deleted successfully!");
    }
    return response?.data;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};


export const fetchPostsByFilter = async ({ search = "", category = null, tags = [] }) => {
  try {
    const queryParams = new URLSearchParams();

    if (search) queryParams.append("search", search);
    if (category) queryParams.append("category", category);
    tags.forEach((tag) => queryParams.append("tags[]", tag));

    // Build URL properly
    const url = `posts/search/?${queryParams.toString()}`;

    console.log("Fetching URL:", url); // ✅ debug the final URL

    const response = await api.get(url); 
    // Always return array for consistency
    return Array.isArray(response.data?.results) ? response.data.results : response.data;
  } catch (error) {
    console.error("Error fetching filtered posts:", error);
    throw error;
  }
};


export const getPostById = async (postId) => {
  if (!postId) throw new Error("Post ID is required");

  try {
    const response = await api.get(`/posts/${postId}/`);
    return response?.data;
  } catch (error) {
    console.error(`Error fetching post with ID ${postId}:`, error);
    throw error;
  }
};



// Update post by ID
export const updatePostById = async (postId, postData) => {
  if (!postId) throw new Error("Post ID is required");

  try {
    const formData = new FormData();

    // 🔹 Always include title/body (even if empty string to clear)
    formData.append("title", postData.title || "");
    formData.append("body", postData.body || "");

    // 🔹 Handle tags (send even if empty to clear them)
    if (Array.isArray(postData.tags)) {
      if (postData.tags.length > 0) {
        postData.tags.forEach((tag) => formData.append("tags", tag));
      } else {
        formData.append("tags", ""); // ensure backend clears old tags
      }
    }

    // 🔹 Handle categories (send even if empty)
    if (Array.isArray(postData.categories)) {
      if (postData.categories.length > 0) {
        postData.categories.forEach((catId) => formData.append("category_ids", catId));
      } else {
        formData.append("category_ids", "");
      }
    }

    // 🔹 Handle featured image
    if (postData.featuredImageFile) {
      formData.append("featured_image", postData.featuredImageFile);
    } else if (postData.featuredImageUrl === "") {
      // User removed image — tell backend to clear
      formData.append("featured_image", "");
    }

    // 🔹 Handle featured video (send even if empty to clear)
    if (postData.featured_video) {
      formData.append("featured_video", postData.featured_video);
    } else {
      formData.append("featured_video", "");
    }

    // ✅ Optional: for debugging
    console.log("🔸 Updating post:", {
      id: postId,
      title: postData.title,
      tags: postData.tags,
      categories: postData.categories,
      featured_video: postData.featured_video,
    });

    const response = await api.put(`/posts/${postId}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "API-Key": import.meta.env.VITE_API_KEY_URL,
      },
    });

    return response?.data;
  } catch (error) {
    console.error(`❌ Error updating post with ID ${postId}:`, error);
    throw error;
  }
};



export const getVideoPresignedUrl = async (file) => {
  if (!file.type.startsWith("video/")) {
    showErrorToast("Only video files are allowed");
    return null;
  }

  try {
    // Force proper MIME type
    const fileType = "video/mp4";

    // If using Axios, the key should be `data` instead of `body`
    const response = await api("/posts/generate-presigned-url/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": import.meta.env.VITE_API_KEY_URL
      },
      data: {               
        file_name: file.name, 
        file_type: fileType,  
      },
    });

    // Axios automatically throws for non-2xx status, so no need for !response.ok
    return response.data.url; 

  } catch (error) {
    console.error("Presigned URL error:", error.response?.data || error.message);
    throw error;
  }
};

