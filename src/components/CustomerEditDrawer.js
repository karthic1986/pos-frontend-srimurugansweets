import React, { useEffect, useState } from "react";
import { Drawer, Button, Input, Checkbox, Space } from "antd";
import { editCustomerSvc } from "../actions/customerAction";
import CustomToast from "./CustomToast";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  description: "",
  isActive: true,
};

const CustomerEditDrawer = ({ open, customer, onClose, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && customer) {
      setForm({
        name: customer.name || "",
        mobile: customer.mobile || "",
        email: customer.email || "",
        description: customer.description || "",
        isActive: customer.isActive !== undefined ? customer.isActive : true,
      });
    }
  }, [open, customer]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleActiveChange = (e) => {
    const checked = e.target.checked;
    setForm((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleSaveAndClose = () => {
    if (!customer?.id) return;
    setSaving(true);
    editCustomerSvc(customer.id, form)
      .then((res) => {
        if (res.status === 200) {
          CustomToast("success", "Customer updated successfully");
          onSaved({ ...customer, ...form });
          onClose();
        } else {
          CustomToast("error", "Failed to update customer. Please try again..");
        }
      })
      .catch((error) => {
        console.log(error);
        CustomToast("error", "Failed to update customer. Please try again..");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <Drawer title="Edit Customer" open={open} onClose={onClose} width={360} destroyOnClose>
      <div className="form-group">
        <label>Name</label>
        <Input value={form.name} onChange={handleChange("name")} />
      </div>
      <div className="form-group mt-3">
        <label>Mobile number</label>
        <Input
          value={form.mobile}
          onChange={handleChange("mobile")}
          onWheel={(e) => {
            e.currentTarget.blur();
          }}
        />
      </div>
      <div className="form-group mt-3">
        <label>Email</label>
        <Input value={form.email} onChange={handleChange("email")} />
      </div>
      <div className="form-group mt-3">
        <label>Description</label>
        <Input.TextArea rows={3} value={form.description} onChange={handleChange("description")} />
      </div>
      <div className="form-group mt-3">
        <Checkbox checked={form.isActive} onChange={handleActiveChange}>
          Active
        </Checkbox>
      </div>
      <div className="mt-4">
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={saving} onClick={handleSaveAndClose}>
            Save &amp; Close
          </Button>
        </Space>
      </div>
    </Drawer>
  );
};

export default CustomerEditDrawer;
