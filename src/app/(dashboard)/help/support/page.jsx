"use client";

import { BookOpen, Users, MessageCircle, Phone, Mail, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

const Help = () => {
  const allArticles = [
    {
      id: 1,
      title: "Getting Started with Organic Farming",
      category: "Basics",
      description: "Learn the fundamentals of transitioning to organic farming practices and sustainable agriculture.",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Soil Health Management",
      category: "Techniques",
      description: "Discover proven methods to improve soil quality and maintain healthy, productive land.",
      readTime: "8 min read"
    },
    {
      id: 3,
      title: "Pest Control Without Chemicals",
      category: "Solutions",
      description: "Explore natural and sustainable approaches to managing pests in your crops.",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Water Conservation Strategies",
      category: "Resources",
      description: "Effective techniques for managing water resources and implementing efficient irrigation.",
      readTime: "7 min read"
    },
    {
      id: 5,
      title: "Crop Rotation Planning",
      category: "Techniques",
      description: "Master the art of crop rotation to maximize yields and maintain soil fertility.",
      readTime: "10 min read"
    },
    {
      id: 6,
      title: "Market Access and Pricing",
      category: "Business",
      description: "Understanding market opportunities and getting fair prices for your produce.",
      readTime: "12 min read"
    }
  ];

  const faqs = [
    {
      question: "How do I join the farming community?",
      answer: "You can join by registering on our platform and connecting with other farmers in your region."
    },
    {
      question: "Is the support available in my local language?",
      answer: "Yes, we provide support in multiple regional languages through our community volunteers."
    },
    {
      question: "Can I ask questions about specific crops?",
      answer: "Absolutely! Our community includes experts in various crops and farming methods."
    }
  ];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(allArticles.map((a) => a.category))];

  const filteredArticles = allArticles.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="border-b bg-white border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl text-green-700 font-bold mb-2">Farmer Support Center</h1>
          <p className="text-gray-600">Access resources, articles, and connect with the farming community</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {/* Search & Filter Section */}
        <section className="mb-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="relative w-full lg:w-1/3">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-start">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    selectedCategory === cat
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-green-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold">Help Articles</h2>
              <p className="text-sm text-gray-600">Expert guidance and farming techniques</p>
            </div>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white border border-gray-300 rounded-xl shadow-sm p-5 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold hover:text-green-700 transition">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 mb-4">{article.description}</p>
                  <button className="w-full flex items-center justify-between text-sm font-medium text-green-700 hover:bg-green-50 rounded-md py-2 px-3 transition">
                    Read Article
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">No articles found.</p>
          )}
        </section>

        {/* Separator */}
        <div className="my-12 h-px bg-gray-200" />

        {/* Community Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold">Community Support</h2>
              <p className="text-sm text-gray-600">Connect, learn, and grow together</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Discussion Forum
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Join conversations with fellow farmers, share experiences, and get advice from the community.
              </p>
              <button className="  max-w-sm  bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
                Visit Forum
              </button>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                <Users className="w-5 h-5 text-green-600" />
                Expert Network
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with agricultural experts and experienced farmers who can guide you.
              </p>
              <button className="  max-w-sm  bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
                Find Experts
              </button>
            </div>
          </div>

          

          {/* Contact Support */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-1">Need More Help?</h3>
            <p className="text-sm text-gray-600 mb-4">Our support team is here to assist you</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center border border-green-600 text-green-700 py-2 rounded-lg hover:bg-green-100 transition">
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </button>
              <button className="flex-1 flex items-center justify-center border border-green-600 text-green-700 py-2 rounded-lg hover:bg-green-100 transition">
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Help;
