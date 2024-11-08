// import { useState } from "react";

// // import "./App.css";

// function App() {
//   const [count, setCount] = useState(0);

//   return (
//     <>
//       <h1 className="text-4xl font-bold mb-6 text-center">Vite + React</h1>
//       <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//         <button
//           className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           count is {count}
//         </button>
//         <p className="mt-4 text-gray-600">
//           Edit <code className="bg-gray-100 px-1 rounded">src/App.tsx</code> and
//           save to test HMR
//         </p>
//       </div>
//       <p className="mt-6 text-center text-gray-500">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   );
// }

// export default App;

import { RouterProvider } from "react-router-dom";
import { router } from "./router";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
