import styled, { createGlobalStyle } from "styled-components";
import { Grid } from "../";

export const ProformaWorkspace = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0.75rem;

  @media (max-width: 768px) {
    height: auto;
    min-height: 100%;
    overflow: visible;
    padding-bottom: 0;
  }
`;

export const ProductSearchOption = styled.div`
  display: grid;
  gap: 0.15rem;
  line-height: 1.15rem;
  max-width: 100%;
  padding: 0.2rem 0;
  white-space: normal;

  strong {
    color: #1f2937;
    font-size: 0.9rem;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  span {
    color: #667085;
    font-size: 0.78rem;
    overflow-wrap: anywhere;
  }
`;

export const ProformaResponsiveStyles = createGlobalStyle`
  @media (max-width: 768px) {
    .create-client-modal,
    .advanced-product-modal {
      margin: 0 auto;
      max-width: calc(100vw - 0.5rem);
      top: 0.75rem;
      width: calc(100vw - 0.5rem) !important;
    }

    .create-client-modal .ant-modal,
    .advanced-product-modal .ant-modal {
      max-width: calc(100vw - 0.5rem);
      width: calc(100vw - 0.5rem) !important;
    }

    .create-client-modal .ant-modal-content,
    .advanced-product-modal .ant-modal-content {
      border-radius: 8px;
      overflow: hidden;
    }

    .create-client-modal .ant-modal-header,
    .advanced-product-modal .ant-modal-header {
      padding: 0.85rem 1rem;
    }

    .create-client-modal .ant-modal-title,
    .advanced-product-modal .ant-modal-title {
      font-size: 1rem;
      line-height: 1.25rem;
      padding-right: 1.75rem;
    }

    .create-client-modal .ant-modal-body,
    .advanced-product-modal .ant-modal-body {
      max-height: calc(100vh - 8.5rem);
      overflow: auto;
      padding: 0.9rem;
    }

    .advanced-product-modal .ant-modal-footer {
      display: grid;
      gap: 0.5rem;
      grid-template-columns: 1fr 1fr;
      padding: 0.75rem 0.9rem;
    }

    .advanced-product-modal .ant-modal-footer button {
      margin: 0 !important;
      width: 100%;
    }

    .advanced-product-modal .advanced-field-row {
      align-items: stretch !important;
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 0.35rem;
      min-width: 0;
    }

    .advanced-product-modal .advanced-field-row .ant-input-group-addon {
      border-radius: 4px 4px 0 0;
      width: 100% !important;
    }

    .advanced-product-modal .advanced-field-row .ant-select {
      width: 100% !important;
    }

    .advanced-product-modal .advanced-product-grid {
      grid-template-columns: 1fr !important;
      grid-gap: 0.95rem !important;
    }

    .advanced-product-modal .advanced-product-grid > div {
      grid-column: auto !important;
      min-width: 0;
    }

    .advanced-product-modal .advanced-select-field > div {
      align-items: stretch !important;
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 0.35rem;
      width: 100%;
    }

    .advanced-product-modal .advanced-inventory-row {
      grid-template-columns: 1fr !important;
      grid-gap: 0.65rem !important;
    }

    .advanced-product-modal .advanced-inventory-row > div {
      min-width: 0;
    }

    .advanced-product-modal .advanced-inventory-row > button {
      align-self: end;
      justify-self: end;
      min-width: 6rem;
    }

    .advanced-product-modal .advanced-inventory-row > span {
      align-self: center;
    }

    .advanced-product-modal .ant-input-group-addon {
      font-size: 0.88rem !important;
      height: auto !important;
      line-height: 1.1rem !important;
      padding: 0.35rem 0.55rem;
      text-align: left;
      width: 100% !important;
    }

    .advanced-product-modal .advanced-select-field .ant-input-group-addon {
      border-radius: 4px 4px 0 0;
    }

    .advanced-product-modal .ant-select,
    .advanced-product-modal .ant-select-selector,
    .advanced-product-modal .ant-select-selection-search,
    .advanced-product-modal .ant-select-selection-item,
    .advanced-product-modal .ant-select-selection-placeholder {
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .create-client-grid {
      grid-template-columns: 1fr !important;
      grid-gap: 0.85rem !important;
    }

    .create-client-grid > * {
      min-width: 0;
    }

    .create-client-grid > div:nth-child(2) {
      grid-row: 2;
    }

    .create-client-grid > div:nth-child(2) button,
    .create-client-grid > button:last-child {
      width: 100%;
    }

    .create-client-grid .ant-input,
    .create-client-grid .ant-select {
      min-width: 0;
      width: 100% !important;
    }

    .create-client-grid .ant-input-group-addon {
      border-radius: 4px 4px 0 0;
      font-size: 0.88rem !important;
      height: auto !important;
      line-height: 1.1rem !important;
      padding: 0.35rem 0.55rem;
      text-align: left;
      width: 100% !important;
    }

    .create-client-grid .ant-input-wrapper.ant-input-group {
      display: grid !important;
      grid-template-columns: 1fr !important;
      width: 100%;
    }

    .create-client-grid > div:has(> .ant-input-group-addon) {
      align-items: stretch !important;
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 0.35rem;
    }

    .change-product-modal {
      max-width: calc(100vw - 1rem);
      top: 0.75rem;
    }

    .change-product-modal .ant-modal-content {
      border-radius: 8px;
      overflow: hidden;
    }

    .change-product-modal .ant-modal-body {
      max-height: calc(100vh - 9.5rem);
      overflow: auto;
      padding: 0.9rem;
    }

    .change-product-modal .ant-modal-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      padding: 0.75rem 0.9rem;
    }

    .change-product-modal .ant-modal-footer button {
      margin: 0 !important;
      min-width: 5.5rem;
    }

    .change-product-grid-head {
      display: none !important;
    }

    .change-product-grid-row {
      align-items: start !important;
      grid-gap: 0.25rem 0.65rem !important;
      grid-template-columns: 30px minmax(0, 1fr) minmax(4.5rem, auto) !important;
      min-height: 0 !important;
      padding: 0.75rem !important;
    }

    .change-product-grid-row > div:nth-child(1) {
      grid-column: 1;
      grid-row: 1 / 4;
      padding-top: 0.1rem;
    }

    .change-product-grid-row > div:nth-child(2) {
      color: #667085;
      font-size: 0.78rem;
      grid-column: 2;
      grid-row: 2;
      text-align: left !important;
    }

    .change-product-grid-row > div:nth-child(3) {
      color: #1f2937;
      font-weight: 700;
      grid-column: 2;
      grid-row: 1;
      text-align: left !important;
    }

    .change-product-grid-row > div:nth-child(4) {
      color: #374151;
      font-size: 0.84rem;
      grid-column: 2 / 4;
      grid-row: 3;
      line-height: 1.2rem;
      overflow-wrap: anywhere;
    }

    .change-product-grid-row > div:nth-child(5) {
      grid-column: 3;
      grid-row: 1;
      text-align: right !important;
    }

    .change-product-grid-row > div:nth-child(5)::before {
      content: "Stock ";
      color: #667085;
      font-weight: 400;
    }

    .change-product-grid-row > div:nth-child(6) {
      font-size: 0.75rem;
      grid-column: 3;
      grid-row: 2;
      line-height: 1rem;
      text-align: right !important;
    }
  }
`;

export const TopFormGrid = styled.div`
  align-items: start;
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: 1fr 1fr;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;

    > div {
      min-width: 0;
    }

    > div:nth-child(2) {
      grid-gap: 0.5rem !important;
      grid-template-columns: minmax(0, 1fr) 2.4rem !important;

      &.client-search-row-full {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      > div {
        min-width: 0;
      }

      .ant-select {
        flex: 1 1 auto;
        min-width: 0;
      }

      .new-client-button {
        font-size: 0;
        justify-self: stretch;
        min-width: 2.4rem;
        padding: 0 !important;
        width: 2.4rem !important;
      }

      .new-client-button::after {
        content: "+";
        font-size: 1.15rem;
        font-weight: 700;
        line-height: 1;
      }
    }
  }
`;

export const ProductSearchRow = styled.div``;

export const AdvancedProductLink = styled.a`
  cursor: pointer;
  display: inline-flex;
  font-size: 0.9rem;
  line-height: 1rem;
  margin-top: 0.35rem;
  text-decoration: underline;

  @media (max-width: 768px) {
    align-items: center;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    color: #1f2937;
    display: flex;
    font-size: 0.84rem;
    font-weight: 600;
    justify-content: center;
    min-height: 2rem;
    padding: 0 0.75rem;
    text-decoration: none;
    white-space: nowrap;
    width: fit-content;
  }
`;

export const ProductSearchBlock = styled.div`
  grid-column: 1 / 3;

  @media (max-width: 768px) {
    grid-column: 1;

    ${ProductSearchRow} {
      grid-gap: 0.5rem !important;
      grid-template-columns: minmax(0, 1fr) 2.4rem !important;
      min-width: 0;
    }

    ${ProductSearchRow} > div {
      min-width: 0;
    }

    ${ProductSearchRow} .ant-input-group-addon {
      flex: 0 0 auto;
    }

    .ant-select {
      flex: 1 1 auto;
      min-width: 0;
      width: 100% !important;
    }

    .ant-select-selector,
    .ant-select-selection-search,
    .ant-select-selection-item,
    .ant-select-selection-placeholder {
      min-width: 0 !important;
      max-width: 100% !important;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .add-product-button {
      font-size: 0;
      justify-self: stretch;
      min-width: 2.4rem;
      padding: 0 !important;
      width: 2.4rem !important;
    }

    .add-product-button::after {
      content: "+";
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1;
    }
  }
`;

export const ProductsSection = styled.div`
  flex: 1 1 auto;
  min-height: 220px;
  overflow: hidden;
  padding: 0 1rem;
  position: relative;

  @media (max-width: 768px) {
    min-height: 0;
    overflow: visible;
  }
`;

export const DesktopProductsTable = styled.div`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const DesktopTableFade = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.92)
  );
  bottom: 0;
  height: 2.25rem;
  left: 1rem;
  pointer-events: none;
  position: absolute;
  right: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileProductsList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 0.75rem;
  }
