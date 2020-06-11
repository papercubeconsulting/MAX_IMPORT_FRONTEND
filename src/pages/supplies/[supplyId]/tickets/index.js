import React from "react";
import {componentToPDFBuffer} from "../../../../util";
import styled from "styled-components";
import codes from "rescode";
import {get} from "lodash";

const Tickets = () => null;

Tickets.getInitialProps = async ({req, res, query}) => {
    try {
        codes.loadModules(["code128", "gs1-128"], {
            includetext: true,
            scaleX: 4,
            scaleY: 3,
            textyoffset: 10,
        });

        const isServer = !!req;

        const {familyName, subfamilyName, elementName, modelName, boxSize} = query;

        if (isServer) {

            const buffer = await componentToPDFBuffer(
                <div>
                    {
                        get(query, "boxes", []).map(box => {
                            const productBoxCode = get(query, `productBoxesCodes[${box - 1}]`, null);

                            const data8 = codes.create("code128", productBoxCode);

                            return (
                                <>
                                    <div style={{
                                        paddingTop: "60px",
                                        borderTop: "2px dashed black"
                                    }}>
                                        <img src={"data:image/png;base64," + data8.toString("base64")}
                                             style={{marginBottom: "1rem"}}
                                             alt={productBoxCode}/>
                                        <div style={{textAlign: "center"}}>
                                            <strong style={{fontSize: "25px", fontWeight: "bold"}}>Familia: </strong>
                                            <span style={{fontSize: "25px"}}>{familyName}</span>
                                        </div>
                                        <div style={{textAlign: "center"}}>
                                            <strong style={{
                                                fontSize: "25px",
                                                fontWeight: "bold"
                                            }}>Sub-Familia: </strong>
                                            <span style={{fontSize: "25px"}}>{subfamilyName}</span>
                                        </div>
                                        <div style={{textAlign: "center"}}>
                                            <strong style={{fontSize: "25px", fontWeight: "bold"}}>Elemento: </strong>
                                            <span style={{fontSize: "25px"}}>{elementName}</span>
                                        </div>
                                        <div style={{textAlign: "center"}}>
                                            <strong style={{fontSize: "25px", fontWeight: "bold"}}>Modelo: </strong>
                                            <span style={{fontSize: "25px"}}>{modelName}</span>
                                        </div>
                                        <div style={{textAlign: "center"}}>
                                            <strong style={{fontSize: "25px", fontWeight: "bold"}}>Unid/Caja: </strong>
                                            <span style={{fontSize: "25px"}}>{boxSize}</span>
                                        </div>
                                        <div style={{textAlign: "center"}}>
                                            <strong style={{fontSize: "25px", fontWeight: "bold"}}>#Caja: </strong>
                                            <span style={{fontSize: "25px"}}>{box}</span>
                                        </div>
                                    </div>
                                </>
                            )
                        })
                    }
                </div>
            );

            res.setHeader("Content-disposition", 'attachment; filename="article.pdf"');

            res.setHeader("Content-Type", "application/pdf");

            res.end(buffer);
        }

        return {};
    } catch (error) {
        console.log("error", error);
    }
}

const BarcodeContainer = styled.div`
  border: 2px dashed black;
  text-align: center;
  padding: 60px 0;
  
  p {
    font-size: 25px;
  }
`;

export default Tickets;
