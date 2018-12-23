function PageSlider(data) {

	var page1 = document.getElementById(data.pageTemp);

	var pageSliderReady = true;
	var visiblePage = 1;

    var currentPage = 0;
    var lastPage = -1;
    var width = data.width;
    var height = data.height;
    var isDraggable = data.isDraggable;

    /*
        This is a function to be called to construct the page (it can be the current/visible)
        page or another page
    */
    var pageRenderer = data.pageRenderer;

    //This is the function to be called when a page is being visible
    var showPageCallback = data.showPageCallback;

    var container = document.createElement("div");
    container.style["position"]     = "relative";
    container.style["height"]       = height;
    container.style["width"]        = width + "px";
    container.style["visibility"]   = "hidden";

    page1.style["position"]         = "absolute";
    page1.style["display"]          = "inline-block";
    page1.style["height"]           = "100%";
    page1.style["width"]            = width + "px";
    page1.style["vertical-align"]   = "top";

    var page0 = page1.cloneNode(true);
    var page2 = page1.cloneNode(true);

    page0.style["left"]             = "-" + width + "px";
    page1.style["left"]             = "0px";
    page2.style["left"]             = width + "px";

    var pages = [page0, page1, page2];
    var pagesDict = [{}, {}, {}];

    for (var i = 0; i < 3; i++) {
        var divs = pages[i].querySelectorAll("[slider-data-attr]");
        for (var j = 0; j < divs.length; j++)
            pagesDict[i][divs[j].getAttribute("slider-data-attr")] = divs[j];
    }

    page1.parentNode.insertBefore(container, page1);
    container.appendChild(page1);
    container.appendChild(page2);
    container.insertBefore(page0, page1);
    container.style["visibility"]   = "visible";

    this.isLastPage = function() {
        return currentPage == lastPage;
    }

    this.GoPrevPage = function() {
        prevPage = (visiblePage + 2) % 3;
        nextPage = (visiblePage + 1) % 3;
        pages[visiblePage].style["left"]        = width + "px";
        pages[prevPage].style["left"]           = "0px";
        pages[nextPage].style["left"]           = "-" + width + "px";

        container.style["transition"]           = "";
        container.style["-webkit-transition"]   = "";
        container.style["transform"]            = "translate(0,0)";
        container.style["-webkit-transform"]    = "translate(0,0)";

        visiblePage = prevPage;
        currentPage--;
        if (showPageCallback) showPageCallback(currentPage, pagesDict[visiblePage]);
        if (currentPage - 1 >= 0) pageRenderer(currentPage - 1, pagesDict[nextPage]);
        pageSliderReady = true;
        console.log(currentPage);
    }

    this.GoNextPageWithAnim = function() {
        if (currentPage == lastPage || !pageSliderReady) return;
        pageSliderReady = false;

        container.style["transition"]           = "transform 0.4s ease-out";
        container.style["-webkit-transition"]   = "-webkit-transform 0.4s ease-out";
        container.style['transform']            = 'translate(-' + width + 'px,0)';
        container.style['-webkit-transform']    = 'translate(-' + width + 'px,0)';

        setTimeout(function() { instance.GoNextPage();}, 400);
    }

    this.GoNextPage = function() {
        prevPage = (visiblePage + 2) % 3;
        nextPage = (visiblePage + 1) % 3;
        pages[visiblePage].style["left"]        = "-" + width + "px";
        pages[prevPage].style["left"]           = width + "px";
        pages[nextPage].style["left"]           = "0px";
        container.style["transition"]           = "";
        container.style["-webkit-transition"]   = "";
        container.style["transform"]            = "translate(0,0)";
        container.style["-webkit-transform"]    = "translate(0,0)";

        visiblePage = nextPage;
        currentPage++;
        if (showPageCallback) 
            showPageCallback(currentPage, pagesDict[visiblePage]);
        if (currentPage + 1 <= lastPage) 
            pageRenderer(currentPage + 1, pagesDict[prevPage]);
        pageSliderReady = true;
        console.log(currentPage);
    }

    var instance = this;
    this.cancelled = false;

    if (isDraggable)
    {
        container.addEventListener("touchstart", function(event) {
            if (!pageSliderReady) 
                return false;

            pageSliderReady = false;
            instance.longTouch = false;
            setTimeout(function() {instance.longTouch = true;}, 250);

            // Get the original touch position.
            instance.touchstartx =  event.touches[0].pageX;

            // The movement gets all janky if there's a transition on the elements.
            container.style["transition"] = "";
            container.style["-webkit-transition"] = "";
        });

        container.addEventListener("touchmove", function(event) {
            if (instance.cancelled)
                return false;

            // Continuously return touch position.
            instance.touchmovex =  event.touches[0].pageX;

            // Calculate distance to translate holder.
            instance.movex = instance.touchstartx - instance.touchmovex;

            if ((currentPage == 0 && instance.movex < 0) || (currentPage == lastPage && instance.movex > 0)) {
                pageSliderReady = true;
                instance.cancelled = true;
                return false;
            }
            if (Math.abs(instance.movex) > width) {
                pageSliderReady = true;
                instance.cancelled = true;
                return false;
            }

            var slideAmount = (-1) * instance.movex;

            container.style['transform']          = 'translate(' + slideAmount + 'px,0)';
            container.style['-webkit-transform']  = 'translate(' + slideAmount + 'px,0)';

        });

        container.addEventListener("touchend", function(event) {
            if (instance.cancelled || instance.movex === undefined) {
                instance.cancelled = false;
                return false;
            }

            var absMove = Math.abs(instance.movex);
            // Calculate the index. All other calculations are based on the index.
            if (absMove > width / 2 || instance.longTouch === false) {
                if (instance.movex > 0) {
                    container.style["transition"]           = "transform 0.4s ease-out";
                    container.style["-webkit-transition"]   = "-webkit-transform 0.4s ease-out";
                    container.style['transform']            = 'translate(-' + width + 'px,0)';
                    container.style['-webkit-transform']    = 'translate(-' + width + 'px,0)';

                    setTimeout(function() { instance.GoNextPage();}, 400);
                } 
                else {
                    container.style["transition"]           = "transform 0.4s ease-out";
                    container.style["-webkit-transition"]   = "-webkit-transform 0.4s ease-out";
                    container.style['transform']            = 'translate(' + width + 'px,0)';
                    container.style['-webkit-transform']    = 'translate(' + width + 'px,0)';

                    setTimeout(function() { instance.GoPrevPage();}, 400);
                }
            }
            else {
                container.style["transition"]           = "transform 0.4s ease-out";
                container.style["-webkit-transition"]   = "-webkit-transform 0.4s ease-out";
                container.style["transform"]            = "translate(0,0)";
                container.style["-webkit-transform"]    = "translate(0,0)";
            }      
        });
    }

    this.Start = function(data) {
    	container.style["visibility"] = "hidden";
    	currentPage = data.currentPage;
    	lastPage = data.lastPage;
    	prevPage = (visiblePage + 2) % 3;
        nextPage = (visiblePage + 1) % 3;
        if (lastPage != -1) 
            pageRenderer(currentPage, pagesDict[visiblePage]);
        if (currentPage - 1 >= 0) 
            pageRenderer(currentPage - 1, pagesDict[prevPage]);
        if (currentPage + 1 <= lastPage) 
            pageRenderer(currentPage + 1, pagesDict[nextPage]);
        if (showPageCallback) 
            showPageCallback(currentPage, pagesDict[visiblePage]);
    	container.style["visibility"] = "visible";
    }
}