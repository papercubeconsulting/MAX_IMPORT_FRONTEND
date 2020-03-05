import React from "react";
import ModalTemplate from "./ModalTemplate";

class ErrorTemplate extends React.Component<
  {
    close: () => void;
    title: string;
  },
  {}
> {
  render() {
    return (
      <ModalTemplate
        title={this.props.title}
        isOpen={true}
        close={this.props.close}
        positive={this.props.close}
        positiveText="Ok"
      >
        {this.props.children}
      </ModalTemplate>
    );
  }
}
export default ErrorTemplate;
