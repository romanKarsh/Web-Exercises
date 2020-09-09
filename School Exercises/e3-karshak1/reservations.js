/* Reservations.js */ 
'use strict';

const log = console.log
const fs = require('fs');
const datetime = require('date-and-time')

const startSystem = () => {

	let status = {};

	try {
		status = getSystemStatus();
	} catch(e) {
		status = {
			numRestaurants: 0,
			totalReservations: 0,
			currentBusiestRestaurantName: null,
			systemStartTime: new Date(),
		}

		fs.writeFileSync('status.json', JSON.stringify(status))
	}

	return status;
}

/*********/


// You may edit getSystemStatus below.  You will need to call updateSystemStatus() here, which will write to the json file
const getSystemStatus = () => {
	updateSystemStatus();
	const status = fs.readFileSync('status.json')
	return JSON.parse(status)
}

/* Helper functions to save JSON */
// You can add arguments to updateSystemStatus if you want.
const updateSystemStatus = () => {
	const status = {}
	
	/* Add your code below */
	const allrest = getAllRestaurants();
	const st = fs.readFileSync('status.json')
	const oldstatus = JSON.parse(st)
	status['systemStartTime'] = oldstatus['systemStartTime'];
	status['numRestaurants'] = allrest.length;
	status['totalReservations'] = getAllReservations().length;
	status['currentBusiestRestaurantName'] = allrest.reduce(
		(accum, elem) => elem.numReservations >= accum[1] ? [elem.name, elem.numReservations] : accum, 
		[null, 0]
	)[0];
	fs.writeFileSync('status.json', JSON.stringify(status))
}

const saveRestaurantsToJSONFile = (restaurants) => {
	/* Add your code below */
	fs.writeFileSync('restaurants.json', JSON.stringify(restaurants));
};

const saveReservationsToJSONFile = (reservations) => {
	/* Add your code below */
	fs.writeFileSync('reservations.json', JSON.stringify(reservations))
};

/*********/

// Should return an array of length 0 or 1.
const addRestaurant = (name, description) => {
	// Check for duplicate names
	if (Object.keys(getRestaurantByName(name)).length !== 0) { 
		return []; // there is a restaurant with this name (returned object has properties)
	}

	// if no duplicate names:
	const restaurant = {
		name, // short notation for name: name
		description,
		numReservations: 0
	};
	const allrest = getAllRestaurants();
	allrest.push(restaurant);
	saveRestaurantsToJSONFile(allrest);
	return [restaurant];
}

// should return the added reservation object
const addReservation = (restaurant, time, people) => {
	/* Add your code below */
	const dat = datetime.parse(time, 'MMM D YYYY H:m:s');
	//log(dat); //log(JSON.stringify(dat));
	const reservation = {
		restaurant,
		time: dat,
		people
	}
	const allreserv = getAllReservations();
	allreserv.push(reservation);
	saveReservationsToJSONFile(allreserv);

	// By handout assume the restaurant exists
	// I don't know how to use getRestaurantByName since modifying the object it returns modifies it in the full
	// list loaded in getRestaurantByName, WHICH I can't access and so can't save/write by saveRestaurantsToJSONFile
	const allrest = getAllRestaurants();
	const restWithName = allrest.filter((res) => res.name === restaurant)[0];
	restWithName.numReservations++;
	saveRestaurantsToJSONFile(allrest);

	return reservation;
}


/// Getters - use functional array methods when possible! ///

// Should return an array - check to make sure restaurants.json exists
const getAllRestaurants = () => {
	/* Add your code below */
	try {
		const restaurants = fs.readFileSync('restaurants.json');
		return JSON.parse(restaurants);
	} catch (e) {
		return [];
	}
};

// Should return the restaurant object if found, or an empty object if the restaurant is not found.
const getRestaurantByName = (name) => {
	/* Add your code below */
	const allrest = getAllRestaurants();
	const restWithName = allrest.filter((res) => res.name === name);
	if (restWithName.length > 0) { // the is a restaurant with this name
		return restWithName[0];
	}
	return {};
};

// Should return an array - check to make sure reservations.json exists
const getAllReservations = () => {
  /* Add your code below */
	try {
		const reservations = fs.readFileSync('reservations.json');
		return JSON.parse(reservations);
	} catch (e) {
		return [];
	}
};

// Should return an array
const getAllReservationsForRestaurant = (name) => {
	/* Add your code below */
	if (Object.keys(getRestaurantByName(name)).length === 0) { 
		return []; // there is no restaurant with this name
	}
	const allreserv = getAllReservations();
	const reservsForRest = allreserv.filter((resv) => resv.restaurant === name);
	return reservsForRest;
};


// Should return an array
const getReservationsForHour = (time) => {
	/* Add your code below */
	const lower = datetime.parse(time, 'MMM D YYYY H:m:s');
	const upper = datetime.addHours(lower, 1);
	const allreserv = getAllReservations();
	const reservsForHour = allreserv.filter((resv) => lower <= new Date(resv.time) && new Date(resv.time) < upper);
	return reservsForHour;
}

// should return a reservation object
const checkOffEarliestReservation = (restaurantName) => {
	if (Object.keys(getRestaurantByName(restaurantName)).length === 0) { 
		return null; // there is no restaurant with this name
	}
	const allreserv = getAllReservations();
	const allreservRest = allreserv.filter((resv) => resv.restaurant === restaurantName);
	if (allreservRest.length == 0) {
		return null; // there is no reservations for this restaurant
	}
	// sort by time, the earliest one is checkedOff
	allreservRest.sort(function(resv1, resv2){return new Date(resv1.time) - new Date(resv2.time)});
	const checkedOffReservation = allreservRest[0];

	// update JSON storage reservations
	const t = new Date(checkedOffReservation.time);
	const remainResv = allreserv.filter(
		(resv) => resv.restaurant !== restaurantName || new Date(resv.time).getTime() !== t.getTime()
	);
	saveReservationsToJSONFile(remainResv);
	// restaurant JSON
	const allrest = getAllRestaurants();
	const restWithName = allrest.filter((res) => res.name === restaurantName)[0];
	restWithName.numReservations--;
	saveRestaurantsToJSONFile(allrest);
 	return checkedOffReservation;
}


const addDelayToReservations = (restaurant, minutes) => {
	// Hint: try to use a functional array method
	const allreserv = getAllReservations();
	const allreservUpd = allreserv.map((resv) => {
		if (resv.restaurant === restaurant) {
			const oldTime = new Date(resv.time);
			const newTime = datetime.addMinutes(oldTime, minutes);
			resv.time = newTime;
			return resv;
		} else {
			return resv
		}
	});
	saveReservationsToJSONFile(allreservUpd);
}

startSystem(); // start the system to create status.json (should not be called in app.js)

// May not need all of these in app.js..but they're here.
module.exports = {
	addRestaurant,
	getSystemStatus,
	getRestaurantByName,
	getAllRestaurants,
	getAllReservations,
	getAllReservationsForRestaurant,
	addReservation,
	checkOffEarliestReservation,
	getReservationsForHour,
	addDelayToReservations
}

