/* E3 app.js */
'use strict';

const log = console.log
const yargs = require('yargs').option('addRest', {
    type: 'array' // Allows you to have an array of arguments for particular command
  }).option('addResv', {
    type: 'array' 
  }).option('addDelay', {
    type: 'array' 
  })

const reservations = require('./reservations');

// datetime available if needed
const datetime = require('date-and-time') 

const yargs_argv = yargs.argv
//log(yargs_argv) // uncomment to see what is in the argument array

if ('addRest' in yargs_argv) {
	const args = yargs_argv['addRest']
	const rest = reservations.addRestaurant(args[0], args[1]);
	
	if (rest.length > 0) {
		/* complete */ 
		log('Added restaurant ' + args[0] + '.');
	} else {
		/* complete */ 
		log('Duplicate restaurant not added.');
	}
}

if ('addResv' in yargs_argv) {
	const args = yargs_argv['addResv']
	const resv = reservations.addReservation(args[0], args[1], args[2]);

	// Produce output below
	const on = datetime.format(resv.time, 'MMM D YYYY');
	const at = datetime.format(resv.time, 'h:mm A');
	log('Added reservation at ' + args[0] + ' on ' + on + ' at ' + at + ' for ' + args[2] + ' people.')
}

if ('allRest' in yargs_argv) {
	const restaurants = reservations.getAllRestaurants(); // get the array
	
	// Produce output below
	// Red Lobster: Seafood at low prices - 2 active reservations
	restaurants.map((rest) => 
		log(rest.name + ': ' + rest.description + ' - ' + rest.numReservations + ' active reservations'));
}

if ('restInfo' in yargs_argv) {
	const restaurants = reservations.getRestaurantByName(yargs_argv['restInfo']);
	
	// Produce output below
	if (Object.keys(restaurants).length === 0) { // no such restaurant exists
		return;
	}
	[restaurants].map((rest) => 
		log(rest.name + ': ' + rest.description + ' - ' + rest.numReservations + ' active reservations'));
}

if ('allResv' in yargs_argv) {
	const restaurantName = yargs_argv['allResv']
	const reservationsForRestaurant = reservations.getAllReservationsForRestaurant(restaurantName); // get the arary
	
	// Produce output below
	// Reservations for Red Lobster:
	log('Reservations for ' + restaurantName + ':');
	reservationsForRestaurant.sort(function(resv1, resv2){return new Date(resv1.time) - new Date(resv2.time)});
	reservationsForRestaurant.map((resv) => {
		const on = datetime.format(new Date(resv.time), 'MMM D YYYY');
		const at = datetime.format(new Date(resv.time), 'h:mm A');
		// - Mar 17 2019, 5:15 p.m., table for 5
		log('- ' + on + ', ' + at + ", table for " + resv.people);
	});
}

if ('hourResv' in yargs_argv) {
	const time = yargs_argv['hourResv']
	const reservationsForRestaurant = reservations.getReservationsForHour(time); // get the arary
	
	// Produce output below
	//Reservations in the next hour:
	log('Reservations in the next hour:');
	reservationsForRestaurant.sort(function(resv1, resv2){return new Date(resv1.time) - new Date(resv2.time)});
	reservationsForRestaurant.map((resv) => {
		const on = datetime.format(new Date(resv.time), 'MMM D YYYY');
		const at = datetime.format(new Date(resv.time), 'h:mm A');
		//- Red Lobster: Mar 17 2019, 5:15 p.m., table for 5
		log('- ' + resv.restaurant + ': ' + on + ', ' + at + ", table for " + resv.people);
	});
}

if ('checkOff' in yargs_argv) {
	const restaurantName = yargs_argv['checkOff']
	const earliestReservation = reservations.checkOffEarliestReservation(restaurantName); 
	
	// Produce output below
	if (earliestReservation !== null) {
		const on = datetime.format(new Date(earliestReservation.time), 'MMM D YYYY');
		const at = datetime.format(new Date(earliestReservation.time), 'h:mm A');
		//Checked off reservation on Mar 17 2019, 5:15 p.m., table for 5
		log('Checked off reservation on ' + on + ', ' + at + ', table for ' + earliestReservation.people);
	}
}

if ('addDelay' in yargs_argv) {
	const args = yargs_argv['addDelay']
	const resv = reservations.addDelayToReservations(args[0], args[1]);	

	// Produce output below
	const reservationsForRestaurant = reservations.getAllReservationsForRestaurant(args[0]);
	log('Reservations for ' + args[0] + ':');
	reservationsForRestaurant.sort(function(resv1, resv2){return new Date(resv1.time) - new Date(resv2.time)});
	reservationsForRestaurant.map((resv) => {
		const on = datetime.format(new Date(resv.time), 'MMM D YYYY');
		const at = datetime.format(new Date(resv.time), 'h:mm A');
		log('- ' + on + ', ' + at + ", table for " + resv.people);
	});
}

if ('status' in yargs_argv) {
	const status = reservations.getSystemStatus()

	// Produce output below
	/* Number of restaurants: 2 
	Number of total reservations: 3
	Busiest restaurant: Red Lobster
	System started at: Mar 17 2019, 2:14 p.m. */
	log('Number of restaurants: ' + status.numRestaurants);
	log('Number of total reservations: ' + status.totalReservations);
	log('Busiest restaurant: ' + status.currentBusiestRestaurantName);
	const on = datetime.format(new Date(status.systemStartTime), 'MMM D YYYY');
	const at = datetime.format(new Date(status.systemStartTime), 'h:mm A');
	log('System started at: ' + on + ', ' + at);
}

