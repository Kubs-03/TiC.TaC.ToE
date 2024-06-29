document.addEventListener('DOMContentLoaded', () => {
    
    let currentPlayer = 'X';
    let gameActive = true;
    let playWithPC = false;
    const cells = document.querySelectorAll('.cell');
    const currentPlayerDisplay = document.getElementById('currentPlayer');
    const winnerDisplay = document.getElementById('winnerDisplay');
    const playAgainButton = document.getElementById('playAgain');
    const playWithPCButton = document.getElementById('playWithPC');
    const winnerAudio = document.getElementById('winnerAudio');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownElement = document.getElementById('countdown');
    const soundControlButton = document.getElementById('soundControl');
    const soundIcon = document.getElementById('soundIcon');
    const backgroundMusic = document.getElementById('backgroundMusic')

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    
      // Set initial state of sound icon
    soundIcon.src = 'soundoff.png';

    // Ensure background music starts playing on load
    backgroundMusic.play();

    // Sound Control
    let isSoundOn = false; // Initially sound is off

    soundControlButton.addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        if (isSoundOn) {
            soundIcon.src = 'soundplay.png';
            backgroundMusic.play();
        } else {
            soundIcon.src = 'soundoff.png';
            backgroundMusic.pause();
        }
    });
   
    const updatePlayerDisplay = () => {
        currentPlayerDisplay.textContent = playWithPC && currentPlayer === 'O' ? 'PC (O)' : currentPlayer === 'X' ? 'Player 1 (X)' : 'Player 2 (O)';
    };

    const handleCellPlayed = (cell) => {
        cell.innerHTML = currentPlayer;
        cell.setAttribute('data-player', currentPlayer);
        cell.style.backgroundColor = currentPlayer === 'X' ? 'bisque' : 'rgb(236, 188, 129)';
    };

    const handlePlayerChange = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updatePlayerDisplay();
    };

    const displayWinner = (winner) => {
        setTimeout(() => {
            if (winner === 'Draw') {
                winnerDisplay.textContent = "It's a Draw!";
                winnerAudio.play();
            } else {
                winnerDisplay.textContent = playWithPC && winner === 'O' ? 'PC Wins!' : `Player ${winner === 'X' ? '1 (X)' : '2 (O)'} Wins!`;
                winnerAudio.play();
            }
            winnerDisplay.classList.add('show');
            console.log('Winner Display: ', winnerDisplay.textContent); winnerAudio.play();
        }, 100);
    };

    const checkWinner = () => {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = cells[winCondition[0]].getAttribute('data-player');
            const b = cells[winCondition[1]].getAttribute('data-player');
            const c = cells[winCondition[2]].getAttribute('data-player');
            if (a && a === b && a === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            gameActive = false;
            displayWinner(currentPlayer);
            return;
        }

        if ([...cells].every(cell => cell.getAttribute('data-player') !== null)) {
            gameActive = false;
            displayWinner('Draw');
        }
    };

    const handleCellClick = (event) => {
        const cell = event.target;

        if (cell.getAttribute('data-player') || !gameActive) {
            return;
        }

        handleCellPlayed(cell);
        checkWinner();
        if (gameActive) {
            handlePlayerChange();
            if (playWithPC && currentPlayer === 'O') {
                setTimeout(pcPlay, 500);
            }
        }
    };

    const pcPlay = () => {
        const bestMove = getBestMove();
        if (bestMove !== null) {
            handleCellPlayed(cells[bestMove]);
            checkWinner();
            if (gameActive) {
                handlePlayerChange();
            }
        }
    };

    const getBestMove = () => {
        let bestMove = null;
        let bestValue = -Infinity;
        for (let i = 0; i < cells.length; i++) {
            if (!cells[i].getAttribute('data-player')) {
                cells[i].setAttribute('data-player', 'O');
                const moveValue = minimax(false);
                cells[i].removeAttribute('data-player');
                if (moveValue > bestValue) {
                    bestValue = moveValue;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    };

    const minimax = (isMaximizing) => {
        let winner = checkWinnerMinimax();
        if (winner === 'O') return 1;
        if (winner === 'X') return -1;
        if (winner === 'Draw') return 0;

        if (isMaximizing) {
            let bestValue = -Infinity;
            for (let i = 0; i < cells.length; i++) {
                if (!cells[i].getAttribute('data-player')) {
                    cells[i].setAttribute('data-player', 'O');
                    const moveValue = minimax(false);
                    cells[i].removeAttribute('data-player');
                    bestValue = Math.max(bestValue, moveValue);
                }
            }
            return bestValue;
        } else {
            let bestValue = Infinity;
            for (let i = 0; i < cells.length; i++) {
                if (!cells[i].getAttribute('data-player')) {
                    cells[i].setAttribute('data-player', 'X');
                    const moveValue = minimax(true);
                    cells[i].removeAttribute('data-player');
                    bestValue = Math.min(bestValue, moveValue);
                }
            }
            return bestValue;
        }
    };

    const checkWinnerMinimax = () => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const cellsArray = [...cells];
            if (cellsArray[a].getAttribute('data-player') && 
                cellsArray[a].getAttribute('data-player') === cellsArray[b].getAttribute('data-player') && 
                cellsArray[a].getAttribute('data-player') === cellsArray[c].getAttribute('data-player')) {
                return cellsArray[a].getAttribute('data-player');
            }
        }
        if ([...cells].every(cell => cell.getAttribute('data-player') !== null)) {
            return 'Draw';
        }
        return null;
    };

    const resetGame = () => {
        currentPlayer = 'X';
        gameActive = true;
        playWithPC = false;
        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.removeAttribute('data-player');
            cell.style.backgroundColor = ' rgb(235, 235, 183';
        });
        winnerDisplay.textContent = '';
        winnerDisplay.classList.remove('show');
        updatePlayerDisplay();
    };

    const startGameWithPC = () => {
        resetGame();
        playWithPC = true;
        updatePlayerDisplay();

        // Display countdown overlay
        countdownDisplay.style.display = 'flex'; 

        let count = 3;
        countdownElement.textContent = count.toString();
        const countdownInterval = setInterval(() => {
            count--;
            countdownElement.textContent = count.toString();
            if (count === 0) {
                clearInterval(countdownInterval);
                countdownDisplay.style.display = 'none'; 
                if (playWithPC && currentPlayer === 'O') {
                    setTimeout(pcPlay, 500);
                }
            }
        }, 1000);
    };

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    playAgainButton.addEventListener('click', resetGame);
    playWithPCButton.addEventListener('click', startGameWithPC);
    updatePlayerDisplay();
});
