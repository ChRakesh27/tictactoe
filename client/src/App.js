import './App.css';
import Game from './game';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// export const socket = io.connect("http://localhost:5000/")
export const socket = io.connect("https://tictacteo.onrender.com")
function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false)
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false)
  const [startBtn, setStartBtn] = useState(false)
  const [isGameOn, setIsGameOn] = useState(false);

  useEffect(() => {
    socket.on("exit", () => {
      setIsJoined(false)
      setIsHost(false)
      setIsGameOn(false)
      setStartBtn(false)
      setRoomId('')
      setUsername('')
    })
    socket.on("pause", () => {
      setIsGameOn(false)
      setStartBtn(false)
    })
    socket.on("create_successful", (data) => {
      setIsHost(true)
      setIsJoined(true)
      setRoomId(data.roomId)
    })
    socket.on("join_successfully", () => {
      setIsJoined(true)
    })
    socket.on("enable_start_btn", () => {
      setStartBtn(true)
    })
    socket.on("game_started", () => {
      setIsGameOn(true)
    })
  }, [])


  function CreateRoom() {
    socket.emit("create_room", { username });
  }

  function joinRoom() {
    socket.emit("join_room", { roomId, username })
  }

  function exitRoom() {
    socket.emit("exit_room", { roomId, isHost });
  }

  function startGame() {
    socket.emit("start_game", roomId)
  }

  return (

    <div className="App">
      {
        !isJoined && <>
          <h2>UserName:</h2>
          <input type='text' placeholder='username' value={username} onChange={(e) => setUsername(e.target.value)}></input>
          <br></br>
          <input type='text' placeholder='roomId' value={roomId} onChange={(e) => setRoomId(e.target.value)}></input>
          <button onClick={joinRoom}>join</button><br></br><br></br>
          <button onClick={CreateRoom}>Create</button><br></br><br></br>
        </>
      }
      {
        isJoined && (
          <><h1>!! Welcome {username} {roomId}!!</h1>
            {
              isHost && !isGameOn && startBtn && <><button onClick={startGame}>Start Game</button><br></br><br></br></>
            }
            {
              isGameOn && (<>
                <Game roomId={roomId} isHost={isHost} exitRoom={exitRoom} ></Game>
              </>)

            }
            <button onClick={exitRoom}>exit</button><br></br><br></br>
          </>
        )
      }




    </div>
  );
}
export default App;