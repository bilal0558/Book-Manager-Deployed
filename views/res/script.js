
//Handling the clicks on the book rows on the list page.
var books = Array.from(document.getElementsByClassName("book-rows"));

books.forEach((element,index) => {
    element.addEventListener('click',showInfo);
});

function showInfo(){
    //Getting all the information from the table row.
    id = this.id;
    let title = this.childNodes[3].innerHTML;
    let author = this.childNodes[5].innerHTML;
    let genre = this.childNodes[7].innerHTML;
    let location = this.childNodes[9].innerHTML;
    let bio = this.childNodes[11].innerHTML;
    let rating = this.childNodes[13].innerHTML;
    let price = this.childNodes[15].innerHTML;

    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("info").classList.remove("hidden");

    document.getElementById("book-title").innerHTML=title;
    document.getElementById("author").innerHTML=author;
    document.getElementById("genre").innerHTML=genre;
    document.getElementById("location").innerHTML=location;
    document.getElementById("bio").innerHTML=bio;
    document.getElementById("rating").innerHTML=rating;
    document.getElementById("price").innerHTML=price;


    document.getElementById("update-modal-value").value=id;
}

function closeInfo(){
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("info").classList.add("hidden");
}