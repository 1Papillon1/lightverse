// LoadingScreen.jsx
import { observer } from "mobx-react-lite";


const LoadingScreen = observer(() => {
    
    return (
        <div className="overlay overlay--loader">
            <div className="overlay__loader">
            <span className="overlay__title">Loading.....</span>
            </div>
        </div>
    )
});

export default LoadingScreen;