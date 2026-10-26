// import react from "react";
// import { useRef } from "react";
// function myfunction() {
//   const box = useRef(0);
//   const update = () => {
//     box.current =1000;
//     console.log("update", box.current);
//   };
//   return (
//     <div>
//       <button onClick={update}>Update</button>
//       </div>
//   )
// }
// export default myfunction;

import react from "react";
import {useContext,createContext} from "react";

function mycontext() {
  const myname= createContext('arjun');
  const value= useContext(myname);
  return (
    <div>
      <h1>value from context: {value}</h1>
    </div>
  )
}
export default mycontext;