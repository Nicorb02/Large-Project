import React, { useState } from 'react';
import Blobs from './Blobs';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginFormSlid, setIsLoginFormSlid] = useState(false);
  const [isRegisterFormSlid, setIsRegisterFormSlid] = useState(false);

  const app_name = 'ssu-testing'
  function buildPath(route)
  {
    if (process.env.NODE_ENV === 'production')
    {
        return 'https://' + app_name + '.herokuapp.com/' + route;
    }
    else
    {
        return 'http://localhost:8080' + route;
    }
  }

  async function handleLogin() {
    const response = await fetch(buildPath('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.error == '') 
      {
        console.log('good login');
      }
      else 
      {
        console.error(data.error);
      }
  }

  return (
    <body className="login-body">    
        <div>
            <Blobs />
        </div>    
        <div className={`login-form ${isLoginFormSlid ? 'slide-left' : ''}`}>
            <p className="welcome-text">Welcome Back</p>
            <section className="email-section">
                <div className="email-div">
                    <span className="form-name">Email Address</span>
                    <input type="text" className="field-input" value={email} onChange={e => setEmail(e.target.value)}></input>
                </div>
            </section>
            <section className="password-section">
                <div className="password-div">
                    <span className="form-name">Password</span>
                    <input type="password" className="field-input" value={password} onChange={e => setPassword(e.target.value)}></input>
                </div>
            </section>
            <section className="login-form-bottom">
                <button className="login-button" onClick={handleLogin}>Login</button>
                <p className="register-prompt">Don't have an account?</p>
                <a href="#" className="go-register-button" onClick={() => { setIsLoginFormSlid(true); setIsRegisterFormSlid(true);}}>Register</a>
            </section>
        </div>
        <div className={`register-form ${isRegisterFormSlid ? 'slide-right' : ''}`}>
            <p className="welcome-text">Welcome</p>
            <section className="register-email-section">
                <div className="field-form-div">
                    <span className="form-name">Email Address</span>
                    <input type="text" className="field-input"></input>
                </div>
            </section>
            <section className="register-name-section">
                <div className="field-form-div">
                    <span className="form-name">First Name</span>
                    <input type="text" className="field-input"></input>
                </div>
            </section>
            <section className="register-name-section">
                <div className="field-form-div">
                    <span className="form-name">Last Name</span>
                    <input type="text" className="field-input"></input>
                </div>
            </section>
            <section className="register-name-section">
                <div className="field-form-div">
                    <span className="form-name">Password</span>
                    <input type="text" className="field-input" id="password"></input>
                </div>
            </section>
            <section className="register-form-button">
                <button className="register-button">Register</button>
                <p className="register-prompt">Have an account?</p>
                <a href="#" className="go-login-button" onClick={() => { setIsLoginFormSlid(false); setIsRegisterFormSlid(false);}}>Login</a>
            </section>
        </div>
        <div className="loginpage-background">
            <div className="title-div">
                <a href="https://github.com/Nicorb02/Large-Project/tree/master" className='title-text-href'>
                    <p className="title-text">Sunny Side Up</p>
                </a>
            </div>
        </div>
    </body>
  );
}

export default Login;