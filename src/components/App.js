// import React from 'react';
//
// class App extends React.Component {
//     constructor() {
//         super();
//
//         // this.addFish = this.addFish.bind(this);
//         // // this.removeFish = this.removeFish.bind(this);
//         // // this.updateFish = this.updateFish.bind(this);
//         // // this.loadSamples = this.loadSamples.bind(this);
//         // this.addToOrder = this.addToOrder.bind(this);
//         // this.removeFromOrder = this.removeFromOrder.bind(this);
//
//         this.state = {
//             test: true,
//         };
//     };
//     componentWillMount() {
//         // // this runs right before the <App> is rendered
//         // this.ref = base.syncState(`${this.props.params.storeId}/fishes`, {
//         //     context: this,
//         //     state: 'fishes'
//         // });
//         //
//         // // check if there is any order in localStorage
//         // const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);
//         //
//         // if(localStorageRef) {
//         //     // update our App component's order state
//         //     this.setState({
//         //         order: JSON.parse(localStorageRef)
//         //     });
//         // }
//
//         console.log("componentWillMount");
//
//     }
//
//     componentWillUnmount() {
//         // base.removeBinding(this.ref);
//         console.log("componentWillUnmount");
//     }
//
//     componentWillUpdate(nextProps, nextState) {
//         // localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order));
//         console.log("componentWillUpdate");
//     }
//
//     // addFish(fish) {
//     //     // update our state
//     //     const fishes = {...this.state.fishes};
//     //     // add in our new fish
//     //     const timestamp = Date.now();
//     //     fishes[`fish-${timestamp}`] = fish;
//     //     // set state
//     //     this.setState({ fishes });
//     // }
//     //
//     // updateFish = (key, updatedFish) => {
//     //     const fishes = {...this.state.fishes};
//     //     fishes[key] = updatedFish;
//     //     this.setState({ fishes });
//     // };
//
//     render() {
//         return (
//             <div className="catch-of-the-day">
//                 Salvo's test!
//             </div>
//         );
//     }
// }
//
// export default App;