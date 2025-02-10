import { useState, useEffect } from "react";
import "./index.css";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", email: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users?_page=${page}&_limit=4`);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        
        setUsers((prevUsers) => {
          const uniqueUsers = [...prevUsers, ...data].filter(
            (user, index, self) => index === self.findIndex((u) => u.id === user.id)
          );
          return page === 1 ? data : uniqueUsers;
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    fetchData();
  }, [page]);

  const handleDelete = async (id) => {
    try {
      await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, { method: "DELETE" });
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      setError("Failed to delete user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, username: user.username, email: user.email });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", username: "", email: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const updatedUser = await response.json();
        setUsers(users.map((user) => (user.id === editingUser.id ? updatedUser : user)));
      } else {
        const response = await fetch("https://jsonplaceholder.typicode.com/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const newUser = await response.json();
        setUsers([...users, { ...newUser, id: users.length + 1 }]);
      }
      setShowModal(false);
    } catch (error) {
      setError("Failed to save user");
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="mainContainer">
      <div className="header">
        <h1>Dashboard</h1>
        <button className="addBtn" onClick={handleAdd}>Add New User</button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <div className="loader"></div>
      ) : (
        <>
          <div className="cardsContainer">
            {users.map((user) => (
              <div className="userCard" key={user.id}>
                <div className="userInfo">
                  <p><span className="title">Name: </span>{user.id+'. '}{user.name}</p>
                  <p><span className="title">Username: </span>{user.username}</p>
                  <p><span className="title">Mail: </span>{user.email}</p>
                </div>
                <div className="buttonGroup">
                  <button className="editBtn" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="deleteBtn" onClick={() => handleDelete(user.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          {loadingMore && <div className="loader"></div>}
          <button className="loadMoreBtn" onClick={handleLoadMore}>Load More</button>
        </>
      )}

      {showModal && (
        <div className="modal">
          <h2>{editingUser ? "Edit User" : "Add User"}</h2>
          <form className="userForm" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <button className="addBtn" type="submit">Save</button>
            <button className="addBtn deleteBtn" onClick={() => setShowModal(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
