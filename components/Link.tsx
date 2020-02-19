import { NextPage } from "next";
import { Button, ButtonProps } from "reactstrap";
import React, { CSSProperties } from "react";

export interface LinkProps extends ButtonProps {
  href: string;
}

export class DataTable<T extends ButtonProps> extends React.Component<T, {}> {}

class Link extends DataTable<LinkProps> {
  render() {
    return (
      <a style={{ flexGrow: 1 }} href={this.props.href}>
        <Button
          color={this.props.color}
          style={{
            width: "100%",
            height: "100%",
            ...this.props.style
          }}
        >
          {this.props.children}
        </Button>
      </a>
    );
  }
}
export default Link;
