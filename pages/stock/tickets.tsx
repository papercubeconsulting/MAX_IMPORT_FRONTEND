import { NextPage } from "next";
import componentToPDFBuffer from "../../util/componentToPDFBuffer";
import React from "react";
// @ts-ignore
import codes from "rescode";
import StockProvider, {
  ProductSupply,
  Product,
  SuppliedProduct
} from "../../providers/StockProvider";
codes.loadModules(["code128", "gs1-128"], {
  includetext: true,
  scaleX: 4,
  scaleY: 3,
  textyoffset: 10
});
const Page: NextPage<{}> = ({}) => <main>Your user agent</main>;
function Ticket({
  productDetail,
  boxSize,
  box,
  isFirst,
  isEven,
  isLast
}: {
  productDetail: Product;
  boxSize: number;
  box: SuppliedProduct;
  isFirst: Boolean;
  isEven: Boolean;
  isLast: Boolean;
}) {
  var data8 = codes.create("code128", box.trackingCode);
  return (
    <div style={{ marginTop: isFirst || !isEven ? 0 : 200 }}>
      <div style={{ borderBottom: "2px dashed", width: "100%" }}></div>
      <div style={{ textAlign: "center", paddingBottom: 60, paddingTop: 60 }}>
        <img src={"data:image/png;base64," + data8.toString("base64")} />
        <div style={{ padding: 10 }}>
          <div>
            <span style={{ fontSize: 25 }}>
              <span style={{ fontWeight: "bold" }}>Familia</span>:{" "}
              {productDetail.familyName}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 25 }}>
              <span style={{ fontWeight: "bold" }}>Sub-Familia</span>:{" "}
              {productDetail.subfamilyName}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 25 }}>
              <span style={{ fontWeight: "bold" }}>Elemento</span>:{" "}
              {productDetail.elementName}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 25 }}>
              <span style={{ fontWeight: "bold" }}>Modelo</span>:{" "}
              {productDetail.modelId}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 25 }}>
              <span style={{ fontWeight: "bold" }}>Unid/Caja</span>: {boxSize}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 25 }}>
              <span style={{ fontWeight: "bold" }}>#Caja</span>:{" "}
              {box.indexFromSupliedProduct}
            </span>
          </div>
        </div>
      </div>
      {(!isEven || isLast) && (
        <div
          style={{
            borderBottom: "2px dashed",
            width: "100%"
          }}
        ></div>
      )}
    </div>
  );
}
Page.getInitialProps = async ({ res, query }) => {
  let id = parseInt(query["id"] as string);
  let suppliedProductId = parseInt(query["suppliedProductId"] as string);
  let indexQuery = query["box"] || [];
  if (!(indexQuery instanceof Array)) indexQuery = [indexQuery];
  let indexes = indexQuery.map(x => parseInt(x)).sort();
  let indexMap: { [key: string]: boolean } = {};
  for (let i = 0; i < indexes.length; ++i) {
    indexMap[indexes[i]] = true;
  }
  let response = await StockProvider.getStockById(id);
  let suppliedProduct: ProductSupply | null = null;
  for (let i = 0; i < response.suppliedProducts.length; ++i) {
    suppliedProduct = response.suppliedProducts[i];
    if (response.suppliedProducts[i].id == suppliedProductId) break;
  }
  if (suppliedProduct == null) return;
  let productDetail = suppliedProduct.product;
  let boxSize = suppliedProduct.boxSize;
  let filteredBoxes = [];
  for (let i = 0; i < suppliedProduct.productBoxes.length; ++i) {
    if (indexMap[suppliedProduct.productBoxes[i].indexFromSupliedProduct])
      filteredBoxes.push(suppliedProduct.productBoxes[i]);
  }
  const buffer = await componentToPDFBuffer.componentToPDFBuffer(
    <div>
      {filteredBoxes.map((box, index) => (
        <Ticket
          key={box.trackingCode}
          productDetail={productDetail}
          boxSize={boxSize}
          box={box}
          isFirst={index == 0}
          isEven={index % 2 == 0}
          isLast={index == filteredBoxes.length - 1}
        />
      ))}
    </div>
  );
  if (res == null) return;
  res.setHeader(
    "Content-disposition",
    `attachment; filename="tickets-ABAST${id}-PRODUC${suppliedProductId}.pdf"`
  );
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
};

export default Page;
