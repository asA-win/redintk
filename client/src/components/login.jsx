import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom'
function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const Navigate=useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            username: username,
            password: password
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json(); // Parse error response JSON
                setError(errorData.detail || 'Login failed');
                return; 
            }

            const data = await response.json(); // Parse success response JSON
            Navigate("/tasklist")
            console.log(data.message);
            setError(''); 
        } catch (error) {
            console.error('Error logging in:', error.message);
            setError('Error logging in');
        }
    };

    return (
        <div className="login">

            <div className="wrapr">
                <form className="form" onSubmit={handleSubmit}>
                    <h4>Login</h4>
                    <div className="form1">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            placeholder='Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        /><br />
                    </div>

                    <div className="form1">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        /><br />
                    </div>

                    <div className="form1">
                        <button type="submit">Login</button><br />
                    </div>
                    {error && <p>{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default Login;
