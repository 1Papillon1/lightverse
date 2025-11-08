// Panel.jsx
import { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";

const Panel = observer(() => {
    const rootStore = useContext(RootStoreContext);


    useEffect(() => {
        console.log(rootStore.adminStore);
    }, [rootStore.adminStore]);
    

    const addCryptoToTable = () => {


        const newCrypto = {
            name: document.querySelector('.panel__table input[type="text"]').value,
            price: document.getElementById('price').value,
            value: document.getElementById('value').value
        }
        if (newCrypto.name && newCrypto.price && newCrypto.value) {
            rootStore.adminStore.addCrypto(newCrypto);
            document.getElementById('name').value = '';
            document.getElementById('price').value = '';
            document.getElementById('value').value = '';

        } else {
            alert("Please fill in all fields");
        }
        console.log(rootStore.adminStore.cryptoList);
    
    }
    
    return (
        <>
            { !rootStore.adminStore.disabled && (
            <div className="panel">
            
                <div className="panel__header">
                    <h2>Admin Panel</h2>
                </div>
                <div className="panel__content">
                    <table className="panel__table">
                        
                        <tbody>
                            <tr>
                                <td>Cryptocurrency</td>
                                <td>Price</td>
                                <td>Value</td>
                                <td>Actions</td>
                            </tr>
                            {rootStore.adminStore.cryptoList && (rootStore.adminStore.cryptoList.map((crypto, index) => (
                                <tr key={index}>
                                    <td>{crypto.name}</td>
                                    <td>{crypto.price}</td>
                                    <td>{crypto.value}</td>
                                    <td>
                                        <button className="button" onClick={() => rootStore.adminStore.deleteCrypto(index)}>Delete</button>
                                    </td>
                                </tr>
                            )))} 
                            <tr>
                                <td>
                                
                                    <input id="name" type="text" placeholder="Crypto Name" />


                                </td>
                                <td>
                                    <input id="price" type="number" placeholder="Price" />
                                </td>
                                <td>
                                    <input id="value" type="number" placeholder="Value" />
                                </td>
                            </tr>

                        </tbody>
                        <tfoot className="panel__table__footer">
                            <tr>
                                <td colSpan="3">
                                    <button className="button" onClick={addCryptoToTable}>Add Cryptocurrency</button>
                                </td>
                            </tr>
                        </tfoot>
                        
                        
                        
                        </table>

                </div>
            </div>
        )}
        </>
    )
});

export default Panel;