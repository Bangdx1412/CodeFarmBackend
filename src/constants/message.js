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
export const CONTACT_MESSAGES = {
  CREATE_SUCCESS: "Thêm liên hệ thành công",
  GET_LIST_SUCCESS: "Lấy danh sách liên hệ thành công",
  DELETE_SUCCESS: "Xóa liên hệ thành công",
  NOT_FOUND: "Không tìm thấy liên hệ",
  SERVER_ERROR: "Lỗi server"
};
export const BANNER_MESSAGES = {
  CREATE_SUCCESS: "Thêm banner thành công",
  GET_LIST_SUCCESS: "Lấy danh sách banner thành công",
  UPDATE_SUCCESS: "Cập nhật banner thành công",
  SOFT_DELETE_SUCCESS: "Xóa mềm banner thành công",
  RESTORE_SUCCESS: "Khôi phục banner thành công",
  DELETE_SUCCESS: "Xóa banner thành công",
  NOT_FOUND: "Không tìm thấy banner",
  SERVER_ERROR: "Lỗi server"
};

export const SHIPPING_METHOD_MESSAGES = {
  GET_LIST_SUCCESS: "Lấy danh sách phương thức vận chuyển thành công",
  GET_BY_ID_SUCCESS: "Lấy thông tin phương thức vận chuyển thành công",
  CREATE_SUCCESS: "Tạo phương thức vận chuyển thành công",
  UPDATE_SUCCESS: "Cập nhật phương thức vận chuyển thành công",
  DELETE_SUCCESS: "Xóa phương thức vận chuyển thành công",
  NOT_FOUND: "Không tìm thấy phương thức vận chuyển",
  NAME_REQUIRED: "Tên phương thức vận chuyển không được để trống",
  CARRIER_REQUIRED: "Tên đơn vị vận chuyển không được để trống",
  FEE_REQUIRED: "Phí vận chuyển không được để trống",
  FEE_INVALID: "Phí vận chuyển phải lớn hơn hoặc bằng 0",
  ESTIMATED_DAYS_REQUIRED: "Số ngày ước tính không được để trống",
  ESTIMATED_DAYS_INVALID: "Số ngày ước tính phải lớn hơn hoặc bằng 0",
  STATUS_INVALID: "Trạng thái phải là active hoặc inactive",
  SERVER_ERROR: "Lỗi server"
};

export const USER_MESSAGES = {
  GET_PROFILE_SUCCESS: "Lấy thông tin thành công",
  UPDATE_SUCCESS: "Cập nhật thành công",
  CHANGE_PASSWORD_SUCCESS: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
  GET_USERS_SUCCESS: "Lấy danh sách người dùng thành công",
  NOT_FOUND: "Không tìm thấy người dùng",
  INVALID_DATA: "Dữ liệu không hợp lệ",
  NO_DATA_TO_UPDATE: "Không có dữ liệu để cập nhật",
  OLD_PASSWORD_INCORRECT: "Mật khẩu cũ không chính xác",
  NEW_PASSWORD_SAME_AS_OLD: "Mật khẩu mới không được trùng với mật khẩu cũ",
  SERVER_ERROR: "Lỗi server"
};