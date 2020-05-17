import React, { useState } from 'react';
import { db } from '../firebase';
import { useObject } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import { NavigationBar } from './index'
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: darkslateblue;
`;

function HomePage(props) {
  return (
    <div>
      <LobbyForm {...props} />
    </div>
  );
}

function LobbyForm({ history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [usersRef] = useState(db.ref().child('users'));
  const [lobbyName, setLobbyName] = useState('');
  const [userId] = useUserId();
  const [userSnap, userLoading] = useObject(usersRef.child(userId));

  async function checkIfAlreadyInALobby() {
    // await db.ref().child('users').child(userId);
    // .set({ signedIn: true })
    console.log(userSnap.val().inLobby)
  }

  async function createLobby() {
    try {
      const lobbySnap = await lobbiesRef.push({
        name: lobbyName,
        status: "pending",
        players: { [userSnap.key]: { ...userSnap.val(), host: true } },
      });
      await db.ref().child('users').child(userId).update({ ...userSnap.val, inLobby: true })
      setLobbyName('');
      history.push(`/lobbies/${lobbySnap.key}`);
    } catch (e) {
      console.error('Error in createLobby', e.message);
    }
  }


  async function joinLobby() {
    try {
      const lobbySnaps = await lobbiesRef
        .orderByChild('name')
        .equalTo(lobbyName)
        .once('value');
      console.log(lobbySnaps)
      if (!lobbySnaps.val()) {
        setLobbyName('');
        throw new Error(`Cannot find lobby with name ${lobbyName}`);
      }

      lobbySnaps.forEach((l) => {
        lobbiesRef
          .child(l.key)
          .child('players')
          .update({ [userSnap.key]: userSnap.val() });
        setLobbyName('');
        history.push(`/lobbies/${l.key}`);
        return true;
      });
      await db.ref().child('users').child(userId).update({ ...userSnap.val, inLobby: true })
    } catch (e) {
      console.error('Error in joinLobby', e.message);
    }
  }

  return userLoading ? (
    <div>Loading...</div>
  ) : (
      <React.Fragment>
        <NavigationBar />
        <Container>
          <Title>Create or Join a Lobby</Title>
          <Row>
            <Form.Control size="sm" type="text" placeholder="Lobby Name" onChange={(e) => setLobbyName(e.target.value)}
              value={lobbyName} />
          </Row>
          <Row>
            <Col>
              <Button variant="dark" onClick={joinLobby}>Join Lobby</Button>
              <Button variant="dark" onClick={createLobby}>Create Lobby</Button>
              <Button variant="dark" onClick={checkIfAlreadyInALobby}>Check if already in a lobby</Button>
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    );
}

export default HomePage;
