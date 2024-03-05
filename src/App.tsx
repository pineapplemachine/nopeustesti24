import {useEffect, useState} from "react";
import styled from "styled-components";
import {XorShift} from "xorshift";

import "./App.css";

const AppHeader = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
`;

const AppFooter = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
`;

const AppNewGameButton = styled.button`
    box-sizing: border-box;
    border-width: 0;
    border-radius: 8px;
    font-size: 18px;
    padding: 8px 16px;
    background-color: #464646;
    border-color: #404040;
    margin-bottom: 16px;
    &:hover {
        border-color: #fff;
        border-style: solid;
        border-bottom-width: 2px;
    }
    &:active {
        border-bottom-width: 0;
        background-color: #000;
    }
`;

// Time in milliseconds between buttons lighting up, when the game starts
const SequenceLightIndexStepSlowest = 2000;

// Fastest time in milliseconds between buttons lighting up
const SequenceLightIndexStepFastest = 220;

// Difference in milliseconds between fastest and slowest times
const SequenceLightIndexStepDelta = (
    SequenceLightIndexStepSlowest -
    SequenceLightIndexStepFastest
);

// Number of presses from start of the game before the fastest time
const SequenceLightLength = 200;

function getSequenceLightIndexTime(index: number) {
    const t = ((Math.sin(index / SequenceLightLength * Math.PI) + 1) / 2);
    if(t <= 0) {
        return SequenceLightIndexStepSlowest;
    }
    else if(t >= 1) {
        return SequenceLightIndexStepFastest;
    }
    else {
        return SequenceLightIndexStepSlowest - t * SequenceLightIndexStepDelta;
    }
}

function getSequenceLightIndexTimes(): number[] {
    const times = [];
    let accTime = 0;
    for(let i = 0; i < SequenceLightLength; i++) {
        const indexTime = getSequenceLightIndexTime(i);
        accTime += indexTime;
        times.push(accTime);
    }
    return times;
}

// Take the elapsed game time, translate this into an index in
// the button sequence.
function getSequenceLightIndex(times: number[], elapsedTime: number) {
    const lastTime = times[times.length - 1];
    if(elapsedTime >= lastTime) {
        const steps = Math.floor(
            (elapsedTime - lastTime) /
            SequenceLightIndexStepFastest
        );
        return times.length + steps;
    }
    // TODO: This could be optimized
    // 1. By using a binary search
    // 2. By being better at math and solving an integral equation
    // instead of putting all the times in an array like this
    for(let i = 0; i < times.length; i++) {
        if(elapsedTime < times[i]) {
            return i;
        }
    }
    return times.length;
}

function getPrng(seed: number) {
    return new XorShift([
        (seed | 0),
        0x12340123,
        0xf8e7d6c5 ^ (seed | 0),
        0xc00200f0,
    ]);
}

function getFirstSequenceLight(prng: XorShift) {
    return (prng.randomint()[0] >>> 0) % 4;
}

function getNextSequenceLight(prng: XorShift, previous: number) {
    const random = (prng.randomint()[0] >>> 0) % 3;
    if(random >= previous) {
        return random + 1;
    }
    else {
        return random;
    }
}

