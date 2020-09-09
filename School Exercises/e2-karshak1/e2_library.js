/* E2 Library - JS */

/*-----------------------------------------------------------*/
/* Starter code - DO NOT edit the code below. */
/*-----------------------------------------------------------*/

// global counts
let numberOfBooks = 0; // total number of books
let numberOfPatrons = 0; // total number of patrons

// global arrays
const libraryBooks = [] // Array of books owned by the library (whether they are loaned or not)
const patrons = [] // Array of library patrons.

// Book 'class'
class Book {
	constructor(title, author, genre) {
		this.title = title;
		this.author = author;
		this.genre = genre;
		this.patron = null; // will be the patron objet

		// set book ID
		this.bookId = numberOfBooks;
		numberOfBooks++;
	}

	setLoanTime() {
		// Create a setTimeout that waits 3 seconds before indicating a book is overdue

		const self = this; // keep book in scope of anon function (why? the call-site for 'this' in the anon function is the DOM window)
		setTimeout(function() {
			
			console.log('overdue book!', self.title)
			changeToOverdue(self);

		}, 3000)

	}
}

// Patron constructor
const Patron = function(name) {
	this.name = name;
	this.cardNumber = numberOfPatrons;

	numberOfPatrons++;
}


// Adding these books does not change the DOM - we are simply setting up the 
// book and patron arrays as they appear initially in the DOM.
libraryBooks.push(new Book('Harry Potter', 'J.K. Rowling', 'Fantasy'));
libraryBooks.push(new Book('1984', 'G. Orwell', 'Dystopian Fiction'));
libraryBooks.push(new Book('A Brief History of Time', 'S. Hawking', 'Cosmology'));

patrons.push(new Patron('Jim John'))
patrons.push(new Patron('Kelly Jones'))

// Patron 0 loans book 0
libraryBooks[0].patron = patrons[0]
// Set the overdue timeout
libraryBooks[0].setLoanTime()  // check console to see a log after 3 seconds


/* Select all DOM form elements you'll need. */ 
const bookAddForm = document.querySelector('#bookAddForm');
const bookInfoForm = document.querySelector('#bookInfoForm');
const bookLoanForm = document.querySelector('#bookLoanForm');
const patronAddForm = document.querySelector('#patronAddForm');

/* bookTable element */
const bookTable = document.querySelector('#bookTable')
/* bookInfo element */
const bookInfo = document.querySelector('#bookInfo')
/* Full patrons entries element */
const patronEntries = document.querySelector('#patrons')

/* Event listeners for button submit and button click */

bookAddForm.addEventListener('submit', addNewBookToBookList);
bookLoanForm.addEventListener('submit', loanBookToPatron);
patronAddForm.addEventListener('submit', addNewPatron)
bookInfoForm.addEventListener('submit', getBookInfo);

/* Listen for click patron entries - will have to check if it is a return button in returnBookToLibrary */
patronEntries.addEventListener('click', returnBookToLibrary)

/*-----------------------------------------------------------*/
/* End of starter code - do *not* edit the code above. */
/*-----------------------------------------------------------*/


/** ADD your code to the functions below. DO NOT change the function signatures. **/
const log = console.log;

/*** Functions that don't edit DOM themselves, but can call DOM functions 
     Use the book and patron arrays appropriately in these functions.
 ***/

// Adds a new book to the global book list and calls addBookToLibraryTable()
function addNewBookToBookList(e) {
	e.preventDefault();

	// create the new book object
	const name = document.querySelector('#newBookName').value;
	const author = document.querySelector('#newBookAuthor').value;
	const genre = document.querySelector('#newBookGenre').value;
	const newBook = new Book(name, author, genre);

	// Add book book to global array
	libraryBooks.push(newBook);

	// Call addBookToLibraryTable properly to add book to the DOM
	addBookToLibraryTable(newBook);
}

