import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Container, DatePicker, Grid, Icon } from "../../components";
import { Modal, notification, Table } from "antd";
import {
  faCalendarAlt,
  faCheck,
  faEdit,
  faEye,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { clientDateFormat, serverDateFormat } from "../../util";
import { getSupplies, putSupplyStatus } from "../../providers";
import { useGlobal } from "reactn";
import { get } from "lodash";

export default ({ setPageTitle }) => {
  setPageTitle("Abastecimiento");

  const columns = [
    {
      title: "Movimiento",
      dataIndex: "id",
      /* width: "120px", */
      align: "center",
      render: (supplyId, supply) =>
        supply.status === "Pendiente" && (
          <Container justifyContent="space-between" padding="0px">
            <Button
              padding="0 0.5rem"
              onClick={async () => router.push(`/supplies/${supplyId}`)}
            >
              <Icon marginRight="0px" fontSize="0.8rem" icon={faEdit} />
            </Button>
            <Button
              padding="0 0.5rem"
              onClick={() => confirmCancelSupply(supplyId)}
              type="primary"
            >
              <Icon marginRight="0px" fontSize="0.8rem" icon={faTrash} />
            </Button>
          </Container>
        ),
    },
    {
      title: "Proveedor",
      dataIndex: "provider",
      align: "center",
      render: (provider) => provider.name,
    },
    {
      title: "Cod. Carga",
      dataIndex: "code",
      align: "center",
    },
    {
      title: "Almacén",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.name,
    },
    {
      title: "Fecha Reg.",
      dataIndex: "createdAt",
      align: "center",
      render: (createdAt) =>
        moment(createdAt, serverDateFormat).format(clientDateFormat),
    },
    {
      title: "Estado",
      dataIndex: "status",
      align: "center",
    },
    {
      title: "Acción",
      dataIndex: "status",
      width: "150px",
      align: "center",
      render: (status, supply) =>
        status === "Atendido" ? (
          <Button
            width="fit-content"
            onClick={async () => router.push(`/supplies/${supply.id}`)}
          >
            <Icon icon={faEye} />
            Ver
          </Button>
        ) : (
          <Button
            width="fit-content"
            type="primary"
            onClick={async () =>
              router.push(`/supplies/${supply.id}?operation=attend`)
            }
          >
            <Icon icon={faCheck} />
            Atender
          </Button>
        ),
    },
    {
      title: "Responsable",
      dataIndex: "id",
      align: "center",
      render: () =>
        `${get(globalAuthUser, "user.name", "")} ${get(
          globalAuthUser,
          "user.lastname",
          ""
        )}`,
    },
    {
      title: "Fecha Aten.",
      dataIndex: "attentionDate",
      align: "center",
      render: (attentionDate, supply) =>
        attentionDate
          ? moment(attentionDate, serverDateFormat).format(clientDateFormat)
          : supply.status,
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);
  const [pagination, setPagination] = useState(null);

  const [supplies, setSupplies] = useState([]);

  const [from, setFrom] = useState(moment().subtract(7, "days"));
  const [to, setTo] = useState(moment());

  const [page, setPage] = useState(1);

  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);

  const [globalAuthUser] = useGlobal("authUser");

  const router = useRouter();

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const _supplies = await getSupplies({
          from: from.format(serverDateFormat),
          to: to.format(serverDateFormat),
          page,
        });
        setPagination({
          position: ["bottomCenter"],
          total: _supplies.count,
          current: _supplies.page,
          pageSize: _supplies.pageSize,
          showSizeChanger: false,
          showQuickJumper: true,
        });
        setSupplies(
          _supplies.rows.filter((supply) => supply.status !== "Cancelado")
        );
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchProducts();
  }, [from, to, page, toggleUpdateTable]);

  const confirmCancelSupply = (supplyId) =>
    Modal.confirm({
      title: "Confirmar",
      content:
        "¿Está seguro de que desea marcar el abastecimiento como cancelado?",
      onOk: async () => cancelSupply(supplyId),
    });

  const cancelSupply = async (supplyId) => {
    try {
      await putSupplyStatus(supplyId, "Cancelado");
      setToggleUpdateTable((prevState) => !prevState);
    } catch (error) {
      notification.error({
        message: "Error al cancelar abastecimiento",
        description: error.message,
      });
    }
  };

  return (
    <>
      <Container height="10%">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="2rem">
          <DatePicker
            value={from}
            onChange={(value) => setFrom(value)}
            format={clientDateFormat}
            disabledDate={(value) => value >= to}
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha Inicio
              </>
            }
          />
          <DatePicker
            value={to}
            onChange={(value) => setTo(value)}
            format={clientDateFormat}
            disabledDate={(value) => value <= from}
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha Fin
              </>
            }
          />
          <Button
            type="primary"
            onClick={async () => router.push(`/supplies/new`)}
          >
            Nuevo abastecimiento
          </Button>
        </Grid>
      </Container>
      <Table
        columns={columns}
        bordered
        scrollToFirstRowOnChange
        pagination={pagination}
        scroll={{ y: windowHeight * 0.7 - 16 }}
        onChange={(pagination) => setPage(pagination.current)}
        dataSource={supplies}
      />
    </>
  );
};
