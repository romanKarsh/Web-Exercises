/* E4 server.js */
'use strict';
const log = console.log;

// Express
const express = require('express')
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());

// Mongo and Mongoose
const { ObjectID } = require('mongodb')
const { mongoose } = require('./db/mongoose');
const { Restaurant } = require('./models/restaurant')


/// Route for adding restaurant, with *no* reservations (an empty array).
/* 
Request body expects:
{
	"name": <restaurant name>
	"description": <restaurant description>
}
Returned JSON should be the database document added.
*/
// POST /restaurants
app.post('/restaurants', (req, res) => {
	// Add code here
	const name = req.body.name;
	const description = req.body.description;

	const rest = new Restaurant({
		name,
		description,
		reservations: []
	});
	
	rest.save().then((restr) => {
		res.send(restr)
	}).catch((err) => {
		res.status(400).send(err) // 400 for bad request
	});
})


/// Route for getting all restaurant information.
// GET /restaurants
app.get('/restaurants', (req, res) => {
	// Add code here
	Restaurant.find().then((rests) => {
		res.send(rests);
	}).catch((err) => {
		res.status(500).send(err) // 500 server error
	});
})


/// Route for getting information for one restaurant.
// GET /restaurants/id
app.get('/restaurants/:id', (req, res) => {
	// Add code here
	const id = req.params.id;
	if (!ObjectID.isValid(id)) {
		res.status(404).send();  // if invalid id, definitely can't find resource, 404.
	} else {
		Restaurant.findById(id).then((rest) => {
			if (!rest) {
				res.status(404).send();  // 404 could not find this restaurant
			} else {
				res.send(rest);
			}
		}).catch((err) => {
			res.status(500).send(err); // 500 server error
		});
	}
})


/// Route for adding reservation to a particular restaurant.
/* 
Request body expects:
{
	"time": <time>
	"people": <number of people>
}
*/
// Returned JSON should have the restaurant database 
//   document that the reservation was added to, AND the reservation subdocument:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// POST /restaurants/id
app.post('/restaurants/:id', (req, res) => {
	// Add code here
	const time = req.body.time;
	const people = req.body.people;

	const id = req.params.id;
	if (!ObjectID.isValid(id)) {
		res.status(404).send();  // if invalid id, definitely can't find resource, 404.
	} else {
		Restaurant.findOneAndUpdate({_id: id}, {$push: {reservations: {time, people}}}, {new: true}).then((rest) => {
			if (!rest) {
				res.status(404).send();  // 404 could not find this restaurant
			} else {
				const allreservs = rest.reservations;
				//log(rest.reservations[allreservs.length-1]);
				res.send({"reservation":rest.reservations[allreservs.length-1], "restaurant":rest});
			}
		}).catch((err) => {
			res.status(400).send() // 400 bad request for changing.
		});
	}
})


/// Route for getting information for one reservation of a restaurant (subdocument)
// GET /restaurants/id
app.get('/restaurants/:id/:resv_id', (req, res) => {
	// Add code here
	// restaurant.reservations.id(rid)
	const id = req.params.id;
	const resv_id = req.params.resv_id;
	if (!ObjectID.isValid(id) || !ObjectID.isValid(resv_id)) {
		res.status(404).send();  // if invalid id, definitely can't find resource, 404.
	} else {
		Restaurant.findById(id).then((rest) => {
			if (!rest) {
				res.status(404).send();  // 404 could not find this restaurant
			} else {
				const reserv = rest.reservations.id(resv_id);
				if (!reserv) {
					res.status(404).send();  // 404 could not find this reservation
				} else {
					res.send(rest.reservations.id(resv_id));
				}
			}
		}).catch((err) => {
			res.status(500).send(err); // 500 server error
		});
	}
})


/// Route for deleting reservation
// Returned JSON should have the restaurant database
//   document from which the reservation was deleted, AND the reservation subdocument deleted:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// DELETE restaurant/<restaurant_id>/<reservation_id>
app.delete('/restaurants/:id/:resv_id', (req, res) => {
	// Add code here
	const id = req.params.id;
	const resv_id = req.params.resv_id;
	if (!ObjectID.isValid(id) || !ObjectID.isValid(resv_id)) {
		res.status(404).send();  // if invalid id, definitely can't find resource, 404.
	} else {
		Restaurant.findById(id).then((rest) => {
			if (!rest) {
				res.status(404).send();  // 404 could not find this restaurant
			} else {
				const reserv = rest.reservations.id(resv_id);
				if (!reserv) {
					res.status(404).send();  // 404 could not find this reservation
				} else {
					const resrv = rest.reservations.id(resv_id)
					Restaurant.findOneAndUpdate({_id: id}, {$pull: {reservations: {_id: resv_id}}}, {new: true}).then((rest) => {
						res.send({"reservation":resrv, "restaurant":rest});
					}).catch((err) => {
						res.status(500).send() // 500 server error at this point, could not delete. 
					});
				}
			}
		}).catch((err) => {
			res.status(500).send(err); // 500 server error
		});
	}
})


/// Route for changing reservation information
/* 
Request body expects:
{
	"time": <time>
	"people": <number of people>
}
*/
// Returned JSON should have the restaurant database
//   document in which the reservation was changed, AND the reservation subdocument changed:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// PATCH restaurant/<restaurant_id>/<reservation_id>
app.patch('/restaurants/:id/:resv_id', (req, res) => {
	// Add code here
	const id = req.params.id;
	const resv_id = req.params.resv_id;
	if (!ObjectID.isValid(id) || !ObjectID.isValid(resv_id)) {
		res.status(404).send();  // if invalid id, definitely can't find resource, 404.
	} else {
		const time = req.body.time;
		const people = req.body.people;
		Restaurant.findOneAndUpdate({"_id": id, "reservations._id": resv_id}, 
				{"$set": {"reservations.$.time": time, "reservations.$.people": people}}, {new: true}).then((rest) => {
			if (!rest) {
				res.status(404).send();  // 404 could not find something
			} else {
				const resrv = rest.reservations.id(resv_id);
				res.send({"reservation":resrv, "restaurant":rest});
			}
		}).catch((err) => {
			res.status(400).send(err); // 400 bad request
		});
	}
})

////////// DO NOT CHANGE THE CODE OR PORT NUMBER BELOW
const port = process.env.PORT || 3001
app.listen(port, () => {
	log(`Listening on port ${port}...`)
});
