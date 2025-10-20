import { useState, useEffect } from "react";
import axios from "axios"; // ✅ Imported axios
import "../../styles/seller/ManageMenusPage.css";

const businessServiceBaseURL = import.meta.env.VITE_BUSINESS_SERVICE_URL;

const ManageMenusPage = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const businessResponse = await axios.get(
          // `/api/business/${userId}`,
          `${businessServiceBaseURL}/api/business/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const business = businessResponse.data;
        const businessId = business.id;

        const menuResponse = await axios.get(
          // `/api/business/menu-items/${businessId}`,
          `${businessServiceBaseURL}/api/business/menu-items/${businessId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const items = menuResponse.data;

        // Organize products by category
        const grouped = {};
        const uniqueCategories = new Set();

        for (const item of items) {
          if (!grouped[item.category]) grouped[item.category] = [];
          grouped[item.category].push({
            name: item.productName,
            price: item.price,
            description: item.description,
            image: item.image,
            category: item.category,
          });
          uniqueCategories.add(item.category);
        }

        setCategories([...uniqueCategories]);
        setProductsByCategory(grouped);

        // Set first category as selected by default
        if (items.length > 0) {
          setSelectedCategory(items[0].category);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
        alert("Failed to fetch menu items.");
      }
    };

    fetchMenuItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setNewProduct((prev) => ({
      ...prev,
      image: file, // Save the actual file
    }));
  };

  const handleAddCategory = () => {
    setNewCategoryName("");
    setIsCategoryModalOpen(true);
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value === "__add_new__") {
      handleAddCategory();
    } else {
      setNewProduct({ ...newProduct, category: value });
    }
  };

  const handleAddProduct = async () => {
    const { name, price, description, image, category } = newProduct;
    if (!name || !price || !category || !image) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("productName", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("productImage", image); // 👈 this matches multer's fieldname

      const response = await axios.post(
        // "/api/business/menu/add-items",
        `${businessServiceBaseURL}/api/business/menu/add-items`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;

      console.log("Product saved with ID:", data.id);

      // Add to UI
      const newEntry = {
        name,
        price,
        description,
        image: URL.createObjectURL(image), // Temporary preview
        category,
      };

      if (!categories.includes(category)) {
        setCategories((prev) => [...prev, category]);
      }

      const updated = { ...productsByCategory };
      updated[category] = [...(updated[category] || []), newEntry];
      setProductsByCategory(updated);
      setSelectedCategory(category);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      alert(
        error.response?.data?.message ||
          "Failed to add product. Please try again."
      );
    }
  };

  const handleEdit = (index) => {
    const productToEdit = productsByCategory[selectedCategory][index];
    setEditingIndex(index);
    setNewProduct({ ...productToEdit, category: selectedCategory });
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    const { category } = newProduct;
    const updatedProducts = { ...productsByCategory };

    if (category !== selectedCategory) {
      updatedProducts[selectedCategory].splice(editingIndex, 1);
    }

    if (!updatedProducts[category]) updatedProducts[category] = [];
    updatedProducts[category].push(newProduct);

    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
    }

    setProductsByCategory(updatedProducts);
    setSelectedCategory(category);
    resetForm();
  };

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setNewProduct({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
    });
    setIsModalOpen(true);
  };

  const handleConfirmAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.includes(trimmedName)) {
      setCategories((prev) => [...prev, trimmedName]);
      setNewProduct((prev) => ({
        ...prev,
        category: trimmedName,
      }));
    } else if (trimmedName) {
      setNewProduct((prev) => ({
        ...prev,
        category: trimmedName,
      }));
    }
    setIsCategoryModalOpen(false);
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
    });
    setEditingIndex(null);
    setIsModalOpen(false);
  };

  return (
    <div className="menus-page">
      <h2>Manage Menus</h2>

      <button onClick={handleOpenAddModal} className="add-button">
        Add New
      </button>

      {/* Category Tabs */}
      <div className="category-tabs">
        {Object.entries(productsByCategory).map(([category, products]) =>
          products.length > 0 ? (
            <button
              key={category}
              className={`tab-button ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ) : null
        )}
      </div>

      <hr />

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {editingIndex !== null ? "Edit Product" : "Add New Product"}
            </h3>
            <input
              name="name"
              value={newProduct.name}
              onChange={handleChange}
              placeholder="Food Name"
            />
            <input
              name="price"
              value={newProduct.price}
              onChange={handleChange}
              placeholder="Price"
              type="number"
            />
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleChange}
              placeholder="Description"
            />
            <select value={newProduct.category} onChange={handleCategorySelect}>
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__add_new__">+ Add Category</option>
            </select>

            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <div className="modal-buttons">
              {editingIndex !== null ? (
                <button onClick={handleSaveEdit}>Save</button>
              ) : (
                <button onClick={handleAddProduct}>Add</button>
              )}
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Add Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
            />
            <div className="modal-buttons">
              <button onClick={handleConfirmAddCategory}>Confirm</button>
              <button onClick={() => setIsCategoryModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Cards */}
      <div className="product-list">
        {(productsByCategory[selectedCategory] || []).map((prod, index) => (
          <div key={index} className="product-card">
            {prod.image && <img src={prod.image} alt={prod.name} />}
            <h3>{prod.name}</h3>
            <p>{prod.description}</p>
            <strong>${prod.price}</strong>
            <button onClick={() => handleEdit(index)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageMenusPage;
