const successHandler = (data, message = "Success", statusCode = 200) => {
  return {
    status: true,
    message,
    data,
    statusCode
  };
};

export default successHandler; 