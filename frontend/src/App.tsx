import './App.css'
import TaskList from './TaskList'
import AddTask from './TaskAdd'

function App() {
  return (
        <div> 
            <h2>新しいタスクを追加</h2>
            <AddTask />
            <TaskList/>
        </div>         
 
  )
}

export default App
