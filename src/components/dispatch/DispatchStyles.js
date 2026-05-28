import styled, { createGlobalStyle } from "styled-components";
import { Button } from "../Button";
import { Container } from "../Container";
import { Grid } from "../Grid";

export const DispatchModalResponsiveStyles = createGlobalStyle`
  @media (max-width: 768px) {
    .dispatch-proforma-modal,
    .dispatch-code-modal,
    .dispatch-confirm-modal,
    .dispatch-finish-modal {
      top: 0;
      max-width: 100vw;
      padding: 0;
    }

    .dispatch-proforma-modal .ant-modal,
    .dispatch-code-modal .ant-modal,
    .dispatch-confirm-modal .ant-modal,
    .dispatch-finish-modal .ant-modal {
      margin: 0;
      max-width: 100vw;
      padding: 0;
      width: 100vw !important;
    }

    .dispatch-proforma-modal .ant-modal-content,
    .dispatch-code-modal .ant-modal-content,
    .dispatch-confirm-modal .ant-modal-content,
    .dispatch-finish-modal .ant-modal-content {
      border-radius: 0;
      display: flex;
      flex-direction: column;
      max-height: 100vh;
      overflow: hidden;
    }

    .dispatch-proforma-modal .ant-modal-content,
    .dispatch-code-modal .ant-modal-content,
    .dispatch-confirm-modal .ant-modal-content {
      height: 100vh;
    }

    .dispatch-finish-modal .ant-modal-content {
      min-height: 100vh;
    }

    .dispatch-proforma-modal .ant-modal-header,
    .dispatch-code-modal .ant-modal-header,
    .dispatch-confirm-modal .ant-modal-header,
    .dispatch-finish-modal .ant-modal-header {
      flex: 0 0 auto;
      padding: 0.85rem 2.85rem 0.85rem 1rem;
    }

    .dispatch-proforma-modal .ant-modal-title,
    .dispatch-code-modal .ant-modal-title,
    .dispatch-confirm-modal .ant-modal-title,
    .dispatch-finish-modal .ant-modal-title {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.25rem;
    }

    .dispatch-proforma-modal .ant-modal-close-x,
    .dispatch-code-modal .ant-modal-close-x,
    .dispatch-confirm-modal .ant-modal-close-x,
    .dispatch-finish-modal .ant-modal-close-x {
      height: 3rem;
      line-height: 3rem;
      width: 3rem;
    }

    .dispatch-proforma-modal .ant-modal-body,
    .dispatch-code-modal .ant-modal-body,
    .dispatch-confirm-modal .ant-modal-body,
    .dispatch-finish-modal .ant-modal-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      padding: 0.75rem;
    }
  }
`;

export const DispatchPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  @media (max-width: 768px) {
    overflow: hidden;
  }
`;

export const DispatchFilters = styled(Container)`
  flex: 0 0 auto;

  @media (max-width: 768px) {
    height: auto !important;
    padding: 0.75rem !important;
  }
`;

export const DispatchFiltersGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 0.55rem !important;
    grid-template-columns: 1fr 1fr !important;

    > * {
      min-width: 0;
    }

    .dispatch-user-filter,
    .dispatch-date-range,
    .dispatch-search-button {
      grid-column: 1 / 3 !important;
    }

    .dispatch-user-filter {
      display: none;
    }

    .dispatch-date-range {
      grid-gap: 0.55rem !important;
      grid-template-columns: 1fr 1fr !important;
    }

    .ant-input-wrapper.ant-input-group,
    div:has(> .ant-input-group-addon + .ant-picker) {
      align-items: stretch !important;
      display: flex !important;
      width: 100%;
    }

    .ant-input-group-addon {
      align-items: center;
      display: flex;
      flex: 0 0 5.75rem;
      font-size: 0.76rem !important;
      line-height: 1rem !important;
      overflow: hidden;
      padding: 0.25rem 0.45rem;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 5.75rem !important;
    }

    .ant-input,
    .ant-picker {
      min-width: 0 !important;
      width: 100% !important;
    }

    button {
      width: 100%;
    }
  }
`;

export const DispatchContent = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 1rem 1rem;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    padding: 0 0.75rem 0.35rem;
  }
`;

export const DesktopDispatchTable = styled.div`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileDispatchList = styled.div`
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

export const DispatchCard = styled.div`
  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    padding: 0.85rem;
  }
`;

export const DispatchCardHeader = styled.div`
  @media (max-width: 768px) {
    align-items: flex-start;
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
  }
`;

export const DispatchCardTitle = styled.div`
  @media (max-width: 768px) {
    color: #111827;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2rem;
  }
`;

export const DispatchCardMetaText = styled.div`
  @media (max-width: 768px) {
    color: #667085;
    font-size: 0.78rem;
    margin-top: 0.2rem;
  }
`;

export const DispatchCardBadge = styled.div`
  @media (max-width: 768px) {
    color: #111827;
    flex: 0 0 auto;
    font-size: 0.9rem;
    font-weight: 700;
    text-align: right;
  }
