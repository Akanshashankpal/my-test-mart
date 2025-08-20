import { RequestHandler } from "express";
import { Product, ProductFilters, ProductsResponse } from "@shared/api";

// Mock products data service
class ProductsService {
  private products: Product[] = [];

  constructor() {
    this.initializeMockProducts();
  }

  private initializeMockProducts() {
    const categories = ["Mobile", "Laptop", "AC", "TV", "Refrigerator", "Washing Machine"];
    const brands = ["Samsung", "Apple", "LG", "Sony", "Dell", "HP", "Whirlpool", "Godrej"];
    
    for (let i = 1; i <= 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const stockQuantity = Math.floor(Math.random() * 100) + 5;
      
      this.products.push({
        id: `prod_${i.toString().padStart(3, '0')}`,
        name: `${brand} ${category} Model ${i}`,
        category,
        price: Math.floor(Math.random() * 100000) + 10000, // 10k to 110k
        stockQuantity,
        lowStockThreshold: 10,
        sku: `SKU${i.toString().padStart(5, '0')}`,
        description: `High-quality ${category.toLowerCase()} from ${brand}`,
        brand,
        gstRate: category === "Mobile" ? 18 : 28,
        unit: "piece",
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  async getProducts(filters: ProductFilters): Promise<ProductsResponse> {
    let filteredProducts = [...this.products];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    if (filters.lowStock) {
      filteredProducts = filteredProducts.filter(product =>
        product.stockQuantity <= product.lowStockThreshold
      );
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);

    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return {
      products: paginatedProducts,
      total,
      page,
      totalPages
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find(product => product.id === id) || null;
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) return null;

    const updatedProduct = {
      ...this.products[productIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) return false;

    this.products.splice(productIndex, 1);
    return true;
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set(this.products.map(p => p.category));
    return Array.from(categories).sort();
  }

  async getBrands(): Promise<string[]> {
    const brands = new Set(this.products.map(p => p.brand).filter(Boolean));
    return Array.from(brands).sort();
  }
}

const productsService = new ProductsService();

// Get all products with filters and pagination
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const filters: ProductFilters = {
      search: req.query.search as string,
      category: req.query.category as string,
      lowStock: req.query.lowStock === 'true',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await productsService.getProducts(filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

// Get single product by ID
export const getProductById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productsService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
};

// Create new product
export const createProduct: RequestHandler = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await productsService.createProduct(productData);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

// Update product
export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedProduct = await productsService.updateProduct(id, updates);
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
};

// Delete product
export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await productsService.deleteProduct(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
};

// Get product categories
export const getCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await productsService.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

// Get product brands
export const getBrands: RequestHandler = async (req, res) => {
  try {
    const brands = await productsService.getBrands();
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brands'
    });
  }
};
