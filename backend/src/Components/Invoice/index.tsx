import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { Fragment, useState } from "react";
import { Card, CardBody, Col, Container, Row, Button, Table } from "reactstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { INVOICE_SEND_EMAIL } from '../../GraphQL/Mutations/invoiceMutations'

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
import { useMutation, useQuery } from "@apollo/client";
import { GET_ORDER_LIST } from "@/GraphQL/Queries/transactionQueries";
import { useTranslation } from "@/app/i18n/client";
import { useAppSelector } from "@/Redux/Hooks";
import { toast } from "react-toastify";


const Invoice = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  const { data, loading, refetch } = useQuery(GET_ORDER_LIST);
  const [sendInvoice] = useMutation(INVOICE_SEND_EMAIL);

  const generatePDF = (invoice: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); // Get page width
    // **1. Invoice Header**

    // Center the "INVOICE" title
    doc.setFontSize(18);
    const titleText = "INVOICE";
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, 20); // Centered text

    // Invoice details aligned to center
    doc.setFontSize(12);
    const invoiceText1 = `Invoice ID: ${invoice.id}`;
    const invoiceText2 = `Date: ${formatedDate(parseInt(invoice.createdAt))}`;
    const textWidth1 = doc.getTextWidth(invoiceText1);
    const textWidth2 = doc.getTextWidth(invoiceText2);

    doc.text(invoiceText1, (pageWidth - textWidth1) / 2, 30); // Centered Invoice ID
    doc.text(invoiceText2, (pageWidth - textWidth2) / 2, 40); // Centered Date

    // **2. Customer Details Table**
    const customerColumn = ["Field", "Details"];
    const customerRows = [
      ["Customer Name", `${invoice.user.firstname} ${invoice.user.lastname}`],
      ["Email", invoice.user.email],
      ["Payment Status", invoice.paymentStatus],
      ["Order Status", invoice.orderStatus],
      ["Shipping Address", `${invoice.shippingAddress.street}, ${invoice.shippingAddress.city}, ${invoice.shippingAddress.state}, ${invoice.shippingAddress.country} - ${invoice.shippingAddress.postalCode}`],
    ];

    doc.autoTable({
      head: [customerColumn],
      body: customerRows,
      startY: 50,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    // **3. Product Details Table**
    const productColumn = ["Product ID", "Product Type", "Quantity"];
    const productRows: any[][] = [];

    invoice.products.forEach((product: any) => {
      productRows.push([
        product.productId,
        product.productType,
        product.quantity,
      ]);
    });

    doc.autoTable({
      head: [productColumn],
      body: productRows,
      startY: (doc as any).lastAutoTable.finalY + 10, // Place below customer details
      theme: "striped",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
    });

    // **4. Total Amount Section**
    const totalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: $${invoice.finalTotal.toFixed(2)}`, 140, totalY + 10);

    // **5. Footer Note**
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for your purchase!", 80, totalY + 20);

    // **6. Save PDF**
    doc.save(`Invoice_${invoice.id}.pdf`);
  };

  const generatePDFBase64 = (invoice: any) => {
    return new Promise((resolve) => {
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth(); // Get page width

      // Center the "INVOICE" title
      doc.setFontSize(18);
      const titleText = "INVOICE";
      const titleWidth = doc.getTextWidth(titleText);
      doc.text(titleText, (pageWidth - titleWidth) / 2, 20); // Centered text

      // Invoice details aligned to center
      doc.setFontSize(12);
      const invoiceText1 = `Invoice ID: ${invoice.id}`;
      const invoiceText2 = `Date: ${formatedDate(parseInt(invoice.createdAt))}`;
      const textWidth1 = doc.getTextWidth(invoiceText1);
      const textWidth2 = doc.getTextWidth(invoiceText2);

      doc.text(invoiceText1, (pageWidth - textWidth1) / 2, 30); // Centered Invoice ID
      doc.text(invoiceText2, (pageWidth - textWidth2) / 2, 40); // Centered Date

      // Customer details table
      doc.autoTable({
        head: [["Field", "Details"]],
        body: [
          ["Customer Name", `${invoice.user.firstname} ${invoice.user.lastname}`],
          ["Email", invoice.user.email],
          ["Payment Status", invoice.paymentStatus],
          ["Order Status", invoice.orderStatus],
          ["Shipping Address", `${invoice.shippingAddress.street}, ${invoice.shippingAddress.city}, ${invoice.shippingAddress.state}, ${invoice.shippingAddress.country} - ${invoice.shippingAddress.postalCode}`],
        ],
        startY: 50,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      // Product details table
      doc.autoTable({
        head: [["Product ID", "Product Type", "Quantity"]],
        body: invoice.products.map((p: any) => [p.productId, p.productType, p.quantity]),
        startY: (doc as any).lastAutoTable.finalY + 10,
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
      });

      // Total Amount
      const totalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total Amount: $${invoice.finalTotal.toFixed(2)}`, 140, totalY + 10);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Thank you for your purchase!", 80, totalY + 20);

      // Convert to Base64
      const pdfBase64 = doc.output("datauristring").split(",")[1]; // Remove `data:application/pdf;base64,`
      resolve(pdfBase64);
    });
  };


  const sendEmail = async (invoice: any) => {
    const pdfBase64 = await generatePDFBase64(invoice);

    const { data } = await sendInvoice({
      variables: {
        "invoice": {
          "createdAt": invoice.createdAt,
          "finalTotal": invoice.finalTotal,
          "id": invoice.id,
          "orderStatus": invoice.orderStatus,
          "paymentStatus": invoice.paymentStatus,
          "products": invoice.products.map((product: any) => ({
            "productId": product.productId,
            "productType": product.productType,
            "quantity": product.quantity
          })),
          "shippingAddress": {
            "city": invoice.shippingAddress.city,
            "country": invoice.shippingAddress.country,
            "postalCode": invoice.shippingAddress.postalCode,
            "state": invoice.shippingAddress.state,
            "street": invoice.shippingAddress.street
          },
          "updatedAt": invoice.updatedAt,
          "user": {
            "email": invoice.user.email,
            "firstname": invoice.user.firstname,
            "lastname": invoice.user.lastname
          }
        },
        "pdfBase64": pdfBase64
      }
    });

    if (data) {
      toast.success('Send Invoice via Email Successfully');
      refetch();
    }

  };

  const formatedDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Fragment>
      <CommonBreadcrumb title="Invoice" parent="Invoice" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Invoice List" />
              <CardBody>
                <table className="table mt-5 w-full " style={{ minWidth: '1200px' }}>
                  <thead>
                    <tr>
                      <th className="text-uppercase">{t("sales.orders.columns.customer")}</th>
                      <th className="text-uppercase">{t("sales.orders.columns.price")}</th>
                      <th className="text-uppercase">{t("sales.orders.columns.paymentStatus")}</th>
                      <th className="text-uppercase">{t("sales.orders.columns.orderStatus")}</th>
                      <th className="text-uppercase">{t("sales.orders.columns.deliveryCity")}</th>
                      <th className="text-uppercase">{t("sales.orders.columns.totalProduct")}</th>
                      <th className="text-uppercase">{t("sales.orders.columns.createdAt")}</th>
                      <th className="text-uppercase">{t("table.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.getAllOrders.orders?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center">{t("sales.orders.noOrderFound")}</td>
                      </tr>
                    ) : (
                      data?.getAllOrders.orders?.map((item: any, i: any) => (
                        <tr key={i}>
                          <td className="align-middle">
                            {item?.user?.firstname || "N/A"}
                          </td>
                          <td className="align-middle">{item?.finalTotal.toFixed(2)}$</td>
                          <td className="align-middle">
                            {item?.paymentStatus || "N/A"}
                          </td>
                          <td className="align-middle">{item.orderStatus || "N/A"}</td>
                          <td className="align-middle">{item?.shippingAddress?.city || "N/A"}</td>
                          <td className="align-middle">
                            {item?.products.reduce((sum: any, item: any) => sum + item.quantity, 0)}
                          </td>
                          <td className="align-middle">{formatedDate(parseInt(item.createdAt))}</td>
                          <td>
                            <Button color="primary" size="sm" onClick={() => generatePDF(item)} disabled={item?.paymentStatus === 'PENDING'}>Download</Button>{" "}
                            <Button color="success" size="sm" onClick={() => sendEmail(item)} disabled={item?.paymentStatus === 'PENDING'}>Send Email</Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Invoice;