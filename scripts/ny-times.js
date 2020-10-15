$(function(){
    $.ajax({
        url: `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${config.API_KEY}`,
        type: 'GET',
        dataType: 'json',
        success: function(res){
            let bookData = sanitizeData(res);
            displayData(bookData);
        },
        error: function(xhr){
            console.log(`${xhr.status} : ${xhr.error}`);
        }
    })
})

function displayData(results){
    results.forEach((data) => {
        const listDiv = document.querySelector('.list');
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('book-item');
        itemDiv.setAttribute('id', data.id);
        
        const rank = document.createElement('h2');
        rank.textContent = data.rank;
        itemDiv.appendChild(rank);

        const img = document.createElement('img');
        img.setAttribute('src', data.image);
        itemDiv.appendChild(img);

        const title = document.createElement('h3');
        title.textContent = data.title;
        itemDiv.appendChild(title);
        
        const author = document.createElement('h4');
        author.textContent = data.author;
        itemDiv.appendChild(author);

        const desc = document.createElement('p');
        desc.textContent = data.description;
        itemDiv.appendChild(desc);

        const buyBtn = document.createElement('a');
        buyBtn.classList.add('btn');
        buyBtn.setAttribute('href', data.buyBtn);
        buyBtn.setAttribute('target', '_blank')
        buyBtn.textContent = 'BUY';
        itemDiv.append(buyBtn);

        listDiv.appendChild(itemDiv);
    })
}

function sanitizeData(response){
    // header
    const headerDiv = document.querySelector('.header');
    const header = document.createElement('h1');
    const list_name = response.results.list_name;
    const published_date = response.results.published_date;
    header.textContent = `The best Seller ${list_name} Books Published in ${published_date}`;
    headerDiv.appendChild(header);

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