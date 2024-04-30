
import React from 'react';
import './App.css';
import './TaskList.css'
import Header from './components/Header.jsx';
import { Route,Routes } from 'react-router-dom';
import TaskList from './components/TaskManager.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Header />}></Route>
        <Route path="/tasklist" element={<TaskList />}></Route>
      </Routes>
      
    </div>
  );
}

export default App;
