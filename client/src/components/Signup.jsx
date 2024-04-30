
import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom'

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const Navigate=useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            name: name,
            email: email,
            password: password
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Signup failed');
            }
            const userData = await response.json(); // Parse response JSON
            const userId = userData.id; 
        
            console.log('Signup successful. User ID:', userId);
            Navigate("/tasklist")
            
        } catch (error) {
            console.error('Error signing up:', error.message);
        }
    };

    return (
        <div className="signupp">

            <div className="wrapr">
                <form className="form" onSubmit={handleSubmit}>
                    <h4>Sign Up</h4>

                    <div className="form1">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            placeholder='Name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        /><br />
                    </div>

                    <div className="form1">
                        <label htmlFor="email">Email Address:</label>
                        <input
                            type="email"
                            id="email"
                            placeholder='Email Address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        /><br />z
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
                        <button type="submit">Sign Up</button><br />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;
