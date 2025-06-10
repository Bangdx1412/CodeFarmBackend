export const sendSuccess = (res, data, message = "Thành công") => {
  res.status(200).json({
    success: true,
    message,
    data,
  });
};
// Hàm gửi response lỗi
export const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: [],
  });
};
