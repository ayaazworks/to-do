import { Link, useNavigate } from "react-router-dom"
import '../style/navbar.css'
import { useState } from "react"
import { useEffect } from "react";

function  NavBar() {
    const [login,setLogin] = useState(localStorage.getItem('login'));
    const navigate = useNavigate();

    const logout = ()=>{
        localStorage.removeItem('login');
        setLogin(null);
        setTimeout(()=>{
            navigate('/login')
        },0)
    }

    useEffect(()=>{
        const handleStorage = ()=>{
            setLogin(localStorage.getItem('login'))
        }
        window.addEventListener("local-storage-change",handleStorage)
        return ()=>{
            window.removeEventListener('local-storage-change',handleStorage)
        }
    },[])
    return(
        <nav className="navbar">
            <div className="logo">To Do App</div>
            <ul className="nav-links">
                {
                    login?<>
                    <li><Link to="/">List</Link></li>
                <li><Link to="/add">Add Task</Link></li>
                <li><Link onClick={logout} >Logout</Link> </li>
                </>:null
                }
                
            </ul>
        </nav>
    )
}

export default NavBar