`;

export const DispatchCardMeta = styled.div`
  @media (max-width: 768px) {
    display: grid;
    gap: 0.35rem;
    margin-top: 0.75rem;
  }
`;

export const DispatchMetaRow = styled.div`
  @media (max-width: 768px) {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: minmax(6.75rem, 0.45fr) minmax(0, 1fr);

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
  }
`;

export const DispatchCardActions = styled.div`
  @media (max-width: 768px) {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1fr 1fr;
    margin-top: 0.75rem;

    button {
      width: 100%;
    }
  }
`;

export const MobilePagination = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex: 0 0 auto;
    justify-content: center;
    padding-top: 0.55rem;

    .ant-pagination-options {
      display: none;
    }
  }
`;

export const DispatchFooter = styled(Container)`
  flex: 0 0 auto;

  @media (max-width: 768px) {
    background: #fff;
    border-top: 1px solid #e8e8e8;
    box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.06);
    height: auto !important;
    padding: 0.75rem !important;
  }
`;

export const DispatchFooterGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;

    button {
      grid-column: auto !important;
      width: 100% !important;
    }
  }
`;

export const DispatchDetailHeader = styled(Container)`
  flex: 0 0 auto;

  @media (max-width: 768px) {
    height: auto !important;
    padding: 0.75rem !important;
  }
`;

export const DispatchDetailHeaderGrid = styled(Grid)`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

export const DispatchDetailSummary = styled.div`
  display: none;

  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: grid;
    gap: 0.55rem;
    padding: 0.75rem;
  }
`;

export const DispatchDetailTitle = styled.div`
  @media (max-width: 768px) {
    color: #111827;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2rem;
  }
`;

export const DispatchDetailProducts = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 1rem 1rem;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    padding: 0 0.75rem 0.35rem;
  }
`;

export const DispatchDetailFooter = styled(Container)`
  flex: 0 0 auto;

  @media (max-width: 768px) {
    background: #fff;
    border-top: 1px solid #e8e8e8;
    box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.06);
    height: auto !important;
    padding: 0.75rem !important;
  }
`;

export const DispatchDetailFooterGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 0.5rem !important;
    grid-template-columns: 1fr 1fr !important;

    button {
      margin: 0 !important;
      min-height: 2.35rem;
      width: 100% !important;
    }
  }
`;

export const DispatchCodeGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 0.65rem !important;
    grid-template-columns: 1fr !important;
    margin-bottom: 0.75rem !important;

    .ant-input-wrapper.ant-input-group {
      display: flex;
      width: 100%;
    }

    .ant-input-group-addon {
      flex: 0 0 7rem;
      font-size: 0.78rem !important;
      line-height: 1rem !important;
      padding: 0.35rem 0.5rem;
      text-align: left;
      white-space: normal;
      width: 7rem !important;
    }

    button {
      width: 100%;
    }
  }
`;

export const DispatchScanner = styled(Container)`
  .drawingBuffer {
    position: absolute;
    left: 0;
  }

  @media (max-width: 768px) {
    padding: 0 !important;

    .viewport,
    video {
      max-width: 100%;
      width: 100%;
    }

    .viewport {
      background: #111827;
      border-radius: 8px;
      min-height: 12rem;
      overflow: hidden;
    }
  }
`;

export const DispatchConfirmContent = styled.div`
  @media (max-width: 768px) {
    display: grid;
    gap: 0.75rem;
  }
`;

export const DispatchConfirmGrid = styled(Grid)`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

export const DispatchConfirmMobileList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 0.55rem;
  }
`;

export const DispatchConfirmRow = styled.div`
  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: grid;
    gap: 0.3rem;
    padding: 0.65rem 0.75rem;

    span {
      color: #667085;
      font-size: 0.76rem;
    }

    strong {
      color: #1f2937;
      font-size: 0.9rem;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
  }
`;

export const DispatchConfirmQuantity = styled.div`
  @media (max-width: 768px) {
    display: grid;
    gap: 0.65rem;

    .ant-input-wrapper.ant-input-group {
      display: flex;
      width: 100%;
    }

    .ant-input-group-addon {
      flex: 0 0 7rem;
      font-size: 0.78rem !important;
      line-height: 1rem !important;
      padding: 0.35rem 0.5rem;
      text-align: left;
      white-space: normal;
      width: 7rem !important;
    }
  }
`;

export const DispatchConfirmButton = styled(Button)`
  @media (max-width: 768px) {
    margin: 0 !important;
    width: 100% !important;
  }
`;

export const DispatchFinishContent = styled(Container)`
  @media (max-width: 768px) {
    height: 100% !important;
    justify-content: center;
    padding: 0 !important;
    text-align: center;
  }
`;

export const DispatchFinishActions = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 0.5rem !important;
    grid-template-columns: 1fr !important;
    width: 100%;

    button {
      width: 100% !important;
    }
  }
`;
