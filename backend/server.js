
// require('dotenv').config();
const app=require('./src/app');

// const host="localhost";
const port=process.env.PORT;

app.listen(port,(err)=> {
    if (err) {
        console.error(`? Failed to start server on port ${port}:`, err);
        process.exit(1);
    }
    console.log(`App listening to port ${port}`);

});