import { Input, Modal } from "antd";
import React, { useMemo, useState } from "react";
import { get, uniq } from "lodash";
import styled from "styled-components";
import { Button } from "../../Button";
import { useRouter } from "next/router";
import { postSupplyAttend } from "../../../providers";
import Barcode from "react-barcode";
import Link from "next/link";

export const Attend = (props) => {
  const [boxesText, setBoxesText] = useState("");
  const [boxes, setBoxes] = useState([]);
  const [loadingAttend, setLoadingAttend] = useState(false);
  const [code, setCode] = useState(null);
  const inputRefCaja = React.useRef(null) 
  const router = useRouter();

  const validInput = useMemo(() => {
    if (!/^(?!([ \d]*-){2})\d+(?: *[-,] *\d+)*$/.test(boxesText)) return false;

    const ranges = boxesText.replace(/ /g, "").split(",");
    const _boxes = uniq(
      ranges.flatMap((range) => {
        if (range.includes("-")) {
          const [begin, end] = range.split("-");

          let result = [];

          for (let i = parseInt(begin); i <= parseInt(end); i++) {
            result.push(i);
          }

          return result;
        }

        return parseInt(range);
      })
    );

    setBoxes(_boxes);

    return true;
  }, [boxesText]);

  const [pruebaUrl, setPruebaUrl] = useState("");
  console.log('')
  const onSubmit = async () => {
    try {
      /* setLoadingAttend(true); */
      const response = await postSupplyAttend(
        props.supplyId,
        props.product.dbId,
        { boxes }
      );
      const suppliedProduct = get(response, "suppliedProducts", []).find(
        (obj) => obj.id === props.product.dbId
      );
      const providerName = response.provider.name;
      // console.log("providerName", providerName);
      const {
        familyName,
        subfamilyName,
        elementName,
        modelName,
        tradename,
      } = suppliedProduct.product;

      const query = {
        familyName,
        subfamilyName,
        elementName,
        modelName,
        tradename,
        providerName,
        /* boxes, */
        boxSize: suppliedProduct.boxSize,
        /* productBoxesCodes: boxes.map(box=> get(suppliedProduct, "productBoxes", [])
                    .find( obj=>obj.indexFromSupliedProduct===box ) )
                    .map(productBox => productBox.trackingCode) */
      };

      const pruebabox1 = boxes.map((elem) => `boxes=${elem}`);

      const pruebabox2 = pruebabox1.join("&");

      const productBoxesCodes = boxes
        .map((box) =>
          get(suppliedProduct, "productBoxes", []).find(
            (obj) => obj.indexFromSupliedProduct === box
          )
        )
        .map((productBox) => productBox.trackingCode);

      const prueba1 = productBoxesCodes.map(
        (elem) => `productBoxesCodes=${elem}`
      );

      const prueba2 = prueba1.join("&");

      /* console.log(prueba2);

            console.log(query) */

      const queries = Object.keys(query)
        .map(
          (key) =>
            encodeURIComponent(key) + "=" + encodeURIComponent(query[key])
        )
        .join("&");

      setPruebaUrl(
        `/supplies/${props.supplyId}/tickets?${queries}&${pruebabox2}&${prueba2}`
      );

      setBoxesText("")
      setBoxes([])
      setCode(null)
      inputRefCaja.current.focus()
      props.setUpdate()

      /* console.log(
        `/supplies/${props.supplyId}/tickets?${queries}&${pruebabox2}&${prueba2}`
      ); */

      /* await router.push({
                pathname: `/supplies/${props.supplyId}/tickets`,
                query: {
                    familyName,
                    subfamilyName,
                    elementName,
                    modelName,
                    boxes,
                    boxSize: suppliedProduct.boxSize,
                    productBoxesCodes: boxes.map(box=> get(suppliedProduct, "productBoxes", [])
                        .find( obj=>obj.indexFromSupliedProduct===box ) )
                        .map(productBox => productBox.trackingCode)
                }
            });
            props.trigger && props.trigger(false); */
    } catch (error) {
      alert(error.message);
      Modal.error({
        title: "Error al atender cajas",
        content: error.message,
      });
      setLoadingAttend(false);
    }
  };

  return (
    <>
      <Modal
        visible={props.visible}
        onCancel={() => props.trigger && props.trigger(false)}
        footer={null}
        width="90%"
        title="Atender"
      >
        <Input
          placeholder="Cajas"
          ref={inputRefCaja}
          onChange={(event) => setBoxesText(event.target.value)}
          value={boxesText}
        />
        <BoxContainer>
          {Array.from(Array(get(props, "product.quantity", 0)).keys()).map(
            (value, i) => {
              const product = get(props, "product.productBoxes", []).find(
                (productBox) => productBox.indexFromSupliedProduct === value + 1
              );
              return (
                <Box
                  key={product && product.trackingCode || i}
                  attended={!!product}
                  /* onClick={() => product && setCode(product.trackingCode)} */
                  onClick={() => {
                    product &&
                      (() => {
                        setCode(product.trackingCode);
                        setBoxesText(String(product.indexFromSupliedProduct));
                      })();
                  }}
                  selected={!!boxes.find((box) => box === value + 1)}
                >
                  {value + 1}
                </Box>
              );
            }
          )}
        </BoxContainer>
        {!!code && (
          <BarcodeContainer>
            <Barcode value={code} width={2} />
          </BarcodeContainer>
        )}
        <Button
          /* disabled={!boxesText || !validInput} */
          disabled={!boxesText}
          loading={loadingAttend}
          onClick={onSubmit}
          width="100%"
        >
          Generar Tickets
        </Button>
        <Button
          disabled={!pruebaUrl}
          onClick={() => props.trigger && props.trigger(false)}
        >
          <Link href={pruebaUrl}>
            <a target="_blank">Descargar Tickets</a>
          </Link>
        </Button>
      </Modal>
    </>
  );
};

const BoxContainer = styled.div`
  margin: 1rem 0;
  display: grid;
  grid-column-gap: 2rem;
  grid-row-gap: 1rem;
  grid-template-columns: repeat(8, 1fr);
`;

const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  width: 100%;
  border-radius: 1rem;
  background-color: ${(props) => (props.attended ? "#52c41a" : "#7ec1ff")};
  border: 3px solid black;
  font-size: 16px;
  cursor: ${(props) => (props.attended ? "pointer" : "initial")};
  color: ${(props) => (props.selected ? "white" : "black")};
`;

const BarcodeContainer = styled.div`
  padding: 1rem 0;
  width: 100%;
  display: flex;
  justify-content: center;
`;
