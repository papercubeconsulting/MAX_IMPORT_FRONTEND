import {Input, Modal} from "antd";
import React, {useMemo, useState} from "react";
import {get, uniq} from "lodash";
import styled from "styled-components";
import {Button} from "../../Button";
import {useRouter} from "next/router";
import {postSupplyAttend} from "../../../providers";

export const Attend = props => {
    const [boxesText, setBoxesText] = useState("");
    const [boxes, setBoxes] = useState([]);
    const [loadingAttend, setLoadingAttend] = useState(false);

    const router = useRouter();

    const validInput = useMemo(() => {
        if (!/^(?!([ \d]*-){2})\d+(?: *[-,] *\d+)*$/.test(boxesText)) return false;

        const ranges = boxesText.replace(/ /g, "").split(",");

        const _boxes = uniq(ranges.flatMap(range => {
            if (range.includes("-")) {
                const [begin, end] = range.split("-");

                let result = [];

                for (let i = parseInt(begin); i <= parseInt(end); i++) {
                    result.push(i);
                }

                return result;
            }

            return parseInt(range);
        }));

        setBoxes(_boxes);

        return true;
    }, [boxesText])

    const onSubmit = async () => {
        try {
            setLoadingAttend(true);

            const response = await postSupplyAttend(props.supplyId, props.product.dbId, {boxes});

            const suppliedProduct = get(response, "data.suppliedProducts[0]", {});

            const {familyName, subfamilyName, elementName, modelName} = suppliedProduct.product;

            await router.push({
                pathname: `/supplies/${props.supplyId}/tickets`,
                query: {
                    familyName,
                    subfamilyName,
                    elementName,
                    modelName,
                    boxes,
                    boxSize: suppliedProduct.boxSize,
                    productBoxesCodes: get(suppliedProduct, "productBoxes", [])
                        .map(productBox => productBox.trackingCode)
                }
            });

            props.trigger && props.trigger(false);
        } catch (error) {
            alert(error.message);
            Modal.error({
                title: "Error al intentar mover la caja",
                content: error.message,
            });
            setLoadingAttend(false);
        }
    };

    return <>
        <Modal visible={props.visible}
               onCancel={() => props.trigger && props.trigger(false)}
               footer={null}
               width="90%"
               title="Atender">
            <Input placeholder="Cajas"
                   onChange={event => setBoxesText(event.target.value)}/>
            <BoxContainer>
                {
                    Array.from(Array(get(props, "product.quantity", 0)).keys()).map(value =>
                        <Box selected={!!boxes.find(box => box === value + 1)}>
                            {value + 1}
                        </Box>
                    )
                }
            </BoxContainer>
            <Button disabled={!boxesText || !validInput}
                    loading={loadingAttend}
                    onClick={onSubmit}
                    width="100%">
                Atender
            </Button>
        </Modal>
    </>
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
  background-color: ${props => props.attended ? "#52c41a" : "#7ec1ff"};
  border: 3px solid black;
  font-size: 16px;
  color: ${props => props.selected ? "white" : "black"};
`;
