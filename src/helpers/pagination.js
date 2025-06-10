const handlePagination = (query, defaultLimit = 10) => {
  const pagination = {
    currentPage: 1,
    limit: defaultLimit,
    skip: 0,
  };

  // Xử lý page
  if (query.page) {
    pagination.currentPage = parseInt(query.page);
    if (isNaN(pagination.currentPage) || pagination.currentPage < 1) {
      pagination.currentPage = 1;
    }
  }

  // Xử lý limit
  if (query.limit) {
    pagination.limit = parseInt(query.limit);
    if (isNaN(pagination.limit) || pagination.limit < 1) {
      pagination.limit = defaultLimit;
    }
    // Giới hạn limit tối đa là 50
    pagination.limit = Math.min(pagination.limit, 50);
  }

  // Tính skip
  pagination.skip = (pagination.currentPage - 1) * pagination.limit;

  return pagination;
};

export default handlePagination;
