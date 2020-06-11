import React, {useState} from "react";
import {useRouter} from "next/router";
import {Input, Modal} from "antd";
import {Container} from "../../Container";
import {Grid} from "../../Grid";
import styled from "styled-components";
import {Button} from "../../Button";
import Quagga from "quagga";
import {get} from "lodash";

export const ReadProductCode = props => {
    const [productBoxCode, setProductBoxCode] = useState(null);

    const router = useRouter();

    const scanBarcode = () => {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream"
            },
            decoder: {
                readers: ["code_128_reader"]
            }
        }, error => {
            if (error) {
                console.log(error);
                return
            }
            console.log("Initialization finished. Ready to start");
            Quagga.start();
        });
        Quagga.onProcessed(data => {
            if (get(data, "codeResult", null)) {
                setProductBoxCode(get(data, "codeResult.code", null));
                console.log(get(data, "codeResult.code", null));
                Quagga.stop()
            }
        });
    }

    return (
        <Modal visible={props.visible}
               onOk={async () => router.push(`/products/productBoxes/${productBoxCode}`)}
               onCancel={() => props.trigger && props.trigger(false)}
               width="90%"
               title="Escanear o ingresar código de caja">
            <Grid gridTemplateRows="repeat(2, 1fr)"
                  gridGap="1rem">
                <Grid gridTemplateColumns="1fr 1fr"
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
                    <div id="interactive"
                         style={{height: "100px"}}
                         className="viewport">
                        <video autoPlay="true"
                               style={{height: "100px"}}
                               preload="auto"/>
                    </div>
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
