import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useUserId } from '../context/userContext';
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

function GameStart({ match, players, history, }) {
  const [userId] = useUserId();
  const [lobbyId] = useState(match.params.id)
  const [lobbiesRef] = useState(db.ref(`/lobbies/${lobbyId}`));
  const [minPlayers] = useState(2)
  const [isHost, setIsHost] = useState(false)


  useEffect(() => {
    function listenOnLobby() {
      try {
        lobbiesRef.child('status').once('value').then(function (snapshot) {
          if (snapshot.val() === 'started') {
            history.push(`/gamesession/${lobbyId}`);
          }
        })
      } catch (e) {
        console.error('Error in GameStart lobby listener', e.message)
      }
    }
    function checkIfHost() {
      const currentPlayer = players.find(player => player[0] === userId)
      if (currentPlayer[1].host) {
        setIsHost(true)
      }
    }
    listenOnLobby()
    checkIfHost()
  }, [lobbiesRef, players, userId, history, lobbyId])

  async function createGameSession() {
    // checks for min players to start game
    if (players.length >= minPlayers) {
      try {
        // creates a game session by transferring lobby members data over
        players.forEach(player => {
          const [playerId, playerProps] = player;
          db.ref(`/gameSessions/${lobbyId}/players`).child(`${playerId}`).set(playerProps)
        })
        // set lobby status from pending to started so component will render redirect to game session from the lobby listener
        lobbiesRef.update({ 'status': 'started' });
      } catch (e) {
        console.error('Error in createGameSession', e.message)
      }
    } else {
      alert(`${minPlayers - players.length} more players required to start a game`)
    }
  }

  return (
    <Container>
      {isHost ? <Button variant="dark" onClick={createGameSession}>Start Game</Button> :
        <Container>
          <Button variant="dark" disabled>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
    Waiting for host...
  </Button>
          <Spinner animation="border" role="status" >Waiting for host...</Spinner>
        </Container>}
    </Container>
  )
}

export default GameStart