export const sendSuccess = (res, data, message = "Thành công") => {
  res.status(200).json({
    success: true,
    message,
    data,
  });
};
