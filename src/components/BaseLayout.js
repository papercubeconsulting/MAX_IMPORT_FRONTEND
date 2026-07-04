import React, { useEffect, useState } from "react";
import { useGlobal } from "reactn";
import styled from "styled-components";
import { Dropdown } from "antd";
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

  const menu = {
    items: [
      {
        key: "logout",
        label: "Cerrar sesión",
        onClick: () => {
          setGlobalAuthUser(null);
          localStorage.removeItem("authUser");
          router.push("/");
        },
      },
    ],
  };

  return (
    <>
      <Layout>
        <MenuBackdrop
          $visible={!!globalAuthUser && isVisibleMenu}
          onClick={() => setIsVisibleMenu(false)}
        />
        <Sidebar $collapsed={!globalAuthUser || !isVisibleMenu}>
          <Menu>
            <MenuLink
              href="/profile"
              $active={isActiveLink("profile")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>Perfil</MenuItem>
            </MenuLink>
            <MenuLink
              href="/proforma"
              $active={isActiveLink("proforma")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>
                Nueva Proforma
              </MenuItem>
            </MenuLink>
            <MenuLink
              href="/proformas"
              $active={isActiveLink("proformas")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>
                Historial Proformas
              </MenuItem>
            </MenuLink>
            <MenuLink
              href="/sales"
              $active={isActiveLink("sales")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>Pagos en Caja</MenuItem>
            </MenuLink>
            <MenuLink
              href="/dispatch"
              $active={isActiveLink("dispatch")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>Despachos</MenuItem>
            </MenuLink>
            <MenuLink
              href="/salesAdministration"
              $active={isActiveLink("salesAdministration")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>
                Admin Ventas
              </MenuItem>
            </MenuLink>
            <MenuLink
              href="/products"
              $active={isActiveLink("products")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>Inventario</MenuItem>
            </MenuLink>
            <MenuLink
              href="/boxMaintenance"
              $active={isActiveLink("boxMaintenance")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>Mantenimiento Cajas</MenuItem>
            </MenuLink>
            <MenuLink
              href="/supplies"
              $active={isActiveLink("supplies")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>
                Abastecimientos
              </MenuItem>
            </MenuLink>
            <MenuLink
              href="/customers"
              $active={isActiveLink("customers")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>
                BD Clientes
              </MenuItem>
            </MenuLink>
            <MenuLink
              href="/users"
              $active={isActiveLink("users")}
              onClick={() => setIsVisibleMenu(false)}
            >
              <MenuItem>Admin Usuarios</MenuItem>
            </MenuLink>
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
                menu={menu}
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
  overflow: hidden;
`;

const MenuBackdrop = styled.div`
  display: none;

  @media (max-width: 768px) {
    background: rgba(15, 23, 42, 0.34);
    display: ${(props) => (props.$visible ? "block" : "none")};
    inset: 3.75rem 0 0 0;
    position: fixed;
    z-index: 997;
  }
`;

const Sidebar = styled.div`
  position: fixed;
  top: 3.5rem;
  left: 0;
  z-index: 998;
  display: block;
  width: 25vw;
  min-width: 220px;
  max-width: 320px;
  height: calc(100vh - 3.5rem);
  background: linear-gradient(to left, #1890ff, #6dd5ed);
  overflow: hidden;
  transform: translateX(${(props) => (props.$collapsed ? "-100%" : "0")});
  transition: transform 0.2s ease;

  @media (max-width: 768px) {
    top: 3.75rem;
    width: 78vw;
    min-width: 0;
    max-width: 300px;
    height: calc(100vh - 3.75rem);
  }
`;

const Menu = styled.div`
  display: grid;
  overflow: hidden;
  height: 100%;
  grid-template-rows: repeat(${(props) => props.children.length}, 1fr);
  align-items: stretch;
`;

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
  background-color: ${(props) =>
    props.$active ? "rgba(0,0,0,0.3)" : "transparent"};
  color: white !important;
  text-decoration: none;

  :hover {
    background-color: rgba(0, 0, 0, 0.3);
    color: white !important;
  }
`;

const MenuItem = styled.span`
  font-size: 1rem;
  text-align: center;
`;

const Grid = styled.section`
  display: grid;
  grid-template-rows: 3.5rem 1fr;
  height: 100%;
  width: 100%;
  min-width: 0;
  flex: 1;

  @media (max-width: 768px) {
    grid-template-rows: auto minmax(0, 1fr);
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  z-index: 999;
  padding: 1rem;
  background-color: #e9ecef;

  h2,
  h3 {
    margin: 0;
  }

  @media (max-width: 768px) {
    align-items: center;
    gap: 0.5rem;
    min-height: 3.75rem;
    padding: 0.5rem 0.75rem;

    > div:first-child {
      min-width: 0;
      flex: 1 1 auto;
    }

    > div:last-child {
      flex: 0 0 auto;
      gap: 0.25rem;
    }

    h2 {
      font-size: 1.05rem;
      line-height: 1.2rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    h3 {
      font-size: 0.85rem;
      line-height: 1rem;
      max-width: 6rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > div:last-child > svg:first-of-type,
    > div:last-child > h3:first-of-type,
    > div:last-child > div {
      display: none;
    }
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

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-right: 0.55rem;
  }
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
