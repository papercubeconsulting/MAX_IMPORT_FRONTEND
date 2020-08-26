import React, {useEffect, useState} from "react";
import {useGlobal} from "reactn";
import {BaseLayout} from "../components";
import {createGlobalStyle} from "styled-components";
import stylesheet from "antd/dist/antd.min.css";
import {useRouter} from "next/router";
import {getRouteStepper} from "./routes";

export default ({Component, pageProps}) => {
    const [title, setTitle] = useState(null);

    const [, setGlobalAuthUser] = useGlobal("authUser");

    useEffect(() => {
        const localAuthUser = localStorage.getItem("authUser") || null;
        setGlobalAuthUser(JSON.parse(localAuthUser));
    }, []);

    const router = useRouter();

    const stepper = getRouteStepper(router.pathname);

    return <>
        <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
        <GlobalStyle/>
        <BaseLayout title={stepper}>
            <Component setPageTitle={setTitle}
                       {...pageProps}/>
        </BaseLayout>
    </>;
}

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
`;
