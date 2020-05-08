import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt, faIndent, faUser} from "@fortawesome/free-solid-svg-icons";
import {Container} from "./Container";
import {clientDateFormat} from "../util";
import moment from "moment";
import {useRouter} from "next/router";
import {Icon} from "./Icon";
import Link from "next/link";

export const BaseLayout = props => {
    const [isVisibleMenu, setIsVisibleMenu] = useState(true);
    const router = useRouter();

    useEffect(() => {
        router.pathname !== "/" && setIsVisibleMenu(false);
    }, [router.pathname]);

    const isActiveLink = route => {
        const currentRoute = router.pathname.split("/")[1];

        return route === currentRoute;
    };

    return <>
        <Layout>
            <Sidebar collapsed={!isVisibleMenu}>
                <Menu>
                    <Link href="/">
                        <MenuItem>
                            Perfil
                        </MenuItem>
                    </Link>
                    <Link href="/">
                        <MenuItem>
                            Nueva Proforma
                        </MenuItem>
                    </Link>
                    <Link href="/">
                        <MenuItem>
                            Hiatorial Proformas
                        </MenuItem>
                    </Link>
                    <Link href="/">
                        <MenuItem>
                            Pagos en Caja
                        </MenuItem>
                    </Link>
                    <Link href="/">
                        <MenuItem>
                            Despachos
                        </MenuItem>
                    </Link>
                    <Link href="/">
                        <MenuItem>
                            Admin Ventas
                        </MenuItem>
                    </Link>
                    <Link href="/products">
                        <MenuItem active={isActiveLink("products")}>
                            Inventario
                        </MenuItem>
                    </Link>
                    <Link href="/supplies">
                        <MenuItem>
                            Abastecimientos
                        </MenuItem>
                    </Link>
                    <Link href="/">
                        <MenuItem>
                            BD Clientes
                        </MenuItem>
                    </Link>
                    <Link href="/">
                        <MenuItem>
                            Admin Usuarios
                        </MenuItem>
                    </Link>
                </Menu>
            </Sidebar>
            <Grid>
                <Header>
                    <Container padding="0px"
                               width="auto"
                               alignItems="center">
                        <Trigger icon={faIndent}
                                 onClick={() => setIsVisibleMenu(prevState => !prevState)}/>
                        <h2>
                            {props.title}
                        </h2>
                    </Container>
                    <Container padding="0px"
                               width="auto"
                               justifyContent="flex-end"
                               alignItems="center">
                        <Icon icon={faCalendarAlt}/>
                        <h3>
                            {moment().format(clientDateFormat)}
                        </h3>
                        <Divider/>
                        <Icon icon={faUser}/>
                        <h3>
                            Luis Rivera
                        </h3>
                    </Container>
                </Header>
                <Content>
                    {props.children}
                </Content>
            </Grid>
        </Layout>
    </>
};

const Layout = styled.section`
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
`;

const Sidebar = styled.div`
  display: inline;
  height: 100vh;
  flex: ${props => props.collapsed ? 0 : 1};
  background: linear-gradient(to left, #2193b0, #6dd5ed);
  overflow: hidden;
`;

const Menu = styled.div`
  display: grid;
  overflow: hidden;
  height: 100%;
  grid-template-rows: repeat(${props => props.children.length}, 1fr);
  align-items: center;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
  background-color: ${props => props.active ? "rgba(0,0,0,0.3)" : "transparent"};
  color: white !important;
  text-decoration: none;
  font-size: 1rem;
  text-align: center;
  
  :hover {
    background-color: rgba(0,0,0,0.3);
  }
`;

const Grid = styled.section`
  display: grid;
  grid-template-rows: 3.5rem 1fr;
  height: 100%;
  flex: 3;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: inherit;
  z-index: 999;
  padding: 1rem;
  background-color: #e9ecef;
  
  h2, h3 {
    margin: 0;
  }
`;

const Divider = styled.div`
  border-left: 1px solid #38546d; 
  border-right: 1px solid #16222c; 
  height: 100%;
  margin: 0 1rem;
`;

const Trigger = styled(FontAwesomeIcon)`
  cursor: pointer;
  font-size: 1.5rem;
  margin-right: 1rem;
`;

const Content = styled.main`
  overflow: scroll;
  position: relative;
  margin: 0;
  height: 100%;
  
  h1 {
    margin: 0;
  }
`;
