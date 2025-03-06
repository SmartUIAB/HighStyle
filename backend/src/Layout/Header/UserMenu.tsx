import { Href, ImagePath } from "@/Constants";
import { LOGOUT_USER } from "@/GraphQL/Mutations/authMutations";
import { useMutation } from "@apollo/client";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { toast } from "react-toastify";

const UserMenu = () => {
  const router = useRouter();
  const [logoutMutation] = useMutation(LOGOUT_USER);

  const handleLogOut = async () => {
    try {
      const { data } = await logoutMutation();

      if (data.logout) {
        Cookies.remove("token");
        router.replace("/auth/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message);
    }
  };

  const lang = localStorage.getItem("i18nextLng")

  return (
    <Fragment>
      <li className="onhover-dropdown">
        <div className="media align-items-center">
          <img
            className="align-self-center pull-right img-50 rounded-circle blur-up lazyloaded"
            src={`${ImagePath}/dashboard/man.png`}
            alt="header-user"
          />
          <div className="dotted-animation">
            <span className="animate-circle"></span>
            <span className="main-circle"></span>
          </div>
        </div>
        <ul className="profile-dropdown onhover-show-div p-20 profile-dropdown-hover">
          <li>
            <Link href={`/${lang}/settings/profile`}>
              <i data-feather="user"></i>Edit Profile
            </Link>
          </li>
          <li>
            <a href={Href}>
              <i data-feather="mail"></i>Inbox
            </a>
          </li>
          <li>
            <a href={Href}>
              <i data-feather="lock"></i>Lock Screen
            </a>
          </li>
          <li>
            <a href={Href}>
              <i data-feather="settings"></i>Settings
            </a>
          </li>
          <li>
            <a onClick={handleLogOut}>
              <i data-feather="log-out"></i>Logout
            </a>
          </li>
        </ul>
      </li>
    </Fragment>
  );
};

export default UserMenu;
