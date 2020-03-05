import React from "react";
import ModalTemplate from "./ModalTemplate";

class ErrorTemplate extends React.Component<
  {
    close: () => void;
    title: string;
    errorMessages: string[] | null;
  },
  {}
> {
  render() {
    return (
      this.props.errorMessages != null && (
        <ModalTemplate
          title={this.props.title}
          isOpen={this.props.errorMessages != null}
          close={this.props.close}
          positive={this.props.close}
          positiveText="Ok"
        >
          <ul>
            {this.props.errorMessages.map(x => (
              <li>{x}</li>
            ))}
          </ul>
        </ModalTemplate>
      )
    );
  }
}
export default ErrorTemplate;
