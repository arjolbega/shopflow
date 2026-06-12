import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { adminApi } from "../../api/admin.api";
import type { AdminProduct } from "../../api/admin.api";
import { productApi } from "../../api/product.api";
import { categoryApi } from "../../api/category.api";
import type { Category, PaginationMeta, Product } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../hooks/useToast";
import DataTable from "../../components/admin/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "../../utils/cn";
import axios from "axios";
import type { ApiError, Column } from "../../types";

// All fields kept as strings — transform to numbers at submit
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  compare_price: z.string().optional(),
  stock: z.string(),
  sku: z.string().min(1, "SKU is required"),
  category_id: z.string().min(1, "Category is required"),
  is_featured: z.boolean()
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: "0",
      is_featured: false
    }
  });

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    adminApi
      .getProducts({
        page: currentPage,
        limit: 15,
        search: currentSearch || undefined
      })
      .then((result) => {
        setProducts(result.data);
        setPagination(result.pagination);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [currentPage, currentSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    categoryApi
      .getAll()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleToggle = async (product: AdminProduct) => {
    setTogglingId(product.id);
    try {
      await adminApi.toggleProduct(product.id);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)));
      toast.success(`Product ${product.is_active ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to toggle product");
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    reset({
      name: "",
      description: "",
      price: "",
      compare_price: "",
      stock: "0",
      sku: "",
      category_id: "",
      is_featured: false
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      price: String(product.price),
      compare_price: product.compare_price ? String(product.compare_price) : "",
      stock: String(product.stock),
      sku: product.sku,
      category_id: String(product.category_id),
      is_featured: product.is_featured
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProductFormValues) => {
    // Transform string fields to numbers before sending to API
    const payload: Partial<Product> = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      compare_price: data.compare_price ? parseFloat(data.compare_price) : undefined,
      stock: parseInt(data.stock),
      sku: data.sku,
      category_id: parseInt(data.category_id),
      is_featured: data.is_featured
    };

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        toast.success("Product updated");
      } else {
        console.log(payload);

        await productApi.create(payload);
        toast.success("Product created");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errData = err.response?.data as ApiError;
        toast.error(errData?.error?.message || "Failed to save product");
      } else {
        toast.error("Failed to save product");
      }
    }
  };

  const columns: Column<AdminProduct>[] = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-elevated border border-border flex-shrink-0">{row.primary_image ? <img src={row.primary_image} alt={row.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-30">📦</div>}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">{row.name}</p>
            <p className="text-xs text-text-muted font-mono">{row.sku}</p>
          </div>
        </div>
      )
    },
    {
      key: "category",
      header: "Category",
      render: (row) => <span className="text-sm text-text-secondary">{row.category_name || "—"}</span>
    },
    {
      key: "price",
      header: "Price",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
            {formatPrice(row.price)}
          </span>
          {row.compare_price && (
            <span className="text-xs text-text-muted line-through" style={{ fontFamily: "var(--font-mono)" }}>
              {formatPrice(row.compare_price)}
            </span>
          )}
        </div>
      )
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => <span className={cn("text-sm font-medium", row.stock === 0 ? "text-error" : row.stock <= 5 ? "text-warning" : "text-text-primary")}>{row.stock}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.is_active ? "success" : "muted"} dot>
            {row.is_active ? "Active" : "Inactive"}
          </Badge>
          {!!row.is_featured && <Badge variant="accent">Featured</Badge>}
        </div>
      )
    },
    {
      key: "created",
      header: "Created",
      render: (row) => <span className="text-xs text-text-muted">{formatDate(row.created_at)}</span>
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => handleEdit(row)} className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors cursor-pointer border border-border">
            Edit
          </button>
          <button onClick={() => handleToggle(row)} disabled={togglingId === row.id} className={cn("p-1.5 rounded-lg transition-colors cursor-pointer border", "disabled:opacity-30 disabled:cursor-not-allowed", row.is_active ? "text-success border-success/20 hover:bg-success/10" : "text-text-muted border-border hover:bg-bg-elevated")}>
            {row.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Products
          </h1>
          {pagination && <p className="text-sm text-text-muted mt-0.5">{pagination.total} total</p>}
        </div>
        <Button variant="accent" leftIcon={<Plus size={16} />} onClick={handleCreate}>
          Add Product
        </Button>
      </div>

      <div className="mb-5">
        <Input
          placeholder="Search by name or SKU..."
          leftIcon={<Search size={16} />}
          className="max-w-sm"
          defaultValue={currentSearch}
          onChange={(e) => {
            const params: Record<string, string> = {};
            if (e.target.value) params.search = e.target.value;
            setSearchParams(params, { replace: true });
          }}
        />
      </div>

      <DataTable columns={columns} data={products} isLoading={isLoading} pagination={pagination} onPageChange={(page) => setSearchParams({ page: String(page) }, { replace: true })} rowKey={(row) => row.id} emptyMessage="No products found" />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Edit Product" : "New Product"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Name" placeholder="Product name" error={errors.name?.message} {...register("name")} />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium tracking-widest uppercase text-text-secondary block mb-1.5">Description</label>
              <textarea placeholder="Product description..." rows={3} className="w-full bg-bg-subtle border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent resize-none" {...register("description")} />
              {errors.description && <p className="text-xs text-error mt-1">{errors.description.message}</p>}
            </div>

            <Input label="Price ($)" type="number" step="0.01" placeholder="0.00" error={errors.price?.message} {...register("price")} />

            <Input label="Compare Price ($)" type="number" step="0.01" placeholder="0.00 (optional)" {...register("compare_price")} />

            <Input label="Stock" type="number" placeholder="0" error={errors.stock?.message} {...register("stock")} />

            <Input label="SKU" placeholder="PROD-001" error={errors.sku?.message} {...register("sku")} />

            <div className="col-span-2">
              <label className="text-xs font-medium tracking-widest uppercase text-text-secondary block mb-1.5">Category</label>
              <select className="w-full bg-bg-subtle border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" {...register("category_id")}>
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-error mt-1">{errors.category_id.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="accent-amber-500 w-4 h-4" {...register("is_featured")} />
                <span className="text-sm text-text-secondary">Featured product</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" fullWidth isLoading={isSubmitting}>
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
