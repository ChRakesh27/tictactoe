import React, { useState, useEffect, useRef } from "react";
import './game.css'
import { socket } from "./App";

const obj = { "1": '-', "2": '-', "3": '-', "4": '-', "5": '-', "6": '-', "7": '-', "8": '-', "9": '-' }
const arr = Object.keys(obj)
function Game(props) {
    let [btnList, setBtnListState] = useState(obj)
    let [btnVal, setBtnValState] = useState('-')
    let [isGameOver, setIsGameOver] = useState(false)
    let [message, setMessageState] = useState('Wait for opponent player')
    const overlayElement = useRef(null)

    useEffect(() => {
        if (props.isHost) {
            setBtnValState("X")
            overlayElement.current.style.display = "none"
        } else {
            setBtnValState("O")
        }
        socket.on("playAgin", (data) => {
            console.log("game over", data)
            setMessageState("You loss the game")
            setMessageState("You Won the game")
            overlayElement.current.style.display = "block"
        })
        socket.on("PressBtn", (data) => {
            const { btnNo, btnVal } = data;
            setBtnListState((oldbtnList) => ({ ...oldbtnList, [btnNo]: btnVal }))
            overlayElement.current.style.display = "none"
        })
    }, [props.isHost])

    useEffect(() => {
        if (btnVal !== '-') {
            if ((btnList["1"] === btnVal && btnList["1"] === btnList["2"] && btnList["2"] === btnList["3"]) ||
                (btnList["4"] === btnVal && btnList["4"] === btnList["5"] && btnList["6"] === btnList["5"]) ||
                (btnList["7"] === btnVal && btnList["7"] === btnList["8"] && btnList["9"] === btnList["8"]) ||
                (btnList["1"] === btnVal && btnList["1"] === btnList["4"] && btnList["7"] === btnList["1"]) ||
                (btnList["2"] === btnVal && btnList["2"] === btnList["5"] && btnList["8"] === btnList["5"]) ||
                (btnList["3"] === btnVal && btnList["3"] === btnList["6"] && btnList["9"] === btnList["3"]) ||
                (btnList["1"] === btnVal && btnList["1"] === btnList["5"] && btnList["9"] === btnList["5"]) ||
                (btnList["3"] === btnVal && btnList["3"] === btnList["5"] && btnList["7"] === btnList["3"])) {
                setIsGameOver(true)
                setMessageState("You Won the game")
                overlayElement.current.style.display = "block";
                socket.emit("game_over", { roomId: props.roomId })
            } else if (!Object.values(btnList).some(o => o === '-')) {
                setIsGameOver(true)
                setMessageState("game draw")
                overlayElement.current.style.display = "block"
            }

        }
    }, [btnList, btnVal, props.roomId])



    function btnClick(event) {
        const btnNo = event.target.id;
        setBtnListState((oldbtnList) => ({ ...oldbtnList, [btnNo]: btnVal }))
        socket.emit("btnSet", { roomId: props.roomId, btnNo, btnVal });
        overlayElement.current.style.display = "block";
    }

    function isDisableBtn(btnNo) {
        return btnList[btnNo] !== "-"
    };
    function reset() {
        setBtnListState(obj);
        setIsGameOver(false);
        setMessageState("Wait for opponent player")
    }

    return <>
        <div className="overlay" ref={overlayElement}>
            <div className="d-flex">
                <h1>{message}</h1>
                {
                    isGameOver && (<>
                        <button onClick={reset}>- Play Agin -</button>
                        <button onClick={props.exitRoom}>- Exit -</button>
                    </>)
                }
            </div>
        </div>
        <div className="grid-container">
            {
                arr.map((element) => {
                    return <button className="grid-item" id={element} key={element} onClick={btnClick} disabled={isDisableBtn(element)}>{btnList[element]}</button>
                })
            }
        </div>
    </>

}

export default Game;