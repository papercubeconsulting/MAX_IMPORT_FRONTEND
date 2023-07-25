import React, { useEffect, useState } from "react";
import { useGlobal } from "reactn";
import { BaseLayout } from "../components";
import { createGlobalStyle } from "styled-components";
import stylesheet from "antd/dist/antd.min.css";

export default ({ Component, pageProps }) => {
  const [title, setTitle] = useState(null);
  const [showButton, setShowButton] = useState(false);

  const [, setGlobalAuthUser] = useGlobal("authUser");

  useEffect(() => {
    const localAuthUser = localStorage.getItem("authUser") || null;
    setGlobalAuthUser(JSON.parse(localAuthUser));
  }, []);

  if (Component.isPdf) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <GlobalStyle />
        <Component
          setShowButton={setShowButton}
          setPageTitle={setTitle}
          {...pageProps}
        />
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <GlobalStyle />
      <BaseLayout showButton={showButton} title={title}>
        <Component
          setShowButton={setShowButton}
          setPageTitle={setTitle}
          {...pageProps}
        />
      </BaseLayout>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1rem;
  }
  
  .ant-input-disabled {
    color: rgba(0,0,0,.65) !important;
  }
  
  .ant-input, .ant-select {
    height: 2rem !important;
    font-size: 1rem !important;
  }
  
  .ant-input-group-addon {
    font-size: 1rem !important;
  }
  
  .ant-upload-wrapper {
    overflow: hidden;
    display: flex;
  }
  
  .ant-input-affix-wrapper {
    max-height: 2.5rem !important
  }
  
  .ant-table-wrapper {
    width: 100% !important;
  }

  .ant-table-thead {
    .ant-table-cell {
      background-color: #1890ff;
      color: white;
    }
  }
  .ant-pagination-options-quick-jumper{
    visibility: hidden;
  }
  .ant-pagination-options-quick-jumper{
    input{
      visibility: visible;
      margin-left: 0;
    }
  }
  .ant-pagination-options-quick-jumper:after {
    content:"Ir a";
    visibility: visible;
    float:left;
    margin-right: -40px;
    font-size: 16px;
  }
  .ant-pagination-total-text {
    font-size: 16px;
    margin-right: 30px !important;
  }
  .ant_green_color {
    background-color: green
  }

  /* This css is for styling the header of the max import table */
  .pdfProforma
  .ant-table
    .ant-table-container
    .ant-table-content
    table
    thead.ant-table-thead
    .ant-table-cell {
    background-color: #ed7204;
  }


`;
