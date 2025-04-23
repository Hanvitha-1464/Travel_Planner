import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/hompage';
import Login from './Components/login';
import Signup from './Components/signup';
import Dashboard from './Components/Dashboard';
import RoomListing from './Components/RoomListing';
import CreateRoom from './Components/CreateRoom';
import JoinRoom from './Components/JoinRoom';
import SingleRoom from './Components/SingleRoom';
import ItineraryPlanner from './Components/ItineraryPlanner';
import ItineraryDetail from './Components/ItineraryDetail';
import ItineraryEdit from './Components/ItineraryEdit';
import ExpensePage from './Components/ExpenseTracker';
// // import ExpenseSummary from './Components/ExpenseSummary';
import DocumentSharingPage from './Components/DocumentShare';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms" element={<RoomListing />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<SingleRoom />} />
        <Route path="/room/:roomId/itinerary" element={<ItineraryPlanner />} />
        <Route path="/room/:roomId/itinerary/:itineraryId" element={<ItineraryDetail />} />
        <Route path="/room/:roomId/itinerary/:itineraryId/edit" element={<ItineraryEdit />} />
        <Route path="/room/:roomId/expenses" element={<ExpensePage />} />
        {/* <Route path="/room/:roomId/analysis" element={<ExpenseSummary />} /> */}
        <Route path="/room/:roomId/documents" element={<DocumentSharingPage />} />

      </Routes>
    </Router>
  );
}

export default App;