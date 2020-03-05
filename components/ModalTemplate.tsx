import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import React from "react";

class ModalTemplate extends React.Component<
  {
    isOpen: boolean;
    close: () => void;
    title: string;
    positiveText: string;
    negativeText?: string;
    positive: () => void;
    negative?: () => void;
  },
  {}
> {
  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.close}>
        <ModalHeader toggle={this.props.close}>{this.props.title}</ModalHeader>
        <ModalBody>{this.props.children}</ModalBody>
        <ModalFooter>
          {this.props.positiveText && (
            <Button color="primary" onClick={this.props.positive}>
              {this.props.positiveText}
            </Button>
          )}
          {this.props.negativeText && (
            <Button color="secondary" onClick={this.props.negative}>
              {this.props.negativeText}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    );
  }
}
export default ModalTemplate;
