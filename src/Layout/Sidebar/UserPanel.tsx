import { ImagePath } from "@/Constants";

const UserPanel = () => {
  const userData = JSON.parse(localStorage.getItem('userDetail') || '{}');

  return (
    <div>
      <div className="sidebar-user text-center">
        <div>
          <img className="img-60 rounded-circle lazyloaded blur-up" src={userData?.image !== null ? `${process.env.NEXT_PUBLIC_API_URL + userData?.image}` : `${ImagePath}/dashboard/man.png`} alt="#" />
        </div>
        <h6 className="mt-3 f-14">{userData.firstname} {userData.lastname}</h6>
        <p>{userData?.role}.</p>
      </div>
    </div>
  );
};

export default UserPanel;
