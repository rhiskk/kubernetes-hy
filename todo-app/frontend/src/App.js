import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from "./util/config";
import todoService from './services/todos';
import { Route, Routes } from 'react-router-dom';

const Todo = () => {
  const imageUrl = `${BACKEND_URL}/image`;
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = async (event) => {
    event.preventDefault();
    const todo = {
      text: newTodo
    };
    const created = await todoService.create(todo);
    setTodos(todos.concat(created));
    setNewTodo('');
  };

  const handleTodoChange = (event) => {
    setNewTodo(event.target.value);
  };

  useEffect(() => {
    todoService.getAll().then(todos => setTodos(todos));
  }, []);

  return (
    <div>
      <img src={imageUrl} className="daily-image" alt="daily" />
      <form onSubmit={addTodo}>
        <input
          value={newTodo}
          onChange={handleTodoChange}
          required
          minLength="1"
          maxLength="140"
        />
        <button type="submit">Create TODO</button>
      </form>
      <ul>
        {todos.map(todo =>
          <li key={todo.id}>
            {todo.text} {todo.done}
          </li>
        )}
      </ul>
    </div>
  );
};

const Health = () => {
  return (
    <div>
      <h1>HealthCheck</h1>
      <p>
        <a href={`${BACKEND_URL}`}>Healthz</a>
      </p>
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/healthz" element={<Health />} />
        <Route path="/" element={<Todo />} />
      </Routes>
    </div>
  );
};

export default App;
