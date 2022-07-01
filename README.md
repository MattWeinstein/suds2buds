# Suds2Buds
Suds2Buds is being developed for a client looking to provide users the ability to calculate the number of standard beers they have consumed. Users can enter the kind of beer consumed, as well as the quantity, alcohol percentage and size. The application will convert this to Bud Lights, and succesfully return the number of standard drinks consumed in that session.

**Link to project:** https://suds2buds.herokuapp.com/

<img width="627" alt="Screen Shot 2022-07-01 at 11 19 32 AM" src="https://user-images.githubusercontent.com/102390205/176922926-a488ab44-e0cc-4013-91cd-5120fd26c005.png">


## How It's Made:

**Tech used:** HTML, CSS, JavaScript, Node.JS, Express, Mongo DB, EJS
This full stack application is being created using client side JS as well as server side JS through Node.JS. 

1. When a user submits the form, a post request is made on the server which inserts that information into a Mongo DB database collection. Every Mongo DB document containing the submitted username is found and looped through. On each iteration, the server side calculates the total alcohol content in all their documents and converts this to Bud Lights.

2. Once completed, the user is redirected to the homepage endpoint where the EJS file is rendered. EJS is a popular templating engine and can be dynamically changed through Node.JS. The EJS returns the expected homepage, with some modified fields. The value of the username is unchanged, the total number of beers is returned, and a summary of every user input is returned as well.

3. The reset button is the only other user option. The reset button event is handled by client side JS, which makes a delete request to the server. On the server, all documents containing the current username are found and deleted. Like the submit button, the user is redirected to the homepage endpoint where the EJS is rendered. As there are no remaining documents pinned to that username, the website is reset, and appears blank.

## Optimizations

The main problem with the current application is that every user accesses the same endpoint. If two users were to use the program at the same time, they would see each others' results on the homepage. A solution is in progress having each user access their own endpoint to resolve this problem.

Users must enter their name exactly right to access their documents in the database. If on the same session, their value is saved on the form, but this may prove problematic if they would like to come back at a later date. In the future, we would like users to be able to sign into their account and automatically access their stored data.

Future additions include:
- Users to be able to access a history of all submitted entries
- Users to be able to view, share and compare entries with one another
- Implement a beer API or save beer data to automatically fill in the ABV input based on beer selection

## Lessons Learned:

I now feel comfortable to be able to manipulate selected data from a database felt quite important and powerful. Even though I was doing simple arithmetic on a small set of data, I can see how this skill can grow and become infinitely useful. 

Using EJS as a templating engine is a great experience in learning a new language based off the original specification.

Given a generalized goal from the client, it is exciting being able to create my own code and features and the lone Software Engineer on this project.
