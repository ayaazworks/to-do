import { useState, useEffect } from "react";
import "../style/addTask.css";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateTask() {
    
    const [taskData, setTaskData] = useState({ title: "", description: "" });
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        getTask(id);
    }, []);

    const getTask = async () => {

        let response = await fetch('http://localhost:3300/task/' + id, {
            credentials: 'include' 
        });
        const data = await response.json();

        if (data.success) {
            setTaskData(data.result);
        } else {
            // Handle error 
            console.error("Failed to fetch task");
        }
    };

    const updateTask = async () => {
        let response = await fetch("http://localhost:3300/update-task", {
            method: 'put',
            body: JSON.stringify(taskData),
            headers: {
                'Content-Type': 'application/json' 
            },
            credentials: 'include' 
        });
        
        const data = await response.json();
        
        if (data.success) {
            navigate('/');
        } else {
            alert(data.message || "Update failed");
        }
    };

    return (
        <div className="container">
            <h1>Update Task</h1>
            
            <label htmlFor="title">Title</label>
            <input 
                value={taskData.title || ""} 
                onChange={(event) => setTaskData({ ...taskData, title: event.target.value })} 
                type="text" 
                name="title" 
                placeholder="Enter Task Title" 
            />
            
            <label htmlFor="description">Description</label>
            <textarea 
                value={taskData.description || ""} 
                onChange={(event) => setTaskData({ ...taskData, description: event.target.value })} 
                name="description" 
                rows={3} 
                placeholder="Enter Task Description" 
            ></textarea>
            
            <button onClick={updateTask} className="submit">Update Task</button>
        </div>
    );
}