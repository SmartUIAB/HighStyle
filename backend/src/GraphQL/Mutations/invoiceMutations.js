import { gql } from "@apollo/client";

export const INVOICE_SEND_EMAIL = gql`
  mutation SendInvoiceEmail($invoice: InvoiceInput!, $pdfBase64: String!) {
    sendInvoiceEmail(invoice: $invoice, pdfBase64: $pdfBase64)
  }
`;
