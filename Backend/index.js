const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const cors=require('cors');
app.use(express.json());
app.use(cors());
require('./Models/db');
// const bodyParser=require('body-parser');
const AuthRouter=require('./Routes/AuthRouter');
const RoomRouter=require('./Routes/RoomRouter');
const itineraryRoutes = require('./Routes/ItineraryRouter');
const expenseRoutes = require('./Routes/ExpenseRouter'); 
const documentRoutes = require('./Routes/DocumentRouter');


const PORT=process.env.PORT || 5100;

app.use('/api/auth', AuthRouter);
app.use('/api/rooms', RoomRouter);
app.use('/api/itineraries', itineraryRoutes);
// app.use('/api/itineraries', itineraryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/documents', documentRoutes);


app.get('/', (req, res) => {
    res.send('VoyageVault API is running...');
});



app.listen(PORT,()=>{
    console.log("Server is listening");
})