export const PRODUCT_MESSAGES = {
  GET_LIST_SUCCESS: "Lấy danh sách sản phẩm thành công",
  GET_BY_ID_SUCCESS: "Lấy sản phẩm thành công",
  CREATE_SUCCESS: "Thêm sản phẩm thành công",
  UPDATE_SUCCESS: "Cập nhật sản phẩm thành công",
  SOFT_DELETE_SUCCESS: "Xóa mềm sản phẩm thành công",
  DELETE_SUCCESS: "Đã xoá vĩnh viễn sản phẩm",
  RESTORE_SUCCESS: "Khôi phục sản phẩm thành công",
  NOT_FOUND: "Sản phẩm không tồn tại hoặc đã bị xóa",
  ALREADY_DELETED: "Sản phẩm đã bị xóa mềm trước đó",
  NOT_SOFT_DELETED: "Sản phẩm chưa bị xóa mềm",
  TITLE_REQUIRED: "Tên sản phẩm không được để trống",
  ALREADY_EXISTS: "Sản phẩm đã tồn tại",
  CATEGORY_REQUIRED: "Danh mục sản phẩm không được để trống",
  CATEGORY_NOT_FOUND: "Danh mục sản phẩm không tồn tại",
  VARIANTS_REQUIRED: "Vui lòng thêm ít nhất một biến thể cho sản phẩm",
  VARIANT_INVALID: "Biến thể không hợp lệ, vui lòng kiểm tra lại size và số lượng",
  VARIANT_SIZE_REQUIRED: "Size của biến thể không được để trống",
  VARIANT_STOCK_REQUIRED: "Số lượng của biến thể không được để trống",
  VARIANT_STOCK_INVALID: "Số lượng của biến thể phải lớn hơn 0",
  VARIANT_SIZE_DUPLICATE: "Size này đã tồn tại trong sản phẩm",
  INVALID_ID: "ID không hợp lệ",
  DUPLICATE_KEY: "Dữ liệu bị trùng lặp (ví dụ: title hoặc slug đã tồn tại)",
  UPLOAD_SUCCESS: "Tải ảnh lên thành công",
  UPLOAD_FAILED: "Tải ảnh lên thất bại"
};
export const COUPON_MESSAGES = {
  CREATE_SUCCESS: "Tạo mã giảm giá thành công",
  UPDATE_SUCCESS: "Cập nhật mã giảm giá thành công",
  CODE_EXISTS: "Mã coupon đã tồn tại",
  NOT_FOUND: "Không tìm thấy coupon",
  SERVER_ERROR: "Lỗi server"
};

export const CART_MESSAGES = {
  ADD_SUCCESS: "Thêm vào giỏ hàng thành công",
  UPDATE_SUCCESS: "Cập nhật giỏ hàng thành công",
  REMOVE_SUCCESS: "Xóa sản phẩm khỏi giỏ hàng thành công",
  GET_SUCCESS: "Lấy giỏ hàng thành công",
  EMPTY_CART: "Giỏ hàng trống",
  NOT_FOUND: "Không tìm thấy giỏ hàng",
  PRODUCT_NOT_FOUND: "Sản phẩm không tồn tại",
  VARIANT_NOT_FOUND: "Không tìm thấy biến thể sản phẩm",
  INVALID_VARIANT: "ID biến thể không hợp lệ",
  QUANTITY_REQUIRED: "Số lượng phải lớn hơn 0",
  INSUFFICIENT_STOCK: "Số lượng sản phẩm trong kho không đủ",
  INSUFFICIENT_VARIANT_STOCK: "Số lượng biến thể trong kho không đủ",
  ITEM_NOT_FOUND: "Không tìm thấy sản phẩm hoặc biến thể trong giỏ hàng",
  ITEM_NOT_FOUND_TO_REMOVE: "Không tìm thấy sản phẩm hoặc biến thể trong giỏ hàng để xóa",
  INVALID_INPUT: "Dữ liệu không hợp lệ"
};