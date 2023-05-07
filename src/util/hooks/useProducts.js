import React from "react";
import { getProducts } from "../../providers";
import { Input, notification, message, Table, Modal } from "antd";

export const useProducts = (queryParams = {}) => {
  const [products, setProducts] = React.useState([]);
  const [pagination, setPagination] = React.useState(null);
  const [codes, setCodes] = React.useState([]);
  const [totalItems, setTotalItems] = React.useState(0);

  const fetchProducts = async () => {
    try {
      const _products = await getProducts(queryParams);
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
      setCodes(
        _products.rows.map((r) => {
          return { code: r.code };
        })
      );
    } catch (error) {
      notification.error({
        message: "Error en el servidor",
        description: error.message,
      });
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  return { products, codes, pagination, totalItems };
};
