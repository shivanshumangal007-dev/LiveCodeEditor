import React, { useEffect, useMemo, useRef, useState } from "react";
import "./app.css";
import { Editor } from "@monaco-editor/react";
import {MonacoBinding} from 'y-monaco'
import * as Y from 'yjs'
import {SocketIOProvider} from "y-socket.io"


const App = () => {
  const editorRef = useRef(null);
  const yDoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => yDoc.getText('monaco'), [yDoc]);

  const [username, setUsername] = useState(() => {
    const savedUsername = window.localStorage.getItem('username');
    return savedUsername || '';
  });

  const [users, setUsers] = useState([])
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handlemount = (editor) => {
		editorRef.current = editor;
		setIsEditorReady(true);
  };
  useEffect(() => {
		if (!username || !isEditorReady) return;

		const provider = new SocketIOProvider(
			"http://localhost:3000",
			"monaco-demo",
			yDoc,
			{ autoConnect: true },
		);

		provider.awareness.setLocalStateField("user", { username });

		provider.awareness.on("change", () => {
			const states = Array.from(provider.awareness.getStates().values());

			setUsers(
				states
					.filter((state) => state.user && state.user.username)
					.map((state) => state.user),
			);
		});

		function handleBeforeUnload() {
			provider.awareness.setLocalStateField("user", null);
		}

		window.addEventListener("beforeunload", handleBeforeUnload);

		const monacoBinding = new MonacoBinding(
			yText,
			editorRef.current.getModel(),
			new Set([editorRef.current]),
			provider.awareness,
		);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			provider.disconnect();
			monacoBinding.destroy();
		};
  }, [username, isEditorReady]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setUsername(e.target[0].value);
    window.localStorage.setItem('username', e.target[0].value);
  }
  if(!username) {
    return(
      <main className="h-screen w-full bg-zinc-900 flex gap-2 p-2 items-center justify-center">
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <input type="text" placeholder="Enter your username" className="p-2 rounded-md text-white"/>
          <button className="p-2 rounded-md bg-blue-500 text-white">Join</button>
        </form>
      </main>
    )
  }
	return (
		<main className='h-screen w-full bg-zinc-900 flex gap-2 p-2'>
			<aside className='w-1/6 bg-zinc-400 rounded-md'>
				<h2 className='text-xl font-bold p-2'>Users</h2>
				{users.map((user, index) => (
          <div key={index} className='p-2 border-t border-zinc-300'>
            {user.username}
          </div>
        ))}
			</aside>
			<section className='w-5/6 bg-zinc-800 rounded-md overflow-hidden'>
				<Editor
					height='100%'
					language='javascript'
					theme='vs-dark'
					onMount={handlemount}
				/>
			</section>
		</main>
	);
};

export default App;
