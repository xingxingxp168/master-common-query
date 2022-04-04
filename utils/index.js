module.exports = (list,sub_sql_id) =>{

  const db = require('../plugins/db')//引入数据库

  let sqlStr = "select * from common_query where sql_id = ?"

  //把主查询的多个子查询字符串转为数组,循环处理
  let subSqlList = sub_sql_id.split(',');

  return new Promise(async( resolve, reject ) => {
    //循环处理子查询
    for(let j=0; j<subSqlList.length;j++){
      //从数据库取出子查询的记录
      let sub_sql = JSON.parse(JSON.stringify(await db.query(db.platformDataSource,sqlStr,subSqlList[j])))[0];

      //循环处理主查询的每一条明细数据,把明细数据做为参数,传给子查询,取出需要的字段名称,并合并到主查询,再返回结果
      for(let i=0;i<list.length;i++){
        let sub_params_item = JSON.parse(sub_sql.sql_params)
        let sub_params = [];

        // 循环子查询的每一个参数,从主查询的结果里面取出对应的值,做为子查询的参数
        sub_params_item.forEach((ite)=>{
          sub_params.push(list[i][ite.name])
        })

        //查询子查询的结果
        let sub_item = JSON.parse(JSON.stringify(await db.query(db[sub_sql.jdbc_name],sub_sql.sql_content,sub_params)))[0];

        //把子查询的结果,拼到主查询的结果里面
        list[i] = Object.assign(list[i],sub_item);
        
      }
    }

    resolve( list )
   
  })

}