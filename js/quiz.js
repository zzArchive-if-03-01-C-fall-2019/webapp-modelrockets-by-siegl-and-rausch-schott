let rightAnswers = [];

let correctAnswerCount = 0;
let averagePercent = -1;

//
// Initializes the quiz.
//
function initQuiz(){
  //Remove Information article
  let element = document.getElementById('information-quiz');
  element.parentNode.removeChild(element);

  //Get Questions
  fetchQuestions();
}

//
// Gets the questions from the JSON-Server
//
function fetchQuestions(){
  fetch("http://dev.byiconic.at:3000/questions").then (response => response.json())
  .then(function(data){

    //Load Questions
    loadQuestions(data);
  })
  .catch( function (error) {
    console.error("error: " + error);
    document.getElementById('errorLoading').removeAttribute("hidden");
  });
}

//
// Creates the question elements.
//
function loadQuestions(questions) {
  console.log("loading questions");

  let fullOutput = "";
  for(let i = 0; i < 10; i++){
    let question = questions[i];
    rightAnswers.push(question.rightAnswer);

    let answerArr = [question.AnswerOne,
                     question.AnswerTwo,
                     question.AnswerThree,
                     question.AnswerFour];

    //Shuffle answers randomly
    shuffle(answerArr);

    //Create and append Question Article
    let output = ElementCreator.createQuestionArticle(question, answerArr, i);
    document.getElementById('questions').appendChild(output);
  }

  //Create and append "CheckAnswers" Button
  let btnCheckAnswers = ElementCreator.createCheckAnswersBtn(); fullOutput += "<section><div class=\"container\"><div class=\"text-center\"><input id=\"submitButton\"type=\"submit\"value=\"CheckAnswers\"></div></div></section>"
  document.getElementById("questions").appendChild(btnCheckAnswers);

  console.log("loaded questions");
}

//
// Shuffles the Answers randomly to make the quiz unpredictable.
//
function shuffle(array) {
    let ctr = array.length, temp, index;

    while (ctr-- > 0) {
        index = Math.floor(Math.random() * ctr);
        temp = array[ctr];
        array[ctr] = array[index];
        array[index] = temp;
    }
    return array;
}

//
// Checks the chosen answers.
//
function checkAnswers(){
  correctAnswerCount = QuizValidator.validate(rightAnswers);

  //Save result to Server AND show result / average results
  saveToServerAndShowResults();
}

//
// Gets the current results on the JSON-Server and calls the "updateCountsOnServer" function.
//
function saveToServerAndShowResults(){
  //Get CurrentCount
  fetch("http://dev.byiconic.at:3000/info").then (response => response.json())
  .then( function(data){
    updateCountsOnServer(data);
  })
  .catch( function (error){
    console.error("error: " + error);
  });
}

//
// Calculates the percentage of the current player, updates the results on the JSON-Server and calls the "showResults" function.
//
function updateCountsOnServer(current){
  let newInfo = current;

  newInfo.totalAnswers = current.totalAnswers + 10;
  newInfo.correctAnswers = current.correctAnswers + correctAnswerCount;

  averagePercent = (newInfo.correctAnswers / newInfo.totalAnswers) * 100;

  //PUT Request to update the values
  fetch('http://dev.byiconic.at:3000/info', {
    method: 'PUT', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newInfo),
  })
  .then(response => response.json())
  .then(data => {
    showResults();
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

//
// Shows the achieved result and the average result of all players
//
function showResults(){
  ownPercentage = (correctAnswerCount / 10) * 100;

  //Create Result Elements
  let ownResultElem = ElementCreator.createOwnResultArticle(ownPercentage);
  let averageOutputElem = ElementCreator.createAverageResultArticle(averagePercent);

  //Remove all childs of questions div
  let contentDiv = document.getElementById('questions');
  while (contentDiv.firstChild) { contentDiv.removeChild(contentDiv.firstChild); }

  //Add Elements
  contentDiv.appendChild(ownResultElem);
  contentDiv.appendChild(averageOutputElem);
}
