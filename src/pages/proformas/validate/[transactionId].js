import { useRouter } from "next/router";
import styled from "styled-components";
import {
  CheckOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Card,
  Badge,
  Col,
  Row,
  Statistic,
  notification,
  Form,
  Space,
  Input,
  Button,
  InputNumber,
  Tooltip,
} from "antd";

import QRCode from "react-qr-code";
import { useValidationProforma } from "../../../util/hooks/useValidationProforma";
import { useNavigatorShare } from "../../../util/hooks/useNavigationShare";
import proforma from "../../proforma";

export default () => {
  const router = useRouter();
  const { transactionId } = router.query;
  const [api, contextHolder] = notification.useNotification();
  const currentUrl = typeof window !== "undefined" && window.location.href;
  const { onShare, messageStatus, setMessageStatus } =
    useNavigatorShare(currentUrl);

  const {
    isLoading,
    isLoadingSubmitValidation,
    discountPercentageInput,
    error,
    handleSubmitApproval,
    errorSubmitValidation,
    resetDiscount,
    validationInfoStatus,
    handleChangeDiscountInput,
    cleanError,
    successSubmitValidation,
  } = useValidationProforma(transactionId);

  React.useEffect(() => {
    if (errorSubmitValidation?.message) {
      api.open({
        type: "error",
        message: "Error al aprobar el descuento",
        description: errorSubmitValidation.message,
        durration: 2,
        onClose: () => cleanError(),
      });

      // cleanError();
    }
    if (successSubmitValidation) {
      api.open({
        type: "success",
        message: "Proforma actualizada",
        description: successSubmitValidation.message,
        durration: 2,
        onClose: () => cleanError(),
      });
    }
  }, [errorSubmitValidation?.message, successSubmitValidation]);

  return (
    <Wrapper>
      {contextHolder}
      {validationInfoStatus ? (
        <InnerWrapper>
          <Title>Confirmacion de descuento de Proforma</Title>
          <Tooltip
            open={!!messageStatus}
            onOpenChange={(open) => !open && setMessageStatus(null)}
            title={"Copiado"}
          >
            <Button
              onClick={onShare()}
              // color="white"
              size="large"
              type="primary"
            >
              Comparte el link !
            </Button>
          </Tooltip>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Input
              placeholder={validationInfoStatus.proforma.user.name}
              addonBefore={"Vendedor"}
              disabled
            />
            <Input
              placeholder={validationInfoStatus.proforma.user.id}
              addonBefore={"User ID"}
              disabled
            />
          </div>

          <ProformaSection>
            <Row style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <Col flex="auto">
                <Card
                  bordered={true}
                  bodyStyle={{ backgroundColor: "#fcfcfc" }}
                >
                  <Statistic
                    title="Subtotal"
                    value={validationInfoStatus.proforma.subtotal / 100}
                    precision={2}
                    valueStyle={{ color: "#1890ff" }}
                    // prefix={<ArrowUpOutlined />}
                    prefix="S/."
                  />
                </Card>
              </Col>
              <Col flex="auto">
                <Card
                  bodyStyle={{ backgroundColor: "#fcfcfc" }}
                  bordered={true}
                >
                  <Statistic
                    title="Descuento %"
                    value={validationInfoStatus.proforma.discountPercentage}
                    precision={2}
                    valueStyle={{ color: "yellowgreen" }}
                    // prefix={<ArrowDownOutlined />}
                    // prefix="S/."
                    suffix="%"
                  />
                </Card>
              </Col>
              <Col flex="auto">
                <Card
                  bodyStyle={{ backgroundColor: "#fcfcfc" }}
                  bordered={true}
                >
                  <Statistic
                    title="Descuento S/."
                    value={validationInfoStatus.proforma.discount / 100}
                    precision={2}
                    valueStyle={{ color: "yellowgreen" }}
                    // prefix={<ArrowDownOutlined />}
                    prefix="S/."
                    // suffix="%"
                  />
                </Card>
              </Col>
              <Col flex="auto">
                <Card
                  bodyStyle={{ backgroundColor: "#fcfcfc" }}
                  bordered={true}
                >
                  <Statistic
                    title="Total"
                    value={validationInfoStatus.proforma.total / 100}
                    precision={2}
                    // valueStyle={{ color: "yellowgreen" }}
                    valueStyle={{ color: "#1890ff" }}
                    // prefix={<ArrowDownOutlined />}
                    prefix="S/."
                    // suffix="%"
                  />
                </Card>
              </Col>
            </Row>
            {/* <div>
              <span>Monto Proforma:</span>
              {validationInfoStatus.proforma.total}
            </div>
            <div>
              <span>Descuento: </span>
              {validationInfoStatus.proforma.discount}
            </div>
            <div>
              <span>Descuento: </span>
              {validationInfoStatus.proforma.discount}
            </div> */}
          </ProformaSection>
          <EditProformaSection>
            {/* <Space.Compact> */}
            <InputNumber
              type="number"
              // step="0.1"
              max={100}
              disabled={isLoadingSubmitValidation}
              addonBefore="Descuento %"
              // value={discountPercentageInput.toFixed(2)}
              value={discountPercentageInput.toString()}
              onChange={(e) => handleChangeDiscountInput(e)}
              // defaultValue={discountPercentageInput}
            />
            {/* </Space.Compact> */}
          </EditProformaSection>
          <ApprovalSection>
            <Button
              type="primary"
              onClick={() =>
                handleSubmitApproval({
                  discountPercentage: Number(discountPercentageInput) / 100,
                })
              }
              loading={isLoadingSubmitValidation}
              size="large"
              icon={<CheckOutlined />}
            >
              Aprobar
            </Button>
            {/* What should we don't with this option */}
            {/* <Button size="large" danger> */}
            {/*   Rechazar */}
            {/* </Button> */}
            <Button type="dashed" size="large" onClick={() => resetDiscount()}>
              Reiniciar
            </Button>
          </ApprovalSection>
        </InnerWrapper>
      ) : (
        "loading"
      )}
    </Wrapper>
  );
};

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  /* background-color: #f0ecf4; */
  width: 100%;
  height: 100%;
`;

export const InnerWrapper = styled.div`
  max-width: 80%;
  width: 70%;
  padding: 2rem;
  /* background-color: #f0f2f5; */
  gap: 2rem;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.div`
  font-size: 1.8rem;
  font-weigth: 900;
  /* align-self: center; */
  /* color: #1890ff; */
  /* text-transform: uppercase; */
  /* background-color: white; */
  padding: 0.5rem 1rem;
  text-align: center;
  background-color: #fcfcfc;
  color: #5d278b;
  /* font-family: railway; */
`;

export const EditProformaSection = styled.div`
  display: grid;
  grid-template-columns: 80% 20%;
  gap: 1rem;
`;

export const QR = styled.div`
  /* width: 15%; */
  display: flex;
  justify-content: center;
`;

export const ProformaSection = styled.div`
  max-width: 100%;
  /* display: grid; */
  /* flex-wrap: wrap; */
  /* gap: 1rem; */
`;

export const ApprovalSection = styled.div`
  align-self: center;
  display: flex;
  gap: 1rem;
`;
