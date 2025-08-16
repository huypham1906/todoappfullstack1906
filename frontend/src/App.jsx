import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Check, X, Edit2, Trash2, Save, AlertCircle } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingTodo, setEditingTodo] = useState({ title: '', description: '' });

  // Fetch todos from API
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos. Please check if the server is running.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/todos`, newTodo);
      setTodos([response.data, ...todos]);
      setNewTodo({ title: '', description: '' });
      setError('');
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/todos/${id}/toggle`);
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
      setError('');
    } catch (err) {
      setError('Failed to toggle todo');
      console.error('Error toggling todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingTodo({ title: todo.title, description: todo.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTodo({ title: '', description: '' });
  };

  const saveTodo = async (id) => {
    if (!editingTodo.title.trim()) return;

    try {
      const todoToUpdate = todos.find(t => t.id === id);
      const response = await axios.put(`${API_URL}/todos/${id}`, {
        ...editingTodo,
        completed: todoToUpdate.completed
      });
      
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
      setEditingId(null);
      setEditingTodo({ title: '', description: '' });
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📝 Todo App</h1>
        <p>Build end-to-end với React + Node.js + PostgreSQL</p>
      </header>

      {error && (
        <div className="error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="container">
        {/* Add new todo form */}
        <form onSubmit={createTodo} className="add-todo-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Todo title..."
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="input"
            />
            <textarea
              placeholder="Description (optional)..."
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="textarea"
              rows="2"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
            Add Todo
          </button>
        </form>

        {/* Todo list */}
        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-state">
              <p>No todos yet. Add your first todo above! 🚀</p>
            </div>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-content">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`check-btn ${todo.completed ? 'checked' : ''}`}
                  >
                    {todo.completed && <Check size={16} />}
                  </button>

                  <div className="todo-text">
                    {editingId === todo.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editingTodo.title}
                          onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                          className="input"
                        />
                        <textarea
                          value={editingTodo.description}
                          onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                          className="textarea"
                          rows="2"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="todo-title">{todo.title}</h3>
                        {todo.description && (
                          <p className="todo-description">{todo.description}</p>
                        )}
                        <small className="todo-date">
                          Created: {new Date(todo.created_at).toLocaleDateString('vi-VN')}
                        </small>
                      </>
                    )}
                  </div>
                </div>

                <div className="todo-actions">
                  {editingId === todo.id ? (
                    <>
                      <button
                        onClick={() => saveTodo(todo.id)}
                        className="btn btn-success"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn btn-secondary"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(todo)}
                        className="btn btn-secondary"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="btn btn-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{todos.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">{todos.filter(t => t.completed).length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Remaining:</span>
              <span className="stat-value">{todos.filter(t => !t.completed).length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;