function App() {
    // console.log("Render!");
    const renderTimeMs = new Date().getTime();
    // True when game is actively being played, false otherwise
    const [gameActive, setGameActive] = useState<boolean>(false);
    // Seeded random number generator
    const [prng, setPrng] = useState<Xorshift>(() => getPrng(renderTimeMs));
    // Player's current score
    const [score, setScore] = useState<number>(0);
    // Timestamp when the current game started
    const [gameStartTime, setGameStartTime] = useState<number>(renderTimeMs);
    // Current timestamp
    const [currentTime, setCurrentTime] = useState<number>(renderTimeMs);
    // Set to a button index after pressing an incorrect button
    const [wrongButtonIndex, setWrongButtonIndex] = useState<number>(-1);
    // Whether the currently lit button was already pressed
    const [pressedLastButton, setPressedLastButton] = useState<boolean>(false);
    // Remaining lit but unpressed buttons in sequence
    const [sequence, setSequence] = useState<number[]>([]);
    // Elapsed times with accelerating intervals to light next button
    const [sequenceTimes, setSequenceTimes] = useState<number[]>(
        () => getSequenceLightIndexTimes()
    );
    // Current index in sequence of lit buttons
    const [sequenceIndex, setSequenceIndex] = useState<number>(0);
    // Time elapsed since game start
    const renderElapsedTimeMs = renderTimeMs - gameStartTime;
    // Re-render every frame, I hope?
    useEffect(() => {
        let animate: boolean = true;
        function animationFrameCallback() {
            setCurrentTime(new Date().getTime());
            if(animate) {
                requestAnimationFrame(animationFrameCallback);
            }
        }
        const frameRequest = requestAnimationFrame(
            animationFrameCallback
        );
        return () => {
            cancelAnimationFrame(frameRequest);
            animate = false;
        };
    }, []);
    // Helper function to light a new button
    function lightNextButton() {
        const buttonIndex: number = (
            sequence.length ?
            getNextSequenceLight(prng, sequence[sequence.length - 1]) :
            getFirstSequenceLight(prng)
        );
        if(pressedLastButton) {
            setSequence([buttonIndex]);
        }
        else {
            setSequence([...sequence, buttonIndex]);
        }
        setSequenceIndex(1 + sequenceIndex);
        setPressedLastButton(false);
    }
    // Helper function to start a new game
    function initNewGame() {
        console.log("initNewGame");
        const newGameTimeMs = new Date().getTime();
        setGameActive(true);
        setPrng(getPrng(newGameTimeMs));
        setScore(0);
        setGameStartTime(newGameTimeMs);
        setWrongButtonIndex(-1);
        setPressedLastButton(false);
        setSequence([]);
        setSequenceIndex(0);
        // toast?
    }
    // Helper function to represent a loss
    function loseGame() {
        console.log("loseGame");
        // todo
        // toast?
        setGameActive(false);
        setPressedLastButton(false);
        setSequence([]);
        setSequenceIndex(0);
    }
    // Event handler when a button is clicked
    function onButtonClick(buttonIndex: number) {
        console.log("onButtonClick", buttonIndex);
        // No game currently active? Start a new one
        if(!gameActive) {
            initNewGame();
        }
        // If for some reason no button was lit yet, disregard
        if(sequence.length <= 0) {
            return;
        }
        // Check if this button is next in the sequence
        else if(buttonIndex === sequence[0]) {
            if(pressedLastButton) {
                // Do nothing, already pressed this button
            }
            else {
                if(sequence.length > 1) {
                    setSequence(sequence.slice(1));
                }
                else {
                    setPressedLastButton(true);
                }
                setScore(1 + score);
            }
        }
        // Otherwise, loss
        else {
            setWrongButtonIndex(buttonIndex);
            loseGame();
        }
    }
    // Game logic, should occur each frame
    if(gameActive) {
        // Just started? Light a button
        if(!sequence.length) {
            lightNextButton();
        }
        // Many buttons behind? Lose the game
        else if(sequence.length >= 20) {
            loseGame();
        }
        // Check if it's time to light a new button
        else {
            const index = getSequenceLightIndex(
                sequenceTimes,
                renderElapsedTimeMs,
            );
            if(index > sequenceIndex) {
                lightNextButton();
            }
        }
    }
    // Get currently lit button, or -1 for no button
    const lightButton = (
        gameActive && sequence.length ?
        sequence[sequence.length - 1] :
        -1
    );
    // Helper to get button className
    function getButtonClassName(buttonIndex) {
        const classNames: string[] = ["game-button"];
        if(buttonIndex === lightButton) {
            classNames.push("on");
        }
        else if(buttonIndex === wrongButtonIndex) {
            classNames.push("lose");
        }
        return classNames.join(" ");
    }
    return (
        <div className={gameActive ? "active": ""}>
            <AppHeader>
                <h1>Nopeustesti</h1>
            </AppHeader>
            <div className="game-score-container">
                <span className="text">Score:</span>
                <span className="count" id="game-score">{score}</span>
            </div>
            <div className="game-buttons-container">
                <button
                    id="game-button-0"
                    className={getButtonClassName(0)}
                    onClick={() => onButtonClick(0)}>
                    <div className="glow"></div>
                </button>
                <button
                    id="game-button-1"
                    className={getButtonClassName(1)}
                    onClick={() => onButtonClick(1)}>
                    <div className="glow"></div>
                </button>
                <button
                    id="game-button-2"
                    className={getButtonClassName(2)}
                    onClick={() => onButtonClick(2)}>
                    <div className="glow"></div>
                </button>
                <button
                    id="game-button-3"
                    className={getButtonClassName(3)}
                    onClick={() => onButtonClick(3)}>
                    <div className="glow"></div>
                </button>
            </div>
            <AppFooter>
                <AppNewGameButton
                    id="new-game-button"
                    onClick={initNewGame}>
                    New Game
                </AppNewGameButton>
            </AppFooter>
        </div>
    );
}

export default App;
