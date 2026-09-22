import React, { useState } from "react";
import { Drawer, Button, Input, Space, Popconfirm, Empty } from "antd";
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import CustomToast from "./CustomToast";

const CategoryManageDrawer = ({ open, categories, onClose, onAdd, onEdit, onDelete }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleAdd = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setAdding(true);
    try {
      await onAdd(name);
      CustomToast("success", "Category added successfully");
      setNewCategoryName("");
    } catch (error) {
      console.log(error);
      CustomToast("error", "Failed to add category. Please try again..");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (id) => {
    const name = editingName.trim();
    if (!name) return;
    setSavingId(id);
    try {
      await onEdit(id, name);
      CustomToast("success", "Category updated successfully");
      cancelEdit();
    } catch (error) {
      console.log(error);
      CustomToast("error", "Failed to update category. Please try again..");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      CustomToast("success", "Category deleted successfully");
    } catch (error) {
      console.log(error);
      CustomToast("error", "Failed to delete category. Please try again..");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Drawer title="Manage Categories" open={open} onClose={onClose} size={360} destroyOnHidden zIndex={1050}>
      <div className="form-group">
        <label>Add new category</label>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onPressEnter={handleAdd}
          />
          <Button type="primary" loading={adding} disabled={!newCategoryName.trim()} onClick={handleAdd}>
            Add
          </Button>
        </Space.Compact>
      </div>

      <div className="mt-4">
        {categories.length === 0 ? (
          <Empty description="No categories yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="d-flex align-items-center justify-content-between py-2"
              style={{ borderBottom: "1px solid #f0f0f0" }}
            >
              {editingId === category.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onPressEnter={() => handleSaveEdit(category.id)}
                  autoFocus
                />
              ) : (
                <span>{category.name}</span>
              )}
              <Space className="ml-2">
                {editingId === category.id ? (
                  <>
                    <Button
                      type="text"
                      icon={<CheckOutlined />}
                      loading={savingId === category.id}
                      disabled={!editingName.trim()}
                      onClick={() => handleSaveEdit(category.id)}
                      title="Save"
                    />
                    <Button type="text" icon={<CloseOutlined />} onClick={cancelEdit} title="Cancel" />
                  </>
                ) : (
                  <>
                    <Button type="text" icon={<EditOutlined />} onClick={() => startEdit(category)} title="Edit" />
                    <Popconfirm
                      title="Delete this category?"
                      onConfirm={() => handleDelete(category.id)}
                      okText="Delete"
                      cancelText="Cancel"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} loading={deletingId === category.id} title="Delete" />
                    </Popconfirm>
                  </>
                )}
              </Space>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
};

export default CategoryManageDrawer;
