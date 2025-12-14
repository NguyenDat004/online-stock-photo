import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Button, Badge } from "react-bootstrap";
import { toast } from "react-toastify";

function WithdrawRequests() {
  const [requests, setRequests] = useState([]);

  const loadData = async () => {
    const res = await axios.get("http://localhost:5000/api/withdraw/admin/list");
    setRequests(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    const res = await axios.put(
      `http://localhost:5000/api/withdraw/admin/update/${id}`,
      { status }
    );
    toast.success(`Yêu cầu đã được ${status}`);
    loadData();
  };

  return (
    <Card className="p-4">
      <h3>📤 Yêu cầu rút tiền</h3>

      <Table striped hover bordered className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Số tiền</th>
            <th>Ngân hàng</th>
            <th>STK</th>
            <th>Trạng thái</th>
            <th>Ngày</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((item) => (
            <tr key={item.request_id}>
              <td>{item.request_id}</td>
              <td>{item.user_name} ({item.email})</td>
              <td>{Number(item.amount).toLocaleString("vi-VN")} VNĐ</td>
              <td>{item.bank_name}</td>
              <td>{item.bank_account}</td>
              <td>
                <Badge 
                  bg={
                    item.status === "pending" ? "warning" :
                    item.status === "approved" ? "success" : "danger"
                  }
                >
                  {item.status}
                </Badge>
              </td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>
                {item.status === "pending" ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => updateStatus(item.request_id, "approved")}
                    >
                      Duyệt
                    </Button>{" "}
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => updateStatus(item.request_id, "rejected")}
                    >
                      Từ chối
                    </Button>
                  </>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

export default WithdrawRequests;
