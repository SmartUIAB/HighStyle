import React, { Fragment } from "react";
import Countdown from "react-countdown";
import { useTranslation } from "react-i18next";

const CountdownComponent = () => {
  const { t } = useTranslation();

  const Completionist = () => <span>{t("product_details.off")}</span>;

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return <Completionist />;
    } else {
      return (
        <div className="timer-box">
          <div className="timer">
            <div className="timer-p" id="demo">
              <span>
                {days}
                <span className="padding-l">:</span>
                <span className="timer-cal">{t("product_details.days")}</span>
              </span>
              <span>
                {hours}
                <span className="padding-l">:</span>
                <span className="timer-cal">{t("product_details.hours")}</span>
              </span>
              <span>
                {minutes}
                <span className="padding-l">:</span>
                <span className="timer-cal">
                  {t("product_details.minutes")}
                </span>
              </span>
              <span>
                {seconds}
                <span className="timer-cal">
                  {t("product_details.seconds")}
                </span>
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var countdown = new Date(year, month, day + 10).getTime();

  return (
    <Fragment>
      <Countdown date={countdown} renderer={renderer} />
    </Fragment>
  );
};

export default CountdownComponent;
