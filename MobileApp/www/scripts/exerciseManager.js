function ExerciseManager(params) {

    /*
        This is the function to be called when words for the current category and 
        also language related information are loaded. The function to be called is 
        supposed to complete the construction of the template page
    */
    let wordsReadyCallback = params["wordsReadyCallback"];

    /*
        This is the function to be called to construct the page whose index is given in "pageIndex"
        parameter. Initially, the page will be just a clone of the template page. The function
        is supposed to get the data about the corresponding word ("pageIndex"th word in the list of
        current words) and transform the page from a template page into the actual page by considering
        the word data.
    */
    let pageRenderer = params["pageRenderer"];

    /*
        This is the function to be called when the page whose index is given in "pageIndex" 
        parameter becomes visible to a user.
    */
    let showPageCallback = params["showPageCallback"];

    /*
        If true, a user can change pages by dragging gesture. Otherwise, pages can be switched only by
        code and not by user.
    */
    let isDraggable = params["isDraggable"];

    /*
        ID of the container which keeps the template page.
    */
    let templatePageID = params["templatePageID"];

    //TODO: Add good constructor checks (like in communicationHandler.js)

    let wordsDataManager;
    let storage;

    this.getDataManager = function() {
        return wordsDataManager;
    }

    let Initialize = function() {

        //Create Storage object
        storage = new Storage();

        //Create topBar (where the back button stays)
        let topBar = document.createElement('div');
        topBar.setAttribute("id", "topBar");
        let backButton = document.createElement('div');
        backButton.classList.add("verticalCenter");
        backButton.classList.add("circlePicture");
        backButton.setAttribute("id", "backButton");
        backButton.addEventListener("touchend", function() {
            window.location.href = "../../index.html";
        });
        topBar.append(backButton);
        document.getElementById("actionPage").append(topBar);

        //Create wordsDataManager and then prepare it for the words belonging to the selected category
        wordsDataManager = new WordsDataManager(function() {
            storage.get("categoryIndex", function(obj) {
                let currentWordIDs = wordsDataManager.getWordsOfCategory(obj);
                currentWordIDs = currentWordIDs.shuffle();
                wordsDataManager.setCurrentWordIDs(currentWordIDs);
                
                if (wordsReadyCallback)
                    wordsReadyCallback();
    
                if (templatePageID && templatePageID.length > 0) {
                    pageSlider = new PageSlider({
                        pageTemp: templatePageID,
                        height: "90vh",
                        width: window.innerWidth,
                        isDraggable: isDraggable,
                        showPageCallback: showPageCallback,
                        pageRenderer: pageRenderer
                    });
    
                    pageSlider.Start({
                        "currentPage": 0,
                        "lastPage": currentWordIDs.length - 1
                    });
                }
            }, function() {
                window.location.href = "../../updater.html";
            });
        });
    }

    if (window.hasOwnProperty("cordova"))    
        document.addEventListener('deviceready', Initialize, false);
    else
        document.addEventListener('DOMContentLoaded', Initialize, false);
}