//Script file for handling the clicks on the book rows on the list page.

var books = Array.from(document.getElementsByClassName("book-rows"));

books.forEach((element,index) => {
    element.addEventListener('click',showInfo);
});

function showInfo(){
    //Getting all the information from the table row.
    id = this.id;
    var title = this.childNodes[3].innerHTML;
    var author = this.childNodes[5].innerHTML;
    var location = this.childNodes[7].innerHTML;
    var bio = this.childNodes[9].innerHTML;
    var rating = this.childNodes[11].innerHTML;

    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("info").classList.remove("hidden");

    document.getElementById("book-title").innerHTML=title;
    document.getElementById("author").innerHTML=author;
    document.getElementById("location").innerHTML=location;
    document.getElementById("bio").innerHTML=bio;
    document.getElementById("rating").innerHTML=rating;
}

function closeInfo(){
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("info").classList.add("hidden");
}