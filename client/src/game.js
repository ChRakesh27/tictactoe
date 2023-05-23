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
    const [overlayElement, setOverlayElement] = useState('none')

    useEffect(() => {
        if (props.isHost) {
            setBtnValState("X")
            setOverlayElement("none")
        } else {
            setBtnValState("O")
        }

        socket.on("checkGame", (data) => {
            setMessageState("You loss the game")
            setIsGameOver(true)
            setOverlayElement("block")
        })
        socket.on("PressBtn", (data) => {
            const { btnNo, btnVal } = data;
            setBtnListState((oldbtnList) => ({ ...oldbtnList, [btnNo]: btnVal }))
            setOverlayElement("none")
        })

        // socket.on("check_play_agin", () => {
        //     if (message === "Wait for Host Reply") {
        //         setMessageState("Wait for opponent player")
        //     }
        //     else {
        //         setMessageState("opponent want to play agin")
        //     }

        // })

    }, [props.isHost])

    useEffect(() => {
        console.log("---->", overlayElement.current, overlayElement)
    }, [overlayElement])


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
                setOverlayElement("block");
                socket.emit("game_over", { roomId: props.roomId })
            } else if (!Object.values(btnList).some(o => o === '-')) {
                setIsGameOver(true)
                setMessageState("game draw")
                setOverlayElement("block")
            }

        }
    }, [btnList, btnVal, props.roomId])



    function btnClick(event) {
        const btnNo = event.target.id;
        setBtnListState((oldbtnList) => ({ ...oldbtnList, [btnNo]: btnVal }))
        socket.emit("btnSet", { roomId: props.roomId, btnNo, btnVal });
        setMessageState("Wait for opponent player")
        setOverlayElement("block");
    }

    function isDisableBtn(btnNo) {
        return btnList[btnNo] !== "-"
    };
    // function reset() {
    //     setBtnListState(obj);
    //     if (props.isHost) {
    //         if (message === "opponent want to play agin") {
    //             setOverlayElement('none')
    //         } else {
    //             setMessageState("Wait for Opponent Reply")

    //         }
    //     } else {
    //         if (message === "opponent want to play agin") {
    //             setMessageState("Wait for opponent player")

    //         } else {
    //             setMessageState("Wait for Host Reply")
    //         }
    //     }
    //     setIsGameOver(false)
    //     socket.emit("play_agin", { roomId: props.roomId, isHost: props.isHost })

    // }

    return <>
        <div className="overlay" style={{ display: overlayElement }}>
            <div className="d-flex">
                <h1>{message}</h1>
                {
                    isGameOver && (<>
                        {/* <button onClick={reset}>- Play Agin -</button> */}
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