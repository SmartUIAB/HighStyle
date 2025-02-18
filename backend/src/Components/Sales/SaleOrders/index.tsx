import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { useQuery } from "@apollo/client";
import { Fragment, useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { GET_ORDER_LIST } from "@/GraphQL/Queries/transactionQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import Pagination from "@/CommonComponents/Pagination";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import axios from 'axios';
import { toast } from "react-toastify";


const SalesOrders = () => {

  const initialdata = {
    issuerCode: "",
    partyId: "",
    partyIdType: "",
    name: "",
    companyName: "",
    streets: "",
    postalCode: "",
    city: "",
    countryCode: "",
    contactName: "",
    email: "",
    phoneNo: "",
    smsNo: "",
    consignee_name: "",
    consignee_companyName: "",
    consignee_streets: "",
    consignee_postalCode: "",
    consignee_city: "",
    consignee_countryCode: "",
    consignee_contactName: "",
    consignee_email: "",
    consignee_phoneNo: "",
    consignee_smsNo: "",
    consignee_referenceNo: "",
    consignee_referenceType: "",
    package_type: "",
    item_id: "",
    height_value: "",
    height_unit: "",
    width_value: "",
    width_unit: "",
    length_value: "",
    length_unit: "",
    grossWeight_value: "",
    grossWeight_unit: "",
    volume_value: "",
    volume_unit: ""
  }
  const [modal, setModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [formData, setFormData] = useState<any>(initialdata);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date();
    const futureDates = [
      new Date(today.setDate(today.getDate() + 1)).toISOString(), // Next day
      new Date(today.setDate(today.getDate() + 1)).toISOString(), // Day after next
    ];
    setDates(futureDates);
  }, []);

  const toggleModal = (order: any) => {
    setSelectedOrder(order);
    setModal(!modal);
  };
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const { data, loading, refetch } = useQuery(GET_ORDER_LIST);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const formatedDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePageChange = (page: any) => {
    setPage(page)
    refetch({ page });
  };

  const handleRowsPerPageChange = ((event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (event: any) => {
    event?.preventDefault();
    const obj = {
      messageDate: new Date().toISOString(),
      messageFunction: "PickupBooking",
      messageId: "msg-182721551",
      updateIndicator: "Original",
      shipment: [
        {
          shipmentIdentification: {
            shipmentId: "0"
          },
          dateAndTimes: {
            earliestPickupDate: dates[1]
          },
          service: {
            basicServiceCode: "0",
            additionalServiceCode: [
              "p1"
            ]
          },
          freeText: [
            {
              usageCode: "ADS",
              text: "Pickup instruction"
            }
          ],
          references: [
            {
              referenceNo: "customer referenceNo",
              referenceType: "CU"
            }
          ],
          totalGrossWeight: {
            value: parseInt(formData.grossWeight_value),
            unit: formData.grossWeight_unit
          },
          totalVolume: {
            value: parseInt(formData.volume_value),
            unit: formData.volume_unit
          },
          parties: {
            consignor: {
              issuerCode: formData.issuerCode,
              partyIdentification: {
                partyId: formData.partyId,
                partyIdType: formData.partyIdType
              },
              party: {
                nameIdentification: {
                  name: formData.name,
                  companyName: formData.companyName
                },
                address: {
                  streets: [
                    formData.streets
                  ],
                  postalCode: formData.postalCode,
                  city: formData.city,
                  countryCode: formData.countryCode
                },
                contact: {
                  contactName: formData.countryCode,
                  emailAddress: formData.email,
                  phoneNo: formData.phoneNo,
                  smsNo: formData.smsNo
                }
              }
            },
            pickupParty: {
              party: {
                nameIdentification: {
                  name: formData.name,
                  companyName: formData.companyName
                },
                address: {
                  streets: [
                    formData.streets
                  ],
                  postalCode: formData.postalCode,
                  city: formData.city,
                  countryCode: formData.countryCode
                },
                contact: {
                  contactName: formData.countryCode,
                  emailAddress: formData.email,
                  phoneNo: formData.phoneNo,
                  smsNo: formData.smsNo
                }
              }
            },
            consignee: {
              party: {
                nameIdentification: {
                  name: formData.consignee_name,
                  companyName: formData.consignee_companyName
                },
                address: {
                  streets: [
                    formData.consignee_streets
                  ],
                  postalCode: formData.consignee_postalCode,
                  city: formData.consignee_city,
                  countryCode: formData.consignee_countryCode
                },
                contact: {
                  contactName: formData.consignee_contactName,
                  emailAddress: formData.consignee_email,
                  phoneNo: formData.consignee_phoneNo,
                  smsNo: formData.consignee_smsNo
                }
              },
              reference: {
                referenceNo: formData.consignee_referenceNo,
                referenceType: formData.consignee_referenceType
              }
            },
            returnParty: {
              party: {
                nameIdentification: {
                  name: formData.name,
                  companyName: formData.companyName
                },
                address: {
                  streets: [
                    formData.streets
                  ],
                  postalCode: formData.postalCode,
                  city: formData.city,
                  countryCode: formData.countryCode
                },
                contact: {
                  contactName: formData.countryCode,
                  emailAddress: formData.email,
                  phoneNo: formData.phoneNo,
                  smsNo: formData.smsNo
                }
              }
            }
          },
          goodsItem: [
            {
              packageTypeCode: formData.package_type,
              items: [
                {
                  itemIdentification: {
                    itemId: formData.item_id
                  },
                  dimensions: {
                    height: {
                      value: parseInt(formData.height_value),
                      unit: formData.height_unit
                    },
                    width: {
                      value: parseInt(formData.width_value),
                      unit: formData.width_unit
                    },
                    length: {
                      value: parseInt(formData.length_value),
                      unit: formData.length_unit
                    }
                  },
                  grossWeight: {
                    value: parseInt(formData.grossWeight_value),
                    unit: formData.grossWeight_unit
                  },
                  volume: {
                    value: parseInt(formData.volume_value),
                    unit: formData.volume_unit
                  }
                }
              ]
            }
          ]
        }
      ]
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_POSTNORD_HOST}/rest/shipment/v3/pickups?apikey=${process.env.NEXT_PUBLIC_POSTNORD_API_KEY}`,
        obj
      );
      if (response) {
        setModal(false)
        setFormData(initialdata)
        toast.success('Added Pickup Schedule Order Successfully')
      } else {
        return
      }
    } catch (error) {
      toast.error(error.message)
      console.error('Error submitting pickup request:', error.message);
    }
  };

  const closeModal = () => {
    setModal(false)
    setFormData(initialdata)
  }

  return (
    <Fragment>
      <CommonBreadcrumb title={t("sales.orders.title")} parent={t("sales.type")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title={t("sales.orders.manageOrder")} />
              <CardBody className="order-datatable tabel-scroll">
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner style={{ color: '#ff8084' }} />
                  </div>
                ) : (
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
                        <th className="text-uppercase">Action</th>

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
                            <td className="align-middle">{item?.finalTotal}$</td>
                            <td className="align-middle">
                              {item?.paymentStatus || "N/A"}
                            </td>
                            <td className="align-middle">{item.orderStatus || "N/A"}</td>
                            <td className="align-middle">{item?.shippingAddress?.city || "N/A"}</td>
                            <td className="align-middle">
                              {item?.products.reduce((sum: any, item: any) => sum + item.quantity, 0)}
                            </td>
                            <td className="align-middle">{formatedDate(parseInt(item.createdAt))}</td>
                            <td className="align-middle"> <button className="saleorders-btn" onClick={() => toggleModal(item)}>
                              <LocalShippingIcon />
                            </button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
                <Modal isOpen={modal} >
                  <ModalHeader toggle={() => setModal(!modal)}>Order Pickup Details</ModalHeader>
                  <ModalBody className="saleorders">
                    <form onSubmit={handleSubmit}>
                      <h2 className="saleorders-title12 ">consignor</h2>

                      <label htmlFor="" className="saleorders-label">Issuer Code</label>
                      <input type="text" name="issuerCode" onChange={handleInputChange} value={formData.issuerCode} className="saleorders-input" placeholder="Issuer Code" />
                      <div className="saleorders-flex">
                        <div>
                          <label htmlFor="" className="saleorders-label">Party Id</label>
                          <input type="text" name="partyId" onChange={handleInputChange} value={formData.partyId} className="saleorders-input" placeholder="Party Id" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Party Id Type</label>
                          <input type="text" name="partyIdType" onChange={handleInputChange} value={formData.partyIdType} className="saleorders-input" placeholder="Party Id Type" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Name</label>
                          <input type="text" name="name" onChange={handleInputChange} value={formData.name} className="saleorders-input" placeholder="Name" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Company Name</label>
                          <input type="text" name="companyName" onChange={handleInputChange} value={formData.companyName} className="saleorders-input" placeholder="Company Name" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Streets</label>
                          <input type="text" name="streets" onChange={handleInputChange} value={formData.streets} className="saleorders-input" placeholder="Streets" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Postal Code</label>
                          <input type="text" name="postalCode" onChange={handleInputChange} value={formData.postalCode} className="saleorders-input" placeholder="Postal Code" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">City</label>
                          <input type="text" name="city" onChange={handleInputChange} value={formData.city} className="saleorders-input" placeholder="City" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Country Code</label>
                          <input type="text" name="countryCode" onChange={handleInputChange} value={formData.countryCode} className="saleorders-input" placeholder="Country Code" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Contact Name</label>
                          <input type="text" name="contactName" onChange={handleInputChange} value={formData.contactName} className="saleorders-input" placeholder="Contact Name" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Email Address</label>
                          <input type="text" name="email" onChange={handleInputChange} value={formData.email} className="saleorders-input" placeholder="Email Address" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Phone No</label>
                          <input type="text" name="phoneNo" onChange={handleInputChange} value={formData.phoneNo} className="saleorders-input" placeholder="Phone No" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Sms No</label>
                          <input type="text" name="smsNo" onChange={handleInputChange} value={formData.smsNo} className="saleorders-input" placeholder="Sms No" />
                        </div>

                      </div>
                      <h2 className="saleorders-title1 ">consignee</h2>
                      <div className="saleorders-flex">
                        <div>
                          <label htmlFor="" className="saleorders-label">Name</label>
                          <input type="text" name="consignee_name" onChange={handleInputChange} value={formData.consignee_name} className="saleorders-input" placeholder="Name" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Company Name</label>
                          <input type="text" name="consignee_companyName" onChange={handleInputChange} value={formData.consignee_companyName} className="saleorders-input" placeholder="Company Name" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Streets</label>
                          <input type="text" name="consignee_streets" onChange={handleInputChange} value={formData.consignee_streets} className="saleorders-input" placeholder="Streets" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Postal Code</label>
                          <input type="text" name="consignee_postalCode" onChange={handleInputChange} value={formData.consignee_postalCode} className="saleorders-input" placeholder="Postal Code" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">City</label>
                          <input type="text" name="consignee_city" onChange={handleInputChange} value={formData.consignee_city} className="saleorders-input" placeholder="City" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Country Code</label>
                          <input type="text" name="consignee_countryCode" onChange={handleInputChange} value={formData.consignee_countryCode} className="saleorders-input" placeholder="Country Code" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Contact Name</label>
                          <input type="text" name="consignee_contactName" onChange={handleInputChange} value={formData.consignee_contactName} className="saleorders-input" placeholder="Contact Name" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Email Address</label>
                          <input type="text" name="consignee_email" onChange={handleInputChange} value={formData.consignee_email} className="saleorders-input" placeholder="Email Address" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Phone No</label>
                          <input type="text" name="consignee_phoneNo" onChange={handleInputChange} value={formData.consignee_phoneNo} className="saleorders-input" placeholder="Phone No" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Sms No</label>
                          <input type="text" name="consignee_smsNo" onChange={handleInputChange} value={formData.consignee_smsNo} className="saleorders-input" placeholder="Sms No" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Reference No</label>
                          <input type="text" name="consignee_referenceNo" onChange={handleInputChange} value={formData.consignee_referenceNo} className="saleorders-input" placeholder="Reference No" />
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Reference Type</label>
                          <input type="text" name="consignee_referenceType" onChange={handleInputChange} value={formData.consignee_referenceType} className="saleorders-input" placeholder="Reference Type" />
                        </div>
                      </div>
                      <h2 className="saleorders-title1 ">Goods Item</h2>
                      <div>
                        <label htmlFor="" className="saleorders-label">Package Type Code</label>
                        <input type="text" className="saleorders-input" name="package_type" onChange={handleInputChange} value={formData.package_type} placeholder="Package Type Code" />
                      </div>
                      <div className="saleorders-flex">
                        <div>
                          <label htmlFor="" className="saleorders-label">Item Id</label>
                          <input type="text" className="saleorders-input" name="item_id" onChange={handleInputChange} value={formData.item_id} placeholder="Item Id" />
                        </div>
                        <div >
                          <div>
                            <label htmlFor="" className="saleorders-label">Height</label>
                            <div className="saleorders-dflax">
                              <input type="text" name="height_value" onChange={handleInputChange} value={formData.height_value} className="saleorders-input" placeholder="Value" />
                              <input type="text" name="height_unit" onChange={handleInputChange} value={formData.height_unit} className="saleorders-input" placeholder="Unit" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="saleorders-flex">
                        <div>
                          <label htmlFor="" className="saleorders-label">Width</label>
                          <div className="saleorders-dflax">
                            <input type="text" name="width_value" onChange={handleInputChange} value={formData.width_value} className="saleorders-input" placeholder="Value" />
                            <input type="text" name="width_unit" onChange={handleInputChange} value={formData.width_unit} className="saleorders-input" placeholder="Unit" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Length</label>
                          <div className="saleorders-dflax">
                            <input type="text" name="length_value" onChange={handleInputChange} value={formData.length_value} className="saleorders-input" placeholder="Value" />
                            <input type="text" name="length_unit" onChange={handleInputChange} value={formData.length_unit} className="saleorders-input" placeholder="Unit" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Gross Weight</label>
                          <div className="saleorders-dflax">
                            <input type="text" name="grossWeight_value" onChange={handleInputChange} value={formData.grossWeight_value} className="saleorders-input" placeholder="Value" />
                            <input type="text" name="grossWeight_unit" onChange={handleInputChange} value={formData.grossWeight_unit} className="saleorders-input" placeholder="Unit" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="" className="saleorders-label">Volume</label>
                          <div className="saleorders-dflax">
                            <input type="text" name="volume_value" onChange={handleInputChange} value={formData.volume_value} className="saleorders-input" placeholder="Value" />
                            <input type="text" name="volume_unit" onChange={handleInputChange} value={formData.volume_unit} className="saleorders-input" placeholder="Unit" />
                          </div>
                        </div>
                      </div>
                      <div className="saleororders-button">
                        <button type="submit" className="sale-button"> Save</button>
                        <button type="button" onClick={closeModal} className="sale-button"> Close</button>
                      </div>
                    </form>
                  </ModalBody>
                </Modal>
                <Pagination
                  count={data?.getAllOrders.orders?.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default SalesOrders;
