import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import Sound from 'react-sound';
import ticktockSFX from '../assets/sounds/ticktock.wav';

function VotingTimer({ gameRef, host, finishVoting }) {
  const [count, setCount] = useState('');
  const [endVotingTime, loadingVotingTime] = useObjectVal(
    gameRef.child('endVotingTime')
  );
  const votingHasntStarted = !loadingVotingTime && !endVotingTime;
  const countDownReached =
    !votingHasntStarted && endVotingTime < new Date().getTime();
  const timeLeft = Math.floor(endVotingTime - new Date().getTime());
  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor(timeLeft / 1000 - minutes * 60);
  // EFFECTS
  useEffect(() => {
    function setEndTimeInDB() {
      db.ref('/.info/serverTimeOffset').once('value', function (snap) {
        const offset = snap.val();
        const rightNow = new Date().getTime() + offset;
        const endVoteTime = rightNow + 25000;
        gameRef.child('endVotingTime').set(endVoteTime);
      });
    }
    if (host) {
      if (votingHasntStarted) {
        // set an expiration time for 25 seconds into the future
        setEndTimeInDB();
      } else if (countDownReached) {
        finishVoting();
      }
    }
  }, [gameRef, host, votingHasntStarted, countDownReached, finishVoting]);

  // every second, client checks their time against server end time
  useEffect(() => {
    const interval = setInterval(() => {
      let secondsLeft = Math.floor(
        (endVotingTime - new Date().getTime()) / 1000
      );
      setCount(secondsLeft);
    }, 1000);
    return () => clearInterval(interval);
  }, [count, endVotingTime]);

  return (
    <React.Fragment>
      {seconds < 3 ? (
        <Sound
          url={ticktockSFX}
          // url="../assets/sounds/sillyBackground.wav"
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
        />
      ) : null}
      {seconds > 9 ? (
        <h2>
          Time Left: {minutes}:{seconds}
        </h2>
      ) : (
        <h2>
          Time Left: {minutes}:0{seconds}
        </h2>
      )}
    </React.Fragment>
  );
}

export default VotingTimer;