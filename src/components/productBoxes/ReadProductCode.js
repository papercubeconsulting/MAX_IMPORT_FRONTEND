import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Input, Modal, notification, Tag, Upload} from "antd";
import {AutoComplete, Button, Container, Grid, Icon, Select} from "../index";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import {getElements, getFamilies, getModels, getSubfamilies, getProviders, postProduct} from "../../providers";
import {toBase64} from "../../util";
import styled from "styled-components";

export const ReadProductCode = props => {

    // * Fields to create source
    const [productBoxCode, setProductBoxCode] = useState(null);

    
    const router = useRouter();

    return (
        <Modal visible={props.visible}
               onOk={async () => router.push(`/products/productBoxes/${productBoxCode}`)}
               onCancel={() => props.trigger && props.trigger(false)}
               width="90%"
               title="Escanear o ingresar código de caja">
            <Grid gridTemplateRows="repeat(2, 1fr)"
                  gridGap="1rem">
                <Grid gridTemplateColumns="repeat(4, 1fr)"
                      gridGap="1rem">
                    <Input  value={productBoxCode}
                            justify="center"
                            onChange={event => 
                                setProductBoxCode(event.target.value)                                
                            }
                            addonBefore="Código de caja"/>
                </Grid>
                
            </Grid>
        </Modal>
    )
};

const LegendsContainer = styled(Container)`
  .ant-tag {
    font-size: 1rem;
    margin: 0;
    padding: 0.5rem;
    text-align: center;
    min-width: 15%;
  }
`;

const ModalConfirmContainer = styled(LegendsContainer)`
  h3 {
    color: #404040;
    
    b {
      color: black;
    }
  }
`;
