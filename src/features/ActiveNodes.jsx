import { useEffect, useState } from "react";
import { api } from "../api/netrumApi";
import Skeleton from "../components/Skeleton";

export default function ActiveNodes({ onSelect }) {
  const [nodes, setNodes] = useState(null); 
  const [error, setError] = useState(false);

  useEffect(() => {
    api.activeNodes()
      .then((r) => {
        if (Array.isArray(r) && r.length > 0) {
          setNodes(r);
          setError(false);
        } else {
          setNodes([]);
          setError(true);
        }
      })
      .catch(() => {
        setNodes([]);
        setError(true);
      });
  }, []);

  if (nodes === null) return <Skeleton />;
  if (error) return <div className="text-red-400 text-sm">Will be upgraded soon</div>;

  return (
    <ul className="space-y-1 text-xs">
      {nodes.slice(0, 5).map((n) => (
        <li
          key={n}
          className="cursor-pointer hover:text-indigo-400"
          onClick={() => onSelect?.(n)}
        >
          {n}
        </li>
      ))}
    </ul>
  );
}
