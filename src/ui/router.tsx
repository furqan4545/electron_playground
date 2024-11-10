// import { createBrowserRouter } from "react-router-dom";
// import ScreenRecorder from "./components/ScreenRecorder";
// import SelectorWindow from "./components/SelectorWindow";

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <ScreenRecorder />,
//   },
//   {
//     path: "/selector",
//     element: <SelectorWindow />,
//   },
// ]);

import { createHashRouter } from "react-router-dom"; // Use HashRouter instead of BrowserRouter
import ScreenRecorder from "./components/ScreenRecorder";
import SelectorWindow from "./components/SelectorWindow";
import CameraWindow from "./components/CameraWindow";

export const router = createHashRouter([
  {
    path: "/",
    element: <ScreenRecorder />,
  },
  {
    path: "/selector",
    element: <SelectorWindow />,
  },
  {
    path: "/camera",
    element: <CameraWindow />,
  },
]);
