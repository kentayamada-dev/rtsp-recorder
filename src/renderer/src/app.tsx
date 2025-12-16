import { useState } from "react";
import { HelloWorld } from "@renderer/components/helloWorld";

export const App = () => {
  const [count, setCount] = useState(0);
  const ipcHandle = () => window.api.invoke("ping");

  return (
    <>
      <HelloWorld text="Hello World" />
      <button onClick={() => setCount((prev) => prev + 1)}>{count}</button>
      <button onClick={ipcHandle}>Send IPC</button>
      <a
        href="https://github.com/kentayamada-dev/rtsp-recorder"
        target="_blank"
        rel="noreferrer"
      >
        RTSP Recorder
      </a>
    </>
  );
};
