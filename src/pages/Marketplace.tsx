import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, Store, TrendingUp, Heart, Star, MapPin, Phone } from "lucide-react";
import { useState } from "react";

const products = [
  {
    id: 1,
    name: "Handwoven Cotton Sarees",
    seller: "Shakti SHG",
    price: 1200,
    rating: 4.8,
    reviews: 24,
    location: "Rampur",
    category: "Handicrafts",
    image: "saree",
  },
  {
    id: 2,
    name: "Organic Honey (500g)",
    seller: "Nature's Best SHG",
    price: 350,
    rating: 4.9,
    reviews: 56,
    location: "Gopalnagar",
    category: "Food",
    image: "honey",
  },
  {
    id: 3,
    name: "Handmade Pottery Set",
    seller: "Gramin Artisans",
    price: 850,
    rating: 4.7,
    reviews: 18,
    location: "Shivpuri",
    category: "Handicrafts",
    image: "pottery",
  },
  {
    id: 4,
    name: "Organic Spices Pack",
    seller: "Spice Sisters SHG",
    price: 280,
    rating: 4.6,
    reviews: 42,
    location: "Rampur",
    category: "Food",
    image: "spices",
  },
  {
    id: 5,
    name: "Bamboo Baskets (Set of 3)",
    seller: "Green Craft SHG",
    price: 450,
    rating: 4.5,
    reviews: 31,
    location: "Gopalnagar",
    category: "Handicrafts",
    image: "baskets",
  },
  {
    id: 6,
    name: "Homemade Pickles",
    seller: "Taste of Home SHG",
    price: 180,
    rating: 4.8,
    reviews: 67,
    location: "Shivpuri",
    category: "Food",
    image: "pickles",
  },
];

const categories = ["All", "Handicrafts", "Food", "Textiles", "Home Decor"];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Marketplace"
        description="Buy and sell products from SHGs across the network"
      >
        <Button className="btn-gradient text-white border-0">
          <Store className="w-4 h-4 mr-2" />
          My Shop
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6A1B9A] to-[#C2185B] flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">SHG Shops</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FBC02D] to-[#F57F17] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹2.4L</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">89</p>
                <p className="text-sm text-muted-foreground">Wishlist</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products or sellers..."
            className="pl-10 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "btn-gradient text-white border-0"
                  : "border-[#C2185B]/20 hover:bg-[#C2185B]/5"
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-[#C2185B]/10 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-[#C2185B]/10 to-[#6A1B9A]/10 flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-[#C2185B]/30" />
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-[#C2185B]/10 text-[#C2185B] text-xs font-medium">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-[#FBC02D] text-[#FBC02D]" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews})</span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">by {product.seller}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                {product.location}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#C2185B]/10">
                <span className="text-xl font-bold text-[#C2185B]">₹{product.price}</span>
                <Button size="sm" className="btn-gradient text-white border-0">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
