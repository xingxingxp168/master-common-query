const mysql = require('mysql')

//可以连接多个数据库
const nodeDataSource = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin@123',
  database: 'node_test',
  timezone: "08:00" //保证 Mysql时区 与 Node时区一致,这样查出来的日期格式不会乱码
})
//可以连接多个数据库
const platformDataSource = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin@123',
  database: 'platform',
  timezone: "08:00" //保证 Mysql时区 与 Node时区一致,这样查出来的日期格式不会乱码
})

const mdmDataSource = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin@123',
  database: 'mdm',
  timezone: "08:00" //保证 Mysql时区 与 Node时区一致,这样查出来的日期格式不会乱码
})

// 接收一个sql语句 以及所需的values
// 这里接收第二参数values的原因是可以使用mysql的占位符 '?'
// 比如 query(`select * from my_database where id = ?`, [1])
const query = function( pool, sql, values ) {
  // 返回一个 Promise
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          // 结束会话
          connection.release()
        })
      }
    })
  })
}

module.exports = {
  platformDataSource,
  nodeDataSource,
  mdmDataSource,
  query
  }