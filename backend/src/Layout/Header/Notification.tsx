import { Href } from "@/Constants";
import { useQuery } from "@apollo/client";
import React, { Fragment } from "react";
import { ShoppingBag } from "react-feather";
import { Media } from "reactstrap";
import { GET_ALL_NOTIFICATION } from '../../GraphQL/Queries/notificationQueries';

const Notification = () => {
  const { data: notificationData } = useQuery(GET_ALL_NOTIFICATION);

  const getTimeAgo = (createdAt: any) => {
    const now = new Date();
    const timeDiff = now.getTime() - new Date(createdAt).getTime();

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
  };

  const notifications = notificationData?.getAllNotification || [];

  return (
    <Fragment>
      <ul className="notification-dropdown onhover-show-div p-0">
        <li>
          Notification <span className="badge rounded-pill badge-primary pull-right">{notifications.length}</span>
        </li>

        {notifications.length === 0 ? (
          <li className="no-notification">
            <p>No notifications available</p>
          </li>
        ) : (
          <>
            {notifications.filter((notification: any) => notification.isNotified).map((notification: any) => (
              <li key={notification._id} className="new-notification">
                <Media>
                  <Media body>
                    <h6 className="mt-0">
                      <span>
                        <ShoppingBag />
                      </span>
                      {notification.message}
                    </h6>
                    <p>{getTimeAgo(parseInt(notification.createdAt))}</p>
                  </Media>
                </Media>
              </li>
            ))}

            {notifications.filter((notification: any) => !notification.isNotified).map((notification: any) => (
              <li key={notification._id}>
                <Media>
                  <Media body>
                    <h6 className="mt-0">
                      <span>
                        <ShoppingBag />
                      </span>
                      {notification.message}
                    </h6>
                    <p>{getTimeAgo(parseInt(notification.createdAt))}</p>
                  </Media>
                </Media>
              </li>
            ))}
          </>
        )}

        {notifications.length > 0 && (
          <li className="txt-dark">
            <a href={Href}>All notifications</a>
          </li>
        )}
      </ul>
    </Fragment>
  );
};

export default Notification;
