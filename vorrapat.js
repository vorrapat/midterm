const express = require('express') 
const mysql = require('mysql2') 
const app = express() 
const port = 3000 
const bcrypt = require('bcrypt');
                                                       //นาย วรภาส กอบสินค้า
const db = mysql.createConnection( 
    { 
        host: "localhost", 
        user: "root", 
        password: "1234", 
        database: "shopdee" 
    } 
) 
db.connect() 
 
 
app.use(express.json()) 
app.use(express.urlencoded ({extended: true})) 
 
app.post('/product', function(req, res){   
    const { productName, productDetail, price, cost, quantity } = 
req.body; 
    let sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES(?,?,?,?,?)"       
    db.query(sql, [productName, productDetail, price, cost, quantity], function(err, result){ 
        if (err) throw err;   
        res.send({'message':'บันทึกข้อมูลสำเร็จ','status':true}); 
    }); 
}); 
 
app.get('/product/:id', 
    function(req, res){ 
        const productID = req.params.id; 
        let sql = "SELECT * FROM product WHERE productID = ?";  //ป้องกัน sqlinjection               
        db.query(sql, [productID], function(err, result) { 
            if (err) throw err; 
            res.send(result); 
        }); 
    } 
);

 
app.post('/login', function(req, res){ 
    const {username, password} = req.body                                   //ป้องกันการเกิด SQL INJECTION ด้วยการใช้ตัวแทน?หรือเรียกว่า prepared statements และ เข้ารหัส hash
    let sql = "SELECT * FROM customer WHERE username = ? AND isActive = 1";  //ดึงข้อมูลผู้ใช้ที่มี username ตรงกับ user ที่กรอกเข้ามา และต้องมีสถานะกำลังใช้งาน isactive 1
    db.query(sql, [username], function(err, result){ 
        if(err) throw err 
         
        if(result.length > 0){ 
            let customer = result[0];
            bcrypt.compare(password, customer.password, function(err, isMatch) { //เปรียบเทียบพาสเวิร์ดว่าตรงกันกับที่ผู้ใช้กรอกมาไหม
                if (err) throw err;

                if (isMatch) {  // ถ้าถูกต้องให้เข้าสู่ระบบ
                    customer['message'] = "เข้าสู่ระบบสำเร็จ";
                    customer['status'] = true;
                    res.send(customer);
                } else {
                    res.send({"message":"กรุณาระบุรหัสผ่านอีกครั้ง", "status":false}); //ไม่ถูกให้ใส่ใหม่
                }
            });
        } else { 
            res.send({"message":"ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "status":false} )  //ไม่เจอผู้ใช้
        }         
    })     
});
 
app.listen(port, function() { 
    console.log(`server listening on port ${port}`) 
})