import { getWarehouses } from "../../providers";
import React, { useEffect, useMemo, useState } from "react";

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);
  const [warehouseName, setWarehouseName] = useState(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const _warehouses = await getWarehouses();
      setWarehouses(_warehouses);
    };
    fetchWarehouses();
  }, []);

  // This effect is for handling the scneraio
  // where there's only one subdivision so we will set the warehouseId
  // to the only element in the list
  // useEffect(() => {
  // const fetchWarehouses = async () => {
  //   const _warehouses = await getWarehouses("Almacén");
  //   setWarehouses(_warehouses);
  // };
  // fetchWarehouses();
  // }, [warehouseName,]);

  // handle the warehouses and list of subvdisions
  const { listWarehouses, wareHouseSubdivisionMap } = React.useMemo(() => {
    const mapping = warehouses.reduce(
      (prev, warehouse) => {
        // console.log({ prev });
        const warehouseName = warehouse.name;
        const warehouseId = warehouse.id;
        const subDivision = warehouse.subDivision;

        if (warehouse.name in prev.map) {
          // prev.map[warehouseName].push({
          //   id: warehouseId,
          //   name: warehouse.subDivision,
          // });
          prev.map[warehouseName] = [
            ...prev.map[warehouseName],
            {
              id: warehouseId,
              name: warehouse.subDivision,
            },
          ];
          // prev.listWarehouses.push({ id: warehouseId, name: warehouse.name });
        } else {
          prev.map[warehouseName] = [
            { id: warehouseId, name: warehouse.subDivision },
          ];
          // prev.list.push({ id: warehouseId, name: warehouse.name });
        }

        // console.log("finalprev", { prev });

        return prev;
      },
      { list: [], map: {} },
    );

    return {
      listWarehouses: Object.keys(mapping.map),
      wareHouseSubdivisionMap: mapping.map,
    };
  }, [warehouses.length]);

  const listOfSubdivisions = React.useMemo(() => {
    return wareHouseSubdivisionMap[warehouseName] || [];
  }, [warehouseName]);

  const selectOptionsWarehouse = (collection) =>
    collection.map((document) => ({
      value: document,
      label: document,
    }));

  const selectOptionsUbicacion = (collection) =>
    collection.map((document) => ({
      value: document.id,
      label: document.name || "-",
    }));

  const onChangeSubVisionSelect = (value) => setWarehouseId(value);
  const onChangeWarehouseName = (value) => {
    setWarehouseId(null);
    setWarehouseName(value);
  };

  const subDivisionName =
    listOfSubdivisions.find((subdivision) => subdivision.id === warehouseId)
      ?.name || "-";

  return {
    listOfSubdivisions,
    listWarehouses,
    warehouseId,
    setWarehouseId,
    wareHouseSubdivisionMap,
    warehouseName,
    setWarehouseName,
    warehouses,
    setWarehouses,
    selectOptionsUbicacion,
    selectOptionsWarehouse,
    onChangeSubVisionSelect,
    onChangeWarehouseName,
    subDivisionName,
  };
};
