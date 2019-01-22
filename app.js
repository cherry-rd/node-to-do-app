// importing express module and express-handlebars
const express = require('express');
const methodOverride = require('method-override')
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


// map global promise
mongoose.Promise = global.Promise;
// connect to mongoose
mongoose.connect('mongodb://localhost/to-do-app-dev', {
	useNewUrlParser: true
})
.then(() => console.log('MongoDB connected.'))
.catch(err => console.log(err));

// Load Task Model
require('./models/Task');
const Task = mongoose.model('tasks');

// initializing express application
const app = express();

// handlebar middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

// method-override middleware
app.use(methodOverride('_method'))

// express-session middleware

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))


// connect flash middleware
app.use(flash());

// global variables
app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});


// index route
app.get('/', (req, res) => {
	// res.send("This is gonna print at the web page"); // send something to page for display at the / page.

	// sending dynamic data to the file index in the views folder
	const title = 'Welcome';
	res.render('index', {
		title: title
	}); 
});

// about Route
app.get('/about', (req, res) => {
	res.render('about');
});

// Add task form
app.get('/tasks/add', (req, res) => {
	res.render('tasks/add');
});

// tasks index route page
app.get('/tasks', (req, res) => {
	Task.find({})
		.sort({date:'desc'})
		.then(tasks => {
			res.render('tasks/index', {
				tasks: tasks
			});
		});
});

// edit task form
app.get('/tasks/edit/:id', (req, res) => {
	Task.findOne({
		_id: req.params.id
	})
	.then(task => {
		res.render('tasks/edit', {
			task: task
		});
	});
});

// Process Form
app.post('/tasks', (req, res) => {
	let errors = [];

	if(!req.body.title){
		errors.push({text: 'Please add a title'});
	}

	if(!req.body.details){
		errors.push({text: 'Please add some details'});
	}

	if(errors.length > 0){
		res.render('tasks/add', {
			errors: errors
			//title: req.body.title,
			//details: req.body.details
		});
	} else{
		const newUser = {
			title: req.body.title,
			details: req.body.details
		}

		new Task(newUser)  // Task- our mongoose model name
		.save()
		.then(task => {
			req.flash('success_msg', 'Task added');
			res.redirect('/tasks');
		})
	}
	
});

// edit form process
app.put('/tasks/:id',(req, res) => {
	Task.findOne({
		_id: req.params.id
	})
	.then(task => {
		// new values
		task.title = req.body.title;
		task.details = req.body.details;

		task.save()
			.then(task => {
				req.flash('success_msg', 'Task updated');
				res.redirect('/tasks');
			})
	})
});

// delete task
app.delete('/tasks/:id', (req, res) => {
	Task.deleteOne({_id: req.params.id})
	.then(() => {
		req.flash('success_msg', 'Task removed');
		res.redirect('/tasks');
	});
});

// setting port
const port = 3000;

// starting the server in localhost
app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});


/*
// express middleware
app.use((req, res, next) => {
	// console.log(Date.now());
	req.name = 'Rohan Das';
	next();
});
*/