const handlePagination = (objectPagination, query, countProducts) => {
    if (query.page) {
        objectPagination.currentPage = parseInt(query.page);
    }

    const totalPage = Math.ceil(countProducts / objectPagination.limitItiem);
    objectPagination.totalPage = totalPage;
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItiem;

    return objectPagination;
};

export default handlePagination;