// Changes book patron information, and calls 
function loanBookToPatron(e) {
	e.preventDefault();

	// Get correct book and patron
	const bookId = document.querySelector('#loanBookId').value;
	const patronId = document.querySelector('#loanCardNum').value;
	const lbook = libraryBooks[bookId]

	// Add patron to the book's patron property
	lbook.patron = patrons[patronId];

	// Add book to the patron's book table in the DOM by calling addBookToPatronLoans()
	addBookToPatronLoans(lbook);

	// Start the book loan timer.
	lbook.setLoanTime();
}

// Changes book patron information and calls returnBookToLibraryTable()
function returnBookToLibrary(e){
	e.preventDefault();
	// check if return button was clicked, otherwise do nothing.
	if (!e.target.classList.contains('return')) {
		return
	}
	// Call removeBookFromPatronTable()
	// log(e.target); // get button
	// log(e.target.parentElement); // get button td
	// log(e.target.parentElement.parentElement); // get book tr
	// log(e.target.parentElement.parentElement.children[0]); // get book id td
	const bookId = e.target.parentElement.parentElement.children[0].innerText;
	removeBookFromPatronTable(libraryBooks[bookId]);

	// Change the book object to have a patron of 'null'
	libraryBooks[bookId].patron = null;

}

// Creates and adds a new patron
function addNewPatron(e) {
	e.preventDefault();

	// Add a new patron to global array	
	const newName = document.querySelector("#newPatronName").value;
	const newPatron = new Patron(newName);
	patrons.push(newPatron);

	// Call addNewPatronEntry() to add patron to the DOM
	addNewPatronEntry(newPatron);
}

// Gets book info and then displays
function getBookInfo(e) {
	e.preventDefault();

	// Get correct book
	const bookId = document.querySelector('#bookInfoId').value;

	// Call displayBookInfo()	
	displayBookInfo(libraryBooks[bookId]);
}


/*-----------------------------------------------------------*/
/*** DOM functions below - use these to create and edit DOM objects ***/

// Adds a book to the library table.
function addBookToLibraryTable(book) {
	// Add code here
	// Make all the elements needed
	const tr = document.createElement('tr');
	const tdId = document.createElement('td');
	const tdTitle = document.createElement('td');
	const strongTitle = document.createElement('strong');
	const tdPatron = document.createElement('td');

	// add the text into the new elements
	tdId.appendChild(document.createTextNode(book.bookId));
	strongTitle.appendChild(document.createTextNode(book.title));

	// build up the table entry
	tdTitle.appendChild(strongTitle);
	tr.appendChild(tdId);
	tr.appendChild(tdTitle);
	tr.appendChild(tdPatron);

	// add the new table entry to the table
	bookTable.children[0].appendChild(tr);
}


// Displays deatiled info on the book in the Book Info Section
function displayBookInfo(book) {
	// Add code here
	const listOf = bookInfo.children;
	listOf[0].lastElementChild.innerText = book.bookId;
	listOf[1].lastElementChild.innerText = book.title;
	listOf[2].lastElementChild.innerText = book.author;
	listOf[3].lastElementChild.innerText = book.genre;
	if (book.patron == null) {
		listOf[4].lastElementChild.innerText = 'N/A';
	} else {
		listOf[4].lastElementChild.innerText = book.patron.name;
	}
}

// Adds a book to a patron's book list with a status of 'Within due date'. 
// (don't forget to add a 'return' button).
function addBookToPatronLoans(book) {
	// Add code here
	const lpatron = book.patron;
	// log(patronEntries.children);
	// log(patronEntries.children[lpatron.cardNumber]);
	const patronTable = document.getElementsByClassName("patronLoansTable")[lpatron.cardNumber];
	
	// make all the html elements needed
	const tr = document.createElement('tr');
	const tdId = document.createElement('td');
	const tdTitle = document.createElement('td');
	const strongTitle = document.createElement('strong');
	const tdStatus= document.createElement('td');
	const spanStatus = document.createElement('span');
	const tdReturn= document.createElement('td');
	const buttonReturn = document.createElement('button');

	// set class
	spanStatus.className = 'green';
	buttonReturn.className = 'return';

	// add textNodes
	spanStatus.appendChild(document.createTextNode('Within due date'));
	buttonReturn.appendChild(document.createTextNode('return'));
	strongTitle.appendChild(document.createTextNode(book.title));
	tdId.appendChild(document.createTextNode(book.bookId));

	// build the table entry
	tr.appendChild(tdId);
	tdTitle.appendChild(strongTitle);
	tr.appendChild(tdTitle);
	tdStatus.appendChild(spanStatus);
	tr.appendChild(tdStatus);
	tdReturn.appendChild(buttonReturn);
	tr.append(tdReturn);

	// add the table entry
	patronTable.children[0].appendChild(tr);

	// ==============================================================
	// add the patron card number to library book table for this book
	const row = bookTable.children[0].children[book.bookId + 1]; // first row is the headers for the table
	row.children[2].innerText = lpatron.cardNumber;
}

