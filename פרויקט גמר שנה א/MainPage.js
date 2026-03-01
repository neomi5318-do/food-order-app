
const categoriesMap = {
  'deals': 'עסקיות',
  'sides': 'תוספות',
  'salads': 'סלט',
  'desserts': 'קינוחים'
};
const currentUser = sessionStorage.getItem("activeUser");
if (currentUser) {
  showMainTemplate();
}
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}
document.getElementById("sign_up").addEventListener("click", showSignupForm);
document.getElementById("log_in").addEventListener("click", showLoginForm);


function handleSignupSubmit(e) {
  e.preventDefault(); // לא לרענן את הדף
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!name || !email || !password) {
    alert("יש למלא את כל השדות!");
    return;
  }
  // שליחה לשרת עם FAJAX
  const req = new FXMLHttpRequest();
  const reqBody = JSON.stringify({ name, email, password });
  req.open("POST", "/signup", reqBody);
  req.onload = () => {
    //const res = JSON.parse(req.responseText);

    let res = {};
    try {
      res = JSON.parse(req.responseText);
    } catch (e) {
      console.error("שגיאה בתשובת השרת");
      return;
    }

    if (res.success) {

      sessionStorage.setItem("activeUser", email);
      console.log("Saved to session:", sessionStorage.getItem("activeUser"));
      showMainTemplate();
    } else {
      alert("שגיאה: " + res.message);
    }
  };
  req.send();
}

function showSignupForm() {
  loadTemplate("sign_up_template", "/signup");
  const form = document.querySelector("#signupForm");
  form.removeEventListener("submit", handleSignupSubmit);
  form.addEventListener("submit", handleSignupSubmit);
}


function handleLoginSubmit(e) {
  e.preventDefault(); // לא לרענן את הדף
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!name || !email || !password) {
    alert("יש למלא את כל השדות!");
    return;
  }
  // const body=JSON.stringify({ name, email, password });
  const req = new FXMLHttpRequest();
  const reqBody = JSON.stringify({ name, email, password });
  req.open("POST", "/login", reqBody);
  req.onload = () => {
    //const res = JSON.parse(req.responseText);

    let res = {};
    try {
      res = JSON.parse(req.responseText);
    } catch (e) {
      console.error("שגיאה בתשובת השרת");
      return;
    }

    if (res.success) {
      sessionStorage.setItem("activeUser", email);
      console.log("Saved to session:", sessionStorage.getItem("activeUser"));
      showMainTemplate();
    } else {
      alert("שגיאה: " + res.message);
    }
  };
  req.send();
}

function showLoginForm() {
  loadTemplate("log_in_template", "/login");
  const form = document.querySelector("#loginForm");
  form.removeEventListener("submit", handleLoginSubmit); // חשוב
  form.addEventListener("submit", handleLoginSubmit);
}

function showMainTemplate() {
  loadTemplate("main_template", "/mainPage");

  // const template = document.getElementById("main_template");
  // const clone = template.content.cloneNode(true);
  // const target = document.getElementById("page");
  document.querySelector(".enter_button").style.display = "none";
  // target.style.display = "block";
  // target.innerHTML = "";
  // target.appendChild(clone);

  renderItems('deals', 8);
  renderItems('sides', 4);
  renderItems('salads', 8);
  renderItems('desserts', 8);

}

function showProfilePage() {
  loadTemplate("profile_template", "/profile");

  const toggleBtn = document.getElementById("toggle_password_change");
  const cancelBtn = document.getElementById("cancel_password_change");
  const changeSection = document.getElementById("password_change_section");

  toggleBtn.addEventListener("click", () => {
    changeSection.style.display = "block";
  });

  cancelBtn.addEventListener("click", () => {
    showMainTemplate();
  });

  const userEmail = sessionStorage.getItem("activeUser");
  const saveBtn = document.getElementById("save_password_btn");
  saveBtn.replaceWith(saveBtn.cloneNode(true));
  const newSaveBtn = document.getElementById("save_password_btn");
  newSaveBtn.addEventListener("click", () => {
    const newPass = document.getElementById("new_password").value.trim();
    const req = new FXMLHttpRequest();
    const reqBody = JSON.stringify({ email: userEmail, newPassword: newPass });
    req.open("PUT", "/change_password", reqBody);
    req.onload = () => {
      let res = {};
      try {
        res = JSON.parse(req.responseText);
      } catch (e) {
        console.error("שגיאה בתשובת השרת");
        return;
      }

      if (res.success) {
        alert("הסיסמה שונתה בהצלחה");
        location.reload();
      } else {
        console.error("שגיאה: " + res.message);
      }
    };

    req.send();
  });
}


