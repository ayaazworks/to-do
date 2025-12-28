import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import "./style/app.css"
import AddTask from './components/AddTask'
import List from './List'
import UpdateTask from './components/UpdateTask'
import SignUp from './components/SignUp'
import Login from './components/Login'
import Protected from './components/Protected'

function App() {

  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={
          <Protected>
            <List />
          </Protected>
        } />
        
        <Route path='/add' element={<Protected><AddTask /></Protected>} />
        <Route path='/update/:id' element={<UpdateTask />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </>
  )
}

export default App
