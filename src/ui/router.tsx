import { createBrowserRouter } from "react-router-dom";
import ScreenRecorder from "./components/ScreenRecorder";
import SelectorWindow from "./components/SelectorWindow";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ScreenRecorder />,
  },
  {
    path: "/selector",
    element: <SelectorWindow />,
  },
]);
