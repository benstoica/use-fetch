import { Link, Route, Routes, useLocation } from "react-router-dom";
import UseFetchExample from "./use-fetch/use-fetch.example";

const examples = [
  {
    name: "use-fetch",
    path: "/use-fetch-example",
    component: UseFetchExample,
  },
];

function ExampleLinks() {
  return (
    <>
      <h1>Examples:</h1>
      <ul>
        {examples.map((item) => (
          <li key={item.name}>
            <Link to={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <main className="container" style={{ marginTop: "2rem" }}>
      <div className="navigation">
        {location.pathname !== "/" ? (
          <Link to="/">⬅️ Back to Examples</Link>
        ) : null}
      </div>
      <Routes>
        <Route path="/" element={<ExampleLinks />} />
        {examples.map((item) => (
          <Route key={item.path} path={item.path} Component={item.component} />
        ))}
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </main>
  );
}
