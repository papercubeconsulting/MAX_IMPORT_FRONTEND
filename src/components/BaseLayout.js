import React, {useState} from "react";
import styled from "styled-components";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faIndent} from "@fortawesome/free-solid-svg-icons";

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
            <Content>
                <Trigger icon={faIndent}
                         onClick={() => setIsVisibleMenu(prevState => !prevState)}/>
                {props.children}
            </Content>
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

const Trigger = styled(FontAwesomeIcon)`
  cursor: pointer;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Content = styled.section`
  flex: 3;
  margin: 0;
  height: 100%;
  padding: 1rem;
  
  h1 {
    margin: 0;
  }
`;