function renderItems(categoryId, count) {
  const categoryName = categoriesMap[categoryId];
  const container = document.getElementById(categoryId + '-items');
  for (let i = 1; i <= count; i++) {
    const div = document.createElement('div');
    div.className = 'item-card';
    const itemImage = `./images/${categoryName}.${i}.jpg`;
    const itemName = `${categoryName} ${i}`;
    const itemPrice = 10 + i * 2;
    div.innerHTML = `
      <img src="${itemImage}" alt="${itemName}" />
      <h4>${itemName}</h4>
      <p>מחיר: ₪${itemPrice}</p>
      <button class="add-to-cart">🛒 הוסף לעגלה</button>
    `;

    const button = div.querySelector(".add-to-cart");
    const item = {
      name: itemName,
      price: itemPrice,
      image: itemImage,
      category: categoryName
    };
    button.addEventListener("click", () => addToCart(item));
    container.appendChild(div);
  }
}

function addToCart(item) {
  const userEmail = sessionStorage.getItem("activeUser");
  const req = new FXMLHttpRequest();
  const reqBody = JSON.stringify({ email: userEmail, item })
  req.open("POST", "/add_to_cart", reqBody);
  req.onload = () => {
    //const res = JSON.parse(req.responseText);

    let res = {};
    try {
      res = JSON.parse(req.responseText);
    } catch (e) {
      console.error("שגיאה בתשובת השרת");
      return;
    }

    if (res.success) {
      // sessionStorage.setItem("activeOrder",JSON.stringify(res.order));
      alert("המנה נוספה לעגלה!");
    }
    else {
      alert("שגיאה: " + res.message);
    }
  };
  req.send();
}



function showCart() {
  navigateTo("/show_cart");
  const userEmail = sessionStorage.getItem("activeUser");
  const req = new FXMLHttpRequest();
  // const reqBody = JSON.stringify({ email: userEmail });
  req.open("GET", `/show_cart?email=${userEmail}`);
  req.onload = () => {
    //const res = JSON.parse(req.responseText);

    let res = {};
    try {
      res = JSON.parse(req.responseText);
    } catch (e) {
      console.error("שגיאה בתשובת השרת");
      return;
    }

    if (res.success) {
      const items = res.order;

      const existing = document.getElementById("cart_modal");
      if (existing) existing.remove();

      // שתילה של העגלה
      const template = document.getElementById("cart_template");
      const clone = template.content.cloneNode(true);
      const container = clone.getElementById("cart_items_container");

      items.forEach((item, index) => {
        const div = document.createElement("div");
        div.innerHTML = `
      <strong>${item.name}</strong> - ₪${item.price}<br>
      <img src="${item.image}" alt="${item.name}" width="80">
      <button class="remove_item_btn">❌ למחיקה</button>
      <hr>
    `;
        // const email = JSON.parse(sessionStorage.getItem("activeUser"));
        div.querySelector(".remove_item_btn").addEventListener("click", () => {
          removeItemFromCart(userEmail, index);
        });


        container.appendChild(div);
      });

      // הקפאת רקע
      document.body.style.overflow = "hidden";

      // סגירה
      clone.getElementById("close_cart").addEventListener("click", () => {
        document.getElementById("cart_modal").remove();
        document.body.style.overflow = "auto"; // מחזיר גלילה
        navigateTo("/main");
      });

      // תשלום
      clone.getElementById("checkout_btn").addEventListener("click", () => {



        const modal = document.getElementById("cart_modal");

        deleteAllOrder(modal);


        // document.getElementById("cart_modal").remove();
        // document.body.style.overflow = "auto";
      });

      // שתילת הטמפלט למסך
      document.body.appendChild(clone);
    }


  }
  req.send();
}

