import React, { useState, useEffect } from 'react';
import { useObjectVal, useListVals } from 'react-firebase-hooks/database';
import { db } from '../../firebase';
import { useUserId } from '../../context/userContext';
import styled from 'styled-components';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Sound from 'react-sound';
import ticktockSFX from '../../assets/sounds/ticktock.mp3';
import dingSFX from '../../assets/sounds/ding.mp3';

const TurnHeading = styled.div`
  color: #ffc108;
  font-size: 3.5rem;
  margin: 0 auto;
`;

const Timer = styled.div`
  color: #ffc108;
  font-size: 3.5rem;
`;

function TurnCountdown({ gameRef, host, currentTurn, setCurrentTurn }) {
  const [userId] = useUserId();
  const [count, setCount] = useState('');
  const [endTime, loadingEndTime] = useObjectVal(gameRef.child('endTime'));
  const [roleList, loadingRoleList] = useListVals(gameRef.child('turnOrder'));
  const gameHasntStarted = !loadingEndTime && !endTime;
  const countDownReached = !gameHasntStarted && endTime < new Date().getTime();

  // EFFECTS
  useEffect(() => {
    function setEndTimeInDB() {
      db.ref('/.info/serverTimeOffset').once('value', function (snap) {
        const offset = snap.val();
        const rightNow = new Date().getTime() + offset;
        const endTime = rightNow + 15000;
        gameRef.child('endTime').set(endTime);
      });
    }
    function setNextTurnInDB() {
      roleList.shift();
      gameRef.child('turnOrder').set(roleList);
      gameRef.child('currentTurn').set(roleList[0]);
    }

    if (host[userId]) {
      if (gameHasntStarted) {
        // set an expiration time for 15 seconds into the future
        setEndTimeInDB();
      } else if (countDownReached && roleList.length > 1) {
        // remove the role that just went from the turn order
        setEndTimeInDB();
        setNextTurnInDB();
      } else if (countDownReached && roleList.length === 1) {
        // the turns are done
        gameRef.child('isNight').set(false);
        gameRef.child('status').set('dayPhase');
      }
    }
  }, [
    gameRef,
    host,
    userId,
    gameHasntStarted,
    countDownReached,
    setCurrentTurn,
    roleList,
  ]);

  // every second, client checks their time against server end time
  useEffect(() => {
    const interval = setInterval(() => {
      let secondsLeft = Math.floor((endTime - new Date().getTime()) / 1000);
      setCount(secondsLeft);
    }, 1000);
    return () => clearInterval(interval);
  }, [count, endTime]);

  // VIEW
  return loadingEndTime || loadingRoleList ? (
    <Spinner animation="border" role="status" />
  ) : (
    <React.Fragment>
      <Col />
      <Col xs="auto">
        <TurnHeading>{currentTurn}'s Turn </TurnHeading>
      </Col>
      <Col>
        <Timer>
          <span style={{ color: 'white' }}>:</span>
          {Math.floor((endTime - new Date().getTime()) / 1000)}
        </Timer>
      </Col>
      {count === 2 ? (
        <Sound
          url={ticktockSFX}
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
          volume={20}
        />
      ) : null}
      {count === 0 ? (
        <Sound
          url={dingSFX}
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
          volume={30}
        />
      ) : null}
    </React.Fragment>
  );
}

export default TurnCountdown;
