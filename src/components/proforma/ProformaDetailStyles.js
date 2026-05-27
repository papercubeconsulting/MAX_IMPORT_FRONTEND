import styled from "styled-components";
import { Grid } from "../";

export const DetailPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

export const DetailHeader = styled.div`
  flex: 0 0 auto;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.65rem 0.75rem;
  }
`;

export const DetailHeaderGrid = styled(Grid)`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

export const DetailMobileSummary = styled.div`
  display: none;

  @media (max-width: 768px) {
    align-items: center;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.75rem;

    > div {
      min-width: 0;
    }

    button {
      flex: 0 0 auto;
      padding: 0 0.75rem !important;
    }
  }
`;

export const DetailMobileSummaryTitle = styled.div`
  color: #111827;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2rem;
`;

export const DetailMobileSummaryMeta = styled.div`
  color: #667085;
  font-size: 0.8rem;
  line-height: 1.1rem;
  margin-top: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DetailInfoDrawerGrid = styled.div`
  display: grid;
  gap: 0.55rem;
`;

export const DetailInfoRow = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(6.5rem, 0.42fr) minmax(0, 1fr);

  span {
    color: #667085;
    font-size: 0.82rem;
  }

  strong {
    color: #374151;
    font-size: 0.9rem;
    font-weight: 600;
    overflow-wrap: anywhere;
    text-align: right;
  }
`;

export const DetailInfoDrawerActions = styled.div`
  background: #fff;
  bottom: 0;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  position: sticky;

  button {
    width: 100%;
  }
`;

export const DetailProducts = styled.div`
  flex: 1 1 auto;
  height: auto;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
`;

export const DesktopProductTable = styled.div`
  display: block;
  height: 100%;

  .ant-table-wrapper {
    height: 100%;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileProductList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 0.75rem;
    height: 100%;
    overflow-y: auto;
    padding-right: 0.15rem;
  }
`;

export const ProductCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  padding: 0.85rem;
`;

export const ProductCardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
`;

export const ProductCardTitle = styled.div`
  color: #111827;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.2rem;
  overflow-wrap: anywhere;
`;

export const ProductCardCode = styled.div`
  color: #667085;
  font-size: 0.78rem;
  margin-top: 0.2rem;
`;

export const ProductCardSubtotal = styled.div`
  color: #111827;
  flex: 0 0 auto;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: right;
`;

export const ProductCardMeta = styled.div`
  display: grid;
  gap: 0.35rem;
  margin-top: 0.75rem;
`;

export const ProductMetaRow = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(5.75rem, 0.45fr) minmax(0, 1fr);

  span {
    color: #667085;
    font-size: 0.78rem;
  }

  strong {
    color: #374151;
    font-size: 0.86rem;
    font-weight: 600;
    overflow-wrap: anywhere;
    text-align: right;
  }
`;

export const ProductCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
`;

export const DetailFooter = styled.div`
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.04);
  flex: 0 0 auto;
  padding: 0.75rem 1rem;

  @media (max-width: 768px) {
    box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.06);
    padding: 0.75rem;
  }
`;

export const DetailFooterGrid = styled(Grid)`
  align-items: start;
  grid-gap: 1rem !important;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;

  @media (max-width: 768px) {
    grid-gap: 0.75rem !important;
    grid-template-columns: 1fr !important;
  }
`;

export const DetailPaymentsGrid = styled(Grid)`
  grid-gap: 0.5rem !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;

  > * {
    grid-column: auto;
  }

  .ant-input {
    text-align: right;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr !important;

    br {
      display: none;
    }
  }
`;

export const DetailActionsGrid = styled(Grid)`
  grid-gap: 0.5rem !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;

  > * {
    grid-column: auto;
  }

  button {
    font-size: 0.85rem;
    line-height: 1.05rem;
    margin-bottom: 0 !important;
    min-height: 2.3rem;
    padding: 0 0.5rem !important;
    white-space: normal;
    width: 100%;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;

    br {
      display: none;
    }

    button {
      font-size: 0.78rem;
      line-height: 1rem;
      min-height: 2.15rem;
      padding: 0 0.35rem !important;
    }
  }
`;

export const DetailTotalsGrid = styled(Grid)`
  grid-gap: 0.5rem !important;
  grid-template-columns: minmax(0, 1fr) minmax(5rem, 0.35fr) !important;

  .detail-total-input {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  .detail-discount-input {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }

  .detail-discount-percent-input {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }

  .detail-final-input {
    grid-column: 1 / 2;
    grid-row: 3 / 4;
  }

  .ant-input {
    text-align: right;
  }

  @media (max-width: 768px) {
    grid-template-columns: minmax(4.75rem, 0.48fr) minmax(0, 1fr) !important;

    br {
      display: none;
    }

    .detail-total-input {
      grid-column: 2 / 3 !important;
    }

    .detail-discount-input {
      grid-column: 2 / 3 !important;
    }

    .detail-discount-percent-input {
      grid-column: 1 / 2 !important;
      grid-row: 2 / 3 !important;
    }

    .detail-final-input {
      grid-column: 2 / 3 !important;
    }

    .detail-total-input .ant-input-group-addon,
    .detail-discount-input .ant-input-group-addon,
    .detail-final-input .ant-input-group-addon {
      min-width: 6.4rem;
      text-align: left;
    }
  }
`;

export const MobileBackButton = styled.div`
  display: contents;

  @media (max-width: 768px) {
    display: block;
    margin-top: 0.75rem;

    button {
      margin: 0 !important;
      width: 100% !important;
    }
  }
`;
