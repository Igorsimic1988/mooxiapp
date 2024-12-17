// src/components/Inventory/ItemSelection/AlphabetFilter/AlphabetFilter.js

import React from 'react';
import PropTypes from 'prop-types';
import AlphabetButtons from './AlphabetButtons/AlphabetButtons';
import AlphabetBanner from './AlphabetBanner/AlphabetBanner';

function AlphabetFilter(props) {
  return (
    <div>
      <AlphabetButtons
        selectedLetter={props.selectedLetter}
        selectedSubButton={props.selectedSubButton}
        onLetterSelect={props.onLetterSelect}
        onSubButtonClick={props.onSubButtonClick}
      />
      <AlphabetBanner
        isMyItemsActive={props.isMyItemsActive}
        roomName={props.roomName}
      />
    </div>
  );
}

AlphabetFilter.propTypes = {
  selectedLetter: PropTypes.string,
  selectedSubButton: PropTypes.shape({
    letter: PropTypes.string,
    subButton: PropTypes.string,
  }),
  onLetterSelect: PropTypes.func.isRequired,
  onSubButtonClick: PropTypes.func.isRequired,
  isMyItemsActive: PropTypes.bool.isRequired,
  roomName: PropTypes.string.isRequired,
};

export default AlphabetFilter;
