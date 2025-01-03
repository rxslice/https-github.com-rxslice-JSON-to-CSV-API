
    <!DOCTYPE html>
    <html>
    <head>
      <title>JSON to CSV API</title>
      <style>
        body { font-family: sans-serif; margin: 20px; }
        form { margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; }
        label { display: block; margin-bottom: 5px; }
        textarea, input { width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box; }
        button { padding: 10px 15px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background-color: #45a049; }
        pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f0f0f0; padding: 10px; }
      </style>
    </head>
    <body>
      <h1>JSON to CSV API</h1>

      <form id="registerForm">
        <h2>Register User</h2>
        <label>Username:</label>
        <input type="text" id="registerUsername" required>
        <label>Password:</label>
        <input type="password" id="registerPassword" required>
        <button type="submit">Register</button>
      </form>

      <form id="loginForm">
        <h2>Login User</h2>
        <label>Username:</label>
        <input type="text" id="loginUsername" required>
        <label>Password:</label>
        <input type="password" id="loginPassword" required>
        <button type="submit">