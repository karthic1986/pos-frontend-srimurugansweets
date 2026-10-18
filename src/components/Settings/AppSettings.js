import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Popconfirm, ConfigProvider } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import {
  getAppSettingsSvc,
  addAppSettingSvc,
  editAppSettingSvc,
  deleteAppSettingSvc,
} from "../../actions/appSettingAction";
import CustomToast from "../CustomToast";
import utils from "../../utils";

const NAME_PATTERN = /^[A-Z0-9_]+$/;

const TABLE_THEME = {
  components: {
    Table: { headerBg: "#343a40", headerColor: "#fff", headerSplitColor: "rgba(255, 255, 255, 0.3)" },
  },
};

const serverMessage = (error, fallback) =>
  (error.response && error.response.data && error.response.data.message) || fallback;

// Add/edit dialog. AppSettings remounts it (new key) on every open, so each
// open gets a fresh form holding the setting's saved values.
const AppSettingDialog = ({ open, setting, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEditing = !!setting.id;

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch (error) {
      return;
    }
    const userId = (utils.getUser() || {}).id;
    setSaving(true);
    try {
      if (isEditing) {
        await editAppSettingSvc(setting.id, {
          value: values.value,
          description: values.description,
          updatedBy: userId,
        });
        CustomToast("success", "Setting updated successfully");
      } else {
        await addAppSettingSvc({ ...values, createdBy: userId });
        CustomToast("success", "Setting added successfully");
      }
      onSaved();
    } catch (error) {
      console.log(error);
      CustomToast("error", serverMessage(error, "Failed to save setting. Please try again.."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Setting" : "Add Setting"}
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      okText="Save"
      confirmLoading={saving}
      zIndex={1050}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ name: setting.name, value: setting.value, description: setting.description }}
      >
        <Form.Item
          name="name"
          label="Name"
          normalize={(value) => (value || "").toUpperCase().replace(/[\s-]+/g, "_")}
          rules={[
            { required: true, message: "Enter a name" },
            { pattern: NAME_PATTERN, message: "Use capital letters, numbers and _ only" },
          ]}
          extra={isEditing ? "The name can't be changed. The app looks the setting up by it." : "For example BILL_FOOTER_MESSAGE"}
        >
          <Input disabled={isEditing} maxLength={100} />
        </Form.Item>
        <Form.Item name="value" label="Value">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const AppSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ key: 0, open: false, setting: {} });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getAppSettingsSvc();
      setSettings(res.data || []);
    } catch (error) {
      console.log(error);
      CustomToast("error", "Failed to load settings. Please try again..");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // setting = {} to add a new one
  const openDialog = (setting) => setDialog((d) => ({ key: d.key + 1, open: true, setting }));
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const handleDelete = async (setting) => {
    try {
      await deleteAppSettingSvc(setting.id);
      CustomToast("success", "Setting deleted successfully");
      loadSettings();
    } catch (error) {
      console.log(error);
      CustomToast("error", serverMessage(error, "Failed to delete setting. Please try again.."));
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: 240,
      render: (name) => <span className="app-setting-name">{name}</span>,
    },
    {
      title: "Value",
      dataIndex: "value",
      width: 260,
      render: (value) =>
        value ? <span className="app-setting-value">{value}</span> : <span className="text-muted">—</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (description) => description || <span className="text-muted">—</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      align: "center",
      render: (_, setting) => (
        <>
          <Button type="text" icon={<EditOutlined />} title="Edit" onClick={() => openDialog(setting)} />
          <Popconfirm
            title={`Delete ${setting.name}?`}
            description="Anything that uses this setting will stop using it."
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={() => handleDelete(setting)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="settings-section-header">
        <SettingOutlined className="settings-section-icon" />
        <div>
          <h5 className="mb-0">App Settings</h5>
          <small className="text-muted">Configure business logic parameters</small>
        </div>
      </div>

      <div className="settings-section-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted">
            <strong className="text-dark">{settings.length}</strong> setting{settings.length === 1 ? "" : "s"} configured
          </span>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openDialog({})}>
            Add Setting
          </Button>
        </div>
        <ConfigProvider theme={TABLE_THEME}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={settings}
            loading={loading}
            pagination={false}
            scroll={{ x: 760 }}
          />
        </ConfigProvider>
      </div>

      <AppSettingDialog
        key={dialog.key}
        open={dialog.open}
        setting={dialog.setting}
        onClose={closeDialog}
        onSaved={() => {
          closeDialog();
          loadSettings();
        }}
      />
    </div>
  );
};

export default AppSettings;
