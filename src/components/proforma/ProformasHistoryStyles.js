import styled from "styled-components";
import { Grid } from "../";

export const HistoryPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;

  @media (max-width: 768px) {
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
`;

export const HistoryFilters = styled.div`
  padding: 1rem;

  @media (max-width: 768px) {
    flex: 0 0 auto;
    padding: 0.6rem 0.75rem;
  }
`;

export const HistoryFiltersGrid = styled(Grid)`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

export const MobileQuickFilters = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 0.5rem;
  }
`;

export const MobileQuickSearch = styled.div`
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr;

  > * {
    min-width: 0;
  }

  button {
    width: 100%;
  }
`;

export const MobileFilterSummary = styled.div`
  color: #667085;
  display: flex;
  gap: 0.35rem;
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 0.1rem;

  span {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    flex: 0 0 auto;
    font-size: 0.74rem;
    line-height: 1rem;
    padding: 0.12rem 0.45rem;
    white-space: nowrap;
  }
`;

export const MobileFilterDrawerGrid = styled.div`
  display: grid;
  gap: 0.65rem;

  .ant-input-wrapper.ant-input-group,
  div:has(> .ant-input-group-addon + .ant-select),
  div:has(> .ant-input-group-addon + .ant-picker) {
    align-items: center !important;
    display: flex !important;
    flex-direction: row !important;
    width: 100%;
  }

  .ant-input-group-addon {
    border-radius: 4px 0 0 4px;
    flex: 0 0 6.75rem;
    font-size: 0.88rem !important;
    height: 2rem !important;
    line-height: 2rem !important;
    overflow: hidden;
    padding: 0 0.5rem;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 6.75rem !important;
  }

  .ant-input,
  .ant-select,
  .ant-select-selector,
  .ant-select-selection-item,
  .ant-select-selection-placeholder,
  .ant-picker {
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
  }

  .ant-picker {
    flex: 1 1 auto;
  }
`;

export const MobileFilterDrawerActions = styled.div`
  background: #fff;
  bottom: 0;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr;
  margin: 0.85rem -0.5rem 0;
  padding: 0.75rem 0.5rem 0;
  position: sticky;

  button {
    width: 100%;
  }
`;

export const HistoryContent = styled.div`
  padding: 0 1rem 1rem;

  @media (max-width: 768px) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    padding: 0 0.75rem 0.35rem;
  }
`;

export const DesktopHistoryTable = styled.div`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileHistoryList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    flex: 1 1 auto;
    gap: 0.75rem;
    min-height: 0;
    overflow-y: auto;
    padding-right: 0.15rem;
  }
`;

export const ProformaCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  padding: 0.85rem;
`;

export const ProformaCardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
`;

export const ProformaCardTitle = styled.div`
  color: #111827;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2rem;
`;

export const ProformaCardDate = styled.div`
  color: #667085;
  font-size: 0.78rem;
  margin-top: 0.2rem;
`;

export const ProformaCardTotal = styled.div`
  color: #111827;
  flex: 0 0 auto;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: right;
`;

export const ProformaCardMeta = styled.div`
  display: grid;
  gap: 0.35rem;
  margin-top: 0.75rem;
`;

export const ProformaMetaRow = styled.div`
  align-items: start;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(6rem, 0.45fr) minmax(0, 1fr);

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

export const ProformaCardActions = styled.div`
  align-items: center;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  margin-top: 0.8rem;
`;

export const MobilePagination = styled.div`
  display: none;

  @media (max-width: 768px) {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    padding: 0.45rem 0 0.35rem;

    .ant-pagination {
      text-align: center;
    }
  }
`;

export const HistoryFooter = styled.div`
  padding: 0 1rem 1rem;

  @media (max-width: 768px) {
    flex: 0 0 auto;
    padding: 0 0.75rem 0.75rem;

    button {
      width: 100%;
    }
  }
`;

export const HistoryFooterGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;

    > * {
      grid-column: auto !important;
    }
  }
`;
