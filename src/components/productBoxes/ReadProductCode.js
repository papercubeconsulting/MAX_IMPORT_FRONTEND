import React, {useState} from "react";
import {useRouter} from "next/router";
import {Input, Modal} from "antd";
import {Container, Grid} from "../index";
import styled from "styled-components";
import {Button} from "../Button";

export const ReadProductCode = props => {
    const [productBoxCode, setProductBoxCode] = useState(null);

    const router = useRouter();

    const scanBarcode = () => navigator.getUserMedia({video: true}, stream => {
        console.log(stream);

        const video = document.getElementById("camera");

        video.srcObject = stream;
        video.play();
    }, error => alert("there was an error " + error));

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
                    <Input value={productBoxCode}
                           justify="center"
                           onChange={event =>
                               setProductBoxCode(event.target.value)
                           }
                           addonBefore="Código de caja"/>
                    <Button onClick={scanBarcode}>
                        Leer Código de barras
                    </Button>
                    <video id="camera"
                           width="300"
                           height="300"/>
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
