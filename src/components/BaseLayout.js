import React, {useState} from "react";
import styled from "styled-components";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faIndent, faCalendarAlt, faUser} from "@fortawesome/free-solid-svg-icons";
import {Container} from "./Container";
import {clientDateFormat} from "../util";
import moment from "moment";

export const BaseLayout = props => {
    const [isVisibleMenu, setIsVisibleMenu] = useState(true);

    return <>
        <Layout>
            <Sidebar collapsed={!isVisibleMenu}>
                <Menu>
                    <MenuItem>
                        <a href="/">
                            Perfil
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            Nueva Proforma
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            Hiatorial Proformas
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            Pagos en Caja
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            Despachos
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            Admin Ventas
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            Inventario
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            Abastecimientos
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            BD Clientes
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/">
                            Admin Usuarios
                        </a>
                    </MenuItem>
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

const Icon = styled(FontAwesomeIcon)`
  font-size: 1rem;
  margin-right: 0.5rem;
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
