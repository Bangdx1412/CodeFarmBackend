const createdHandler = (data, message = "Created successfully") => {
  return {
    status: true,
    message,
    data,
    statusCode: 201
  };
};

export default createdHandler; 