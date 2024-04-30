//imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#ffffff',
    tags: '' 
  });
  const [editedTask, setEditedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filter]);
 
  //fetching
  const fetchTasks = async (status = '') => {
    try {
      let url = 'http://localhost:8000/tasks/';
      if (status) {
        url += `?status=${status}`;
      }
      const response = await axios.get(url);
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  //filtering
  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value.toLowerCase();
    setFilter(selectedFilter);
    fetchTasks(selectedFilter);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const color = name === 'color' && !value ? '#ffffff' : value;
    setFormData({ ...formData, [name]: color });
  };

  //submitting tasks
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/tasks/', formData);
      console.log('Task created successfully');
      setFormData({ title: '', description: '', color: '#ffffff', tags: '' }); 
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  //editing or updating tasks
  const handleEditClick = (task) => {
    setEditedTask(task);
    setEditMode(true);
  };
  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:8000/tasks/${editedTask.id}`, { title: editedTask.title, description: editedTask.description });
      setEditMode(false);
      setEditedTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleEditTask = (taskId, updatedTaskData) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updatedTaskData };
      setTasks(updatedTasks);

      axios.put(`http://localhost:8000/tasks/${taskId}`, updatedTaskData)
        .then(response => {
          console.log('Task updated successfully:', response.data);
        })
        .catch(error => {
          console.error('Error updating task:', error);
        });
    } else {
      console.error('Task not found.');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedTask(null);
  };

  //deleting tasks

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8000/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  //completing tasks

  const handleCompleteTask = async (taskId, completed) => {
    try {
      const newCompletedStatus = !completed;

      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: newCompletedStatus };
        }
        return task;
      });
      setTasks(updatedTasks);

      await axios.put(`http://localhost:8000/tasks/${taskId}`, { completed: newCompletedStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div>
      
      <Link to={'/'} className="logout-link" >logout</Link>

      <div id="task-manager-container" className="task-manager-background">
        <h2 id="add-task-title">Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" id="title-label">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" id="description-label">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="color" id="color-label">Background Color:</label>
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>
<br />
          <div>
            <label htmlFor="tags" id="tags-label">Tags:</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>
          <br />

          <button type="submit" id="add-task-btn">Add Task</button>
        </form>

        <h2 id="task-list-title">Task List</h2>

        <div id="filter-container">
          <label htmlFor="filter-select" id="filter-label">Filter by Status:</label>
          <select value={filter} onChange={handleFilterChange} id="filter-select">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p id="loading-message">Loading...</p>
      ) : (
        <div id="task-cards-container">
          {tasks.map((task) => (
            <div key={task.id} className="task-card" style={{ backgroundColor: task.color }}>
              <h3 className="task-title">{task.title}</h3>
              <p className="task-description">{task.description}</p>
              <p className="task-tags">Tags: {task.tags}</p> 
              <label className="complete-checkbox-label">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleCompleteTask(task.id, !task.completed)}
                  className="complete-checkbox"
                />
                <span className="checkmark"></span>
                <span className="complete-text">Mark as Complete</span>
              </label>
              <button onClick={() => handleEditClick(task)} className="edit-button"> Edit </button>
              <button onClick={() => handleDeleteTask(task.id)} className="delete-button">Delete</button>
            </div>
          ))}
        </div>
      )}

      {editMode && (
        <div className="edit-task-form">
          <h2>Edit Task</h2>
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            placeholder="Title"
          />
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            placeholder="Description"
          />
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default TaskManager;
