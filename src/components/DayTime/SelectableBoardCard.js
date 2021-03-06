import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useObject } from 'react-firebase-hooks/database';

const BoardCard = styled.div`
  margin: 0.5rem;
  cursor: pointer;
  color: ${(props) => (props.theme.color ? props.theme.color : '#23272B')};
  width: 7rem;
  height: 8rem;
  padding: 1rem 0.5rem;
  font-size: 1.5rem;
  border: 0.5rem solid transparent;
  border-left: 0rem solid transparent;
  border-right: 0rem solid transparent;
  border-radius: 0.125rem;
  background-color: #eaeaea;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  border-color: ${(props) => props.border || 'transparent'};
  &:hover {
    background-color: ${(props) =>
      props.theme.hover ? props.theme.hover : '#B9BABB'};
  }
`;

function SelectableBoardCard({
  gameRef,
  setSelectedCards,
  selectedCards,
  cardId,
  cardVal,
  cardRef,
  theme,
}) {
  const [card, setCard] = useState({});
  // const [suspects, loadingSuspects] = useObject(gameRef.child('suspects'))
  const [suspects] = useObject(gameRef.child('suspects'));
  // const [markers, loadingmarkers] = useObject(gameRef.child('markers'))
  //  resident sleeper
  let suspectIdentity = undefined;
  if (suspects) {
    if (suspects.val()) {
      if (suspects.val()[cardId]) {
        suspectIdentity = suspects.val()[cardId];
      } else if (suspects.val()[cardId]) {
        suspectIdentity = suspects.val()[cardId];
      }
    }
  }

  useEffect(() => {
    const thisCard = selectedCards.find((c) => c.cardId === cardId);
    if (thisCard) setCard(thisCard);
    else setCard({});
  }, [selectedCards, cardId]);

  function handleClick() {
    const thisCard = selectedCards.find((c) => c.cardId === cardId);
    // if this card is in the list, remove it
    if (thisCard) {
      setSelectedCards(selectedCards.filter((c) => c.cardId !== cardId));
      // otherwise, add it to the list
    } else {
      if (selectedCards.length === 2)
        return alert('You may only select 2 cards at a time');
      const newCard = {
        cardId,
        cardVal,
        cardRef,
        isRevealed: false,
        isSelected: true,
      };
      // this differs from night phase. we don't need to select 2 cards during the day, so we only account for selecting 1.
      newCard.border = theme ? '#27CCE5' : '#5B6672';
      setSelectedCards([newCard]);
    }
  }

  return (
    <div className="text-center" onClick={handleClick}>
      <BoardCard border={card.border} theme={theme}>
        <div style={suspectIdentity ? { fontSize: '1rem' } : null}>
          {suspectIdentity ? suspectIdentity : '?'}
        </div>
      </BoardCard>
    </div>
  );
}

export default SelectableBoardCard;
