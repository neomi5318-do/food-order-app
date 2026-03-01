const DROP_RATE = 0.1;
const Network = {
  send(request) {
    if (Math.random() < DROP_RATE) {
      request.status = 500;
      request.responseText = JSON.stringify({ success: false, message: "שגיאה בשרת (500)" });
      throw new Error("השרת נפל!");
    }
    setTimeout(() => {
      if (request.url==='/login' || request.url.startsWith('/signup') || request.url.startsWith('/change_password')) {////
        LoginServer.handle(request);
      } else if (request.url.startsWith('/add_to_cart') || request.url.startsWith('/show_cart') || request.url.startsWith('/delete_item') || request.url.startsWith('/clear_cart')) {
        orderServer.handle(request);
      }
      else {
        request.status = 404;
        request.responseText = JSON.stringify({ success: false, message: "כתובת לא קיימת בשרת" });
        throw new Error("כתובת לא קיימת");
      }
    }, 500);
  }
};

const LoginServer = {
  handle(request) {
    // התחברות
    if (request.method === 'POST' && request.url === '/login') {
      const { email, password } = request.body;
      const user = DbUsers.getUser(email);

      if (user && user.password === password) {
        request.status = 200;
        request.responseText = JSON.stringify({ success: true });
        if (request.onload) request.onload();
      } else {
        request.status = 401;
        request.responseText = JSON.stringify({ success: false, message: "שם משתמש או סיסמה שגויים" });
        //throw new Error("שם משתמש או סיסמה שגויים");
        if (request.onload) request.onload();
        return;
      }

      return; // כדי לא להמשיך לקוד של /signup
    }
    // הרשמה
    if (request.method === 'POST' && request.url === '/signup') {
      const { name, email, password } = request.body;
      const existing = DbUsers.getUser(email);

      if (existing) {
        request.status = 409;
        request.responseText = JSON.stringify({ success: false, message: "משתמש כבר קיים" });
        //throw new Error("משתמש כבר קיים");
        if (request.onload) request.onload();
        return;
      } else {
        DbUsers.addUser({ name, email, password });
        request.status = 201;
        request.responseText = JSON.stringify({ success: true });
      }
      if (request.onload) request.onload();
      return;
    }


    if (request.method === 'PUT' && request.url === '/change_password') {
      const { email, newPassword } = request.body;

      { DbUsers.changePasswordUser(email, newPassword); }
      const user = DbUsers.getUser(email);
      if (user) {
        request.status = 200;
        request.responseText = JSON.stringify({ success: true });
      } else {
        request.status = 404;
        request.responseText = JSON.stringify({ success: false, message: "משתמש לא נמצא" });
        //throw new Error("משתמש לא נמצא");
      }
      if (request.onload) request.onload();
      return;
    }
    else {
      request.status = 400;
      request.responseText = JSON.stringify({ success: false, message: "בקשה לא חוקית ל־LoginServer" });
      if (request.onload) request.onload();
      return;
    }

  }
};
const orderServer = {
  handle(request) {
    // הוספה לסל
    if (request.method === 'POST' && request.url === '/add_to_cart') {
      const { email, item } = request.body;
      DbOrders.addOrder(email, item); // שומר מחדש את כל ההזמנה
      const activeOrder = DbOrders.getOrdersByEmail(email);
      if (activeOrder) {
        request.status = 200;
        request.responseText = JSON.stringify({ success: true, order: activeOrder });
      }
      else {
        request.status = 404;
        request.responseText = JSON.stringify({ success: false, message: "הזמנה לא נמצאה" });
        throw new Error("הזמנה לא נמצאה");
      }
      if (request.onload) request.onload();
      return;
    }

    // if(request.method === 'GET' && request.url === '/show_cart'){
    //   const email=request.body;
    //   const currentOrder= DbOrders.getOrdersByEmail(email);
    if (request.method === 'GET' && request.url.startsWith('/show_cart')) {
      const url = new URL("http://localhost" + request.url);
      const email = url.searchParams.get("email");
      const currentOrder = DbOrders.getOrdersByEmail(email);

      if (currentOrder) {
        request.status = 200;
        request.responseText = JSON.stringify({ success: true, order: currentOrder });
        if (request.onload) request.onload();
      }
      else {
        request.status = 404;
        request.responseText = JSON.stringify({ success: false, message: "עגלה לא נמצאה" });
        throw new Error("עגלה לא נמצאה");
      }


      return;
    }
    // if (request.method === 'DELETE' && request.url === '/delete_item'){
    //   const { email, item } = request.body;  
    //   const order=DbOrders.deleteItemFromOrder(email,item);


    if (request.method === 'DELETE' && request.url === '/delete_item') {
      console.log("כן")
      const { email, index } = request.body;
      const currentOrder = DbOrders.deleteItemFromOrderByIndex(email, index);
      if (currentOrder) {
        request.status = 200;
        request.responseText = JSON.stringify({ success: true, order: currentOrder });
      } else {
        request.status = 404;
        request.responseText = JSON.stringify({ success: false, message: "המנה למחיקה לא נמצאה" });
        throw new Error("המנה למחיקה לא נמצאה");
      }
      if (request.onload) request.onload();
      return;
    }
    if (request.method === 'DELETE' && request.url === '/clear_cart') {
      const { email } = request.body;
      const emptyOrder = DbOrders.deleteCart(email);
      // if(emptyOrder===  emptyOrder.filter(map => map.email !== this.email))
      if (emptyOrder) {
        request.status = 200;
        request.responseText = JSON.stringify({ success: true, order: emptyOrder });
      }
      else {
        request.status = 404;
        request.responseText = JSON.stringify({ success: false, message: "הזמנה למחיקה לא נמצאה" });
        throw new Error("הזמנה למחיקה לא נמצאה");
      }
      // request.responseText = JSON.stringify({ success: true, order: updatedOrdersMap });
      if (request.onload) request.onload();
      return;
    }
    // else {
    //   request.status = 400;
    //   request.responseText = JSON.stringify({ message: "בקשה לא חוקית ל־LoginServer" });
    //   throw new Error("בקשה לא חוקית ל־LoginServer")
    // }
  }
};