`;

export const MobileProductCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  padding: 0.85rem;
`;

export const MobileProductHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
`;

export const MobileProductCode = styled.div`
  color: #667085;
  font-size: 0.82rem;
  margin-top: 0.18rem;
  overflow-wrap: anywhere;
`;

export const MobileProductModel = styled.div`
  color: #1f2937;
  font-size: 0.96rem;
  font-weight: 700;
  overflow-wrap: anywhere;
`;

export const MobileSubtotal = styled.div`
  color: #111827;
  flex: 0 0 auto;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: right;
`;

export const MobileTradeName = styled.div`
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.25rem;
  margin-top: 0.55rem;
  overflow-wrap: anywhere;
`;

export const MobileProductMeta = styled.div`
  color: #667085;
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  margin-top: 0.45rem;

  strong {
    color: #344054;
    text-align: right;
  }
`;

export const MobileInputsGrid = styled.div`
  display: grid;
  gap: 0.65rem;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  margin-top: 0.75rem;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }

  .ant-input {
    text-align: right;
  }
`;

export const MobileActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.75rem;
`;

export const FooterSummary = styled.div`
  background: #fff;
  border-top: 1px solid #e8e8e8;
  bottom: 0;
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.08);
  flex: 0 0 auto;
  padding: 1.25rem 1rem 1rem;
  position: sticky;
  z-index: 10;

  @media (max-width: 768px) {
    box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.06);
    margin-top: 1rem;
    padding: 0.75rem;
  }
`;

