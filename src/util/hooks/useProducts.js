import React from "react";
import { getProducts } from "../../providers";
import { Input, notification, message, Table, Modal } from "antd";

export const useProducts = (queryParams = {}) => {
  const [products, setProducts] = React.useState([]);
  const [pagination, setPagination] = React.useState(null);
  const [codes, setCodes] = React.useState([]);
  const [totalItems, setTotalItems] = React.useState(0);

  const fetchProducts = async (queryParams) => {
    try {
      // filter the queryParams that has values of null or undefined
      const updatedQueryParams = Object.keys(queryParams).reduce(
        (prev, curr) => {
          queryParams[curr] ? (prev[curr] = queryParams[curr]) : prev;
          return prev;
        },
        {},
      );
      const _products = await getProducts(updatedQueryParams);
      setTotalItems(_products.length);
      setPagination({
        position: ["bottomCenter"],
        total: _products.pageSize * _products.pages,
        current: _products.page,
        pageSize: _products.pageSize,
        showSizeChanger: false,
        showQuickJumper: true,
      });
      setProducts(_products.rows);
      return _products.rows;
    } catch (error) {
      notification.error({
        message: "Error en el servidor",
        description: error.message,
      });
    }
  };

  // React.useEffect(() => {
  //   // dont run this at load, we will get the products after completing the fields in search
  //   fetchProducts(queryParams);
  // }, []);

  return {
    products,
    setProducts,
    codes,
    pagination,
    totalItems,
    fetchProducts,
  };
};
