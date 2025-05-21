import Product from "../models/Product.model.js";
import { sendSuccess } from "../middlewares/success.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Lấy danh sách sản phẩm (có tìm kiếm, phân trang)
export const getProducts = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

//   const query = search
//     ? { title: { $regex: search, $options: "i" } }
//     : {};
const query = {
  ...(search && { title: { $regex: search, $options: "i" } }),
  deleted: false, // chỉ lấy sản phẩm chưa bị xoá
};

  const total = await Product.countDocuments(query);

const products = await Product.find(query)
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(Number(limit))
  .populate({
    path: "product_category_ids",
    select: "title" //  tên danh mục
  });

  sendSuccess(
    res,
    {
      products,
      total,
      limit: Number(limit),
      currentPage: Number(page),
    },
    "Lấy danh sách sản phẩm thành công"
  );
});

// Thêm sản phẩm mới
export const createProduct = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    throw new Error("Tên sản phẩm không được để trống");
  }
  const product = await Product.create(req.body);
  sendSuccess(res, product, "Thêm sản phẩm thành công");
});

// Cập nhật sản phẩm
export const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) throw new Error("Không tìm thấy sản phẩm");
  sendSuccess(res, updated, "Cập nhật sản phẩm thành công");
});

// Xóa mềm sản phẩm
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleted = await Product.findByIdAndUpdate(id, {
    deleted: true,
    deletedAt: new Date()
  }, { new: true });

  if (!deleted) throw new Error("Không tìm thấy sản phẩm để xóa");
  sendSuccess(res, deleted, "Xóa mềm sản phẩm thành công");
});
// Xóa vĩnh viễn sản phẩm
export const forceDeleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new Error("Không tìm thấy sản phẩm để xoá vĩnh viễn");
  sendSuccess(res, deleted, "Đã xoá vĩnh viễn sản phẩm");
});
export const restoreProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const restored = await Product.findByIdAndUpdate(id, {
    deleted: false,
    deletedAt: null
  }, { new: true });

  if (!restored) throw new Error("Không tìm thấy sản phẩm để khôi phục");
  sendSuccess(res, restored, "Khôi phục sản phẩm thành công");
});
