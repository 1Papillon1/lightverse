// Helpbox.jsx
//  This file is part of the Wzkr project.
import { useState} from "react";
import { observer } from "mobx-react-lite";
import MainLayout from "@/MainLayout";
import { RootStoreContext } from "@/stores/RootStore";
import leftClickIcon from "@/assets/icons/left_click.svg";
import rightClickIcon from "@/assets/icons/right_click.svg";
import zoomInIcon from "@/assets/icons/zoom_in.svg";
import zoomOutIcon from "@/assets/icons/zoom_out.svg";

const Helpbox = observer((part) => {
  const rootStore = RootStoreContext.useStore();
  const [isOpen, setIsOpen] = useState(false);

  const toggleHelpbox = () => {
    setIsOpen(!isOpen);
  };

  return (


    <div>

    </div>
  );
});