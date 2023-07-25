import React from "react";
import styles from "./proforma.module.css";
import { Space, Table, Tag } from "antd";
import styled from "styled-components";
import { getProforma } from "../../../providers";
import { useRouter } from "next/router";
// import { faCalendarAlt } from "@fortawesome/fontawesome-svg-core";

export const ProformaPdf = () => {
  const color = "#ed7204";
  const companyName = "ABC Company";
  const companyAddress = "123 Main Street, City, State";
  const companyPhoneNumber = "123-456-7890";
  const router = useRouter();
  const { proformaId } = router.query;
  const [proforma, setProforma] = React.useState([]);

  React.useMemo(() => {
    const fetchProforma = async () => {
      try {
        const _proforma = await getProforma(proformaId);
        setProforma(_proforma);
      } catch (error) {
        // router.back();
      }
    };
    proformaId && fetchProforma();
  }, [router]);
  console.log("router", proforma);
  // console.log(styles);

  if (proforma.length === 0) {
    return <div>loading</div>;
  }

  const columns = [
    {
      title: "CANTIDAD",
      dataIndex: "cantidad",
      key: "cantidad",
      align: "center",
    },
    {
      title: "DESCRIPCIÓN",
      align: "center",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "P.UNIT.",
      align: "center",
      dataIndex: "punit",
      key: "punit",
    },
    {
      title: "IMPORTE",
      align: "center",
      dataIndex: "importe",
      key: "importe",
    },
  ];

  const data = proforma?.proformaProducts.map((producto, index) => {
    return {
      key: index,
      cantidad: producto?.quantity,
      descripcion: producto?.product.tradename || "",
      punit: producto?.product.suggestedPrice / 100 ?? "Precio no encontrado",
      importe: (producto?.product.suggestedPrice / 100) * producto?.quantity,
    };
  });

  const total = (proforma.subtotal - proforma.discount) / 100;

  // const data = [
  //   {
  //     key: "1",
  //     cantidad: 10,
  //     descripcion: "Alternador 1",
  //     punit: 12.5,
  //     importe: 23,
  //   },
  // ];

  return (
    <div className={styles.invoiceContainer} style={{ padding: "10px 10px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          // gap: "24px",
        }}
      >
        <div style={{ flex: 1, marginRight: "24px" }}>
          <img
            src="/max-import.png"
            style={{ maxWidth: "100%", width: "200px" }}
          />
        </div>
        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            // gap: "4px",
            lineHeight: 0.99,
            fontSize: "12px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: "28px",
              fontStyle: "italic",
              fontWeight: 700,
              lineHeight: 0.9,
              marginBottom: "4px",
            }}
          >
            Max Importaciones
          </div>
          <div
            style={{
              // textAlign: "justify",
              fontSize: "12px",
              fontWeight: 600,
              borderBottom: `1px solid #ed7204`,
              paddingBottom: "3px",
              marginBottom: "4px",
            }}
          >
            Venta por mayor y menor de: Alternadores - Arrancadores - Armaduras
            - Bendix - Campos - Solenoides - Tapas - Porta Carbones - Relays -
            Etc.{" "}
          </div>
          <div
            className="solicitud-cotizacion"
            style={{
              marginBottom: "4px",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: "600" }}>
              SOLICITUD COTIZACIÓN:
            </div>
            <div
              style={{
                backgroundColor: "#ed7204",
                display: "flex",
                margin: "4px 0px",
                alignItems: "center",
                padding: "3px 5px",
                borderRadius: "4px",
              }}
            >
              <img src="/whatsapp.png" height="20px"></img>
              <div
                classNumber="whatsapp-number"
                style={{
                  paddingLeft: "8px",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                <span>946 098 776 / </span>
                <span>940 215 197 / </span>
                <span>955 036 493</span>
              </div>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#e6e7e8",
              marginBottom: "4px",
              fontWeight: 700,
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              // gap: "4px",
              fontSize: "16px",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                marginBottom: "4px",
                // gap: "4px",
                alignItems: "center",
              }}
            >
              SOLICITUD DE FACTURA:{" "}
              <img
                src="/whatsapp-orange.svg"
                style={{ marginLeft: "4px" }}
                height="18px"
              ></img>{" "}
              <div style={{ marginLeft: "4px" }}>982 962 126</div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              SOLICITUD DE GUÍA DE TRANSPORTE:
              <img
                src="/whatsapp-orange.svg"
                style={{ marginLeft: "4px" }}
                height="18px"
              ></img>
              <div style={{ marginLeft: "4px" }}>957 013 097</div>
            </div>
          </div>
          <div
            style={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              // gap: "8px",
              fontSize: "16px",
            }}
          >
            <img
              src="/location_icon.svg"
              height="18px"
              style={{ marginRight: "4px" }}
            />
            Jr. García Naranjo 127 - La Victoria{" "}
            <img
              src="/telephone_icon.svg"
              height="18px"
              style={{ margin: "4px 4px" }}
            ></img>{" "}
            (01) 424 7530
          </div>
        </div>
        <div
          style={{
            flex: 1.5,
            marginLeft: "24px",
            display: "flex",
            flexDirection: "column",
            // justifyContent: "center",
            alignItems: "start",
          }}
        >
          <div>
            <span style={{ fontSize: "16px" }}>AGENCIA:</span>
            <div></div>
          </div>
          <div
            style={{
              borderRadius: "8px",
              border: "1px solid",
              width: "100%",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              flex: "1",
            }}
          >
            <div
              style={{
                borderTopLeftRadius: "8px",
                letterSpacing: "1.6px",
                borderTopRightRadius: "8px",
                backgroundColor: "#ed7204",
                color: "white",
                fontWeight: "bold",
                fontSize: "32px",
                display: "flex",
                justifyContent: "center",
                padding: "4px 0px",
                lineHeight: 1,
              }}
            >
              PROFORMA
            </div>
            <div
              style={{
                padding: "4px 0px",
                // height: "100%",
                color: "red",
                fontSize: "24px",
                fontWeight: 600,
                flex: "1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Nº {proforma.id}
            </div>
          </div>
          <TipoProformaContainer className="tipo-proforma">
            <TipoProformaItem>
              <input type="checkbox" />
              CAJA EFECTIVO
            </TipoProformaItem>
            <TipoProformaItem>
              <input type="checkbox" />
              DEPÓSITO
            </TipoProformaItem>
            <TipoProformaItem>
              <input type="checkbox" />
              CRÉDITO
            </TipoProformaItem>
          </TipoProformaContainer>
        </div>
      </div>
      <UserInfo>
        <div className="user" style={{ flex: 1 }}>
          <div className="name">
            <span>Señor(es): </span>
            {`${proforma.client.name} ${proforma.client.lastname || ""} `}
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
            }}
          >
            <div className="name">
              <span>Dirección: </span>
              {`${proforma?.client?.address || "Sin direccion"}`}
            </div>
            <div className="dni">
              <span>
                {proforma?.client?.type === "PERSON"
                  ? "D.N.I: "
                  : proforma?.client?.type === "COMPANY"
                  ? "RUC: "
                  : "Documento Personal: "}
              </span>
              {`${proforma?.client?.idNumber || "-"}`}
            </div>
          </div>
        </div>
        <div className="date" style={{ padding: "0px 12px", flex: 0.2 }}>
          <span>Fecha:</span> 12/03/22
        </div>
      </UserInfo>

      <div style={{ padding: "4px 0px" }}>
        <Table
          className="pdfProforma"
          columns={columns}
          bordered
          dataSource={data}
          size="small"
          pagination={false}
          style={{ backgroundColor: "red" }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="center">
                  DESCUENTO S/
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  {proforma.discount / 100}
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="center">
                  TOTAL S/
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  {total}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>
      <div
        className="proforma-footer"
        style={{ display: "flex", fontFamily: "monospace" }}
      >
        <div
          className="proforma-bank-accounts"
          style={{
            display: "grid",
            gap: "12px",
            marginRight: "12px",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <ProformAccountWrapper className="proforma-bank-account-type">
            <div className="proforma-bank-title">
              MAX IMPORTACIONES Y SERVICIOS GENERALES SAC
            </div>
            <AccountNumber>
              <div>BCP SOLES: 191-2179658-0-45</div>
              <input type="checkbox" />
            </AccountNumber>
            <AccountNumber>
              <div>BCP SOLES: 191-2179658-0-45</div>
              <input type="checkbox" />
            </AccountNumber>
          </ProformAccountWrapper>
          <ProformAccountWrapper className="proforma-bank-account-type">
            <div className="proforma-bank-title">
              MAX IMPORTACIONES Y SERVICIOS GENERALES SAC
            </div>
            <AccountNumber>
              <div>BCP SOLES: 191-2179658-0-45</div>
              <input type="checkbox" />
            </AccountNumber>
            <AccountNumber>
              <div>BCP SOLES: 191-2179658-0-45</div>
              <input type="checkbox" />
            </AccountNumber>
          </ProformAccountWrapper>
          <ProformAccountWrapper className="proforma-bank-account-type">
            <div className="proforma-bank-title">
              MAX IMPORTACIONES Y SERVICIOS GENERALES SAC
            </div>
            <AccountNumber>
              <div>BCP SOLES: 191-2179658-0-45</div>
              <input type="checkbox" />
            </AccountNumber>
            <AccountNumber>
              <div>BCP SOLES: 191-2179658-0-45</div>
              <input type="checkbox" />
            </AccountNumber>
          </ProformAccountWrapper>
          <ProformAccountWrapper className="proforma-bank-account-type">
            <div className="proforma-bank-title">
              MAX IMPORTACIONES Y SERVICIOS GENERALES SAC
            </div>
            <AccountNumber>
              <div>BCP SOLES: 191-2179658-0-45</div>
              <input type="checkbox" />
            </AccountNumber>
            <AccountNumber>
              <div>BCP SOLES: 191-2179658-0-45</div>
              <input type="checkbox" />
            </AccountNumber>
          </ProformAccountWrapper>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "16px",
            // width: "100%",
            flex: "1",
            fontWeight: 600,
          }}
        >
          <div style={{ textAlign: "right" }}>
            Vendedor: {proforma.user.name} {proforma.user.lastname}{" "}
          </div>
          {/* <div>Despachador: </div> */}
        </div>
      </div>
      <div
        className="footNote"
        style={{ color: color, marginTop: "4px", fontWeight: "600" }}
      >
        <div>* NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES</div>
        <div>* CANJEAR PROFORMA POR BOLETA O FACTURA (Max. 07 Dias)</div>
      </div>
    </div>
  );
};

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  gap: 18px;
  margin-top: 12px;
  span {
    font-weight: 500;
    font-size: 16px;
  }
`;

const TipoProformaContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 12px;
`;

const TipoProformaItem = styled.div`
  display: flex;
  width: 60%;
  font-family: console;
  align-items: center;
  line-height: 1;
  margin-bottom:4px;
  /* gap: 12px; */
  font-size: 16px;
  input {
    margin-right: 12px;
  }
  /* input { */
  /*   height: 12px; */
  /*   width: 12px; */
  /* } */
`;

const ProformAccountWrapper = styled.div`
  .proforma-bank-title {
    font-weight: 700;
  }
`;

const AccountNumber = styled.div`
  display: flex;
  justify-content: space-between;
`;
