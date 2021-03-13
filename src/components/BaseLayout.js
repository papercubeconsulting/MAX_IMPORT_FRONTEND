import React, { useEffect, useState } from "react";
import { useGlobal } from "reactn";
import styled from "styled-components";
import { Menu as MenuDrop, Dropdown } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faIndent,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Container } from "./Container";
import { Button } from "./Button";
import { clientDateFormat } from "../util";
import moment from "moment";
import { useRouter } from "next/router";
import { Icon } from "./Icon";
import Link from "next/link";
import { get } from "lodash";

const noTokenPath = ["/resetpassword"];

export const BaseLayout = (props) => {
  const [isVisibleMenu, setIsVisibleMenu] = useState(true);

  const [globalAuthUser, setGlobalAuthUser] = useGlobal("authUser");

  const router = useRouter();

  useEffect(() => {
    router.pathname !== "/" && setIsVisibleMenu(false);
    // if (!globalAuthUser && !noTokenPath.includes(router.pathname)) {
    //     router.push("/asdfasd");
    // }
  }, [router.pathname, globalAuthUser]);

  const isActiveLink = (route) => {
    const currentRoute = router.pathname.split("/")[1];

    return route === currentRoute;
  };

  const menu = (
    <MenuDrop>
      <MenuDrop.Item key="1">
        <span
          onClick={() => {
            setGlobalAuthUser(null);
            localStorage.removeItem("authUser");
            router.push("/");
          }}
        >
          Cerrar sesión
        </span>
      </MenuDrop.Item>
    </MenuDrop>
  );

  return (
    <>
      <Layout>
        <Sidebar collapsed={!globalAuthUser || !isVisibleMenu}>
          <Menu>
            <Link href="/profile">
              <MenuItem active={isActiveLink("profile")}>Perfil</MenuItem>
            </Link>
            <Link href="/proforma">
              <MenuItem active={isActiveLink("proforma")}>
                Nueva Proforma
              </MenuItem>
            </Link>
            <Link href="/proformas">
              <MenuItem active={isActiveLink("proformas")}>
                Historial Proformas
              </MenuItem>
            </Link>
            <Link href="/sales">
              <MenuItem active={isActiveLink("sales")}>Pagos en Caja</MenuItem>
            </Link>
            <Link href="/dispatch">
              <MenuItem active={isActiveLink("dispatch")}>Despachos</MenuItem>
            </Link>
            <Link href="/salesAdministration">
              <MenuItem active={isActiveLink("salesAdministration")}>
                Admin Ventas
              </MenuItem>
            </Link>
            <Link href="/products">
              <MenuItem active={isActiveLink("products")}>Inventario</MenuItem>
            </Link>
            <Link href="/supplies">
              <MenuItem active={isActiveLink("supplies")}>
                Abastecimientos
              </MenuItem>
            </Link>
            <Link href="/customers">
              <MenuItem active={isActiveLink("customers")}>
                BD Clientes
              </MenuItem>
            </Link>
            <Link href="/users">
              <MenuItem active={isActiveLink("users")}>Admin Usuarios</MenuItem>
            </Link>
          </Menu>
        </Sidebar>
        <Grid>
          <Header>
            <Container padding="0px" width="auto" alignItems="center">
              <Trigger
                icon={faIndent}
                onClick={() => setIsVisibleMenu((prevState) => !prevState)}
              />
              <h2>{props.title}</h2>
            </Container>
            <Container
              padding="0px"
              width="auto"
              justifyContent="flex-end"
              alignItems="center"
            >
              {props.showButton && (
                <Button
                  width="90px"
                  margin="2% 20px 2% 0%"
                  type="primary"
                  onClick={async () => router.back()}
                >
                  Regresar
                </Button>
              )}

              <Icon icon={faCalendarAlt} />
              <h3>{moment().format(clientDateFormat)}</h3>
              <Divider />
              <Dropdown
                overlay={menu}
                trigger={globalAuthUser ? ["click"] : [""]}
              >
                <h3>
                  <Icon style={{ cursor: "pointer" }} icon={faUser} />
                  {get(globalAuthUser, "user.name", "Bienvenido")}
                </h3>
              </Dropdown>
            </Container>
          </Header>
          <Content>{props.children}</Content>
        </Grid>
      </Layout>
    </>
  );
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
  flex: ${(props) => (props.collapsed ? 0 : 1)};
  background: linear-gradient(to left, #1890ff, #6dd5ed);
  overflow: hidden;
`;

const Menu = styled.div`
  display: grid;
  overflow: hidden;
  height: 100%;
  grid-template-rows: repeat(${(props) => props.children.length}, 1fr);
  align-items: center;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
  background-color: ${(props) =>
    props.active ? "rgba(0,0,0,0.3)" : "transparent"};
  color: white !important;
  text-decoration: none;
  font-size: 1rem;
  text-align: center;

  :hover {
    background-color: rgba(0, 0, 0, 0.3);
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

  h2,
  h3 {
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
