import React from "react";
import {BaseLayout} from "../components";
import {createGlobalStyle} from "styled-components";
import stylesheet from "antd/dist/antd.min.css";

export default ({Component, pageProps}) => <>
    <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
    <GlobalStyle/>
    <BaseLayout>
        <Component {...pageProps}/>
    </BaseLayout>
</>

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
  
  a {
    color: white !important;
    text-decoration: none;
    font-size: 1rem;
    text-align: center;
  }
  
  h1 {
    font-size: 2rem;
  }
`;
