import { useState } from "react"
import "../style/addTask.css"
import { useNavigate } from "react-router-dom";
export default function AddTask() {
    const [taskData, setTaskData] = useState();
    const navigate = useNavigate();
    const handleAddTask = async () => {
        console.log(taskData);
        let result = await fetch('http://localhost:3300/add-task', {
            method: 'Post',
            body: JSON.stringify(taskData),
            credentials:'include',
            headers: {
                'Content-Type':'application/json'
            }

        })
        result = await result.json();
        if(result.success){
            navigate('/');
            console.log("new task added")
        }else{
            alert('Try after sometime')
        }
    }
    return (
        <div className="container">
            <h1> Add New Task </h1>
            <label htmlFor=""> Title</label>
            <input onChange={(event) => setTaskData({ ...taskData, title: event.target.value })} type="text" name="title" placeholder="Enter Task Title" />
            <label htmlFor="">Description</label>
            <textarea onChange={(event) => setTaskData({ ...taskData, description: event.target.value })} name="description" rows={3} placeholder="Enter Task Description" id=""></textarea>
            <button onClick={handleAddTask} className="submit" >Add New Task</button>

        </div >
    )
}
