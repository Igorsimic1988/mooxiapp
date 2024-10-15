import React from 'react';
import styles from './RoomList.module.css';
import { ReactComponent as More } from '../../../assets/icons/more.svg';

function RoomList({ onRoomSelect }) {
  const rooms = [
    { name: 'Living Room', itemCount: 23 },
    { name: 'Family Room', itemCount: 15 },
    { name: 'Dining Room', itemCount: 10 },
  ];

  return (
    <div>
      {rooms.map((room, index) => (
        <button key={index} onClick={() => onRoomSelect(room)}>
          <p>{room.name}</p>
          <div>
            <p>{room.itemCount}</p>
          </div>
          <div>
            <More />
          </div>
        </button>
      ))}
    </div>
  );
}

export default RoomList;