export const FooterSummaryGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 1rem !important;
    grid-template-columns: 1fr !important;

    .footer-payment-actions {
      grid-gap: 0.65rem !important;
    }
  }
`;

export const PaymentGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 0.5rem !important;
    grid-template-columns: 1fr 1fr !important;
  }
`;

export const ActionsGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 0.5rem !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;

    button {
      font-size: 0.76rem;
      line-height: 1rem;
      min-height: 2.15rem;
      padding: 0 0.35rem;
      white-space: normal;
      width: 100%;
    }
  }
`;

export const TotalsGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 0.5rem !important;
    grid-template-columns: minmax(4.75rem, 0.48fr) minmax(0, 1fr) !important;

    .total-money-input {
      grid-column: 2 / 3 !important;
      grid-row: 1 / 2 !important;
    }

    .discount-percent-input {
      grid-column: 1 / 2 !important;
      grid-row: 2 / 3 !important;
    }

    .discount-money-input {
      grid-column: 2 / 3 !important;
      grid-row: 2 / 3 !important;
    }

    .final-money-input {
      grid-column: 2 / 3 !important;
      grid-row: 3 / 4 !important;
    }

    .ant-input {
      text-align: right;
    }

    .total-money-input .ant-input-group-addon,
    .discount-money-input .ant-input-group-addon,
    .final-money-input .ant-input-group-addon {
      min-width: 7.25rem;
      text-align: left;
    }

    .discount-percent-input .ant-input-group-addon {
      min-width: 2.4rem;
      text-align: center;
    }
  }
`;
