const handleSearch = (query) => {
  let objectSearch = {
    keyword: "",
    size: "",
    priceRange: {
      min: null,
      max: null,
    },
    sort: {
      field: "createdAt",
      order: -1,
    },
  };

  // Xử lý tìm kiếm theo keyword
  if (query.keyword) {
    objectSearch.keyword = query.keyword;
    objectSearch.regex = new RegExp(objectSearch.keyword, "i");
  }

  // Xử lý tìm kiếm theo size
  if (query.size) {
    objectSearch.size = query.size;
  }

  // Xử lý tìm kiếm theo khoảng giá
  if (query.minPrice) {
    objectSearch.priceRange.min = Number(query.minPrice);
  }
  if (query.maxPrice) {
    objectSearch.priceRange.max = Number(query.maxPrice);
  }

  // Xử lý sắp xếp
  if (query.sort) {
    const [field, order] = query.sort.split(":");
    if (field && order) {
      objectSearch.sort = {
        field,
        order: order === "desc" ? -1 : 1,
      };
    }
  }

  return objectSearch;
};

export default handleSearch;
