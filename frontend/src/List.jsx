import { Link } from 'react-router-dom';
import './style/list.css';
import { useEffect, useState, useRef, useCallback } from "react";
import { Virtuoso } from 'react-virtuoso'; // 1. Import Virtuoso

export default function List() {
    const [taskData, setTaskData] = useState([]); // Initialize as empty array
    const [selectedTask, setSelectedTask] = useState([]);
    const [hasMore, setHasMore] = useState(true); // Track if DB has more data
    const [page, setPage] = useState(0); // Track current page
    
    // We use a ref to prevent double-fetching in React 18 strict mode
    const isFetching = useRef(false);

    // 2. Modified getListData to accept page number
    const getListData = useCallback(async (pageNo) => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            // Pass page and limit to your API
            let response = await fetch(`http://localhost:3300/tasks?page=${pageNo}&limit=20`, {
                credentials: 'include'
            });
            let data = await response.json();

            if (data.success) {
                setTaskData(prev => {
                    // If page 0, replace data. If > 0, append data.
                    return pageNo === 0 ? data.result : [...prev, ...data.result];
                });

                // If we got fewer items than requested, we reached the end
                if (data.result.length < 20) {
                    setHasMore(false);
                }
                
                setPage(pageNo);
            } else {
                alert('Try after Sometime');
            }
        } catch (e) {
            console.error(e);
        } finally {
            isFetching.current = false;
        }
    }, []);

    // Initial Load
    useEffect(() => {
        getListData(0);
    }, [getListData]);

    // 3. The function Virtuoso calls when user scrolls to bottom
    const loadMore = () => {
        if (hasMore && !isFetching.current) {
            getListData(page + 1);
        }
    };

    const deleteTask = async (id) => {
        let item = await fetch('http://localhost:3300/delete/' + id, {
            method: 'delete',
            credentials: 'include',
        });
        item = await item.json();

        if (item.success) {
            // Optimistic update: Remove from local state immediately instead of refetching
            setTaskData(prev => prev.filter(task => task._id !== id));
        } else {
            alert('Try after Sometime');
        }
    }

    const selectSingleItem = (id) => {
        if (selectedTask.includes(id)) {
            let items = selectedTask.filter((item) => item !== id);
            setSelectedTask(items);
        } else {
            setSelectedTask([...selectedTask, id]);
        }
    }

    const selectAll = (event) => {
        if (event.target.checked) {
            // Note: This selects ONLY loaded tasks
            let items = taskData.map((item) => item._id);
            setSelectedTask(items);
        } else {
            setSelectedTask([]);
        }
    }

    const deleteMultiple = async () => {
        let item = await fetch('http://localhost:3300/delete-multiple', {
            method: 'delete',
            body: JSON.stringify(selectedTask),
            credentials: 'include',
            headers: { 'Content-Type': 'Application/Json' }
        });
        item = await item.json();

        if (item.success) {
             // Remove all deleted IDs from local state
             setTaskData(prev => prev.filter(task => !selectedTask.includes(task._id)));
             setSelectedTask([]);
        } else {
            alert('Try after Sometime');
        }
    }

    // 4. Row Renderer for Virtuoso
    // We group your <li> cells into one container per row
    const renderRow = (index, item) => {
        return (
            <div className="virtual-row" >
                {/* I assumed flex layout here, see CSS note below */}
                <div className="list-item"><input onChange={() => selectSingleItem(item._id)} checked={selectedTask.includes(item._id)} type='checkbox' /></div>
                <div className="list-item">{index + 1}</div>
                <div className="list-item">{item.title}</div>
                <div className="list-item">{item.description}</div>
                <div className="list-item">
                    <button onClick={() => deleteTask(item._id)} className='delete-item'>Delete</button>
                    <Link to={"update/" + item._id} className='update-item'>Update</Link>
                </div>
            </div>
        );
    };

    return (
        <div className='list-container'>
            <h1> To Do List</h1>
            <button onClick={deleteMultiple} className='delete-item delete-multiple'>Delete</button>
            
            {/* Header stays OUTSIDE the scrollable area so it stays sticky at top */}
            <div className="list-header-row" style={{ display: 'flex', fontWeight: 'bold' }}>
                <div className="list-header"><input onChange={selectAll} type='checkbox' /></div>
                <div className="list-header">S.No</div>
                <div className="list-header">Title</div>
                <div className="list-header">Description</div>
                <div className="list-header">Action</div>
            </div>

            {/* 5. The Virtualized List */}
            {/* Height is mandatory for virtualization */}
            <Virtuoso
                style={{ height: '400px', width: '100%' }} 
                data={taskData}
                endReached={loadMore}
                itemContent={renderRow}
                useWindowScroll={false} // Set to true if you want the whole page to scroll
            />
        </div>
    )
}