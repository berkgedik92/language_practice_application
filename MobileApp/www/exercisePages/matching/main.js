
let matchElementRemaining;
let clickedLeft = null;
let clickedRight = null;
let clickReady = true;

let wordMatchChecker = function(left, right) {
    let manager = managerr.getDataManager();
    left.classList.remove("selected");
    right.classList.remove("selected");

    if (left.getAttribute("id").localeCompare(right.getAttribute("id")) == 0) {
        left.classList.add("correct");
        right.classList.add("correct");
        setTimeout(function() {
            left.parentNode.style["opacity"] = 0;
            right.parentNode.style["opacity"] = 0;
            setTimeout(function() {
                left.parentNode.style["display"] = "none";
                right.parentNode.style["display"] = "none";
                    clickedLeft = null;
                    clickedRight = null;
                    matchElementRemaining--;
                    if (matchElementRemaining == 0) 
                        setTimeout(function() {    
                            window.location.href = "../../index.html";
                        }, 400);
                    clickReady = true;
            }, 300);
        }, 200);
    }
    else {
        left.classList.add("wrong");
        right.classList.add("wrong");
        setTimeout(function() {
            left.classList.remove("wrong");
            right.classList.remove("wrong");
        }, 200);
        clickedLeft = null;
        clickedRight = null;
        clickReady = true;
    }
}

let wordButtonClicked = function(wordButton) {
    let manager = managerr.getDataManager();
    if (!clickReady) 
        return;
    clickReady = false;

    let isLeft = wordButton.getAttribute("attr").localeCompare("left") == 0;
    
    if (isLeft) {
        if (clickedLeft) {
            clickedLeft.classList.remove("selected");
            clickedLeft = null;
        }

        clickedLeft = wordButton;
        clickedLeft.classList.add("selected");
    }
    else {
        if (clickedRight) {
            clickedRight.classList.remove("selected");
            clickedRight = null;
        }

        clickedRight = wordButton;
        clickedRight.classList.add("selected");
    }

    if (clickedLeft && clickedRight)
        wordMatchChecker(clickedLeft, clickedRight);
    else
        clickReady = true;
}

let createButton = function(word, wordID, attr) {
    let manager = managerr.getDataManager();
    let outerDOM = document.createElement('div');
    outerDOM.classList.add('buttonContainer');

    //We cannot remove them (check if css rules do not effect also other new-created DOMs)
    outerDOM.style["transition"] = "opacity 0.4s ease-out";
    outerDOM.style["-webkit-transition"] =  "opacity 0.4s ease-out";
    
    let innerDOM = document.createElement('div');
    innerDOM.classList.add('button');
    innerDOM.classList.add('totalCenter');

    innerDOM.innerHTML = word;
    innerDOM.setAttribute("id", wordID);
    innerDOM.setAttribute("attr", attr);
    outerDOM.appendChild(innerDOM);

    innerDOM.addEventListener("touchend", function() {
        wordButtonClicked(this);
    });

    return outerDOM;
}

let MainRenderer = function() {
    let manager = managerr.getDataManager();
    let leftSide = manager.getWords().shuffle();
    let rightSide = manager.getWords().shuffle();

    /*
        TODO: Pick the right side in a clever and clear way (among visible words of left and right, 
        there must be always at least one match, otherwise the exercise might be stucked at some point
        as user will not be able to have any matching)
    */

    matchElementRemaining = leftSide.length;
    for (let i = 0; i < leftSide.length; i++) {
        let outerDOMLeft = createButton(leftSide[i].currentMeaning, leftSide[i].wordID, "left");
        document.getElementById("matchLeft").appendChild(outerDOMLeft);

        let outerDOMRight = createButton(rightSide[i].mainMeaning, rightSide[i].wordID, "right");
        document.getElementById("matchRight").appendChild(outerDOMRight);
    }
}

let managerr = new ExerciseManager({
    wordsReadyCallback: MainRenderer, 
});