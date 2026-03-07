import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./pages/Home";
import Essays from "./pages/Essays";
import BookReviews from "./pages/BookReviews";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "essays", Component: Essays },
      { path: "book-reviews", Component: BookReviews },
      { path: "*", Component: NotFound },
    ],
  },
]);
