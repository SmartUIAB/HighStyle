import { Table } from "reactstrap";

const TabTable = ({ userData }) => {
  return (
    <div className="tab-pane fade show active">
      <h5 className="f-w-600 f-16">Profile</h5>
      <div className="table-responsive profile-table">
        <Table className="table-responsive">
          <tbody>
            <tr>
              <td>First Name:</td>
              <td>{userData?.me.firstname}</td>
            </tr>
            <tr>
              <td>Last Name:</td>
              <td>{userData?.me.lastname}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>{userData?.me.email}</td>
            </tr>
            <tr>
              <td>Company:</td>
              <td>{userData?.me?.company?.name}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default TabTable;
