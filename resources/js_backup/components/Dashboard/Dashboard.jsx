import React from 'react';

function Dashboard({ username = "Super Admin" }) {
    return (
        <div>
            <h1>Welcome {username}</h1>
        </div>
    );
}

export default Dashboard;