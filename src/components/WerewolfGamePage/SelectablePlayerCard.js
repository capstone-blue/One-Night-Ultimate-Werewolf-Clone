/* eslint react/no-array-index-key: 0 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Badge from 'react-bootstrap/Badge';

const PlayerContainer = styled.div`
  position: relative;
  cursor: pointer;
  margin: 0 auto;
  width: 14rem;
  transition: all 0.1s ease-in-out;
  bottom: 0;
  &:hover {
    bottom: 10rem;
  }
`;

const PlayerBadge = styled(Badge)`
  font-weight: 100;
  font-size: 1rem;
`;

const PlayerCard = styled.div`
  margin-top: 0.5rem;
  color: #22262a;
  background-color: #eaeaea;
  height: auto;
  width: 14rem;
  padding: 0.75rem;
  border: 0.75rem solid transparent;
  border-left: 0rem solid transparent;
  border-right: 0rem solid transparent;
  border-radius: 0.125rem;
  background-color: #eaeaea;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  border-color: ${(props) => props.border || 'transparent'};
  &:hover {
  }
`;

const PlayerCardTitle = styled.div`
  margin-top: 0.25rem;
  color: #c22c31;
  font-size: 1.5rem;
`;

const PlayerCardContent = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
`;

function SelectablePlayerCard({
  setSelectedCards,
  selectedCards,
  cardId,
  cardVal,
  cardRef,
}) {
  const [card, setCard] = useState({});

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
        cardVal: cardVal.actualRole,
        cardRef,
        isRevealed: false,
        isSelected: true,
      };
      // if there is a card in the list already, give the new card a different border
      const firstCard = selectedCards[0];
      newCard.border =
        firstCard && firstCard.border === '#27CCE5' ? '#DC3545' : '#27CCE5';
      setSelectedCards([...selectedCards, newCard]);
    }
  }

  return (
    <PlayerContainer className="text-center" onClick={handleClick}>
      <PlayerBadge pill variant="danger" className="text-center" size="lg">
        Starting Role
      </PlayerBadge>
      <PlayerCard border={card.border}>
        <PlayerCardTitle className="text-center">
          <div>{cardVal.startingRole.name}</div>
        </PlayerCardTitle>
        <PlayerCardContent>
          <div>
            {cardVal.startingRole.options.map((o, i) => (
              <div key={`card-${cardId}-${i}`}>
                {i > 0 ? (
                  <div>
                    <div style={{ color: '#c22c31', fontSize: '14px' }}>or</div>
                    <div>{o}</div>
                  </div>
                ) : (
                  o
                )}
              </div>
            ))}
          </div>
        </PlayerCardContent>
      </PlayerCard>
    </PlayerContainer>
  );
}

export default SelectablePlayerCard;
