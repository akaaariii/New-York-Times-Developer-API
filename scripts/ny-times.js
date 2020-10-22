let list_name, published_date;
let favouriteBooks = localStorage.getItem('favourite') ? JSON.parse(localStorage.getItem('favourite')) : [];

const getListName = async () => {
    try {
        let res = await $.ajax({
            url: `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${config.API_KEY}`,
            type: 'GET',
            dataType: 'json'
        })
        return sanitizeListName(res)
    } catch (xhr){
        console.log(`${xhr.status} : ${xhr.error}`);
    }
}

const getBooks = async (keyword) => {
    try {
        let res = await $.ajax({
            url: `https://api.nytimes.com/svc/books/v3/lists/current/${keyword}.json?api-key=${config.API_KEY}`,
            type: 'GET',
            dataType: 'json'   
        })
        list_name = res.results.list_name;
        published_date = res.results.published_date;
        return sanitizeBookData(res);
    } catch (xhr){
        console.log(`${xhr.status} : ${xhr.error}`);
    }
}

const sanitizeListName = (data) => {
    let listnames = [];
    for(let i = 0; i < 10; i++){
        listnames.push({
            name: data.results[i].list_name,
            encoded: data.results[i].list_name_encoded
        })
    }
    return listnames;
}

const sanitizeBookData = (response) => {
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


const checkFavourite = (item) => {
    const index = favouriteBooks.findIndex(e => e.id === item.id);
    return (index < 0) ? false : true;
}

const handleFavouriteBooks = (bookData) => {
    $('.fa-heart').click(e => {
        const target = $(e.target);
        const targetId = target.parent().attr('id');
        const favBook = bookData.find(e => e.id === targetId);
        const favIndex = favouriteBooks.findIndex(e => e.id === targetId);
        if(favIndex < 0){
            favouriteBooks.push(favBook);
        } else {
            favouriteBooks.splice(favIndex, 1);
        }
        localStorage.setItem('favourite', JSON.stringify(favouriteBooks));
        target.toggleClass('favourite');
    })
}

const displayData = async (keyword = 'hardcover-fiction') => {  // hardcover-fiction -> set as a default value
    const bookData = await getBooks(keyword);
    // to reset the book list
    $('.header').empty();
    $('.list').empty();

    // header
    const header = $('<h1></h1>').text(`The best Seller ${list_name} Books Published in ${published_date}`);
    $('.header').append(header);

    bookData.forEach((data) => {
        const itemDiv = $('<div class="book-item"></div>');
        const rank = $('<h2></h2>').text(data.rank);
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
        const amazonIcon = $('<i class="fab fa-amazon"></i>');
        const buyBtn = $('<a class="btn"></a>').attr('href', data.buyBtn).attr('target', '_blank').text('Buy ');
        buyBtn.append(amazonIcon);
        itemDiv.append(buyBtn);

        $('.list').append(itemDiv);
    })
    handleFavouriteBooks(bookData);
}


getListName()
    .then((listItems) => {
        const form = $('<form></form>');
        const select = $('<select></select>');
        
        listItems.forEach((item) => {
            let options = $('<option></option>').val(item.encoded).text(item.name);
            if(item.name === 'Hardcover Fiction'){
                options.attr('selected', 'selected');
            }
            select.append(options);
        })
        form.append(select);
        $('.choose-option').append(form);
        displayData();
    })
    .then(() => {
        $('select').change(e => {
            let keyword = $(e.target).val();
            displayData(keyword);
        })
    })