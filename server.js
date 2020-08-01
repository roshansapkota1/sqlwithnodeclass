const express = require('express');
const { Pool } = require("pg");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "cyf_hotels",
    password: "roshansapkota1",
    port:5432
});

app.get("/hotels", function(req, res){
   pool
   .query("SELECT * FROM hotels")
   .then((result) => res.json(result.rows))
   .catch((e) => console.error(e))
})

app.get("/bookings", function(req, res){
    pool
    .query('SELECT * FROM bookings')
    .then(result => res.json(result.rows))
    .catch(a => console.error(a))
})

app.get("/customers", function(req, res){
    pool
    .query('SELECT * FROM customers ORDER BY name')
    .then(result => res.json(result))
    .catch(e => console.error(a))
})

app.get("/hotels/:hotelId", function (req, res){
    const { hotelId } = req.params;
    pool
    .query('SELECT * FROM hotels where id=$1', [hotelId])
    .then(result => res.json(result.rows))
    .catch(e => console.error(e))
})

app.get("/customers/:customerId", function (req, res){
    const { customerId } = req.params;
    pool
    .query('SELECT * FROM customers where id=$1', [customerId])
    .then(result => res.json(result.rows))
    .catch(e => console.error(e))
})

app.get("/customers/:customerId/bookings", function (req, res){
    const { customerId } = req.params;
    pool
    .query('SELECT bookings.checkin_date, bookings.nights, hotels.name, hotels.postcode FROM bookings JOIN hotels ON bookings.hotel_id = hotels.id WHERE bookings.customer_id = $1', [customerId])
    .then(result => res.json(result.rows))
    .catch(e => console.error(e))
})

//create queries to insert --its a post 
// app.post("/hotels", function (req,res){
//    const  newHotelName = req.body.name;
//     const newHotelRooms = req.body.rooms;
//     const newHotelPostcode = req.body.postcode;
        
//     pool
//     .query('INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)', [newHotelName, newHotelRooms, newHotelPostcode])
//     .then(() => res.send('the hotel was created'))
//     .catch(e => console.error(e))

// } );

app.post("/hotels", function (req, res) {
    const newHotelName = req.body.name;
    const newHotelRooms = req.body.rooms;
    const newHotelPostcode = req.body.postcode;
  
    if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
      return res
        .status(400)
        .send("The number of rooms should be a positive integer.");
    }
  
    pool
      .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
      .then((result) => {
        if (result.rows.length > 0) {
          return res
            .status(400)
            .send("An hotel with the same name already exists!");
        } else {
          const query =
            "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
          pool
            .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
            .then(() => res.send("Hotel created!"))
            .catch((e) => console.error(e));
        }
      });
  });

  app.put("/customers/:customerId", function (req, res) {
    const customerId = req.params.customerId;
    const newEmail = req.body.email;

    if (!newEmail || newEmail === ""){
      return res.status(400).send('the email field is empty')
    }
    
    pool
    .query('select * from customers where id=$1', [customerId])
    .then(result => {
      if (result.rows.length > 0){
        pool
      .query("UPDATE customers SET email=$1 WHERE id=$2", [newEmail, customerId])
      .then(() => res.send(`Customer ${customerId} updated!`))
      .catch((e) => console.error(e));
      }

      else return res.send("This customer id doesnot exists")
    }
    
    )
    .catch(e => console.error(e)) 

    
  });

//delete from customers:customerId
  app.delete('/customers/:customerId', function(req, res){
    const id = req.params.customerId;

    pool
    .query('select * from customers where id = $1', [id])
    .then(result => {
      if (result.rows.length > 0){
        pool.query('delete from bookings where customer_id = $1', [id])
        .then(() => {
          pool
          .query('delete from customers where id = $1', [id])
          .then(result => res.send(`the customer with id ${id} got deleted`) )
          .catch(e => console.error(e))
        })
      }
      else return res.send(`this id ${id} doesnot exist in the customers`)
    })
    .catch(e => console.error(e))
  })

  //delete from hotels/:hotelsId
  //exactly the same as above 










app.listen(3000, function (){
    console.log("i am working now")
});



