const toDate = (date) => {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(date));
};

document.querySelectorAll(".date").forEach(node => {
   node.textContent = toDate(node.textContent);
});

const cardElem = document.getElementById("cart");

if (cardElem) {
    cardElem.addEventListener("click", event => {
        if (event.target.classList.contains("js-remove")) {
            const id = event.target.dataset.id;

            fetch("/cart/remove/" + id, {
                method: "delete"
            }).then(res => res.json())
                .then(card => {
                    if (card.courses.length) {
                        const html = card.courses.map(c => {
                            return `
                                 <tr>
                                    <td>${c.title}</td>
                                    <td>${c.count}</td>
                                    <td>
                                        <button class="btn btm-small js-remove" data-id="${c.id}">Удалить</button>
                                    </td>
                                 </tr>
                                  `
                        }).join("");
                        cardElem.querySelector("tbody").innerHTML = html;
                        cardElem.querySelector(".price").textContent = card.price;
                    } else {
                        cardElem.innerHTML = "<p>Card is empty</p>"
                    }
                })
        }

    })
}

M.Tabs.init(document.querySelectorAll(".tabs"));