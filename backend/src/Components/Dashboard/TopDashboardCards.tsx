import { useQuery } from "@apollo/client";
import CountUp from "react-countup";
import { Card, CardBody, Col, Media } from "reactstrap";
import { GET_DASHBOARD_CARDS } from "../../GraphQL/Queries/dashboardQueries";
import { Box, MessageSquare, Navigation, Users } from "react-feather";
import { useEffect } from "react";

const TopDashboardCards = () => {

  const { data: cardData, refetch } = useQuery(GET_DASHBOARD_CARDS)

  useEffect(() => {
    refetch();
  }, [])

  const TopDashboardCardsData = [
    {
      id: 1,
      type: "Earnings",
      bgColor: "bg-warning",
      count: cardData?.getAllCardDashboard?.earning,
      icon: <Navigation className="font-warning" />,
    },
    {
      id: 2,
      type: "Products",
      bgColor: "bg-secondary",
      icon: <Box className="font-secondary" />,
      count: cardData?.getAllCardDashboard?.products,
    },
    {
      id: 3,
      type: "Messages",
      bgColor: "bg-primary",
      icon: <MessageSquare className="font-primary" />,
      count: cardData?.getAllCardDashboard?.message,
    },
    {
      id: 4,
      type: "New Vendors",
      bgColor: "bg-danger",
      icon: <Users className="font-danger" />,
      count: cardData?.getAllCardDashboard?.vendors,
    },
  ];

  return (
    <>
      {TopDashboardCardsData.map((item, i) => (
        <Col key={i} xl="3 xl-50" md="6">
          <Card className=" o-hidden widget-cards">
            <CardBody className={item.bgColor}>
              <Media className="static-top-widget row">
                <div className="icons-widgets col-4">
                  <div className="align-self-center text-center">{item.icon}</div>
                </div>
                <Media body className="col-8">
                  <span className="m-0">{item.type}</span>
                  <h3 className="mb-0">
                    {item.type === "Earnings" && "$"}<CountUp className="counter" end={item.count} />
                  </h3>
                </Media>
              </Media>
            </CardBody>
          </Card>
        </Col>
      ))}
    </>
  );
};

export default TopDashboardCards;
