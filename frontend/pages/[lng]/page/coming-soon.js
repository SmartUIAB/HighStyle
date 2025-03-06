import React from "react";
import { useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import LocalLink from "../../../components/LocalLink";
import { NOTIFY_ME } from "../../../GraphQL/Mutations/comingsoonMutations";
import { toast } from "react-toastify";

const ComingSoon = () => {
  const { t } = useTranslation();
  const [notifyMe, { loading }] = useMutation(NOTIFY_ME);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;

    try {
      const result = await notifyMe({ variables: { email } });
      toast.success(result.data.notifyMe);
      event.target.email.value = "";
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="template-password">
      <div className="container">
        <div id="container" className="text-center">
          <div>
            <div id="login">
              <div>
                <div className="logo mb-4">
                  <a href="#">
                    <img
                      src="../../assets/images/icon/logo.png"
                      alt="Multikart_fashion"
                      className="img-fluid"
                    />
                  </a>
                </div>
                <h2 className="mb-3">{t("comingSoon.openingSoon")}</h2>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <form onSubmit={handleSubmit} className="theme-form">
                    <div className="col-md-12 mt-2">
                      <h3>{t("comingSoon.enterEmail")}</h3>
                    </div>
                    <div className="form-row">
                      <div className="col-md-12">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="form-control"
                          autoFocus
                          required
                        />
                      </div>
                      <div className="col-md-12">
                        <div className="actions">
                          <button
                            type="submit"
                            className="btn btn-solid"
                            disabled={loading}
                          >
                            {loading
                              ? t("comingSoon.notifying")
                              : t("comingSoon.notifyMe")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div id="footer" className="mt-4">
                <div id="owner">
                  {t("comingSoon.storeOwner")}{" "}
                  <LocalLink href={`/page/account/login`}>
                    {t("comingSoon.loginHere")}
                  </LocalLink>{" "}
                  {t("comingSoon.or")}{" "}
                  <a href="#">{t("comingSoon.changePassword")}</a>
                </div>
              </div>
            </div>
            <div id="powered">
              <p>© 2023, {t("comingSoon.poweredBy")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