function closeCartModal() {
  document.getElementById("cartModal").style.display = "none";
}

function logout() {
  sessionStorage.removeItem("activeUser");
  document.getElementById("cart_modal")?.remove(); // אם יש עגלה פתוחה – לסגור
  document.body.style.overflow = "auto";
  navigateTo("/login", true, true);
  //location.reload();
}

function removeItemFromCart(email, index) {
  const req = new FXMLHttpRequest();
  const reqBody = JSON.stringify({ email, index });
  req.open("DELETE", "/delete_item", reqBody);
  req.onload = () => {
    if (!req.responseText) {
      console.error("תגובה ריקה מהשרת");
      return; // או טיפול אחר מתאים
    }
    try {
      //const res = JSON.parse(req.responseText);

      let res = {};
      try {
        res = JSON.parse(req.responseText);
      } catch (e) {
        console.error("שגיאה בתשובת השרת");
        return;
      }

      if (res.success) {
        showCart();
      } else {
        alert("שגיאה במחיקת הפריט");
      }
    } catch (e) {
      console.error("שגיאה בפרסינג JSON:", e);
    }
  };
  req.send();
}


function deleteAllOrder(modal) {
  const cart = document.getElementById("cart_items_container");
  if (cart.children.length === 0) {
    alert("העגלה ריקה");
    document.getElementById("cart_modal").remove();
    document.body.style.overflow = "auto";
    showMainTemplate();
    return;
  }
  const template = document.getElementById("checkout_email_template");
  if (!template) {
    console.error("template לא נמצא!");
    return;
  }

  const cartContent = modal.querySelector(".modal-content");
  if (!cartContent) {
    console.error(".modal-content לא נמצא בתוך modal");
    return;
  }

  // בדיקה שלא קיים כבר input (למניעת שכפול)
  // if (cartContent.querySelector("#checkout_email_section")) return;

  const emailClone = template.content.cloneNode(true);
  cartContent.appendChild(emailClone);

  const confirmBtn = cartContent.querySelector("#confirm_checkout_btn");

  confirmBtn.addEventListener("click", () => {
    const input = cartContent.querySelector("#checkout_email_input");
    const enteredEmail = input.value.trim();
    const currentUser = sessionStorage.getItem("activeUser");

    if (enteredEmail === currentUser) {

      const req = new FXMLHttpRequest();
      const reqBody = JSON.stringify({ email: enteredEmail });
      req.open("DELETE", "/clear_cart", reqBody);
      req.onload = () => {
        //const res = JSON.parse(req.responseText);

        let res = {};
        try {
          res = JSON.parse(req.responseText);
        } catch (e) {
          console.error("שגיאה בתשובת השרת");
          return;
        }


        if (res.success) {
          alert("תודה על ההזמנה!");

          // ניקוי session והחזרה לעמוד התחברות
          logout();
        } else {
          alert("שגיאה במחיקת ההזמנה: " + res.message);
        }
      }
      req.send();
    }
  })
}


window.addEventListener("hashchange", handleHashChange);

function handleHashChange() {
  const modal = document.getElementById("cart_modal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "auto";
  }

  const hash = window.location.hash;
  if (!sessionStorage.getItem("activeUser")) {
    if (hash === "#/login") showLoginForm();
    else if (hash === "#/signup") showSignupForm();
    else window.location.hash = "/login"; // הגנה על ניווט חופשי
  } else {
    if (hash === "#/main") showMainTemplate();
    else if (hash === "#/profile") showProfilePage();
    else if (hash === "#/show_cart") showCart();
    else showMainTemplate(); // דיפולט
  }
}


function navigateTo(Url, replace = false, force = false) {
  if (location.hash === `#${Url}` && !force)
    return;
  if (replace) {
    history.replaceState(null, "", `#${Url}`);
  } else {
    history.pushState({}, "", `#${Url}`);
  }
  handleHashChange();
}

function loadTemplate(templateId, Url, replace = false) {
  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);
  const target = document.getElementById("page");
  target.innerHTML = "";
  target.style.display = "block";
  target.appendChild(clone);
  navigateTo(Url, replace);
}

window.addEventListener("popstate", () => {
  handleHashChange();
});








