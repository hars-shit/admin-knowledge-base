import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CustomCardUi from "@/components/CustomCardUi";
import { Input } from "@/components/ui/input";
import { IoSearchSharp } from "react-icons/io5";
import { fetchCategories, fetchPostPreview, fetchPostsByFilter } from "@/services/Posts";
import { showErrorToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import HomeHeader from "./Home";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPosts, setTotalPosts] = useState(0);

  const loadPosts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await fetchPostPreview(pageNum, pageSize);
      setPosts(Array.isArray(data.results) ? data.results : []);
      setTotalPosts(data.count || 0);
    } catch (error) {
      showErrorToast(error.response?.data?.message || error.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };


  // Initial load
  useEffect(() => {
    loadPosts(page);
  }, [page]);

  // Load categories
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Failed to fetch categories:", error));
  }, []);

  // Remove deleted post from state
  const handleDelete = (postId) => setPosts((prev) => prev.filter((p) => p.id !== postId));

  const handleApply = async () => {
    setLoading(true);
    try {
      let data;

      // If user typed something OR selected a category → fetch all matching posts
      if (searchText || selectedCategory) {
        data = await fetchPostsByFilter({
          search: searchText,
          category: selectedCategory?.id,
          tags: searchText ? [searchText] : [],
          // Do NOT pass page or page_size → fetch all
        });

        const results = Array.isArray(data) ? data : data.results;
        setPosts(results || []);
        setTotalPosts(results?.length || 0);
      } else {
        // Normal mode → paginated posts
        setPage(1); // reset page
        data = await fetchPostPreview(1, pageSize);
        setPosts(Array.isArray(data.results) ? data.results : []);
        setTotalPosts(data.count || 0);
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || error.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };



  const totalPages = Math.ceil(totalPosts / pageSize);

  return (
    <div className="p-4">
      <HomeHeader />
      <h3 className="text-xl font-medium mb-6">All Posts ({totalPosts})</h3>

      {/* Filter Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="w-72 border-1 flex items-center rounded-sm border-gray-500">
          <Input
            className="border-none hover:border-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by title or tags"
          />
          <IoSearchSharp className="w-8 h-4" />
        </div>

        <div className="w-60">
          <Select
            onValueChange={(value) => setSelectedCategory(categories.find((c) => c.id.toString() === value) || null)}
            value={selectedCategory ? selectedCategory.id.toString() : undefined}
          >
            <SelectTrigger className="border border-gray-500">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-40 py-5" onClick={handleApply}>
          Apply
        </Button>
      </div>

      {/* Posts */}
      {loading ? (
        <Spinner size={8} />
      ) : (
        <CustomCardUi posts={posts} onDelete={handleDelete} />
      )}

      {/* Pagination */}
     {!(searchText || selectedCategory) && totalPages > 1 && (
  <div className="flex justify-center items-center mt-8 gap-4">
    <Button
      disabled={page <= 1}
      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
      className="flex items-center gap-2 px-5 py-2 bg-[#ff6f3c] text-white font-medium rounded-lg shadow hover:bg-[#e65a1f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <IoChevronBack size={18} /> Previous
    </Button>

    <span className="text-gray-700 font-medium">
      Page <span className="font-semibold">{page}</span> of{" "}
      <span className="font-semibold">{totalPages}</span>
    </span>

    <Button
      disabled={page >= totalPages}
      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
      className="flex items-center gap-2 px-5 py-2 bg-[#ff6f3c] text-white font-medium rounded-lg shadow hover:bg-[#e65a1f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Next <IoChevronForward size={18} />
    </Button>
  </div>
)}

    </div>
  );
};

export default AllPosts;
