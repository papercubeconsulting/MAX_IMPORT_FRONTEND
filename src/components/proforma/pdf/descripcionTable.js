import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export const DescripcionTable = () => {
  return <div></div>;
};


import React from 'react';

const InvoicePage = () => {
  const companyName = 'ABC Company';
  const companyAddress = '123 Main Street, City, State';
  const companyPhoneNumber = '123-456-7890';

  return (
    <div className="invoice-container">
      <h1>Invoice</h1>
      <div className="company-info">
        <h2>{companyName}</h2>
        <p>Address: {companyAddress}</p>
        <p>Phone: {companyPhoneNumber}</p>
      </div>
      <div className="invoice-details">
        <h2>Invoice Details</h2>
        <p>Invoice Number: INV-001</p>
        <p>Date: July 6, 2023</p>
        <p>Customer: John Doe</p>
      </div>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Item 1</td>
            <td>Description of item 1</td>
            <td>2</td>
            <td>$10.00</td>
            <td>$20.00</td>
          </tr>
          <tr>
            <td>Item 2</td>
            <td>Description of item 2</td>
            <td>1</td>
            <td>$15.00</td>
            <td>$15.00</td>
          </tr>
          <tr>
            <td>Item 3</td>
            <td>Description of item 3</td>
            <td>3</td>
            <td>$8.00</td>
            <td>$24.00</td>
          </tr>
        </tbody>
      </table>
      <div className="total-amount">
        <h3>Total Amount: $59.00</h3>
      </div>
    </div>
  );
};

export default InvoicePage;

