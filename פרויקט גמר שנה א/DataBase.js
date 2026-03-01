USER_DB_KEY = 'users';
const DbUsers = {
  getUsers() {
    return JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  },
  getUser(email) {
    return this.getUsers().find(user => user.email === email);
  },
  addUser(user) {
    const u = this.getUsers();
    u.push(user);
    localStorage.setItem(USER_DB_KEY, JSON.stringify(u));
  },
  changePasswordUser(email, newPassword) {
    const currentUser = this.getUser(email);
    const users = this.getUsers();
    const updateUsers = users.filter(u => u.email !== email);
    currentUser.password = newPassword;
    updateUsers.push(currentUser);
    localStorage.setItem(USER_DB_KEY, JSON.stringify(updateUsers));
  }
}


const ORDER_DB_KEY = 'orders';
const DbOrders = {

  getOrdersMap() {
    return JSON.parse(localStorage.getItem(ORDER_DB_KEY) || '{}');
  },

  saveOrdersMap(map) {
    localStorage.setItem(ORDER_DB_KEY, JSON.stringify(map));
  },

  getOrdersByEmail(email) {
    const map = this.getOrdersMap();
    return map[email] || [];
  },

  addOrder(email, item) {
    const map = this.getOrdersMap();
    if (!map[email]) {
      map[email] = [];
    }
    map[email].push(item);
    this.saveOrdersMap(map);
  },

  deleteItemFromOrder(email, index) {
    const map = this.getOrdersMap();
    const orders = map[email] || [];
    if (index >= 0 && index < orders.length) {
      orders.splice(index, 1);
    }
    map[email] = orders;
    this.saveOrdersMap(map);
    return orders;
  },

  deleteCart(email) {
    const map = this.getOrdersMap();
    delete map[email];
    this.saveOrdersMap(map);
    return map;
    //  const order =this.getOrdersByEmail(email);
  }

};

