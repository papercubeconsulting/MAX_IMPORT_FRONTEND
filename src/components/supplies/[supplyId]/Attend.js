import {Modal} from "antd";
import React from "react";
import {get} from "lodash";
import styled from "styled-components";

export const Attend = props => {

    return (
        <Modal visible={props.visible}
               width="90%"
               title="Atender">
            {
                Array.from(Array(get(props, "product.quantity", 0)).keys()).map(value =>
                )
            }
        </Modal>
    )
};

const Box = styled.div`
    
`;