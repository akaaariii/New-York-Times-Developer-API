let list_name, published_date;
let favouriteBooks = localStorage.getItem('favourite') ? JSON.parse(localStorage.getItem('favourite')) : [];

const getBooks = async() => {
    try {
        let res = await $.ajax({
            url: `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${config.API_KEY}`,
            type: 'GET',
            dataType: 'json'   
        })
        list_name = res.results.list_name;
        published_date = res.results.published_date;
        return sanitizeData(res);
    } catch (xhr){
        console.log(`${xhr.status} : ${xhr.error}`);
    }
}

function checkFavourite(item){
    const index = favouriteBooks.findIndex(e => e.id === item.id);
    return (index < 0) ? false : true;
}

function displayData(name, date, results){
    // header
    const headerDiv = $('.header');
    const header = $('<h1>').text(`The best Seller ${name} Books Published in ${date}`);
    headerDiv.append(header);

    results.forEach((data) => {
        const listDiv = $('.list');
        const itemDiv = $('<div class="book-item"></div>');
        
        const rank = $('<h2>').text(data.rank);
        itemDiv.append(rank);
        const img = $('<img>').attr('src', data.image);
        itemDiv.append(img);

        const titleDiv = $('<div class="title-item"></div>').attr('id', data.id);
        const isFavourite = checkFavourite(data);
        const icon = isFavourite ? $('<i class="fas fa-heart favourite"></i>') : $('<i class="fas fa-heart"></i>'); 
        const title = $('<h3></h3>').text(data.title);
        titleDiv.append(icon);
        titleDiv.append(title);
        itemDiv.append(titleDiv);
        
        const author = $('<h4></h4>').text(data.author);
        itemDiv.append(author);
        const desc = $('<p></p>').text(data.description);
        itemDiv.append(desc);
        const buyBtn = $('<a class="btn"></a>').attr('href', data.buyBtn).attr('target', '_blank').text('BUY');
        itemDiv.append(buyBtn);

        listDiv.append(itemDiv);
    })
}

function sanitizeData(response){
    // book list
    let data = [];
    response.results.books.forEach((d) => {
        data.push({
            id: d.primary_isbn10,
            title: (typeof d.title === 'undefined') ? 'There is no title for this book' : d.title,
            rank: (typeof d.rank === 'undefined') ? 'There is no rank for this book' : d.rank,
            author: (typeof d.author === 'undefined') ? 'There is no author for this book' : `By ${d.author}`,
            image: d.book_image,
            description: (typeof d.description === 'undefined') ? 'There is no description for this book' : d.description,
            buyBtn: d.amazon_product_url
        })
    })
    return data;
}

let bookData = [];
getBooks().then(book => {
    displayData(list_name, published_date, book);
    bookData = book;
}).then(() => {
    $('.fa-heart').click((e) => {
        let target = $(e.target);
        let isFav = target.hasClass('favourite');
        let targetId = target.parent().attr('id');
        const favBook = bookData.find(e => e.id === targetId);
        const favIndex = bookData.findIndex(e => e.id === targetId)
        if(!isFav){
            favouriteBooks.push(favBook);
        } else {
            favouriteBooks.splice(favIndex, 1);
        }
        localStorage.setItem('favourite', JSON.stringify(favouriteBooks));
        target.toggleClass('favourite');
    })
})