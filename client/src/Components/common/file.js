import { useNavigate } from 'react-router-dom'

function files(props) 
{  
    let navigate = useNavigate(); 
    const routeChange = () =>{ 
        let path = `newPath`; 
        navigate(path);
    } 
  
    return(
        <button onClick={routeChange}> Show file</button>
    )
}

export default files;