import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '@/stores/RootStore';

const Note = observer(({ title, message }) => {
  const rootStore = useContext(RootStoreContext);

  // Directly set visibility for testing (remove useState for now)
  const visible = true;  // Hardcoding to true for testing

  if (!visible) return null;

  return (
   
      <div
        className="note"
      >
        <h3 className="note__title">{title}</h3>
        <p className="note__message">{message}</p>
      </div>
  
  );
});

export default Note;
