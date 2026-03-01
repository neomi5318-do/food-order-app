class FXMLHttpRequest {
  constructor() {
    this.url = "";
    this.method = "";
    this.body = null;
    this.onload = null;
    this.status = 0;
    this.responseText = "";
  }

  open(method, url, body) {
    this.method = method;
    this.url = url;
    try{
    this.body =typeof body==="string" ? JSON.parse(body) : body;
    }catch(e){
      this.body=null;
    }
  }

  send() {
    try {
      Network.send(this); 
    } catch (error) {
      console.error("שגיאה בזמן שליחת הבקשה:", error);
      this.status = 500;
      this.responseText = JSON.stringify({ success: false, message: error.message || "שגיאה לא ידועה" });
    
      if (this.onload) {
        try {
          this.onload();
        } catch (error) {
          console.error("שגיאה בתוך onload:", error);
        }
      }
    }
  
    
  }
  }