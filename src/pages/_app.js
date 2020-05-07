import React, {useState} from "react";
import {BaseLayout} from "../components";
import {createGlobalStyle} from "styled-components";
import stylesheet from "antd/dist/antd.min.css";

export default ({Component, pageProps}) => {
    const [title, setTitle] = useState(null);

    return <>
        <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
        <GlobalStyle/>
        <BaseLayout title={title}>
            <Component setPageTitle={setTitle} {...pageProps}/>
        </BaseLayout>
    </>;
}

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
  
  h2 {
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1rem;
  }
`;