// Adds a new patron with no books in their table to the DOM, including name, card number,
// and blank book list (with only the <th> headers: BookID, Title, Status).
function addNewPatronEntry(patron) {
	// Add code here
	// Make all the elements needed
	const mainDiv = document.createElement('div');
	const pName = document.createElement('p');
	const spanName = document.createElement('span');
	const pCardNum = document.createElement('p');
	const spanCardNum = document.createElement('span');
	const h4 = document.createElement('h4');
	const tablePatron = document.createElement('table');
	const tbody = document.createElement('tbody');
	const tr = document.createElement('tr');
	const thBookId = document.createElement('th');
	const thTitle = document.createElement('th');
	const thStatus = document.createElement('th');
	const thReturn = document.createElement('th');

	// set class
	mainDiv.className = 'patron';
	tablePatron.className = 'patronLoansTable';

	// add textNodes
	pName.appendChild(document.createTextNode('Name: '));
	pCardNum.appendChild(document.createTextNode('Card Number: '));
	spanName.appendChild(document.createTextNode(patron.name));
	spanCardNum.appendChild(document.createTextNode(patron.cardNumber));
	h4.appendChild(document.createTextNode('Books on loan:'));
	thBookId.appendChild(document.createTextNode('BookID'));
	thTitle.appendChild(document.createTextNode('Title'));
	thStatus.appendChild(document.createTextNode('Status'));
	thReturn.appendChild(document.createTextNode('Return'));

	// build the patron table 
	tr.appendChild(thBookId);
	tr.appendChild(thTitle);
	tr.appendChild(thStatus);
	tr.appendChild(thReturn);
	tbody.appendChild(tr);
	tablePatron.appendChild(tbody);
	pName.appendChild(spanName);
	pCardNum.appendChild(spanCardNum);
	mainDiv.appendChild(pName);
	mainDiv.appendChild(pCardNum);
	mainDiv.appendChild(h4);
	mainDiv.appendChild(tablePatron);

	// add the new patron entry
	patronEntries.appendChild(mainDiv);
}


// Removes book from patron's book table and remove patron card number from library book table
function removeBookFromPatronTable(book) {
	// Add code here
	const patronTable = document.getElementsByClassName("patronLoansTable")[book.patron.cardNumber];
	const patronRows = patronTable.children[0].children;
	for (let i = 1; i < patronRows.length; i++) {
		if (patronRows[i].children[0].innerText == book.bookId) {
			patronTable.children[0].removeChild(patronRows[i]);
			break;
		}
	}

	// remove patron card number from library book table
	const row = bookTable.children[0].children[book.bookId + 1]; // first row is the headers for the table
	row.children[2].innerText = '';
	// const row2 = bookTable.children[0].children[book.bookId + 2];
	// log(row2.children[2].innerText == row.children[2].innerText); // is setting innerText to '' right
}

// Set status to red 'Overdue' in the book's patron's book table.
function changeToOverdue(book) {
	// Add code here
	const patronTable = document.getElementsByClassName("patronLoansTable")[book.patron.cardNumber];
	const patronRows = patronTable.children[0].children;
	for (let i = 1; i < patronRows.length; i++) {
		if (patronRows[i].children[0].innerText == book.bookId) {
			const spanElem = patronRows[i].children[2].firstElementChild;
			spanElem.className = 'red';
			spanElem.innerText = 'Overdue';
			break;
		}
	}
}

